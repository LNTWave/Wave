//=================================================================================================
//
//  File: msg_axeda.js
//
//  Description:  This file is used to format communications with the Axeda cloud.
//                Normal communications is via the Axeda URL using json data.
//
//=================================================================================================

var mySandboxPlatformUrl    = "https://nextivity-sandbox-connect.axeda.com:443/ammp/";
var myPlatformUrl           = "https://nextivity-connect.axeda.com:443/ammp/";
var myOperatorCode          = "0000";
var myLat                   = 32.987838;            // Nextivity lat
var myLong                  = -117.074195;          // Nextivity long
const CFG_RUN_ON_SANDBOX    = true;                 // true to run on Axeda sandbox.  false to run on Axeda production platform.




// SendCloudAsset............................................................................................
function SendCloudAsset()
{
    if( (myModel != null) && (mySn != null) )
    {
        // Set the ping rate to 0 so egress queue times out and resets quickly.
        var myAsset    = "{'id': {'mn':'" + myModel + "', 'sn':'" + mySn + "', 'tn': '0' }, 'pingRate': 0 }";
        var myAssetUrl = myPlatformUrl + "assets/1";
        
        PrintLog( 1, "SendCloudAsset: " + myAssetUrl + "  " + myAsset );
        
        SendNorthBoundData( 
            "POST",
            myAssetUrl,
            "application/json;charset=utf-8",
            myAsset,
            "",  // 'json',                         // response format
            function(response)                      // success call back
            {
                if( response != null )
                {
                    var responseText = JSON.stringify(response);    // Returns "" at a minimum
                    if( responseText.length > 2 )
                    {
                        PrintLog( 1, "Response success: SendCloudAsset()..." + responseText );
                        ProcessEgressResponse(response);
                    }
                }
            },
            function(response)                      // error call back
            {
                PrintLog( 99, "Response error: SendCloudAsset()..." + JSON.stringify(response) );
            }
        );
        
    }
    else
    {
        PrintLog( 99, "SendCloudAsset: Model and SN not available yet" );
    }
}

// SendCloudData............................................................................................
function SendCloudData(dataText)
{
    if( (myModel != null) && (mySn != null) )
    {
        var myData    = "{'data':[{'di': {" + dataText + "}}]}";
        var myDataUrl = myPlatformUrl + "data/1/" + myModel + "!" + mySn;
        
        PrintLog( 1, "SendCloudData: " + myDataUrl + "  " + myData );
        
        SendNorthBoundData( 
            "POST",
            myDataUrl,
            "application/json;charset=utf-8",
            myData,
            "",  // 'json',    // response format
            function(response) 
            {
                if( response != null )
                {
                    var responseText = JSON.stringify(response);    // Returns "" at a minimum
                    if( responseText.length > 2 )
                    {
                        PrintLog( 1, "Response success: SendCloudData()..." + responseText );
                        ProcessEgressResponse(response);
                    }
                }
            },
            function(response) 
            {
                PrintLog( 99, "Response error: SendCloudData()..." + JSON.stringify(response) );
            }
        );

    }
    else
    {
        PrintLog( 99, "SendCloudData: Model and SN not available yet. myModel=" + myModel + " mySn=" + mySn );
    }
    
}

// SendCloudLocation............................................................................................
function SendCloudLocation(lat, long)
{
    if( (myModel != null) && (mySn != null) )
    {
        var myData    = "{'locations':[{'latitude':" + lat + ", 'longitude':" + long + "}]}";
        var myDataUrl = myPlatformUrl + "data/1/" + myModel + "!" + mySn;
        
        PrintLog( 1, "SendCloudLocation: " + myDataUrl + "  " + myData );
        
        
        SendNorthBoundData( 
            "POST",
            myDataUrl,
            "application/json;charset=utf-8",
            myData,
            "",     // 'json',    // response format
            function(response) 
            {
                if( response != null )
                {
                    var responseText = JSON.stringify(response);    // Returns "" at a minimum
                    if( responseText.length > 2 )
                    {
                        PrintLog( 1, "Response success: SendCloudLocation()..." + responseText );
                        ProcessEgressResponse(response);
                    }
                }
            },
            function(response) 
            {
                PrintLog( 99, "Response error: SendCloudLocation()..." + JSON.stringify(response) );
            }
        );

    }
    else
    {
        PrintLog( 99, "SendCloudLocation: Model and SN not available yet" );
    }

    
}



