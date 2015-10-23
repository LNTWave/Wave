//=================================================================================================
//
//  File: msg_nxty.js
//
//  Description:  This file contains the protocol for communicating with the Nextivity hardware.
//
//=================================================================================================

const   NXTY_PHONE_ICD_VER                = 0x20;

const   NXTY_STD_MSG_SIZE                   = 0x0C;   // 12
const   NXTY_MED_MSG_SIZE                 = 0x84;   // 132
const   NXTY_BIG_MSG_SIZE                 = 0xFF;   // 255
const   NXTY_V2_MAX_MSG_SIZE              = 260;    // 260
const   NXTY_V2_PREFIX                    = 0xAE;
const   NXTY_V2_LEN_ADD                   = 5;      // Size of V2 msg is len byte, max 255, + 5.  Prefix + len + ~len + cmd + CRC. 

const   NXTY_INIT                         = -1;
const   NXTY_WAITING_FOR_RSP              = 0x00;

const   NXTY_SET_BLUETOOTH_CNX_STATUS_RSP = 0x42;
const   NXTY_DOWNLOAD_START_REQ           = 0x08;
const     NXTY_SW_CF_NU_TYPE              = 0x01;
const     NXTY_SW_CF_CU_TYPE              = 0x02;
const     NXTY_SW_NU_PIC_TYPE             = 0x03;
const     NXTY_SW_CU_PIC_TYPE             = 0x04;
const     NXTY_SW_BT_TYPE                 = 0x05;
const     NXTY_SW_NONE_TYPE               = 0x06;
const   NXTY_DOWNLOAD_START_RSP           = 0x48;
const   NXTY_DOWNLOAD_TRANSFER_REQ        = 0x09;
const     NXTY_DOWNLOAD_MAX_SIZE          = 0x80;   // 128
const   NXTY_DOWNLOAD_TRANSFER_RSP        = 0x49;
const   NXTY_DOWNLOAD_END_REQ             = 0x0A;
const   NXTY_DOWNLOAD_END_RSP             = 0x4A;
const   NXTY_STATUS_REQ                   = 0x0B;
const   NXTY_STATUS_RSP                   = 0x4B;

// Version 2.0 protocol additions...
const   NXTY_READ_ADDRESS_REQ                   = 0x10;
const   NXTY_READ_ADDRESS_RSP                   = 0x50;
const   NXTY_WRITE_ADDRESS_REQ                  = 0x11;
const   NXTY_WRITE_ADDRESS_RSP                  = 0x51;
const   NXTY_READ_DATA_REQ                      = 0x12;
const     READ_DATA_REQ_TECH_TYPE               = 0x01;
const     READ_DATA_REQ_CELL_INFO_TYPE          = 0x02;
const   NXTY_READ_DATA_RSP                      = 0x52;
const   NXTY_SUPER_MSG_REQ                      = 0x13;
const     NXTY_SUPER_MSG_INFO_TYPE              = 0x01;
const     NXTY_SUPER_MSG_LINK_STATE             = 0x02;
const     NXTY_SUPER_MSG_PARAM_SELECT           = 0x03;
const     NXTY_SUPER_MSG_REDIRECT_UART          = 0x04;
const     NXTY_SUPER_MSG_CANCEL_REDIRECT_UART   = 0x05;
const     NXTY_SUPER_MSG_SET_ANT_STATE          = 0x06;
const     NXTY_SUPER_MSG_RESET_ARES             = 0x07;
const     NXTY_SUPER_MSG_RESET_REMOTE_UNIT      = 0x08;
const     NXTY_SUPER_MSG_RESET_LOCAL_UNIT       = 0x09;
const     NXTY_SUPER_MSG_GET_BOOSTER_DATA       = 0x0A;
const     NXTY_SUPER_MSG_SET_WAVE_DATA          = 0x0B;

const   NXTY_SUPER_MSG_RSP                      = 0x53;
const   NXTY_SUPER_MSG_PARAM_SEL_ARRAY    = ["0:Xfer Bufr",    "UniqueIdLsd",       "UniqueIdMsd",      "BuildId",         "SWVersion",         
                                             "BoardConfig",    "LinkState",         "FirstConfigDword", "SystemSnLsd",     "SystemSnMsd",
                                             "SelfTestRslt",   "CaptBufferAddress", "ChanListAddress",  "DbgIfVersion",    "CloudBuffAddr",
                                             "CloudSwVersion", "AntennaStatus",     "RegSupportData",   "CustomSupported", "HwError", 
                                             "SecuredBands3G", "SecuredBands4G" ];


const   NXTY_SUPER_MSG_WAVE_DATA_ARRAY    = ["0:SafemodeBackoff",    "1:UniiBlock[]",       "2:BandMask3G",      "3:BandMask4G",         "4:TechBandBias[]",         
                                             "5:Femto3GMinSC",       "6:Femto3GMaxSC",      "7:Femto4GMinSC",    "8:Femto4GMaxSC",       "9:MinSysGain",
                                             "10:MaxSysGain",        "11:MaxPilot3G",       "12:MaxPilot4G" ];

const   NXTY_PCCTRL_UART_REDIRECT         = 0xF0000024;
const   NXTY_PCCTRL_CLOUD_INFO            = 0xF0000028;
const   NXTY_PCCTRL_GLOBALFLAGS           = 0xF0000038;
const   NXTY_PCCTRL_SELPARAM_REG          = 0xF0000020;

const     NXTY_SEL_PARAM_REG_UID_TYPE     = 0x01;
const     NXTY_SEL_PARAM_LINK_STATE       = 0x06;
const     NXTY_SEL_PARAM_REG_SN_TYPE      = 0x08;
const     NXTY_SEL_PARAM_ANT_STATUS       = 0x10;
const     NXTY_SEL_PARAM_REG_SUPPORT_DATA = 0x11;
const     NXTY_SEL_PARAM_REG_SECURE_3G    = 0x14;
const     NXTY_SEL_PARAM_REG_SECURE_4G    = 0x15;
const   NXTY_PCCTRL_XFER_BUFFER           = 0xF000001C;
const   NXTY_PCCTRL_WAVE_ID_REG           = 0xF0000020;     // Same as SELPARAM
const     NXTY_WAVEID_BAND_MASK_3G_TYPE   = 0x01020000;     // Set bit 24 to 1 for CfgParamId and bits 16 to 23 to 2 for BandMask3G
const     NXTY_WAVEID_BAND_MASK_4G_TYPE   = 0x01030000;     // Set bit 24 to 1 for CfgParamId and bits 16 to 23 to 3 for BandMask4G
const   NXTY_PCCTRL_WAVE_DATA_BUFFER      = 0xF000001C;     // Same as XFER_BUFFER
const   NXTY_RESET_LOCAL_ADDR             = 0x84300458;
const   NXTY_RESET_REMOTE_ADDR            = 0x82000258;
const   NXTY_RESET_VALUE                  = 0xDEADBEEF;

const   NXTY_NAK_RSP                    = 0xBB;
const     NXTY_NAK_TYPE_NONE            = 0x00;
const     NXTY_NAK_TYPE_CRC             = 0x01;
const     NXTY_NAK_TYPE_UNCMD           = 0x02;
const     NXTY_NAK_TYPE_UNII_NOT_UP     = 0x03;
const     NXTY_NAK_TYPE_UNIT_REDIRECT   = 0x04;
const     NXTY_NAK_TYPE_TIMEOUT         = 0x05;
const     NXTY_NAK_TYPE_PREV_MSG_BUSY   = 0x06;
const     NXTY_NAK_TYPE_USB_BUSY        = 0x07;



// GO 1-Box constants...
const   GO_ALL_BANDS                      = 0xFFFFFFFF;
const   GO_MODE_AUTO                      = 0;
const   GO_MODE_3G                        = 1;
const   GO_MODE_4G                        = 2;
const   GO_MODE_BAND_A                    = 3;
const   GO_MODE_BAND_B                    = 4;
const   GO_MODE_BAND_C                    = 5;



var msgRxLastCmd                        = NXTY_INIT;
var u8RxBuff                            = new Uint8Array(NXTY_V2_MAX_MSG_SIZE);       // Allow for max V1 msg of 255 bytes or V2 msg of 260 bytes.
var u8UniqueId                          = new Uint8Array(8)
var uSendCount                          = 0; 

var uRxBuffIdx                          = 0;
var uTxMsgNotReadyCnt                   = 0;


        
// Status message response data...
var isNxtyStatusCurrent     = false;
var nxtyRxStatusHw          = null;
var nxtyRxStatusIcd         = 0;
var nxtyRxRegLockStatus     = 0;
var nxtyRxStatusBoardConfig = null;
const V1_ICD                = 0x07;
const IM_A_CU_MASK          = 0x01;
const IM_A_1BOX_NU_MASK     = 0x8000;


// Sys Info data......
var nxtyUniqueId            = null;
var nxtySelParamRegOneRsp   = 0;
var nxtySelParamRegTwoRsp   = 0;
var nxtySecuredBands3G      = 0;
var nxtySecuredBands4G      = 0;
var nxtyBandMask3G          = 0;
var nxtyBandMask4G          = 0;


// Software Version response data...
var nxtyCurrentReq          = null;
var nxtySwVerCuCf           = null;     // Leave the SwVer variables set to null.  
var nxtySwVerNuCf           = null;  
var nxtySwVerNuPic          = null;
var nxtySwVerCuPic          = null;
var nxtySwVerCuBt           = null;
var nxtySwBuildIdNu         = 0;
var nxtySwBuildIdCu         = 0;
var nxtySwBuildIdNu         = 0;



var swVerNoCldText          = "OK"
var nxtySwVerCuCfCld        = swVerNoCldText;  
var nxtySwVerNuCfCld        = swVerNoCldText;  
var nxtySwVerNuPicCld       = swVerNoCldText;
var nxtySwVerCuPicCld       = swVerNoCldText;
var nxtySwVerCuBtCld        = swVerNoCldText;


/*
var nxtySwVerCuCfCld        = "00.00.03";  
var nxtySwVerNuCfCld        = "00.00.04";  
var nxtySwVerNuPicCld       = "00.05";
var nxtySwVerCuPicCld       = "00.06";
var nxtySwVerCuBtCld        = "00.07";
*/

// Software Download data...
var nxtySwDldStartRspAddr   = null;
var nxtySwDldXferRspCont    = null;


// NAK info...
var nxtyLastNakType             = null;
var bUsbConflictDialogActive    = false;


// Read Address...
var bReadAddrRsp                = false;
var nxtyReadAddrRsp             = 0;

// Write Address...
var bWriteAddrRsp               = false;
var nxtyWriteAddrRsp            = 0;

// ReadDataReq...
var bReadDataRsp                = false;
var uReadDataReqType            = 0;

// Super Msg...
const NXTY_SUPER_MSG_STATUS_PENDING    = 0;
const NXTY_SUPER_MSG_STATUS_SUCCESS    = 1;
const NXTY_SUPER_MSG_STATUS_FAIL_NAK   = 2;
const NXTY_SUPER_MSG_STATUS_FAIL_WRITE = 3;
var u8TempTxBuff                       = new Uint8Array(NXTY_BIG_MSG_SIZE);
var bNxtySuperMsgRsp                   = false;
var iNxtySuperMsgRspStatus             = NXTY_SUPER_MSG_STATUS_PENDING;
var bNxtySuperMsgLocalInfo             = false;
var bNxtySuperMsgRemoteInfo            = false;
var bNxtySuperMsgRemoteInfo            = false;
var bNxtyUserSetInProgress             = false;

var nxtyCuCloudBuffAddr                = 0;
var nxtyCuCloudInfo                    = 0;
var nxtyNuCloudBuffAddr                = 0;
var nxtyNuCloudInfo                    = 0;
var uLastUartRedirectTimeMs            = 0;
var nxtyGlobalFlags                    = 0;
var nxtyAntStatus                      = 0;


// CU Cloud Info bits....................................
const CLOUD_INFO_CMD_MASK              = 0xFF000000;   
const CLOUD_INFO_CMD_RSP_BIT           = 0x80000000;   
const CLOUD_INFO_DATA_MASK             = 0x00FFFFFF; 
const CLOUD_INFO_GET_ENGR_LABEL_CMD    = 0x01000000;    // Cmd data:  Page number from 0 to 8.  Rsp data: Byte count
const CLOUD_INFO_GET_ENGR_PAGE_CMD     = 0x02000000;    // Cmd data:  None                      Rsp data: Byte count


// NU Cloud Info bits....................................
const CLOUD_INFO_REG_LOCK_BITS_CMD    = 0x03000000;     // Cmd data:  None                      Rsp data: 4 reg lock bits
const CLOUD_INFO_CELL_REQ_CMD         = 0x04000000;     // Cmd data:  None                      Rsp data: None
const CLOUD_INFO_REG_REQ_CMD          = 0x05000000;     // Cmd data:  None                      Rsp data: None
const CLOUD_INFO_FLASH_LEDS_CMD       = 0x06000000;     // Cmd data:  None                      Rsp data: None
const CLOUD_INFO_MIN_TRAFFIC_CMD      = 0x07000000;     // Cmd data:  None                      Rsp data: None


var crc8_table = new Uint8Array([ 

    0, 94,188,226, 97, 63,221,131,194,156,126, 32,163,253, 31, 65,
    157,195, 33,127,252,162, 64, 30, 95,  1,227,189, 62, 96,130,220,
     35,125,159,193, 66, 28,254,160,225,191, 93,  3,128,222, 60, 98,
    190,224,  2, 92,223,129, 99, 61,124, 34,192,158, 29, 67,161,255,
     70, 24,250,164, 39,121,155,197,132,218, 56,102,229,187, 89,  7,
    219,133,103, 57,186,228,  6, 88, 25, 71,165,251,120, 38,196,154,
    101, 59,217,135,  4, 90,184,230,167,249, 27, 69,198,152,122, 36,
    248,166, 68, 26,153,199, 37,123, 58,100,134,216, 91,  5,231,185,
    140,210, 48,110,237,179, 81, 15, 78, 16,242,172, 47,113,147,205,
     17, 79,173,243,112, 46,204,146,211,141,111, 49,178,236, 14, 80,
    175,241, 19, 77,206,144,114, 44,109, 51,209,143, 12, 82,176,238,
     50,108,142,208, 83, 13,239,177,240,174, 76, 18,145,207, 45,115,
    202,148,118, 40,171,245, 23, 73,  8, 86,180,234,105, 55,213,139,
     87,  9,235,181, 54,104,138,212,149,203, 41,119,244,170, 72, 22,
    233,183, 85, 11,136,214, 52,106, 43,117,151,201, 74, 20,246,168,
    116, 42,200,150, 21, 75,169,247,182,232, 10, 84,215,137,107, 53
]);
  

// HandleUsbConflictConfirmation.......................................................................................
function HandleUsbConflictConfirmation(buttonIndex) 
{
    // buttonIndex = 0 if dialog dismissed, i.e. back button pressed.
    // buttonIndex = 1 if 'Ok'
    if( (buttonIndex == 0) || (buttonIndex == 1) )
    {
        // Ok...
        bUsbConflictDialogActive = false;
    }
}



