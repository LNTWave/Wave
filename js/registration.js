//=================================================================================================
//
//  File: registration.js
//
//  Description:  This file contains the functions necessary for registering our product.
//
//=================================================================================================

var RegLoopIntervalHandle   = null;
var    regState                = REG_STATE_DONE;
var regSubState             = 0;
var u8rsp                   = null;


const REG_STATE_INIT                        = 1;
const REG_STATE_CHECK_CELL_SEARCH_COMPLETE  = 2;
const REG_STATE_CELL_INFO_REQ               = 3;
const REG_STATE_CELL_INFO_RSP               = 4;
const REG_STATE_OPER_REG_RSP                = 5;
const REG_STATE_REGISTRATION_RSP            = 6;
const REG_STATE_DONE                        = 7;


const regStateNames                 = ["N/A", "Init", "Cell Search Complete", "Cell Info Req", "Cell Info Rsp", "Oper Reg Rsp - Wait on Cloud", "Reg Rsp - Wait on Cel-Fi"];



const REG_NAK_COUNT_MAX             = 2;
const REG_LOOP_COUNT_MAX            = 20;


// Values for RegSupportData
const REG_SUPPORT_DATA_TYPE_MASK        = 0xF000;
const REG_SUPPORT_DATA_TYPE_CELL_SEARCH = 0x4000;

// Percentage per stage provided by JC.
const stagePercentArray = [0, 50/1800, 100/1800, 150/1800, 300/1800, 300/1800, 100/1800, 0, 800/1800];



// Reg data items shared with cloud..
var myPlmnid                    = "no plmind";
var myRegDataToOp               = "registration data to operator";
var myRegDataFromOp             = null;
var myRegOpForce                = null;

var regTimeoutCount             = 0;
var RegNakCount                 = 0;






// Geolocation Callbacks
// HandleConfirmLocation.......................................................................................
// process the confirmation dialog result
function HandleConfirmLocation(buttonIndex) 
{
    // buttonIndex = 0 if dialog dismissed, i.e. back button pressed (do nothing).
    // buttonIndex = 1 if 'Yes' to use location information.
    // buttonIndex = 2 if 'No'
    if( buttonIndex == 1 )
    {
        // Request location...
        ShowWaitPopUpMsg( "Please wait", "Acquiring location information..." );
        
//        var options = {maximumAge: 0, timeout: 10000, enableHighAccuracy:true};
//        var options = { timeout: 31000, enableHighAccuracy: true, maximumAge: 90000 };
//        navigator.geolocation.getCurrentPosition(geoSuccess, geoError, options);
        navigator.geolocation.getCurrentPosition(geoSuccess, geoError, {timeout:10000});

    }
    
    // No:  Do not use location information so return to main menu immediately...
    if( buttonIndex == 2 )
    {
        //reg.handleBackKey();
    	RequestModeChange(PROG_MODE_TECH);
    }        
}



// This method accepts a Position object, which contains the
// current GPS coordinates
//
function geoSuccess(position) 
{
    StopWaitPopUpMsg();
    SendCloudLocation( position.coords.latitude, position.coords.longitude );
//    ShowAlertPopUpMsg("Location Determined.",  "Lat:Long " + position.coords.latitude + ":" + position.coords.longitude );
    
    /*ShowConfirmPopUpMsg(
        "Lat:Long " + position.coords.latitude + ":" + position.coords.longitude,    // message
        HandleLocationBack,             // callback to invoke with index of button pressed
        'Location Acquired',            // title
        ['ok'] );                       // buttonLabels*/
    
    
    
/*    
    alert('Latitude: '          + position.coords.latitude          + '\n' +
          'Longitude: '         + position.coords.longitude         + '\n' +
          'Altitude: '          + position.coords.altitude          + '\n' +
          'Accuracy: '          + position.coords.accuracy          + '\n' +
          'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
          'Heading: '           + position.coords.heading           + '\n' +
          'Speed: '             + position.coords.speed             + '\n' +
          'Timestamp: '         + position.timestamp                + '\n');
*/          
}


