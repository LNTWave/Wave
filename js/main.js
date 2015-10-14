//=================================================================================================
//
//  File: main.js
//
//  Description:  Main javascript entry point.   
//                Contains main menu logic and misc support functions.
//
//=================================================================================================

var isRegistered = true;

var myModel                     = null;
var mySn                        = null;
var mySku                       = null;

const   MAIN_LOOP_COUNTER_MAX   = 30;
const   UNII_TRY_COUNTER_MAX    = 15;
const   SwPnNuCu                = "700.036.";
const   SwPnPic                 = "700.040.";
const   SwPnBt                  = "700.041.";

const   PROG_MODE_MAIN          = 100;
const   PROG_MODE_DOWNLOAD      = 200;
const   PROG_MODE_TECH          = 300;
const   PROG_MODE_SETTINGS      = 400;
const   PROG_MODE_REGISTRATION  = 500;


var bSendLocalInfoToCloud       = false;
var bUniiUp                     = false;
var bUniiStatusKnown            = false;
var uMainLoopCounter            = 0;
var uStateCounter               = 0;
var uRemoteStateCounter         = 0;
var MainLoopIntervalHandle      = null; 

var bGotUserInfoRspFromCloud    = false;
var bPrivacyViewed              = false;
var bCheckSouthBoundIfOnStartup = true;
var bSpinner                    = false;
var checkUniiStatusMainTimer    = null;
var bCnxToCu                    = true;             // Set to true if connected locally to CU after reading local BoardConfig.

var iOSPlatform                 = "iOS";
var androidPlatform             = "Android";
var pcBrowserPlatform           = "PcBrowser";


var uIcd                    = 0;
var swVerBtScan             = "--.--";          // Filled in by scan results. 
var szVerApp                = "96.00.03";       // In BCD, remember config.xml as well.

// Determine which messages get sent to the console.  1 normal, 10 verbose.
// Level  1: Flow and errors.
// Level  2: Raw bluetooth Tx data
// Level  3: Raw bluetooth Rx Data partial msgs
// Level  4: Timing loops
// Level 10: Bluetooth processing.
// Level 99: Error, print in red.
var PrintLogLevel = 3;









// RequestModeChange............................................................................................
function RequestModeChange(newMode)
{

    if( newMode == PROG_MODE_MAIN )
    {
        HandleBackKey();
    }
    else if( newMode == PROG_MODE_REGISTRATION )
    {
        // Handle if button is displayed...
        /*if( guiButtonRegHtml.length > 10 )
        {*/
            PrintLog(1, "");
            PrintLog(1, "Reg key pressed-----------------------------------------------------------------");
            clearInterval(MainLoopIntervalHandle);  
            
            if( isSouthBoundIfCnx && bUniiUp )
            {
                StopGatheringTechData();
//                clearTimeout(checkUniiStatusMainTimer);
                SendCloudPoll();
                setTimeout(reg.renderRegView, 300);
            }
            else
            {
                if( isSouthBoundIfCnx == false )
                {
                    ShowAlertPopUpMsg(szSouthBoundIfNotCnxMsg, "Registration mode not allowed...");
                }
                else
                {
                    ShowAlertPopUpMsg("Wireless link down.", "Registration mode not allowed...");
                }
            }
        //}   // if button is displayed
    }
    else if( newMode == PROG_MODE_TECH )
    {
        // Handle if button is displayed...
        if( guiButtonTkHtml.length > 10 )
        {
            PrintLog(1, "");
            PrintLog(1, "Tech Mode key pressed-----------------------------------------------------------");
            clearInterval(MainLoopIntervalHandle); 
                        
            if( isSouthBoundIfCnx )
            {
//                clearTimeout(checkUniiStatusMainTimer);
                setTimeout(tech.renderTechView, 300);
            }
            else
            {
                ShowAlertPopUpMsg(szSouthBoundIfNotCnxMsg, "Tech mode not allowed...");
            }
        }   // if button is displayed...
    }
    else if( newMode == PROG_MODE_SETTINGS )
    {
        // Handle if button is displayed...
        if( guiAntennaFlag == true )
        {
            PrintLog(1, "");
            PrintLog(1, "Antenna key pressed-------------------------------------------------------------");
            
            clearInterval(MainLoopIntervalHandle);  
           
            if( isSouthBoundIfCnx && bUniiUp )
            {
                StopGatheringTechData();
//                clearTimeout(checkUniiStatusMainTimer);
                setTimeout(Stg.renderSettingsView, 300);
            }
            else
            {
                if( isSouthBoundIfCnx == false )
                {
                    ShowAlertPopUpMsg(szSouthBoundIfNotCnxMsg, "Antenna mode not allowed...");
                }
                else
                {
                    ShowAlertPopUpMsg("Wireless link down", "Antenna mode not allowed...");
                }
            }
        }   // If button is displayed
    }
    else if( newMode == PROG_MODE_DOWNLOAD )
    {
        // Handle if button is displayed...
        if( guiButtonSwHtml.length > 10 )
        {
            PrintLog(1, "");
            PrintLog(1, "SW Update key pressed-----------------------------------------------------------");
            clearInterval(MainLoopIntervalHandle);  
        
            if( isSouthBoundIfCnx )
            {
                StopGatheringTechData();
//                clearTimeout(checkUniiStatusMainTimer);
                Dld.renderDldView();  
            }
            else
            {
                ShowAlertPopUpMsg(szSouthBoundIfNotCnxMsg, "SW Update mode not allowed..." );
            }
        } // if button is displayed...            
        
    }
    else
    {
        PrintLog(99, "RequestModeChange(unknown)=" + newMode );
    }
    
}