var nxty = {

     
    SendNxtyMsg: function( uCmdByte, pMsgData, uLenByte )
    {
      var i;
      var uCrc     = new Uint8Array(1);

        
      if( isSouthBoundIfCnx == false )
      {
        PrintLog(99,  "Msg: SouthBound Hardware not connected. Can not send message." );
        return;
      }        
        
      // See if we have received a response before sending another message. 
      if( msgRxLastCmd == NXTY_WAITING_FOR_RSP )
      {
        uTxMsgNotReadyCnt++;
        
        if( uTxMsgNotReadyCnt < 5 )
        {
            
            var outText = "Cmd=0x" + uCmdByte.toString(16);    // Convert to hex output...

            
            if( uLenByte > 0 )
            {
                for( i = 0; i < pMsgData.length; i++ )
                {
                    if( i < 10 )
                    {
                        outText = outText + " " + pMsgData[i].toString(16);
                    }
                    else
                    {
                        break;
                    }
                }
            }
            
            PrintLog(99,  "Msg: Tx requested before Rx received. TxNotReadyCnt = " + uTxMsgNotReadyCnt + " abort msg: " + outText );
            return;
        }
        else
        {
            PrintLog(99,  "Msg: Tx requested before Rx received. TxNotReadyCnt = " + uTxMsgNotReadyCnt + " send Tx and clear count." );
        }
      }


      uTxMsgNotReadyCnt = 0;
      
      if( uLenByte > (NXTY_BIG_MSG_SIZE) )
      {
        // Msg len too big...
        PrintLog(99,  "Msg: Msg too long" );
        return;
      }
        

      // Check for specific V1 messages..
      if( (uCmdByte == NXTY_DOWNLOAD_START_REQ)         || 
          (uCmdByte == NXTY_DOWNLOAD_END_REQ)           || 
          (uCmdByte == NXTY_STATUS_REQ)                 ) 
      {
            if( (uLenByte + 3) <= NXTY_STD_MSG_SIZE )
            {
                // Create a new array that is initialized to all zeros...              
                var uStdBuff = new Uint8Array(NXTY_STD_MSG_SIZE);
                uStdBuff[0] = NXTY_STD_MSG_SIZE;
                uStdBuff[1] = uCmdByte;
              
             
                if( uLenByte && (pMsgData != null) )
                {
                  for( i = 0; i < uLenByte; i++ )
                  {
                    uStdBuff[2+i] = pMsgData[i];
                  }
                }
            
                // Calculate the CRC...
                uCrc = 0;
                uCrc = nxty.CalcCrc8( uStdBuff, NXTY_STD_MSG_SIZE-1, uCrc );
                uStdBuff[NXTY_STD_MSG_SIZE-1] = uCrc;
            
                // Send the data..
                WriteSouthBoundData(uStdBuff);
            }
            else
            {
                PrintLog(99,  "12-byte msg type data too long. cmd=0x" + uCmdByte.toString(16) );
            }
      }      
      else if( uCmdByte == NXTY_DOWNLOAD_TRANSFER_REQ )                     // V1 message 
      {
            if( (uLenByte + 3) <= NXTY_MED_MSG_SIZE )
            {
                // Create a new array that is initialized to all zeros...              
                var uMedBuff = new Uint8Array(NXTY_MED_MSG_SIZE);
                uMedBuff[0]  = NXTY_MED_MSG_SIZE;   
                uMedBuff[1]  = uCmdByte;
            
          
                if( uLenByte && (pMsgData != null) )
                {
                  for( i = 0; i < uLenByte; i++ )
                  {
                    uMedBuff[2+i] = pMsgData[i];
                  }
                }
            
                // Calculate the CRC...
                uCrc = 0;
                uCrc = nxty.CalcCrc8( uMedBuff, NXTY_MED_MSG_SIZE-1, uCrc );
                uMedBuff[NXTY_MED_MSG_SIZE-1] = uCrc;
                
                WriteSouthBoundData(uMedBuff);
            }
            else
            {
                PrintLog(99,  "132-byte msg type data too long. cmd=0x" + uCmdByte.toString(16) + " data len=" + uLenByte );
            }
      }
      else                  // V2 messages
      {
            if( uLenByte <= NXTY_BIG_MSG_SIZE )
            {
                // Create a new array that is initialized to all zeros...              
                var uV2Buff  = new Uint8Array(uLenByte+5);
                uV2Buff[0]  = NXTY_V2_PREFIX;   
                uV2Buff[1]  = uLenByte;   
                uV2Buff[2]  = ~uLenByte;   
                uV2Buff[3]  = uCmdByte;
            
                if( uCmdByte == NXTY_SUPER_MSG_REQ )
                {
                    bNxtySuperMsgRsp       = false;
                    iNxtySuperMsgRspStatus = NXTY_SUPER_MSG_STATUS_PENDING;
                }
          
                if( uLenByte && (pMsgData != null) )
                {
                  for( i = 0; i < uLenByte; i++ )
                  {
                    uV2Buff[4+i] = pMsgData[i];
                  }
                }
            
                // Calculate the CRC...
                uCrc = 0;
                uCrc = nxty.CalcCrc8( uV2Buff, uLenByte+4, uCrc );
                uV2Buff[uLenByte+4] = uCrc;
                   
                WriteSouthBoundData(uV2Buff);
            }
            else
            {
                PrintLog(99,  "V2 msg type data too long. cmd=0x" + uCmdByte.toString(16) + " data len=" + uLenByte );
            }
      }
    
      // Get ready to receive...
      uRxBuffIdx      = 0;
      msgRxLastCmd    = NXTY_WAITING_FOR_RSP;
      uSendCount      = 1; 
    },
     
     
     
     
     
    //------------------------------------------------------------------------------------------------------------- 
    ProcessNxtyRxMsg: function( pRxMsgData, uLenByte )
    {
        var i;
        var j;
        var bOk       = false;
        var bV2Msg    = false;
        var uRxMsgLen = NXTY_BIG_MSG_SIZE;
        
        
        if( uRxBuffIdx == 0 )
        {
            if( !((pRxMsgData[0] == NXTY_STD_MSG_SIZE) || (pRxMsgData[0] == NXTY_MED_MSG_SIZE) || (pRxMsgData[0] == NXTY_BIG_MSG_SIZE) || (pRxMsgData[0] == NXTY_V2_PREFIX)) )
            {
                uRxBuffIdx = 0;
                PrintLog(99,  "Msg: First byte should be 0x0C, 0x84, 0xFF or 0xAE:  1st byte = " + pRxMsgData[0].toString(16) + ", data tossed." );
                return;
            }
        }

        // Perform some sanity checks before copying incoming data to u8RxBuff.
        if( (uRxBuffIdx + uLenByte) > u8RxBuff.length ) 
        {
            uRxBuffIdx = 0;
            PrintLog(99, "Msg: Rx buffer overflow, data tossed.");
            return;
        }
        
        
        // Copy over the incoming data...
        var outText = pRxMsgData[0].toString(16);
        for( i = 0; i < uLenByte; i++ )
        {
            u8RxBuff[uRxBuffIdx] = pRxMsgData[i];
            uRxBuffIdx = uRxBuffIdx + 1;
            
            if( i )
            {
                outText = outText + " " + pRxMsgData[i].toString(16);
            }
        }


        // Check for V1 message...
        if( (u8RxBuff[0] == NXTY_STD_MSG_SIZE) || (u8RxBuff[0] == NXTY_MED_MSG_SIZE) || (u8RxBuff[0] == NXTY_BIG_MSG_SIZE) )
        {
            uRxMsgLen = u8RxBuff[0];   
        }
        else if( u8RxBuff[0] == NXTY_V2_PREFIX )
        {
            // V2 message...
            bV2Msg = true;
            
            // Validate the length...
            if( uRxBuffIdx >= 3 )
            {
                if( (~u8RxBuff[1] & 0xFF) == u8RxBuff[2] )
                {
                    uRxMsgLen = u8RxBuff[1] + NXTY_V2_LEN_ADD;   
                }
                else
                {
                    uRxBuffIdx = 0;
                    PrintLog(99, "Msg: V2 ~(Len) != ~Len: uRxMsg[1]=" + (~u8RxBuff[1] & 0xFF) + " uRxMsg[2]=" + u8RxBuff[2] + "  Msg tossed." );
                    return;
                }
            } 
        }

        

        // See if our buffer has a complete message...
        if( uRxBuffIdx != uRxMsgLen )
        {
            outText = outText + " [Cnt(" + uRxBuffIdx  + ") != len(" + uRxMsgLen + ") exit]";
            PrintLog(3,  "Msg Rx: " + outText );
            return;
        }

        outText = outText + " [Cnt(" + uRxBuffIdx  + ") == len(" + uRxMsgLen + ") process]";
        PrintLog(2,  "Msg Rx: " + outText );


        // Process message................................
        var uCrc     = new Uint8Array(1);
        var uCmd     = new Uint8Array(1);
  
          
        uCrc = 0;
        uCrc = nxty.CalcCrc8( u8RxBuff, uRxMsgLen-1, uCrc );
          
        if( u8RxBuff[uRxMsgLen-1] != uCrc )
        {
            PrintLog(99,  "Msg: Invalid CRC: expected: 0x" + u8RxBuff[uRxMsgLen-1].toString(16) + " calc: 0x" + uCrc.toString(16) );
            msgRxLastCmd      = NXTY_INIT; // Make sure we can send the next message.
            return;
        }
        
        if( bV2Msg == false )
        {
           uCmd = u8RxBuff[1];
        }
        else
        {
           uCmd = u8RxBuff[3];
        }
        msgRxLastCmd = uCmd;
        
        switch( uCmd )
        {
            case NXTY_DOWNLOAD_START_RSP:
            {
               PrintLog(1,  "Msg: Download Start Rsp" ); 
               
               // In javascript the shift operator, <<, works on 32-bit int.  Use the >>> to convert back to unsigned need for comparison.
               nxtySwDldStartRspAddr =   (u8RxBuff[2] << 24) |          
                                         (u8RxBuff[3] << 16) |          
                                         (u8RxBuff[4] << 8)  |        
                                          u8RxBuff[5];
                                          
               // Use the triple right shift operator to convert from signed to unsigned.                           
               nxtySwDldStartRspAddr >>>= 0;                                     
               break;
            }
               
            case NXTY_DOWNLOAD_TRANSFER_RSP:
            {          
               // Only print this a level 2 since there are so many transfer responses.
               // Also the download loop will print % complete for each response.
               PrintLog(2,  "Msg: Download Transfer Rsp" );
               nxtySwDldXferRspCont =   u8RxBuff[2];         
               break;
            }
            
            case NXTY_DOWNLOAD_END_RSP:               PrintLog(1,  "Msg: Download End Rsp" );             break;
            
            
            
            
        
            case NXTY_STATUS_RSP:
            {
                nxtyRxStatusIcd = u8RxBuff[4];

// jdo test - force ICD ver to be 0x07
// nxtyRxStatusIcd = 0x07;

                
                PrintLog(1,  "Msg: Status Rsp: ICD ver=0x" + nxtyRxStatusIcd.toString(16) );
                
                // Only grab the BoardConfig value if old ICD, <= 0x07. 
                if( nxtyRxStatusIcd <= V1_ICD )
                {
                    nxtyRxStatusHw          = (u8RxBuff[2] << 8) | u8RxBuff[3];
                    nxtyRxStatusBoardConfig = (u8RxBuff[6] << 8) | u8RxBuff[7];
                }
                            
                isNxtyStatusCurrent = true;
                break;
               }
        
            case NXTY_SET_BLUETOOTH_CNX_STATUS_RSP:
            {   
                PrintLog(1,  "Msg: Set Bluetooth Cnx Status Rsp" );
                
                // Do not count this command since this may have been initiated by the BT device. 
//                msgRxLastCmd = NXTY_WAITING_FOR_RSP;
                break;
            }
            




            ////////////////////////////////////////////////////////////////////////////////////////////
            //
            // ICD version 2.0 additions.....
            //
            case NXTY_READ_ADDRESS_RSP:
            {
                PrintLog(1,  "Msg: Read Address Rsp: Value=0x" + U8ToHexText(u8RxBuff[4]) + U8ToHexText(u8RxBuff[5]) + U8ToHexText(u8RxBuff[6]) + U8ToHexText(u8RxBuff[7]) );
               
                // In javascript the shift operator, <<, works on 32-bit int.  Use the >>> to convert back to unsigned need for comparison.
                nxtyReadAddrRsp =    (u8RxBuff[4] << 24) |          
                                     (u8RxBuff[5] << 16) |          
                                     (u8RxBuff[6] << 8)  |        
                                     u8RxBuff[7];

                bReadAddrRsp = true;
                                          
                // Use the triple right shift operator to convert from signed to unsigned.                           
//               nxtyReadAddrRsp >>>= 0; 
               break;
            }

            case NXTY_WRITE_ADDRESS_RSP:
            {
               PrintLog(1,  "Msg: Write Address Rsp: (1=pass) status=0x" + U8ToHexText(u8RxBuff[4]) );
               
               // Pass the status byte...
               nxtyWriteAddrRsp = u8RxBuff[4];
               bWriteAddrRsp = true;
               break;
            }

            case NXTY_READ_DATA_RSP:
            {

               
                if( uReadDataReqType == READ_DATA_REQ_TECH_TYPE )
                {
                    PrintLog(1,  "Msg: Read Data Rsp: Tech Type" );
                    
                    // Call the handler...
                    ProcessTechData();
                }
                else if( uReadDataReqType == READ_DATA_REQ_CELL_INFO_TYPE )
                {
                    PrintLog(1,  "Msg: Read Data Rsp: Cell Info Type" );
                   
                    // If we get a response then UNII must be up...
                    UpdateUniiIcon(true);
               
               
                    // JSON data from device looks like...
                    //     { 
                    //       “plmnid”:'0x310-0x240',
                    //       "regDataToOp": "cell info response data",
                    //     }
                    
                    
                    // V2
                    // u8RxBuff[0] = 0xAE (V2 ID)
                    // u8RxBuff[1] = len  (should be 252, 0xFC)
                    // u8RxBuff[2] = ~len (should be   3, 0x03)
                    // u8RxBuff[3] = cmd  (should be headings response, 0x52)
                    // u8RxBuff[4] to u8RxBuff[257] should be the JSON string data...
                    
                    
                    if( u8RxBuff[4] == 0x7B )   // V1) ff 43 7b    7b = '{'   V2) AE FC 03 52 7b...       
                    {
                        // JSON formatted: old stuff...
                         
                        // Find the end of the JSON string data...
                        for( i = 4; i < 257; i++ )
                        {
                            if( u8RxBuff[i] == 0 )
                            {
                                break;
                            }
                        }
            
                        var u8Sub = u8RxBuff.subarray(4, i);     // u8RxBuff[4] to [i-1].
                        var myString = bytesToString(u8Sub);
        
                        PrintLog(1, "Incoming string: " + myString );
                        
                        // Convert ID values from hex string, 0x12345678, to decimal string, 305419896.
                        // Incoming: "ID:0x12345678,<freq>,<power>,ID:0x12345678..."
                        // Outgoing: "ID:305419896,<freq>,<power>..."
                      
                        
                        // Replace up to 8 hex numbers with decimal...
                        for( i = 0; i < 8; i++ )
                        {
                            var idx = myString.indexOf("0x");
                             
                            if( idx != -1 )
                            {
                                var myStrHex = myString.slice(idx,idx+10);                      // Isolate the 0x12345678 number
                                var myNum    = parseInt(myStrHex);                              // Convert it to a decimal number
                                var myStrDec = myString.replace(myStrHex, myNum.toString() );   // Convert back to a string and replace it in the org string
                                myString     = myStrDec;
                            }
                            else
                            {
                                // No more hex values to convert...
                                break;
                            }
                        }
                        
                        PrintLog(1, "Converted string: " + myString );                
                        
                        var myData   = JSON.parse(myString);
                    
                   
                        // Fill in the global variables...
    //                  myPlmnid       = myData.plmnid;
                        myPlmnid       = "Not needed";
                        myRegDataToOp  = myData.regDataToOp;
                    }
                    else
                    {
                        myPlmnid       = "Not needed";
                        myRegDataToOp  = "";
                        
                        // Binary data:
                        // 4 bytes PLMNID
                        // 12 bytes as follows for each cell ID
                        //   4-bytes:  28bit id
                        //   1-byte:   1=LTE  0=WCDMA
                        //   1-byte:   bd
                        //   2-bytes:  freq 100 KHz
                        //   2-bytes:  RscpRsrp
                        //   2-bytes:  spare
                       
                        var  my28BitId;
                        var  myFreq100KHz;
                        var  myRscpRsrp;
                       
                        var u8Sub = u8RxBuff.subarray(4, 255);     // u8RxBuff[4] to [i-1].    0xAE FC 03 52 plmnid[0], [1], [2], [3], 28bitid[0] etc.
                       
                       
                        var outText = u8Sub[0].toString(16);    // Convert to hex output...
                        for( i = 1; i < u8Sub.length; i++ )
                        {
                            outText = outText + " " + u8Sub[i].toString(16);
                        }
                        PrintLog(3,  "Cell Info: " + outText );
                       
                        var j;
                        var tech     = 0;
                        var band     = 0; 
                     
                        for( i = 0; i < 16; i++ )                // Allow up to 16 IDs.
                        {
                            j = 4 + i * 12;                      // Bump past the 4-byte PLMNID.
                            my28BitId = (u8Sub[j++] << 24) |          
                                        (u8Sub[j++] << 16) |          
                                        (u8Sub[j++] << 8)  |        
                                        u8Sub[j++];
                            
                            if( my28BitId )
                            {
                                
                                if( myRegDataToOp.length )
                                {
                                  myRegDataToOp  += ", ";
                                }
                                
                                myRegDataToOp  += "ID:" + my28BitId;                    // 28-bit ID
                                
                                tech = u8Sub[j++];
                                if( tech )                                        // Tech
                                {
                                    myRegDataToOp  += ",L";
                                }
                                else
                                {
                                    myRegDataToOp  += ",W";
                                }
                                
                                band = u8Sub[j++];
                                myRegDataToOp  += "," + band;                           // bd
                                
                                myFreq100KHz = (u8Sub[j++] << 8) | u8Sub[j++];          // freq 100 KHz
                                myRegDataToOp  += "," + myFreq100KHz;   
                                
                                myRegDataToOp  += "," + ConvertFreqToArfcn( tech, band, myFreq100KHz);  // Add UARFCN (WCDMA) or EARFCN (LTE)   
                                
                                
                                if( u8Sub[j] & 0x80 )
                                {
                                    // Make negative
                                    myRscpRsrp = (0xFF << 24)       |          
                                                 (0xFF << 16)       |          
                                                 (u8Sub[j++] << 8)  |        
                                                 u8Sub[j++];
                                }
                                else
                                {                 
                                    myRscpRsrp   = (u8Sub[j++] << 8) | u8Sub[j++];          // RSCP RSRP
                                }
                                myRegDataToOp  += "," + myRscpRsrp;  
                            }
                        }
                       
                       
                        // If no cells found then we have to fill myRegDataToOp with something because Axeda has an issue with null data.
                        if( myRegDataToOp.length == 0 )
                        {
                            myRegDataToOp  += "No cell data found";
                        }
                    }
                    
                } // endif( uReadDataReqType == READ_DATA_REQ_CELL_INFO_TYPE )
                
                bReadDataRsp = true;
                break;
            }

            case NXTY_SUPER_MSG_RSP:
            {

               
                if( nxtyCurrentReq == NXTY_SUPER_MSG_INFO_TYPE )
                {
                    PrintLog(1,  "Super Msg Rsp: Get Info" );
                
                    //                   Write System SN MSD   Read             Write System SN LSD   Read            Write unique ID MSD   Read           Write unique ID LSD   Read
                    // Tx: ae xx xx 13   11 f0 0 0 20 0 0 0 9  10 f0 0 0 1c     11 f0 0 0 20 0 0 0 8  10 f0 0 0 1c    11 f0 0 0 20 0 0 0 2  10 f0 0 0 1c   11 f0 0 0 20 0 0 0 1  10 f0 0 0 1c  
                    // Rx  ae xx xx 53   51 1                  50 0 0 90 4      51 1                  50 40 0 0 38    51 1                  50 9c 13 23 3a 51 1                  50 24 a3 a 20 
                    //     [0]                                        [9]                                [14]                                 [21]                                  [28]
                    
                    //                   Write SW Ver          Read             Write Build ID        Read            Write PIC SW Ver      Read           Write BT SW Ver       Read              
                    //                   11 f0 0 0 20 0 0 0 4  10 f0 0 0 1c     11 f0 0 0 20 0 0 0 3  10 f0 0 0 1c    11 f0 0 0 20 0 0 0 d  10 f0 0 0 1c   11 f0 0 0 20 0 0 0 f  10 f0 0 0 1c 2e  
                    //                   51 1                  50 0 ed ed ed    51 1                  50  5 1 0 18    51 1                  50 0 0 2 56    51 1                  50 0 0 1 2         
                    //                      [33]                    [36]           [40]                   [42]           [47]                      [51]       [54]                      [58]
                    
                    //                   Write Ant              Read            Write Board Config    Read            Write Cloud Buff Addr Read             Read Cloud Info     Read Global Flags          
                    //                   11 f0 0 0 20 0 0 0 10  10 f0 0 0 1c    11 f0 0 0 20 0 0 0 5  10 f0 0 0 1c    11 f0 0 0 20 0 0 0 E  10 f0 0 0 1c     10 f0 0 0 28        10 f0 0 0 38
                    //                   51 1                   50 5f f3 b4 58  51 1                  50  0 0 0 7     51 1                  50  x x x x      50 0 2 10 0         50 0  0 0 0
                    //                      [61]                   [63]            [68]                       [72]       [75]                   [77]            [82]             [86]
                    

                    // Make sure that there were no NAKs...
                    if( (u8RxBuff[4]  == NXTY_NAK_RSP) || (u8RxBuff[6]  == NXTY_NAK_RSP) ||     // SN MSD 
                        (u8RxBuff[11] == NXTY_NAK_RSP) || (u8RxBuff[13] == NXTY_NAK_RSP) ||     // SN LSD
                        (u8RxBuff[18] == NXTY_NAK_RSP) || (u8RxBuff[20] == NXTY_NAK_RSP) ||     // Unique MSD
                        (u8RxBuff[25] == NXTY_NAK_RSP) || (u8RxBuff[27] == NXTY_NAK_RSP) ||     // Unique LSD
                        (u8RxBuff[32] == NXTY_NAK_RSP) || (u8RxBuff[34] == NXTY_NAK_RSP) ||     // Ares SW Ver
                        (u8RxBuff[39] == NXTY_NAK_RSP) || (u8RxBuff[41] == NXTY_NAK_RSP) ||     // Build ID
                        (u8RxBuff[46] == NXTY_NAK_RSP) || (u8RxBuff[48] == NXTY_NAK_RSP) ||     // PIC SW Ver
                        (u8RxBuff[53] == NXTY_NAK_RSP) || (u8RxBuff[55] == NXTY_NAK_RSP) ||     // BT SW Ver
                        (u8RxBuff[60] == NXTY_NAK_RSP) || (u8RxBuff[62] == NXTY_NAK_RSP) ||     // Ant
                        (u8RxBuff[67] == NXTY_NAK_RSP) || (u8RxBuff[69] == NXTY_NAK_RSP) ||     // Board Config
                        (u8RxBuff[74] == NXTY_NAK_RSP) || (u8RxBuff[76] == NXTY_NAK_RSP) ||     // Cloud Buff Addr
                        (u8RxBuff[81] == NXTY_NAK_RSP) || (u8RxBuff[86] == NXTY_NAK_RSP))                                        // Cloud Info
                        
                    {
                        // Got a NAK...
                        iNxtySuperMsgRspStatus = NXTY_SUPER_MSG_STATUS_FAIL_NAK;
                        PrintLog(99,  "Super Msg: Info msg type encountered a NAK." );
                    }
                    else
                    {
                    
                        // Make sure that all of the writes were successfull...
                        if( (u8RxBuff[5]  == 1) &&      // SN MSD 
                            (u8RxBuff[12] == 1) &&      // SN LSD
                            (u8RxBuff[19] == 1) &&      // Unique MSD
                            (u8RxBuff[26] == 1) &&      // Unique LSD
                            (u8RxBuff[33] == 1) &&      // Ares SW Ver
                            (u8RxBuff[40] == 1) &&      // Build ID
                            (u8RxBuff[47] == 1) &&      // PIC SW Ver
                            (u8RxBuff[54] == 1) &&      // BT SW Ver
                            (u8RxBuff[61] == 1) &&      // Ant
                            (u8RxBuff[68] == 1) &&      // Board Config
                            (u8RxBuff[75] == 1) )       // Cloud Buff Addr
                            
                        {
                            iNxtySuperMsgRspStatus = NXTY_SUPER_MSG_STATUS_SUCCESS;
                        
                            // Board Config:  Get Board Config 1st since this tells us if we are connected
                            // to a CU or NU.
                            nxtyRxStatusBoardConfig = (u8RxBuff[72] << 8) | u8RxBuff[73];
                            
                            if( myModel == null )
                            {
//                                myModel = "MN" + (nxtyRxStatusBoardConfig | 0x01);    // We now use the SKU as the Model number
                            }
                            
                            if( nxtyRxStatusBoardConfig & IM_A_CU_MASK )
                            {
                                PrintLog(1,  "  Connected to CU: Board Config=0x" + nxtyRxStatusBoardConfig.toString(16) );
                            }
                            else if( nxtyRxStatusBoardConfig & IM_A_1BOX_NU_MASK )
                            {
                                PrintLog(1,  "  Connected to 1-BOX NU: Board Config=0x" + nxtyRxStatusBoardConfig.toString(16) );
                            }
                            else
                            {
                                PrintLog(1,  "  Connected to NU: Board Config=0x" + nxtyRxStatusBoardConfig.toString(16) );
                            }
                            
                        
                        
                            // System SN.......................................................
                            if( mySn == null )
                            {
                                mySn = "";
                                for( i = 0; i < 6; i++ )
                                {
                                    if( i < 2 )
                                    {
                                        mySn += U8ToHexText(u8RxBuff[9+i]);
                                    }
                                    else
                                    {
                                        mySn += U8ToHexText(u8RxBuff[12+i]);    // [14] but i is already 2 so 14-2=12
                                    }
                                }
                                PrintLog(1,  "  SN=" + mySn);
                            }                        
                            
                            // Unique ID .......................................................
                            if( nxtyUniqueId == null )
                            {
                                nxtyUniqueId = "0x";
                                for( i = 0; i < 8; i++ )
                                {
                                    if( i < 4 )
                                    {
                                        u8UniqueId[i] = u8RxBuff[21+i];
                                        nxtyUniqueId += U8ToHexText(u8RxBuff[21+i]);
                                    }
                                    else
                                    {
                                        u8UniqueId[i] = u8RxBuff[24+i];                 // [28] but i is already 4 so 28-4=24
                                        nxtyUniqueId += U8ToHexText(u8RxBuff[24+i]);
                                    }
                                }
                                PrintLog(1,  "  UniqueID=" + nxtyUniqueId);
                            }
                            
    
                            // Ares SW Version .......................................................
                            // From Louis email on 12/17/14:
                            //   For Ares:
                            //   If the version number reads 0x00500A, change this to 0x005010 and proceed to the next step
                            //   Read the version as XXXYYY BCD, show this as 700N036-XXX-YYY (or 700.036.XXX.YYY where only digits are allowed).
                            var major = (u8RxBuff[36] << 4) | (u8RxBuff[37] >> 4);
                            var minor = ((u8RxBuff[37] & 0x0F) << 8) | u8RxBuff[38];
                           
                            // Convert the Sw Version of 0xEDEDED to 0x000000 before sending to cloud.
                            if( major > 999 )    // 0xEDE or 3806
                            {
                                major = 0;
                            }
                           
                            if( minor > 999 )    // 0xDED or 3565
                            {
                                minor = 0;
                            }
                           
                            if( nxtyRxStatusBoardConfig & IM_A_CU_MASK )
                            {
                                nxtySwVerCuCf   = HexTo3Text(major) + "." + HexTo3Text(minor);
                                nxtySwBuildIdCu = "0x" + U8ToHexText(u8RxBuff[42]) + U8ToHexText(u8RxBuff[43]) + U8ToHexText(u8RxBuff[44]) + U8ToHexText(u8RxBuff[45]);
                                PrintLog(1,  "  CU SW Version: Ver=" + nxtySwVerCuCf + " BuildID=" + nxtySwBuildIdCu);
                            }
                            else
                            {
                                nxtySwVerNuCf   = HexTo3Text(major) + "." + HexTo3Text(minor);
                                nxtySwBuildIdNu = "0x" + U8ToHexText(u8RxBuff[42]) + U8ToHexText(u8RxBuff[43]) + U8ToHexText(u8RxBuff[44]) + U8ToHexText(u8RxBuff[45]);
                                PrintLog(1,  "  NU SW Version: Ver=" + nxtySwVerNuCf + " BuildID=" + nxtySwBuildIdNu);
                            }
                            
    
    
                            // PIC SW Version .......................................................
                            if( nxtyRxStatusBoardConfig & IM_A_CU_MASK )
                            {
                                // If the PIC returns -1, which means that it cannot read the version from flash, may be due to CRC issue, 
                                // then convert the -1, 0xFFFF, to "000.000".
                                if( (u8RxBuff[51] == 0xFF) && (u8RxBuff[52] == 0xFF) )
                                {
                                    nxtySwVerCuPic = "000.000" 
                                }
                                else
                                {
                                    nxtySwVerCuPic  = DecTo3Text(u8RxBuff[51] & 0x0F) + "." + DecTo3Text(u8RxBuff[52]); 
                                }
                                PrintLog(1,  "  CU PIC SW Version=" + nxtySwVerCuPic);
                            }
                            else
                            {
                                if( (u8RxBuff[51] == 0xFF) && (u8RxBuff[52] == 0xFF) )
                                {
                                    nxtySwVerNuPic = "000.000" 
                                }
                                else
                                {
                                    nxtySwVerNuPic  = DecTo3Text(u8RxBuff[51] & 0x0F) + "." + DecTo3Text(u8RxBuff[52]); 
                                }
                                PrintLog(1,  "  NU PIC SW Version=" + nxtySwVerNuPic);
                            }
    
    
                            // BT SW Version .......................................................
                            if( nxtyRxStatusBoardConfig & IM_A_CU_MASK )
                            {
                                // If the BT returns 0xFFFF, which means that it cannot read the version from flash, may be due to empty flash, 
                                // then convert the 0xFFFF to "000.000".
                                if( (u8RxBuff[58] == 0xFF) && (u8RxBuff[59] == 0xFF) )
                                {
                                    nxtySwVerCuBt = "000.000" 
                                }
                                else
                                {
                                    nxtySwVerCuBt    = "0" + U8ToHexText(u8RxBuff[58]) + "." + "0" + U8ToHexText(u8RxBuff[59]); 
                                }
                                PrintLog(1,  "  CU BT Ver=" + nxtySwVerCuBt);
                            }
                            else
                            {
                                // jdo todo:  Add NuBt logic...
                            }
    
    
    
                            // Antenna .......................................................
                            if( !(nxtyRxStatusBoardConfig & IM_A_CU_MASK) )
                            {
                                // Antenna data is only available on the NU...
                                nxtyAntStatus  =  (u8RxBuff[63] << 24) |          
                                                  (u8RxBuff[64] << 16) |          
                                                  (u8RxBuff[65] << 8)  |        
                                                   u8RxBuff[66];

                                // Use the triple right shift operator to convert from signed to unsigned.                           
                                nxtyAntStatus >>>= 0;  

                                // Global data is only available on the NU...
                                nxtyGlobalFlags = (u8RxBuff[87] << 24) |          
                                                  (u8RxBuff[88] << 16) |          
                                                  (u8RxBuff[89] << 8)  |        
                                                   u8RxBuff[90];
                                                   
                                nxtyGlobalFlags >>>= 0;  
                                                
                                if( nxtyAntStatus == ANT_STATUS_NO_EXT )
                                {
                                    guiAntennaFlag = false;
                                }
                                else
                                {
                                    guiAntennaFlag = true;          // Set to true if ant check returns non 0xFFFFFFFF.
                                }
                                
                                PrintLog(1,  "  Ant Status=0x" + nxtyAntStatus.toString(16) + " Global Flags=0x" + nxtyGlobalFlags.toString(16));
                                
                            }
                            
                            // Cloud Buff Addr and Cloud Info ................................................
                            if( nxtyRxStatusBoardConfig & IM_A_CU_MASK )
                            {
                                nxtyCuCloudBuffAddr =  (u8RxBuff[77] << 24) |          
                                                       (u8RxBuff[78] << 16) |          
                                                       (u8RxBuff[79] << 8)  |        
                                                        u8RxBuff[80];
                                                    
                                nxtyCuCloudInfo     =  (u8RxBuff[82] << 24) |          
                                                       (u8RxBuff[83] << 16) |          
                                                       (u8RxBuff[84] << 8)  |        
                                                        u8RxBuff[85];
                            }
                            else
                            {
                            
                                nxtyNuCloudBuffAddr =  (u8RxBuff[77] << 24) |          
                                                       (u8RxBuff[78] << 16) |          
                                                       (u8RxBuff[79] << 8)  |        
                                                        u8RxBuff[80];
                                                    
                                nxtyNuCloudInfo     =  (u8RxBuff[82] << 24) |          
                                                       (u8RxBuff[83] << 16) |          
                                                       (u8RxBuff[84] << 8)  |        
                                                        u8RxBuff[85];
                            
                            
                            
//                               nxtyRxRegLockStatus  = u8RxBuff[83];
                            }
    
                        }
                        else
                        {
                            iNxtySuperMsgRspStatus = NXTY_SUPER_MSG_STATUS_FAIL_WRITE;
                            PrintLog(99,  "Super Msg: Info msg type encountered write fail." );
                        }
                        
                    }   // NAK check             
                
                }               
                else if( nxtyCurrentReq == NXTY_SUPER_MSG_LINK_STATE )
                {
                    //                   Write Link State      Read  
                    // Tx: ae xx xx 13   11 f0 0 0 20 0 0 0 6  10 f0 0 0 1c  
                    // Rx  ae xx xx 53   51 1                  50 0 0 0 1 
                    //     [0]              [5]                         [10]
                    

                    if( (u8RxBuff[4]  == NXTY_NAK_RSP) || (u8RxBuff[6]  == NXTY_NAK_RSP) ) 
                    {
                        // Got a NAK...
                        iNxtySuperMsgRspStatus = NXTY_SUPER_MSG_STATUS_FAIL_NAK;
                        PrintLog(99,  "Super Msg: Link State msg type encountered a NAK." );
                    }
                    else
                    {
                        // Make sure that all of the writes were successfull...
                        if( u8RxBuff[5] == 1 ) 
                        {
                            iNxtySuperMsgRspStatus = NXTY_SUPER_MSG_STATUS_SUCCESS;
                            bUniiUp = (u8RxBuff[10])?true:false;
                            UpdateUniiIcon(bUniiUp);
                            
                            
                            var outText = "Super Msg Rsp: Link State: ";
                            outText += bUniiUp?"Up":"Down";
                            PrintLog(1,  outText );
                        }
                        else
                        {
                            iNxtySuperMsgRspStatus = NXTY_SUPER_MSG_STATUS_FAIL_WRITE;
                            PrintLog(99,  "Super Msg: Link State msg type encountered write fail." );
                        }
                    }
                }
                else if( nxtyCurrentReq == NXTY_SUPER_MSG_PARAM_SELECT )
                {
                    //                   Select Param 1        Read             Select Param 2        Read  
                    // Tx: ae xx xx 13   11 f0 0 0 20 0 0 0 6  10 f0 0 0 1c     11 f0 0 0 20 0 0 0 6  10 f0 0 0 1c 
                    // Rx  ae xx xx 53   51 1                  50 0 0 0 0       51 1                  50 0 0 0 1 
                    //     [0]              [5]                   [7]              [12]                  [14]
                    
                    if( (u8RxBuff[4]  == NXTY_NAK_RSP) || (u8RxBuff[6]  == NXTY_NAK_RSP) || 
                        (u8RxBuff[11] == NXTY_NAK_RSP) || (u8RxBuff[13] == NXTY_NAK_RSP) ) 
                    {
                        // Got a NAK...
                        iNxtySuperMsgRspStatus = NXTY_SUPER_MSG_STATUS_FAIL_NAK;
                        PrintLog(99,  "Super Msg: Param Select msg type encountered a NAK." );
                    }
                    else
                    {
                    
                        // Make sure that all of the writes were successfull...
                        if( (u8RxBuff[5] == 1) && (u8RxBuff[12] == 1) ) 
                        {
                            iNxtySuperMsgRspStatus = NXTY_SUPER_MSG_STATUS_SUCCESS;
                            nxtySelParamRegOneRsp =  (u8RxBuff[7] << 24) |          
                                                     (u8RxBuff[8] << 16) |          
                                                     (u8RxBuff[9] << 8)  |        
                                                      u8RxBuff[10];

                            // Use the triple right shift operator to convert from signed to unsigned.                           
                            nxtySelParamRegOneRsp >>>= 0;  
    
                            nxtySelParamRegTwoRsp =  (u8RxBuff[14] << 24) |          
                                                     (u8RxBuff[15] << 16) |          
                                                     (u8RxBuff[16] << 8)  |        
                                                      u8RxBuff[17];

                            // Use the triple right shift operator to convert from signed to unsigned.                           
                            nxtySelParamRegTwoRsp >>>= 0;  
                     
                            PrintLog(1,  "Super Msg Rsp: Param Select: param1=0x" + nxtySelParamRegOneRsp.toString(16) + " param2=0x" + nxtySelParamRegTwoRsp.toString(16) );
                                                      
                        }
                        else
                        {
                            iNxtySuperMsgRspStatus = NXTY_SUPER_MSG_STATUS_FAIL_WRITE;
                            PrintLog(99,  "Super Msg: Param Select msg type encountered write fail." );
                        }
                    }
                }
                else if( nxtyCurrentReq == NXTY_SUPER_MSG_REDIRECT_UART )
                {
                    // Read the BoardConfig after redirecting the UART to verify that the UART has been redirected...

                    //                   Write UART redirect    Write BoardConfig      Read  
                    // Tx: ae 62 9d 13   11 f0 0 0 24 0 0 0 1   11 f0 0 0 20 0 0 0 6  10 f0 0 0 1c  
                    // Rx  ae 31 ce 53   51 1                   51 1                  50 0 0 0 7 
                    //     [0]              [5]                    [7]                      [11]
                    
                    if( (u8RxBuff[4]  == NXTY_NAK_RSP) || (u8RxBuff[6]  == NXTY_NAK_RSP) || (u8RxBuff[8]  == NXTY_NAK_RSP) ) 
                    {
                        // Got a NAK...
                        iNxtySuperMsgRspStatus = NXTY_SUPER_MSG_STATUS_FAIL_NAK;
                        PrintLog(99,  "Super Msg: Redirect UART msg type encountered a NAK." );
                    }
                    else
                    {
                    
                        // Make sure that all of the writes were successfull...
                        if( (u8RxBuff[5] == 1) && (u8RxBuff[7] == 1) ) 
                        {
                            iNxtySuperMsgRspStatus = NXTY_SUPER_MSG_STATUS_SUCCESS;
                            nxtyRxStatusBoardConfig = (u8RxBuff[11] << 8) | u8RxBuff[12];
    
                            var outText = "Super Msg Rsp: UART Redirected to: ";
                            outText += (nxtyRxStatusBoardConfig & IM_A_CU_MASK)?"CU":"NU";
                            PrintLog(1,  outText );
                        }
                        else
                        {
                            iNxtySuperMsgRspStatus = NXTY_SUPER_MSG_STATUS_FAIL_WRITE;
                            PrintLog(99,  "Super Msg: Redirect UART msg type encountered write fail." );
                        }
                    }
                }
                else if( nxtyCurrentReq == NXTY_SUPER_MSG_CANCEL_REDIRECT_UART )
                {
                    // Read the BoardConfig after canceling the UART redirection to verify that the UART has been made local...

                    //                   Read UART redirect    Write BoardConfig      Read  
                    // Tx: ae 62 9d 13   10 f0 0 0 24          11 f0 0 0 20 0 0 0 6  10 f0 0 0 1c  
                    // Rx  ae 31 ce 53   50 0  0 0 0           51 1                  50 0 0 0 7 
                    //     [0]           [4]                   [9]                   [11]
                    
                    if( (u8RxBuff[4]  == NXTY_NAK_RSP) || (u8RxBuff[9]  == NXTY_NAK_RSP) || (u8RxBuff[11]  == NXTY_NAK_RSP) ) 
                    {
                        // Got a NAK...
                        iNxtySuperMsgRspStatus = NXTY_SUPER_MSG_STATUS_FAIL_NAK;
                        PrintLog(99,  "Super Msg: Cancel UART Redirect msg type encountered a NAK." );
                    }
                    else
                    {
                    
                        // Make sure that all of the writes were successfull...
                        if( (u8RxBuff[10] == 1) ) 
                        {
                            iNxtySuperMsgRspStatus = NXTY_SUPER_MSG_STATUS_SUCCESS;
                            nxtyRxStatusBoardConfig = (u8RxBuff[14] << 8) | u8RxBuff[15];
    
                            var outText = "Super Msg Rsp: UART Redirected to: ";
                            outText += (nxtyRxStatusBoardConfig & IM_A_CU_MASK)?"CU":"NU";
                            PrintLog(1,  outText );
                        }
                        else
                        {
                            iNxtySuperMsgRspStatus = NXTY_SUPER_MSG_STATUS_FAIL_WRITE;
                            PrintLog(99,  "Super Msg: Redirect UART msg type encountered write fail." );
                        }
                    }
                }
                else if( nxtyCurrentReq == NXTY_SUPER_MSG_SET_ANT_STATE )
                {
                
                
                    //                   Redirect UART         Write Antenna State      Read Global             
                    // Tx: ae xx xx 13   11 f0 0 0 24 0 0 0 1  11 f0 0 0 20 0 0 0 10    10 f0 0 0 38            
                    // Rx  ae xx xx 53   51 1                  51 1                     50 0 0 0 1                              
                    //     [0]           [4]                   [6]                      [8]                                     
                    

                    if( (u8RxBuff[4]  == NXTY_NAK_RSP) || (u8RxBuff[6]  == NXTY_NAK_RSP) || (u8RxBuff[8]  == NXTY_NAK_RSP) ) 
                    {
                        // Got a NAK...
                        iNxtySuperMsgRspStatus = NXTY_SUPER_MSG_STATUS_FAIL_NAK;
                        PrintLog(99,  "Super Msg: Set Ant State msg type encountered a NAK." );
                    }
                    else
                    {
                        // Make sure that all of the writes were successfull...
                        if( (u8RxBuff[5] == 1) && (u8RxBuff[7] == 1) ) 
                        {
                            iNxtySuperMsgRspStatus = NXTY_SUPER_MSG_STATUS_SUCCESS;

                            // Update the Global flag data ...
                            nxtyGlobalFlags = (u8RxBuff[9] << 24) |          
                                              (u8RxBuff[10] << 16) |          
                                              (u8RxBuff[11] << 8)  |        
                                               u8RxBuff[12];
                                               
                            nxtyGlobalFlags >>>= 0;  

                        }
                        else
                        {
                            iNxtySuperMsgRspStatus = NXTY_SUPER_MSG_STATUS_FAIL_WRITE;
                            PrintLog(99,  "Super Msg: Set Ant State msg type encountered write fail." );
                        }
                    }
                }
                else if( nxtyCurrentReq == NXTY_SUPER_MSG_RESET_ARES )
                {
                    //                   Write 0xBEDA221E to 0xF0000040     Read 0xF8100000             
                    // Tx: ae xx xx 13   11 f0 0 0 40 BE DA 22 1E           10 f8 10 00 00            
                    // Rx  ae xx xx 53   51 1                               50 00 00 00 00                              
                    //     [0]           [4]                                [6]                                     
                    

                    if( (u8RxBuff[4]  == NXTY_NAK_RSP) || (u8RxBuff[6]  == NXTY_NAK_RSP) ) 
                    {
                        // Got a NAK...
                        iNxtySuperMsgRspStatus = NXTY_SUPER_MSG_STATUS_FAIL_NAK;
                        PrintLog(99,  "Super Msg: Reset Ares msg type encountered a NAK." );
                    }
                    else
                    {
                        // Make sure that all of the writes were successfull...
                        if( (u8RxBuff[5] == 1) ) 
                        {
                            iNxtySuperMsgRspStatus = NXTY_SUPER_MSG_STATUS_SUCCESS;
                        }
                        else
                        {
                            iNxtySuperMsgRspStatus = NXTY_SUPER_MSG_STATUS_FAIL_WRITE;
                            PrintLog(99,  "Super Msg: Reset Ares msg type encountered write fail." );
                        }
                    }
                }
                else if( nxtyCurrentReq == NXTY_SUPER_MSG_RESET_REMOTE_UNIT )
                {
                    //                   Redirect UART         Write reset             
                    // Tx: ae xx xx 13   11 f0 0 0 24 0 0 0 1  11 82 00 02 58 DE AD BE EF            
                    // Rx  ae xx xx 53   51 1                  51 1                                               
                    //     [0]           [4]                   [6]                                                       
                    

                    if( (u8RxBuff[4]  == NXTY_NAK_RSP) || (u8RxBuff[6]  == NXTY_NAK_RSP) ) 
                    {
                        // Got a NAK...
                        iNxtySuperMsgRspStatus = NXTY_SUPER_MSG_STATUS_FAIL_NAK;
                        PrintLog(99,  "Super Msg: Reset remote unit msg type encountered a NAK." );
                    }
                    else
                    {
                        // Make sure that all of the writes were successfull...
                        if( (u8RxBuff[5] == 1) && (u8RxBuff[7] == 1) ) 
                        {
                            iNxtySuperMsgRspStatus = NXTY_SUPER_MSG_STATUS_SUCCESS;
                        }
                        else
                        {
                            iNxtySuperMsgRspStatus = NXTY_SUPER_MSG_STATUS_FAIL_WRITE;
                            PrintLog(99,  "Super Msg: Reset remote unit msg type encountered write fail." );
                        }
                    }
                }
                else if( nxtyCurrentReq == NXTY_SUPER_MSG_RESET_LOCAL_UNIT )
                {
                    //                   Redirect UART         Write reset             
                    // Tx: ae xx xx 13   11 f0 0 0 24 0 0 0 1  11 84 30 04 58 DE AD BE EF            
                    // Rx  ae xx xx 53   51 1                  51 1                                               
                    //     [0]           [4]                   [6]                                                       
                    

                    if( (u8RxBuff[4]  == NXTY_NAK_RSP) || (u8RxBuff[6]  == NXTY_NAK_RSP) ) 
                    {
                        // Got a NAK...
                        iNxtySuperMsgRspStatus = NXTY_SUPER_MSG_STATUS_FAIL_NAK;
                        PrintLog(99,  "Super Msg: Reset local unit msg type encountered a NAK." );
                    }
                    else
                    {
                        // Make sure that all of the writes were successfull...
                        if( (u8RxBuff[5] == 1) && (u8RxBuff[7] == 1) ) 
                        {
                            iNxtySuperMsgRspStatus = NXTY_SUPER_MSG_STATUS_SUCCESS;
                        }
                        else
                        {
                            iNxtySuperMsgRspStatus = NXTY_SUPER_MSG_STATUS_FAIL_WRITE;
                            PrintLog(99,  "Super Msg: Reset local unit msg type encountered write fail." );
                        }
                    }
                }
                else if( nxtyCurrentReq == NXTY_SUPER_MSG_GET_BOOSTER_DATA )
                {
                    //                   SecuredBands3G         Read             SecuredBands4G         Read  
                    // Tx: ae xx xx 13   11 f0 0 0 20 0 0 0 14  10 f0 0 0 1c     11 f0 0 0 20 0 0 0 15  10 f0 0 0 1c 
                    // Rx  ae xx xx 53   51 1                   50 0 0 0 0       51 1                   50 0 0 0 1 
                    //     [0]              [5]                   [7]              [12]                  [14]
                    //
                    //                   BandMask3G            Read             BandMask4G            Read  
                    //                   11 f0 0 0 20 1 2 0 0  10 f0 0 0 1c     11 f0 0 0 20 1 3 0 0  10 f0 0 0 1c 
                    //                   51 1                  50 0 0 0 0       51 1                  50 0 0 0 1 
                    //     [0]              [19]                 [21]             [26]                  [28]

                    
                    if( (u8RxBuff[4]  == NXTY_NAK_RSP) || (u8RxBuff[6]  == NXTY_NAK_RSP) || (u8RxBuff[11] == NXTY_NAK_RSP) || (u8RxBuff[13] == NXTY_NAK_RSP) ||
                        (u8RxBuff[18] == NXTY_NAK_RSP) || (u8RxBuff[20] == NXTY_NAK_RSP) || (u8RxBuff[25] == NXTY_NAK_RSP) || (u8RxBuff[27] == NXTY_NAK_RSP) ) 
                    {
                        // Got a NAK...
                        iNxtySuperMsgRspStatus = NXTY_SUPER_MSG_STATUS_FAIL_NAK;
                        PrintLog(99,  "Super Msg: Get Booster Data msg type encountered a NAK." );
                    }
                    else
                    {
                    
                        // Make sure that all of the writes were successfull...
                        if( (u8RxBuff[5] == 1) && (u8RxBuff[12] == 1) && (u8RxBuff[19] == 1) && (u8RxBuff[26] == 1) ) 
                        {
                            iNxtySuperMsgRspStatus = NXTY_SUPER_MSG_STATUS_SUCCESS;
                            nxtySecuredBands3G     =  (u8RxBuff[7]  << 24) | (u8RxBuff[8]  << 16) | (u8RxBuff[9]  << 8) | u8RxBuff[10];
                            nxtySecuredBands4G     =  (u8RxBuff[14] << 24) | (u8RxBuff[15] << 16) | (u8RxBuff[16] << 8) | u8RxBuff[17];
                            nxtyBandMask3G         =  (u8RxBuff[21] << 24) | (u8RxBuff[22] << 16) | (u8RxBuff[23] << 8) | u8RxBuff[24];
                            nxtyBandMask4G         =  (u8RxBuff[28] << 24) | (u8RxBuff[29] << 16) | (u8RxBuff[30] << 8) | u8RxBuff[31];
                            
                            // Use the triple right shift operator to convert from signed to unsigned.                           
                            nxtySecuredBands3G >>>= 0;  
                            nxtySecuredBands4G >>>= 0;  
                            nxtyBandMask3G     >>>= 0;  
                            nxtyBandMask4G     >>>= 0;  
                     
                            // Now calculate the bands and the mode from the data..
                            var uTemp = 0;
                            for( i = 0; i < 32; i++ )
                            {
                                uTemp = 0;
                               
                                if( (nxtySecuredBands3G | nxtySecuredBands4G) & (0x01 << i) )
                                {
                                    uTemp = i+1;
                                }
                
                                if( uTemp )
                                {
                                    for( j = 0; j < guiBoosterBands.length; j++ )
                                    {
                                        if( guiBoosterBands[j] == 0 )
                                        {
                                            guiBoosterBands[j] = uTemp;
                                            break;
                                        }
                                    }
                                }
                            }
                            
                            
                            
                            guiBoosterCurrentMode   = GO_MODE_AUTO;  // Set default
                            
                            if( (nxtyBandMask3G == GO_ALL_BANDS) && (nxtyBandMask4G == GO_ALL_BANDS) )
                            {
                                guiBoosterCurrentMode = GO_MODE_AUTO;                 
                            }
                            else if( (nxtyBandMask3G == GO_ALL_BANDS) && (nxtyBandMask4G == 0x00) )
                            {
                                guiBoosterCurrentMode = GO_MODE_3G;                 
                            }
                            else if( (nxtyBandMask3G == 0x00) && (nxtyBandMask4G == GO_ALL_BANDS) )
                            {
                                guiBoosterCurrentMode = GO_MODE_4G;                 
                            }
                            else
                            {
                                // Look for bands.........
                                for( i = 0; i < guiBoosterBands.length; i++ )
                                {
                                  uTemp = 0x01 << (guiBoosterBands[i]-1);
                                  if( (nxtyBandMask3G == uTemp) || (nxtyBandMask4G == uTemp) )
                                  {
                                    guiBoosterCurrentMode = GO_MODE_BAND_A + i; 
                                    break;
                                  }
                                }
                            }
                                                        
                            PrintLog(1,  "Super Msg Rsp: Get Booster Data: nxtySecuredBands3G=0x" + nxtySecuredBands3G.toString(16) + " nxtySecuredBands4G=0x" + nxtySecuredBands4G.toString(16)
                                                                           + " nxtyBandMask3G=0x" + nxtyBandMask3G.toString(16) + " nxtyBandMask4G=0x" + nxtyBandMask4G.toString(16) 
                                                                           + " guiBoosterCurrentMode=" + guiBoosterModeText[guiBoosterCurrentMode] + " bands=" + JSON.stringify(guiBoosterBands) );
                            
                            // Make sure any display gets updated if user not currently setting... 
                            if( bNxtyUserSetInProgress == false )
                            {
                                guiSettingsDirtyFlag = true;
                            }
                            
                        }
                        else
                        {
                            iNxtySuperMsgRspStatus = NXTY_SUPER_MSG_STATUS_FAIL_WRITE;
                            PrintLog(99,  "Super Msg: Get Booster Data msg type encountered write fail." );
                        }
                    }
                }
                else if( nxtyCurrentReq == NXTY_SUPER_MSG_SET_WAVE_DATA )
                {
                    //                   Select Wave ID 1       Write Wave Data 1         Select Wave ID 1       Write Wave Data 1      
                    // Tx: ae xx xx 13   11 f0 0 0 20 x x x x   11 f0 0 0 1C x x x x      11 f0 0 0 20 x x x x   11 f0 0 0 1C x x x x 
                    // Rx  ae xx xx 53   51 1                   51 1                      51 1                   51 1                                  
                    //     [0]              [5]                   [7]                       [9]                    [11]
                    
                    if( (u8RxBuff[4] == NXTY_NAK_RSP) || (u8RxBuff[6]  == NXTY_NAK_RSP) || 
                        (u8RxBuff[8] == NXTY_NAK_RSP) || (u8RxBuff[10] == NXTY_NAK_RSP) ) 
                    {
                        // Got a NAK...
                        iNxtySuperMsgRspStatus = NXTY_SUPER_MSG_STATUS_FAIL_NAK;
                        PrintLog(99,  "Super Msg: Set Wave Data msg type encountered a NAK." );
                    }
                    else
                    {
                    
                        // Make sure that all of the writes were successfull...
                        if( (u8RxBuff[5] == 1) && (u8RxBuff[7] == 1) && (u8RxBuff[9] == 1) && (u8RxBuff[11] == 1) ) 
                        {
                            iNxtySuperMsgRspStatus = NXTY_SUPER_MSG_STATUS_SUCCESS;
                        }
                        else
                        {
                            iNxtySuperMsgRspStatus = NXTY_SUPER_MSG_STATUS_FAIL_WRITE;
                            PrintLog(99,  "Super Msg: Set Wave Data msg type encountered write fail." );
                        }
                    }
                }
               
               
                // Indicate to anyone waiting that a SuperMsg has been received and processed...
                bNxtySuperMsgRsp = true;
               
                break;
            }
            // End of ICD version 2.0 additions.....



            
            case NXTY_NAK_RSP:
            {   
                if( bV2Msg == false )
                {
                    nxtyLastNakType = u8RxBuff[3];
                }
                else
                {
                    nxtyLastNakType = u8RxBuff[5];
                }
                

                
                if( nxtyLastNakType == NXTY_NAK_TYPE_CRC )
                {
                    // CRC error
                    PrintLog(99,  "Msg: NAK Rsp: CRC error." );
                }
                else if( nxtyLastNakType == NXTY_NAK_TYPE_UNCMD )
                {
                    // Unrecognized command
                    PrintLog(99,  "Msg: NAK Rsp: Unrecognized command." );
                }
                else if( nxtyLastNakType == NXTY_NAK_TYPE_UNII_NOT_UP )
                {
                    // Unii not up
                    bUniiUp = false;
                    UpdateUniiIcon(false);
                    PrintLog(99,  "Msg: NAK Rsp: UNII not up." );                    
                }
                else if( nxtyLastNakType == NXTY_NAK_TYPE_UNIT_REDIRECT )
                {
                    // Unii up but UART redirect error
                    PrintLog(99,  "Msg: NAK Rsp: UART redirect error." );                    
                    ShowAlertPopUpMsg("UNII link up.", "Redirect to NU failed.");
                }
                else if( nxtyLastNakType == NXTY_NAK_TYPE_TIMEOUT )
                {
                    // Command timeout...
                    PrintLog(99,  "Msg: NAK Rsp: Timeout error." );                    
                }               
                else if( nxtyLastNakType == NXTY_NAK_TYPE_PREV_MSG_BUSY )
                {
                    // PIC is busy with previous message... (future..)
                    PrintLog(99,  "Msg: NAK Rsp: Busy with previous message." );                    
                }               
                else if( nxtyLastNakType == NXTY_NAK_TYPE_USB_BUSY )
                {
                    // PIC is busy with USB and will not communicate with bluetooth...
                    PrintLog(99,  "Msg: NAK Rsp: USB Busy." );  
                    
                    if( bUsbConflictDialogActive == false )
                    {
                        bUsbConflictDialogActive = true;
                        ShowConfirmPopUpMsg(
                            "Cel-Fi may be receiving commands from USB.  Unable to support both USB commands and Bluetooth.",    // message
                            HandleUsbConflictConfirmation,  // callback to invoke with index of button pressed
                            "HW Commanded from USB?",       // title
                            ['Ok'] );                       // buttonLabels
                    }
                } 
                else
                {
                    PrintLog(99,  "Msg: NAK Rsp: Unknown Type=" + nxtyLastNakType );  
                }              
               
                
                break;
            }
            
            default:
            {
               PrintLog(99,  "Msg: Undefined command: " + uCmd.toString(16) );
               break;
            }
        }

        // Make sure that we can receive a new message...
        uRxBuffIdx = 0;

          
        return;
    },
         
     
     
     

    CalcCrc8: function( dataBytes, uLen, crcByte )
    {
  
      for( var i = 0; i < uLen; i++ )
      {
        crcByte = crc8_table[crcByte ^ dataBytes[i]];
      }

      return( crcByte );
    },
    

};



