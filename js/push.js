//=================================================================================================
//
//  File: push.js
//
//  Description:  Support file which contains all functionality to "push" alerts to the phone.
//
//=================================================================================================

// Global file variables.......................................................
var pushNotification;

// Local file variables........................................................





// Global System calls ..........................................................................................

// Android..........................................................................................................
// InitGcmPush......................................................................................................
//
//   Initializes the Android Google Cloud Messaging (GCM) service.
// 
//  Input: device id
//
//  Outputs: none
//
function InitGcmPush(id) 
{
    pushNotification = window.plugins.pushNotification;
    pushNotification.register(successGcmHandler, errorGcmHandler,{"senderID":"1061836550351","ecb":"onGcmNotification"});
} 


// Local working functions ........................................................................

// result contains any message sent from the plugin call
function successGcmHandler(result) 
{
    PrintLog(1, "Push: Android Registration Success! Result = " + result );
}

function errorGcmHandler(error) 
{
    PrintLog(99, "Push: Android Registration error: " + error );
}

function onGcmNotification(e) 
{
    PrintLog(1, "Push: Android Notification = " + JSON.stringify(e) );

    switch( e.event )
    {
        case 'registered':
            if ( e.regid.length > 0 )
            {
                // This id needs to be sent to Axeda...
                SendCloudData( "'gcmRegId':'" + e.regid + "'" );
            }
            break;

        case 'message':
            ShowAlertPopUpMsg( "Push Alert", e.message );
            break;

        case 'error':
            PrintLog(99, "GCM: error = " + e.msg );
            break;

        default:
            PrintLog(99, "GCM: Unknown event = " + JSON.stringify(e.msg) );
            break;
    }
}








// IOS..............................................................................................................
// InitIosPush......................................................................................................
//
//   Initializes the Apple IOS service.
// 
//  Input: device id
//
//  Outputs: none
//
function InitIosPush(id) 
{
    PrintLog(1, "Push:  InitIosPush()" );
    
    pushNotification = window.plugins.pushNotification;
    pushNotification.register(tokenHandler, errorIosHandler, {"badge":"true","sound":"true","alert":"true","ecb":"onIosNotification"}); 
} 


// result contains any message sent from the plugin call
function tokenHandler(result) 
{
    PrintLog(1, "Push: IOS Registration Success! Result = " + result );
    SendCloudData( "'iosRegId':'" + result + "'" );
}

function errorIosHandler(error) 
{
    PrintLog(99, "Push: IOS Registration error: " + error );
}

function successIosHandler (result) 
{
    PrintLog(1, "Push: IOS success callback! Result = " + result );
}
        
function onIosNotification(e) 
{
    PrintLog(1, "Push: IOS Notification = " + JSON.stringify(e) );

    if(e.alert) 
    {
         ShowAlertPopUpMsg("Push Alert",  e.alert);
    }

    if(e.sound) 
    {
        // playing a sound also requires the org.apache.cordova.media plugin
//        var snd = new Media(e.sound);
//        snd.play();
    }

    if(e.badge) 
    {
        pushNotification.setApplicationIconBadgeNumber(successIosHandler, errorIosHandler, e.badge);
    }
    
    if(e.body)
    { 
        ShowAlertPopUpMsg("Push Alert",  e.body );
    }
}