// HandleBackKey............................................................................................
function HandleBackKey()
{
    
    if( guiCurrentMode == PROG_MODE_MAIN )
    {
        // Android:  Go to background mode.  No longer ask to exit app...
        navigator.app.exitApp()
    }
    else if( guiCurrentMode == PROG_MODE_REGISTRATION )
    {
        reg.handleBackKey();
    }
    else if( guiCurrentMode == PROG_MODE_TECH )
    {
        tech.handleBackKey();
    }
    else if( guiCurrentMode == PROG_MODE_SETTINGS )
    {
        Stg.handleBackKey();
    }
    else if( guiCurrentMode == PROG_MODE_DOWNLOAD )
    {
        Dld.handleBackKey();
    }
    else
    {
        ShowAlertPopUpMsg("Back...", "Back to where?");
    }
}




// PrintLog............................................................................................
function PrintLog(level, txt)
{
    var d       = new Date();
    var myMs    = d.getMilliseconds();
    
    
    if( myMs < 10 )
    {
        myMs = "00" + myMs;
    }
    else if( myMs < 100 )
    {
        myMs = "0" + myMs;
    }
    
    
    if( level == 99 )
    {
//        console.log("**** Error: (" + d.getSeconds() + "." + d.getMilliseconds() + ") " + txt);
        var logText = "(" + d.getMinutes() + ":" + d.getSeconds() + "." + myMs + ") **** Error: " + txt;
        WriteLogFile( logText );
        
//jdo        console.error(txt);            // console.error does not work on phonegap
    }
    else if( level <= PrintLogLevel )
    { 
        var logText = "(" + d.getMinutes() + ":" + d.getSeconds() + "." + myMs + ") " + txt;
        WriteLogFile( logText );
    }
    
}



// HandleButtonDown............................................................................................
function HandleButtonDown()
{
    // No transparency when pressed...
    $(this).css("opacity","1.0");
    $(this).css("outline", "none" );       // Used to remove orange box for android 4+
}

// HandleButtonUp............................................................................................
function HandleButtonUp()
{
    $(this).css("opacity","0.5");
    $(this).css("outline", "none" );       // Used to remove orange box for android 4+
}


// handleBtInfo............................................................................................
function handleBtInfo()
{
    
    if( isSouthBoundIfCnx )
    {
        szSouthBoundIfInfoMsg += "CONNECTED";
    }
    else
    {
        szSouthBoundIfInfoMsg += "NOT CONNECTED";
    }
     
    ShowAlertPopUpMsg( "Southbound IF ICON", szSouthBoundIfInfoMsg );
}


// handleRegInfo............................................................................................
function handleRegInfo()
{
    var jText = "Indicates if registered or not.\nCurrent status: ";
    
    if( isRegistered )
    {
        jText += "REGISTERED";
    }
    else
    {
        jText += "NOT REGISTERED";
    }
     
    ShowAlertPopUpMsg( "Registered ICON", jText );
}



// handleUniiInfo............................................................................................
function handleUniiInfo()
{
    var jText = "Indicates if wireless link between units is up or down.\nCurrent status: ";
    
    if( bUniiUp )
    {
        jText += "UP.";
    }
    else
    {
        jText += "DOWN.";
    }
     
    ShowAlertPopUpMsg( "Wireless Link ICON", jText );
}

// UpdateUniiIcon....................................................................................
function UpdateUniiIcon(bStatus)
{
    bUniiUp          = bStatus;
    bUniiStatusKnown = true;
    
    // Set to UNII Up...
    if( bUniiUp )
    {
        guiIconUniiHtml = szUniiIconUp;     // unii_yes.png
    }
    else
    {
        guiIconUniiHtml = szUniiIconDown;     // unii_no.png
    }
}


// CheckUniiStatusMain....................................................................................
function CheckUniiStatusMain()
{
    var u8Buff  = new Uint8Array(20);
 
    if( guiCurrentMode == PROG_MODE_MAIN )
    {
        // Check to see if UNII is up...
        GetNxtySuperMsgLinkStatus();
    
        // Return here in x seconds....
        checkUniiStatusMainTimer = setTimeout(CheckUniiStatusMain, 5000);
    }
}




// U8ToHexText............................................................................................
function U8ToHexText(u8)
{
    if( u8 < 0x10 )
    {
        return( "0" + u8.toString(16).toUpperCase() );     // Add a leading 0....
    }
    else
    {
        return( u8.toString(16).toUpperCase() );     
    }
}

// DecTo3Text............................................................................................
function DecTo3Text(u8)
{
    if( u8 < 10 )
    {
        return( "00" + u8.toString(10) );     // Add a leading 00....
    }
    else if( u8 < 100 )
    {
        return( "0" + u8.toString(10) );     // Add a leading 0....
    }

    else
    {
        return( u8.toString(10) );     
    }
}

// HexTo3Text.....................................................................................................
function HexTo3Text(myNum) 
{
    if(myNum < 0x010) 
    {
        return( "00" + myNum.toString(16).toUpperCase() );
    } 
    else if(myNum < 0x100) 
    {
        return( "0" + myNum.toString(16).toUpperCase() );
    } 
    else 
    {
        return( myNum.toString(16).toUpperCase() );
    }
}