/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//  Functions to support V2 protocol...
//
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

// ReadAddrReq.......................................................................................
function ReadAddrReq( u32Addr )
{ 
    var outText = "Msg: ReadAddrReq(";
    
    if( u32Addr == NXTY_PCCTRL_CLOUD_INFO )
    {
        outText += "Cloud Info)";
    }
    else if( u32Addr == NXTY_PCCTRL_GLOBALFLAGS )
    {
        outText += "Global Flags)";
    }
    else if( u32Addr == NXTY_PCCTRL_SELPARAM_REG )
    {
        outText += "Select Param Reg)";
    }
    else if( u32Addr == NXTY_PCCTRL_XFER_BUFFER )
    {
        outText += "Xfer Buffer)";
    }
    else
    {
        outText += "0x" + u32Addr.toString(16) + ")";
    }
 
    PrintLog(1, outText );

    u8TempTxBuff[0] = (u32Addr >> 24);  
    u8TempTxBuff[1] = (u32Addr >> 16);
    u8TempTxBuff[2] = (u32Addr >> 8);
    u8TempTxBuff[3] = u32Addr;
    
    bReadAddrRsp = false;
    nxty.SendNxtyMsg(NXTY_READ_ADDRESS_REQ, u8TempTxBuff, 4);
}


// WriteAddrReq.......................................................................................
function WriteAddrReq( u32Addr, u32Data )
{

    var outText = "Msg: WriteAddrReq(";
    
    if( u32Addr == NXTY_PCCTRL_CLOUD_INFO )
    {
        outText += "Cloud Info,";
    }
    else if( u32Addr == NXTY_PCCTRL_GLOBALFLAGS )
    {
        outText += "Global Flags,";
    }
    else if( u32Addr == NXTY_PCCTRL_SELPARAM_REG )
    {
        outText += "Select Param Reg,";
    }
    else if( u32Addr == NXTY_PCCTRL_XFER_BUFFER )
    {
        outText += "Xfer Buffer,";
    }
    else if( u32Addr == NXTY_RESET_LOCAL_ADDR )
    {
        outText += "Reset Local,";
    }
    else if( u32Addr == NXTY_RESET_REMOTE_ADDR )
    {
        outText += "Reset Remote,";
    }
    else
    {
        outText += "0x" + u32Addr.toString(16) + ",";
    }
 
    outText += " 0x" + u32Data.toString(16) + ")";

    
    if( u32Addr == NXTY_PCCTRL_CLOUD_INFO )
    {
        if( (u32Data & CLOUD_INFO_CMD_MASK) == CLOUD_INFO_GET_ENGR_LABEL_CMD )      outText += "  GetLabel:  PageNum:" + (u32Data & CLOUD_INFO_DATA_MASK);  // 0x01000000
        else if( (u32Data & CLOUD_INFO_CMD_MASK) == CLOUD_INFO_GET_ENGR_PAGE_CMD )  outText += "  GetPage";             // 0x02000000   
        else if( (u32Data & CLOUD_INFO_CMD_MASK) == CLOUD_INFO_REG_LOCK_BITS_CMD )  outText += "  Get Reg Lock Bits";   // 0x03000000
        else if( (u32Data & CLOUD_INFO_CMD_MASK) == CLOUD_INFO_CELL_REQ_CMD )       outText += "  CellInfoReq";         // 0x04000000 
        else if( (u32Data & CLOUD_INFO_CMD_MASK) == CLOUD_INFO_REG_REQ_CMD )        outText += "  RegReq";              // 0x05000000
        else if( (u32Data & CLOUD_INFO_CMD_MASK) == CLOUD_INFO_FLASH_LEDS_CMD )     outText += "  Flash LEDs";          // 0x06000000
    }
    else if( u32Addr == NXTY_PCCTRL_GLOBALFLAGS )
    {
    }
    else if( u32Addr == NXTY_PCCTRL_SELPARAM_REG )
    {
    }
    else if( u32Addr == NXTY_PCCTRL_XFER_BUFFER )
    {
    }
    else if( u32Addr == NXTY_RESET_LOCAL_ADDR )
    {
    }
    else if( u32Addr == NXTY_RESET_REMOTE_ADDR )
    {
    }
    
    
    PrintLog(1, outText );
 
    u8TempTxBuff[0] = (u32Addr >> 24);  
    u8TempTxBuff[1] = (u32Addr >> 16);
    u8TempTxBuff[2] = (u32Addr >> 8);
    u8TempTxBuff[3] = u32Addr;
    u8TempTxBuff[4] = (u32Data >> 24);  
    u8TempTxBuff[5] = (u32Data >> 16);
    u8TempTxBuff[6] = (u32Data >> 8);
    u8TempTxBuff[7] = u32Data;
    
    bWriteAddrRsp = false;
    nxty.SendNxtyMsg(NXTY_WRITE_ADDRESS_REQ, u8TempTxBuff, 8);
}

