//=================================================================================================
//
//  File: tech.js
//
//  Description:  This file contains the functions necessary for processing the Engineering mode
//                data sometimes called Tech Mode data.
//
//=================================================================================================


var TechLoopTxIntervalHandle   = null;
var bLookForRsp                = false;
var userPageInc                = 0;
var maxPageRows                = 11;
var FreshLoopCounter           = 0;
var LastPageDisplayed          = 0;
var stopSpinnerTimeout         = null;
var bOkToStopSpinner           = false;
var bNeedPageLabel             = true;
var bGetLinkStatus             = false;
var iNumberRows                = 0;
var iReadTechPageTries         = 0;
var iTechPageCount             = 0;
var iGetLabelPageNum           = 0;
var bGatheringTechData         = false;

const   MAX_LABEL_PAGE         = 8;





// --------------------------------------------------------------------------------------------
// 
function StartGatheringTechData() 
{
    if( bGatheringTechData == false )
    {
        PrintLog(1, "StartGatheringTechData...");
        bLookForRsp = false;

        // Almost immediately start requesting data...
        TechLoopTxIntervalHandle = setInterval(tech.GetFreshPageLoop, 10 );
    }
    
    bGatheringTechData = true;
}

// --------------------------------------------------------------------------------------------
// 
function StopGatheringTechData() 
{
    if( bGatheringTechData == true )
    {
        PrintLog(1, "StopGatheringTechData...");
        clearInterval(TechLoopTxIntervalHandle);
    }
    
    bGatheringTechData = false;    
}


