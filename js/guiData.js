//=================================================================================================
//
//  File: guiData.js
//
//  Description:  This file contains all data variables used to isolate the 
//                UI from the rest of the program.
//
//=================================================================================================

//
// The following guiXxx variables are written by the program code and read by the GUI processing.
//

// The following variables are directly related to UI display.
var guiProductType          = null;             // String based on the 3 digits in the SKU  590Nxxx.
const   PRODUCT_TYPE_PRO        = "PRO";    
const   PRODUCT_TYPE_DUO        = "DUO";    
const   PRODUCT_TYPE_PRIME      = "PRIME";    
const   PRODUCT_TYPE_GO         = "GO";    
const   PRODUCT_TYPE_CABLE      = "CABLE";    
const   PRODUCT_TYPE_UNKNOWN    = "UNKNOWN";
var guiMobilityFlag         = false;            // Set to true if "P" field of SKU, index 16, is 6 for Auto.
var guiSerialNumber         = null;             // String based on the serial number.
var guiBoost                = 0;                // Number from CalculateUniiBars().
var guiNuBars               = 0;                // Number from CalculateNuBars(). 
var guiOperator             = null;             // String based on 700 number from Cel-Fi.
var guiOperatorCode         = null;             // 4 digit operator code.
var guiUserFirstName        = null;             // Filled in from the cloud.  

var guiOperatorFlag         = false;            // Flag:  true:  display operator selection 
var guiOperatorList         = [];               // An array of operators to select.
var guiDeviceFlag           = false;            // Flag:  true:  display device selection 
var guiDeviceAddrList       = [];               // An array of device addresses to select. (Android: MAC, IOS: Mangled MAC)
var guiDeviceRssiList       = [];               // An array of associated BT RSSI values...
var guiDeviceList           = [];               // An array of device IDs, i.e. Serial Numbers, to display for user to select.
var guiRegistrationFlag     = false;            // true if registered.
var guiRegistrationLockBits = 0;                // Bit 0: Loc Lock, Bit 1: Reg, Bit 2: Reg Required, Bit 3: Reg Desired/Optional
var guiRegistrationPercent  = -1;               // If >= 0 then display prograss bar...
var guiSoftwareStatus       = 0;                // Number: 0=unknown, 1=Checking for updates, 2=Please update, 3=Up to date, 4=Update in progress
const   SW_STATUS_UNKNOWN            = 0;
const   SW_STATUS_CHECKING           = 1;
const   SW_STATUS_PLEASE_UPDATE      = 2;
const   SW_STATUS_UP_TO_DATE         = 3;
const   SW_STATUS_UPDATE_IN_PROGRESS = 4;
const guiSoftwareStatusText = ["Unknown", "Checking", "Update", "Up to date", "Update in progress"];
var guiSoftwareButtonFlag   = false;            // Flag:  true to enable the update button.
var guiSoftwareButtonText   = "";   
var guiSoftwareDirtyFlag    = false;            // Flag:  Set to true by program code when status has changed.  Gui code can set to false.
var guiAntennaFlag          = false;            // Flag:  true:  display antenna selection 
var guiSettingsDirtyFlag    = false;            // Flag:  Set to true by program code when status has changed.  Gui code can set to false.
var guiAntennaManualFlag    = false;            // Flag:  true:  Manual control of ant selection.
var guiAntennaIntFlags      = [false,false,false,false]; 
var guiAntennaBands         = [0,0,0,0];        // Number:  bands
var guiAntennaFreqArrayMHz  = [0,0,0,0];        // Number:  Freq band in MHz.
var guiBoosterFlag          = false;            // Flag:  true:  display booster selection
var guiBoosterCurrentMode   = 0;                // 0=auto, 1=3G/4G, 2=LTE
var guiBoosterBands         = [0,0,0];          

var guiBands                = [0,0,0,0];        // Number:  > 0 band is active.
var guiNetworkBars          = [0,0,0,0];        // Numbers: Array of 4 numbers from 0 to 5. Calculated from RSRP(LTE) or RSCP(WCDMA).
var guiTechnologyTypes      = [0,0,0,0];        // Number: 0=WCDMA, 1=LTE        
var guiFreqArrayMHz         = [0,0,0,0];        // Number:  Freq in MHz.
var guiRadios               = ["","","",""];    // Strings
var guiCellState            = [0,0,0,0];        // Number:  Array ...