// ReadDataReq.......................................................................................
function ReadDataReq( u32Addr, uRtnSize, uReqType )
{ 
    outText = "Msg: ReadDataReq(";
    
    if( u32Addr == nxtyNuCloudBuffAddr )
    {
        outText += "NU Cloud Buffer, ";
    }    
    else if( u32Addr == nxtyCuCloudBuffAddr )
    {
        outText += "CU Cloud Buffer, ";
    }
    else
    {
        outText += "0x" + u32Addr.toString(16);
    }
    
    outText += uRtnSize + ", ";
    
    if( uReqType == READ_DATA_REQ_TECH_TYPE )
    {
        outText += "TECH_TYPE)";
    }
    else if( uReqType == READ_DATA_REQ_CELL_INFO_TYPE )
    {
        outText += "CELL_INFO_TYPE)";
    }
    else
    {
        outText += uReqType + ")";
    }
    PrintLog(1, outText );
    
    u8TempTxBuff[0] = (u32Addr >> 24);  
    u8TempTxBuff[1] = (u32Addr >> 16);
    u8TempTxBuff[2] = (u32Addr >> 8);
    u8TempTxBuff[3] = u32Addr;
    u8TempTxBuff[4] = (uRtnSize >> 24);  
    u8TempTxBuff[5] = (uRtnSize >> 16);
    u8TempTxBuff[6] = (uRtnSize >> 8);
    u8TempTxBuff[7] = uRtnSize;
    
    bReadDataRsp     = false;
    uReadDataReqType = uReqType;
    nxty.SendNxtyMsg(NXTY_READ_DATA_REQ, u8TempTxBuff, 8);
}


