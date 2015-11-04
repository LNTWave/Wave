//=================================================================================================
//
//  File: pcApp_initpc.js
//
// Add the fake functions to make the general code work as if on phone
//
//=================================================================================================

function initAppToRunOnPc()
{
    PrintLog(1, "---- initAppToRunOnPc ----" );
    
    if (navigator.connection === undefined)
    {
        navigator.connection = {
            isConnected : true,
            ManualCheckInternetUp : function()
            {
                return this.isConnected; //how to check connected?? call function in Qt and in QT use http://karanbalkar.com/2014/02/detect-internet-connection-using-qt-5-framework/ to return true/false
            }
        };
    }
    else
        PrintLog(1, " found navigator.connection" );

    if (navigator.app === undefined)
    {
        navigator.app = {
            exitApp : function()
            {
                PrintLog(1, "**** navigator.app.exitApp triggered!! ****" );
            }
        };
    }
    else
        PrintLog(1, " found navigator.app" );

    if (navigator.notification === undefined)
    {
    }
    else
        PrintLog(1, " found navigator.notification" );

    if (window.plugins === undefined)
    {
    }
    else
        PrintLog(1, " found window.plugins" );

    if (window.device === undefined)
    {
        window.device = {
            platform : "PcBrowser", // pcBrowserPlatform from main.js
            version  : "1.1",
            model    : "Qt QWebView",
            printDeviceId : function()
            {
                return "Model: " + this.model + " OS: " + this.platform + " Ver:" + this.version;
            }
        };
    }
    else
        PrintLog(1, " found window.device" );
}

function SetMaxTxPhoneBuffers(numBuffers)
{
    PrintLog(1, "FAKE: SetMaxTxPhoneBuffers: " + numBuffers );
}