// geoError Callback receives a PositionError object
//
function geoError(error) 
{
    StopWaitPopUpMsg();
//    ShowAlertPopUpMsg("Unable to acquire GPS.",  "No location information will be stored." );

    ShowConfirmPopUpMsg(
        "No location information will be stored.",    // message
        HandleLocationBack,             // callback to invoke with index of button pressed
        'Unable to acquire GPS.',            // title
        ['ok'] );                       // buttonLabels
    
//    ShowAlertPopUpMsg( "Unable to acquire GPS.", "Uncode: " + error.code + " msg: " + error.message );
          
}


function HandleLocationBack(buttonIndex) 
{
    // Just go back...
    reg.handleBackKey();
}

function ProcessRegistration( firstName, lastName, addr1, addr2, city, state, zip, country, phone )
{
    // Send the mandatory user information to the cloud...
    SendCloudData( "'firstName':'"    + firstName + 
                   "', 'lastName':'"  + lastName  +
                   "', 'addr_1':'"    + addr1     +
                   "', 'city':'"      + city      +
                   "', 'state':'"     + state     +
                   "', 'zip':'"       + zip       +
                   "', 'country':'"   + country   +
                   "', 'phone':'"     + phone     + "'" );
    
    // Send optional data if available...                
    if( addr2 != "" )
    {
         SendCloudData( "'addr_2':'" + addr2 + "'" );
    }

    // Start the registration...
    if( isRegistered == false )
    {
        if( regState == REG_STATE_DONE )
        {
            regState = REG_STATE_INIT;
            reg.RegLoop();
        }
    }
    else
    {
        ShowAlertPopUpMsg("Already Registered.", "No need to re-register.");
    }
}