var guiSwNames              = ["UnSec Cfg", "NU_ART", "NU_EVM", "NU_PIC", "Sec Cfg", "NU", "CU_ART", "Bluetooth", "CU_PIC", "CU"];         // Software image names
var guiSwCelFiVers          = ["","","","","","","","","",""];               // Software versions in the Cel-Fi hardware
var guiSwCldVers            = ["","","","","","","","","",""];               // Software versions in the Cloud
var guiSwStatus             = ["OK","OK","OK","OK","OK","OK","OK","OK","OK","OK"];                    // Status


var guiSuMaxSysGain         = 0; //Super User Max system gain [dB]
var guiSuMinSysGain         = 0; //Super User Min system gain [dB]
var guiSuMaxBackOff         = 0; //Super User Max back-off [dB]
var guiSuMaxCellRssi        = 0; //Super User Max Cell RSSI for Pro [dBm]
var guiSuMaxRscp            = 0; //Super User Max RSCP for GO [dBm]
var guiSuMaxRsrp            = 0; //Super User Max RSRP for GO [dBm]
var guiSuBandMask3G         = 0; //Shows which 3G bands should be allowed
var guiSuBandMask4G         = 0; //Shows which 4G bands should be allowed
var guiSuPLMNIDlist         =    //Super User list with available options to download from cloud and flash onto board
[ "None Available      " ];
var guiSuUniiList           =    //Blocked UNII freq list
[
    {"fq":5190, "tck":0, "dis":1}, // frequency, ticked={1=block channel, 0=allow channel}, disabled={0=allow user to change tick state, 1=user cannot change tick state}
    {"fq":5200, "tck":0, "dis":1},
    {"fq":5210, "tck":0, "dis":1},
    {"fq":5220, "tck":0, "dis":1},
    {"fq":5230, "tck":0, "dis":1},
    {"fq":5240, "tck":0, "dis":1},
    {"fq":5250, "tck":0, "dis":1},
    {"fq":5260, "tck":0, "dis":1},
    {"fq":5270, "tck":0, "dis":1},
    {"fq":5280, "tck":0, "dis":1},
    {"fq":5290, "tck":0, "dis":1},
    {"fq":5300, "tck":0, "dis":1},
    {"fq":5310, "tck":0, "dis":1},
    {"fq":5510, "tck":0, "dis":1},
    {"fq":5520, "tck":0, "dis":1},
    {"fq":5530, "tck":0, "dis":1},
    {"fq":5540, "tck":0, "dis":1},
    {"fq":5550, "tck":0, "dis":1},
    {"fq":5560, "tck":0, "dis":1},
    {"fq":5570, "tck":0, "dis":1},
    {"fq":5580, "tck":0, "dis":1},
    {"fq":5590, "tck":0, "dis":1},
    {"fq":5600, "tck":0, "dis":1},
    {"fq":5610, "tck":0, "dis":1},
    {"fq":5620, "tck":0, "dis":1},
    {"fq":5630, "tck":0, "dis":1},
    {"fq":5640, "tck":0, "dis":1},
    {"fq":5650, "tck":0, "dis":1},
    {"fq":5660, "tck":0, "dis":1},
    {"fq":5670, "tck":0, "dis":1},
    {"fq":5680, "tck":0, "dis":1},
    {"fq":5690, "tck":0, "dis":1},
    {"fq":5700, "tck":0, "dis":1},
    {"fq":5715, "tck":0, "dis":1},
    {"fq":5725, "tck":0, "dis":1},
    {"fq":5735, "tck":0, "dis":1},
    {"fq":5745, "tck":0, "dis":1},
    {"fq":5755, "tck":0, "dis":1},
    {"fq":5765, "tck":0, "dis":1},
    {"fq":5775, "tck":0, "dis":1},
    {"fq":5785, "tck":0, "dis":1},
    {"fq":5795, "tck":0, "dis":1},
    {"fq":5805, "tck":0, "dis":1},
    {"fq":5815, "tck":0, "dis":1},
    {"fq":5825, "tck":0, "dis":1}
 ];