// UpdateRegIcon....................................................................................
function UpdateRegIcon(reg)
{
    // Enable the ICON button to allow info if user touches.                
    guiIconRegDisabled = false;  
                    
    if(reg == 1)
    {
        // Set to Registered...
//        if( isRegistered == false )
        {
            guiIconRegHtml = szRegIconReg;     // reg_yes.png
            isRegistered = true;

/*
4/14/15: No longer change backgrounds if registered or unregistered...
            // Only change the background if not IOS.   IOS has problem scaling new background on the fly.                
            if( window.device.platform != iOSPlatform )
            {
                $('body').css("background","white url('../www/img/hbackground_reg.png') no-repeat fixed center bottom");
            }
*/
            
        }
    }
    else
    {
        // Set to NOT Registered...
//        if( isRegistered == true )
        {
            guiIconRegHtml = szRegIconNotReg;    // reg_no.png   line across
            isRegistered = false;
            
/*
4/14/15: No longer change backgrounds if registered or unregistered...
            // Only change the background if not IOS.   IOS has problem scaling new background on the fly.                
            if( window.device.platform != iOSPlatform )
            {
                $('body').css("background","white url('../www/img/hbackground.png') no-repeat fixed center bottom");
            }
*/
            
        }
    }
}

// UpdateRegButton....................................................................................
function UpdateRegButton(reg)
{
    if(reg == 1)
    {
        // Already registered so remove button and disable.
        guiButtonRegHtml     = "";
        guiButtonRegDisabled = true;
    }
    else
    {
        // Not registered so add button and enable...
        guiButtonRegHtml     = szRegButtonImg;
        guiButtonRegDisabled = false;
    }
}









// HandleOsConfirmation.......................................................................................
function HandleOsConfirmation(buttonIndex) 
{
    // buttonIndex = 0 if dialog dismissed, i.e. back button pressed.
    // buttonIndex = 1 if 'Ok'
    if( buttonIndex == 1 )
    {
        // Do nothing since we no longer want to kill the app.  This will force the user to manually kill.
        // Ok...Exit...Kill the app...
//        navigator.app.exitApp();                
    }
}



// HandlePicUpdateConfirmation.......................................................................................
function HandlePicUpdateConfirmation(buttonIndex) 
{
    // buttonIndex = 0 if dialog dismissed, i.e. back button pressed.
    // buttonIndex = 1 if 'Ok'
    if( (buttonIndex == 0) || (buttonIndex == 1) )
    {
        // Go to the software download page...
        Dld.renderDldView(); 
    }
}

// HandlePrivacyConfirmation.......................................................................................
function HandlePrivacyConfirmation(buttonIndex) 
{
    // buttonIndex = 0 if dialog dismissed, i.e. back button pressed.
    // buttonIndex = 1 if 'Ok'
	if( buttonIndex == 0 )
    {
        // If they dismiss, then give it to them again....
        ShowConfirmPopUpMsg(
            "Your privacy is important to us. Please refer to 'www.cel-fi.com/privacypolicy' for our detailed privacy policy.",    // message
            HandlePrivacyConfirmation,      // callback to invoke with index of button pressed
            'Privacy Policy',               // title
            ['Ok'] );                       // buttonLabels

        UpdateStatusLine("Please select Ok..."); 
    }
    else if( (buttonIndex == 1) || (buttonIndex == 2) )
    {
        // Ok...
        bPrivacyViewed = true;
        
        if( buttonIndex == 1 )
        {
            if( isSouthBoundIfCnx == false )
            {
            	//alert("Search for cel-fi device");
                // Start the spinner..
                //ShowWaitPopUpMsg( "Please wait", "Searching for Cel-Fi devices..." );
                //UpdateStatusLine("Searching for Cel-Fi devices...");
            	util.showSearchAnimation();
            }
        }
        
    }
}

// HandleUniiRetry.......................................................................................
// process the confirmation dialog result
function HandleUniiRetry(buttonIndex) 
{
    // buttonIndex = 0 if dialog dismissed, i.e. back button pressed.
    // buttonIndex = 1 if 'Retry' try again.
    // buttonIndex = 2 if 'Exit'
    if( buttonIndex == 1 )
    {
        // Retry...
        ShowWaitPopUpMsg( "Please wait", "Retrying..." );
        MainLoopIntervalHandle = setInterval(app.mainLoop, 1000 ); 
        nxtySwVerNuCf          = null;
        nxtySwVerCuCf          = null;      // Set to Null so new NU version gets sent to cloud.  Bug 1324
//        bUniiUp                = true;
    }
    
    
}

// HandleCloudRetry.......................................................................................
// process the confirmation dialog result
function HandleCloudRetry(buttonIndex) 
{
    // buttonIndex = 0 if dialog dismissed, i.e. back button pressed.
    // buttonIndex = 1 if 'Retry' try again.
    // buttonIndex = 2 if 'Exit'
    if( buttonIndex == 1 )
    {
        // Retry...
        ShowWaitPopUpMsg( "Please wait", "Retrying..." );
        MainLoopIntervalHandle = setInterval(app.mainLoop, 1000 );
                    
        // See if we have a network connection, i.e. WiFi or Cell.
        isNetworkConnected = NorthBoundConnectionActive();
    }
    
    
}




            
            
            
//-----------------------------------------------------------------------------------
//  
//   Returns an array of bytes representing the ASCII equivalent of the string.
//
//      var u8rsp;
//      var temp  = "regOpForce:true";
//      u8rsp = stringToBytes(temp);
//
//      var outText = u8rsp[0].toString(16);    // Convert to hex output...
//      for( var i = 1; i < u8rsp.length; i++ )
//      {
//          outText = outText + " " + u8rsp[i].toString(16);
//      }
//      PrintLog(1,"          stringToBytes: " + outText );     --> stringToBytes: 72 65 67 4f 70 46 6f 72 63 65 3a 74 72 75 65
//
//
function stringToBytes(inString)
{
    var rtnBytes = [];

    for( var i = 0; i < inString.length; ++i ) 
    {
        rtnBytes.push(inString.charCodeAt(i));
    }
    
    return(rtnBytes);
}