var tech = {

    // Handle the Tech Mode key
    handleBackKey: function()
    {
//        clearInterval(TechLoopTxIntervalHandle);
        PrintLog(1, "");
        PrintLog(1, "Tech: Tech Mode Back key pressed------------------------------------------------");

//        StopGatheringTechData();
                 
        DumpDataTables();         
         
        app.renderHomeView();
    },


    // readTechPage...
    readTechPage: function()
    {
//        PrintLog(1, "ReadTechPage(" + iReadTechPageTries + "): msgRxLastCmd=" + msgRxLastCmd + " bReadAddrRsp=" + bReadAddrRsp );
        
        // Wait for the original write to complete 
        if( bWriteAddrRsp )
        {
            if( iReadTechPageTries == 0 )
            { 
                // Every now and then grab the link status...
                if( bGetLinkStatus )
                {
                    GetNxtySuperMsgLinkStatus();
                    
                    // Simulate a call to ReadAddrReq().
                    bReadAddrRsp = true;
                    nxtyReadAddrRsp |= CU_CLOUD_INFO_GET_PAGE_BIT;
                }
                else
                {
                    // See if the page is ready...
                    ReadAddrReq( NXTY_PCCTRL_CLOUD_INFO );
                }
            }
            else
            {
                // See if the PIC has responded with the current status...
                if( bNxtySuperMsgRsp && bReadAddrRsp )
                {
                    if( (nxtyReadAddrRsp & CU_CLOUD_INFO_GET_PAGE_BIT) == 0 )
                    {
                        var uBytes = (nxtyReadAddrRsp & 0xFF);
                        
                        // Limit the number of bytes to the max of 252.
                        if( uBytes > 252 )
                        {
                            uBytes = 252;
                        }
                        
                        // Page is ready so read it...read only the number of bytes indicated...
                        ReadDataReq( nxtyCuCloudBuffAddr, uBytes, READ_DATA_REQ_TECH_TYPE );
                        iTechPageCount++;
  
                        // 9 pages of labels and 6 pages of binary plus a safety net...
                        if( iTechPageCount == 16 )
                        {
                            // Should have most of the values now...
                            guiGotTechModeValues = true;
                            DumpDataTables();
                        }
                      
                        // Every 25 pages grab a link status.
                        if( !(iTechPageCount % 25) )
                        {
                            bGetLinkStatus = true;
                        }
                        else
                        {
                            bGetLinkStatus = false;
                        }
                        return;
                    }
                    else
                    {
                        // Check again to see if page is ready...
                        ReadAddrReq( NXTY_PCCTRL_CLOUD_INFO );
                    }
                }
            }
            
            iReadTechPageTries++;
        }
                
        
        if( iReadTechPageTries < 80 )   // Wait up to 4 seconds.
        {
            if( bGatheringTechData == true )
            {
                if( bGetLinkStatus )
                {
                    // Allow for the Link status to respond.
                    setTimeout( function(){ tech.readTechPage(); }, 200 );    // Come back in 200 mS.
                }
                else
                {
                    setTimeout( function(){ tech.readTechPage(); }, 50 );    // Come back in 50 mS.
                }
            }
        } 
        else
        {
            PrintLog(99, "ReadTechPage() timed out after 4 seconds." );
            bLookForRsp = false;    // Allow GetFreshPageLoop() to fire.
        }
    },

    renderTechView: function() 
    {
        guiCurrentMode = PROG_MODE_TECH;
    },



    GetFreshPageLoop: function() 
    {
        var u8Buff  = new Uint8Array(10);
        
        if( (bLookForRsp == false) || (FreshLoopCounter > 4) )
        {
            if( bGatheringTechData == true )
            {
                PrintLog(4, "Tech: Get Fresh Page loop..." );
               
                // Stop and restart the timer because we don't know if we got here 
                // because of this timer or at the end of Rx Processing.
                clearInterval(TechLoopTxIntervalHandle);
                TechLoopTxIntervalHandle = setInterval(tech.GetFreshPageLoop, 2000 );
               
                
                // Clear bits 0 to 11 of cloud info.
                nxtyCuCloudInfo &= ~CU_CLOUD_INFO_TECH_MASK;
    
                // OR in the request to get a page...
                nxtyCuCloudInfo |= CU_CLOUD_INFO_GET_PAGE_BIT;
    
    
    
                // If we are done with labels then check to make sure that we have all labels...
                if( bNeedPageLabel && (iGetLabelPageNum > MAX_LABEL_PAGE)  )
                {
                    // Perform a sanity check of the data to make sure that the ending label of
                    // each array is "End" and that there are labels for all array slots.
                    for( i = 0; i < CM_DATA_TABLE_LENGTH; i++ )
                    {
                        if( guiCmLabels[i] == "End" )
                        {
                            PrintLog(1, "  Check: Found the End of Cm labels at index " + i );
                            break;
                        }
                        
                        if( guiCmLabels[i].length == 0 )
                        {
                            PrintLog(99, "Found a blank Cm label at index " + i + " before finding the End.  Will retry to get labels." );
                            iGetLabelPageNum = 8;    // Reset....
                            iTechPageCount   = 8;
                            break;
                        }
                    }                        
    
                    for( i = 0; i < CR_DATA_TABLE_LENGTH; i++ )
                    {
                        if( guiCrLabels[i] == "End" )
                        {
                            PrintLog(1, "  Check: Found the End of Cr labels at index " + i );
                            break;
                        }
                        
                        if( guiCrLabels[i].length == 0 )
                        {
                            PrintLog(99, "Found a blank Cr label at index " + i + " before finding the End.  Will retry to get labels." );
                            iGetLabelPageNum = 7;    // Reset....
                            iTechPageCount   = 7;
                            break;
                        }
                    }                        
    
                    for( i = 0; i < NM_DATA_TABLE_LENGTH; i++ )
                    {
                        if( guiNmLabels[i] == "End" )
                        {
                            PrintLog(1, "  Check: Found the End of Nm labels at index " + i );
                            break;
                        }
                        
                        if( guiNmLabels[i].length == 0 )
                        {
                            PrintLog(99, "Found a blank Nm label at index " + i + " before finding the End.  Will retry to get labels." );
                            iGetLabelPageNum = 5;    // Reset....
                            iTechPageCount   = 5;
                            break;
                        }
                    }                        
                    
                    for( i = 0; i < NR_DATA_TABLE_LENGTH; i++ )
                    {
                        if( guiNrLabels[i] == "End" )
                        {
                            PrintLog(1, "  Check: Found the End of Nr labels at index " + i );
                            break;
                        }
                        
                        if( guiNrLabels[i].length == 0 )
                        {
                            PrintLog(99, "Found a blank Nr label at index " + i + " before finding the End.  Will retry to get labels." );
                            iGetLabelPageNum = 0;    // Reset....
                            iTechPageCount   = 0;
                            break;
                        }
                    }                        
                
                    // If no errors were found then move on...
                    if( iGetLabelPageNum > MAX_LABEL_PAGE )
                    {
                        bNeedPageLabel       = false;
                        iGetLabelPageNum     = 0;
                    }
                }
    
    
                
                if( bNeedPageLabel )
                {
                    nxtyCuCloudInfo |= CU_CLOUD_INFO_LABEL_BIT;
                    
                    // OR in the page in the lower 8 bits...
                    nxtyCuCloudInfo |= iGetLabelPageNum;
                   
                    iGetLabelPageNum++;
                }
                
                // Send to Ares...
                WriteAddrReq( NXTY_PCCTRL_CLOUD_INFO, nxtyCuCloudInfo );
                
                // Start looking for completion and get the data...
                bLookForRsp        = true;
                iReadTechPageTries = 0;
                tech.readTechPage();
                
                FreshLoopCounter = 0;
                
            }   // End of if( (guiCurrentMode == PROG_MODE_TECH) || (guiCurrentMode == PROG_MODE_MAIN)  )
        }
        else
        {
            FreshLoopCounter += 1;
            PrintLog(1, "Tech: Get Fresh Page loop not ready. Cnt: " + FreshLoopCounter );
        }
        
    },

};



