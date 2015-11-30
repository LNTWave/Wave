//=================================================================================================
//
//  File: settings.js
//
//  Description:  This file contains the functions necessary for processing the setting of 
//                various controls in the unit:
//                  - Antenna configuration
//
//=================================================================================================
// 
//
//      On Entry Flow.........
//          - User selects Antenna from main menu...
//          1) Read global flags to determine status of Auto/Manual.
//          2) Read Ant status
//
//      Manual Ant selection Flow.........
//          - User makes antenna selection..
//          - Ok to UART redirect to NU, i.e. 5 second timer expired...
//            - Write to Global Flags value to set hardware.  0xF1ACxxxx
//              - Disable all radio buttons.
//            - Read from Global Flags until value and 0xFFFFFF00 is 0.   
//            - Read Ant status: Read SelParamReg AntennaStatus.
//              - Enable radio buttons. 
//            - Read from Global Flags again to get latest status. 
//          - Start 5 second UART redirect timer. 


var StgLoopIntervalHandle       = null;
var StgState                    = null;
var StgTimeoutCount             = 0;
var antCode                     = 0;
var bOkToRedirectUart           = true;
var uartRedirectTimeout         = null;
var checkUniiStatusStgTimer     = null;
const UART_REDIRECT_TIMER_MS    = 6000;


const   MAX_bdS               = 44;
const   bdFreqMHz             = [   0, 2100, 1900, 1800, 1700,  850,    6, 2600,  900, 1800, 1700,  // bds  0 to 10
                                       1500,  700,  700,  700,   15,   16,  700,  850,  850,  800,  // bds 11 to 20
                                       1500, 3500, 2000, 1600, 1900,  850,  850,  700,  700, 2300,  // bds 21 to 30   
                                        450, 1500, 2100, 2100, 1900, 1900, 1900, 2600, 1900, 2300,  // bds 31 to 40
                                       2500, 3500, 3700,  700 ];                                    // bds 41 to 44
const   STG_LOOP_COUNT_MAX      = 25;


const   STG_STATE_READ_GLOBAL_FLAGS_ON_ENTRY    = 1;
const   STG_STATE_SET_ANT                       = 2;
const   STG_STATE_WAIT_FOR_SET_ANT              = 3;
const   STG_STATE_READ_GLOBAL_FLAGS             = 4;
const   STG_STATE_WAIT_FOR_ANT_STATUS           = 5;
const   STG_STATE_WAIT_FOR_GLOBAL_FLAGS         = 6;
const   STG_STATE_READ_UNII_BLOCK_LIST          = 7;
const   STG_STATE_WAIT_READ_UNII_BLOCK_LIST     = 8;
const   STG_STATE_SET_UNII_BLOCK_LIST           = 9;
const   STG_STATE_WAIT_SET_UNII_BLOCK_LIST      = 10;
const   STG_STATE_READ_SU_1_PARAMETERS          = 11;
const   STG_STATE_READ_SU_2_PARAMETERS          = 12;
const   STG_STATE_READ_SU_3_PARAMETERS          = 13;
const   STG_STATE_WAIT_READ_SU_PARAMETERS       = 14;
const   STG_STATE_SET_SU_1_PARAMETERS           = 15;
const   STG_STATE_SET_SU_2_PARAMETERS           = 16;
const   STG_STATE_WAIT_SET_SU_PARAMETERS        = 17;

const   GLOBAL_FLAGS_AUTO_ANT_BIT               = 0x20;     // when set do automatic antenna selection...
const   ANT_STATUS_NO_EXT                       = 0xFFFFFFFF;

var aUniiChanBlock = new Uint32Array(2); // maps to firmware UINT32 UniiChanBlock[2]
var dfltSuMaxSysGain          = 0; //Default Super User Max system gain [dB]
var dfltSuMinSysGain          = 0; //Default Super User Min system gain [dB]
var dfltSuMaxBackOff          = 0; //Default Super User Max back-off [dB]
var dfltSuMaxCellRssi         = 0; //Default Super User Max Cell RSSI for Pro [dBm]
var dfltSuMaxRscp             = 0; //Default Super User Max RSCP for GO [dBm]
var dfltSuMaxRsrp             = 0; //Default Super User Max RSRP for GO [dBm]
var dfltSuBandMask3G          = ~0;//Shows which Default 3G bands should be allowed
var dfltSuBandMask4G          = ~0;//Shows which Default 4G bands should be allowed
var dfltSuTechBandAllowedBias =    //Default TechBandBias :: tech{0=wcdma, 1=lte}, bd:band, blk{0=band will be relayed, 1=band is blocked}, bias
[
    {"tech":0, "bd":1, "blk":0, "bias":60}
];