var reg = {

    // Handle the Back key
    handleBackKey: function()
    {
        PrintLog(1, "");
        PrintLog(1, "Reg: Reg Mode Back key pressed--------------------------------------------------");
             
        if( isRegistered == false )
        {
            // Save any typed data in case user comes back...
            SaveRegFormData();
        }

        clearInterval(RegLoopIntervalHandle);
        regState = REG_STATE_DONE;      
        //app.renderHomeView();
        util.closeApplication();
    },


    
    renderRegView: function() 
    {    
        guiRegistrationPercent = -1;
        guiCurrentMode         = PROG_MODE_REGISTRATION;
        regState               = REG_STATE_DONE;
        DisplayLoop();
    },


    RegLoop: function() 
    {
        var u8Buff  = new Uint8Array(20);
        
        regTimeoutCount += 1;
        
        // Always report this loop since so many substates with V2 protocol...
        PrintLog(1, "Reg: Reg loop... state = " + regStateNames[regState] + " substate=" + regSubState );
        
        switch( regState )
        {
            case REG_STATE_INIT:
            {
                UpdateStatusLine("Verifying System Information...");
                ShowWaitPopUpMsg("Validation..", "Verifying System Information...");
                regState              = REG_STATE_CHECK_CELL_SEARCH_COMPLETE;
                 RegLoopIntervalHandle = setInterval(reg.RegLoop, 1000 );
                regTimeoutCount       = 0;
                RegNakCount           = 0;
                 
                 // Make sure that the action is false so the watching event will see a false to true transition.
                 SendCloudData(  "'regAction':'false'" );

                // Get the Reg Data from the CU...
                GetNxtySuperMsgParamSelect( NXTY_SEL_PARAM_REG_SUPPORT_DATA, NXTY_SEL_PARAM_REG_SUPPORT_DATA );       
                break; 
            }


            case REG_STATE_CHECK_CELL_SEARCH_COMPLETE:
            {
                // Wait in this state until the Cel-Fi unit is in PLACE state or greater, i.e. Cell Search Complete...
                if( bNxtySuperMsgRsp == true )
                {
                    if( (nxtySelParamRegOneRsp & REG_SUPPORT_DATA_TYPE_MASK) == REG_SUPPORT_DATA_TYPE_CELL_SEARCH )
                    {
                        PrintLog(1, "RegSupportData: 0x" + nxtySelParamRegOneRsp.toString(16) );
                                            
                        // Update the progress bar with the current status...
                        var i;
                        var currentStage    = ((nxtySelParamRegOneRsp & 0x00F0) >> 4);
                        const maxStage      = 8;
                        var percentComplete = 0;
                        
                        // Limit to the max number of stages to 8
                        if( currentStage > maxStage )
                        {
                            currentStage = maxStage;
                        }
                        
                        // Add the percent per stage up to the current stage.
                        for( i = 0; i <= maxStage; i++ )
                        {
                            if( i < currentStage )
                            {
                                percentComplete += stagePercentArray[i];
                            }
                        }

                        // Convert from decimal to percent...
                        percentComplete *= 100;
                        
                        
                        // Add the current stage percentage...
                        percentComplete += ((nxtySelParamRegOneRsp & 0x000F) * 10) * stagePercentArray[currentStage];
                        
                        // Round to the nearest integer...
                        percentComplete = Math.round(percentComplete);
                        
                        if( percentComplete > 100 )
                        {
                            percentComplete = 100;
                        }
                        
                        // Update the progress bar...
                        guiRegistrationPercent = percentComplete;
                        
//                        document.getElementById('pbar_id').value = percentComplete;
//                        $('.progress-value').html(percentComplete + '%');
                        
                        
                        // Request updated status from CU...
                        GetNxtySuperMsgParamSelect( NXTY_SEL_PARAM_REG_SUPPORT_DATA, NXTY_SEL_PARAM_REG_SUPPORT_DATA );       

                        
                        // Do not time out of this state as Cell Search can take up to 1 hour...
                        regTimeoutCount = 0;
                    }
                    else
                    {
                        // Unit is no longer in Cell Search so remove progress bar and go to the next step.
//                        document.getElementById("p_id").innerHTML = ""; 
                        guiRegistrationPercent = -1;
                        regState               = REG_STATE_CELL_INFO_REQ;
                        regTimeoutCount        = 0;
                    }
                

                }
                else if( msgRxLastCmd == NXTY_NAK_RSP )
                {   
                    // Try again if CRC NAK...
                    if( (nxtyLastNakType == NXTY_NAK_TYPE_CRC) || (nxtyLastNakType == NXTY_NAK_TYPE_TIMEOUT) )
                    {
                        if( RegNakCount++ >= REG_NAK_COUNT_MAX )
                        {
                            clearInterval(RegLoopIntervalHandle);
                            regState = REG_STATE_DONE;
                            StopWaitPopUpMsg();
                            UpdateStatusLine("Failed to receive response from Cel-Fi device.");
                            ShowAlertPopUpMsg((nxtyLastNakType == NXTY_NAK_TYPE_CRC)?"CRC Error Max.":"Timeout", "Failed to receive response from Cel-Fi device." );
                        }
                        else
                        {
                            // Try again...
                            GetNxtySuperMsgParamSelect( NXTY_SEL_PARAM_REG_SUPPORT_DATA, NXTY_SEL_PARAM_REG_SUPPORT_DATA );       
                        }
                    }
                }

                
                // Safety exit...
                if( regTimeoutCount >= REG_LOOP_COUNT_MAX )
                {
                    // after so many times exit stage left...
                    clearInterval(RegLoopIntervalHandle);
                    regState = REG_STATE_DONE;
                        
                    StopWaitPopUpMsg();
                    UpdateStatusLine("Timeout: Failed to receive response from Cel-Fi device.");
                    ShowAlertPopUpMsg("Timeout.", "No response from Cel-Fi device.");
                }

                regSubState = 0;
                break;
            }



            // Request the CELL information from the Cel-Fi unit.
            case REG_STATE_CELL_INFO_REQ:
            {
                if( regSubState == 0 )                   // Check for UNII up
                {
                    if( bUniiUp == false )
                    {
                        GetNxtySuperMsgLinkStatus();
                    }
                    else
                    {
                        UpdateStatusLine("Requesting Cell Info from Cel-Fi device.");
                        ShowWaitPopUpMsg("Registering...", "Requesting Cell Info...");
                        
                        regSubState = 1;
                    }
                }
                else if( regSubState == 1 )              // Redirect UART to Remote unit
                {
                    if( (IsUartRemote() == false) && (bCnxToOneBoxNu == false) )     
                    {
                        SetUartRemote();
                    }
                    else
                    {
                        regSubState = 2;
                    }
                }
                else if( regSubState == 2 )              // Tell NU to gather Cell Info
                {
                    // Send to Ares...
                    nxtyReadAddrRsp = CLOUD_INFO_CELL_REQ_CMD;                  // Prime the read response
                    WriteAddrReq( NXTY_PCCTRL_CLOUD_INFO, CLOUD_INFO_CELL_REQ_CMD );
                    regSubState  = 3;
                }
                else if( regSubState == 3 )              // Wait until cell data has been gathered...
                {
                    if( bWriteAddrRsp )
                    {
                        if( (nxtyReadAddrRsp & CLOUD_INFO_CMD_RSP_BIT) != 0 )
                        {
                            // Data is ready in the NU, go get it...
                            ReadDataReq( nxtyNuCloudBuffAddr, 252, READ_DATA_REQ_CELL_INFO_TYPE );
                            regState    = REG_STATE_CELL_INFO_RSP;
                            regSubState = 0;
                            RegNakCount = 0;                            
                        }
                        else
                        {
                            // Check again to see if page is ready...
                            ReadAddrReq( NXTY_PCCTRL_CLOUD_INFO );
                        }
                    }
                        
                }
            
            
                // Safety exit...
                if( regTimeoutCount >= REG_LOOP_COUNT_MAX )
                {
                    // after so many times exit stage left...
                    clearInterval(RegLoopIntervalHandle);
                    regState = REG_STATE_DONE;
                        
                    StopWaitPopUpMsg();
                    UpdateStatusLine("Timeout: Failed to receive response from Cel-Fi device.");
                    ShowAlertPopUpMsg("Timeout.", "No response from Cel-Fi device.");
                }
                
                break;
            }
            
            
            
            // Wait in this state until the Cel-Fi unit responds...
            case REG_STATE_CELL_INFO_RSP:
            {
                if( bReadDataRsp == true )
                {
                    if( myRegDataToOp == "Cell data not available" )
                    {
                        // Cell data not available...
                        clearInterval(RegLoopIntervalHandle);
                        regState = REG_STATE_DONE;
                        StopWaitPopUpMsg();
                        
                        UpdateStatusLine("Registration unavailable.  Please try again later.");
                        ShowAlertPopUpMsg("Registration unavailable.", "Searching for cell information.  Please try again later.");                        
                    }
                    else
                    {
                        // We have received the response from the Cel-Fi unit..
                        // Send the data from the Cel-Fi unit to the cloud...
                        var myText = "'plmnid':'"        + myPlmnid      + "', " +
                                     "'regDataToOp':'"   + myRegDataToOp + "', " +
                                     "'regDataFromOp':'0', "                   +        // Fill return with 0
                                     "'regAction':'true'";                              // Fire the event.
                        
                        SendCloudData( myText );
                            
                        UpdateStatusLine("Waiting for Operator response ... ");
                        ShowWaitPopUpMsg("Registering...", "Requesting Operator Info...");
                        regState        = REG_STATE_OPER_REG_RSP;
                        regTimeoutCount = 0;
                        RegNakCount     = 0;
                        myRegOpForce    = null;                    
                        myRegDataFromOp = null;
                        regSubState     = 0;
                    }
                }
                else if( msgRxLastCmd == NXTY_NAK_RSP )
                {   
                    // Try again if CRC NAK...
                    if( nxtyLastNakType == NXTY_NAK_TYPE_CRC )
                    {
                        regState    = REG_STATE_CELL_INFO_REQ;
                        regSubState = 0;
                        
                        if( RegNakCount++ >= REG_NAK_COUNT_MAX )
                        {
                            clearInterval(RegLoopIntervalHandle);
                            regState = REG_STATE_DONE;
                            
                            StopWaitPopUpMsg();
                            UpdateStatusLine("Failed to receive Cell-Info response from Cel-Fi device due to CRC error.");
                            ShowAlertPopUpMsg("CRC Error Max.", "Failed to receive Cell-Info response from Cel-Fi device.");
                        }
                    }
                }

                
                // Safety exit...
                if( regTimeoutCount >= REG_LOOP_COUNT_MAX )
                {
                    // after so many times exit stage left...
                    clearInterval(RegLoopIntervalHandle);
                    regState = REG_STATE_DONE;
                    
                    StopWaitPopUpMsg();
                    UpdateStatusLine("Failed to receive Cell Info from Cel-Fi device.");
                    ShowAlertPopUpMsg("Timeout.", "No Cell Info response from Cel-Fi device.");
                }
                break;
            }
            
            
            // Wait on response from the cloud, i.e. Egress response...
            case REG_STATE_OPER_REG_RSP:     
            {
                // Poll the cloud...
                if( myRegOpForce == null )
                {
                    SendCloudPoll();
                    UpdateStatusLine("Waiting for Operator response ... " + regTimeoutCount );

                    // Talk to the NU while waiting here to keep the UART redirect from timing out...
                    GetNxtySuperMsgLinkStatus();
                }
                else
                {
                    if( regSubState == 0 )                   // Redirect UART to Remote unit, should already be redirected.
                    {
                        if( (IsUartRemote() == false) && (bCnxToOneBoxNu == false) )     
                        {
                            SetUartRemote();
                        }
                        else
                        {
                            regSubState = 1;
                        }
                    }
                    else if( regSubState == 1 )              // Start the download to the NU
                    {
                        // Grab the data from the cloud, i.e. operator...
                        PrintLog(1, "Egress: regOpForce = " + myRegOpForce );
                        
                        
                        if( myRegOpForce == 'true' )
                        {   
                            var temp  = "regOpForce:true";
                            u8rsp = stringToBytes(temp);
                        }
                        else
                        {
                            var temp  = "regOpForce:false";
                            u8rsp = stringToBytes(temp);      
//                            u8rsp = stringToBytes(myRegDataFromOp);
                        } 
    
                        
                        // Send a message to the Cel-Fi unit to start downloading...
                        var u8TempBuff  = new Uint8Array(20);
                        var u8Len       = u8rsp.length;
                        u8TempBuff[0]   = NXTY_SW_NONE_TYPE;   
                        u8TempBuff[1]   = (nxtyNuCloudBuffAddr >> 24);    // Note that javascript converts var to INT32 for shift operations.
                        u8TempBuff[2]   = (nxtyNuCloudBuffAddr >> 16);
                        u8TempBuff[3]   = (nxtyNuCloudBuffAddr >> 8);
                        u8TempBuff[4]   = nxtyNuCloudBuffAddr;
                        u8TempBuff[5]   = (u8Len >> 24);                  // Note that javascript converts var to INT32 for shift operations.
                        u8TempBuff[6]   = (u8Len >> 16);
                        u8TempBuff[7]   = (u8Len >> 8);
                        u8TempBuff[8]   = (u8Len >> 0);
                        
                        nxty.SendNxtyMsg(NXTY_DOWNLOAD_START_REQ, u8TempBuff, 9);
                        
                        regSubState     = 2;
                    }
                    else if( regSubState == 2 )              // Wait for Start Download Response
                    {
                        // Wait in this state until the Cel-Fi unit responds...
                        if( window.msgRxLastCmd == NXTY_DOWNLOAD_START_RSP )
                        {
                            // Move on to next state...
                            regSubState     = 3;
                            regTimeoutCount = 0;
                        }
                        else if( window.msgRxLastCmd == NXTY_NAK_RSP )
                        {
                            // Try again...do not clear regSubState to allow NAKs to time out if multiple.   
                            regSubState  = 1;
                        }

                    }
                    else if( regSubState == 3 )              // Send Download data
                    {
                        var u8TempBuff  = new Uint8Array(NXTY_MED_MSG_SIZE);
    
                        u8TempBuff[0]   = NXTY_DOWNLOAD_MAX_SIZE;       // Chunksize: Indicate 128 bytes of data, mostly 0's
                    
                        // Start with 1 to account for u8TempBuff[0] set to chunksize
                        for( i = 0; i < u8rsp.length; i++ )
                        {
                            u8TempBuff[i+1] = u8rsp[i];
                        }
    
    
                        // Send a message to the Cel-Fi unit with data...
                        nxty.SendNxtyMsg(NXTY_DOWNLOAD_TRANSFER_REQ, u8TempBuff, (u8rsp.length + 1));

                        UpdateStatusLine("Authenticating ... ");
                        ShowWaitPopUpMsg("Registering...", "Authenticating...");
                        
                        // Move on to next state...
                        regSubState     = 4;
                        regTimeoutCount = 0;                        
                    }
                    else if( regSubState == 4 )              // Wait for Download Xfer Response
                    {
                        // Wait in this state until the Cel-Fi unit responds...
                        if( window.msgRxLastCmd == NXTY_DOWNLOAD_TRANSFER_RSP )
                        {
                        
                            // Send a Download End...
                            var u8TempBuff  = new Uint8Array(2);
                            u8TempBuff[0] = 0;                      // No reset
                            nxty.SendNxtyMsg(NXTY_DOWNLOAD_END_REQ, u8TempBuff, 1);
                        
                            // Move on to next state...
                            regSubState     = 5;
                            regTimeoutCount = 0;
                        }
                        else if( window.msgRxLastCmd == NXTY_NAK_RSP )
                        {
                            // Try again...do not clear regSubState to allow NAKs to time out if multiple.   
                            regSubState  = 3;
                        }

                    }
                    else if( regSubState == 5 )              // Set Reg Req bit so NU will read buffer and process
                    {
                        // Wait in this state until the Cel-Fi unit responds...
                        if( window.msgRxLastCmd != NXTY_WAITING_FOR_RSP )
                        {
                            // Send to Ares...
                            nxtyReadAddrRsp = CLOUD_INFO_REG_REQ_CMD;                  // Prime the read response
                            WriteAddrReq( NXTY_PCCTRL_CLOUD_INFO, CLOUD_INFO_REG_REQ_CMD );
                            
                            // Move on to next state...
                            regSubState     = 6;
                        }                        
                    }
                    else if( regSubState == 6 )              // Wait until reg req has been processed...
                    {
                        if( bWriteAddrRsp )
                        {
                            // Move on to next state...
                            InitGetRegLockStatus();
                            regSubState     = 7;
                        }
                    }
                    else if( regSubState == 7 )              // Get updated RegLock bits...
                    {
                        if( GetRegLockStatus() == true )
                        {
                            if( nxtyRxRegLockStatus & 0x02 )
                            {
                               // Registered...
                               UpdateRegIcon(1);
                               UpdateRegButton(1);     // Do not display the reg button.
                            }
                            else
                            {
                               // Not registered...
                               UpdateRegIcon(0);
                               UpdateRegButton(0);     
                            }
                            
                            // move on
                            regState        = REG_STATE_REGISTRATION_RSP;
                            regTimeoutCount = 0;
                            regSubState     = 0;
                        }
                            
                    }
                    

                }

                // Safety exit...
                if( regTimeoutCount >= REG_LOOP_COUNT_MAX )
                {
                    // after so many times exit stage left...
                    clearInterval(RegLoopIntervalHandle);
                    regState = REG_STATE_DONE;
                    
                    StopWaitPopUpMsg();
                    
                    if( myRegOpForce == null )
                    {
                        UpdateStatusLine("Failed to receive response from Operator.");
                        ShowAlertPopUpMsg("Timeout.", "No response from Operator." );
                    }
                    else
                    {
                        UpdateStatusLine("Failed to receive response from Cel-Fi Unit.");
                        ShowAlertPopUpMsg("Timeout.", "No response from Cel-Fi Unit.");
                    }
                    
                }

                break;
            }

            
            case REG_STATE_REGISTRATION_RSP:
            {
                // Stop the rotating wheel...
                StopWaitPopUpMsg();
                
                // Make sure that we are back local...
                SetUartLocal();
                
                
                if( isRegistered )
                {
                    UpdateStatusLine("Registration successful...");
                    var d = new Date();
                    SendCloudData( "'RegDate':'" + d.toLocaleDateString() + "'" );
                    SendCloudData( "'Registered':" + 1 );
                    
                    
                    ShowConfirmPopUpMsg(
                        'Registration successful.  Provide location information?',    // message
                        HandleConfirmLocation,              // callback to invoke with index of button pressed
                        'Location',                         // title
                        ['Yes', 'No'] );                    // buttonLabels
                    
                }
                else
                {
                    UpdateStatusLine("Registration not successful...");
                    SendCloudData( "'Registered':" + 0 );
                    
                }
                clearInterval(RegLoopIntervalHandle);
                regState = REG_STATE_DONE;
                    
                break;
            }
            
            
            
            case REG_STATE_DONE:
            default:
            {
//                  clearInterval(RegLoopIntervalHandle);
                break;
            }
        }
        
        

        
    },
};






    