//-----------------------------------------------------------------------------------
//
//
function bytesToString(array) 
{
    var rtnString = "";
  
    for( var i = 0; i < array.length; i++ ) 
    {
        rtnString += String.fromCharCode(array[i]);
    }
    return rtnString;
}

// ..................................................................................
var app = {
     
    // deviceready Event Handler
    //
    // PhoneGap is now loaded and it is now safe to make calls using PhoneGap
    //
    onDeviceReady: function() {
    	if(window.localStorage.getItem("deviceType")=="phone"){
    		window.plugins.orientationchanger.lockOrientation('portrait');
    	}
    	deviceHeight = document.documentElement.clientHeight;
		deviceWidth = document.documentElement.clientWidth;
    	if(ImRunningOnPhone!=false){
        if( window.device.platform != iOSPlatform)
        {
            // IOS did not like opening the file system this early, no error just stalled.
            OpenFileSystem();
    
            PrintLog(10,  "device ready:  Running on phone version: " + window.device.version + " parseFloat:" + parseFloat(window.device.version) );
        }
}
        
        isNxtyStatusCurrent = false;
        isNxtySnCurrent     = false;
        
        if( CFG_RUN_ON_SANDBOX )
        {
            myPlatformUrl = mySandboxPlatformUrl;
        }
        


        // Register the event listener if the back button is pressed...
        // This is not part of the GUI but the Android's hardware back button...
        document.addEventListener("backbutton", HandleBackKey, false);
        
        app.renderHomeView();
        
        // Start the GUI...
        StartGuiInterface();
       
        
        // Only start bluetooth if on a phone...
        if(ImRunningOnPhone!=false){
			if( window.device.platform == iOSPlatform )
			{
				OpenFileSystem();
			
				if (parseFloat(window.device.version) >= 7.0) 
				{
					StatusBar.hide();
				}
			} 
        }
        //OpenSouthBoundIf();
                
    },   
    renderHomeView: function() 
    {

        guiButtonSwDisabled     = true;
        guiButtonTkDisabled     = true;
        guiButtonRegDisabled    = true;
        guiIconRegDisabled      = true;
        
        uMainLoopCounter = 0;

            
        // if Phone, Check the OS version.
        // Android must be >= 4.4.2 for WebSocket and Bluetooth LE plugin
        // IOS     must be >= 7.1   for WebSocket and Bluetooth LE plugin.
        if(ImRunningOnPhone == true)
        {
            PrintLog(1, "Phone Model: " + window.device.model + "  OS: " + window.device.platform + " Ver: " + window.device.version );
            if( ((window.device.platform == androidPlatform) && (parseFloat(window.device.version) < 4.4))      ||
                ((window.device.platform == iOSPlatform)     && (parseFloat(window.device.version) < 7.1))      )
            {
                PrintLog(1, "Phone's Operating System is out of date.   Please upgrade to latest version." );
                
                ShowConfirmPopUpMsg(
                    'Phone Operating System is out of date.   Please upgrade to latest version.  Exiting Wave App.',    // message
                    HandleOsConfirmation,                   // callback to invoke with index of button pressed
                    'Update Phone Software',                // title
                    ['Ok'] );                               // buttonLabels
            } 
            else
            {
                // Start the handler to be called every second...
            	OpenSouthBoundIf();
                MainLoopIntervalHandle = setInterval(app.mainLoop, 1000 );
            } 
        }                
        else
        {
    		OpenSouthBoundIf();
            // Start the handler to be called every second...
            MainLoopIntervalHandle = setInterval(app.mainLoop, 1000 );
        }
        
        
        

//        PrintLog(1, "Screen density: low=0.75 med=1.0 high=1.5  This screen=" +  window.devicePixelRatio );    
        guiCurrentMode = PROG_MODE_MAIN;
    },


    initialize: function() 
    {
    	if(ImRunningOnPhone != true)
        {
            PrintLog(10, "running on desktop");
            this.onDeviceReady();
        }
        else
        {
            PrintLog(10, "running on phone");
            // Call onDeviceReady when PhoneGap is loaded.
            //
            // At this point, the document has loaded but phonegap-1.0.0.js has not.
            // When PhoneGap is loaded and talking with the native device,
            // it will call the event `deviceready`.
            // 
            document.addEventListener('deviceready', this.onDeviceReady, false);
        }
    },





    // V2 Main Loop.............................................................................
    mainLoop: function() 
    {
  
        PrintLog(4, "App: Main loop..." );
        
        if( bCheckSouthBoundIfOnStartup )
        {

            if( isSouthBoundIfStarted == false )
            {
              // Do nothing until interface has started...
              return;
            }
            else
            {
                // Interface is not connected...see if user enabled...
                if( isSouthBoundIfEnabled == false )
                {
                    if( uMainLoopCounter == 0 )
                    {
                        UpdateStatusLine( szSouthBoundIfEnableMsg );
                    }
                    
                    if( ++uMainLoopCounter >= 4 )
                    {
                        // Kill the app...
//                        navigator.app.exitApp();
                    }
                    
                    return;
                }
                else
                {
                    // Normal flow should come here once bluetooth has been enabled...
                    bCheckSouthBoundIfOnStartup = false;

                    // Privacy policy...
                    
                    if(window.localStorage.getItem("privacyPolicy")==null){
                    ShowConfirmPopUpMsg(
                        "Your privacy is important to us. Please refer to 'www.cel-fi.com/privacypolicy' for our detailed privacy policy.",    // message
                        HandlePrivacyConfirmation,      // callback to invoke with index of button pressed
                        'Privacy Policy',               // title
                        ['Ok'] );                       // buttonLabels
        
                    UpdateStatusLine("Privacy policy..."); 
                    }else{
                    	buttonIndex = 1;
                    	HandlePrivacyConfirmation(1);
                    }
                                       
                }
            }
        }
        
        if( bPrivacyViewed == false )
        {
          if( CFG_RUN_ON_SANDBOX )
          {
            var jText = "App sw: " + szVerApp + "(S)  Cel-fi BT sw: " + swVerBtScan;
          }
          else
          {
            var jText = "App sw: " + szVerApp + "(P)  Cel-fi BT sw: " + swVerBtScan;
          }
                
          UpdateStatusLine( jText );
          PrintLog(1, jText );
          
          return;
        }
        
        
        
        // ------------------------------------------------------------------------------------------
        if( isSouthBoundIfCnx )
        {
            // Get the Status message from the Unit..................................................
            if( isNxtyStatusCurrent == false )
            {
            	console.log(uMainLoopCounter);
            	if( uMainLoopCounter == 0 )
                {
                    // See if we have a network connection, i.e. WiFi, Cell or Ethernet.
                    isNetworkConnected = NorthBoundConnectionActive();
                    
                    // Start the spinner..
                    //ShowWaitPopUpMsg( "Please wait", "Syncing data..." );
                    util.showSearchAnimation();
                    util.deviceIdentified();
                }
                else if( uMainLoopCounter == 2 )
                {
                    // Wait at least 3 seconds after BT connection to make sure any pending NAKs are flushed...
                    // Make sure that whatever we are connected to is local and not redirected.
                    // This command will only work for V2 and higher, for V1 it will be dropped and NAKed.
                	ReadAddrReq( NXTY_PCCTRL_UART_REDIRECT );
//                    SetUartLocal();       // If NU is stuck using this super msg does not work
                }
                else if( uMainLoopCounter > 2 )
                {
                    // Get the status...returns build config which is used as model number
                    UpdateStatusLine("Retrieving model number...");
                    console.log("Readycnt: "+uTxMsgNotReadyCnt);
                    var u8TempBuff  = new Uint8Array(2);
                    u8TempBuff[0] = NXTY_PHONE_ICD_VER;
                    nxty.SendNxtyMsg(NXTY_STATUS_REQ, u8TempBuff, 1);
    
                    bNxtySuperMsgRsp = false;
                }
            } 

            // Get the local information from the unit that the BT is attached to, i.e. CU ..............
            else if( bNxtySuperMsgLocalInfo == false )
            {
                // Automatically update the NU and CU PIC software if the ICD is too old. 
                if( nxtyRxStatusIcd <= V1_ICD )
                {
                    PrintLog(1, "PIC software needs to be updated:  PIC ICD=" + nxtyRxStatusIcd  );
                    UpdateStatusLine("PIC SW Update Required...");
                
                    clearInterval(MainLoopIntervalHandle);  
                    StopWaitPopUpMsg();
                    
                    // Make sure that after the PIC update that we grab the new status so we can update the ICD version of the new PIC
                    isNxtyStatusCurrent = false;
                    
                    ShowConfirmPopUpMsg(
                        'PIC software is out of date.   Select Ok to update...',    // message
                        HandlePicUpdateConfirmation,                                // callback to invoke with index of button pressed
                        'Update PIC Software',                                      // title
                        ['Ok'] );                                                   // buttonLabels
                
                    // Pull the file from the WWW directory and write to the download directory...
                    // Use one file for both NU and CU.
                    var tempFileName = myInternalPicFileName + "_" + myInternalPicVer;
                    CopyFile("PIC.bin", tempFileName);
                    
                    return;
                }
                
            
                if( bNxtySuperMsgRsp == false )
                {
                    UpdateStatusLine("Retrieving Local Info...");
                    GetNxtySuperMsgInfo();
                }
                else
                {
                    bNxtySuperMsgLocalInfo = true;
                    bCnxToCu               = (nxtyRxStatusBoardConfig & IM_A_CU_MASK)?true:false;

                    // Get SKU, i.e. now the Model Number...
                    GetSkuFromUniqueId(); 
                }
            }    


            // Wait until the model number is retrieved from the Nextivity Server........................
            else if( myModel == null )
            {
                // Wait until we get the model number...
                return;
            }

            // Send first round of information to the cloud.............................................
            else if( bSendLocalInfoToCloud == false )
            {
                // We now have both the status and SN so notify the cloud that we are here...
                bSendLocalInfoToCloud = true;
                SendCloudAsset();
                SendCloudData( "'SerialNumber':'" + mySn + "'" );

            
                // Register for push notifications after we can communicate with the cloud
                // so we can send our regID.
                if( window.device.platform == androidPlatform )
                {
                    InitGcmPush('deviceready');
                    SendCloudData( "'DeviceType':'Android'" );
                }
                else if( window.device.platform == iOSPlatform )
                {
                    InitIosPush('deviceready');
                    SendCloudData( "'DeviceType':'IOS'" );                        
                }
                
                
                
                // Send the data to the cloud
                if( bCnxToCu )
                {
                    SendCloudData( "'SwVerCU_CF':'"  + SwPnNuCu + nxtySwVerCuCf  + "'" );
                    SendCloudData( "'SwVerCU_PIC':'" + SwPnPic  + nxtySwVerCuPic + "'" );
                    SendCloudData( "'SwVer_BT':'"    + SwPnBt   + nxtySwVerCuBt    + "', 'OperatorCode':'" + myOperatorCode + "'"  );
                }
                else
                {
                    SendCloudData( "'SwVerNU_CF':'"  + SwPnNuCu + nxtySwVerNuCf  + "'" );
                    SendCloudData( "'SwVerNU_PIC':'" + SwPnPic  + nxtySwVerNuPic + "'" );
// TBD                    SendCloudData( "'SwVerNU_BT':'"    + SwPnBt   + nxtySwVerNuBt    + "', 'OperatorCode':'" + myOperatorCode + "'"  );
                }
                
                SendCloudData( "'UniqueId':'"    + nxtyUniqueId + "'" );
                SendCloudData( "'SKU_Number':'" + mySku + "'" );
                
                GetNxtySuperMsgLinkStatus();
                    
                    
// jdo test
/*
var myTempSn = mySn;

SendCloudLocation( 32.987860, -117.074451 );  // 12230 World Trade Dr San Diego, CA 92128  32.987860, -117.074451

mySn = myTempSn + "A";
SendCloudLocation( 13.732985, 100.530522 );  // 319 Chamchuri Square, 15th Floor, Unit 1508 Phayathai Road, Pathumwan. Bangkok 10330 THAILAND   13.732985, 100.530522

mySn = myTempSn + "B";
SendCloudLocation( 48.182626, 16.391553 );  // Arsenal Objekt 24, A-1030 Vienna, Austria   48.182626, 16.391553

mySn = myTempSn + "C";
SendCloudLocation( 25.063614, 121.522526 );    // Ting Shou Trading Co., Ltd. Taipei City, Taiwan 112   25.063614, 121.522526


mySn = myTempSn + "D";
SendCloudLocation( 44.452074, 26.086728 );    //  Europe House Bd. Lascar Catargiu Nr. 47-53 Bucharest 1, Romania   44.452074, 26.086728


mySn = myTempSn;
*/
                    
                    
                    
                // Prepare to get the remote info...
                bNxtySuperMsgRsp    = false;
                uStateCounter       = 0;
                uRemoteStateCounter = 0;

            }
            
            // Wait here until the UNII is up...........................................................
            else if( bUniiUp == false )
            {
                uStateCounter++;
                
                if( uStateCounter < UNII_TRY_COUNTER_MAX )
                {
                    UpdateStatusLine("Checking Wireless link: " + uStateCounter + " of " + UNII_TRY_COUNTER_MAX ); 
                    GetNxtySuperMsgLinkStatus();
                }
                else
                {
                    // Clear the loop timer to stop the loop...
                    clearInterval(MainLoopIntervalHandle);
                    StopWaitPopUpMsg();
                    uMainLoopCounter = 0;
                    uStateCounter  = 0;
                    
                    var eText = "Wireless link between the Network Unit and Coverage Unit is down.  Please wait for the link to connect and try again.";
                    //UpdateStatusLine( eText + "<br>Cnx: " + myModel + ":" + mySn );            
                    ShowConfirmPopUpMsg(
                        eText,    // message
                        HandleUniiRetry,                    // callback to invoke with index of button pressed
                        'Wireless Link Down',               // title
                        ['Retry'] );                        // buttonLabels                                     
                
                }                    
            }


            // Get info from remote unit...................................................................................
            else if( bNxtySuperMsgRemoteInfo == false )
            {
                UpdateStatusLine("Retrieving Remote Info...");

                if( IsUartRemote() == false )     
                {
                    SetUartRemote();
                    uRemoteStateCounter = 1;               
                }
                else
                {
                    // The first time in this portion of the else we want to reset a couple of flags.
                    if( uRemoteStateCounter )
                    {
                        bNxtySuperMsgRsp    = false;
                        uRemoteStateCounter = 0;
                    }
                
                    // The UART should now be redirected to get remote data...
                    if( bNxtySuperMsgRsp == false )
                    {
                        GetNxtySuperMsgInfo();
                    }
                    else
                    {
                        bNxtySuperMsgRemoteInfo = true;
                        SetUartLocal();            // Cancel the UART redirect...
    
                        // Send the data to the cloud
                        if( !bCnxToCu )
                        {
                            SendCloudData( "'SwVerCU_CF':'"  + SwPnNuCu + nxtySwVerCuCf  + "'" );
                            SendCloudData( "'SwVerCU_PIC':'" + SwPnPic  + nxtySwVerCuPic + "'" );
                            SendCloudData( "'SwVer_BT':'"    + SwPnBt   + nxtySwVerCuBt    + "', 'OperatorCode':'" + myOperatorCode + "'"  );
                        }
                        else
                        {
                            SendCloudData( "'SwVerNU_CF':'"  + SwPnNuCu + nxtySwVerNuCf  + "'" );
                            SendCloudData( "'SwVerNU_PIC':'" + SwPnPic  + nxtySwVerNuPic + "'" );
    // TBD                        SendCloudData( "'SwVerNU_BT':'"    + SwPnBt   + nxtySwVerNuBt    + "', 'OperatorCode':'" + myOperatorCode + "'"  );
                        }
                        
                        
                    }
                    
                }
                
                                
            }
            
            
            // Bug #1337: Wait here until we gather the Tech Mode data and send to cloud.......................................................................
            else if( (guiGotTechModeValues == false) && (isNetworkConnected == true) )
            {
                if( bGatheringTechData == false )
                {
                    // Start gathering the tech mode data.............                    
                    StartGatheringTechData();
                    ShowWaitPopUpMsg( "Please wait", "Gathering data..." );
                }
            
                UpdateStatusLine("Gathering Tech Mode Data...");
            }            
            else 
            {

                // Clear the loop timer to stop the loop...
                clearInterval(MainLoopIntervalHandle);
                StopWaitPopUpMsg();
                uMainLoopCounter = 0;
                    
                if( isNetworkConnected == false )
                {
                    var eText = "Unable to connect to cloud, no WiFi or Cell available.";
                    ShowAlertPopUpMsg("Network Status.",  eText);
                    UpdateStatusLine( eText + "<br>Cnx: " + myModel + ":" + mySn );
                    ShowConfirmPopUpMsg(
                        eText,                               // message
                        HandleCloudRetry,                    // callback to invoke with index of button pressed
                        'No WiFi or Cell',                   // title
                        ['Retry'] );                         // buttonLabels                                     
                                                 
                }
                else if( (nxtyRxRegLockStatus == 0x01) || (nxtyRxRegLockStatus == 0x03) )     // State 2 (0x01) or state 4 (0x03):  Loc Lock bit set.
                {
                    var eText;
                    if( nxtyRxRegLockStatus == 0x01 )
                    {
                        eText = "Please call your service provider. (Reg State 2)";
                    }
                    else
                    {
                        eText = "Please call your service provider. (Reg State 4)";
                    }
                    ShowAlertPopUpMsg("Location Lock Set.",  eText);
                    UpdateStatusLine( eText + "<br>Cnx: " + myModel + ":" + mySn );                             
                }  
                else
                {
                
                    // No critical alerts so post the buttons....
                    guiButtonSwHtml = szSwButtonImg;
                    guiButtonTkHtml = szTkButtonImg;

                    // Enable the buttons...
                    guiButtonSwDisabled     = false;
                    guiButtonTkDisabled     = false;
                    guiMainButtonsDisabled  = false;
                    
                    // Fill in some GUI variables.....................................................
                    guiProductType  = GetProductTypeFromSku( mySku );
                    guiSerialNumber = mySn;
                    

                    UpdateStatusLine( "Select button...<br>Cnx: " + myModel + ":" + mySn );                             

                    if( (nxtyRxRegLockStatus == 0x0B) || (nxtyRxRegLockStatus == 0x07) )     // State 8 (0x0B) or 12 (0x07)
                    {
                        // Not registered............
                        isRegistered = false;                       
                        UpdateRegButton(0);     // Add the reg button.
                        UpdateRegIcon(0);       // Set reg ICON to not registered...
                        ShowAlertPopUpMsg("Registration Required.", "Please re-register your device by selecting the register button.");
                    }                            
                    else if( (nxtyRxRegLockStatus == 0x09) ||                                   // State 6 (0x09)
                             (nxtyRxRegLockStatus == 0x04) || (nxtyRxRegLockStatus == 0x05) )   // State 9 (0x04) or 10 (0x05)
                    {
                        // Not registered............
                        isRegistered = false;                       
                        UpdateRegButton(0);     // Add the reg button.
                        UpdateRegIcon(0);       // Set reg ICON to not registered...
                        //ShowAlertPopUpMsg("Registration Required.", "Please register your device by selecting the register button.");
                        ShowAlertPopUpMsg("Registration Required.", "Please register your device.");
                    }
                    else
                    {
                        if( nxtyRxRegLockStatus & 0x02 )
                        {
                            isRegistered = true;    
                            UpdateRegIcon(1);       // Set reg ICON to Registered...
                            UpdateRegButton(1);     // Remove the reg button.
                        }
                    }
                                                            
                    
                    // Look at the registered status to update the cloud.   Must wait until after the nxtyRxRegLockStatus check above
                    // so the logic will update the isRegistered variable.
                    if( isRegistered )
                    {
                        SendCloudData( "'Registered':" + 1 );
                    }
                    else
                    {
                        SendCloudData( "'Registered':" + 0 );
                    }
                
                    // Start a timer to check the UNII status every so often...  
//                    checkUniiStatusMainTimer = setTimeout(CheckUniiStatusMain, 5000);
  
                    // Start gathering tech data.  Note that the UNII is also checked every so often...                  
//                    StartGatheringTechData();
                    
                
                } 
            }  // End of else


           
          
            uMainLoopCounter++;
            
            if( uMainLoopCounter > MAIN_LOOP_COUNTER_MAX )
            {
                // Clear the loop timer to stop the loop...
                clearInterval(MainLoopIntervalHandle);
                StopWaitPopUpMsg();
                
                var     eTxt                                     = "Unable to sync data...";
                if( isNxtyStatusCurrent == false )          eTxt = "Unable to get Model Number from Cel-Fi";
                else if( nxtySwVerNuCf   == null )          eTxt = "Unable to get NU SW Ver from Cel-Fi";
                else if( nxtySwVerCuCf == null )            eTxt = "Unable to get CU SW Ver from Cel-Fi";
                else if( nxtySwVerCuPic == null )           eTxt = "Unable to get CU PIC SW Ver from Cel-Fi";
                else if( nxtySwVerNuPic == null )           eTxt = "Unable to get NU PIC SW Ver from Cel-Fi";
                else if( nxtySwVerCuBt == null )              eTxt = "Unable to get BT SW Ver from Cel-Fi";
                else if( nxtyUniqueId == null )             eTxt = "Unable to get Unique ID from Cel-Fi";
                
                
                ShowAlertPopUpMsg("Timeout",  eTxt);
                UpdateStatusLine( "Timeout: " + eTxt );
            }

        }   // End if( isSouthBoundIfCnx )

        
    }, // End of MainLoop()

};




