//=================================================================================================
//
//  File: operator.js
//
//  Description:  Contains functions to change operators on the Cel-Fi
//
//=================================================================================================

var bGotOperatorInfoRspFromCloud = false;           // Set to true when response from cloud.  Check szOperatorSkus and if not NULL then use.
var szOperatorSkus               = null;            // Filled in by Cloud, getOperatorInfoAction, and looks like "590NP34NOCA2RGCA1B11RE,590NP34NOCA2WMCA1B11RA,590NP34NOCA2VMCA1B11RA"
var szOperatorCodeNames          = null;            // Filled in by call to Nextivity server and looks like: "A1AT:A1 Telecom Austria AG,AEBR:Accenture Brazil,ALSA:Aljawal STC Saudi Arabia,ATUS:AT&T"
var newOperatorSku               = null;

// GenerateOperatorList...........................................................................................................
// Called when both of the following have been filled in and builds a list in guiOperatorList[] and sets guiOperatorFlag to true. 
// Isolate the operator codes for each of the SKUs, bytes 12 to 15, and then find the name for that operator in the szOperatorCodeNames array.  
//    - szOperatorSkus         Filled in by Cloud, getOperatorInfoAction, and looks like "590NP34NOCA2RGCA1B11RE,590NP34NOCA2WMCA1B11RA,590NP34NOCA2VMCA1B11RA"
//    - szOperatorCodeNames    Filled in by call to Nextivity server and looks like: "A1AT:A1 Telecom Austria AG,AEBR:Accenture Brazil,ALSA:Aljawal STC Saudi Arabia,ATUS:AT&T"
//    - guiOperatorFlag        Flag:  true:  display operator selection 
//    - guiOperatorList        An array of operators to select.
function GenerateOperatorList() 
{
    var i;
    var j;
    
    PrintLog(1, "GenerateOperatorList(): szOperatorSkus=" + szOperatorSkus );
    
    if( (szOperatorSkus != null) && (szOperatorCodeNames != null) )
    {
        var tempSkuList = szOperatorSkus.split(",");            // Build an array of 590 values
        var tempOpList  = szOperatorCodeNames.split(",");       // Build an array of CODE:NAME pairs. 

        for( i = 0; i < tempSkuList.length; i++ )
        {
            var tempOpCode = tempSkuList[i].substring(12,16);
//            PrintLog(1,"SKU[" + i + "]=" + tempSkuList[i] + " Opcode=" + tempOpCode );
            
            for( j = 0; j < tempOpList.length; j++ )
            {
                if( tempOpList[j].search(tempOpCode) != -1 )
                {
                    // Get the name  CODE:NAME
                    guiOperatorList[i] = tempOpList[j].substring( tempOpList[j].search(":") + 1 ); 
                    guiOperatorFlag    = true;
                    break;
                }
            }
            
            if( j == tempOpList.length )
            {
                // Did not find a match for tempOpCode
                PrintLog(99, "No match found for " + tempOpCode );
                guiOperatorList[i] = tempOpCode + " No match found.";
            }
            
        } 
    }
    
    PrintLog(1, "  guiOperatorList=" + JSON.stringify(guiOperatorList)  );
}


// SetNewOperatorSku...........................................................................................................
// Called when user selects the name of the new operator. 
// The argument passed to this function is the index of the guiOperatorList[] which matches the list of 590s
// in the szOperatorSkus string.
//
//      
//      guiOperatorList[0] = "Rogers Canada" <-->    tempSkuList[0] = "590NP34NOCA2RGCA1B11RE"
//            etc...
function SetNewOperatorSku(opIndex) 
{
    var tempSkuList = szOperatorSkus.split(",");            // Regenerate an array of SKU (590) values
    newOperatorSku  = tempSkuList[opIndex];
    
    PrintLog(1, "SetNewOperatorSku(" + opIndex + ") ==> New Operator SKU=" + newOperatorSku );

    // Send new operator, i.e. new SKU.   Keep the same SKU as the model number for this hardware.
    SendCloudData( "'SKU_Number':'" + newOperatorSku + "'" );

    // Go to the download page and download all files...
    guiSoftwareStatus = SW_STATUS_UNKNOWN;
    RequestModeChange(PROG_MODE_DOWNLOAD_AUTO);

}


        