// --------------------------------------------------------------------------------------------
// 
function ProcessTechData() 
{
    var i;
    var j;
    var idTxt;
    var dataLen;
        
    var outText = "Tech: Process Page Rsp...";
    var cloudText = "";
    
    // JSON data from device looks like...
    //     { 
    //       �id�:0,
    //       "idx":0,
    //       �lbl�: ["5 GHz DL Freq", "5 GHz UL Freq", ...],    // labels
    //       �sizeof�: [5000, 4000, ...],                       // size of each data element
    //       "unit":["dBm", "Hz"...]                            // units
    //     }
    

    // V2
    // u8RxBuff[0] = 0xAE (V2 ID)
    // u8RxBuff[1] = len  (should be 252, 0xFC)   (now optimized so can be less than 252)
    // u8RxBuff[2] = ~len (should be   3, 0x03)
    // u8RxBuff[3] = cmd  (should be headings response, 0x52)
    // u8RxBuff[4] to u8RxBuff[257] should be the JSON string data...
    
    
    // Determine if this response contains labels or binary data by checking u8RxBuff[4].  JSON=0x7B for '{'    
    if( u8RxBuff[4] == 0x7B )
    {
        // Process the JSON labels...............................................................
        // Find the end of the JSON string data...
        for( i = 4; i < 257; i++ )
        {
            if( u8RxBuff[i] == 0 )
            {
                break;
            }
        }
    
        var u8Sub    = u8RxBuff.subarray(4, i);     // u8RxBuff[4] to [i-1].
        var myString = bytesToString(u8Sub);
        var myData   = JSON.parse(myString);
    
        PrintLog(1, JSON.stringify(myData) );
    
        // See if the last label page received has the last page bit set, if so then no more labels...
        if( myData.page & 0x80 )
        {
            myData.page &= ~0x80;
            PrintLog(1, "Last label page detected..." );
        }

        outText += " Page: " + myData.page;



        // Nr labels...pages 0 to 4 
        if( (myData.page >= 0) && (myData.page <= 4) )
        {
            // See if any labels have been included, if so then update...
            if( myData.lbl.length != 0 )
            {
                if( (myData.idx + myData.lbl.length) < NR_DATA_TABLE_LENGTH )
                {
                    j = myData.idx;
                    for( i = 0; i < myData.lbl.length; i++ )
                    {
                        guiNrLabels[j] = myData.lbl[i];
                        
                        if( i < myData.sizeof.length )
                        {
                            guiNrSizeof[j] = myData.sizeof[i];
                        }

                        if( i < myData.unit.length )
                        {
                            guiNrUnits[j] = myData.unit[i];
                        }
                        
                        j++;
                    }
                }
                else
                {
                    PrintLog(99, "Length of Nr label data exceeds array size.  len=" + myData.idx + myData.lbl.length + " >= " + NR_DATA_TABLE_LENGTH );
                }
            }
        }
        else if( (myData.page >= 5) && (myData.page <= 6) )
        {
            // See if any labels have been included, if so then update...
            if( myData.lbl.length != 0 )
            {
                if( (myData.idx + myData.lbl.length) < NM_DATA_TABLE_LENGTH )
                {
                    j = myData.idx;
                    for( i = 0; i < myData.lbl.length; i++ )
                    {
                        guiNmLabels[j] = myData.lbl[i];
                        
                        if( i < myData.sizeof.length )
                        {
                            guiNmSizeof[j] = myData.sizeof[i];
                        }

                        if( i < myData.unit.length )
                        {
                            guiNmUnits[j] = myData.unit[i];
                        }
                        
                        j++;
                    }
                    
                }
                else
                {
                    PrintLog(99, "Length of Nm label data exceeds array size.  len=" + myData.idx + myData.lbl.length + " >= " + NM_DATA_TABLE_LENGTH );
                }
                
            }
        }
        else if( myData.page == 7 )
        {
            // See if any labels have been included, if so then update...
            if( myData.lbl.length != 0 )
            {
                if( (myData.idx + myData.lbl.length) < CR_DATA_TABLE_LENGTH )
                {
                    j = myData.idx;
                    for( i = 0; i < myData.lbl.length; i++ )
                    {
                        guiCrLabels[j] = myData.lbl[i];
                        
                        if( i < myData.sizeof.length )
                        {
                            guiCrSizeof[j] = myData.sizeof[i];
                        }

                        if( i < myData.unit.length )
                        {
                            guiCrUnits[j] = myData.unit[i];
                        }
                        
                        j++;
                    }
                }
                else
                {
                    PrintLog(99, "Length of Cr label data exceeds array size.  len=" + myData.idx + myData.lbl.length + " >= " + CR_DATA_TABLE_LENGTH );
                }
            }
        }
        else if( myData.page == 8 )
        {
            // See if any labels have been included, if so then update...
            if( myData.lbl.length != 0 )
            {
                if( (myData.idx + myData.lbl.length) < CM_DATA_TABLE_LENGTH )
                {
                    j = myData.idx;
                    for( i = 0; i < myData.lbl.length; i++ )
                    {
                        guiCmLabels[j] = myData.lbl[i];
                        
                        if( i < myData.sizeof.length )
                        {
                            guiCmSizeof[j] = myData.sizeof[i];
                        }

                        if( i < myData.unit.length )
                        {
                            guiCmUnits[j] = myData.unit[i];
                        }
                        
                        j++;
                    }
                }
                else
                {
                    PrintLog(99, "Length of Cm label data exceeds array size.  len=" + myData.idx + myData.lbl.length + " >= " + CM_DATA_TABLE_LENGTH );
                }
            }
        }
    }
    else        // Values................................................
    {
        var iVal;
        var iLastVal;
        
        // First byte of actual data is the block number...
        var uBlock = u8RxBuff[4];
        
        // Process the binary data...
        outText += " Binary data found.  Processing block number: " + uBlock.toString(10);
        
        switch( uBlock )
        {
            // NU Channel 0 to 3 processing.......................................................
            case 0:             // guiNr0Values...
            case 1:             // guiNr1Values...
            case 2:             // guiNr2Values...
            case 3:             // guiNr3Values...
            {
                j = 5;
                for( i = 0; i < NR_DATA_TABLE_LENGTH; i++ )
                {
                    if( guiNrLabels[i].length != 0 )
                    {
                        iVal = 0;
                        switch( guiNrSizeof[i] )
                        {
                            case 1: iVal = MakeI8( u8RxBuff[j] );  break;
                            case 2: iVal = MakeI16( (u8RxBuff[j] << 8) | u8RxBuff[j+1]);  break;
                            case 3: iVal = (u8RxBuff[j] << 16) | (u8RxBuff[j+1] << 8) | u8RxBuff[j+2]; break;
                            case 4: iVal = MakeI32( (u8RxBuff[j] << 24) | (u8RxBuff[j+1] << 16) | (u8RxBuff[j+2] << 8) | u8RxBuff[j+3] ); break;
                        }
                        
                        // Only send the data that has changed to the cloud....
                        switch( uBlock )
                        {
                            case 0: iLastVal = guiNr0Values[i]; break;
                            case 1: iLastVal = guiNr1Values[i]; break;
                            case 2: iLastVal = guiNr2Values[i]; break;
                            case 3: iLastVal = guiNr3Values[i]; break;
                        }

                        if( iLastVal != iVal )
                        { 
                            // Example string:  'TNR0_DL Center Freq':7390 for index, i.e. channel, 0 or 'TNR1_DL Center Freq':7390 for index 1
                            if( cloudText.length != 0 )
                            {
                                cloudText += ",";
                            }
                            
                            cloudText += "'TNR" + uBlock + "_" + guiNrLabels[i] +"':" + iVal;
                        }
                        
                        // Now store the current value...
                        switch( uBlock )
                        {
                            case 0: guiNr0Values[i] = iVal; break;
                            case 1: guiNr1Values[i] = iVal; break;
                            case 2: guiNr2Values[i] = iVal; break;
                            case 3: guiNr3Values[i] = iVal; break;
                        }
                        
                        // Bump past sizeof bytes in u8RxBuff.
                        j += guiNrSizeof[i];
                    }
                }
                
                break;
            }
            
            // NU Channel Misc processing.......................................................
            case 4:             // guiNmValues...
            {
                j = 5;
                for( i = 0; i < NM_DATA_TABLE_LENGTH; i++ )
                {
                    if( guiNmLabels[i].length != 0 )
                    {
                        iVal = 0;
                        switch( guiNmSizeof[i] )
                        {
                            case 1: iVal = MakeI8( u8RxBuff[j] );  break;
                            case 2: iVal = MakeI16( (u8RxBuff[j] << 8) | u8RxBuff[j+1] );  break;
                            case 3: iVal = (u8RxBuff[j] << 16) | (u8RxBuff[j+1] << 8) | u8RxBuff[j+2]; break;
                            case 4: iVal = MakeI32( (u8RxBuff[j] << 24) | (u8RxBuff[j+1] << 16) | (u8RxBuff[j+2] << 8) | u8RxBuff[j+3] ); break;
                        }

                        // Only send the data that has changed to the cloud....
                        iLastVal = guiNmValues[i];

                        if( iLastVal != iVal )
                        { 
                            // Example string:  'TNM_DL Center Freq':7390 for miscellaneous
                            if( cloudText.length != 0 )
                            {
                                cloudText += ",";
                            }
                            
                            cloudText += "'TNM_" + guiNmLabels[i] +"':" + iVal;
                        }
                        
                        // Now store the current value...
                        guiNmValues[i] = iVal;
                        
                        // Bump past sizeof bytes in u8RxBuff.
                        j += guiNmSizeof[i];
                    }
                }
                break;
            }
            
            // CU0 Channels 0 to 3 and Misc processing.......................................................
            case 5:             // guiC0rXValues and guiC0mValues
            {
                // guiC0r0Values, guiC0r1Values, guiC0r2Values, guiC0r3Values.......
                j = 5;
                for( uChannel = 0; uChannel < 4; uChannel++ )
                {
                    for( i = 0; i < CR_DATA_TABLE_LENGTH; i++ )
                    {
                        if( guiCrLabels[i].length != 0 )
                        {
                            iVal = 0;
                            switch( guiCrSizeof[i] )
                            {
                                case 1: iVal = MakeI8( u8RxBuff[j] );  break;
                                case 2: iVal = MakeI16( (u8RxBuff[j] << 8) | u8RxBuff[j+1]);  break;
                                case 3: iVal = (u8RxBuff[j] << 16) | (u8RxBuff[j+1] << 8) | u8RxBuff[j+2]; break;
                                case 4: iVal = MakeI32( (u8RxBuff[j] << 24) | (u8RxBuff[j+1] << 16) | (u8RxBuff[j+2] << 8) | u8RxBuff[j+3] ); break;
                            }
                            
                            // Only send the data that has changed to the cloud....
                            switch( uChannel )
                            {
                                case 0: iLastVal = guiC0r0Values[i]; break;
                                case 1: iLastVal = guiC0r1Values[i]; break;
                                case 2: iLastVal = guiC0r2Values[i]; break;
                                case 3: iLastVal = guiC0r3Values[i]; break;
                            }
    
                            if( iLastVal != iVal )
                            { 
                                // Example string:  'TC0R0_DL Center Freq':7390 for index, i.e. channel, 0 or 'TC0R1_DL Center Freq':7390 for channel 1
                                if( cloudText.length != 0 )
                                {
                                    cloudText += ",";
                                }
                                
                                cloudText += "'TC0R" + uChannel + "_" + guiCrLabels[i] +"':" + iVal;
                            }
                            
                            // Now store the current value...
                            switch( uChannel )
                            {
                                case 0: guiC0r0Values[i] = iVal; break;
                                case 1: guiC0r1Values[i] = iVal; break;
                                case 2: guiC0r2Values[i] = iVal; break;
                                case 3: guiC0r3Values[i] = iVal; break;
                            }
                            
                            // Bump past sizeof bytes in u8RxBuff.
                            j += guiCrSizeof[i];
                        }
                    }
                }
                
                // guiC0mValues are at the end...
                for( i = 0; i < CM_DATA_TABLE_LENGTH; i++ )
                {
                    if( guiCmLabels[i].length != 0 )
                    {
                        iVal = 0;
                        switch( guiCmSizeof[i] )
                        {
                            case 1: iVal = MakeI8( u8RxBuff[j] );  break;
                            case 2: iVal = MakeI16( (u8RxBuff[j] << 8) | u8RxBuff[j+1] );  break;
                            case 3: iVal = (u8RxBuff[j] << 16) | (u8RxBuff[j+1] << 8) | u8RxBuff[j+2]; break;
                            case 4: iVal = MakeI32( (u8RxBuff[j] << 24) | (u8RxBuff[j+1] << 16) | (u8RxBuff[j+2] << 8) | u8RxBuff[j+3] ); break;
                        }
                        
                        // Only send the data that has changed to the cloud....
                        iLastVal = guiC0mValues[i];

                        if( iLastVal != iVal )
                        { 
                            // Example string:  'TC0M_DL Center Freq':7390 for index 0, only one index
                            if( cloudText.length != 0 )
                            {
                                cloudText += ",";
                            }
                            
                            cloudText += "'TC0M_" + guiCmLabels[i] +"':" + iVal;
                        }
                        
                        // Now store the current value...
                        guiC0mValues[i] = iVal;
                        
                        // Bump past sizeof bytes in u8RxBuff.
                        j += guiCmSizeof[i];
                    }
                }
                
                break;
            }

            
        }   // End of block switch
        
        // Fill in some gui data.................................................
        for( i = 0; i < 4; i++ )
        {
            guiBands[i]             = GetTechValue( "Band",  i );
            guiRadios[i]            = String.fromCharCode(65 + GetTechValue( "Radio", i ));
            guiFreqArrayMHz[i]      = GetTechValue( "DL Center Freq", i ) / 10;
            guiTechnologyTypes[i]   = GetTechValue( "LTE?", i );
            guiCellState[i]         = GetTechValue( "Relaying", i );
            
            var iPwr  = GetTechValue( "Max DL RSCP", i )
            var iBars = 0;
            
            if( guiTechnologyTypes[i] == 1 )
            {
              if(      iPwr <  -120 )    iBars = 0;       // LTE RSRP
              else if( iPwr <= -110 )    iBars = 1;
              else if( iPwr <= -105 )    iBars = 2;
              else if( iPwr <= -98  )    iBars = 3;
              else if( iPwr <= -93  )    iBars = 4;
              else                       iBars = 5;
            }
            else 
            {
              if(      iPwr <  -104 )  iBars = 0;         // WCDMA RSCP
              else if( iPwr <= -100 )  iBars = 1;
              else if( iPwr <= -96  )  iBars = 2;
              else if( iPwr <= -93  )  iBars = 3;
              else if( iPwr <= -90  )  iBars = 4;
              else                     iBars = 5; 
            } 
            
            guiNetworkBars[i]       = iBars;
        }
        
        
    }       // End of binary data

                    
    PrintLog(1, outText );
    
    // Send to the cloud...
    if( cloudText.length != 0 )
    {
//        PrintLog(1, cloudText );
        SendCloudData(cloudText);
    }

    // Normal processing to acknowledge receipt of response...
    bLookForRsp = false;

    // Fire off a new page request, do not wait for 1 sec timer.
    setTimeout( function(){ tech.GetFreshPageLoop(); }, 10 );
    
}


    