// Called at the end of a 5 second timeout to allow the UART to be redirected...
function RedirectUartTimeout()
{
    bOkToRedirectUart = true;
    PrintLog(1,"bOkToRedirectUart set to true" );    
}


// CheckUniiStatusStg....................................................................................
function CheckUniiStatusStg()
{
 
    if( guiCurrentMode == PROG_MODE_SETTINGS )
    {
        if( bCnxToOneBoxNu )
        {
            if( isNxtyMsgPending() == false )
            {
                // Since we are on a 1-Box, no need to check UNII but check mode in case user
                // changed the mode with the physical button on the HW.
                GetNxtySuperMsgBoosterParams();
            }
            
            checkUniiStatusStgTimer = setTimeout(CheckUniiStatusStg, 2000);
        }
        else
        {
            if( isNxtyMsgPending() == false )
            {
                // Check to see if UNII is up...
                PrintLog(1, "Settings: Check UNII status..." );
                if( (msgRxLastCmd == NXTY_NAK_RSP) && (nxtyLastNakType == NXTY_NAK_TYPE_TIMEOUT) )
                {
                    // UART may be stuck in remote so switch to local to get the status.
                    SetUartLocal();
                }
                else
                {
                    GetNxtySuperMsgLinkStatus();
                }
            }
        
            // Return here in 5 seconds....
            checkUniiStatusStgTimer = setTimeout(CheckUniiStatusStg, 5000);
        }
    }
}


// Start setting the antenna in hardware...
//  |--- Read AntennaStatus ---------| |---- Set GlobalFlags -----|
//                     Read Baand      set EXT ANT      Set INT ant
// A   bit 7:  0=ext   bits 6 to 0     0xF1AC0200       0xF1AC0002
// B   bit 15: 0=ext   bits 14 to 8    0xF1AC0400       0xF1AC0004
// C   bit 23: 0=ext   bits 22 to 16   0xF1AC0800       0xF1AC0008
// D   bit 31: 0=ext   Bits 30 to 24   0xF1AC1000       0xF1AC0010

// Set Auto/Manual Antenna control in GlobalFlags...
//    Manual           Auto
// 0xF1AC2000       0xF1AC0020
//
function SetAntenna(code)
{
    switch(code)
    {
        case 0x0020:   PrintLog(1, "Button: Set Ant Auto" );        break;
        case 0x2000:   PrintLog(1, "Button: Set Ant Manual" );      break;
        case 0x0002:   PrintLog(1, "Button: Set Ant A Internal" );  break;
        case 0x0004:   PrintLog(1, "Button: Set Ant B Internal" );  break;
        case 0x0008:   PrintLog(1, "Button: Set Ant C Internal" );  break;
        case 0x0010:   PrintLog(1, "Button: Set Ant D Internal" );  break;
        case 0x0200:   PrintLog(1, "Button: Set Ant A External" );  break;
        case 0x0400:   PrintLog(1, "Button: Set Ant B External" );  break;
        case 0x0800:   PrintLog(1, "Button: Set Ant C External" );  break;
        case 0x1000:   PrintLog(1, "Button: Set Ant D External" );  break;
    }
    
    
    antCode = 0xF1AC0000 | code;
    antCode >>>= 0; // convert to unsigned since 0xF is MSB
    PrintLog(1, "Set global flags: 0x" + antCode.toString(16) );
    ShowWaitPopUpMsg("Please wait.", "Setting antenna configuration...");
    UpdateStatusLine("Setting antenna configuration...");
                
    // Disable all radio buttons to keep user from changing while 
    // we are trying to set the hardware...
    disableAntButtons();

    // Clear the UNII timer...
    // Note that the StgLoop will actually start in 1 second due to the call below so any pending UNII check responses should be cleared by then... 
    clearTimeout(checkUniiStatusStgTimer);

    StgTimeoutCount       = 0;
    StgState              = STG_STATE_SET_ANT;
    StgLoopIntervalHandle = setInterval(StgLoop, 1000);
}




