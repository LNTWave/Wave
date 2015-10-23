
// Software download...
//
//  Flow:
//      User presses "Check for SW" button on main page.
//        - renderDldView()
//          - Send "isUpdateAvailable:false" to the cloud to get ready to look for updates
//          - Set state to DLD_STATE_INIT
//
//  Phase 1: Look for updates...
//      DLD_STATE_INIT  
//        - Send "isUpdateAvailable:true" to the cloud to trigger the look for updates
//      DLD_STATE_CHECK_FOR_UPDATES
//        - Continue polling the cloud, up to 12 times, once per second.    
//        - Egress response will be handled in function ProcessEgressResponse().
//
//  Phase 2: User to select which image to update and press "Update Selected"
//        - handleDldKey()
//          - startFileDownload() - determine which image to download.
//          - Set state to DLD_STATE_GET_FROM_CLOUD
//
//  Phase 3: Download from the cloud to the phone's /Download directory 
//      DLD_STATE_GET_FROM_CLOUD
//      DLD_STATE_WAIT_ON_CLOUD
//
//  Phase 4: Download the file from the phone's directory to the Cel-Fi...
//      DLD_STATE_TO_CELFI_INIT
//      DLD_STATE_START_REQ
//      DLD_STATE_START_RSP
//      DLD_STATE_TRANSFER_REQ
//      DLD_STATE_TRANSFER_RSP
//      DLD_STATE_END_REQ
//      DLD_STATE_END_RSP
//        - call startFileDownload() to see if any more files to download.  If not wait on reset to complete.
//
//      DLD_STATE_RESET               
//      DLD_STATE_UNII_UP               // Only here if NU was reset.   Wait for UNII to be back up...
//
//      
//      DLD_STATE_CHECK_VER_5_1_9       // Special processing to send 2nd reset to NU and or CU for ver 5.1.9 or prev.
//      DLD_STATE_5_1_9_RESET               
//      DLD_STATE_5_1_9_UNII_UP         // Only here if NU was reset.   Wait for UNII to be back up...
//
//      DLD_STATE_UPDATE_LOCAL_VER
//      DLD_STATE_DONE    
//
//  Notes:
//    - Order of download is based on DldOrderArray[];
//    - If the NU is selected for download then delay 6 seconds assuming that an NU_PIC was just downloaded
//      and allow at least 5 seconds for the NU redirect to expire so the CU can talk to the NU again.
//    - If the CU is selected for download then at the end of the download when a CU reset is requested,
//      the PIC times out waiting on the response from the CU so the app must ignore the END RSP timeout.
//    - If the NU or CU are selected for download request a reset.
//
//
//     Android Speed:  Phone to Cel-Fi
//                   cnt  Tx Timer    DL Timer     Size       Time        Bytes/Sec    BAUD
//       CU PIC:          40 mS        50 mS       74094       3:30 sec    352         3,520
//                        20 mS        50 mS       74094       2:20 sec    529         5,290
//                        20 mS        25 mS       74094       2:10 sec    569         5,690
//                   4    20           25          74094       1:50
//                   7    40           25          74094       1:33        797         7,970
//
//   
//     IOS Speed:  Phone to Cel-Fi
//                   cnt  Tx Timer    DL Timer     Size       Time        Bytes/Sec    BAUD
//       CU PIC:          40 mS        25 mS       74094       1:10 sec    1058         10,580



var DldLoopIntervalHandle           = null;
var DldState                        = DLD_STATE_DONE;
var DldTimeoutCount                 = 0;
var DldNakCount                     = 0;
var BluetoothTimeoutTimer           = null;

const DLD_STATE_INIT                = 1;
const DLD_STATE_CHECK_FOR_UPDATES   = 2;
const DLD_STATE_GET_FROM_CLOUD      = 3;
const DLD_STATE_WAIT_ON_CLOUD       = 4
const DLD_STATE_WAIT_ON_READ_FILE   = 5;
const DLD_STATE_TO_CELFI_INIT       = 6;
const DLD_STATE_START_REQ           = 7;
const DLD_STATE_START_RSP           = 8;
const DLD_STATE_TRANSFER_REQ        = 9;
const DLD_STATE_TRANSFER_RSP        = 10;
const DLD_STATE_END_REQ             = 11;
const DLD_STATE_END_RSP             = 12;
const DLD_STATE_RESET               = 13;
const DLD_STATE_UNII_UP             = 14;
const DLD_STATE_5_1_9_CHECK_VER     = 15;
const DLD_STATE_5_1_9_RESET         = 16;               
const DLD_STATE_5_1_9_UNII_UP       = 17;
const DLD_STATE_UPDATE_LOCAL_VER    = 18;
const DLD_STATE_DONE                = 19;
const DLD_STATE_WAIT_USER           = 20;

const DldStateNames                 = ["N/A", "Init", "Check for Updates", "Get From Cloud", "Wait on Cloud", "Wait on Read File", "To Cel-Fi Init", 
                                        "Start Req", "Start Rsp", "Transfer Req", "Transfer Rsp", "End Req", "End Rsp", 
                                        "Reset", "UNII UP", 
                                        "5_1_9 Check", "5_1_9 Reset", "5_1_9 UNII UP", "Update Ver", "Done", "Wait User"];

var   currentDldIndex               = -1;
const DLD_NU                        = 0;
const DLD_CU                        = 1;
const DLD_NU_PIC                    = 2;
const DLD_CU_PIC                    = 3;
const DLD_CU_BT                     = 4;
 
const DldNames                      = ["NU", "CU", "NU_PIC", "CU_PIC", "Bluetooth"]; 
 
// The images will be downloaded in the following order...  
const DldOrderArray                 = [DLD_NU_PIC, DLD_NU, DLD_CU_BT, DLD_CU_PIC, DLD_CU];

const DLD_NAK_COUNT_MAX             = 2;
const DLD_TIMEOUT_COUNT_MAX         = 12;
const DLD_CLD_PKG_TIMEOUT_COUNT_MAX = 180;
const DLD_CLD_TIMEOUT_COUNT_MAX     = 60;
const DLD_RESET_TIMEOUT             = 25;
const DLD_UNII_UP_TIMEOUT           = 30;
const DLD_TRANSFER_LOOP_MS          = 25;



// Fixed file names to search for in the package info...
const myNuCfFileName                = "WuExecutable.sec";        
const myCuCfFileName                = "CuExecutable.sec";  
const myNuPicFileName               = "NuPICFlashImg.bin";  
const myCuPicFileName               = "CuPICFlashImg.bin";
const myBtFileName                  = "BTFlashImg.bin";
const myInternalPicFileName         = "InternalPic.bin";
const myInternalPicVer              = "099.099";
const szNoUnii                      = " Wireless link between units is down.";

const u8AresFlashAddr               = 0xF8100000;
const u8PicFlashAddr                = 0xF8FE0000;
const u8BtFlashAddr                 = 0xF8FC0000;

var startType                       = null;
var startAddr                       = null;
var resumeAddr                      = null;

           
// var fileSystemDownloadDir           = null;
var u8FileBuff                      = null;
var actualFileLen                   = 0;
var resumeFileLen                   = 0;
var fileIdx                         = 0;
var completedFileIdx                = 0;

var fileNuCfCldId                   = 0;  
var fileCuCfCldId                   = 0;  
var fileNuPicCldId                  = 0;
var fileCuPicCldId                  = 0;
var fileBtCldId                     = 0;
var bNeedNuCfCldId                  = false;  
var bNeedCuCfCldId                  = false;  
var bNeedNuPicCldId                 = false;
var bNeedCuPicCldId                 = false;
var bNeedBtCldId                    = false;
var myDownloadFileCldId             = null
var myDownloadFileName              = null;
var myDownloadFileVer               = null;
var bReadFileSuccess                = false;
var readFileEvt                     = null;

var isUpdateAvailableFromCloud      = false;
var bGotUpdateAvailableRspFromCloud = false;
var bGotPackageAvailableRspFromCloud= false;
var bGotUpdateFromCloudTimedOut     = false;


var bNuCfUpdate                     = false;
var bCuCfUpdate                     = false;
var bNuPicUpdate                    = false;
var bCuPicUpdate                    = false;
var bBtUpdate                       = false;
var bNuPicReset                     = false;
var bCuPicReset                     = false;
var bBtReset                        = false;
var bCelFiReset                     = false;
var SubState_5_1_9                  = 0;
var SubStateV2Reset                 = 0;
var SubStateV2Start                 = 0;
var SubStateV2GetVer                = 0;




//.................................................................................................
function StartDownloadLoop( loopTime )
{
    if( DldLoopIntervalHandle != null )
    {
        PrintLog(1, "StartDownloadLoop(" + loopTime + ")." );        
        StopDownloadLoop();
    }
    else
    {
        PrintLog(1, "StartDownloadLoop(" + loopTime + ")" );
    }


    DldLoopIntervalHandle = setInterval(DldLoop, loopTime);
}


//.................................................................................................
function StopDownloadLoop()
{
//    PrintLog(1, "StopDownloadLoop()" );
    clearInterval(DldLoopIntervalHandle)
    DldLoopIntervalHandle = null;
}