// GetSkuFromUniqueId.............................................................................................................
function GetSkuFromUniqueId() 
{ 
//    var wsUri = "ws://echo.websocket.org/";           // Echo server
//    var wsUri = "ws://172.16.10.151:443/";            // Test server
//    var wsUri = "ws://nxt-rdhk:443/";                 // Nextivity server (internal)
    var wsUri = "ws://celfi.nextivityinc.com:443/";     // Nextivity server (external)
    
    PrintLog(1, "WS: GetSkuFromUniqueId()");
     
    websocket = new WebSocket(wsUri); 
    websocket.onopen = function(evt) { onOpen(evt) }; 
    websocket.onclose = function(evt) { onClose(evt) }; 
    websocket.onmessage = function(evt) { onMessage(evt) }; 
    websocket.onerror = function(evt) { onError(evt) }; 
}  

function onOpen(evt) 
{ 
    PrintLog(1, "WS: CONNECTED"); 

    var u8UniqueIdBuff = new Uint8Array(
    [
        0,0,0,0,0,0,0,0,                                            // Unique ID LSB first...

        0x46, 0x32, 0xa5, 0x22, 0xe8, 0xbb, 0x40, 0xae,             // User hash for user "anonymous", LSB first

        0x35, 0xe0, 0xca, 0xb5, 0xc9, 0x1d, 0xe8, 0x70, 0x0d, 0xed, 0x52, 0x20, 0x44, 0x2c, 0xb8, 0x6d, 
        0x81, 0xf4, 0x07, 0xc3, 0x67, 0x8b, 0xd1, 0x8e, 0x40, 0xbf, 0x7b, 0xf1, 0xaf, 0x5a, 0xd5, 0xd4,           // Password hash for user "anonymous", LSB first
         
        0xff, 0xff, 0xff, 0xff,                                     // Version of the client tool, since we don't want updates via this mechanism I make this max
        0xFE                                                        // The magic opcode to request a partnumber
    ]);

    // Unique ID LSB first....
    u8UniqueIdBuff[0] = u8UniqueId[7];
    u8UniqueIdBuff[1] = u8UniqueId[6];
    u8UniqueIdBuff[2] = u8UniqueId[5];
    u8UniqueIdBuff[3] = u8UniqueId[4];
    u8UniqueIdBuff[4] = u8UniqueId[3];
    u8UniqueIdBuff[5] = u8UniqueId[2];
    u8UniqueIdBuff[6] = u8UniqueId[1];
    u8UniqueIdBuff[7] = u8UniqueId[0];

    PrintLog(1, "WS: Sent part number request for UniqueId: " + nxtyUniqueId);
    websocket.send(u8UniqueIdBuff);
}  