function updateAntStatus()
{
    var i;
    var ubd;
    var uTemp;        
            
                
    // Update Auto/Manual
    if( nxtyGlobalFlags & GLOBAL_FLAGS_AUTO_ANT_BIT )
    {
        // Set Auto..
        guiAntennaManualFlag = false;
    }
    else
    {
        // Set Manual..
        guiAntennaManualFlag = true;
    }
    
    uTemp = nxtyAntStatus;
    
    for( i = 0; i < 4; i++ )
    {   
        bIntAnt = false;
        ubd = uTemp & 0xFF;
        
        // Isolate the band...
        guiAntennaBands[i] = ubd & 0x7F;
        
        // See if there is a bd defined...
        if( ubd )
        {
            // Check bit 7 which contains ant info.  0=ext, 1=int
            if( ubd & 0x80 )
            {
                ubd   &= 0x7F;
                guiAntennaIntFlags[i] = true;
            }
            else
            {
                guiAntennaIntFlags[i] = false;
            }
        
            if( ubd <= MAX_bdS )
            {
                guiAntennaFreqArrayMHz[i] = bdFreqMHz[ubd];
            }
            else
            {
                guiAntennaFreqArrayMHz[i] = 0;
            }
        }
        
        // Move to the next bd...
        uTemp >>= 8;
    }
	util.updateAntennaBandButtons();
    PrintLog(1, "UpdateAntStatus(): guiAntennaManualFlag=" + guiAntennaManualFlag + " guiAntennaIntFlags=" + JSON.stringify(guiAntennaIntFlags) + " guiAntennaBands=" + JSON.stringify(guiAntennaBands) + " guiAntennaFreqArrayMHz=" + JSON.stringify(guiAntennaFreqArrayMHz) ); 
    
    guiSettingsDirtyFlag = true;
}

//.................................................................................................................
// mode: 
//  0: Auto
//  1: 3G
//  2: 4G-4GX
//  3: Band A (1st lowest bit in Secured Setup)
//  4: Band B (2nd lowest bit in Secured Setup)
//  5: Band C (3rd lowest bit in Secured Setup)

function SetBooster(mode)
{
    bNxtyUserSetInProgress = true;
    PrintLog(1, "SetBooster(" + guiBoosterModeText[mode] + ")  called");
    
    if( isNxtyMsgPending() == true )
    {
        // Come back and try again to see if not busy...
        setTimeout( function(){ SetBooster(mode); }, 130 );
    }
    else
    {
        if( mode == GO_MODE_AUTO )                 
        {
            SetNxtySuperMsgWaveData( NXTY_WAVEID_BAND_MASK_3G_TYPE, GO_ALL_BANDS, NXTY_WAVEID_BAND_MASK_4G_TYPE, GO_ALL_BANDS );
        }
        else if( mode == GO_MODE_3G )                 
        {
            SetNxtySuperMsgWaveData( NXTY_WAVEID_BAND_MASK_3G_TYPE, GO_ALL_BANDS, NXTY_WAVEID_BAND_MASK_4G_TYPE, 0 );
        }
        else if( mode == GO_MODE_4G )                 
        {
            SetNxtySuperMsgWaveData( NXTY_WAVEID_BAND_MASK_3G_TYPE, 0, NXTY_WAVEID_BAND_MASK_4G_TYPE, GO_ALL_BANDS );
        }
        else if( (mode == GO_MODE_BAND_A) || (mode == GO_MODE_BAND_B) || (mode == GO_MODE_BAND_C) )                 
        {
            var uTemp = 0x01 << (guiBoosterBands[mode - GO_MODE_BAND_A]-1);
            SetNxtySuperMsgWaveData( NXTY_WAVEID_BAND_MASK_3G_TYPE, uTemp, NXTY_WAVEID_BAND_MASK_4G_TYPE, uTemp );
        }
        
        bNxtyUserSetInProgress = false;
    }

}