var guiSuTechBandAllowedBias =   //TechBandBias :: tech{0=wcdma, 1=lte}, bd:band, blk{0=band will be relayed, 1=band is blocked}, bias
[
    {"tech":0, "bd":0, "blk":0, "bias":0}
];

//-------------------------------------------------------------------------------------------
var guiCurrentMode          = null;

var guiMainButtonsDisabled  = true;
var guiButtonSwDisabled     = true;
var guiButtonSwHtml         = null;
var guiButtonTkDisabled     = true;
var guiButtonTkHtml         = null;
var guiButtonRegDisabled    = true;
var guiButtonRegHtml        = null;

var guiIconRegDisabled      = true;
var guiIconRegHtml          = null;
var guiIconUniiDisabled     = false;
var guiIconUniiHtml         = null;
var guiIconSbIfDisabled     = false;
var guiIconSbIfHtml         = null;

var guiGotTechModeValues    = false;
var guiBoosterModeText      = ["Auto", "3G", "4G-4GX", "Band A", "Band B", "Band C"];


// The following arrays support the Tech Mode data received from the Cel-Fi unit and are organized as follows:
//
//        Index        guiNrLabels       guiNrUnits  guiNrSizeof     guiNr0Values   guiNr1Values   guiNr2Values   guiNr3Values
//          0          Band                                          2                 17        
//          1          Technology                                    WCDMA             LTE
//         ...
//         69
//
//        Index        guiNmLabels    guiNmUnits    guiNmSizeof      guiNmValues
//          0          UNII labels
//        ...
//         14          UNII labels
//
//
//        Index        guiCrLabels       guiCrUnits  guiCrSizeof     guiC0r0Values   guiC0r1Values   guiC0r2Values   guiC0r3Values
//          0         
//          1         
//         ...
//         14
//
//        Index        guiCmLabels    guiCmUnits    guiCmSizeof      guiC0mValues
//          0          UNII labels
//        ...
//         14          UNII labels

// Create undefind arrays of specified length
const NR_DATA_TABLE_LENGTH       = 70;
const NM_DATA_TABLE_LENGTH       = 15;

const CR_DATA_TABLE_LENGTH       = 15;
const CM_DATA_TABLE_LENGTH       = 15;


var guiNrLabels          = new Array(NR_DATA_TABLE_LENGTH);
var guiNrUnits           = new Array(NR_DATA_TABLE_LENGTH);
var guiNrSizeof          = new Array(NR_DATA_TABLE_LENGTH);
var guiNr0Values         = new Array(NR_DATA_TABLE_LENGTH);
var guiNr1Values         = new Array(NR_DATA_TABLE_LENGTH);
var guiNr2Values         = new Array(NR_DATA_TABLE_LENGTH);
var guiNr3Values         = new Array(NR_DATA_TABLE_LENGTH);

var guiNmLabels          = new Array(NM_DATA_TABLE_LENGTH);
var guiNmUnits           = new Array(NM_DATA_TABLE_LENGTH);
var guiNmSizeof          = new Array(NM_DATA_TABLE_LENGTH);
var guiNmValues          = new Array(NM_DATA_TABLE_LENGTH);


var guiCrLabels          = new Array(CR_DATA_TABLE_LENGTH);
var guiCrUnits           = new Array(CR_DATA_TABLE_LENGTH);
var guiCrSizeof          = new Array(CR_DATA_TABLE_LENGTH);
var guiC0r0Values         = new Array(CR_DATA_TABLE_LENGTH);
var guiC0r1Values         = new Array(CR_DATA_TABLE_LENGTH);
var guiC0r2Values         = new Array(CR_DATA_TABLE_LENGTH);
var guiC0r3Values         = new Array(CR_DATA_TABLE_LENGTH);

var guiCmLabels          = new Array(CM_DATA_TABLE_LENGTH);
var guiCmUnits           = new Array(CM_DATA_TABLE_LENGTH);
var guiCmSizeof          = new Array(CM_DATA_TABLE_LENGTH);
var guiC0mValues          = new Array(CM_DATA_TABLE_LENGTH);
// End of Tech Mode data variables ---------------------------------------------------------------------------



/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//  Internal functions called to support the GUI data
//
//