function DownloadWho()
{
    // Determine what gets downloaded.  If the cloud version has been filled in by the ProcessEgressResponse()
    // function and the cloud version is greater than the local version then set the update flag to true.
      
    // Also determine if the NU should be reset after the NU PIC has been downloaded or
    // if the CU should be reset if the CU PIC or CU Bluetooth has been downloaded...
    bNuPicReset = false;
    bCuPicReset = false;
    bBtReset    = false;
      
      
    // Function localCompare() returns -1 if str1 < str2 (str1.localCompage(str2))...
    if( (nxtySwVerNuCfCld != swVerNoCldText) && (nxtySwVerNuCf.localeCompare(nxtySwVerNuCfCld) == -1) )
    {
        bNuCfUpdate = true;
    }
    else
    {
        bNuCfUpdate = false;
    }

    if( (nxtySwVerCuCfCld != swVerNoCldText) && (nxtySwVerCuCf.localeCompare(nxtySwVerCuCfCld) == -1) )
    {
        bCuCfUpdate = true;
    }
    else
    {
        bCuCfUpdate = false;
    }
    
    if( (nxtySwVerNuPicCld != swVerNoCldText) && (nxtySwVerNuPic.localeCompare(nxtySwVerNuPicCld) == -1) )
    {
        bNuPicUpdate = true;
        
        if( bNuCfUpdate == false )
        {
            // Since the NU is not going to be downloaded and reset automatically, then force a reset after downloading the NU PIC.
            bNuPicReset = true;
        }
    }
    else
    {
        bNuPicUpdate = false;
    }
                



    if( (nxtySwVerCuBtCld != swVerNoCldText) && (nxtySwVerCuBt.localeCompare(nxtySwVerCuBtCld) == -1) )
    {
        bBtUpdate = true;
        
        if( bCuCfUpdate == false )
        {
            // Since the CU is not going to be downloaded and reset automatically, then force a reset after downloading the BT.
            bBtReset = true;
        }        
    }
    else
    {
        bBtUpdate = false;
    }
    
    if( (nxtySwVerCuPicCld != swVerNoCldText) && (nxtySwVerCuPic.localeCompare(nxtySwVerCuPicCld) == -1) )
    {
        bCuPicUpdate = true;
        
        if( bCuCfUpdate == false )
        {
            // Since the CU is not going to be downloaded and reset automatically, then force a reset after downloading the CU PIC.
            bBtReset    = false;    // Make sure that the BT does not cause a reset.
            bCuPicReset = true;
        }         
    }
    else
    {
        bCuPicUpdate = false;
    }    
    
}

function DownloadError( strHead, strText, bBtMsgFail )
{
    if( bBtMsgFail )
    {
        // Slow the BT down by reducing the number of buffers written to.
        SetMaxTxPhoneBuffers(4);
    }
    
    StopDownloadLoop();
    StopWaitPopUpMsg();
    UpdateStatusLine(strText);
    if( strHead != null )
    {
        ShowAlertPopUpMsg(strHead,  strText );
    }
    DldState = DLD_STATE_WAIT_USER;
    
    // Start the download loop in the WAIT_USER state.   
    // In the WAIT_USER state we send out a simple get status message to unclog the pipe.
    StartDownloadLoop(1000);
    
    // Set the current download in progress back to 0 so that it can start again...
    if( (currentDldIndex >= 0) && (currentDldIndex < DldOrderArray.length) )
    {
//        document.getElementById("s" + DldOrderArray[currentDldIndex]).innerHTML = "0%";
        guiSwStatus[DldOrderArray[currentDldIndex]] = "0%";
    }
    
    // Change the button from "Update" to "Update-Retry"
    guiSoftwareButtonText = "Update-Retry";
    guiSoftwareDirtyFlag  = true;
    
}
   


function DldBluetoothTimeout()
{

    // Ok to stop the download if we are not waiting on the user, not done and not waiting on a reset in the END_RSP state or in reset state.
    if( !((DldState == DLD_STATE_WAIT_USER) || (DldState == DLD_STATE_DONE) || (DldState == DLD_STATE_END_RSP) || (DldState == DLD_STATE_RESET)) )
    {
        StopDownloadLoop();
        StopWaitPopUpMsg();
        UpdateStatusLine( "Update aborted, Bluetooth connection lost...");
        ShowAlertPopUpMsg("Update aborted",  "Bluetooth connection lost..." );
        DldState = DLD_STATE_WAIT_USER;
        
        // Set the current download in progress back to 0 so that it can start again...
        if( (currentDldIndex >= 0) && (currentDldIndex < DldOrderArray.length) )
        {
//            document.getElementById("s" + DldOrderArray[currentDldIndex]).innerHTML = "0%";
            guiSwStatus[DldOrderArray[currentDldIndex]] = "0%";
            guiSoftwareDirtyFlag  = true;
        }
    }    
}


function successAcquirePowerManagement()
{
    PrintLog(1, "Power management acquire success.  Autolock disabled so phone does not go to sleep." );
}

function failAcquirePowerManagement()
{
    PrintLog(1, "Power management acquire fail.  Autolock not disabled so phone may go to sleep." );
}

function successReleasePowerManagement()
{
    PrintLog(1, "Power management release success.  Autolock re-enabled so phone can go to sleep." );
}