var Stg = {

    // Handle the Back key
    handleBackKey: function()
    {
        PrintLog(1, "");
        PrintLog(1, "Settings: Back key pressed-------------------------------------------------------");
        clearInterval(StgLoopIntervalHandle);
        clearTimeout(checkUniiStatusStgTimer);
        
        DumpDataTables();         
        //app.renderHomeView();
        RequestModeChange(PROG_MODE_TECH);
    },


    
    
    renderSettingsView: function() 
    {    
        guiCurrentMode = PROG_MODE_SETTINGS;
        DisplayLoop();
        // Start the ball rolling...
        if( parseInt(nxtySwBuildIdNu, 16) > parseInt("0x0501002B", 16) ) // only SW5_1_44 and above supports this API
        {
            StgState          = STG_STATE_READ_UNII_BLOCK_LIST;
        }
        else
        {
            StgState          = STG_STATE_READ_GLOBAL_FLAGS_ON_ENTRY;
        }
        StgTimeoutCount       = 0;
        
        if( bCnxToOneBoxNu )
        {
            checkUniiStatusStgTimer = setTimeout(CheckUniiStatusStg, 2000);
        }
        else
        {
            StgLoopIntervalHandle = setInterval(StgLoop, 1000);
        }
    },
};


    
function StgLoop() 
{

    PrintLog(1, "Settings loop...StgState=" + StgState + " StgTimeoutCount= " + StgTimeoutCount );
    StgTimeoutCount++; 
        
    if( StgTimeoutCount > STG_LOOP_COUNT_MAX )
    {
        StgTimeoutCount = 0;
        UpdateStatusLine("Unable to set antenna configuration...");
        ShowAlertPopUpMsg("Timeout.", "Unable to set antenna configuration.   Try again.");
        
        // Reset to last known Ant configuration
        updateAntStatus();
        
        clearInterval(StgLoopIntervalHandle);
        StopWaitPopUpMsg();
        
        // Do not allow communication to the NU for another 5 seconds....   
        SetUartLocal();
        bOkToRedirectUart = false;
        uartRedirectTimeout = setTimeout(RedirectUartTimeout, UART_REDIRECT_TIMER_MS); 
        return;       
    }
    
       
    switch( StgState )
    {

        case STG_STATE_READ_GLOBAL_FLAGS_ON_ENTRY: // 1
        {
            clearInterval(StgLoopIntervalHandle);
            StopWaitPopUpMsg();
        
            if( guiAntennaFlag == false )
            {
                // No Ext Antenna available.   "NWK_FLAG_ENABLE_EXT_ANT" not enabled in Ares code.
                // Disable all buttons and inform user.
                PrintLog(1, "AntStatus is 0xFFFFFFFF indicating Ext Ant not allowed.   Disable all selections.");
//                disableAntButtons();
                
                ShowAlertPopUpMsg("No External Antenna.", "No External Antenna is available for selection.  Return to main menu.");
            }
            else
            {
                updateAntStatus();

                if( StgTimeoutCount <= STG_LOOP_COUNT_MAX )
                {
                    UpdateStatusLine("Current antenna configuration...");
                }
            
                // Start looking at the UNII status...
                checkUniiStatusStgTimer = setTimeout(CheckUniiStatusStg, 5000);
                    
            }
                    
                    
            break; 
        }
        // End of On Entry states.......................................................    
    
    
    
        case STG_STATE_SET_ANT:     // 2
        {
            // Must wait here until 5 seconds after the last NU access
            // for the UART redirect to time out.
            // Set the Ant Configuration....
            if( bOkToRedirectUart )
            {
                SetNxtySuperMsgAntState(antCode);
                bReadDataRsp        = true;
                
                StgState = STG_STATE_WAIT_FOR_SET_ANT;
            }
            break;
        }

        case STG_STATE_WAIT_FOR_SET_ANT:  // 3
        {
            // Wait for the Antenna set to start writing and then start reading the Global Flags to determine when the write is complete....
            if( bNxtySuperMsgRsp == true )
            {
                if( iNxtySuperMsgRspStatus == NXTY_SUPER_MSG_STATUS_SUCCESS )
                {
                    ReadAddrReq( NXTY_PCCTRL_GLOBALFLAGS );
                    StgState = STG_STATE_READ_GLOBAL_FLAGS;
                }
                else
                {
                    PrintLog(1, "Try again to set the antenna state.");
                    StgState            = STG_STATE_SET_ANT;
                    bOkToRedirectUart   = false;
                    uartRedirectTimeout = setTimeout(RedirectUartTimeout, UART_REDIRECT_TIMER_MS);                 
                }
            }
            break;
        }
    
        case STG_STATE_READ_GLOBAL_FLAGS:  // 4
        {
            // Read global flags and make sure not busy, i.e. data has been written...
            if( bReadDataRsp == true )
            {
                nxtyGlobalFlags = nxtyReadAddrRsp;
                
                if( (nxtyGlobalFlags & 0xFFFFFF00) == 0 )
                {
                    // Data has been written successfully, now lets read it back to update the GUI with the current status. 
                    UpdateStatusLine("Reading antenna configuration...");
                    StgState = STG_STATE_WAIT_FOR_ANT_STATUS;

                    GetNxtySuperMsgParamSelect( NXTY_SEL_PARAM_ANT_STATUS, NXTY_SEL_PARAM_ANT_STATUS );       
                }
                else
                {
                    // Read again until (nxtyGlobalFlags & 0xFFFFFF00) == 0
                    ReadAddrReq( NXTY_PCCTRL_GLOBALFLAGS );
                }
                    
            }
            break;
        }
    

    
    
        case STG_STATE_WAIT_FOR_ANT_STATUS:     // 5
        {
            // Wait in this state until the Cel-Fi unit responds from getting Ant status...
            if( bNxtySuperMsgRsp == true )
            {
                nxtyAntStatus = nxtySelParamRegOneRsp;
                
                // Get the status of the GlobalFlags again to make sure that AutoMan is updated....
                ReadAddrReq( NXTY_PCCTRL_GLOBALFLAGS );
                StgState = STG_STATE_WAIT_FOR_GLOBAL_FLAGS;
            }
            break; 
        }


        case STG_STATE_WAIT_FOR_GLOBAL_FLAGS:   // 6
        {           
            // Wait in this state until the Cel-Fi unit responds from getting Global Flags...
            if( bReadAddrRsp == true )
            {
                nxtyGlobalFlags = nxtyReadAddrRsp;
                updateAntStatus();
                SetUartLocal();
                
                clearInterval(StgLoopIntervalHandle);
                StopWaitPopUpMsg();
    
                if( StgTimeoutCount <= STG_LOOP_COUNT_MAX )
                {
                    UpdateStatusLine("Current antenna configuration...");
                }
                
                
                // Start looking at the UNII status...
                checkUniiStatusStgTimer = setTimeout(CheckUniiStatusStg, 5000);
                
                // Do not allow communication to the NU for another 5 seconds....                
                bOkToRedirectUart = false;
                uartRedirectTimeout = setTimeout(RedirectUartTimeout, UART_REDIRECT_TIMER_MS);
            }
            break; 
        }


        case STG_STATE_READ_UNII_BLOCK_LIST: //7
        {
            if( bOkToRedirectUart )
            {
                SetNxtySuperMsgReadUniiBlockedList();
                StgState = STG_STATE_WAIT_READ_UNII_BLOCK_LIST;
            }
            break;
        }

        
        case STG_STATE_WAIT_READ_UNII_BLOCK_LIST: //8
        {
            if( bNxtySuperMsgRsp == true )
            {
                bOkToRedirectUart   = false;
                uartRedirectTimeout = setTimeout(RedirectUartTimeout, UART_REDIRECT_TIMER_MS);
                StgState = STG_STATE_READ_GLOBAL_FLAGS_ON_ENTRY;
            }
            break;
        }
        
        
        case STG_STATE_SET_UNII_BLOCK_LIST: //9
        {
            if( bOkToRedirectUart )
            {
                SetNxtySuperMsgWriteUniiBlockedList(aUniiChanBlock);
                StgState = STG_STATE_WAIT_SET_UNII_BLOCK_LIST;
            }
            break;
        }
        
        
        case STG_STATE_WAIT_SET_UNII_BLOCK_LIST: //10
        {
            if( bNxtySuperMsgRsp == true )
            {
                StgTimeoutCount     = 0;
                bOkToRedirectUart   = false;
                uartRedirectTimeout = setTimeout(RedirectUartTimeout, UART_REDIRECT_TIMER_MS);
                StgState = STG_STATE_READ_UNII_BLOCK_LIST;
            }
            break;
        }
        
        
        case STG_STATE_READ_SU_1_PARAMETERS: //11
        {
            if( bOkToRedirectUart )
            {
                SetNxtySuperMsgReadSuperUserParams_1();
                StgState = STG_STATE_READ_SU_2_PARAMETERS;
            }
            break;
        }
        
        
        case STG_STATE_READ_SU_2_PARAMETERS: //12
        {
            if( bNxtySuperMsgRsp == true )
            {
                SetNxtySuperMsgReadSuperUserParams_2();
                StgState = STG_STATE_READ_SU_3_PARAMETERS;
            }
            break;
        }

        
        case STG_STATE_READ_SU_3_PARAMETERS: //13
        {
            if( bNxtySuperMsgRsp == true )
            {
                SetNxtySuperMsgReadSuperUserParams_3();
                StgState = STG_STATE_WAIT_READ_SU_PARAMETERS;
            }
            break;
        }

        
        case STG_STATE_WAIT_READ_SU_PARAMETERS: //14
        {
            if( bNxtySuperMsgRsp == true )
            {
                bOkToRedirectUart   = false;
                uartRedirectTimeout = setTimeout(RedirectUartTimeout, UART_REDIRECT_TIMER_MS);
                StgState = STG_STATE_READ_GLOBAL_FLAGS_ON_ENTRY;
            }
            break;
        }
        
        case STG_STATE_SET_SU_1_PARAMETERS: //15
        {
            if( bOkToRedirectUart )
            {
                SetNxtySuperMsgWriteSuperUserParams_1();
                StgState = STG_STATE_SET_SU_2_PARAMETERS;
            }
            break;
        }
        
        case STG_STATE_SET_SU_2_PARAMETERS: //16
        {
            if( bNxtySuperMsgRsp == true )
            {
                SetNxtySuperMsgWriteSuperUserParams_2();
                StgState = STG_STATE_WAIT_SET_SU_PARAMETERS;
            }
            break;
        }
        

        case STG_STATE_WAIT_SET_SU_PARAMETERS: //17
        {
            if( bNxtySuperMsgRsp == true )
            {
                bOkToRedirectUart   = false;
                uartRedirectTimeout = setTimeout(RedirectUartTimeout, UART_REDIRECT_TIMER_MS);
                StgState = STG_STATE_READ_SU_1_PARAMETERS; // now go read them again to check FW response
            }
            break;
        }

        
        default:
        {
            clearInterval(StgLoopIntervalHandle);
            UpdateStatusLine("Invalid State.");
            break;
        }
        
    }   // end switch
}