// InitGuiData............................................................................................
function InitGuiData()
{
    // 0 fill our Data Tables...note that .fill(0) function not yet supported.
    for( var i = 0; i < NR_DATA_TABLE_LENGTH; i++ )
    {
        guiNrLabels[i]   = "";
        guiNrUnits[i]    = "";
        guiNrSizeof[i]   = 0;
        guiNr0Values[i]  = 0;
        guiNr1Values[i]  = 0;
        guiNr2Values[i]  = 0;
        guiNr3Values[i]  = 0;
    }

    for( var i = 0; i < NM_DATA_TABLE_LENGTH; i++ )
    {
        guiNmLabels[i]   = "";
        guiNmUnits[i]    = "";
        guiNmSizeof[i]   = 0;
        guiNmValues[i]   = 0;
    }

    for( var i = 0; i < CR_DATA_TABLE_LENGTH; i++ )
    {
        guiCrLabels[i]   = "";
        guiCrUnits[i]    = "";
        guiCrSizeof[i]   = 0;
        guiC0r0Values[i]  = 0;
        guiC0r1Values[i]  = 0;
        guiC0r2Values[i]  = 0;
        guiC0r3Values[i]  = 0;
    }

    for( var i = 0; i < CM_DATA_TABLE_LENGTH; i++ )
    {
        guiCmLabels[i]   = "";
        guiCmUnits[i]    = "";
        guiCmSizeof[i]   = 0;
        guiC0mValues[i]   = 0;
    }


    guiNrLabels[0] = "Band";
    guiNrLabels[1] = "Technology";
}


//.................................................................................................................
// Return the units for the given label...
function GetTechUnits( tag )
{
    var i;
    
    // First search the Nr labels array...
    for( i = 0; i < NR_DATA_TABLE_LENGTH; i++ )
    {
        if( guiNrLabels[i] == tag )
        {
            return( guiNrUnits[i] );
        }
    }
    
    // The tag was not found in the NU radio array so search the misc array... 
    for( i = 0; i < NM_DATA_TABLE_LENGTH; i++ )
    {
        if( guiNmLabels[i] == tag )
        {
            return( guiNmUnits[i] );
        }
    } 


    for( i = 0; i < CR_DATA_TABLE_LENGTH; i++ )
    {
        if( guiCrLabels[i] == tag )
        {
            return( guiCrUnits[i] );
        }
    }
    
    // The tag was not found in the NU radio array so search the misc array... 
    for( i = 0; i < CM_DATA_TABLE_LENGTH; i++ )
    {
        if( guiCmLabels[i] == tag )
        {
            return( guiCmUnits[i] );
        }
    } 

    return( "" );
}

//.................................................................................................................
//  Return the value for the given label based on channel number.   0 to 3 for the radio array and 4 for the misc array.
function GetTechValue( tag, channel )
{
    var i;
    var iVal = 0;
    
    if( channel < NUM_CHANNELS )
    {
        for( i = 0; i < NR_DATA_TABLE_LENGTH; i++ )
        {
            if( guiNrLabels[i] == tag )
            {
                switch( channel )
                {
                    case 0: iVal = guiNr0Values[i]; break;
                    case 1: iVal = guiNr1Values[i]; break;
                    case 2: iVal = guiNr2Values[i]; break;
                    case 3: iVal = guiNr3Values[i]; break;
                }
                
                return( iVal );
            }
        }
        
        for( i = 0; i < CR_DATA_TABLE_LENGTH; i++ )
        {
            if( guiCrLabels[i] == tag )
            {
                switch( channel )
                {
                    case 0: iVal = guiC0r0Values[i]; break;
                    case 1: iVal = guiC0r1Values[i]; break;
                    case 2: iVal = guiC0r2Values[i]; break;
                    case 3: iVal = guiC0r3Values[i]; break;
                }
                
                return( iVal );
            }
        }
    }

    
    if( channel == 4 )
    {
        for( i = 0; i < NM_DATA_TABLE_LENGTH; i++ )
        {
            if( guiNmLabels[i] == tag )
            {
                return( guiNmValues[i] );
            }
        }
        
        for( i = 0; i < CM_DATA_TABLE_LENGTH; i++ )
        {
            if( guiCmLabels[i] == tag )
            {
                return( guiC0mValues[i] );
            }
        } 
    }    
    
    return( iVal );
}


