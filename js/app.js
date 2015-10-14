var deviceOS = "";
var deviceOSVersion = "";
var app = {
    initiate : function(){
		if(deviceType == "phone"){
			window.plugins.orientationchanger.lockOrientation('portrait');
		}else{
			window.plugins.orientationchanger.lockOrientation('landscape');
		}
		
		mainContainer = document.getElementById("mainContainer");
		deviceHeight = document.documentElement.clientHeight;
		deviceWidth = document.documentElement.clientWidth;
		var logoContainer = document.createElement("div");
		logoContainer.id= "logoContainer";
		logoContainer.align = "center";
		logoContainer.className = "w100 vh100";
		mainContainer.appendChild(logoContainer);
		app.checkOSUpdate();
	},
	
	checkOSUpdate: function(){
		switch(deviceOS) {
		    case "iOS":
		        if(deviceOSVersion < config.iOSSupport){
					util.showErrorPopup('OSUpdateError');
				}else{
					bluetooth.checkBluetoothStatus();
				}
				break;
		    case "Android":
		        if(deviceOSVersion < config.androidSupport){
					util.showErrorPopup('OSUpdateError');
				}else{
					bluetooth.checkBluetoothStatus();
				}
				break;
		    default:
		        util.showErrorPopup('UnknownPlatform');
		}
	},
	
	closeApplication: function(){
		navigator.app.exitApp();	
	}
};

document.addEventListener("deviceready", onDeviceReady, false);
function onDeviceReady() {
	deviceOS = device.platform;
	deviceOSVersion = parseFloat(device.version);
	var envs = ['xs', 'sm', 'md', 'lg'];
    $el = $('<div>');
    $el.appendTo($('body'));
	var loopLength = 0;
    for (var i = envs.length - 1; i >= 0; i--) {
        var env = envs[i];
        $el.addClass('hidden-'+env);
        if ($el.is(':hidden')) {
            $el.remove();
            loopLength++;
            if(env=="xs"){
            	deviceType = "phone";
            }else{
            	deviceType = "tablet";
            }
            if(loopLength!=0){
            	break;
            }
        }
    }
    app.initiate();
}