// SendCloudEgressStatus............................................................................................
function SendCloudEgressStatus(packageId, myStatus)
{
    if( (myModel != null) && (mySn != null) )
    {
        var myData    = "{'status':" + myStatus + "}";
        var myDataUrl = myPlatformUrl + "packages/1/" + packageId + "/status/" + myModel + "!" + mySn;
        
        PrintLog( 1, "SendCloudEgressStatus: " + myDataUrl + "  " + myData );
        
        
        SendNorthBoundData( 
            "PUT",
            myDataUrl,
            "application/json;charset=utf-8",
            myData,
            "",     // 'json',    // response format
            function(response) 
            {
                if( response != null )
                {
                    var responseText = JSON.stringify(response);    // Returns "" at a minimum
                    if( responseText.length > 2 )
                    {
                        PrintLog( 1, "Response success: SendCloudEgressStatus()..." + responseText );
                        ProcessEgressResponse(response);
                    }
                }
            },
            function(response) 
            {
                PrintLog( 99, "Response error: SendCloudEgressStatus()..." + JSON.stringify(response) );
            }
        );
        
    }
    else
    {
        PrintLog( 99, "SendCloudEgressStatus: Model and SN not available yet" );
    }

    
}


// SendCloudPoll............................................................................................
function SendCloudPoll()
{
    if( (myModel != null) && (mySn != null) )
    {
        var myAssetUrl = myPlatformUrl + "assets/1/" + myModel + "!" + mySn;
        
        PrintLog( 1, "SendCloudPoll: " + myAssetUrl );
        
        
        SendNorthBoundData( 
            "POST",
            myAssetUrl,
            "",         // no contentType
            "",         // no data
            "",     // 'json',     // response format
            function(response) 
            {
                if( response != null )
                {
                    var responseText = JSON.stringify(response);    // Returns "" at a minimum
                    if( responseText.length > 2 )
                    {
                        PrintLog( 1, "Response success: SendCloudPoll()..." + responseText );
                        ProcessEgressResponse(response);
                    }
                }
            },
            function(response) 
            {
                PrintLog( 99, "Response error: SendCloudPoll()..." + JSON.stringify(response) );
            }
        );
        
    }
    else
    {
        PrintLog( 99, "SendCloudPoll: Model and SN not available yet" );
    }
}







// FixCloudVer....................................................................................
// 
// Convert version strings, 700.xxx.yyy.zzz to yyy.zzz.
//
function FixCloudVer(ver)
{
    var inVer = ver;

    // First check to make sure that there is a period "." in the string...
    if( ver.search(/\x2E/) != -1 )
    {
        // 700.xxx.yyy.zzz in xxx.yyy.zzz out
        var str1 = ver.substring(ver.search(/\x2E/) + 1);           // 0x2E is a period ".".
        
        
        // xxx.yyy.zzz in yyy.zzz out.
        var str2 = str1.substring(str1.search(/\x2E/) + 1);         // 0x2E is a period ".".
        
        // Make sure that there is at least one more period in the string...
        if( str2.search(/\x2E/) != -1 )
        {
            ver = str2;
            
            // Make sure that it is zero loaded up front... xxx.yyy
            if( ver.length < 7 )
            {
                str1 = ver.substring(0,ver.search(/\x2E/));         // grab xxx
                str2 = ver.substring(ver.search(/\x2E/) + 1);       // grab yyy
                
                if( str1.length == 1 )                        // test for x.yyy
                {
                    str1 = "00" + str1;
                }
                else if( str1.length == 2 )                   // test for xx.yyy
                {
                    str1 = "0" + str1;
                }
                
                if( str2.length == 1 )                        // test for xxx.y
                {
                    str2 = "00" + str2;
                }
                else if( str2.length == 2 )                   // test for xxx.yy
                {
                    str2 = "0" + str2;
                }
                
                ver = str1 + "." + str2;
            }
        }
    }    
    
    PrintLog(1, "FixCloudVer() in =" + inVer + " out=" + ver );

    return( ver );
}

