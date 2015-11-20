//=================================================================================================
//
//  File: pcApp_cloud.js
//
//  Description:  This file contains the actual Northbound network calls to the cloud.
//
//
//http://api.jquery.com/jQuery.ajax/
//complete
//  Type: Function( jqXHR jqXHR, String textStatus )
//   A function to be called when the request finishes (after success and error callbacks are executed). 
//error
//  Type: Function( jqXHR jqXHR, String textStatus, String errorThrown )
//   A function to be called if the request fails. The function receives three arguments: The jqXHR 
//   (in jQuery 1.4.x, XMLHttpRequest) object, a string describing the type of error that occurred and 
//   an optional exception object, if one occurred. Possible values for the second argument (besides null) 
//   are "timeout", "error", "abort", and "parsererror". When an HTTP error occurs, errorThrown receives 
//   the textual portion of the HTTP status, such as "Not Found" or "Internal Server Error."
//success
//  Type: Function( Anything data, String textStatus, jqXHR jqXHR )
//   A function to be called if the request succeeds. The function gets passed three arguments: The data 
//   returned from the server, formatted according to the dataType parameter or the dataFilter callback 
//   function, if specified; a string describing the status; and the jqXHR object
//=================================================================================================


var isNetworkConnected = null;

var QtNbManager        = null; // Qt object that will do the work


// SendNorthBoundData............................................................................................
//function SendNorthBoundData( nType, nUrl, nContentType, nData, nRespFormat, successCb, errorCb )
//{
//    // Verify that we have network connectivity....
//    isNetworkConnected = NorthBoundConnectionActive();
//    //PrintLog(1, "pcApp SendNorthBoundData:\n" + nType + "\n" + nUrl + "\n" + nContentType + "\n" + nData + "\n" + nRespFormat);// + "\n" + successCb + "\n" + errorCb);
//
//    if( isNetworkConnected )
//    {
//        // Send data to the cloud using a jQuery ajax call...        
//        $.ajax({
//            type       : nType,
//            url        : nUrl,
//            contentType: nContentType,
//            data       : nData,
//            dataType   : nRespFormat,           // Response format
//            success    : function(json_data, textStatus, xhrReq)             // Success, will call user callback successCb     xhrReq=XMLHttpRequest
//            {
//                PrintLog(1,"success callback for " + this.data + " -> '" + textStatus + "' json_data=" + json_data);
//                successCb(json_data);
//            },
//            error      : function(xhrReq, textStatus, error)                 // Error, will call user callback errorCb
//            {
//                PrintLog(1,"failed error callback for " + this.data + " -> '" + textStatus + "' error=" + error);
//                errorCb(textStatus);
//            }
//        });
//    }
//    else
//    {
//        PrintLog( 99, "SendNorthBoundData: No network connection (WiFi or Cell)." );
//    }
//}

function SendNorthBoundData( nType, nUrl, nContentType, nData, nRespFormat, successCb, errorCb )
{
    // Verify that we have network connectivity....
    isNetworkConnected = NorthBoundConnectionActive();
    //PrintLog(1, "pcApp SendNorthBoundData:\n" + nType + "\n" + nUrl + "\n" + nContentType + "\n" + nData + "\n" + nRespFormat);// + "\n" + successCb + "\n" + errorCb);

    if( isNetworkConnected )
    {
        if(QtNbManager != null)
        {
            QtNbManager.sendCloudThisMessage(nType, nUrl, nData);
        }
    }
    else
    {
        PrintLog( 99, "SendNorthBoundData: No network connection (WiFi or Cell)." );
    }
}

// endNorthBoundDataResponse............................................................................................
function SendNorthBoundDataResponse( nPassFail, sResponse )
{
    PrintLog( 1, "Response:SendNorthBoundData("+nPassFail+",len="+sResponse.length+")...'" + sResponse + "'" );
    
    if( (nPassFail==0) && (sResponse.length > 0) )
    {
        //var response = JSON.stringify(eval("(" + sResponse + ")"));
        var response = JSON.parse(sResponse);
        ProcessEgressResponse(response);
    }
    return 0;
}


// NorthBoundConnectionActive............................................................................................
function NorthBoundConnectionActive()
{
    if (navigator.connection !== undefined)
    {
        if (navigator.connection.type !== undefined)
            return (navigator.connection.type == Connection.NONE)?false:true;
        else if(navigator.connection.ManualCheckInternetUp !== undefined)
            return navigator.connection.ManualCheckInternetUp();
    }

    PrintLog( 99, "NorthBoundConnectionActive() needs to be updated for your platform" );
    return false;
}

// FileTransferDownload..............................................................................................
//
//  Downloads a file from server.
// 
//  Input: fromUrl:  URL to download from including file name.
//         toUrl:    URL to download to including file name.
//
//  Outputs: none
//
//
function FileTransferDownload( fromUrl, toUrl )
{

    PrintLog(1, "FileTransferDownload: from: " + fromUrl + "  to: " + toUrl );

    // Perform a file transfer from the platform to the destination directory...        
    g_fileTransferSuccess   = null;
    
    if(QtNbManager != null)
    {
        QtNbManager.doDownload(fromUrl, toUrl);
    }
}

// Download from Cloud File transfer callback..................................................................
function FileTransferDownloadResponse(nPassFail, sFileName)
{
    PrintLog(1, "FileTransferDownloadResponse in JS with " + nPassFail + " " + sFileName);
    if(nPassFail == 0)
    {
        PrintLog(1, "Download from cloud successfully complete: " + sFileName);
        g_fileTransferSuccess = true;
    }
    else
    {
        PrintLog(99, "Download from cloud failed: " + sFileName + " Error code: " + nPassFail);
        g_fileTransferSuccess = false;
    }
    return 0;
}