// GetNxtySuperMsgInfo.......................................................................................
function GetNxtySuperMsgInfo()
{ 
    var i            = 0;
    
    PrintLog(1,  "Super Msg Send: Get Info" );
    
    
    // Read 64-bit System SN.................................................                
    u8TempTxBuff[i++] = NXTY_WRITE_ADDRESS_REQ;
    u8TempTxBuff[i++] = (NXTY_PCCTRL_SELPARAM_REG >> 24);  
    u8TempTxBuff[i++] = (NXTY_PCCTRL_SELPARAM_REG >> 16);
    u8TempTxBuff[i++] = (NXTY_PCCTRL_SELPARAM_REG >> 8);
    u8TempTxBuff[i++] = NXTY_PCCTRL_SELPARAM_REG;
    u8TempTxBuff[i++] = 0x00;                               
    u8TempTxBuff[i++] = 0x00;
    u8TempTxBuff[i++] = 0x00;
    u8TempTxBuff[i++] = 0x09;                                     // Drop system SN MSD into xfer buffer
    
    u8TempTxBuff[i++] = NXTY_READ_ADDRESS_REQ;                    // Now read the xfer buffer.
    u8TempTxBuff[i++] = (NXTY_PCCTRL_XFER_BUFFER >> 24);  
    u8TempTxBuff[i++] = (NXTY_PCCTRL_XFER_BUFFER >> 16);
    u8TempTxBuff[i++] = (NXTY_PCCTRL_XFER_BUFFER >> 8);
    u8TempTxBuff[i++] = NXTY_PCCTRL_XFER_BUFFER;


    u8TempTxBuff[i++] = NXTY_WRITE_ADDRESS_REQ;
    u8TempTxBuff[i++] = (NXTY_PCCTRL_SELPARAM_REG >> 24);  
    u8TempTxBuff[i++] = (NXTY_PCCTRL_SELPARAM_REG >> 16);
    u8TempTxBuff[i++] = (NXTY_PCCTRL_SELPARAM_REG >> 8);
    u8TempTxBuff[i++] = NXTY_PCCTRL_SELPARAM_REG;
    u8TempTxBuff[i++] = 0x00;                               
    u8TempTxBuff[i++] = 0x00;
    u8TempTxBuff[i++] = 0x00;
    u8TempTxBuff[i++] = 0x08;                                     // Drop system SN LSD into xfer buffer

    u8TempTxBuff[i++] = NXTY_READ_ADDRESS_REQ;                    // Now read the xfer buffer
    u8TempTxBuff[i++] = (NXTY_PCCTRL_XFER_BUFFER >> 24);  
    u8TempTxBuff[i++] = (NXTY_PCCTRL_XFER_BUFFER >> 16);
    u8TempTxBuff[i++] = (NXTY_PCCTRL_XFER_BUFFER >> 8);
    u8TempTxBuff[i++] = NXTY_PCCTRL_XFER_BUFFER;
  

    // Read 64-bit unique ID.................................................                
    u8TempTxBuff[i++] = NXTY_WRITE_ADDRESS_REQ;
    u8TempTxBuff[i++] = (NXTY_PCCTRL_SELPARAM_REG >> 24);  
    u8TempTxBuff[i++] = (NXTY_PCCTRL_SELPARAM_REG >> 16);
    u8TempTxBuff[i++] = (NXTY_PCCTRL_SELPARAM_REG >> 8);
    u8TempTxBuff[i++] = NXTY_PCCTRL_SELPARAM_REG;
    u8TempTxBuff[i++] = 0x00;                               
    u8TempTxBuff[i++] = 0x00;
    u8TempTxBuff[i++] = 0x00;
    u8TempTxBuff[i++] = 0x02;                                     // Drop unique ID MSD into xfer buffer
    
    u8TempTxBuff[i++] = NXTY_READ_ADDRESS_REQ;                    // Now read the xfer buffer.
    u8TempTxBuff[i++] = (NXTY_PCCTRL_XFER_BUFFER >> 24);  
    u8TempTxBuff[i++] = (NXTY_PCCTRL_XFER_BUFFER >> 16);
    u8TempTxBuff[i++] = (NXTY_PCCTRL_XFER_BUFFER >> 8);
    u8TempTxBuff[i++] = NXTY_PCCTRL_XFER_BUFFER;


    u8TempTxBuff[i++] = NXTY_WRITE_ADDRESS_REQ;
    u8TempTxBuff[i++] = (NXTY_PCCTRL_SELPARAM_REG >> 24);  
    u8TempTxBuff[i++] = (NXTY_PCCTRL_SELPARAM_REG >> 16);
    u8TempTxBuff[i++] = (NXTY_PCCTRL_SELPARAM_REG >> 8);
    u8TempTxBuff[i++] = NXTY_PCCTRL_SELPARAM_REG;
    u8TempTxBuff[i++] = 0x00;                               
    u8TempTxBuff[i++] = 0x00;
    u8TempTxBuff[i++] = 0x00;
    u8TempTxBuff[i++] = 0x01;                                     // Drop unique ID LSD into xfer buffer

    u8TempTxBuff[i++] = NXTY_READ_ADDRESS_REQ;                    // Now read the xfer buffer
    u8TempTxBuff[i++] = (NXTY_PCCTRL_XFER_BUFFER >> 24);  
    u8TempTxBuff[i++] = (NXTY_PCCTRL_XFER_BUFFER >> 16);
    u8TempTxBuff[i++] = (NXTY_PCCTRL_XFER_BUFFER >> 8);
    u8TempTxBuff[i++] = NXTY_PCCTRL_XFER_BUFFER;
  
  
    // Read Ares SW Version .................................................                
    u8TempTxBuff[i++] = NXTY_WRITE_ADDRESS_REQ;
    u8TempTxBuff[i++] = (NXTY_PCCTRL_SELPARAM_REG >> 24);  
    u8TempTxBuff[i++] = (NXTY_PCCTRL_SELPARAM_REG >> 16);
    u8TempTxBuff[i++] = (NXTY_PCCTRL_SELPARAM_REG >> 8);
    u8TempTxBuff[i++] = NXTY_PCCTRL_SELPARAM_REG;
    u8TempTxBuff[i++] = 0x00;                               
    u8TempTxBuff[i++] = 0x00;
    u8TempTxBuff[i++] = 0x00;
    u8TempTxBuff[i++] = 0x04;                                     // Drop SW version into xfer buffer
    
    u8TempTxBuff[i++] = NXTY_READ_ADDRESS_REQ;                    // Now read the xfer buffer.
    u8TempTxBuff[i++] = (NXTY_PCCTRL_XFER_BUFFER >> 24);  
    u8TempTxBuff[i++] = (NXTY_PCCTRL_XFER_BUFFER >> 16);
    u8TempTxBuff[i++] = (NXTY_PCCTRL_XFER_BUFFER >> 8);
    u8TempTxBuff[i++] = NXTY_PCCTRL_XFER_BUFFER;
  
    // Read Build ID .................................................                
    u8TempTxBuff[i++] = NXTY_WRITE_ADDRESS_REQ;
    u8TempTxBuff[i++] = (NXTY_PCCTRL_SELPARAM_REG >> 24);  
    u8TempTxBuff[i++] = (NXTY_PCCTRL_SELPARAM_REG >> 16);
    u8TempTxBuff[i++] = (NXTY_PCCTRL_SELPARAM_REG >> 8);
    u8TempTxBuff[i++] = NXTY_PCCTRL_SELPARAM_REG;
    u8TempTxBuff[i++] = 0x00;                               
    u8TempTxBuff[i++] = 0x00;
    u8TempTxBuff[i++] = 0x00;
    u8TempTxBuff[i++] = 0x03;                                     // Drop Build ID into xfer buffer
    
    u8TempTxBuff[i++] = NXTY_READ_ADDRESS_REQ;                    // Now read the xfer buffer.
    u8TempTxBuff[i++] = (NXTY_PCCTRL_XFER_BUFFER >> 24);  
    u8TempTxBuff[i++] = (NXTY_PCCTRL_XFER_BUFFER >> 16);
    u8TempTxBuff[i++] = (NXTY_PCCTRL_XFER_BUFFER >> 8);
    u8TempTxBuff[i++] = NXTY_PCCTRL_XFER_BUFFER;


    // Read PIC SW Version .................................................                
    u8TempTxBuff[i++] = NXTY_WRITE_ADDRESS_REQ;
    u8TempTxBuff[i++] = (NXTY_PCCTRL_SELPARAM_REG >> 24);  
    u8TempTxBuff[i++] = (NXTY_PCCTRL_SELPARAM_REG >> 16);
    u8TempTxBuff[i++] = (NXTY_PCCTRL_SELPARAM_REG >> 8);
    u8TempTxBuff[i++] = NXTY_PCCTRL_SELPARAM_REG;
    u8TempTxBuff[i++] = 0x00;                               
    u8TempTxBuff[i++] = 0x00;
    u8TempTxBuff[i++] = 0x00;
    u8TempTxBuff[i++] = 0x0D;                                     // Drop PIC SW version into xfer buffer
    
    u8TempTxBuff[i++] = NXTY_READ_ADDRESS_REQ;                    // Now read the xfer buffer.
    u8TempTxBuff[i++] = (NXTY_PCCTRL_XFER_BUFFER >> 24);  
    u8TempTxBuff[i++] = (NXTY_PCCTRL_XFER_BUFFER >> 16);
    u8TempTxBuff[i++] = (NXTY_PCCTRL_XFER_BUFFER >> 8);
    u8TempTxBuff[i++] = NXTY_PCCTRL_XFER_BUFFER;
    
    
    // Read BT SW Version .................................................                
    u8TempTxBuff[i++] = NXTY_WRITE_ADDRESS_REQ;
    u8TempTxBuff[i++] = (NXTY_PCCTRL_SELPARAM_REG >> 24);  
    u8TempTxBuff[i++] = (NXTY_PCCTRL_SELPARAM_REG >> 16);
    u8TempTxBuff[i++] = (NXTY_PCCTRL_SELPARAM_REG >> 8);
    u8TempTxBuff[i++] = NXTY_PCCTRL_SELPARAM_REG;
    u8TempTxBuff[i++] = 0x00;                               
    u8TempTxBuff[i++] = 0x00;
    u8TempTxBuff[i++] = 0x00;
    u8TempTxBuff[i++] = 0x0F;                                     // Drop BT SW version into xfer buffer
    
    u8TempTxBuff[i++] = NXTY_READ_ADDRESS_REQ;                    // Now read the xfer buffer.
    u8TempTxBuff[i++] = (NXTY_PCCTRL_XFER_BUFFER >> 24);  
    u8TempTxBuff[i++] = (NXTY_PCCTRL_XFER_BUFFER >> 16);
    u8TempTxBuff[i++] = (NXTY_PCCTRL_XFER_BUFFER >> 8);
    u8TempTxBuff[i++] = NXTY_PCCTRL_XFER_BUFFER;
                


    // Read Antenna Info .................................................                
    u8TempTxBuff[i++] = NXTY_WRITE_ADDRESS_REQ;
    u8TempTxBuff[i++] = (NXTY_PCCTRL_SELPARAM_REG >> 24);  
    u8TempTxBuff[i++] = (NXTY_PCCTRL_SELPARAM_REG >> 16);
    u8TempTxBuff[i++] = (NXTY_PCCTRL_SELPARAM_REG >> 8);
    u8TempTxBuff[i++] = NXTY_PCCTRL_SELPARAM_REG;
    u8TempTxBuff[i++] = 0x00;                               
    u8TempTxBuff[i++] = 0x00;
    u8TempTxBuff[i++] = 0x00;
    u8TempTxBuff[i++] = 0x10;                                     // Drop Antenna into xfer buffer
    
    u8TempTxBuff[i++] = NXTY_READ_ADDRESS_REQ;                    // Now read the xfer buffer.
    u8TempTxBuff[i++] = (NXTY_PCCTRL_XFER_BUFFER >> 24);  
    u8TempTxBuff[i++] = (NXTY_PCCTRL_XFER_BUFFER >> 16);
    u8TempTxBuff[i++] = (NXTY_PCCTRL_XFER_BUFFER >> 8);
    u8TempTxBuff[i++] = NXTY_PCCTRL_XFER_BUFFER;


    // Board Config .................................................                
    u8TempTxBuff[i++] = NXTY_WRITE_ADDRESS_REQ;
    u8TempTxBuff[i++] = (NXTY_PCCTRL_SELPARAM_REG >> 24);  
    u8TempTxBuff[i++] = (NXTY_PCCTRL_SELPARAM_REG >> 16);
    u8TempTxBuff[i++] = (NXTY_PCCTRL_SELPARAM_REG >> 8);
    u8TempTxBuff[i++] = NXTY_PCCTRL_SELPARAM_REG;
    u8TempTxBuff[i++] = 0x00;                               
    u8TempTxBuff[i++] = 0x00;
    u8TempTxBuff[i++] = 0x00;
    u8TempTxBuff[i++] = 0x05;                                     // Drop Board Config into xfer buffer
    
    u8TempTxBuff[i++] = NXTY_READ_ADDRESS_REQ;                    // Now read the xfer buffer.
    u8TempTxBuff[i++] = (NXTY_PCCTRL_XFER_BUFFER >> 24);  
    u8TempTxBuff[i++] = (NXTY_PCCTRL_XFER_BUFFER >> 16);
    u8TempTxBuff[i++] = (NXTY_PCCTRL_XFER_BUFFER >> 8);
    u8TempTxBuff[i++] = NXTY_PCCTRL_XFER_BUFFER;

    // Get Cloud Buffer Address .................................................                
    u8TempTxBuff[i++] = NXTY_WRITE_ADDRESS_REQ;
    u8TempTxBuff[i++] = (NXTY_PCCTRL_SELPARAM_REG >> 24);  
    u8TempTxBuff[i++] = (NXTY_PCCTRL_SELPARAM_REG >> 16);
    u8TempTxBuff[i++] = (NXTY_PCCTRL_SELPARAM_REG >> 8);
    u8TempTxBuff[i++] = NXTY_PCCTRL_SELPARAM_REG;
    u8TempTxBuff[i++] = 0x00;                               
    u8TempTxBuff[i++] = 0x00;
    u8TempTxBuff[i++] = 0x00;
    u8TempTxBuff[i++] = 0x0E;                                     // Drop Cloud Buffer addr into xfer buffer
    
    u8TempTxBuff[i++] = NXTY_READ_ADDRESS_REQ;                    // Now read the xfer buffer.
    u8TempTxBuff[i++] = (NXTY_PCCTRL_XFER_BUFFER >> 24);  
    u8TempTxBuff[i++] = (NXTY_PCCTRL_XFER_BUFFER >> 16);
    u8TempTxBuff[i++] = (NXTY_PCCTRL_XFER_BUFFER >> 8);
    u8TempTxBuff[i++] = NXTY_PCCTRL_XFER_BUFFER;


    // Read Cloud Info .................................................                
    u8TempTxBuff[i++] = NXTY_READ_ADDRESS_REQ;                   
    u8TempTxBuff[i++] = (NXTY_PCCTRL_CLOUD_INFO >> 24);  
    u8TempTxBuff[i++] = (NXTY_PCCTRL_CLOUD_INFO >> 16);
    u8TempTxBuff[i++] = (NXTY_PCCTRL_CLOUD_INFO >> 8);
    u8TempTxBuff[i++] = NXTY_PCCTRL_CLOUD_INFO;

    // Read Global Flags................................................
    u8TempTxBuff[i++] = NXTY_READ_ADDRESS_REQ;                  // Read the global flags
    u8TempTxBuff[i++] = (NXTY_PCCTRL_GLOBALFLAGS >> 24);    
    u8TempTxBuff[i++] = (NXTY_PCCTRL_GLOBALFLAGS >> 16);
    u8TempTxBuff[i++] = (NXTY_PCCTRL_GLOBALFLAGS >> 8);
    u8TempTxBuff[i++] = NXTY_PCCTRL_GLOBALFLAGS;
    
    nxtyCurrentReq = NXTY_SUPER_MSG_INFO_TYPE;
    nxty.SendNxtyMsg(NXTY_SUPER_MSG_REQ, u8TempTxBuff, i);
}