//.................................................................................................................
function DumpDataTables()
{
    var outText;
    
    //                 6                   26          38            52             67             82             97
    PrintLog(1, "Index guiNrLabels         guiNrUnits  guiSizeof     guiNr0Values   guiNr1Values   guiNr2Values   guiNr3Values" );
    
    for( var i = 0; i < NR_DATA_TABLE_LENGTH; i++ )
    {
        if( guiNrLabels[i].length != 0 )
        {
        
            if( i < 10 )
            {
                outText = "[ " + i + "] " + guiNrLabels[i];
            }
            else
            {
                outText = "[" + i + "] " + guiNrLabels[i];
            }
    
            
            while( outText.length < 26 ) outText += " ";
            outText += guiNrUnits[i];
            
            while( outText.length < 38 ) outText += " ";
            outText += guiNrSizeof[i];
    
            while( outText.length < 52 ) outText += " ";
            outText += guiNr0Values[i];
    
            while( outText.length < 67 ) outText += " ";
            outText += guiNr1Values[i];
    
            while( outText.length < 82 ) outText += " ";
            outText += guiNr2Values[i];
    
            while( outText.length < 97 ) outText += " ";
            outText += guiNr3Values[i];

            PrintLog(1, outText);
        }
    }
    
    
    PrintLog(1, "------------------------------------------------------------------------------------------------------------" );
    //                 6                   26          38            52             67             82             97
    PrintLog(1, "Index guiNmLabels         guiNmUnits  guiSizeof     guiNmValues" );
    
    for( var i = 0; i < NM_DATA_TABLE_LENGTH; i++ )
    {
        if( guiNmLabels[i].length != 0 )
        {
            if( i < 10 )
            {
                outText = "[ " + i + "] " + guiNmLabels[i];
            }
            else
            {
                outText = "[" + i + "] " + guiNmLabels[i];
            }
    
            
            while( outText.length < 26 ) outText += " ";
            outText += guiNmUnits[i];
            
            while( outText.length < 38 ) outText += " ";
            outText += guiNmSizeof[i];
    
            while( outText.length < 52 ) outText += " ";
            outText += guiNmValues[i];

            PrintLog(1, outText);
        }
    }
    

    PrintLog(1, "------------------------------------------------------------------------------------------------------------" );
    //                 6                   26          38            52             67             82             97
    PrintLog(1, "Index guiCrLabels         guiCrUnits  guiSizeof     guiC0r0Values  guiC0r1Values  guiC0r2Values  guiC0r3Values" );
    
    for( var i = 0; i < CR_DATA_TABLE_LENGTH; i++ )
    {
        if( guiCrLabels[i].length != 0 )
        {
            if( i < 10 )
            {
                outText = "[ " + i + "] " + guiCrLabels[i];
            }
            else
            {
                outText = "[" + i + "] " + guiCrLabels[i];
            }
    
            
            while( outText.length < 26 ) outText += " ";
            outText += guiCrUnits[i];
            
            while( outText.length < 38 ) outText += " ";
            outText += guiCrSizeof[i];
    
            while( outText.length < 52 ) outText += " ";
            outText += guiC0r0Values[i];
    
            while( outText.length < 67 ) outText += " ";
            outText += guiC0r1Values[i];
    
            while( outText.length < 82 ) outText += " ";
            outText += guiC0r2Values[i];
    
            while( outText.length < 97 ) outText += " ";
            outText += guiC0r3Values[i];

            PrintLog(1, outText);
        }
    }
    
    
    PrintLog(1, "------------------------------------------------------------------------------------------------------------" );
    //                 6                   26          38            52             67             82             97
    PrintLog(1, "Index guiCmLabels         guiCmUnits  guiSizeof     guiC0mValues" );
    
    for( var i = 0; i < CM_DATA_TABLE_LENGTH; i++ )
    {
        if( guiCmLabels[i].length != 0 )
        {
            if( i < 10 )
            {
                outText = "[ " + i + "] " + guiCmLabels[i];
            }
            else
            {
                outText = "[" + i + "] " + guiCmLabels[i];
            }
    
            
            while( outText.length < 26 ) outText += " ";
            outText += guiCmUnits[i];
            
            while( outText.length < 38 ) outText += " ";
            outText += guiCmSizeof[i];
    
            while( outText.length < 52 ) outText += " ";
            outText += guiC0mValues[i];

            PrintLog(1, outText);
        }
    }
    
   
    PrintLog(1, "------------------------------------------------------------------------------------------------------------" );
    PrintLog(1, "guiProductType         = " + guiProductType );                    // String based on the 3 digits in the SKU  590Nxxx.
    PrintLog(1, "guiMobilityFlag        = " + guiMobilityFlag );                   // Flag based on the "P" field of the SKU.
    PrintLog(1, "guiSerialNumber        = " + guiSerialNumber );                   // String based on the serial number.
    PrintLog(1, "guiUserFirstName       = " + guiUserFirstName );                  // First name that registered.
    PrintLog(1, "guiBoost               = " + guiBoost );                          // CalculateUniiBars().
    PrintLog(1, "guiNuBars              = " + guiNuBars );                         // CalculateNuBars().
    PrintLog(1, "guiRegistrationFlag    = " + guiRegistrationFlag );               // true if registered.
    PrintLog(1, "guiRegistrationLockBits= 0x" + guiRegistrationLockBits.toString(16) );    // Bit 0: Loc Lock, Bit 1: Reg, Bit 2: Reg Required, Bit 3: Reg Desired/Optional
    PrintLog(1, "guiOperator            = " + guiOperator );                       // String based on 700 number from Cel-Fi.
    PrintLog(1, "guiOperatorCode        = " + guiOperatorCode );                   // 4-digit operator code.
    PrintLog(1, "guiOperatorFlag        = " + guiOperatorFlag );                   // Flag:  true:  display operator selection 
    PrintLog(1, "guiOperatorList        = " + JSON.stringify(guiOperatorList) );   // An array of operators to select.
    PrintLog(1, "guiDeviceFlag          = " + guiDeviceFlag );                     // Flag:  true:  display device selection 
    PrintLog(1, "guiDeviceAddrList      = " + JSON.stringify(guiDeviceAddrList) ); // An array of device BT addresses to select.
    PrintLog(1, "guiDeviceRssiList      = " + JSON.stringify(guiDeviceRssiList) ); // An array of RSSI values.
    PrintLog(1, "guiDeviceList          = " + JSON.stringify(guiDeviceList) );     // An array of Serial Numbers.
    PrintLog(1, "guiSoftwareStatus      = " + guiSoftwareStatusText[guiSoftwareStatus] );                 // Number: 0=unknown, 1=Checking for updates, 2=Please update, 3=Up to date, 4=Update in progress
    PrintLog(1, "guiSoftwareButtonFlag  = " + guiSoftwareButtonFlag );             // Flag: true to enable the update button.
    
    PrintLog(1, "guiSoftwareDirtyFlag   = " + guiSoftwareDirtyFlag );              // Flag:  Set to true by program code when status has changed.  Gui code can set to false.
    PrintLog(1, "guiAntennaFlag         = " + guiAntennaFlag );                    // Flag:  true:  display antenna selection 
    PrintLog(1, "guiSettingsDirtyFlag   = " + guiSettingsDirtyFlag );              // Flag:  Set to true by program code when status has changed.  Gui code can set to false.
    PrintLog(1, "guiAntennaManualFlag   = " + guiAntennaManualFlag );              // Flag:  true: manual control
    PrintLog(1, "guiAntennaIntFlags     = " + JSON.stringify(guiAntennaIntFlags) ); 
    PrintLog(1, "guiAntennaBands        = " + JSON.stringify(guiAntennaBands) );   // Number:  > 0 band is active.
    PrintLog(1, "guiAntennaFreqArrayMHz = " + JSON.stringify(guiAntennaFreqArrayMHz) );  
    PrintLog(1, "guiBoosterFlag         = " + guiBoosterFlag );                    // Flag:  true:  display booster selection
    PrintLog(1, "guiBoosterCurrentMode  = " + guiBoosterModeText[guiBoosterCurrentMode] );              // 0=auto, 1=3G/4G, 2=LTE
    PrintLog(1, "guiBoosterBands        = " + JSON.stringify(guiBoosterBands) );          

    PrintLog(1, "guiBands               = " + JSON.stringify(guiBands) );          // Number:  > 0 band is active.
    PrintLog(1, "guiNetworkBars         = " + JSON.stringify(guiNetworkBars) );    // Numbers: Array of 4 numbers from 0 to 5. Calculated from RSRP(LTE) or RSCP(WCDMA).
    PrintLog(1, "guiTechnologyTypes     = " + JSON.stringify(guiTechnologyTypes) );// Number: 0=WCDMA, 1=LTE        
    PrintLog(1, "guiFreqArrayMHz        = " + JSON.stringify(guiFreqArrayMHz) );   // Number:  Freq in MHz.
    PrintLog(1, "guiRadios              = " + JSON.stringify(guiRadios) );         // Strings
    PrintLog(1, "guiCellState           = " + JSON.stringify(guiCellState) );      // Number:  Array ...
   
    PrintLog(1, "guiSwNames             = " + JSON.stringify(guiSwNames) );      
    PrintLog(1, "guiSwCelFiVers         = " + JSON.stringify(guiSwCelFiVers) ); 
    PrintLog(1, "guiSwCldVers           = " + JSON.stringify(guiSwCldVers) );   
    PrintLog(1, "guiSwStatus            = " + JSON.stringify(guiSwStatus) );    
  
}