function onClose(evt) 
{ 
    PrintLog(1, "WS: DISCONNECTED"); 
}  

function onMessage(evt) 
{ 
    if( evt.data instanceof Blob )
    {
//        PrintLog(1, "WS: Blob RESPONSE stringify: " + JSON.stringify(evt.data) );

        var arrayBuffer;
        var fileReader = new FileReader();
        fileReader.onload = function() 
        {
            arrayBuffer = this.result;
            var u8Rcvd  = new Uint8Array(arrayBuffer);
            
            var outText = u8Rcvd[0].toString(16);
            mySku       = String.fromCharCode(u8Rcvd[0]); 
            for( var i = 1; i < u8Rcvd.length; i++ )
            {
                outText += " " + u8Rcvd[i].toString(16);
                mySku   += String.fromCharCode(u8Rcvd[i]);
            }

            myModel = mySku;
            PrintLog(1, "WS: u8Rcvd: " + outText + "  SKU: " + mySku + "  Model Number: " + myModel );
            
        };
        fileReader.readAsArrayBuffer(evt.data);        
        
    }
    else
    {
        PrintLog(1, "WS: Text RESPONSE: " + evt.data );
    } 
    websocket.close(); 
}  

function onError(evt) 
{ 
    PrintLog(1, "WS: ERROR: " + evt.data); 
}  
// End GetSkuFromUniqueId..........................................................................................................


// GetProductTypeFromSku...........................................................................................................
function GetProductTypeFromSku(tempSku) 
{ 
    var tempProd = "";

    // sku looks like "590NP34...etc"                    
    if( tempSku.search("P34") == 4 )
    {
        tempProd = "PRO";    
    }
    else if( tempSku.search("D32") == 4 )
    {
        tempProd = "DUO";    
    }
    else if( tempSku.search("S32") == 4 )
    {
        tempProd = "PRIME";    
    }
    else if( tempSku.search("G31") == 4 )
    {
        tempProd = "GO";    
    }
    else if( tempSku.search("T34") == 4 )
    {
        tempProd = "TREO";    
    }
    else
    {
        tempProd = "Unknown";    
    }

    return( tempProd );
}    
