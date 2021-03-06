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
var guiSerialNumber         = null;             // String based on the serial number.
var guiBoost                = 0;                // Number: Use the max distance metric just as in CalculateUniiBars().
var guiOperator             = null;             // String based on 2 digit code from SKU.

var guiOperatorFlag         = false;            // Flag:  true:  display operator selection 
var guiOperatorList         = [];               // An array of operators to select.
var guiDeviceFlag           = false;            // Flag:  true:  display device selection 
var guiDeviceList           = [];               // An array of devices to select.
var guiRegistrationPercent  = -1;               // If >= 0 then display prograss bar...
var guiSoftwareStatus       = 0;                // Number: 0=unknown, 1=Checking for updates, 2=Please update, 3=Up to date, 4=Update in progress
const   SW_STATUS_UNKNOWN            = 0;
const   SW_STATUS_CHECKING           = 1;
const   SW_STATUS_PLEASE_UPDATE      = 2;
const   SW_STATUS_UP_TO_DATE         = 3;
const   SW_STATUS_UPDATE_IN_PROGRESS = 4;
var guiSoftwareButtonFlag   = false;            // Flag:  true to enable the update button.
var guiSoftwareButtonText   = "";   
var guiSoftwareDirtyFlag    = false;            // Flag:  Set to true by program code when status has changed.  Gui code can set to false.
var guiAntennaFlag          = false;            // Flag:  true:  display antenna selection 
var guiAntennaDirtyFlag     = false;            // Flag:  Set to true by program code when status has changed.  Gui code can set to false.
var guiAntennaManualFlag    = false;            // Flag:  true:  Manual control of ant selection.
var guiAntennaIntFlags      = [false,false,false,false]; 
var guiAntennaBands         = [0,0,0,0];        // Number:  bands
var guiAntennaFreqArrayMHz  = [0,0,0,0];        // Number:  Freq band in MHz.
var guiBoosterFlag          = false;            // Flag:  true:  display booster selection
var guiBoosterTechnology    = -1;               // 0=auto, 1=3G/4G, 2=LTE
var guiBoosterBand          = 0;          

var guiBands                = [0,0,0,0];        // Number:  > 0 band is active.
var guiNetworkBars          = [0,0,0,0];        // Numbers: Array of 4 numbers from 0 to 5. Calculated from RSRP(LTE) or RSCP(WCDMA).
var guiTechnologyTypes      = [0,0,0,0];        // Number: 0=WCDMA, 1=LTE        
var guiFreqArrayMHz         = [0,0,0,0];        // Number:  Freq in MHz.
var guiRadios               = ["","","",""];    // Strings
var guiCellState            = [0,0,0,0];        // Number:  Array ...


var guiSwNames              = ["NU","CU","NU PIC","CU PIC","CU BT"];         // Software image names
var guiSwCelFiVers          = ["","","","",""];                              // Software versions in the Cel-Fi hardware
var guiSwCldVers            = ["","","","",""];                              // Software versions in the Cloud
var guiSwStatus             = ["OK","OK","OK","OK","OK"];                    // Status


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
var NR_DATA_TABLE_LENGTH       = 70;
var NM_DATA_TABLE_LENGTH       = 15;

var CR_DATA_TABLE_LENGTH       = 15;
var CM_DATA_TABLE_LENGTH       = 15;


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
    
    if( channel < 4 )
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
    PrintLog(1, "guiSerialNumber        = " + guiSerialNumber );                   // String based on the serial number.
    PrintLog(1, "guiBoost               = " + guiBoost );                          // Number: Use the max distance metric just as in CalculateUniiBars().
    PrintLog(1, "guiOperator            = " + guiOperator );                       // String based on 2 digit code from SKU.
    PrintLog(1, "guiOperatorFlag        = " + guiOperatorFlag );                   // Flag:  true:  display operator selection 
    PrintLog(1, "guiOperatorList        = " + JSON.stringify(guiOperatorList) );   // An array of operators to select.
    PrintLog(1, "guiDeviceFlag          = " + guiDeviceFlag );                     // Flag:  true:  display device selection 
    PrintLog(1, "guiDeviceList          = " + JSON.stringify(guiDeviceList) );     // An array of devices to select.
    PrintLog(1, "guiSoftwareStatus      = " + guiSoftwareStatus );                 // Number: 0=unknown, 1=Checking for updates, 2=Please update, 3=Up to date, 4=Update in progress
    PrintLog(1, "guiSoftwareButtonFlag  = " + guiSoftwareButtonFlag );             // Flag: true to enable the update button.
    
    PrintLog(1, "guiSoftwareDirtyFlag   = " + guiSoftwareDirtyFlag );              // Flag:  Set to true by program code when status has changed.  Gui code can set to false.
    PrintLog(1, "guiAntennaFlag         = " + guiAntennaFlag );                    // Flag:  true:  display antenna selection 
    PrintLog(1, "guiAntennaDirtyFlag    = " + guiAntennaDirtyFlag );               // Flag:  Set to true by program code when status has changed.  Gui code can set to false.
    PrintLog(1, "guiAntennaManualFlag   = " + guiAntennaManualFlag );              // Flag:  true: manual control
    PrintLog(1, "guiAntennaIntFlags     = " + JSON.stringify(guiAntennaIntFlags) ); 
    PrintLog(1, "guiAntennaBands        = " + JSON.stringify(guiAntennaBands) );   // Number:  > 0 band is active.
    PrintLog(1, "guiAntennaFreqArrayMHz = " + JSON.stringify(guiAntennaFreqArrayMHz) );  
    PrintLog(1, "guiBoosterFlag         = " + guiBoosterFlag );                    // Flag:  true:  display booster selection
    PrintLog(1, "guiBoosterTechnology   = " + guiBoosterTechnology );              // 0=auto, 1=3G/4G, 2=LTE
    PrintLog(1, "guiBoosterBand         = " + guiBoosterBand );          

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
    
    return( iVal8[0] ); 
}

//.................................................................................................................
function MakeI16( iVal )
{
    var iVal16  = new Int16Array(2);
    iVal16[0]   = iVal;
    
    return( iVal16[0] ); 
}

//.................................................................................................................
function MakeI32( iVal )
{
    var iVal32  = new Int32Array(2);
    iVal32[0]   = iVal;
    
    return( iVal32[0] ); 
}



// Called by the gui code for user selection.
//.................................................................................................................
function SetOperatorSelection( opSelection )
{
}

//.................................................................................................................
function SetDeviceSelection( devSelection )
{
}

//.................................................................................................................
function SetSoftwareUpdate()
{
    Dld.handleDldKey();
}




//.................................................................................................................
function SetBoosterTechnology(tech)
{
}


//.................................................................................................................
function SetBoosterBand(band)
{
}