// GetNxtySuperMsgLinkStatus.......................................................................................
//  Response will set global flag "bUniiUp"
function GetNxtySuperMsgLinkStatus()
{ 
    var i            = 0;

    if( bCnxToOneBoxNu )
    {
        PrintLog(1,  "Super Msg Send: Get Link State (Not required on 1-Box)" );
        bUniiUp = true;
        UpdateUniiIcon(bUniiUp);
    }
    else
    {                        

        PrintLog(1,  "Super Msg Send: Get Link State" );
    
        // Read Link State................................................                
        u8TempTxBuff[i++] = NXTY_WRITE_ADDRESS_REQ;
        u8TempTxBuff[i++] = (NXTY_PCCTRL_SELPARAM_REG >> 24);  
        u8TempTxBuff[i++] = (NXTY_PCCTRL_SELPARAM_REG >> 16);
        u8TempTxBuff[i++] = (NXTY_PCCTRL_SELPARAM_REG >> 8);
        u8TempTxBuff[i++] = NXTY_PCCTRL_SELPARAM_REG;
        u8TempTxBuff[i++] = 0x00;                               
        u8TempTxBuff[i++] = 0x00;
        u8TempTxBuff[i++] = 0x00;
        u8TempTxBuff[i++] = 0x06;                                     // Drop Link State into xfer buffer
        
        u8TempTxBuff[i++] = NXTY_READ_ADDRESS_REQ;                    // Now read the xfer buffer.
        u8TempTxBuff[i++] = (NXTY_PCCTRL_XFER_BUFFER >> 24);  
        u8TempTxBuff[i++] = (NXTY_PCCTRL_XFER_BUFFER >> 16);
        u8TempTxBuff[i++] = (NXTY_PCCTRL_XFER_BUFFER >> 8);
        u8TempTxBuff[i++] = NXTY_PCCTRL_XFER_BUFFER;
                    
    
        
        nxtyCurrentReq = NXTY_SUPER_MSG_LINK_STATE;
        nxty.SendNxtyMsg(NXTY_SUPER_MSG_REQ, u8TempTxBuff, i);
    }
}