// Use typed arrays so data will be signed.
//.................................................................................................................
function MakeI8( iVal )
{
    var iVal8  = new Int8Array(2);
    iVal8[0]   = iVal;
    iVal8[1]   = 0;
    
    return( iVal8[0] ); 
}

//.................................................................................................................
function MakeI16( iVal )
{
    var iVal16  = new Int16Array(2);
    iVal16[0]   = iVal;
    iVal16[1]   = 0;
    
    return( iVal16[0] ); 
}

//.................................................................................................................
function MakeI32( iVal )
{
    var iVal32  = new Int32Array(2);
    iVal32[0]   = iVal;
    iVal32[1]   = 0;
    
    return( iVal32[0] ); 
}



// Called by the gui code for user selection.
// opSelectionIdx:  Index into guiOperatorList[].
//.................................................................................................................
function SetOperatorSelection( opSelectionIdx )
{
    SetNewOperatorSku( opSelectionIdx );
}

//.................................................................................................................
// 1) Disconnect BT if connected.
// 2) Connect BT
// 3) Send command to flash
// 4) Remain connected...
function ConnectAndIdentifyDevice( devSelectionIdx )
{
    if( (devSelectionIdx >= 0) && (devSelectionIdx < guiDeviceAddrList.length) )
    {
    	CnxAndIdentifySouthBoundDevice( devSelectionIdx );
    }
    else
    {
        PrintLog(99, "GUI: ConnectAndIdentifyDevice() bad index: " + devSelectionIdx );
    }

}

