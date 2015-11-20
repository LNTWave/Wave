//=================================================================================================
//
//  File: cloud.js
//
//  Description:  This file contains the actual Northbound network calls to the cloud.
//
//=================================================================================================


var isNetworkConnected = null;


// SendNorthBoundData............................................................................................
function SendNorthBoundData( nType, nUrl, nContentType, nData, nRespFormat, successCb, errorCb )
{
    // Verify that we have network connectivity....
    isNetworkConnected = NorthBoundConnectionActive();

    if( isNetworkConnected )
    {
        // Send data to the cloud using a jQuery ajax call...        
        $.ajax({
            type       : nType,
            url        : nUrl,
            contentType: nContentType,
            data       : nData,
            crossDomain: true,                  // Needed to set to true to talk to Nextivity server.
            dataType   : nRespFormat,           // Response format
            success    : successCb,             // Success callback
            error      : errorCb,               // Error callback
            timeout    : 5000                   // sets timeout to 5 seconds
        });
    }
    else
    {
        PrintLog( 99, "SendNorthBoundData: No network connection (WiFi or Cell)." );
    }
}


function NorthBoundConnectionActive()
{
    return (navigator.connection.type == Connection.NONE)?false:true;
}