// FixInternalVer....................................................................................
// 
// Convert version strings, yyy.zzz to yyy.zzz making sure 7 characters...
//
function FixInternalVer(ver)
{
    var inVer = ver;

    // First check to make sure that there is a period "." in the string...
    if( ver.search(/\x2E/) != -1 )
    {
        // Make sure that it is zero loaded up front... xxx.yyy
        if( ver.length < 7 )
        {
            var str1 = ver.substring(0,ver.search(/\x2E/));         // grab xxx
            var str2 = ver.substring(ver.search(/\x2E/) + 1);       // grab yyy
            
            if( str1.length == 0 )                        // test for .yyy
            {
                str1 = "000";
            }
            else if( str1.length == 1 )                   // test for x.yyy
            {
                str1 = "00" + str1;
            }
            else if( str1.length == 2 )                   // test for xx.yyy
            {
                str1 = "0" + str1;
            }
            
            if( str2.length == 0 )                        // test for xxx.null
            {
                str2 = "000";
            }
            else if( str2.length == 1 )                   // test for xxx.y
            {
                str2 = "00" + str2;
            }
            else if( str2.length == 2 )                   // test for xxx.yy
            {
                str2 = "0" + str2;
            }
            
            ver = str1 + "." + str2;
        }
    }
    else
    {
        // No period so make something up...
        ver = "000.000";
    }    
    
//    PrintLog(1, "FixInternalVer() in =" + inVer + " out=" + ver );

    return( ver );
}


