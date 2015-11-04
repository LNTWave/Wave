function ValidateUserData()
{
	//PrintLog(1, "Reg: Reg key pressed, validating user data.");

                            
    if( document.inputUser.fName.value == "" )
    {
        //ShowAlertPopUpMsg( szUserValidation, "First Name" );
    	errorHandler.addErrorClass("fName", "errFn");
    }
    else if( document.inputUser.lName.value == "" )
    {
        //ShowAlertPopUpMsg( szUserValidation, "Last Name" );
    	errorHandler.addErrorClass("lName", "errLn");
    }
    else if( document.inputUser.addr1.value == "" )
    {
        //ShowAlertPopUpMsg(szUserValidation,  "Address Line 1" );
    	errorHandler.addErrorClass("addr1", "errAddr");
    }
    else if( document.inputUser.city.value == "" )
    {
        //ShowAlertPopUpMsg(szUserValidation,  "City" );
    	errorHandler.addErrorClass("city", "errCity");
    }
    else if( document.inputUser.state.value == "" )
    {
        //ShowAlertPopUpMsg(szUserValidation,  "State/Province/Region" );
    	errorHandler.addErrorClass("state", "errState");
    }
    else if( document.inputUser.zip.value == "" )
    {
        //ShowAlertPopUpMsg(szUserValidation,  "ZIP/Postal Code" );
    	errorHandler.addErrorClass("zip", "errZip");
    }
    else if( document.inputUser.country.value == "" )
    {
        //howAlertPopUpMsg(szUserValidation,  "Country" );
    	errorHandler.addErrorClass("country", "errCtry");
    }
    else if( document.inputUser.phone.value == "" )
    {
        //ShowAlertPopUpMsg(szUserValidation,  "Phone" );
    	errorHandler.addErrorClass("phone", "errPN");
    }
    else
    {  
        // Save the good data...
        /*SaveRegFormData();
    
        ProcessRegistration(
                szRegFirstName,
                szRegLastName,
                szRegAddr1,
                szRegAddr2,
                szRegCity,
                szRegState,
                szRegZip,
                szRegCountry,
                szRegPhone );*/
    }

    return false;
}

var errorHandler = {
		addErrorClass: function(elmId, errId){
	    	var regFormElements = ["fName","lName","addr1","city","state","zip","country","phone"];
	    	var regFormErr = ["errFn","errLn","errAddr","errCity","errState","errZip","errCtry","errPN"];
	    	for(var i=0; i<regFormElements.length; i++){
	    		document.getElementById(regFormElements[i]).className = "form-control";
	    		document.getElementById(regFormErr[i]).style.display = "none";
	    	}
	    	document.getElementById(elmId).className = "form-control regErrorBorder";
	    	document.getElementById(errId).style.display = "block";
	    }
};

document.getElementById("regButton").addEventListener("click",ValidateUserData,false);