function failReleasePowerManagement()
{
    PrintLog(1, "Power management release fail.  Autolock not re-enabled so phone may have problems going to sleep." );
}

            
var Dld = {

    // Handle the Back key
    handleBackKey: function()
    {
        if( (DldState == DLD_STATE_DONE) || (DldState == DLD_STATE_WAIT_USER) )
        {
             PrintLog(1, "");
             PrintLog(1, "Sw: SW Mode Back key pressed----------------------------------------------------");
             
             // Disable the Update button
             guiSoftwareButtonFlag = false;
             guiSoftwareDirtyFlag  = true;
             StopDownloadLoop();
             StopWaitPopUpMsg();
             DumpDataTables();
                     
             // allow device to sleep
             if( window.device.platform != pcBrowserPlatform ) { window.plugins.powerManagement.release( successReleasePowerManagement, failReleasePowerManagement ); }
         
             // Back to main menu after 500 mS to allow the powerManagement to release...
             // Without waiting was causing unit not to go into Tech mode if user pressed from main menu.
             setTimeout(app.renderHomeView, 500);
        }
        else
        {    
            ShowAlertPopUpMsg("Update in progress...", "Back key not allowed!");
         }
    },


    // Update key pressed................................................................................................................
    handleDldKey: function()
    {
        PrintLog(1, "Update Key pressed");
    
        if( DldState == DLD_STATE_WAIT_USER )
        {
            // Kick off the process...
            currentDldIndex = -1;
            
            // Clear any Tx block...
            msgRxLastCmd = NXTY_INIT;
                
            guiSoftwareStatus           = SW_STATUS_UPDATE_IN_PROGRESS;
            guiSoftwareDirtyFlag        = true;
            
            ShowAlertPopUpMsg("Starting update...", "Please do not interrupt the Update!  Press ok...");
            
            if( window.device.platform == androidPlatform )
            {
                // The connection interval should be 20 mS on the Android.
//                SetBluetoothTxTimer(20);
            }
            else if( window.device.platform == iOSPlatform )
            {
                // The connection interval should be 30 mS on the IOS.
//                SetBluetoothTxTimer(30);
            }

            if( bGotUpdateFromCloudTimedOut )
            {
                // Retry the get status from the cloud...
                DldState = DLD_STATE_INIT;
                StartDownloadLoop(1000);
            }
            else
            {
                // Try to download from cloud to Cel-Fi
                Dld.startFileDownload();
            }
           
        }
        else if( DldState == DLD_STATE_DONE )
        {
            ShowAlertPopUpMsg("Update Complete", "Nothing to do...");
        }
        else
        {
            ShowAlertPopUpMsg("Please Wait", "Update in progress...");
        }
        
    },
    
    // Determine which image to download.
    startFileDownload: function()
    {
        var idx;
                
        var bOkToDownload = false;
        
        StopDownloadLoop();
//        StopWaitPopUpMsg();        
        
        
        currentDldIndex++;
                    
        for( ; currentDldIndex < DldOrderArray.length; currentDldIndex++ )
        {
            idx = DldOrderArray[currentDldIndex];
            if( guiSwStatus[idx] == "0%" )
            {
                break;
            }
        }


        if( currentDldIndex < DldOrderArray.length )
        {
            StopWaitPopUpMsg();
                     
            // See if the NU was selected 
            if( idx == DLD_NU )
            {
    //            if( document.getElementById("ckbx_nu_id").checked )
                {
                    PrintLog(1, "NU selected for download." );
    
                    // Fill in the information necessary to transfer from the cloud to the phone                
                    myDownloadFileCldId = fileNuCfCldId;
                    myDownloadFileName  = myNuCfFileName;
                    myDownloadFileVer   = nxtySwVerNuCfCld;
    
                    // Fill in the information necessary to open the file on the phone and download to Cel-Fi
                    
                    // Use the V2 protocol NONE for type since the NU should never be downloaded using a V1 PIC.
                    startType           = NXTY_SW_NONE_TYPE;
                    startAddr           = u8AresFlashAddr;
                    resumeAddr          = startAddr;
                    bOkToDownload       = true;                
                }
            }
            
            if( idx == DLD_CU )
            {
    //            if( document.getElementById("ckbx_cu_id").checked )
                {
                    PrintLog(1, "CU selected for download." );
                    
                    // Fill in the information necessary to transfer from the cloud to the phone                
                    myDownloadFileCldId = fileCuCfCldId;
                    myDownloadFileName  = myCuCfFileName;
                    myDownloadFileVer   = nxtySwVerCuCfCld;
    
                    // Fill in the information necessary to open the file on the phone and download to Cel-Fi
                    startType           = NXTY_SW_NONE_TYPE;
                    startAddr           = u8AresFlashAddr;
                    resumeAddr          = startAddr;
                    bOkToDownload       = true;                
                }
            }
            
            if( idx == DLD_NU_PIC )
            {
    //            if( document.getElementById("ckbx_nupic_id").checked )
                {
                    PrintLog(1, "NU PIC selected for download." );
                    
                    // Fill in the information necessary to transfer from the cloud to the phone
                    myDownloadFileCldId = fileNuPicCldId;
                    myDownloadFileName  = myNuPicFileName;
                    myDownloadFileVer   = nxtySwVerNuPicCld;
    
                    startType       = NXTY_SW_NONE_TYPE;
                    startAddr           = u8PicFlashAddr;
                    resumeAddr          = startAddr;
                    bOkToDownload       = true;
                    
                    
                    // Use the internal PIC name to download...
                    if( nxtyRxStatusIcd <= V1_ICD )
                    {
                        // If the ICD is 0x07 then the PIC must be told the type to redirect the UART.
                        startType           = NXTY_SW_NU_PIC_TYPE;
                        myDownloadFileName  = myInternalPicFileName;
                    }
                    
                                    
                }
            }
            
            if( idx == DLD_CU_PIC )
            {
    //            if( document.getElementById("ckbx_cupic_id").checked )
                {
                    PrintLog(1, "CU PIC selected for download." );
                    
                    // Fill in the information necessary to transfer from the cloud to the phone
                    myDownloadFileCldId = fileCuPicCldId;
                    myDownloadFileName  = myCuPicFileName;
                    myDownloadFileVer   = nxtySwVerCuPicCld;
    
                    // Fill in the information necessary to open the file on the phone and download to Cel-Fi
                    startType           = NXTY_SW_NONE_TYPE;
                    startAddr           = u8PicFlashAddr;
                    resumeAddr          = startAddr;
                    bOkToDownload       = true;

                    // Use the internal PIC name to download...
                    if( nxtyRxStatusIcd <= V1_ICD )
                    {
                        myDownloadFileName  = myInternalPicFileName;
                    }
    
                }
            }
             
            
            if( idx == DLD_CU_BT )
            {   
    //            if( document.getElementById("ckbx_cubt_id").checked )
                {
                    PrintLog(1, "CU BT selected for download." );
                    
                    // Fill in the information necessary to transfer from the cloud to the phone
                    myDownloadFileCldId = fileBtCldId;
                    myDownloadFileName  = myBtFileName;
                    myDownloadFileVer   = nxtySwVerCuBtCld;
    
                    // Fill in the information necessary to open the file on the phone and download to Cel-Fi
                    startType           = NXTY_SW_NONE_TYPE;
                    startAddr           = u8BtFlashAddr;
                    resumeAddr          = startAddr;
                    bOkToDownload       = true;                
                }        
            }
    
    
            if( bOkToDownload )
            {
                if( g_fileSystemDir != null )
                {
                    var infoText = "Downloading file: " + myDownloadFileName + " Ver: " + myDownloadFileVer + " from cloud."
                    DldState              = DLD_STATE_GET_FROM_CLOUD;

                    if( nxtyRxStatusIcd <= V1_ICD )
                    {
                        // bypass getting file from cloud since we copied over...
                        DldState = DLD_STATE_WAIT_ON_CLOUD;
                        g_fileTransferSuccess = true;
                    }                           
                    
                                    
                    DldTimeoutCount       = 0;
                    
                    if( idx == DLD_NU )
                    {
                        // Wait additional time between downloading the NU PIC and the NU to
                        // clear any UART redirect issues...
                        StartDownloadLoop(6000);
                    }
                    else
                    {
                        StartDownloadLoop(1000);
                    }
                    
                    // Add version to end of file name...
                    myDownloadFileName += ("_" + myDownloadFileVer);
//                    ShowWaitPopUpMsg( "Please wait", infoText );
                    UpdateStatusLine(infoText);
                }
                else
                {
                    PrintLog(99, "Unable to open file system on phone." );
                }
            }
        }
        else
        {
            // End the download process...
            if( bCelFiReset )
            {
                DldState        = DLD_STATE_RESET;
            }
            else
            {
                // Should always end with a reset, but if not then just verify versions...
                DldState         = DLD_STATE_UPDATE_LOCAL_VER;
                SubStateV2GetVer = 0;
                nxtyCurrentReq   = 0;
            }


            StartDownloadLoop(1000);
        }
    },

    
    
    renderDldView: function() 
    {    

        if( nxtyRxStatusIcd > V1_ICD )
        {
            UpdateStatusLine("Checking for updates...");
            ShowWaitPopUpMsg( "Please wait", "Checking for updates..." );
            SendCloudData(  "'isUpdateAvailable':'false'" );
        }
        
                
        // Make sure that we are at full download speed.
        SetMaxTxPhoneBuffers(7);
  
        // Start the ball rolling...this allows the false above to go out about 1 second before the true.
        DldState = DLD_STATE_INIT;
        StartDownloadLoop(1000);
        
        // Version info from the hardware...
        guiSwCelFiVers[0] = nxtySwVerNuCf;
        guiSwCelFiVers[1] = nxtySwVerCuCf;
        guiSwCelFiVers[2] = nxtySwVerNuPic;
        guiSwCelFiVers[3] = nxtySwVerCuPic;
        guiSwCelFiVers[4] = nxtySwVerCuBt;

        guiSoftwareButtonText = "Update";
        guiSoftwareDirtyFlag  = true;
        
        guiCurrentMode = PROG_MODE_DOWNLOAD;
    },
};



    
function DldLoop() 
{
    var i;
    var u8Buff  = new Uint8Array(20);

    if( DldState != DLD_STATE_TRANSFER_RSP )
    {
        PrintLog(1, "Download loop...DldState=" + DldStateNames[DldState] );
    }
    
    
    DldTimeoutCount++; 
    
    
    // Make sure bluetooth stays alive...
    if( window.device.platform != pcBrowserPlatform )
    {
        if( isSouthBoundIfCnx )
        {
            if( BluetoothTimeoutTimer != null )
            {
                clearTimeout(BluetoothTimeoutTimer);
                BluetoothTimeoutTimer = null;
            }
        }
        else
        {
            if( BluetoothTimeoutTimer == null )
            {
                BluetoothTimeoutTimer = setTimeout(DldBluetoothTimeout, 5000);
            }
        }
    }
    
        
    switch( DldState )
    {
    
        //---------------------------------------------------------------------------------------
        // Phase 1: Look for updates...
        case DLD_STATE_INIT:
        {
            // Pre fill with a known value before requesting from cloud...
            nxtySwVerNuCfCld                 = swVerNoCldText;
            nxtySwVerCuCfCld                 = swVerNoCldText;
            nxtySwVerNuPicCld                = swVerNoCldText;
            nxtySwVerCuPicCld                = swVerNoCldText;
            nxtySwVerCuBtCld                 = swVerNoCldText;
            fileNuCfCldId                    = 0;        
            fileCuCfCldId                    = 0;  
            fileNuPicCldId                   = 0;               // future proof  
            fileCuPicCldId                   = 0;               // Future proof
            fileBtCldId                      = 0;
            bNeedNuCfCldId                   = false;  
            bNeedCuCfCldId                   = false;  
            bNeedNuPicCldId                  = false;
            bNeedCuPicCldId                  = false;
            bNeedBtCldId                     = false;
            isUpdateAvailableFromCloud       = false;
            bGotUpdateAvailableRspFromCloud  = false;
            bGotPackageAvailableRspFromCloud = false;
            

            // Blast out a download end to reset the PIC state machine just in case we start a download
            // without ending the previous download, i.e. walk away.   This caused a neg % complete
            // since the PIC would return a memory address response for a different download, Ares instead of PIC for example.
            var u8Buff  = new Uint8Array(2);
            u8Buff[0] = 0;                      // No reset
            nxty.SendNxtyMsg(NXTY_DOWNLOAD_END_REQ, u8Buff, 1);
            
            // Take over the phone's auto lock feature so it does not go to sleep.
            // prevent device from sleeping
            if( window.device.platform != pcBrowserPlatform ) { window.plugins.powerManagement.acquire( successAcquirePowerManagement, failAcquirePowerManagement ); }
            
            if( nxtyRxStatusIcd <= V1_ICD )
            {
                // Download the internal PIC so that the ICD version is > 0x07.
                bNuPicUpdate = true;
                bNuPicReset = true;
                bCuPicUpdate = true;
                bCuPicReset = true;
                
                nxtySwVerNuPicCld = myInternalPicVer;
                nxtySwVerCuPicCld = myInternalPicVer;

                // Put something in for version even though we don't know versions...
                guiSwCelFiVers[0] = "-";
                guiSwCelFiVers[1] = "-";
                guiSwCelFiVers[2] = "-";
                guiSwCelFiVers[3] = "-";
                guiSwCelFiVers[4] = "-";

                // Drop our cloud version in...
                guiSwCldVers[0] = nxtySwVerNuCfCld;
                guiSwCldVers[1] = nxtySwVerCuCfCld;
                guiSwCldVers[2] = nxtySwVerNuPicCld;
                guiSwCldVers[3] = nxtySwVerCuPicCld;
                guiSwCldVers[4] = nxtySwVerCuBtCld;
        
                // Add 0% status to those available in the cloud...
                guiSwStatus[0] = (bNuCfUpdate)?"0%":"OK";
                guiSwStatus[1] = (bCuCfUpdate)?"0%":"OK";
                guiSwStatus[2] = (bNuPicUpdate)?"0%":"OK";
                guiSwStatus[3] = (bCuPicUpdate)?"0%":"OK";
                guiSwStatus[4] = (bBtUpdate)?"0%":"OK";
                guiSoftwareDirtyFlag = true; 
                
                currentDldIndex = -1;
                msgRxLastCmd    = NXTY_INIT;
                ShowAlertPopUpMsg("Starting update...", "Please do not interrupt the Update!  Press ok...");
                Dld.startFileDownload();                
            }
            else
            {
                // Send a request to the cloud to send updates...
                // Bug #1361:  Make sure version on HW is current...
                var cloudText = "'SwVerCU_CF':'"  + SwPnNuCu + nxtySwVerCuCf  + "',"    + 
                                "'SwVerCU_PIC':'" + SwPnPic  + nxtySwVerCuPic + "',"    +
                                "'SwVer_BT':'"    + SwPnBt   + nxtySwVerCuBt  + "',"    +
                                "'SwVerNU_CF':'"  + SwPnNuCu + nxtySwVerNuCf  + "',"    +
                                "'SwVerNU_PIC':'" + SwPnPic  + nxtySwVerNuPic + "',"    +
                                "'isUpdateAvailable':'true'";
                SendCloudData( cloudText );
                
                DldState                    = DLD_STATE_CHECK_FOR_UPDATES;
                DldTimeoutCount             = 0;
                guiSoftwareStatus           = SW_STATUS_CHECKING;
                guiSoftwareDirtyFlag        = true;
                bGotUpdateFromCloudTimedOut = false;
            }
            break; 
        }
            
        case DLD_STATE_CHECK_FOR_UPDATES:
        {
 
            if( (bGotUpdateAvailableRspFromCloud) && ((isUpdateAvailableFromCloud == false) || (isUpdateAvailableFromCloud == "false")) )
            {
                StopDownloadLoop();
                StopWaitPopUpMsg();
                ShowAlertPopUpMsg("Software update status", "No software updates pending");
                UpdateStatusLine("No software updates pending.");
                
                // Disable the "Update" button.
                guiSoftwareButtonFlag = false;
                guiSoftwareStatus     = SW_STATUS_UP_TO_DATE;
                guiSoftwareDirtyFlag  = true;
                DldState = DLD_STATE_DONE;
            }
            else if( (bGotUpdateAvailableRspFromCloud) && (isUpdateAvailableFromCloud) && (bGotPackageAvailableRspFromCloud) )
            {
                // Received response and handled in ProcessEgressResponse
                
                // Version info from the cloud...
                guiSwCldVers[0] = nxtySwVerNuCfCld;
                guiSwCldVers[1] = nxtySwVerCuCfCld;
                guiSwCldVers[2] = nxtySwVerNuPicCld;
                guiSwCldVers[3] = nxtySwVerCuPicCld;
                guiSwCldVers[4] = nxtySwVerCuBtCld;                
       

                // Add 0% status to those available in the cloud...
                DownloadWho();
                guiSwStatus[0] = (bNuCfUpdate)?"0%":"OK";
                guiSwStatus[1] = (bCuCfUpdate)?"0%":"OK";
                guiSwStatus[2] = (bNuPicUpdate)?"0%":"OK";
                guiSwStatus[3] = (bCuPicUpdate)?"0%":"OK";
                guiSwStatus[4] = (bBtUpdate)?"0%":"OK";
                guiSoftwareButtonFlag = true;
                guiSoftwareStatus     = SW_STATUS_PLEASE_UPDATE;
                guiSoftwareDirtyFlag  = true; 
                
                StopDownloadLoop();
                StopWaitPopUpMsg();
                UpdateStatusLine("Update status acquired.");
                
                DldState = DLD_STATE_WAIT_USER;
            }
            else
            {
                // Send the poll command to look for package updates...
                SendCloudPoll();
                UpdateStatusLine("Checking for updates...poll: " + DldTimeoutCount + " of " + DLD_CLD_PKG_TIMEOUT_COUNT_MAX ); 
            }
            
            if( DldTimeoutCount >= DLD_CLD_PKG_TIMEOUT_COUNT_MAX )
            {
                // after DLD_CLD_PKG_TIMEOUT_COUNT_MAX times exit stage left...
                bGotUpdateFromCloudTimedOut = true;
                DownloadError( "Timeout", "Update status not available.", false );
            }
     
/*
// jdo Test...            
if( DldTimeoutCount >= 2 )
{

    // Note that the 1062 must be changed to match the actual file ID.
    var rsp = {packages:[
                            {id:642, instructions:[{"@type":"down", id:1062, fn:"WuExecutable.sec", fp:"."}], priority:0,time:1414810929705},
                            {id:642, instructions:[{"@type":"down", id:1062, fn:"CuExecutable.sec", fp:"."}], priority:0,time:1414810929705},
                            {id:642, instructions:[{"@type":"down", id:1062, fn:"PICFlashImg.bin", fp:"."}], priority:0,time:1414810929705},
                            {id:642, instructions:[{"@type":"down", id:1062, fn:"PICFlashImg.bin", fp:"."}], priority:0,time:1414810929705},
                            {id:642, instructions:[{"@type":"down", id:1062, fn:"BTFlashImg.bin", fp:"."}], priority:0,time:1414810929705},
                        ],
                
              set:[
                    {items:{SwVerNU_CF_CldVer:"FF.FF.FF"},priority:0},
                    {items:{SwVerCU_CF_CldVer:"FF.FF.FF"},priority:0},
                    {items:{SwVerNU_PIC_CldVer:"FF.FF"},priority:0},
                    {items:{SwVerCU_PIC_CldVer:"FF.FF"},priority:0},
                    {items:{SwVer_BT_CldVer:"FF.FF"},priority:0},
                    {items:{isUpdateAvailable:true},priority:0},
                ]};
                      
    
    PrintLog( 1, "Rsp..." + JSON.stringify(rsp) );
    ProcessEgressResponse(rsp);
}
*/

            
            break; 
        }

        //---------------------------------------------------------------------------------------
        // Phase 3: Download from the cloud to the phone's /Download directory 
        case DLD_STATE_GET_FROM_CLOUD:
        {
            if( myDownloadFileCldId )
            {
                // URL looks like: "https://nextivity-sandbox-connect.axeda.com/ammp/packages/1/files/MN8!900425000022/323",
                var myDownloadUrl = myPlatformUrl + "packages/1/files/" + myModel + "!" + mySn + "/" + myDownloadFileCldId;
            
                // Path:   "file:///storage/emulated/0/Download/PicFromCloud.bin"
                var myPhoneFilePath;
                if( window.device.platform != pcBrowserPlatform )
                {
                    myPhoneFilePath = g_fileSystemDir.toURL() + myDownloadFileName;
                }
                else
                {
                    myPhoneFilePath = g_fileSystemDir + myDownloadFileName;
                }
            
                DldState                    = DLD_STATE_WAIT_ON_CLOUD;
//                DldTimeoutCount             = 0;

                FileTransferDownload( myDownloadUrl, myPhoneFilePath );
            }
            else
            {
                // After download and reset user will have to try again.
//                document.getElementById("s" + DldOrderArray[currentDldIndex]).innerHTML = "error";
                guiSwStatus[DldOrderArray[currentDldIndex]] = "error";
                guiSoftwareDirtyFlag = true;
                
                // Get the next download...
                Dld.startFileDownload();
            }
                    
            break;
        }
        
        case DLD_STATE_WAIT_ON_CLOUD:
        {
            if( g_fileTransferSuccess != null )
            {
                if( g_fileTransferSuccess )
                {
                    // File is now on the phone, download from phone to Cel-Fi
                    var infoText = "Downloading file: " + myDownloadFileName + " from phone to Cel-Fi."
//                    ShowWaitPopUpMsg( "Please wait", infoText );
                    UpdateStatusLine(infoText);
//                    StopDownloadLoop();


                    DldState                    = DLD_STATE_WAIT_ON_READ_FILE;
                    DldTimeoutCount             = 0;
            
                    // Get the file... The success call back will set the state to CELFI_INIT 
                    ReadFile( myDownloadFileName );   
//                    bReadFileSuccess = false;
//                    fileSystemDownloadDir.getFile( myDownloadFileName, {create:false}, gotFileEntryCB, onGetFileErrorCB );                  
                }
            }


            // If we have gone half way through our timeout, assume something failed and retry...
            if( DldTimeoutCount == (DLD_CLD_TIMEOUT_COUNT_MAX / 2) )
            {
                PrintLog( 1, "Retry to get file from cloud." );
                g_fileTransferSuccess = null;
                DldState              = DLD_STATE_GET_FROM_CLOUD;
            }



            
//            if( (DldTimeoutCount >= (DLD_CLD_TIMEOUT_COUNT_MAX)) || (g_fileTransferSuccess == false) )
            if( DldTimeoutCount >= (DLD_CLD_TIMEOUT_COUNT_MAX) )
            {
                // after so many times exit stage left...
                DownloadError( "Timeout", "Unable to download file from platform.", false );
            }
            
            break;
        }       


        case DLD_STATE_WAIT_ON_READ_FILE:
        {
            if( g_fileReadSuccess != null )
            {
                if( g_fileReadSuccess )
                {
                    // Make an array of UINT8 type.  evt.target.result holds the contents of the file.
                    if( window.device.platform != pcBrowserPlatform )
                    {
                        u8FileBuff    = new Uint8Array(g_fileReadEvent.target.result);
                    
                        actualFileLen = u8FileBuff.length;
                        resumeFileLen = u8FileBuff.length;
                        PrintLog(1, "Length of array, i.e. file is: " + actualFileLen ); 
                    }
                
                    // Start the actual download process to Cel-Fi
                    DldState        = DLD_STATE_TO_CELFI_INIT;
                    DldTimeoutCount = 0;
                }
                else
                {
//                    document.getElementById("s" + DldOrderArray[currentDldIndex]).innerHTML = "error";
                    guiSwStatus[DldOrderArray[currentDldIndex]] = "error";
                    guiSoftwareDirtyFlag = true;
    
                    // See if there are any more files to download...
                    Dld.startFileDownload();
                }
            }
                        
            if( DldTimeoutCount >= DLD_TIMEOUT_COUNT_MAX )
            {
                // after so many times exit stage left...
                DownloadError( "Timeout", "Unable to Read File from Phone's directory.", false );
            }
            
            break;
        }       


        //---------------------------------------------------------------------------------------
        // Phase 4: Download the file from the phone's directory to the Cel-Fi...
        case DLD_STATE_TO_CELFI_INIT:
        {
            DldState              = DLD_STATE_START_REQ;
            StartDownloadLoop(500);
            DldTimeoutCount       = 0;
            fileIdx               = 0;
            completedFileIdx      = 0;
            bCelFiReset           = false;
            SubState_5_1_9        = 0;
            SubStateV2Start       = 0;
            
            // If the file type is NU or CU then add 4 to the length since we must first send out 0xFFFFFFFF.
            if( (DldOrderArray[currentDldIndex] == DLD_NU) || (DldOrderArray[currentDldIndex] == DLD_CU) )
            {
                actualFileLen += 4;
                resumeFileLen += 4;    
            }

            
            // Fall through to the next state.... 
        }

        case DLD_STATE_START_REQ:
        {
            if( nxtyRxStatusIcd <= V1_ICD )
            {
                // Send a message to the Cel-Fi unit to start downloading...
                u8Buff[0] = startType;   
                u8Buff[1] = (resumeAddr >> 24);        // Note that javascript converts var to INT32 for shift operations.
                u8Buff[2] = (resumeAddr >> 16);
                u8Buff[3] = (resumeAddr >> 8);
                u8Buff[4] = resumeAddr;
                u8Buff[5] = (resumeFileLen >> 24);     // Note that javascript converts var to INT32 for shift operations.
                u8Buff[6] = (resumeFileLen >> 16);
                u8Buff[7] = (resumeFileLen >> 8);
                u8Buff[8] = (resumeFileLen >> 0);
                
                nxty.SendNxtyMsg(NXTY_DOWNLOAD_START_REQ, u8Buff, 9);
                DldState        = DLD_STATE_START_RSP;
                DldTimeoutCount = 0;
                SubStateV2Reset = 0;
                SubStateV2Start = 0;
            }
            else
            {
                // V2 must redirect the UART manually if sending to remote unit...
                if( SubStateV2Start == 0)
                {
                    if( bCnxToCu )
                    {
                        // If connected to the CU and we need to download to the NU then send UART redirect....                    
                        if(  (DldOrderArray[currentDldIndex] == DLD_NU) || 
                            ((DldOrderArray[currentDldIndex] == DLD_NU_PIC) && (bNuPicReset))   )
                        {
                            if( (IsUartRemote() == false) && (bCnxToOneBoxNu == false) )     
                            {
                                // Keep trying until we are connected remotely...
                                SetUartRemote();
                            }
                            else
                            {
                                SubStateV2Start = 1;
                            }
                        }
                        else
                        {
                            SubStateV2Start = 1;
                        }
                        
                    }
                    else
                    {
                        // If connected to the NU and we need to download to the CU then send UART redirect....                    
                        if(  (DldOrderArray[currentDldIndex] == DLD_CU)                         ||
                            ((DldOrderArray[currentDldIndex] == DLD_CU_PIC) && (bCuPicReset))   ||
                            ((DldOrderArray[currentDldIndex] == DLD_CU_BT)  && (bBtReset))      )
                        {
                            if( (IsUartRemote() == false) && (bCnxToOneBoxNu == false) )     
                            {
                                // Keep trying until we are connected remotely...
                                SetUartRemote();
                            }
                            else
                            {
                                SubStateV2Start = 1;
                            }
                        }
                        else
                        {
                            SubStateV2Start = 1;
                        }
                    }
                }
                else if( SubStateV2Start == 1)
                {
                    // Send a message to the Cel-Fi unit to start downloading...
                    if( window.device.platform == pcBrowserPlatform )
                    {
                        if(true == ProgramSouthBoundFile( DldOrderArray[currentDldIndex], myDownloadFileName, resumeAddr ))
                        {
                            window.msgRxLastCmd = NXTY_DOWNLOAD_START_RSP;
                            nxtySwDldStartRspAddr = resumeAddr;
                        }
                        else
                        {
                            window.msgRxLastCmd = NXTY_NAK_RSP;
                            nxtyLastNakType == NXTY_NAK_TYPE_TIMEOUT;
                        }
                        DldState = DLD_STATE_START_RSP;
                    }
                    else
                    {
                        u8Buff[0] = startType;   
                        u8Buff[1] = (resumeAddr >> 24);        // Note that javascript converts var to INT32 for shift operations.
                        u8Buff[2] = (resumeAddr >> 16);
                        u8Buff[3] = (resumeAddr >> 8);
                        u8Buff[4] = resumeAddr;
                        u8Buff[5] = (resumeFileLen >> 24);     // Note that javascript converts var to INT32 for shift operations.
                        u8Buff[6] = (resumeFileLen >> 16);
                        u8Buff[7] = (resumeFileLen >> 8);
                        u8Buff[8] = (resumeFileLen >> 0);
                        nxty.SendNxtyMsg(NXTY_DOWNLOAD_START_REQ, u8Buff, 9);
                        DldState        = DLD_STATE_START_RSP;
                    }
                    
                    DldTimeoutCount = 0;
                    SubStateV2Reset = 0;
                    SubStateV2Start = 0;
                }
            }

            if( DldTimeoutCount >= DLD_TIMEOUT_COUNT_MAX )
            {
                // after so many times exit stage left...
                DownloadError( "Timeout", "Unable to redirect UART to remote unit.", false );
            }

                        
            // Slow down just in case we get here by re-negotiating...
            StartDownloadLoop(1000);            
            break;
        }
            

            
        case DLD_STATE_START_RSP:
        {
            // Wait in this state until the Cel-Fi unit responds...
            if( window.msgRxLastCmd == NXTY_DOWNLOAD_START_RSP )
            {
                if( nxtySwDldStartRspAddr != resumeAddr )
                {
                    var myOut = "New resume addr from Ares: 0x" + nxtySwDldStartRspAddr.toString(16) + "  Wave resume addr: 0x" + resumeAddr.toString(16);
                                        
                    resumeAddr       = nxtySwDldStartRspAddr;
                    resumeFileLen    = actualFileLen - (resumeAddr - startAddr);
                    completedFileIdx = actualFileLen - resumeFileLen;

                    PrintLog(1, myOut + "  File Len: " + actualFileLen + " resumeFileLen: " + resumeFileLen + " completedFileIdx:" + completedFileIdx );
                    
                    
                    // Back to try again...
                    startType   = NXTY_SW_NONE_TYPE;
                    DldState    = DLD_STATE_START_REQ;
                }
                else
                {
                    // Move on to next state...
                    DldState        = DLD_STATE_TRANSFER_REQ;
                    DldNakCount     = 0;
                    DldTimeoutCount = 0;   
                    
                    // Crank it up so that we can respond as fast as possible.
                    if( window.device.platform != pcBrowserPlatform )
                    {
                        StartDownloadLoop(DLD_TRANSFER_LOOP_MS);
                    }
                    else
                    {
                        StartDownloadLoop(1000);
                    }
                }
            }
            else if( window.msgRxLastCmd == NXTY_NAK_RSP )
            {
                // Try again...   
                if( nxtyLastNakType == NXTY_NAK_TYPE_TIMEOUT )
                {
                    // If we were in the middle of downloading an NU, then the UART rediret timed out with the NAK timeout.
                    // Restart the download from the current location so the UART redirect will be thrown.
                    if( DldOrderArray[currentDldIndex] == DLD_NU )
                    {
                        startType = NXTY_SW_NONE_TYPE;
                    }
                    else if( DldOrderArray[currentDldIndex] == DLD_NU_PIC )
                    {
                        startType = NXTY_SW_NONE_TYPE;
                    }
                    
                    // Go local and get UNII link status while waiting...
                    SetUartLocal();
                    setTimeout(GetNxtySuperMsgLinkStatus, 1000);
                }
                
                DldState = DLD_STATE_START_REQ;
                
                // Clear the Tx block...
                msgRxLastCmd = NXTY_INIT;
                
                // Give the UART redirect some time to timeout, 5 sec, before retrying...            
                StartDownloadLoop(6000);  
                
                
                if( DldNakCount++ >= DLD_NAK_COUNT_MAX )
                {
                    var eText = "Failed to receive SW Download Start Rsp Msg from Cel-Fi device.";
                    
                    if( bUniiUp == false )
                    {
                        eText += szNoUnii;
                    }
                    DownloadError( "Msg NAK Max.", eText, false );
                }
            }
            
            if( DldTimeoutCount >= DLD_TIMEOUT_COUNT_MAX )
            {
                // after so many times exit stage left...
                DownloadError( "Timeout.", "No SW Download Start Response Msg from Cel-Fi device.", false );
            }
            break;
        }

                    
        case DLD_STATE_TRANSFER_REQ:
        {
            DldTransferReq();
            break;
        }
            
        case DLD_STATE_TRANSFER_RSP:
        {
            // Wait in this state until the Cel-Fi unit responds...
            if( window.msgRxLastCmd == NXTY_DOWNLOAD_TRANSFER_RSP )
            {
                // Calculate the completed file index regardless of whether or not a continue, i.e. 1, was sent back.
                completedFileIdx = fileIdx;
                                
                // See if the Continue flag was set to 1, if so then continue...
                if( nxtySwDldXferRspCont == 1 )
                {
//                    completedFileIdx = fileIdx;

                    var percentComplete = Math.floor(fileIdx/actualFileLen * 100);
//                    PrintLog(1, "Download loop...DldState=" + DldStateNames[DldState] + "  " + percentComplete + "%" );
                    UpdateStatusLine(myDownloadFileName + "..." + percentComplete + "%" ); 
                
                    // Update in the table...
//                    document.getElementById("s" + DldOrderArray[currentDldIndex]).innerHTML = percentComplete + "%"; 
                    guiSwStatus[DldOrderArray[currentDldIndex]] = percentComplete + "%";
                    guiSoftwareDirtyFlag = true;
                    
                    
                    if( completedFileIdx >= actualFileLen )
                    { 
                        // end transfer
                        DldState = DLD_STATE_END_REQ;
                    }
                    else
                    {
                        // transfer some more...
                        DldTransferReq();
                    }
                    DldTimeoutCount = 0;
                    DldNakCount     = 0;
                }
                else
                {
                    PrintLog(1, "Download transfer rsp: Continue was set to 0 which means to re-calculate the address.");
                
                    // Continue was set to 0 which means to re calculate the start...
                    startType       = NXTY_SW_NONE_TYPE;
                    resumeAddr      = startAddr + completedFileIdx;
                    resumeFileLen   = actualFileLen - (resumeAddr - startAddr);
                    
                    DldState = DLD_STATE_START_REQ;
                }     
            }


            // Logic to try to recover from any download error.
            // If no transfer response within 1 second
            //   Start sending status requests every 200 mS up to 11.
            //   If the PIC responds with a status response then we know that we have resynced so 
            //   we can resume transfering data.  Ignore NAKs during this process and
            //   consider only timeouts which should catch NAKs as well.

            if( DldTimeoutCount == (1000 / DLD_TRANSFER_LOOP_MS) )      // 1 second timeout...
            {
                PrintLog(1, "Download transfer 1 second timeout, try to resync with status messages.  Fileidx=" + completedFileIdx + " / " + actualFileLen);
                
                // Send a message every 200 mS until we resync.
                StartDownloadLoop(200);
                
                msgRxLastCmd = NXTY_INIT;
                u8Buff[0] = NXTY_PHONE_ICD_VER;
                nxty.SendNxtyMsg(NXTY_STATUS_REQ, u8Buff, 1);
            }  

            // Try up to 11 times to resync by sending a status message every 200 mS.
            // 11 12-byte status messages is 132 bytes, the size of one transfer message.
            if( DldTimeoutCount > (1000 / DLD_TRANSFER_LOOP_MS) )      
            {   
                if( DldTimeoutCount < ((1000 / DLD_TRANSFER_LOOP_MS) + 11) )      
                {   
                    if( window.msgRxLastCmd == NXTY_STATUS_RSP )
                    {
                        PrintLog(1, "Download transfer 1 second timeout has resynced, continue sending download data.");
                        
                        // Set the DldTimeoutCount so that we do not come back to this logic.
                        DldTimeoutCount = (1000 / DLD_TRANSFER_LOOP_MS) + 11;
                        
                        // The phone and PIC have resynced so lets try to send download data again starting where we left off.
                        // Try to send the download transfer data again...
                        DldState = DLD_STATE_TRANSFER_REQ;
                        StartDownloadLoop(DLD_TRANSFER_LOOP_MS);
                    }
                    else
                    {            
                        // Send another message and look for the rsp.
                        msgRxLastCmd = NXTY_INIT;
                        u8Buff[0] = NXTY_PHONE_ICD_VER;
                        nxty.SendNxtyMsg(NXTY_STATUS_REQ, u8Buff, 1);
                    }
                }
                else if( DldTimeoutCount == ((1000 / DLD_TRANSFER_LOOP_MS) + 11) )
                {
                    // Reset the loop timer so the final timeout is calculated correctly.
                    StartDownloadLoop(DLD_TRANSFER_LOOP_MS);
                }                
            }  

            if( DldTimeoutCount >= ((10000 / DLD_TRANSFER_LOOP_MS)) )   // 10 second timeout
            {
                // after so many times exit stage left...
                var eText = "Failed to receive SW Download Transfer Response Msg from Cel-Fi device.";
                
                if( bUniiUp == false )
                {
                    eText += szNoUnii;
                }
                DownloadError( "Timeout.", eText, true );
            }
            
            break;
        }            
            
            
        case DLD_STATE_END_REQ:
        {

            if( (DldOrderArray[currentDldIndex] == DLD_NU) || 
                (DldOrderArray[currentDldIndex] == DLD_CU) ||
                ((DldOrderArray[currentDldIndex] == DLD_NU_PIC) && (bNuPicReset))   ||
                ((DldOrderArray[currentDldIndex] == DLD_CU_PIC) && (bCuPicReset))   ||
                ((DldOrderArray[currentDldIndex] == DLD_CU_BT)  && (bBtReset))      )
            {
                bCelFiReset = true;
            }
            
            
            // If using the V1 protocol as determined by the CU PIC, then the only images
            // to be downloaded and reset should be the NU PIC or CU PIC.  
            // Included all here as a safty feature in case a PIC has problems. 
            if( nxtyRxStatusIcd <= V1_ICD )
            {
                PrintLog(1, "V1 ICD Download End Req Processing.");
                if( bCelFiReset ) 
                {
                    u8Buff[0]   = 1;  // RESET
                    ShowWaitPopUpMsg( "Please wait", "Reseting system..." );                
                }
                else
                {
                    u8Buff[0] = 0;  // No reset
                } 
                nxty.SendNxtyMsg(NXTY_DOWNLOAD_END_REQ, u8Buff, 1);
                DldState = DLD_STATE_END_RSP;
                
                // Slow it down again...
                StartDownloadLoop(1000); 
                 
            }
            else
            {
                // V2 ICD and beyond processing..............................
                if( SubStateV2Reset == 0)
                {
                    PrintLog(1, "V2 ICD Download End Req Processing, step 1, send Download End Reqest.");
                    
                    // End the download without a reset and then determine if a reset is necessary....
                    u8Buff[0] = 0;  // No reset
                    nxty.SendNxtyMsg(NXTY_DOWNLOAD_END_REQ, u8Buff, 1);
                    
                    if( bCelFiReset )
                    {
                        // Go to the next step and figure out how to reset....
                        SubStateV2Reset = 1;
                    }
                    else
                    {
                        // We're done, no need to reset anything...
                        DldState = DLD_STATE_END_RSP; 
                    }
                    
                    // Slow it down again...
                    StartDownloadLoop(1000); 
                }
                else if( SubStateV2Reset == 1)
                {
                
                    PrintLog(1, "V2 ICD Download End Req Processing, step 2, send a reset to " + DldNames[ DldOrderArray[currentDldIndex] ] );


                    if( (DldOrderArray[currentDldIndex] == DLD_NU) || (DldOrderArray[currentDldIndex] == DLD_CU) )
                    {
                        // Send 0xBEDA221E to 0xF0000040 and read from 0xF8100000.
                        SetNxtySuperMsgResetAresAfterDownload();
                    }
                    else if( (DldOrderArray[currentDldIndex] == DLD_NU_PIC) && (bNuPicReset) )
                    {
                        if( bCnxToCu )
                        {
                            WriteAddrReq(NXTY_RESET_REMOTE_ADDR, NXTY_RESET_VALUE );
                        }
                        else
                        {
                            WriteAddrReq(NXTY_RESET_LOCAL_ADDR, NXTY_RESET_VALUE );
                        }
                    }
                    else if( ((DldOrderArray[currentDldIndex] == DLD_CU_PIC) && (bCuPicReset)) ||
                             ((DldOrderArray[currentDldIndex] == DLD_CU_BT)  && (bBtReset))    )
                    {
                        if( bCnxToCu )
                        {
                            WriteAddrReq(NXTY_RESET_LOCAL_ADDR, NXTY_RESET_VALUE );    
                        }
                        else
                        {
                            WriteAddrReq(NXTY_RESET_REMOTE_ADDR, NXTY_RESET_VALUE );    
                        }
                    }
                    
                    // Go to the next substate which will cancel any UART redirect if needed.
                    SubStateV2Reset = 2;
                
                }
                else if( SubStateV2Reset >= 2 )
                {

                    if( bCnxToCu )
                    {
                        // If connected to the CU and we just downloaded to the NU then cancel UART redirect....                    
                        if(  (DldOrderArray[currentDldIndex] == DLD_NU) || 
                            ((DldOrderArray[currentDldIndex] == DLD_NU_PIC) && (bNuPicReset))   )
                        {
                            // Wait on a NAK from the reset and then go local...
                            PrintLog(1, "V2 ICD Download End Req Processing, step 3, wait on NAK from reset and then cancel UART redirect.");
                            if( (window.msgRxLastCmd == NXTY_NAK_RSP) || (SubStateV2Reset >= 6) )
                            {
                                msgRxLastCmd = NXTY_INIT;
                                SetUartLocal();
                                DldState = DLD_STATE_END_RSP;  
                            }
                            SubStateV2Reset++;
                        }
                        else
                        {
                            // Move on to the next state...
                            DldState = DLD_STATE_END_RSP;                
                        }
                    }
                    else
                    {
                        // If connected to the NU and we just downloaded to the CU then cancel UART redirect....                    
                        if(  (DldOrderArray[currentDldIndex] == DLD_CU)                         ||
                            ((DldOrderArray[currentDldIndex] == DLD_CU_PIC) && (bCuPicReset))   ||
                            ((DldOrderArray[currentDldIndex] == DLD_CU_BT)  && (bBtReset))      )
                        {
                            // Wait on a NAK from the reset and then go local...
                            PrintLog(1, "V2 ICD Download End Req Processing, step 3, wait on NAK from reset and then cancel UART redirect.");
                            if( (window.msgRxLastCmd == NXTY_NAK_RSP) || (SubStateV2Reset >= 6) )
                            {
                                msgRxLastCmd = NXTY_INIT;
                                SetUartLocal();
                                DldState = DLD_STATE_END_RSP;  
                            }
                            SubStateV2Reset++;
                        }
                        else
                        {
                            // Move on to the next state...
                            DldState = DLD_STATE_END_RSP;                
                        }
                    }
                }
                
                
            }
            
            break;
        }

        case DLD_STATE_END_RSP:
        {
            // Wait in this state until the Cel-Fi unit responds...
            if( window.msgRxLastCmd == NXTY_DOWNLOAD_END_RSP )
            {
                // Catch all V1 or V2 non resets.
                PrintLog(1, "Update Complete...End Rsp");
                UpdateStatusLine("Update Complete... " ); 

                
                // Get the next download...
                Dld.startFileDownload();
            }
            else if( SubStateV2Reset >= 2 )
            {
                // Catch the V2 reset here...SetUartLocal(). 
                PrintLog(1, "Update Complete...V2 Set Uart Local");
                UpdateStatusLine("Update Complete... " ); 
                
                // Get the next download...
                Dld.startFileDownload();
            }
            else if( window.msgRxLastCmd == NXTY_NAK_RSP )
            {
                if( (bCelFiReset) && (nxtyLastNakType == NXTY_NAK_TYPE_TIMEOUT) )
                {
                    // If the NU or CU was just reset then the PIC may not be able to communicate and we
                    // either timeout here or timeout below.  Either way we will call it done. 
                    PrintLog(1, "Update Complete...NAK Timeout");
                    UpdateStatusLine("Update Complete... " ); 
                
                    // Get the next download...
                    Dld.startFileDownload();
 
                }
                else
                {
                    // Try again...
                    DldState = DLD_STATE_END_REQ;
    
                    // Clear the Tx block...
                    msgRxLastCmd = NXTY_INIT;
                }
                
                
                if( DldNakCount++ >= DLD_NAK_COUNT_MAX )
                {
                    var eText = "Failed to receive SW Download End Response Msg from Cel-Fi device.";
                    
                    if( bUniiUp == false )
                    {
                        eText += szNoUnii;
                    }
                    DownloadError( "Msg NAK Max.", eText, false );
                }
            }
               
            if( bCelFiReset )
            {                
                UpdateStatusLine("Waiting for reset... " + (DLD_RESET_TIMEOUT - DldTimeoutCount) );
            }
                                     
            if( DldTimeoutCount >= DLD_TIMEOUT_COUNT_MAX )
            {
                if( bCelFiReset )
                {
                    // If the NU or CU was just reset then the PIC may not be able to communicate and we
                    // either timeout here or timeout below.  Either way we will call it done. 
                
                    // Get the next download...
                    Dld.startFileDownload();
                }
                else
                {
                    // after x times exit stage left...
                    var eText = "Failed to receive SW Download End Response Msg from Cel-Fi device.";
                    
                    if( bUniiUp == false )
                    {
                        eText += szNoUnii;
                    }
                    
                    DownloadError( "Timeout.", eText, false );
                }
            }
            break;
        }

        case DLD_STATE_RESET:
        {
            UpdateStatusLine("Waiting for reset... " + (DLD_RESET_TIMEOUT - DldTimeoutCount) );
            
            if( DldTimeoutCount >= DLD_RESET_TIMEOUT )
            {
                // Move on to the next state...
                if( bNuCfUpdate || bNuPicUpdate )
                {
                    // If either NU image was updated then wait on the UNII to be up before going on...
                    DldState        = DLD_STATE_UNII_UP;
                    bUniiUp         = false;
                    ShowWaitPopUpMsg( "Please wait", "Waiting for Unit to Unit comm..." ); 
                }
                else
                {
                    // Do not wait on the UNII to be up...
                    DldState        = DLD_STATE_5_1_9_CHECK_VER;
                }
                DldTimeoutCount = 0;
                
                // Clear the Tx block...
                msgRxLastCmd = NXTY_INIT;
            }
            break;
        }

        case DLD_STATE_UNII_UP:
        {
            if( bUniiUp )
            {
                DldState        = DLD_STATE_5_1_9_CHECK_VER;
                DldTimeoutCount = 0;
            }
            else
            {
                UpdateStatusLine("Waiting for Unit to Unit comm... " + (DLD_UNII_UP_TIMEOUT - DldTimeoutCount) );
            
                // Check to see if UNII is up...
                GetNxtySuperMsgLinkStatus();
            }            

            if( DldTimeoutCount >= DLD_UNII_UP_TIMEOUT )
            {
                // after x times exit stage left...
                DownloadError( "Timeout.", "Waiting for communications between Cel-Fi devices...", false );
            }            

            break;
        }





        // 5_1_9 states are due to a problem with download and reset for version 5.1.9 and previous.
        // Solution is to reset a 2nd time...
        case DLD_STATE_5_1_9_CHECK_VER:
        {
            // Check if the local CU or NU version is 5.1.9 or previous, if so then reset.
            // localeCompare will return -1 if nxtySwVerNuCf < "0x0501000A".
            var bNuSecondResetRequired = ((bNuCfUpdate) && (nxtySwBuildIdNu.localeCompare("0x0501000A") == -1))?true:false;
            var bCuSecondResetRequired = ((bCuCfUpdate) && (nxtySwBuildIdCu.localeCompare("0x0501000A") == -1))?true:false;
            
            if( bNuSecondResetRequired || bCuSecondResetRequired )
            {
                PrintLog( 1, "NU/CU 5.1.9 Check: NU 2nd Reset Req: " + bNuSecondResetRequired + "  CU 2nd Reset Req: " + bCuSecondResetRequired );            
                if( bNuSecondResetRequired )
                { 
                    if( SubState_5_1_9 == 0 )
                    {
                        PrintLog( 1, "NU 5.1.9 Check: SubState 5.1.9 = 0 - Redirect UART to NU" );
                     
                        // 1st: set UART redirect to the NU 
                        SetUartRemote();
                        SubState_5_1_9  = 1;
                        DldTimeoutCount = 0;
                    }
                    else if( SubState_5_1_9 == 1 )
                    {
                        PrintLog( 1, "NU 5.1.9 Check: SubState 5.1.9 = 1 - Issue Download END Req to force a reset." );
                        if( bNxtySuperMsgRsp == true )
                        {
                            if( iNxtySuperMsgRspStatus == NXTY_SUPER_MSG_STATUS_SUCCESS )
                            {
                                // 2nd:  Issue a download END REQ message
                                SetNxtySuperMsgResetAresAfterDownload(); 
                                SubState_5_1_9  = 2;
                                DldTimeoutCount = 0;
                                ShowWaitPopUpMsg( "Please wait", "Reseting system..." );
                            }
                            else
                            {
                                SubState_5_1_9 = 0;     // retry...
                            }
                             
                        }
                        else if( window.msgRxLastCmd == NXTY_NAK_RSP )
                        {
                            // retry...
                            SubState_5_1_9 = 0;
                        }
                    
                    }
                    else if( SubState_5_1_9 == 2 )
                    {
                        PrintLog( 1, "NU 5.1.9 Check: SubState 5.1.9 = 2 - Wait for Download END RSP or a timeout." );
                    
                        UpdateStatusLine("Waiting for reset... " + (DLD_RESET_TIMEOUT - DldTimeoutCount) );

                        if( bNxtySuperMsgRsp == true )
                        {
                            // Don't expect to get this since we just reset the NU...
                            // 3rd:  See if the CU version is 5.1.9 or prev and reset it as well.
                            if( bCuSecondResetRequired )
                            { 
                                SetNxtySuperMsgResetAresAfterDownload(); 
                            }

                            DldState        = DLD_STATE_5_1_9_RESET;
                            DldTimeoutCount = 0;
                        }
                        else if( window.msgRxLastCmd == NXTY_NAK_RSP )
                        {
                            // Most likely a timeout so blast ahead...
                            if( bCuSecondResetRequired )
                            { 
                                SetNxtySuperMsgResetAresAfterDownload(); 
                            }

                            DldState        = DLD_STATE_5_1_9_RESET;
                            DldTimeoutCount = 0;
                        }
                    
                    }
                }
                else
                {
                    PrintLog( 1, "CU 5.1.9 Check" );
                
                    // Not the NU so it must have been just the CU...Reset...
                    SetNxtySuperMsgResetAresAfterDownload(); 
                    DldState        = DLD_STATE_5_1_9_RESET;
                    DldTimeoutCount = 0;
                }
                
            }
            else
            {
                // No need for 2nd reset on the NU or CU so get latest versions...
                DldState         = DLD_STATE_UPDATE_LOCAL_VER;
                SubStateV2GetVer = 0;
                nxtyCurrentReq   = 0;
            }
            
            // Wait additional time for NAK timeout if needed...
            if( DldTimeoutCount >= (DLD_TIMEOUT_COUNT_MAX * 2) )
            {
                // If a 2nd reset was needed just move on to the reset state
                if( bNuSecondResetRequired || bCuSecondResetRequired )
                {
                    // See if we need to reset the CU as well but have not...
                    if( bCuSecondResetRequired && (DldState != DLD_STATE_5_1_9_RESET) )
                    { 
                        SetNxtySuperMsgResetAresAfterDownload(); 
                        DldTimeoutCount = 0;
                    }
                    DldState        = DLD_STATE_5_1_9_RESET;

                }
                else
                {
                    // after so many times exit stage left...
                    DownloadError( "Timeout.", "Failed to reset Cel-Fi device (5.1.9).", false );
                }
            }
            break;
        }

        case DLD_STATE_5_1_9_RESET:
        {
            UpdateStatusLine("Waiting for reset... " + (DLD_RESET_TIMEOUT - DldTimeoutCount) );
            
            if( DldTimeoutCount >= DLD_RESET_TIMEOUT )
            {
                // Move on to the next state...
                if( bNuCfUpdate || bNuPicUpdate )
                {
                    // If either NU image was updated then wait on the UNII to be up before going on...
                    DldState        = DLD_STATE_5_1_9_UNII_UP;
                    bUniiUp         = false;
                    DldTimeoutCount = 0;
                    ShowWaitPopUpMsg( "Please wait", "Waiting for Unit to Unit comm..." ); 
                }
                else
                {
                    // Do not wait on the UNII to be up...
                    DldState         = DLD_STATE_UPDATE_LOCAL_VER;
                    SubStateV2GetVer = 0;
                    nxtyCurrentReq   = 0;
                }
                DldTimeoutCount = 0;
                
                                
                // Clear the Tx block...
                msgRxLastCmd = NXTY_INIT;
            }
            break;
        }

        case DLD_STATE_5_1_9_UNII_UP:
        {
            if( bUniiUp )
            {
                DldState         = DLD_STATE_UPDATE_LOCAL_VER;
                SubStateV2GetVer = 0;
                nxtyCurrentReq   = 0;
            }
            else
            {
                UpdateStatusLine("Waiting for Unit to Unit comm... " + (DLD_UNII_UP_TIMEOUT - DldTimeoutCount) );
            
                // Check to see if UNII is up...
                GetNxtySuperMsgLinkStatus();
            }            

            if( DldTimeoutCount >= DLD_UNII_UP_TIMEOUT )
            {
                // after x times exit stage left...
                DownloadError( "Timeout.", "Waiting for communications between Cel-Fi devices...", false );
            }            

            break;
        }


            
        case DLD_STATE_UPDATE_LOCAL_VER:
        {
            if( SubStateV2GetVer == 0 )
            {
                StopWaitPopUpMsg();
                UpdateStatusLine("Updating Local SW Version Info... " );
                StartDownloadLoop(1000); 
            
                GetNxtySuperMsgInfo();
                SubStateV2GetVer = 1;
            }
            else if( SubStateV2GetVer == 1 )
            {
                if( iNxtySuperMsgRspStatus == NXTY_SUPER_MSG_STATUS_PENDING )
                {
                    // just wait
                }
                else if( iNxtySuperMsgRspStatus == NXTY_SUPER_MSG_STATUS_SUCCESS )
                {
                    // Good response, fill in the versions...
                    guiSwCelFiVers[1] = nxtySwVerCuCf;
                    guiSwCelFiVers[3] = nxtySwVerCuPic;
                    guiSwCelFiVers[4] = nxtySwVerCuBt; 
                    guiSoftwareDirtyFlag = true;                   
                    SubStateV2GetVer = 2;
                }
                else
                {
                    // Must be a NAK or Write error, try again...
                    SubStateV2GetVer = 0;
                    
                    if( DldNakCount++ >= DLD_NAK_COUNT_MAX )
                    {
                        var eText = "Failed to receive SW Ver Rsp Msg from Cel-Fi device.";
                        
                        if( bUniiUp == false )
                        {
                            eText += szNoUnii;
                        }
                        DownloadError( "Msg NAK Max.", eText, false );
                    }
                }
            }
            else if( SubStateV2GetVer == 2 )
            {
                // Only update the NU versions if either were downloaded...
                if( (bNuCfUpdate || bNuPicUpdate) && bUniiUp )
                {
                    UpdateStatusLine("Updating Remote SW Version Info... " );
                    SetUartRemote();
                    SubStateV2GetVer = 3;
                }
                else
                {
                    DldState = DLD_STATE_DONE;
                }
            }
            else if( SubStateV2GetVer == 3 )
            {
                GetNxtySuperMsgInfo();
                SubStateV2GetVer = 4;
            }
            else if( SubStateV2GetVer == 4 )
            {
                if( iNxtySuperMsgRspStatus == NXTY_SUPER_MSG_STATUS_PENDING )
                {
                    // just wait
                }
                else if( iNxtySuperMsgRspStatus == NXTY_SUPER_MSG_STATUS_SUCCESS )
                {
                    // Good response, fill in the versions...
                    guiSwCelFiVers[0] = nxtySwVerNuCf;
                    guiSwCelFiVers[2] = nxtySwVerNuPic; 
                    guiSoftwareDirtyFlag = true;                   
                    SubStateV2GetVer = 5;
                }
                else
                {
                    // Must be a NAK or Write error, try again...
                    SubStateV2GetVer = 3;
                    
                    if( DldNakCount++ >= DLD_NAK_COUNT_MAX )
                    {
                        var eText = "Failed to receive SW Ver Rsp Msg from Cel-Fi device.";
                        
                        if( bUniiUp == false )
                        {
                            eText += szNoUnii;
                        }
                    
                        DownloadError( "Msg NAK Max.", eText, false );
                    }
                }
                
            }
            else if( SubStateV2GetVer == 5 )
            {
                SetUartLocal();
                DldState = DLD_STATE_DONE;
            }
            
        
        
        
        


                         
            if( DldTimeoutCount >= DLD_TIMEOUT_COUNT_MAX )
            {
                // after x times exit stage left...
                var eText = "Failed to receive SW Ver Rsp Msg from Cel-Fi device.";
                
                if( bUniiUp == false )
                {
                    eText += szNoUnii;
                }
            
                DownloadError( "Timeout.", eText, false );
            }            
            

            break;
        }


        case DLD_STATE_DONE:
        {
            UpdateStatusLine("Update complete... " );
            StopDownloadLoop();
            StopWaitPopUpMsg();
            
            guiSoftwareStatus           = SW_STATUS_UP_TO_DATE;
            guiSoftwareDirtyFlag        = true;
            
            // If anyone was downloaded then put a big happy button up...
            if( bNuCfUpdate || bCuCfUpdate || bNuPicUpdate || bCuPicUpdate || bBtUpdate )
            {
                ShowAlertPopUpMsg("Update Complete!",  "Software has been updated." );
            }            

            
            break;
        }
        
        
        case DLD_STATE_WAIT_USER:
        {
            UpdateStatusLine("Select Update to continue... " );
//            StopDownloadLoop();
            StopWaitPopUpMsg();
            
            // Send out a message every second just in case the PIC and BT need to get re-aligned...
            // Clear any Tx block first...
            msgRxLastCmd = NXTY_INIT;
            u8Buff[0] = NXTY_PHONE_ICD_VER;
            nxty.SendNxtyMsg(NXTY_STATUS_REQ, u8Buff, 1);
            
            break;
        }
        
        
        default:
        {
            StopDownloadLoop();
            UpdateStatusLine("Invalid Update State.");
            break;
        }
        
    }   // end switch
}
    
    
function DldTransferReq() 
{
  if( window.device.platform != pcBrowserPlatform )
  {
    var chunkSize;
    var u8Buff  = new Uint8Array(NXTY_MED_MSG_SIZE);
    
    chunkSize = NXTY_DOWNLOAD_MAX_SIZE;
    fileIdx   = completedFileIdx;

    // See if we can push out a full load...        
    if( (fileIdx + NXTY_DOWNLOAD_MAX_SIZE) > actualFileLen )
    {
        chunkSize = actualFileLen - fileIdx;
    }
    u8Buff[0] = chunkSize;

    
    if( (DldOrderArray[currentDldIndex] == DLD_NU) || (DldOrderArray[currentDldIndex] == DLD_CU) )
    {
        // Start with 1 to account for u8Buff[0] set to chunkSize
        i = 1;
        
        // For NU and CU the 1st 4 bytes must be 0xFFFFFFFF and the size must be decreased by 4.
        if( fileIdx == 0 )
        {   
            var size;
                 
            u8Buff[i++] = 0xFF;                     // dword[0]
            u8Buff[i++] = 0xFF;
            u8Buff[i++] = 0xFF;
            u8Buff[i++] = 0xFF;
            u8Buff[i++] = u8FileBuff[fileIdx++];    // dword[1]
            u8Buff[i++] = u8FileBuff[fileIdx++];
            u8Buff[i++] = u8FileBuff[fileIdx++];
            u8Buff[i++] = u8FileBuff[fileIdx++];
            
            // Treat the size as little endian...
            size =  u8FileBuff[fileIdx++];
            size |= (u8FileBuff[fileIdx++] << 8);
            size |= (u8FileBuff[fileIdx++] << 16);
            size |= (u8FileBuff[fileIdx++] << 24);
            
            // Use the triple right shift operator to convert from signed to unsigned.                           
            size >>>= 0;
            
            // Subtract 4...
            size    -= 4; 

            // Load it back into the buffer...
            u8Buff[i++] = (size)       & 0xFF;
            u8Buff[i++] = (size >> 8)  & 0xFF;
            u8Buff[i++] = (size >> 16) & 0xFF;
            u8Buff[i++] = (size >> 24) & 0xFF;

            // Finish the chunk...
            for( ; i <= chunkSize; i++ )
            {
                u8Buff[i] = u8FileBuff[fileIdx++];
            }
            
            // Compensate for the additional 4 bytes...
            fileIdx += 4;
        }
        else
        {
            for( i = 1; i <= chunkSize; i++ )
            {
                u8Buff[i] = u8FileBuff[fileIdx - 4];
                fileIdx++;
            }
        }
    }
    else
    {
        
        // Start with 1 to account for u8Buff[0] set to chunkSize
        for( i = 1; i <= chunkSize; i++ )
        {
            u8Buff[i] = u8FileBuff[fileIdx++];
        }
    }
    
    
    // Send a message to the Cel-Fi unit with data...
    nxty.SendNxtyMsg(NXTY_DOWNLOAD_TRANSFER_REQ, u8Buff, (chunkSize + 1));
    DldState = DLD_STATE_TRANSFER_RSP;
  }
  else
  {
    // get progress from SouthBound interface
    var percentComplete = Math.floor( ProgramSouthBoundFileProgress() );
    UpdateStatusLine(myDownloadFileName + "..." + percentComplete + "%" ); 
    
    // Update in the table...
    guiSwStatus[DldOrderArray[currentDldIndex]] = percentComplete + "%";
    guiSoftwareDirtyFlag = true;

    if(percentComplete >= 100) //Done!
    {
        DldState = DLD_STATE_END_REQ;
    }
  }
}

// End of operational code...
/////////////////////////////////////////////////////////////////////////////////////////////////////////////



