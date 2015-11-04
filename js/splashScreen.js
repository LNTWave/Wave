var splashScreen = {
	initiate: function(){
		window.localStorage.setItem("deviceType", deviceType);
		if(deviceType == "phone"){
			window.plugins.orientationchanger.lockOrientation('portrait');
		}
		mainContainer = document.getElementById("mainContainer");
		deviceHeight = document.documentElement.clientHeight;
		deviceWidth = document.documentElement.clientWidth;
		var logoContainer = document.createElement("div");
		logoContainer.id= "logoContainer";
		logoContainer.align = "center";
		logoContainer.className = "w100 vh100";
		mainContainer.appendChild(logoContainer);
		if(window.localStorage.getItem("deviceType")=="phone"){
	    	mainContainer.style.height = deviceHeight+"px";
			mainContainer.style.width = deviceWidth+"px";
	    }
		setTimeout(function(){ window.location = "advanced.html"; }, 2000);
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
    splashScreen.initiate();
}