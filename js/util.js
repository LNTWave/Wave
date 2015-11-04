var util = {
    showErrorPopup: function(errorType){
    	this.createBlackOverlay();
    	this.createCommonPopup();
    	error.modifyErrorPopup(errorType);
    },
    
    createBlackOverlay: function(){
    	var blackOverlay = document.createElement("div");
    	blackOverlay.id = "blackOverlay";
    	mainContainer.appendChild(blackOverlay);	
    },
    
    createCommonPopup: function(){
    	var popupContainer = document.createElement("div");
    	popupContainer.id = "commonPopup";
    	popupContainer.className = "commonPopup";
    	mainContainer.appendChild(popupContainer);
    	var popElem = document.getElementById("commonPopup");
    	this.createAppendElem("div", "popupHeader", "", popElem);
    	this.createAppendElem("div", "popupBody", "", popElem);
    	this.createAppendElem("div", "popupFooter", "", popElem);
    	//this.alignElementCenter(popElem);
    },
    
    modifyErrorPopup : function(){
    	
    },
    
    alignElementCenter : function(uiElem){
    	var elemHeight = uiElem.clientHeight;
    	var elemWidth = uiElem.clientWidth;
    	var remHeight = parseInt((deviceHeight - elemHeight)/2);
    	var remWidth = parseInt((deviceWidth - elemWidth)/2);
    	uiElem.style.marginTop = remHeight + "px";
    	uiElem.style.marginLeft = remWidth + "px";
    },
    
    createAppendElem : function(elemType, elemId, elemClass, appendTo){
    	var newElem = document.createElement(elemType);
    	if(elemId!=""){	newElem.id = elemId;}
    	if(elemClass!=""){ newElem.className = elemClass;}
    	appendTo.appendChild(newElem);
    	return document.getElementById(elemId);
    }
};