// GetNxtySuperMsgParamSelect.......................................................................................
function GetNxtySuperMsgParamSelect( param1, param2 )
{ 
    var i            = 0;

    PrintLog(1,  "Super Msg Send: Select Param: param1=" + NXTY_SUPER_MSG_PARAM_SEL_ARRAY[param1] + " param2=" + NXTY_SUPER_MSG_PARAM_SEL_ARRAY[param2] );

    // Read Select Param Reg 1 .................................................                
    u8TempTxBuff[i++] = NXTY_WRITE_ADDRESS_REQ;
    u8TempTxBuff[i++] = (NXTY_PCCTRL_SELPARAM_REG >> 24);  
    u8TempTxBuff[i++] = (NXTY_PCCTRL_SELPARAM_REG >> 16);
    u8TempTxBuff[i++] = (NXTY_PCCTRL_SELPARAM_REG >> 8);
    u8TempTxBuff[i++] = NXTY_PCCTRL_SELPARAM_REG;
    u8TempTxBuff[i++] = 0x00;                               
    u8TempTxBuff[i++] = 0x00;
    u8TempTxBuff[i++] = 0x00;
    u8TempTxBuff[i++] = param1;                          
    
    u8TempTxBuff[i++] = NXTY_READ_ADDRESS_REQ;                    // Now read the xfer buffer.
    u8TempTxBuff[i++] = (NXTY_PCCTRL_XFER_BUFFER >> 24);  
    u8TempTxBuff[i++] = (NXTY_PCCTRL_XFER_BUFFER >> 16);
    u8TempTxBuff[i++] = (NXTY_PCCTRL_XFER_BUFFER >> 8);
    u8TempTxBuff[i++] = NXTY_PCCTRL_XFER_BUFFER;
                

    // Read Select Param Reg 2 .................................................                
    u8TempTxBuff[i++] = NXTY_WRITE_ADDRESS_REQ;
    u8TempTxBuff[i++] = (NXTY_PCCTRL_SELPARAM_REG >> 24);  
    u8TempTxBuff[i++] = (NXTY_PCCTRL_SELPARAM_REG >> 16);
    u8TempTxBuff[i++] = (NXTY_PCCTRL_SELPARAM_REG >> 8);
    u8TempTxBuff[i++] = NXTY_PCCTRL_SELPARAM_REG;
    u8TempTxBuff[i++] = 0x00;                               
    u8TempTxBuff[i++] = 0x00;
    u8TempTxBuff[i++] = 0x00;
    u8TempTxBuff[i++] = param2;
    
    u8TempTxBuff[i++] = NXTY_READ_ADDRESS_REQ;                    // Now read the xfer buffer.
    u8TempTxBuff[i++] = (NXTY_PCCTRL_XFER_BUFFER >> 24);  
    u8TempTxBuff[i++] = (NXTY_PCCTRL_XFER_BUFFER >> 16);
    u8TempTxBuff[i++] = (NXTY_PCCTRL_XFER_BUFFER >> 8);
    u8TempTxBuff[i++] = NXTY_PCCTRL_XFER_BUFFER;
    
    nxtyCurrentReq = NXTY_SUPER_MSG_PARAM_SELECT;
    nxty.SendNxtyMsg(NXTY_SUPER_MSG_REQ, u8TempTxBuff, i);
}

// RedirectUartSuperMsg.......................................................................................
function RedirectUartSuperMsg()
{ 
    var i            = 0;

    PrintLog(1,  "Super Msg Send: Redirect Uart to remote unit." );

    // Redirect the UART........................................
    u8TempTxBuff[i++] = NXTY_WRITE_ADDRESS_REQ;
    u8TempTxBuff[i++] = (NXTY_PCCTRL_UART_REDIRECT >> 24);  
    u8TempTxBuff[i++] = (NXTY_PCCTRL_UART_REDIRECT >> 16);
    u8TempTxBuff[i++] = (NXTY_PCCTRL_UART_REDIRECT >> 8);
    u8TempTxBuff[i++] = NXTY_PCCTRL_UART_REDIRECT;
    u8TempTxBuff[i++] = 0x00;                               
    u8TempTxBuff[i++] = 0x00;
    u8TempTxBuff[i++] = 0x00;
    u8TempTxBuff[i++] = 0x01;                                   // Set to 1 to redirect to remote unit


    // Read the Board Config to verify .................................................                
    u8TempTxBuff[i++] = NXTY_WRITE_ADDRESS_REQ;
    u8TempTxBuff[i++] = (NXTY_PCCTRL_SELPARAM_REG >> 24);  
    u8TempTxBuff[i++] = (NXTY_PCCTRL_SELPARAM_REG >> 16);
    u8TempTxBuff[i++] = (NXTY_PCCTRL_SELPARAM_REG >> 8);
    u8TempTxBuff[i++] = NXTY_PCCTRL_SELPARAM_REG;
    u8TempTxBuff[i++] = 0x00;                               
    u8TempTxBuff[i++] = 0x00;
    u8TempTxBuff[i++] = 0x00;
    u8TempTxBuff[i++] = 0x05;                                     // Drop Board Config into xfer buffer
    
    u8TempTxBuff[i++] = NXTY_READ_ADDRESS_REQ;                    // Now read the xfer buffer.
    u8TempTxBuff[i++] = (NXTY_PCCTRL_XFER_BUFFER >> 24);  
    u8TempTxBuff[i++] = (NXTY_PCCTRL_XFER_BUFFER >> 16);
    u8TempTxBuff[i++] = (NXTY_PCCTRL_XFER_BUFFER >> 8);
    u8TempTxBuff[i++] = NXTY_PCCTRL_XFER_BUFFER;
    
    nxtyCurrentReq = NXTY_SUPER_MSG_REDIRECT_UART;
    nxty.SendNxtyMsg(NXTY_SUPER_MSG_REQ, u8TempTxBuff, i);
}


// SetUartRemote.......................................................................................
//   Will try to connect remotely if it has been > 5.8 seconds since last attempt.
//   There is a 5 second timeout on a remote connection.
//   Return true if connected remotely, false otherwise.
//   Depends on var bCnxToCu to be set at startup.
function SetUartRemote()
{ 
    var d = new Date();
    var uUartRedirectTimeMs = d.getTime();
    
    if( (uUartRedirectTimeMs - uLastUartRedirectTimeMs) > 5800 )
    {
        // It has been more than 5.8 seconds since last redirect attempt so try again.
        RedirectUartSuperMsg();
        uLastUartRedirectTimeMs = uUartRedirectTimeMs;
    }
    else 
    {
        if( bCnxToCu != ((nxtyRxStatusBoardConfig & IM_A_CU_MASK)?true:false) )     // Test to see if redirect worked
        {
            // We are now connected remotely so return a true indication...
            return( true );
        }
    }
    
    // Indicate that we are not connected remotely yet...
    return( false );
                
}

// SetUartLocal.......................................................................................
function SetUartLocal()
{
    // Use the read of the UART Redirect register to force it local...
    var i            = 0;

    if( bCnxToOneBoxNu )
    {
        PrintLog(1,  "Super Msg Send: Cancel UART Redirect (Not required on 1-Box)" );
    }
    else
    {                        
        PrintLog(1,  "Super Msg Send: Cancel UART Redirect." );
    
        // Read the UART Redirect register to force local...
        // Setting the UART redirect register did not work if the NU was down or in the process of resetting... 
        u8TempTxBuff[i++] = NXTY_READ_ADDRESS_REQ;             
        u8TempTxBuff[i++] = (NXTY_PCCTRL_UART_REDIRECT >> 24);  
        u8TempTxBuff[i++] = (NXTY_PCCTRL_UART_REDIRECT >> 16);
        u8TempTxBuff[i++] = (NXTY_PCCTRL_UART_REDIRECT >> 8);
        u8TempTxBuff[i++] = NXTY_PCCTRL_UART_REDIRECT;
    
    
        // Read the Board Config to verify .................................................                
        u8TempTxBuff[i++] = NXTY_WRITE_ADDRESS_REQ;
        u8TempTxBuff[i++] = (NXTY_PCCTRL_SELPARAM_REG >> 24);  
        u8TempTxBuff[i++] = (NXTY_PCCTRL_SELPARAM_REG >> 16);
        u8TempTxBuff[i++] = (NXTY_PCCTRL_SELPARAM_REG >> 8);
        u8TempTxBuff[i++] = NXTY_PCCTRL_SELPARAM_REG;
        u8TempTxBuff[i++] = 0x00;                               
        u8TempTxBuff[i++] = 0x00;
        u8TempTxBuff[i++] = 0x00;
        u8TempTxBuff[i++] = 0x05;                                     // Drop Board Config into xfer buffer
        
        u8TempTxBuff[i++] = NXTY_READ_ADDRESS_REQ;                    // Now read the xfer buffer.
        u8TempTxBuff[i++] = (NXTY_PCCTRL_XFER_BUFFER >> 24);  
        u8TempTxBuff[i++] = (NXTY_PCCTRL_XFER_BUFFER >> 16);
        u8TempTxBuff[i++] = (NXTY_PCCTRL_XFER_BUFFER >> 8);
        u8TempTxBuff[i++] = NXTY_PCCTRL_XFER_BUFFER;
        
        nxtyCurrentReq = NXTY_SUPER_MSG_CANCEL_REDIRECT_UART;
        nxty.SendNxtyMsg(NXTY_SUPER_MSG_REQ, u8TempTxBuff, i);
    }
    
}

// IsUartRemote.......................................................................................
function IsUartRemote()
{ 
    if( bCnxToCu == ((nxtyRxStatusBoardConfig & IM_A_CU_MASK)?true:false) )     // Test to see if redirect worked, should be false 2nd time in...
    {
        // Connected locally...
        return(false);
    }
    else
    {
        // Connected remotely...
        return(true);
    }
}

// SetUartToNu.......................................................................................
//   Return true if connected to NU, false otherwise.
//   Depends on var bCnxToCu to be set at startup.
function SetUartToNu()
{ 
    if( bCnxToOneBoxNu == false )
    {
        if( bCnxToCu )
        {   
            if( IsUartRemote() == false )     
            {
                SetUartRemote();
                return( false );
            }
        }
        else
        {
            if( IsUartRemote() == true )     
            {
                SetUartLocal();
                return( false );
            }
        }
    }
        
    return( true );
}


// SetNxtySuperMsgAntState.......................................................................................
function SetNxtySuperMsgAntState(antCode)
{ 
    var i            = 0;

    PrintLog(1,  "Super Msg Send: Set Antenna State=0x" + antCode.toString(16) );

    // Redirect the UART........................................
    u8TempTxBuff[i++] = NXTY_WRITE_ADDRESS_REQ;
    u8TempTxBuff[i++] = (NXTY_PCCTRL_UART_REDIRECT >> 24);  
    u8TempTxBuff[i++] = (NXTY_PCCTRL_UART_REDIRECT >> 16);
    u8TempTxBuff[i++] = (NXTY_PCCTRL_UART_REDIRECT >> 8);
    u8TempTxBuff[i++] = NXTY_PCCTRL_UART_REDIRECT;
    u8TempTxBuff[i++] = 0x00;                               
    u8TempTxBuff[i++] = 0x00;
    u8TempTxBuff[i++] = 0x00;
    u8TempTxBuff[i++] = 0x01;                                   // Set to 1 to redirect to remote unit


    // Set the Antenna State by setting the global flags.................................................                
    u8TempTxBuff[i++] = NXTY_WRITE_ADDRESS_REQ;
    u8TempTxBuff[i++] = (NXTY_PCCTRL_GLOBALFLAGS >> 24);  
    u8TempTxBuff[i++] = (NXTY_PCCTRL_GLOBALFLAGS >> 16);
    u8TempTxBuff[i++] = (NXTY_PCCTRL_GLOBALFLAGS >> 8);
    u8TempTxBuff[i++] = NXTY_PCCTRL_GLOBALFLAGS;
    u8TempTxBuff[i++] = (antCode >> 24);              
    u8TempTxBuff[i++] = (antCode >> 16);
    u8TempTxBuff[i++] = (antCode >> 8);
    u8TempTxBuff[i++] = (antCode >> 0);
    

    // Turn right around and read the global flags to see if complete......
    u8TempTxBuff[i++] = NXTY_READ_ADDRESS_REQ;                  
    u8TempTxBuff[i++] = (NXTY_PCCTRL_GLOBALFLAGS >> 24);    
    u8TempTxBuff[i++] = (NXTY_PCCTRL_GLOBALFLAGS >> 16);
    u8TempTxBuff[i++] = (NXTY_PCCTRL_GLOBALFLAGS >> 8);
    u8TempTxBuff[i++] = NXTY_PCCTRL_GLOBALFLAGS;
    
    nxtyCurrentReq = NXTY_SUPER_MSG_SET_ANT_STATE;
    nxty.SendNxtyMsg(NXTY_SUPER_MSG_REQ, u8TempTxBuff, i);
}