//-----------------------
function startSetBlockedUniiFreq() 
{
    // Using the guiSuUniiList array that the user just filled out, update the aUniiChanBlock[2]
    var idx = 0;
    aUniiChanBlock[0] = 0; for(idx=0; idx<32; idx++)              {if((guiSuUniiList[idx].tck)/*&& (guiSuUniiList[idx].dis == 0)*/){aUniiChanBlock[0] |= (1<<idx);}}
    aUniiChanBlock[1] = 0; for( ; idx<guiSuUniiList.length; idx++){if((guiSuUniiList[idx].tck)/*&& (guiSuUniiList[idx].dis == 0)*/){aUniiChanBlock[1] |= (1<<idx);}}
    
    // Fire the message
    clearTimeout(checkUniiStatusStgTimer);
    StgTimeoutCount       = 0;
    StgState              = STG_STATE_SET_UNII_BLOCK_LIST;
    StgLoopIntervalHandle = setInterval(StgLoop, 1000);
}

function startReadSuperUserInfo()
{
    clearTimeout(checkUniiStatusStgTimer);
    StgTimeoutCount       = 0;
    StgState              = STG_STATE_READ_SU_1_PARAMETERS;
    StgLoopIntervalHandle = setInterval(StgLoop, 1000);
    
    // -----also fire of something that will get the PLMN list from cloud (it will have to have egressresponse callback to update the view if it takes longer than the unit query)
    // for now, just add options based on current time to check dynamic update
    var x=guiSuPLMNIDlist.splice(0, guiSuPLMNIDlist.length); x=[];var d=new Date();for(var i=0;i<d.getSeconds();i++){var txt = "Operator " + d.getMinutes() + ":" + d.getSeconds() + "(" + i + ")";guiSuPLMNIDlist.push( txt.toString() );}
    // -----
}