//.................................................................................................................
// - BT device must already be connected.   Simply sets a flag to allow main to proceed.
function ConnectDevice()
{
	isSouthBoundIfListDone = true;              // Main app loop must be placed on hold until true.
}

//.................................................................................................................
function SetDeviceSelection( devSelectionIdx )
{
    if( (devSelectionIdx >= 0) && (devSelectionIdx < guiDeviceAddrList.length) )
    {
        ConnectSouthBoundIf( devSelectionIdx );
        isSouthBoundIfListDone = true;              // Main app loop must be placed on hold until true.
    }
    else
    {
        PrintLog(99, "GUI: SelectBluetooth() bad index: " + devSelectionIdx );
    }

}

//.................................................................................................................
function SetSoftwareUpdate()
{
    Dld.handleDldKey();
}


//.................................................................................................................
function ResetNu()
{
    PrintLog(1, "ResetNU called");
    
    if( bCnxToCu )
    {
        // If some message is pending then schedule a come back...
        if( isNxtyMsgPending() == true )
        {
            setTimeout( ResetNu, 130 );
        }
        else
        {
            SetNxtySuperMsgResetRemoteUnit();
            
            // The reset will cause a NAK since the unit is resetting so clear to Tx block and switch the UART to local.
            setTimeout(SetUartLocal, 4000);
            ShowAlertPopUpMsg("Remote Reset...", "NU should now be reset!");
        }
    }
    else
    {
        // If some message is pending then schedule the message for later...
        if( isNxtyMsgPending() == true )
        {
            setTimeout( ResetNu, 130 );
        }
        else
        {
            SetNxtySuperMsgResetLocalUnit();
            ShowAlertPopUpMsg("Local Reset...", "NU should now be reset!");
        }
    }
    
}