// SetNxtySuperMsgResetRemoteUnit.......................................................................................
function SetNxtySuperMsgResetRemoteUnit()
{ 
    var i            = 0;

    PrintLog(1,  "Super Msg Send: Reset Remote Unit" );

    // Redirect the UART........................................
    u8TempTxBuff[i++] = NXTY_WRITE_ADDRESS_REQ;
    u8TempTxBuff[i++] = (NXTY_PCCTRL_UART_REDIRECT >> 24);  
    u8TempTxBuff[i++] = (NXTY_PCCTRL_UART_REDIRECT >> 16);
    u8TempTxBuff[i++] = (NXTY_PCCTRL_UART_REDIRECT >> 8);
    u8TempTxBuff[i++] = NXTY_PCCTRL_UART_REDIRECT;
    u8TempTxBuff[i++] = 0x00;                               
    u8TempTxBuff[i++] = 0x00;
    u8TempTxBuff[i++] = 0x00;
    u8TempTxBuff[i++] = 0x01;                                   // Set to 1 to redirect to remote unit


    // Send 0xDEADBEEF to address 0x82000258....                
    u8TempTxBuff[i++] = NXTY_WRITE_ADDRESS_REQ;
    u8TempTxBuff[i++] = (NXTY_RESET_REMOTE_ADDR >> 24);  
    u8TempTxBuff[i++] = (NXTY_RESET_REMOTE_ADDR >> 16);
    u8TempTxBuff[i++] = (NXTY_RESET_REMOTE_ADDR >> 8);
    u8TempTxBuff[i++] = NXTY_RESET_REMOTE_ADDR;
    u8TempTxBuff[i++] = (NXTY_RESET_VALUE >> 24);              
    u8TempTxBuff[i++] = (NXTY_RESET_VALUE >> 16);
    u8TempTxBuff[i++] = (NXTY_RESET_VALUE >> 8);
    u8TempTxBuff[i++] = (NXTY_RESET_VALUE >> 0);

    // Go back to local in case UNII status is desired.....................................
    // Read the UART Redirect register to force local...
    // Setting the UART redirect register did not work if the NU was down or in the process of resetting... 
    u8TempTxBuff[i++] = NXTY_READ_ADDRESS_REQ;             
    u8TempTxBuff[i++] = (NXTY_PCCTRL_UART_REDIRECT >> 24);  
    u8TempTxBuff[i++] = (NXTY_PCCTRL_UART_REDIRECT >> 16);
    u8TempTxBuff[i++] = (NXTY_PCCTRL_UART_REDIRECT >> 8);
    u8TempTxBuff[i++] = NXTY_PCCTRL_UART_REDIRECT;
    

    nxtyCurrentReq = NXTY_SUPER_MSG_RESET_REMOTE_UNIT;
    nxty.SendNxtyMsg(NXTY_SUPER_MSG_REQ, u8TempTxBuff, i);
}


// SetNxtySuperMsgResetLocalUnit.......................................................................................
function SetNxtySuperMsgResetLocalUnit()
{ 
    var i            = 0;

    PrintLog(1,  "Super Msg Send: Reset Local Unit" );

    // Redirect the UART........................................
    u8TempTxBuff[i++] = NXTY_WRITE_ADDRESS_REQ;
    u8TempTxBuff[i++] = (NXTY_PCCTRL_UART_REDIRECT >> 24);  
    u8TempTxBuff[i++] = (NXTY_PCCTRL_UART_REDIRECT >> 16);
    u8TempTxBuff[i++] = (NXTY_PCCTRL_UART_REDIRECT >> 8);
    u8TempTxBuff[i++] = NXTY_PCCTRL_UART_REDIRECT;
    u8TempTxBuff[i++] = 0x00;                               
    u8TempTxBuff[i++] = 0x00;
    u8TempTxBuff[i++] = 0x00;
    u8TempTxBuff[i++] = 0x00;                                   // Set to 0 for local


    // Send 0xDEADBEEF to address 0x84300458....                
    u8TempTxBuff[i++] = NXTY_WRITE_ADDRESS_REQ;
    u8TempTxBuff[i++] = (NXTY_RESET_LOCAL_ADDR >> 24);  
    u8TempTxBuff[i++] = (NXTY_RESET_LOCAL_ADDR >> 16);
    u8TempTxBuff[i++] = (NXTY_RESET_LOCAL_ADDR >> 8);
    u8TempTxBuff[i++] = NXTY_RESET_LOCAL_ADDR;
    u8TempTxBuff[i++] = (NXTY_RESET_VALUE >> 24);              
    u8TempTxBuff[i++] = (NXTY_RESET_VALUE >> 16);
    u8TempTxBuff[i++] = (NXTY_RESET_VALUE >> 8);
    u8TempTxBuff[i++] = (NXTY_RESET_VALUE >> 0);
    

    nxtyCurrentReq = NXTY_SUPER_MSG_RESET_LOCAL_UNIT;
    nxty.SendNxtyMsg(NXTY_SUPER_MSG_REQ, u8TempTxBuff, i);
}


// SetNxtySuperMsgResetAresAfterDownload.......................................................................................
function SetNxtySuperMsgResetAresAfterDownload()
{ 
    var i              = 0;
    var resetWriteAddr = 0xF0000040;
    var resetWriteData = 0xBEDA221E;
    var resetReadAddr  = 0xF8100000;
    

    PrintLog(1,  "Super Msg Send: Reset Ares after download" );

    // Send 0xBEDA221E to 0xF0000040 and read from 0xF8100000.
    u8TempTxBuff[i++] = NXTY_WRITE_ADDRESS_REQ;
    u8TempTxBuff[i++] = (resetWriteAddr >> 24);  
    u8TempTxBuff[i++] = (resetWriteAddr >> 16);
    u8TempTxBuff[i++] = (resetWriteAddr >> 8);
    u8TempTxBuff[i++] = resetWriteAddr;
    u8TempTxBuff[i++] = (resetWriteData >> 24);              
    u8TempTxBuff[i++] = (resetWriteData >> 16);
    u8TempTxBuff[i++] = (resetWriteData >> 8);
    u8TempTxBuff[i++] = (resetWriteData >> 0);
    

    u8TempTxBuff[i++] = NXTY_READ_ADDRESS_REQ;                  
    u8TempTxBuff[i++] = (resetReadAddr >> 24);    
    u8TempTxBuff[i++] = (resetReadAddr >> 16);
    u8TempTxBuff[i++] = (resetReadAddr >> 8);
    u8TempTxBuff[i++] = resetReadAddr;
    
    nxtyCurrentReq = NXTY_SUPER_MSG_RESET_ARES;
    nxty.SendNxtyMsg(NXTY_SUPER_MSG_REQ, u8TempTxBuff, i);
}


// isNxtyMsgPending.......................................................................................
function isNxtyMsgPending()
{ 
    if( msgRxLastCmd == NXTY_WAITING_FOR_RSP )
    {
        return( true );
    }
    else
    {
        return( false );
    }
}



// GetNxtySuperMsgBoosterParams.......................................................................................
function GetNxtySuperMsgBoosterParams()
{ 
    var i            = 0;

    PrintLog(1,  "Super Msg Send: Get Booster Params" );

    // Read Select Param Reg SecuredBands3G.................................................                
    u8TempTxBuff[i++] = NXTY_WRITE_ADDRESS_REQ;
    u8TempTxBuff[i++] = (NXTY_PCCTRL_SELPARAM_REG >> 24);  
    u8TempTxBuff[i++] = (NXTY_PCCTRL_SELPARAM_REG >> 16);
    u8TempTxBuff[i++] = (NXTY_PCCTRL_SELPARAM_REG >> 8);
    u8TempTxBuff[i++] = NXTY_PCCTRL_SELPARAM_REG;
    u8TempTxBuff[i++] = 0x00;                               
    u8TempTxBuff[i++] = 0x00;
    u8TempTxBuff[i++] = 0x00;
    u8TempTxBuff[i++] = NXTY_SEL_PARAM_REG_SECURE_3G;                          
    
    u8TempTxBuff[i++] = NXTY_READ_ADDRESS_REQ;                    // Now read the xfer buffer.
    u8TempTxBuff[i++] = (NXTY_PCCTRL_XFER_BUFFER >> 24);  
    u8TempTxBuff[i++] = (NXTY_PCCTRL_XFER_BUFFER >> 16);
    u8TempTxBuff[i++] = (NXTY_PCCTRL_XFER_BUFFER >> 8);
    u8TempTxBuff[i++] = NXTY_PCCTRL_XFER_BUFFER;
                

    // Read Select Param Reg SecuredBands4G .................................................                
    u8TempTxBuff[i++] = NXTY_WRITE_ADDRESS_REQ;
    u8TempTxBuff[i++] = (NXTY_PCCTRL_SELPARAM_REG >> 24);  
    u8TempTxBuff[i++] = (NXTY_PCCTRL_SELPARAM_REG >> 16);
    u8TempTxBuff[i++] = (NXTY_PCCTRL_SELPARAM_REG >> 8);
    u8TempTxBuff[i++] = NXTY_PCCTRL_SELPARAM_REG;
    u8TempTxBuff[i++] = 0x00;                               
    u8TempTxBuff[i++] = 0x00;
    u8TempTxBuff[i++] = 0x00;
    u8TempTxBuff[i++] = NXTY_SEL_PARAM_REG_SECURE_4G;
    
    u8TempTxBuff[i++] = NXTY_READ_ADDRESS_REQ;                    // Now read the xfer buffer.
    u8TempTxBuff[i++] = (NXTY_PCCTRL_XFER_BUFFER >> 24);  
    u8TempTxBuff[i++] = (NXTY_PCCTRL_XFER_BUFFER >> 16);
    u8TempTxBuff[i++] = (NXTY_PCCTRL_XFER_BUFFER >> 8);
    u8TempTxBuff[i++] = NXTY_PCCTRL_XFER_BUFFER;


    // Read Wave ID BandMask3G .................................................                
    u8TempTxBuff[i++] = NXTY_WRITE_ADDRESS_REQ;
    u8TempTxBuff[i++] = (NXTY_PCCTRL_WAVE_ID_REG >> 24);  
    u8TempTxBuff[i++] = (NXTY_PCCTRL_WAVE_ID_REG >> 16);
    u8TempTxBuff[i++] = (NXTY_PCCTRL_WAVE_ID_REG >> 8);
    u8TempTxBuff[i++] = NXTY_PCCTRL_WAVE_ID_REG;
    u8TempTxBuff[i++] = (NXTY_WAVEID_BAND_MASK_3G_TYPE >> 24);                               
    u8TempTxBuff[i++] = (NXTY_WAVEID_BAND_MASK_3G_TYPE >> 16);
    u8TempTxBuff[i++] = (NXTY_WAVEID_BAND_MASK_3G_TYPE >> 8);
    u8TempTxBuff[i++] = NXTY_WAVEID_BAND_MASK_3G_TYPE;
    
    u8TempTxBuff[i++] = NXTY_READ_ADDRESS_REQ;                    // Now read the data buffer.
    u8TempTxBuff[i++] = (NXTY_PCCTRL_WAVE_DATA_BUFFER >> 24);  
    u8TempTxBuff[i++] = (NXTY_PCCTRL_WAVE_DATA_BUFFER >> 16);
    u8TempTxBuff[i++] = (NXTY_PCCTRL_WAVE_DATA_BUFFER >> 8);
    u8TempTxBuff[i++] = NXTY_PCCTRL_WAVE_DATA_BUFFER;

    // Read Wave ID BandMask4G .................................................                
    u8TempTxBuff[i++] = NXTY_WRITE_ADDRESS_REQ;
    u8TempTxBuff[i++] = (NXTY_PCCTRL_WAVE_ID_REG >> 24);  
    u8TempTxBuff[i++] = (NXTY_PCCTRL_WAVE_ID_REG >> 16);
    u8TempTxBuff[i++] = (NXTY_PCCTRL_WAVE_ID_REG >> 8);
    u8TempTxBuff[i++] = NXTY_PCCTRL_WAVE_ID_REG;
    u8TempTxBuff[i++] = (NXTY_WAVEID_BAND_MASK_4G_TYPE >> 24);                               
    u8TempTxBuff[i++] = (NXTY_WAVEID_BAND_MASK_4G_TYPE >> 16);
    u8TempTxBuff[i++] = (NXTY_WAVEID_BAND_MASK_4G_TYPE >> 8);
    u8TempTxBuff[i++] = NXTY_WAVEID_BAND_MASK_4G_TYPE;
    
    u8TempTxBuff[i++] = NXTY_READ_ADDRESS_REQ;                    // Now read the data buffer.
    u8TempTxBuff[i++] = (NXTY_PCCTRL_WAVE_DATA_BUFFER >> 24);  
    u8TempTxBuff[i++] = (NXTY_PCCTRL_WAVE_DATA_BUFFER >> 16);
    u8TempTxBuff[i++] = (NXTY_PCCTRL_WAVE_DATA_BUFFER >> 8);
    u8TempTxBuff[i++] = NXTY_PCCTRL_WAVE_DATA_BUFFER;

    
    nxtyCurrentReq = NXTY_SUPER_MSG_GET_BOOSTER_DATA;
    nxty.SendNxtyMsg(NXTY_SUPER_MSG_REQ, u8TempTxBuff, i);
}

// SetNxtySuperMsgWaveData.......................................................................................
function SetNxtySuperMsgWaveData( param1, data1, param2, data2 )
{ 
    var i            = 0;

    // params are formatted 0x01xx0000 where xx is the actual enum value.
    var param1Id = (param1 >> 16) & 0xFF;
    var param2Id = (param2 >> 16) & 0xFF;
    

    PrintLog(1,  "Super Msg Send: Set Wave Data: param1=" + NXTY_SUPER_MSG_WAVE_DATA_ARRAY[param1Id] + " data1=0x" + data1.toString(16) + " param2=" + NXTY_SUPER_MSG_WAVE_DATA_ARRAY[param2Id] + " data2=0x" + data2.toString(16) );

    // Write WaveId .................................................
    u8TempTxBuff[i++] = NXTY_WRITE_ADDRESS_REQ;
    u8TempTxBuff[i++] = (NXTY_PCCTRL_WAVE_ID_REG >> 24);  
    u8TempTxBuff[i++] = (NXTY_PCCTRL_WAVE_ID_REG >> 16);
    u8TempTxBuff[i++] = (NXTY_PCCTRL_WAVE_ID_REG >> 8);
    u8TempTxBuff[i++] = NXTY_PCCTRL_WAVE_ID_REG;
    u8TempTxBuff[i++] = (param1 >> 24);                               
    u8TempTxBuff[i++] = (param1 >> 16);
    u8TempTxBuff[i++] = (param1 >> 8);
    u8TempTxBuff[i++] = param1;

    // Write the data to the Wave data register...........................
    u8TempTxBuff[i++] = NXTY_WRITE_ADDRESS_REQ;
    u8TempTxBuff[i++] = (NXTY_PCCTRL_WAVE_DATA_BUFFER >> 24);  
    u8TempTxBuff[i++] = (NXTY_PCCTRL_WAVE_DATA_BUFFER >> 16);
    u8TempTxBuff[i++] = (NXTY_PCCTRL_WAVE_DATA_BUFFER >> 8);
    u8TempTxBuff[i++] = NXTY_PCCTRL_WAVE_DATA_BUFFER;
    u8TempTxBuff[i++] = (data1 >> 24);                               
    u8TempTxBuff[i++] = (data1 >> 16);
    u8TempTxBuff[i++] = (data1 >> 8);
    u8TempTxBuff[i++] = data1;

    // Write WaveId .................................................
    u8TempTxBuff[i++] = NXTY_WRITE_ADDRESS_REQ;
    u8TempTxBuff[i++] = (NXTY_PCCTRL_WAVE_ID_REG >> 24);  
    u8TempTxBuff[i++] = (NXTY_PCCTRL_WAVE_ID_REG >> 16);
    u8TempTxBuff[i++] = (NXTY_PCCTRL_WAVE_ID_REG >> 8);
    u8TempTxBuff[i++] = NXTY_PCCTRL_WAVE_ID_REG;
    u8TempTxBuff[i++] = (param2 >> 24);                               
    u8TempTxBuff[i++] = (param2 >> 16);
    u8TempTxBuff[i++] = (param2 >> 8);
    u8TempTxBuff[i++] = param2;

    // Write the data to the Wave data register...........................
    u8TempTxBuff[i++] = NXTY_WRITE_ADDRESS_REQ;
    u8TempTxBuff[i++] = (NXTY_PCCTRL_WAVE_DATA_BUFFER >> 24);  
    u8TempTxBuff[i++] = (NXTY_PCCTRL_WAVE_DATA_BUFFER >> 16);
    u8TempTxBuff[i++] = (NXTY_PCCTRL_WAVE_DATA_BUFFER >> 8);
    u8TempTxBuff[i++] = NXTY_PCCTRL_WAVE_DATA_BUFFER;
    u8TempTxBuff[i++] = (data2 >> 24);                               
    u8TempTxBuff[i++] = (data2 >> 16);
    u8TempTxBuff[i++] = (data2 >> 8);
    u8TempTxBuff[i++] = data2;

    
    nxtyCurrentReq = NXTY_SUPER_MSG_SET_WAVE_DATA;
    nxty.SendNxtyMsg(NXTY_SUPER_MSG_REQ, u8TempTxBuff, i);
}