// For the given frequency, set the tick value if allowed to
function SetUniiListItem(freq, tick) 
{
    for(var I=0; I<guiSuUniiList.length; I++)
    {
        if(guiSuUniiList[I].fq == freq)
        {
            if(guiSuUniiList[I].dis == 0)
            {
                guiSuUniiList[I].tck = tick;
            }
            break;
        }
    }
}

// For the given Tech and Band, set the blocked tick and bias
//  TechBandBias :: tech{0=wcdma, 1=lte}, bd:band, blk{0=band will be relayed, 1=band is blocked}, bias
function SetTechBandAllowedBiasItem(Tech, Band, BlckTick, Bias)
{
    for(var I=0; I<guiSuTechBandAllowedBias.length; I++)
    {
        if( (guiSuTechBandAllowedBias[I].tech == Tech) && (guiSuTechBandAllowedBias[I].bd == Band))
        {
            if(BlckTick!=null){guiSuTechBandAllowedBias[I].blk = ((BlckTick)?(1):(0));}
            if(Bias!=null){guiSuTechBandAllowedBias[I].bias = Bias;}
            break;
        }
    }
}

// Get user confugured params and send to unit
function startSetSuperUserConfigParams()
{
    // When User value equal to the Default value, then write invalid value to board so that it knows that it can use default
    if(guiSuMaxSysGain  == dfltSuMaxSysGain)  {guiSuMaxSysGain=0;}  //int8 (valid if > 0)
    if(guiSuMinSysGain  == dfltSuMinSysGain)  {guiSuMinSysGain=0;}  //int8 (valid if > 0)
    if(guiSuMaxBackOff  == dfltSuMaxBackOff)  {guiSuMaxBackOff=0;}  //int32 (valid if >0)
    if(guiSuMaxCellRssi == dfltSuMaxCellRssi) {guiSuMaxCellRssi=0;} //int8 (valid if < 0)
    if(guiSuMaxRscp     == dfltSuMaxRscp)     {guiSuMaxRscp=0;}     //int8 (valid if < 0)
    if(guiSuMaxRsrp     == dfltSuMaxRsrp)     {guiSuMaxRsrp=0;}     //int8 (valid if < 0)
    
    guiSuBandMask3G = buildBandMask(0);
    guiSuBandMask4G = buildBandMask(1);
    
    // Fire the message
    clearTimeout(checkUniiStatusStgTimer);
    StgTimeoutCount       = 0;
    StgState              = STG_STATE_SET_SU_1_PARAMETERS;
    StgLoopIntervalHandle = setInterval(StgLoop, 1000);
}