// ProcessEgressResponse......................................................................................
function ProcessEgressResponse(eg)
{
    var i;
    var egStr;
    
    //  Set items loook like....    
    // {set:[
    //          {items:{firstName:"John"},priority:0},
    //          {items:{lastName:"Doe"},priority:0},
    //          {items:{city:"San Clemente"},priority:0},
    //          {items:{getUserInfoAction:"true"},priority:0},
    //      ]  
    //  } ;
    
    egStr = JSON.stringify(eg);
    if( egStr.search("set") != -1 )
    {
        PrintLog(1, "Egress: Number of set items equals " + eg.set.length );
    
        for( i = 0; i < eg.set.length; i++ )
        {
            egStr = JSON.stringify(eg.set[i].items);
            

            // Search for strings associated with getUserInfoAction (search() returns -1 if no match found)
            //   getUserInfoAction returns false if there is no information but set bGotUserInfoRspFromCloud
            //   just to know that the cloud has returned nothing or something.
            if(      egStr.search("getUserInfoAction") != -1 )   bGotUserInfoRspFromCloud   = true;        
            else if( egStr.search("firstName")         != -1 )   guiUserFirstName = szRegFirstName  = eg.set[i].items.firstName;
            
/*
jdo: only grab first name just in case phone data gets cleared.                    
            else if( egStr.search("lastName")          != -1 )   szRegLastName              = eg.set[i].items.lastName;        
            else if( egStr.search("addr_1")            != -1 )   szRegAddr1                 = eg.set[i].items.addr_1;        
            else if( egStr.search("addr_2")            != -1 )   szRegAddr2                 = eg.set[i].items.addr_2;
            else if( egStr.search("city")              != -1 )   szRegCity                  = eg.set[i].items.city;
            else if( egStr.search("state")             != -1 )   szRegState                 = eg.set[i].items.state;
            else if( egStr.search("zip")               != -1 )   szRegZip                   = eg.set[i].items.zip;
            else if( egStr.search("country")           != -1 )   szRegCountry               = eg.set[i].items.country;
            else if( egStr.search("phone")             != -1 )   szRegPhone                 = eg.set[i].items.phone;
*/                    
                    

            // Search for strings associated with OperatorList egress...
            if(      egStr.search("OperatorList")      != -1 )   
            {
                bGotOperatorInfoRspFromCloud = true;
                szOperatorSkus               = eg.set[i].items.OperatorList;
                
                if( szOperatorCodeNames != null )
                {
                    GenerateOperatorList();
                }
            }        


                    
            // Search for strings associated with Registration egress...
            if(      egStr.search("regOpForce")        != -1 )   myRegOpForce               = eg.set[i].items.regOpForce;       // true to force
            else if( egStr.search("regDataFromOp")     != -1 )   myRegDataFromOp            = eg.set[i].items.regDataFromOp;
    
            
            // Search for strings associated with Software Download egress...
            else if( egStr.search("isUpdateAvailable") != -1 )  {isUpdateAvailableFromCloud = eg.set[i].items.isUpdateAvailable;  bGotUpdateAvailableRspFromCloud  = true;}
            else if( egStr.search("SwVerNU_CF_CldVer") != -1 )  {nxtySwVerNuCfCld           = eg.set[i].items.SwVerNU_CF_CldVer;  bNeedNuCfCldId    = true;  nxtySwVerNuCfCld  = FixCloudVer(nxtySwVerNuCfCld);}
            else if( egStr.search("SwVerCU_CF_CldVer") != -1 )  {nxtySwVerCuCfCld           = eg.set[i].items.SwVerCU_CF_CldVer;  bNeedCuCfCldId    = true;  nxtySwVerCuCfCld  = FixCloudVer(nxtySwVerCuCfCld);}
            else if( egStr.search("SwVerNU_PIC_CldVer") != -1 ) {nxtySwVerNuPicCld          = eg.set[i].items.SwVerNU_PIC_CldVer; bNeedNuPicCldId   = true;  nxtySwVerNuPicCld = FixCloudVer(nxtySwVerNuPicCld);}
            else if( egStr.search("SwVerCU_PIC_CldVer") != -1 ) {nxtySwVerCuPicCld          = eg.set[i].items.SwVerCU_PIC_CldVer; bNeedCuPicCldId   = true;  nxtySwVerCuPicCld = FixCloudVer(nxtySwVerCuPicCld);}
            else if( egStr.search("SwVer_BT_CldVer")    != -1 ) {nxtySwVerCuBtCld           = eg.set[i].items.SwVer_BT_CldVer;    bNeedBtCldId      = true;  nxtySwVerCuBtCld  = FixCloudVer(nxtySwVerCuBtCld);}
            
            else if( egStr.search("SwVerNU_UCFG_CldVer") != -1 ) {nxtySwVerNuUCfgCld        = eg.set[i].items.SwVerNU_UCFG_CldVer; bNeedNuUCfgCldId = true;  nxtySwVerNuUCfgCld = FixCloudVer(nxtySwVerNuUCfgCld);}
            else if( egStr.search("SwVerNU_SCFG_CldVer") != -1 ) {nxtySwVerNuSCfgCld        = eg.set[i].items.SwVerNU_SCFG_CldVer; bNeedNuSCfgCldId = true;  nxtySwVerNuSCfgCld = FixCloudVer(nxtySwVerNuSCfgCld);}
            else if( egStr.search("SwVerNU_ART_CldVer") != -1 )  {nxtySwVerNuArtCld         = eg.set[i].items.SwVerNU_ART_CldVer;  bNeedNuArtCldId  = true;  nxtySwVerNuArtCld  = FixCloudVer(nxtySwVerNuArtCld);}
            else if( egStr.search("SwVerNU_EVM_CldVer") != -1 )  {nxtySwVerNuEvmCld         = eg.set[i].items.SwVerNU_EVM_CldVer;  bNeedNuEvmCldId  = true;  nxtySwVerNuEvmCld  = FixCloudVer(nxtySwVerNuEvmCld);}
            else if( egStr.search("SwVerCU_ART_CldVer") != -1 )  {nxtySwVerCuArtCld         = eg.set[i].items.SwVerCU_ART_CldVer;  bNeedCuArtCldId  = true;  nxtySwVerCuArtCld  = FixCloudVer(nxtySwVerCuArtCld);}
            
        }
        
        
        // Remove the "700.xxx" from the "700.xxx.yyy.zzz" cloud string.
//        nxtySwVerNuCfCld  = FixCloudVer(nxtySwVerNuCfCld);
//        nxtySwVerCuCfCld  = FixCloudVer(nxtySwVerCuCfCld);
//        nxtySwVerNuPicCld = FixCloudVer(nxtySwVerNuPicCld);
//        nxtySwVerCuPicCld = FixCloudVer(nxtySwVerCuPicCld);
//        nxtySwVerCuBtCld  = FixCloudVer(nxtySwVerCuBtCld);
    }


    // packages look like...
    // {packages:[
    //                  {id:641, instructions:[
    //                      {@type:down, id:921, fn:"WuExecutable.sec", fp:"."}], priority:0, time:1414810929705},
    //                  {id:642, instructions:[
    //                      {@type:down, id:922, fn:"BTFlashImg.bin", fp:"."}], priority:0, time:1414810929705}
    //               ]

    egStr = JSON.stringify(eg);
    if( egStr.search("packages") != -1 )
    {
        PrintLog(1, "Egress: Number of package instructions equals " + eg.packages.length );
        
        // Find the fixed file names and save the file ID numbers.   Note that the first ID is the package ID.
        //  File name "PICFlashImg.bin" is used for both the NU and CU PICs.
        //  Future proof in case there are different PIC images: "NuPICFlashImg.bin" and "CuPICFlashImg.bin"
        for( i = 0; i < eg.packages.length; i++ )
        {
            egStr = JSON.stringify(eg.packages[i].instructions);
            
            var packageId = eg.packages[i].id;
            SendCloudEgressStatus(packageId, 0);    // Indicate QUEUED
            SendCloudEgressStatus(packageId, 2);    // Indicate SUCCESS
            
            // Search for strings associated with software download (search() returns -1 if no match found)
            if(      egStr.search(myNuCfFileName)   != -1 )   fileNuCfCldId   = eg.packages[i].instructions[0].id;        
            else if( egStr.search(myCuCfFileName)   != -1 )   fileCuCfCldId   = eg.packages[i].instructions[0].id;  
            else if( egStr.search("PICFlashImg")    != -1 )   fileNuPicCldId  = fileCuPicCldId = eg.packages[i].instructions[0].id;  
            else if( egStr.search(myNuPicFileName)  != -1 )   fileNuPicCldId  = eg.packages[i].instructions[0].id;                     // Future proof  
            else if( egStr.search(myCuPicFileName)  != -1 )   fileCuPicCldId  = eg.packages[i].instructions[0].id;                     // Future proof
            else if( egStr.search(myBtFileName)     != -1 )   fileBtCldId     = eg.packages[i].instructions[0].id;
            else if( egStr.search(myNuSCfgFileName) != -1 )   fileNuSCfgCldId = eg.packages[i].instructions[0].id;  
            else if( egStr.search(myNuUCfgFileName) != -1 )   fileNuUCfgCldId = eg.packages[i].instructions[0].id;  
            else if( egStr.search(myNuArtFileName)  != -1 )   fileNuArtCldId  = eg.packages[i].instructions[0].id;  
            else if( egStr.search(myNuEvmFileName)  != -1 )   fileNuEvmCldId  = eg.packages[i].instructions[0].id;  
            else if( egStr.search(myCuArtFileName)  != -1 )   fileCuArtCldId  = eg.packages[i].instructions[0].id;  
        }
        

        // See if we received all needed packages after we received the set...
        if( isUpdateAvailableFromCloud )
        {  
            if( (bNeedNuCfCldId    && (fileNuCfCldId   == 0)) || 
                (bNeedCuCfCldId    && (fileCuCfCldId   == 0)) || 
                (bNeedNuPicCldId   && (fileNuPicCldId  == 0)) || 
                (bNeedNuSCfgCldId  && (fileNuSCfgCldId == 0)) || 
                (bNeedNuUCfgCldId  && (fileNuUCfgCldId == 0)) || 
                (bNeedNuArtCldId   && (fileNuArtCldId  == 0)) || 
                (bNeedNuEvmCldId   && (fileNuEvmCldId  == 0)) || 
                (bNeedCuPicCldId   && (fileCuPicCldId  == 0)) || 
                (bNeedCuArtCldId   && (fileCuArtCldId  == 0)) || 
                (bNeedBtCldId      && (fileBtCldId     == 0)) )
            {
                bGotPackageAvailableRspFromCloud = false;    
            }
            else
            {
                bGotPackageAvailableRspFromCloud = true;    
            }
        }
        
    }  
    
    PrintLog(1, "Egress:  bGotUpdateAvailableRspFromCloud=" + bGotUpdateAvailableRspFromCloud + " isUpdateAvailableFromCloud=" + isUpdateAvailableFromCloud + " bGotPackageAvailableRspFromCloud=" + bGotPackageAvailableRspFromCloud );    
    
}





    