function buildBandMask(theTech)
{
    var bandmask = 0;
    
    for(var I=0; I<guiSuTechBandAllowedBias.length; I++)
    {
        if( guiSuTechBandAllowedBias[I].tech == theTech )
        {
            if( guiSuTechBandAllowedBias[I].blk == 0)
            {
                bandmask |= ( 1<<(guiSuTechBandAllowedBias[I].bd-1) );
            }
        }
    }
    return bandmask;
}

function buildGuiTechBandBias(idx)
{
    var techbandbias = 0;
    if(idx < guiSuTechBandAllowedBias.length)
    {
        techbandbias = (guiSuTechBandAllowedBias[idx].bias << 8) | (guiSuTechBandAllowedBias[idx].tech << 7) | (guiSuTechBandAllowedBias[idx].bd);
    }
    return techbandbias;
}

function loadDefaultUniiFreq()
{
    PrintLog(1, "User clicked button 'Restore Defaults' for Unii List");
    // clear any user tick where user allowed to change
    // frequency, ticked={1=block channel, 0=allow channel}, disabled={0=allow user to change tick state, 1=user cannot change tick state}
    for(var I=0; I<guiSuUniiList.length; I++)
    {
        if(guiSuUniiList[I].dis == 0)
        {
            guiSuUniiList[I].tck = 0;
        }
    }

}

function loadDefaultSuperUsrConfigurableParams()
{
    PrintLog(1, "User clicked button 'Restore Defaults' for Super User configurable params");
    guiSuMaxSysGain = dfltSuMaxSysGain ;
    guiSuMinSysGain = dfltSuMinSysGain ;
    guiSuMaxBackOff = dfltSuMaxBackOff ;
    guiSuMaxCellRssi= dfltSuMaxCellRssi;
    guiSuMaxRscp    = dfltSuMaxRscp    ;
    guiSuMaxRsrp    = dfltSuMaxRsrp    ;
    guiSuBandMask3G = dfltSuBandMask3G ; 
    guiSuBandMask4G = dfltSuBandMask4G ; 
     
    var x=guiSuTechBandAllowedBias.splice(0, guiSuTechBandAllowedBias.length); x=[];
    for (var i = 0; i<dfltSuTechBandAllowedBias.length; i++)
    {
        var elem = dfltSuTechBandAllowedBias[i];
        guiSuTechBandAllowedBias.push({"tech":elem.tech, "bd":elem.bd, "blk":elem.blk, "bias":elem.bias});
    }
}
