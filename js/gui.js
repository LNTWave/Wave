//=================================================================================================
//
//  File: gui.js
//
//  Description:  This file contains all functionality for user input and output.
//
//=================================================================================================

//
// The following variables are for internal GUI use and should not be written outside of GUI processing.
//
var displayLoopTimer            = null;
var lastGuiCurrentMode          = null;
var lastGuiButtonSwDisabled     = null;
var lastGuiButtonTkDisabled     = null;
var lastGuiButtonRegDisabled    = null;
var lastGuiIconRegDisabled      = null;
var lastGuiIconUniiDisabled     = null;
var lastGuiIconSbIfDisabled     = null;
var lastGuiButtonStDisplay      = false;


var szSwButtonImg               = "<img src='img/button_SwUpdate.png' />";
var szTkButtonImg               = "<img src='img/button_TechMode.png' />";
var szRegButtonImg              = "<img src='img/button_Register.png' />";

var szSbIfIconOn                = "<img src='img/southboundif_on.png' />";
var szSbIfIconOff               = "<img src='img/southboundif_off.png' />";
var szRegIconReg                = "<img src='img/reg_yes.png' />";
var szRegIconNotReg             = "<img src='img/reg_no.png' />";                       // With bar
var szUniiIconUp                = "<img src='img/unii_yes.png' />";
var szUniiIconDown              = "<img src='img/unii_no.png' />";
var szMyStatusLine              = "<p id='status_line_id' class='status_line'></p>";
var szSbIfIconButton            = "<button type='button' id='sb_icon_id'   class='bt_icon'   onclick=handleBtInfo()>";
var szRegIconButton             = "<button type='button' id='reg_icon_id'  class='reg_icon'  onclick=handleRegInfo()>";
var szUniiIconButton            = "<button type='button' id='unii_icon_id' class='unii_icon' onclick=handleUniiInfo()>";


// Registeration variables.....................................................................................
var szRegFirstName              = "";
var szRegLastName               = "";
var szRegAddr1                  = "";
var szRegAddr2                  = "";
var szRegCity                   = "";
var szRegState                  = "";
var szRegZip                    = "";
var szRegCountry                = "";
var szRegPhone                  = "";
var szUserValidation            = "Mandatory Input: Please enter";
var bProgBarDisplayed           = false;



// Global functions called from code...........................................................................

// StartGuiInterface............................................................................................
function StartGuiInterface()
{
    PrintLog(1, "StartGuiInterface()" );
    
    InitGuiData();
    

    // Start a timer to process user input and output
    displayLoopTimer = setInterval( DisplayLoop, 500);
    
    // Call one time directly to throw up the main page...
    DisplayLoop();

}




// ShowConfirmPopUpMsg....................................................................................
function ShowConfirmPopUpMsg( msg, handler, title, buttonList )
{
    decisionPopUpObj.post( msg, handler, title, buttonList );
}


// ShowWaitPopUpMsg....................................................................................
function ShowWaitPopUpMsg( title, msg )
{
    waitPopUpObj.post( title, msg );
}    
    
// StopWaitPopUpMsg....................................................................................
function StopWaitPopUpMsg()
{
    waitPopUpObj.stop();
}    


// ShowAlertPopUpMsg....................................................................................
function ShowAlertPopUpMsg( title, msg )
{
    alertPopUpObj.post( title, msg );
}    



// UpdateStatusLine....................................................................................
function UpdateStatusLine(statusText)
{
    statusObj.post(statusText);
}







/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//  Internal functions called from GUI code
//
//

// DisplayLoop............................................................................................
function DisplayLoop()
{
	if( guiCurrentMode == PROG_MODE_MAIN )
    {
        ProcessMainView();
		//ProcessTechView();
    }
    else if( guiCurrentMode == PROG_MODE_REGISTRATION )
    {
        ProcessRegistrationView();
    }
    else if( guiCurrentMode == PROG_MODE_TECH )
    {
        ProcessTechView();
    }
    else if( guiCurrentMode == PROG_MODE_SETTINGS )
    {
        ProcessSettingsView();
    }
    else if( guiCurrentMode == PROG_MODE_DOWNLOAD )
    {
        ProcessDownloadView();
    }
    
    
    
    
    // Handle common stuff here such as the ICONs
    if( document.getElementById("unii_icon_id") )
    {
        if( lastGuiIconUniiDisabled != guiIconUniiDisabled )
        {
            document.getElementById("unii_icon_id").disabled = lastGuiIconUniiDisabled = guiIconUniiDisabled;
        }    
        
        if( document.getElementById("unii_icon_id").innerHTML != guiIconUniiHtml )
        {
            document.getElementById("unii_icon_id").innerHTML = guiIconUniiHtml;
        }
    }


    if( document.getElementById("reg_icon_id") )
    {
        if( lastGuiIconRegDisabled != guiIconRegDisabled )
        {
            document.getElementById("reg_icon_id").disabled  = lastGuiIconRegDisabled = guiIconRegDisabled;
        }    
        
        if( document.getElementById("reg_icon_id").innerHTML != guiIconRegHtml )
        {
            document.getElementById("reg_icon_id").innerHTML = guiIconRegHtml;
        }
    }



    if( document.getElementById("sb_icon_id") )
    {
        if( lastGuiIconSbIfDisabled != guiIconSbIfDisabled )
        {
            document.getElementById("sb_icon_id").disabled  = lastGuiIconSbIfDisabled = guiIconSbIfDisabled;
        }    
        
        if( document.getElementById("sb_icon_id").innerHTML != guiIconSbIfHtml )
        {
            document.getElementById("sb_icon_id").innerHTML = guiIconSbIfHtml;
        }
    }
}







// ProcessMainView............................................................................................
function ProcessMainView()
{
    if( lastGuiCurrentMode != guiCurrentMode )
    {
    	mainContainer = document.getElementById("mainContainer");
    	if(window.localStorage.getItem("deviceType")=="phone"){
	    	mainContainer.style.height = deviceHeight+"px";
			mainContainer.style.width = deviceWidth+"px";
	    }
    	var mainViewContent = null;
    	mainContainer.classList.add("connectionBG");
    	
        /*PrintLog(1, "GUI: ProcessMainView()");
        // Draw the view...
        var myUniiIcon = (bUniiStatusKnown && bUniiUp) ? szUniiIconButton + szUniiIconUp + "</button>" : szUniiIconButton + szUniiIconDown + "</button>";
        var mySbIfIcon = isSouthBoundIfCnx ? szSbIfIconButton + szSbIfIconOn + "</button>" : szSbIfIconButton + szSbIfIconOff + "</button>";
        var myRegIcon  = (nxtyRxRegLockStatus == 0x00) ? szRegIconButton + "</button>" : isRegistered ? szRegIconButton + szRegIconReg + "</button>" : szRegIconButton + szRegIconNotReg + "</button>";
        
        var myHtml = 
            "<img src='img/header_main.png' width='100%' />" +
            
            myUniiIcon +
            mySbIfIcon +
            myRegIcon +
            "<button id='sw_button_id'  type='button' class='mybutton' onclick='RequestModeChange(PROG_MODE_DOWNLOAD)'></button>" +
            "<button id='tk_button_id'  type='button' class='mybutton' onclick='RequestModeChange(PROG_MODE_TECH)'></button>" +
            "<div id='st_button_div_id'></div>" +
            "<button id='reg_button_id' type='button' class='mybutton' onclick='RequestModeChange(PROG_MODE_REGISTRATION)'></button>" +
            
            
            szMyStatusLine;
            

        $('body').html(myHtml); 
        
        
        // Make the ICONs change when touched...  
        document.getElementById("sb_icon_id").addEventListener('touchstart', HandleButtonUp );      // up, adds transparency
        document.getElementById("sb_icon_id").addEventListener('touchend',   HandleButtonDown );    // down, back to normal, no transparency
        document.getElementById("reg_icon_id").addEventListener('touchstart', HandleButtonUp );     // up, adds transparency
        document.getElementById("reg_icon_id").addEventListener('touchend',   HandleButtonDown );   // down, back to normal, no transparency
        document.getElementById("unii_icon_id").addEventListener('touchstart', HandleButtonUp );      // up, adds transparency
        document.getElementById("unii_icon_id").addEventListener('touchend',   HandleButtonDown );    // down, back to normal, no transparency
        
          
        document.getElementById("sw_button_id").addEventListener('touchstart', HandleButtonDown );
        document.getElementById("sw_button_id").addEventListener('touchend',   HandleButtonUp );
        
        document.getElementById("tk_button_id").addEventListener('touchstart', HandleButtonDown );
        document.getElementById("tk_button_id").addEventListener('touchend',   HandleButtonUp );
        
        document.getElementById("reg_button_id").addEventListener('touchstart', HandleButtonDown );
        document.getElementById("reg_button_id").addEventListener('touchend',   HandleButtonUp );

        // Start with the buttons disabled...
        document.getElementById("sw_button_id").disabled  = lastGuiButtonSwDisabled  = guiButtonSwDisabled;
        document.getElementById("tk_button_id").disabled  = lastGuiButtonTkDisabled  = guiButtonTkDisabled;
        document.getElementById("reg_button_id").disabled = lastGuiButtonRegDisabled = guiButtonRegDisabled; 
        
        // Disable the reg icon just in case it does not get displayed... 
        document.getElementById("reg_icon_id").disabled   = lastGuiIconRegDisabled   = guiIconRegDisabled;
        

        // Update our HTML variables with the display...
        guiIconUniiHtml = document.getElementById("unii_icon_id").innerHTML;
        guiIconRegHtml  = document.getElementById("reg_icon_id").innerHTML;
        guiIconSbIfHtml = document.getElementById("sb_icon_id").innerHTML;
        // Make sure the settings button gets redisplayed if coming from a different view.
        lastGuiButtonStDisplay = false;
        
        
        lastGuiCurrentMode = guiCurrentMode;*/
    }

    // Update the button status...   
    if( guiMainButtonsDisabled == false )
    { 
        if( document.getElementById("sw_button_id") )
        {
            if( lastGuiButtonSwDisabled != guiButtonSwDisabled )
            {
                document.getElementById("sw_button_id").disabled = lastGuiButtonSwDisabled = guiButtonSwDisabled;
            }    
            
            if( document.getElementById("sw_button_id").innerHTML != guiButtonSwHtml )
            {
                document.getElementById("sw_button_id").innerHTML = guiButtonSwHtml;
            }
        }
    
        if( document.getElementById("tk_button_id") )
        {
            if( lastGuiButtonTkDisabled != guiButtonTkDisabled )
            {
                document.getElementById("tk_button_id").disabled = lastGuiButtonTkDisabled = guiButtonTkDisabled;
            }    
            
            if( document.getElementById("tk_button_id").innerHTML != guiButtonTkHtml )
            {
                document.getElementById("tk_button_id").innerHTML = guiButtonTkHtml;
            }
        }
    
        if( lastGuiButtonStDisplay != guiAntennaFlag )
        {
            // Add the Settings Button...had to use a div in case settins button not displayed and reg button displayed.
            document.getElementById("st_button_div_id").innerHTML = "<button id='st_button_id'  type='button' class='mybutton' onclick='RequestModeChange(PROG_MODE_SETTINGS)'><img src='img/button_Settings.png' /></button>";
            document.getElementById("st_button_id").disabled  = false;
            document.getElementById("st_button_id").addEventListener('touchstart', HandleButtonDown );
            document.getElementById("st_button_id").addEventListener('touchend',   HandleButtonUp );
            
            lastGuiButtonStDisplay = guiAntennaFlag;
        }
     
        if( document.getElementById("reg_button_id") )
        {
            if( lastGuiButtonRegDisabled != guiButtonRegDisabled )
            {
                document.getElementById("reg_button_id").disabled = lastGuiButtonRegDisabled = guiButtonRegDisabled;
            }    
            
            if( document.getElementById("reg_button_id").innerHTML != guiButtonRegHtml )
            {
                document.getElementById("reg_button_id").innerHTML = guiButtonRegHtml;
            }
        }
    }
}
// End of Main processing...........................................................................................








// ProcessRegistrationView............................................................................................
function ProcessRegistrationView()
{
    if( lastGuiCurrentMode != guiCurrentMode )
    {
        PrintLog(1, "ProcessRegistrationView()");

        // Draw the view...
        /*var myUniiIcon = (bUniiStatusKnown && bUniiUp) ? szUniiIconButton + szUniiIconUp + "</button>" : szUniiIconButton + szUniiIconDown + "</button>";
        var mySbIfIcon = isSouthBoundIfCnx ? szSbIfIconButton + szSbIfIconOn + "</button>" : szSbIfIconButton + szSbIfIconOff + "</button>";
        var myRegIcon  = (nxtyRxRegLockStatus == 0x00) ? szRegIconButton + "</button>" : isRegistered ? szRegIconButton + szRegIconReg + "</button>" : szRegIconButton + szRegIconNotReg + "</button>";
                
        var myHtml = 
            "<img src='img/header_reg.png' style='position: fixed; top: 0px; width: 100%;'  />" +
            "<button id='back_button_id' type='button' class='back_icon' onclick='RequestModeChange(PROG_MODE_MAIN)'><img src='img/go_back.png'/></button>"+
            myRegIcon +
            mySbIfIcon +
            myUniiIcon +
            
            "<div style='height:120%; margin-top:17%; width:100%'>" +         // Vertical scroll div...
                "<div class='userInputContainer'>" +
                "<form name='inputUser' >" +
                "<fieldset>" +
                "<label>*First Name: </label><input type='text' name='fName' value=''>" +
                "<label>*Last Name: </label><input type='text' name='lName' value=''>" +
                "<label>*Address line 1: </label><input type='text' name='addr1' value=''>" +
                "<label>Address line 2: </label><input type='text' name='addr2' value=''>" +
                "<label>*City: </label><input type='text' name='city' value=''>" +
                "<label>*State/Prov/Reg: </label><input type='text' name='state' value=''>" +
                "<label>*ZIP/Postal Code: </label><input type='text' name='zip' value=''>" +
                "<label>*Country: </label><input type='text' name='country' value=''>" +
                "<label>*Phone: </label><input type='text' name='phone' value=''>" +
    
                "<label>(* mandatory)  </label><input style='position: relative; bottom: 0px;  width: 35%; font-size: 20px;' type='button' value='Register' onclick='JavaScript:return ValidateUserData();'></fieldset></form></div>" +
                "<br><p id='p_id'></p>" +
            "</div>" +
                   

            szMyStatusLine;*/
        document.getElementById("mainContainer").className = "";
        var myHtml = "<div id='appHeaderDashboard' class='page-header'><div id='headerContainer'><div class='col-xs-2 col-sm-1' align='left'></div><div class='col-xs-8 col-sm-10' align='center'><img src='img/assets/logos/WaveLogoSMWhite.svg'/></div><div class='col-xs-2 col-sm-1 headerIcon' align='center'><img src='img/assets/icons/HelpOutline.svg'/></div></div></div><div id='registrationFormContainer' class='container'><div class='pageTitleContainer'>Please register your device</div><div class='registerFaq'>Why do I need to register?</div><form role='form' name='inputUser'><div class='col-sm-12'><div class='col-sm-6'><div class='form-group'><label for='text'>First name</label><input type='text' class='form-control' name='fName' id='fName'></div><div class='errorContainer' id='errFn'>Please enter your First name</div></div><div class='col-sm-6'><div class='form-group'><label for='text'>Last name</label><input type='text' class='form-control' name='lName' id='lName'></div><div class='errorContainer' id='errLn'>Please enter your Last name</div></div></div><div class='col-sm-12'><div class='col-sm-6'><div class='form-group'><label for='text'>Address line 1</label><input type='text' class='form-control' name='addr1' id='addr1'></div><div class='errorContainer' id='errAddr'>Please enter Address Line 1</div></div><div class='col-sm-6'><div class='form-group'><label for='text'>Address line 2</label><input type='text' class='form-control' name='addr2' id='addr2'></div></div></div><div class='col-sm-12'><div class='col-sm-6'><div class='form-group'><label for='text'>City </label><input type='text' class='form-control' name='city' id='city'></div><div class='errorContainer' id='errCity'>Please enter your City</div></div><div class='col-sm-6'><div class='form-group'><label for='text'>State/Province/Region</label><input type='text' class='form-control' name='state' id='state'></div><div class='errorContainer' id='errState'>Please enter your State/Province/Region</div></div></div><div class='col-sm-12'><div class='col-sm-6'><div class='form-group'><label for='text'>ZIP/Postal Code</label><input type='text' class='form-control' name='zip' id='zip'></div><div class='errorContainer' id='errZip'>Please enter your ZIP/Postal Code</div></div><div class='col-sm-6'><div class='form-group'><label for='text'>Country</label><select class='form-control' name='country' id='country'><option value='USA'>United States</option><option value='CAN'>Canada</option></select></div><div class='errorContainer' id='errCtry'>Please select your Country</div></div></div><div class='col-sm-12'><div class='col-sm-6'><div class='form-group'><label for='text'>Phone Number</label><input type='text' class='form-control' name='phone' id='phone'></div><div class='errorContainer' id='errPN'>Please enter your Phone Number</div></div><div class='col-sm-6'></div></div><div class='col-sm-12 regBtnContainer'><div class='col-sm-6'></div><div class='col-sm-6'><div class='form-group buttonContainer' align='right'><input type='button' value='Skip' class='defaultButton skipButton' ><button type='button' class='defaultButton' id='regButton' onclick='javascript:return ValidateUserData();'>Register</button></div></div></div></form></div>";
        $('#mainContainer').html(myHtml);  
        
        // Fill in any defaults...
        document.inputUser.fName.value   = szRegFirstName;
        document.inputUser.lName.value   = szRegLastName;
        document.inputUser.addr1.value   = szRegAddr1;
        document.inputUser.addr2.value   = szRegAddr2;
        document.inputUser.city.value    = szRegCity;
        document.inputUser.state.value   = szRegState;
        document.inputUser.zip.value     = szRegZip;
        document.inputUser.country.value = szRegCountry;
        document.inputUser.phone.value   = szRegPhone;        
                
        /*UpdateStatusLine("Select 'Register' button to continue");
        
        document.getElementById("sb_icon_id").addEventListener('touchstart', HandleButtonUp );      // up, adds transparency
        document.getElementById("sb_icon_id").addEventListener('touchend',   HandleButtonDown );    // down, back to normal, no transparency
        document.getElementById("reg_icon_id").addEventListener('touchstart', HandleButtonUp );     // up, adds transparency
        document.getElementById("reg_icon_id").addEventListener('touchend',   HandleButtonDown );   // down, back to normal, no transparency
        document.getElementById("unii_icon_id").addEventListener('touchstart', HandleButtonUp );      // up, adds transparency
        document.getElementById("unii_icon_id").addEventListener('touchend',   HandleButtonDown );    // down, back to normal, no transparency
                 
        document.getElementById("back_button_id").addEventListener('touchstart', HandleButtonDown );
        document.getElementById("back_button_id").addEventListener('touchend',   HandleButtonUp );
        
        
        bProgBarDisplayed = false;*/
       
        lastGuiCurrentMode = guiCurrentMode;    
    }
    
    
    if( guiRegistrationPercent >= 0 )
    {    
        // Unit is still in cell search...
        if( bProgBarDisplayed == false )
        {
            StopWaitPopUpMsg();
            UpdateStatusLine("Please wait for cell search to complete...");
            ShowAlertPopUpMsg("Please wait...", "Cell search must complete before registration can proceed." );
        
            // Display the progress bar.
            document.getElementById("p_id").innerHTML = "<div class='html5-progress-bar'>" +
                                                            "<div class='progress-bar-wrapper'>"        +
                                                            "Network Search Progress...<br><progress id='pbar_id' value='0' max='100'></progress>" +
                                                                "<span id='pbarper_id' class='progress-value'>0%</span>" +
                                                            "</div></div>";      
            bProgBarDisplayed = true;
        }
        
        document.getElementById('pbar_id').value = guiRegistrationPercent;
        $('.progress-value').html(guiRegistrationPercent + '%');
    }
    else
    {
        if( bProgBarDisplayed == true )
        {
            // Remove progress bar...
            document.getElementById("p_id").innerHTML = ""; 
            bProgBarDisplayed = false;
        }
    }
}


function SaveRegFormData()
{
    szRegFirstName  = document.inputUser.fName.value;
    szRegLastName   = document.inputUser.lName.value;
    szRegAddr1      = document.inputUser.addr1.value;
    szRegAddr2      = document.inputUser.addr2.value;
    szRegCity       = document.inputUser.city.value;
    szRegState      = document.inputUser.state.value;
    szRegZip        = document.inputUser.zip.value;
    szRegCountry    = document.inputUser.country.value;
    szRegPhone      = document.inputUser.phone.value;
}

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
        SaveRegFormData();
    
        ProcessRegistration(
                szRegFirstName,
                szRegLastName,
                szRegAddr1,
                szRegAddr2,
                szRegCity,
                szRegState,
                szRegZip,
                szRegCountry,
                szRegPhone );
    }

    return false;
}
// End of Registration processing...........................................................................................







// ProcessTechView............................................................................................
const MIN_TECH_MODE_DISPLAY_PAGE    = 1;
const MAX_TECH_MODE_DISPLAY_PAGE    = 17;
const MAX_THREE_COL_ROWS            = 12;
const MAX_FOUR_COL_ROWS             = 6;
const UNII_CHANNEL                  = 4;
var techModePageCurrent             = 0;
var techModePageLast                = 0;

var ThreeColTable = 
    "<tr> <th id='myH1' colspan='3'></th> </tr>" +
    "<tr> <th>Description</th>  <th>Value</th> <th>Units</th> </tr>" +
    "<tr> <td id='d0'>-</td>  <td id='v0'></td>  <td id='u0'></td></tr>" +
    "<tr> <td id='d1'>-</td>  <td id='v1'></td>  <td id='u1'></td></tr>" +
    "<tr> <td id='d2'>-</td>  <td id='v2'></td>  <td id='u2'></td></tr>" +
    "<tr> <td id='d3'>-</td>  <td id='v3'></td>  <td id='u3'></td></tr>" +
    "<tr> <td id='d4'>-</td>  <td id='v4'></td>  <td id='u4'></td></tr>" +
    "<tr> <td id='d5'>-</td>  <td id='v5'></td>  <td id='u5'></td></tr>" +
    "<tr> <td id='d6'>-</td>  <td id='v6'></td>  <td id='u6'></td></tr>" +
    "<tr> <td id='d7'>-</td>  <td id='v7'></td>  <td id='u7'></td></tr>" +
    "<tr> <td id='d8'>-</td>  <td id='v8'></td>  <td id='u8'></td></tr>" +
    "<tr> <td id='d9'>-</td>  <td id='v9'></td>  <td id='u9'></td></tr>" +
    "<tr> <td id='d10'>-</td> <td id='v10'></td> <td id='u10'></td></tr>" +    
    "<tr> <td id='d11'>-</td> <td id='v11'></td> <td id='u11'></td></tr>";
                            
                            
var FourColTable = 
    "<tr> <th id='myH1' colspan='4'></th> </tr>" +
    "<tr> <th id='a0'>-</th>  <th id='a1'></th>  <th id='a2'></th>  <th id='a3'></th></tr>" +
    "<tr> <td id='b0'>-</td>  <td id='b1'></td>  <td id='b2'></td>  <td id='b3'></td></tr>" +
    "<tr> <td id='c0'>-</td>  <td id='c1'></td>  <td id='c2'></td>  <td id='c3'></td></tr>" +
    "<tr> <td id='d0'>-</td>  <td id='d1'></td>  <td id='d2'></td>  <td id='d3'></td></tr>" +
    "<tr> <td id='e0'>-</td>  <td id='e1'></td>  <td id='e2'></td>  <td id='e3'></td></tr>" +
    "<tr> <td id='f0'>-</td>  <td id='f1'></td>  <td id='f2'></td>  <td id='f3'></td></tr>";

var radioArray = ["A", "B", "C", "D"];

// The following text will be used for labels and search fields...
var CellInfoLabels   = ["Bandwidth", "DL Center Freq", "UL Center Freq", "DL RSSI", "UL RSSI", "Max DL RSCP", "Max DL ECIO", "Remote Shutdown", "Narrow Filter In Use", "Ext Ant In Use"];
var SysInfoLabels    = ["UL Safe Mode Gain", "CU Antenna", "DL System Gain", "UL System Gain", "Relaying", "DL Echo Gain", "UL Echo Gain", "NU Temp", "CU Temp", "DL Tx Power", "UL Tx Power"];   
var UniiLabels       = ["CU 5 GHz DL Freq", "CU 5 GHz UL Freq", "CU UNII Modem State", "NU RSSI", "CU RSSI", "NU Tx Pwr", "CU Tx Pwr", "CU Ctrl Chan BER", "CU Dist Metric", "NU Dist Metric", "CU Build ID"];   
var CellDetailLabels = ["ID", "DL Freq", "RSCP", "ECIO"];   
var LteDetailLabels  = ["Lte ID", "Lte Freq", "RSRP", "RSRQ", "SINR", "Lte Ant", "Freq Err Res", "Freq Err Tot", "MP Early", "CFI BER", "HARQ Comb", "SIB 1 Cnt"];   


function ProcessTechView()
{
    if( lastGuiCurrentMode != guiCurrentMode )
    {
        PrintLog(1, "GUI: ProcessTechView()");

        // Draw the view...
        var myUniiIcon = (bUniiStatusKnown && bUniiUp) ? szUniiIconButton + szUniiIconUp + "</button>" : szUniiIconButton + szUniiIconDown + "</button>";
        var mySbIfIcon = isSouthBoundIfCnx ? szSbIfIconButton + szSbIfIconOn + "</button>" : szSbIfIconButton + szSbIfIconOff + "</button>";
        var myRegIcon  = (nxtyRxRegLockStatus == 0x00) ? szRegIconButton + "</button>" : isRegistered ? szRegIconButton + szRegIconReg + "</button>" : szRegIconButton + szRegIconNotReg + "</button>";
        
        var myHtml = 
            "<img src='img/header_tech.png' width='100%' />" +
            "<button id='back_arrow_id' type='button' class='back_icon' onclick='RequestModeChange(PROG_MODE_MAIN)'><img src='img/go_back.png'/></button>"+
            myRegIcon +
            mySbIfIcon +
            myUniiIcon +

//            "<br><br><br><h1 id=myH1>Heading</h1><br><br>" +
            "<br><br>" +
            "<table id='tech_table' align='center'>" +
            ThreeColTable +
            "</table>" +
            "<button id='left_arrow_id'  type='button' class='myLeftArrow' onclick='techModeHandleLeftKey()'><img src='img/arrow_left.png' /></button>" +
            "<button id='right_arrow_id' type='button' class='myRightArrow' onclick='techModeHandleRightKey()'><img src='img/arrow_right.png' /></button>";
            
        $('body').html(myHtml);

        document.getElementById("sb_icon_id").addEventListener('touchstart', HandleButtonUp );      // up, adds transparency
        document.getElementById("sb_icon_id").addEventListener('touchend',   HandleButtonDown );    // down, back to normal, no transparency
        document.getElementById("reg_icon_id").addEventListener('touchstart', HandleButtonUp );     // up, adds transparency
        document.getElementById("reg_icon_id").addEventListener('touchend',   HandleButtonDown );   // down, back to normal, no transparency
        document.getElementById("unii_icon_id").addEventListener('touchstart', HandleButtonUp );      // up, adds transparency
        document.getElementById("unii_icon_id").addEventListener('touchend',   HandleButtonDown );    // down, back to normal, no transparency
        
       
        document.getElementById("back_arrow_id").addEventListener('touchstart', HandleButtonDown );
        document.getElementById("back_arrow_id").addEventListener('touchend',   HandleButtonUp );
        document.getElementById("left_arrow_id").addEventListener('touchstart', HandleButtonDown );
        document.getElementById("left_arrow_id").addEventListener('touchend',   HandleButtonUp );
        document.getElementById("right_arrow_id").addEventListener('touchstart', HandleButtonDown );
        document.getElementById("right_arrow_id").addEventListener('touchend',   HandleButtonUp );
        
        // Update our HTML variables with the display...
        guiIconUniiHtml = document.getElementById("unii_icon_id").innerHTML;
        guiIconRegHtml  = document.getElementById("reg_icon_id").innerHTML;
        guiIconSbIfHtml = document.getElementById("sb_icon_id").innerHTML;
        
        lastGuiCurrentMode  = guiCurrentMode;    
        techModePageCurrent = 0;
        techModePageLast    = 0;

        
        if( guiGotTechModeValues == false )
        {
            // Start the spinner..
            ShowWaitPopUpMsg( "Please wait", "Gathering data..." );
        }
        
    }
    
    // Now populate the current page...
    PopulateTechData();
}




// Handle the left arrow key (set page from 1 to 17)
function techModeHandleLeftKey()
{
    var i;
    var ch;
    var tempPage    = techModePageCurrent;
    var bValid      = false;
    
    for( i = 0; i < MAX_TECH_MODE_DISPLAY_PAGE; i++ )
    {
        switch( tempPage )
        {
            case 0:
            case 1:  tempPage = 17;   ch = 3;     break;  
            case 2:  tempPage = 1;    ch = 0;     break;  
            case 3:  tempPage = 2;    ch = 1;     break;  
            case 4:  tempPage = 3;    ch = 2;     break;  
            case 5:  tempPage = 4;    ch = 3;     break;  
            case 6:  tempPage = 5;    ch = 0;     break;  
            case 7:  tempPage = 6;    ch = 1;     break;  
            case 8:  tempPage = 7;    ch = 2;     break;  
            case 9:  tempPage = 8;    ch = 3;     break;  
            case 10: tempPage = 9;    ch = 0;     break;  
            case 11: tempPage = 14;   ch = 0;     break;  
            case 12: tempPage = 15;   ch = 1;     break;  
            case 13: tempPage = 16;   ch = 2;     break;  
            case 14: tempPage = 10;   ch = 0;     break;  
            case 15: tempPage = 11;   ch = 1;     break;  
            case 16: tempPage = 12;   ch = 2;     break;  
            case 17: tempPage = 13;   ch = 3;     break;  
        } 
    
    
        if( tempPage == 9 )
        {
            bValid = true;  // UNII page is always valid
        }
        else
        {
            if( GetTechValue( "Band", ch ) > 0 )
            {
                if( (tempPage >= 14) && (tempPage <= 17) )
                {
                    // Check LTE detail page...
                    if( GetTechValue( "LTE?", ch ) == 1 )
                    {
                        bValid = true;
                    }
                    
                }
                else
                {
                    bValid = true;      // Valid band, non LTE detail page
                }
            }     
        }  
    
        if( bValid == true )
        {
            techModePageCurrent = tempPage;
            break;
        }
    }

}


// Handle the right arrow key (set page from 1 to 17)
function techModeHandleRightKey()
{
    var i;
    var ch;
    var tempPage    = techModePageCurrent;
    var bValid      = false;
    
    for( i = 0; i < MAX_TECH_MODE_DISPLAY_PAGE; i++ )
    {
        switch( tempPage )
        {
            case 0:  tempPage = 1;    ch = 0;     break;        // Starting page....
            case 1:  tempPage = 2;    ch = 1;     break;  
            case 2:  tempPage = 3;    ch = 2;     break;  
            case 3:  tempPage = 4;    ch = 3;     break;  
            case 4:  tempPage = 5;    ch = 0;     break;  
            case 5:  tempPage = 6;    ch = 1;     break;  
            case 6:  tempPage = 7;    ch = 2;     break;  
            case 7:  tempPage = 8;    ch = 3;     break;  
            case 8:  tempPage = 9;    ch = 0;     break;  
            case 9:  tempPage = 10;   ch = 0;     break;  
            case 10: tempPage = 14;   ch = 0;     break;  
            case 11: tempPage = 15;   ch = 1;     break;  
            case 12: tempPage = 16;   ch = 2;     break;  
            case 13: tempPage = 17;   ch = 3;     break;  
            case 14: tempPage = 11;   ch = 1;     break;  
            case 15: tempPage = 12;   ch = 2;     break;  
            case 16: tempPage = 13;   ch = 3;     break;  
            case 17: tempPage = 1;    ch = 0;     break;  
        } 
    
    
        if( tempPage == 9 )
        {
            bValid = true;  // UNII page is always valid
        }
        else
        {
            if( GetTechValue( "Band", ch ) > 0 )
            {
                if( (tempPage >= 14) && (tempPage <= 17) )
                {
                    // Check LTE detail page...
                    if( GetTechValue( "LTE?", ch ) == 1 )
                    {
                        bValid = true;
                    }
                    
                }
                else
                {
                    bValid = true;      // Valid band, non LTE detail page
                }
            }     
        }  
    
        if( bValid == true )
        {
            techModePageCurrent = tempPage;
            break;
        }
    }
    
    
}





function PopulateTechData() 
{
    var i;
    var channel;
    var idTxt;
    var outText   = "Tech: Process Page Rsp...";
    var myHead;
    var tempLabel;
    var tempVal;
    var bLteChannel;

    // Do not populate anything until we at least have labels which takes about 5 seconds...
    if( guiGotTechModeValues == false )
    {
        return;
    }
    
    // Check to see if a valid page has been found yet...
    if( techModePageCurrent == 0 )
    {
        techModeHandleRightKey();
    }

    switch( techModePageCurrent )
    {
        // Cell Info pages....
        case 1:
        case 2:
        case 3:
        case 4:
        {
            channel = techModePageCurrent - 1;
            
            if( techModePageCurrent != techModePageLast )
            {
                StopWaitPopUpMsg();
            
                // See if the last page required 4 columns.
                if( (techModePageLast >= 10) && (techModePageLast <= 13) )
                {
                    document.getElementById("tech_table").innerHTML = ThreeColTable;
                }  
               

                bLteChannel = (GetTechValue( "LTE?", channel ) == 1)?true:false; 
                
                myHead = "Cell Info: Rd " + radioArray[GetTechValue( "Radio", channel )] + " Bd " + GetTechValue( "Band", channel );
                 
                if( bLteChannel == true )
                {
                    myHead += " LTE";
                }
                else
                {
                    myHead += " WCDMA";
                } 
                
                // Update the heading........
                document.getElementById("myH1").innerHTML = myHead;
                   
                for( i = 0; i < MAX_THREE_COL_ROWS; i++ )
                {
                    if( i < CellInfoLabels.length )
                    {
                        // Drop in the labels...
                        tempLabel = CellInfoLabels[i];
                        
                        // If this channel is LTE then tinker with the labels...
                        if( bLteChannel == true )
                        {
                            tempLabel = tempLabel.replace("RSCP", "RSRP");
                            tempLabel = tempLabel.replace("ECIO", "RSRQ");
                        }                            
                        
                        idTxt = "d" + i;
                        document.getElementById(idTxt).innerHTML = tempLabel;
                        
                        // Drop in the units...
                        idTxt = "u" + i;
                        document.getElementById(idTxt).innerHTML = GetTechUnits( CellInfoLabels[i] );
                    }
                    else
                    {
                        // Clear the remainder of rows...
                        idTxt = "d" + i;
                        document.getElementById(idTxt).innerHTML = "-";

                        idTxt = "v" + i;
                        document.getElementById(idTxt).innerHTML = "";

                        idTxt = "u" + i;
                        document.getElementById(idTxt).innerHTML = "";
                    }
                }

            }
            
            // Now update the values...
            for( i = 0; i < CellInfoLabels.length; i++ )
            {
                idTxt   = "v" + i;
                tempVal = GetTechValue( CellInfoLabels[i], channel );
                
                // Must tweak some of the values...
                switch(i)
                {
                    case 0: tempVal /= 1000;   break;      // Bandwidth is provided in KHz so convert to MHz.
                    case 1: tempVal /= 10;     break;      // DL Center Freq is provided in 100ths of KHz so convert to MHz.
                    case 2: tempVal /= 10;     break;
                    case 7: tempVal = (tempVal == 1)?"Enable":"Disable";    break;
                    case 8: tempVal = (tempVal == 1)?"Yes":"No";            break;
                    case 9: tempVal = (tempVal & 0x7F)?"Yes":"No";          break;      // Remove bit 7 then if any other bits set Ext Ant in use.  
                }
                document.getElementById(idTxt).innerHTML = tempVal;
            }
            break;
        }
        
        
        // System Info pages....
        case 5:
        case 6:
        case 7:
        case 8:
        {
            channel = techModePageCurrent - 5;
            
            if( techModePageCurrent != techModePageLast )
            {
            
                // See if the last page required 4 columns.
                if( (techModePageLast >= 10) && (techModePageLast <= 13) )
                {
                    document.getElementById("tech_table").innerHTML = ThreeColTable;
                }  
               

                bLteChannel = (GetTechValue( "LTE?", channel ) == 1)?true:false; 
                
                myHead = "Sys Info: Rd " + radioArray[GetTechValue( "Radio", channel )] + " Bd " + GetTechValue( "Band", channel ); 

                if( bLteChannel == true )
                {
                    myHead += " LTE";
                }
                else
                {
                    myHead += " WCDMA";
                } 
                
                // Update the heading........
                document.getElementById("myH1").innerHTML = myHead;
                   
                for( i = 0; i < MAX_THREE_COL_ROWS; i++ )
                {
                    if( i < SysInfoLabels.length )
                    {
                        // Drop in the labels...
                        tempLabel = SysInfoLabels[i];
                        
                        idTxt = "d" + i;
                        document.getElementById(idTxt).innerHTML = tempLabel;
                        
                        // Drop in the units...
                        idTxt = "u" + i;
                        document.getElementById(idTxt).innerHTML = GetTechUnits( SysInfoLabels[i] );
                    }
                    else
                    {
                        // Clear the remainder of rows...
                        idTxt = "d" + i;
                        document.getElementById(idTxt).innerHTML = "-";

                        idTxt = "v" + i;
                        document.getElementById(idTxt).innerHTML = "";

                        idTxt = "u" + i;
                        document.getElementById(idTxt).innerHTML = "";
                    }
                }

            }
            
            // Now update the values...
            for( i = 0; i < SysInfoLabels.length; i++ )
            {
                idTxt   = "v" + i;
                tempVal = GetTechValue( SysInfoLabels[i], channel );
                
               
                // Must tweak some of the values...
                switch(i)
                {
                    case 1: tempVal = "0x" + tempVal.toString(16).toUpperCase();     break;      // Display CU Antenna in hex.
                    case 4: tempVal = (tempVal == 1)?"On":"Off";       break;       // Relaying On/Off
                }
                
                document.getElementById(idTxt).innerHTML = tempVal;
            }
            break;
        }
        
        // UNII Info pages....
        case 9:
        {
            if( techModePageCurrent != techModePageLast )
            {
            
                // See if the last page required 4 columns.
                if( (techModePageLast >= 10) && (techModePageLast <= 13) )
                {
                    document.getElementById("tech_table").innerHTML = ThreeColTable;
                }  
               
                tempVal = GetTechValue( "CU SW Ver", UNII_CHANNEL );
                myHead = "UNII Overview (SW:0x" + tempVal.toString(16).toUpperCase() + ")"; 
                
                // Update the heading........
                document.getElementById("myH1").innerHTML = myHead;
                   
                for( i = 0; i < MAX_THREE_COL_ROWS; i++ )
                {
                    if( i < UniiLabels.length )
                    {
                        // Drop in the labels...
                        tempLabel = UniiLabels[i];
                        
                        idTxt = "d" + i;
                        document.getElementById(idTxt).innerHTML = tempLabel;
                        
                        // Drop in the units...
                        idTxt = "u" + i;
                        document.getElementById(idTxt).innerHTML = GetTechUnits( UniiLabels[i] );
                    }
                    else
                    {
                        // Clear the remainder of rows...
                        idTxt = "d" + i;
                        document.getElementById(idTxt).innerHTML = "-";

                        idTxt = "v" + i;
                        document.getElementById(idTxt).innerHTML = "";

                        idTxt = "u" + i;
                        document.getElementById(idTxt).innerHTML = "";
                    }
                }

            }
            
            // Now update the values...
            for( i = 0; i < UniiLabels.length; i++ )
            {
                idTxt   = "v" + i;
                tempVal = GetTechValue( UniiLabels[i], UNII_CHANNEL );
                
               
                // Must tweak some of the values...
                switch(i)
                {
                    case 0: tempVal /= 10000; break;                    // Convert to GHz.
                    case 1: tempVal /= 10000; break;                    // Convert to GHz.
                    case 2: tempVal = (tempVal == 1)?"Up":"Down";  break;       // UNII Up/Down
                    case 10: tempVal = "0x" + tempVal.toString(16).toUpperCase();     break;      // Display Build ID in hex.
                }
                
                document.getElementById(idTxt).innerHTML = tempVal;
            }
            break;
        }




        // Cell Detail pages....
        case 10:
        case 11:
        case 12:
        case 13:
        {
            var tempId;
            
            // Cell Detail
            //  ID   DLFreqMHz  RSCP  ECIO        (WCDMA)
            //  ID   DLFreqMHz  RSRP  RSRQ        (LTE)
            //  92    739.0     -93     -8
        
            channel = techModePageCurrent - 10;
            
            if( techModePageCurrent != techModePageLast )
            {
            
                // See if the last page required 3 columns.
                if( (techModePageLast < 10) || (techModePageLast > 13) )
                {
                    document.getElementById("tech_table").innerHTML = FourColTable;
                }  
               

                bLteChannel = (GetTechValue( "LTE?", channel ) == 1)?true:false; 
                
                myHead = "Cell Detail: Rd " + radioArray[GetTechValue( "Radio", channel )] + " Bd " + GetTechValue( "Band", channel ); 

                if( bLteChannel == true )
                {
                    myHead += " LTE";
                }
                else
                {
                    myHead += " WCDMA";
                } 
                
                // Update the heading........
                document.getElementById("myH1").innerHTML = myHead;
            
                // Drop in the labels...
                for( i = 0; i < CellDetailLabels.length; i++ )
                {
                    if( i < CellDetailLabels.length )
                    {
                        tempLabel = CellDetailLabels[i];

                        // If this channel is LTE then tinker with the labels...
                        if( bLteChannel == true )
                        {
                            tempLabel = tempLabel.replace("RSCP", "RSRP");
                            tempLabel = tempLabel.replace("ECIO", "RSRQ");
                        }                            
  
                        idTxt = "a" + i;
                        document.getElementById(idTxt).innerHTML = tempLabel;
                    }
                }
            
            }
            
            // At most 5 rows with 4 columns for 20 data items total...    
            for( i = 0; i < 5; i++ )
            {
                // See if there is any data for ID0 to ID4.
                tempId = GetTechValue( CellDetailLabels[0] + i, channel );
               
                
                // Write a single row, 4 columns...
                for( j = 0; j < 4; j++ )
                {
                    switch( i )
                    {
                        // rows....
                        case 0:  idTxt = "b" + j;    break; 
                        case 1:  idTxt = "c" + j;    break; 
                        case 2:  idTxt = "d" + j;    break; 
                        case 3:  idTxt = "e" + j;    break; 
                        case 4:  idTxt = "f" + j;    break; 
                    }
                    
                    if( tempId != 0 )
                    {
                        switch(j)
                        {
                            case 0: tempVal = tempId; break;
                            case 1: tempVal = GetTechValue( CellDetailLabels[j] + " " + i, channel )/10;    break;      // DL Freq 0 to 4
                            case 2:                                                                                     // RSCP 0 to 4
                            case 3: tempVal = GetTechValue( CellDetailLabels[j] + " " + i, channel );   break;          // ECIO 0 to 4
                        }
                        document.getElementById(idTxt).innerHTML = tempVal;
//                        outText = outText + " " + myData.val[i+j];
                        
                    }
                    else
                    {
                        // Clear the remaining rows...
                        document.getElementById(idTxt).innerHTML = "-";
                    }
                }
            }

            break;
        }
        
        
        // LTE Detail pages....
        case 14:
        case 15:
        case 16:
        case 17:
        {
            var tempSinr;
            channel = techModePageCurrent - 14;
            
            if( techModePageCurrent != techModePageLast )
            {
                // See if the last page required 4 columns.
                if( (techModePageLast >= 10) && (techModePageLast <= 13) )
                {
                    document.getElementById("tech_table").innerHTML = ThreeColTable;
                }  
               

                bLteChannel = (GetTechValue( "LTE?", channel ) == 1)?true:false; 
                
                myHead = "LTE Detail: Rd " + radioArray[GetTechValue( "Radio", channel )] + " Bd " + GetTechValue( "Band", channel ); 

                if( bLteChannel == true )
                {
                    myHead += " LTE";
                }
                else
                {
                    myHead += " WCDMA";
                } 
                
                // Update the heading........
                document.getElementById("myH1").innerHTML = myHead;
                   
                for( i = 0; i < MAX_THREE_COL_ROWS; i++ )
                {
                    if( i < LteDetailLabels.length )
                    {
                        // Drop in the labels...
                        tempLabel = LteDetailLabels[i];

                        // Change some of the text on the fly.
                        tempLabel = tempLabel.replace("MP Early", "MP E/L/M");
                        tempLabel = tempLabel.replace("CFI BER", "CFI BER/DCI");
                        
                        idTxt = "d" + i;
                        document.getElementById(idTxt).innerHTML = tempLabel;
                        
                        // Drop in the units...
                        idTxt = "u" + i;
                        document.getElementById(idTxt).innerHTML = GetTechUnits( LteDetailLabels[i] );
                    }
                    else
                    {
                        // Clear the remainder of rows...
                        idTxt = "d" + i;
                        document.getElementById(idTxt).innerHTML = "-";

                        idTxt = "v" + i;
                        document.getElementById(idTxt).innerHTML = "";

                        idTxt = "u" + i;
                        document.getElementById(idTxt).innerHTML = "";
                    }
                }

            }
            
            // Now update the values...
            for( i = 0; i < LteDetailLabels.length; i++ )
            {
                idTxt   = "v" + i;
                tempVal = GetTechValue( LteDetailLabels[i], channel );
                
               
                // Must tweak some of the values...
                switch(i)
                {
                    case 1: tempVal /= 10;  break;                    // Convert to MHz.
                    case 4: 
                    {   
                        tempSinr = tempVal;
                        tempVal  = (tempSinr >> 8) + "." + Math.floor(Math.abs(100*(tempSinr%256)/256));  
                        break;                   
                    }
                    case 8: tempVal = tempVal + "/" + GetTechValue( "MP Late", channel ) + "/" + GetTechValue( "MP Margin", channel );  break;  // MP E/L/M
                    case 9: tempVal = tempVal + "/" + GetTechValue( "DCI", channel );                                                   break;  // BER/DCI
                }

                
                document.getElementById(idTxt).innerHTML = tempVal;
            }
            break;
        }
        
    }
     
    techModePageLast = techModePageCurrent;
}
// End of Tech View ............................................................................................




// ProcessSettingsView............................................................................................
function ProcessSettingsView()
{
    if( lastGuiCurrentMode != guiCurrentMode )
    {
        PrintLog(1, "GUI: ProcessSettingsView()");
        
        // Draw the view...
        var myUniiIcon      = (bUniiStatusKnown && bUniiUp) ? szUniiIconButton + szUniiIconUp + "</button>" : szUniiIconButton + szUniiIconDown + "</button>";
        var mySbIfIcon = isSouthBoundIfCnx ? szSbIfIconButton + szSbIfIconOn + "</button>" : szSbIfIconButton + szSbIfIconOff + "</button>";
        var myRegIcon  = (nxtyRxRegLockStatus == 0x00) ? szRegIconButton + "</button>" : isRegistered ? szRegIconButton + szRegIconReg + "</button>" : szRegIconButton + szRegIconNotReg + "</button>";

                
        var myHtml = 
            "<img src='img/header_settings.png' width='100%' />" +
            "<button id='back_button_id' type='button' class='back_icon' onclick='RequestModeChange(PROG_MODE_MAIN)'><img src='img/go_back.png'/></button>"+
            myRegIcon +
            mySbIfIcon +
            myUniiIcon +
            
            
            "<br><br><br><br>" +
            "<div class='settingsSelectContainer'>" +
            
            
            
            "<table id='stgTable' align='center'>" +
            "<tr> <th style='padding: 10px;' colspan='4'>Antenna Selection</th></tr>" +
            "<tr> <th></th>  <th></th> <th>Auto</th> <th>Manual</th> </tr>" +
            "<tr> <td></td>  <td style='padding: 10px;'>Control</td>  <td><input type='radio' id='ba_id' name='AutoMan' class='myRdBtn' onclick='SetAntenna(0x0020)'></td> <td><input type='radio' id='bm_id' name='AutoMan' class='myRdBtn' onclick='SetAntenna(0x2000)'></td> </tr>" +
             
            "<tr> <th></th>  <th style='padding: 10px;'>bd (MHz)</th> <th>Internal</th> <th>External</th> </tr>" +
            "<tr> <td style='padding: 10px;'>A</td> <td id='b0'>bd: </td>  <td><input type='radio' id='bi_id0' name='bdA' class='myRdBtn' onclick='SetAntenna(0x0002)'></td> <td><input type='radio' id='be_id0' name='bdA' class='myRdBtn' onclick='SetAntenna(0x0200)'></td> </tr>" +
            "<tr> <td style='padding: 10px;'>B</td> <td id='b1'>bd: </td>  <td><input type='radio' id='bi_id1' name='bdB' class='myRdBtn' onclick='SetAntenna(0x0004)'></td> <td><input type='radio' id='be_id1' name='bdB' class='myRdBtn' onclick='SetAntenna(0x0400)'></td> </tr>" +
            "<tr> <td style='padding: 10px;'>C</td> <td id='b2'>bd: </td>  <td><input type='radio' id='bi_id2' name='bdC' class='myRdBtn' onclick='SetAntenna(0x0008)'></td> <td><input type='radio' id='be_id2' name='bdC' class='myRdBtn' onclick='SetAntenna(0x0800)'></td> </tr>" +
            "<tr> <td style='padding: 10px;'>D</td> <td id='b3'>bd: </td>  <td><input type='radio' id='bi_id3' name='bdD' class='myRdBtn' onclick='SetAntenna(0x0010)'></td> <td><input type='radio' id='be_id3' name='bdD' class='myRdBtn' onclick='SetAntenna(0x1000)'></td> </tr>" +
            "</table> </div>" +            
     
            szMyStatusLine;

        $('body').html(myHtml);  
        
    
        // Make sure all buttons are disabled until we get up and running...    
        disableAntButtons();
         
        document.getElementById("sb_icon_id").addEventListener('touchstart',   HandleButtonUp );      // up, adds transparency
        document.getElementById("sb_icon_id").addEventListener('touchend',     HandleButtonDown );    // down, back to normal, no transparency
        document.getElementById("reg_icon_id").addEventListener('touchstart',  HandleButtonUp );      // up, adds transparency
        document.getElementById("reg_icon_id").addEventListener('touchend',    HandleButtonDown );    // down, back to normal, no transparency
        document.getElementById("unii_icon_id").addEventListener('touchstart', HandleButtonUp );      // up, adds transparency
        document.getElementById("unii_icon_id").addEventListener('touchend',   HandleButtonDown );    // down, back to normal, no transparency
                 
        document.getElementById("back_button_id").addEventListener('touchstart', HandleButtonDown );
        document.getElementById("back_button_id").addEventListener('touchend',   HandleButtonUp );
        
        ShowAlertPopUpMsg("Cycle NU Power.", "Please cycle power on the Network Unit in order for antenna changes to take effect.");
        
        lastGuiCurrentMode = guiCurrentMode;    
    }
    
    if( guiAntennaDirtyFlag == true )
    {
        updateAntButtons();
        guiAntennaDirtyFlag = false;
    }
}

function disableAntButtons()
{
    var i;

    // Disable all radio buttons to keep user from changing while 
    // we are trying to set the hardware...
    document.getElementById("ba_id").disabled = true;    
    document.getElementById("bm_id").disabled = true;    
    
    for( i = 0; i < 4; i++ )
    {
        document.getElementById("bi_id"+i).disabled = true;
        document.getElementById("be_id"+i).disabled = true;
    }
}


function updateAntButtons()
{
    var i;

    document.getElementById("ba_id").disabled = false;    
    document.getElementById("bm_id").disabled = false;    

            
    // Update Auto/Manual
    if( guiAntennaManualFlag == false )
    {
        // Set Auto..
        document.getElementById("ba_id").checked = true;
    }
    else
    {
        // Set Manual..
        document.getElementById("bm_id").checked = true;
    }
    
    for( i = 0; i < 4; i++ )
    {   
        
        // See if there is a bd defined...
        if( guiAntennaBands[i] )
        {
            // Make sure the radio buttons are enabled...
            document.getElementById("bi_id"+i).disabled = false;
            document.getElementById("be_id"+i).disabled = false;
            
            // Add band and freq text...            
            document.getElementById("b"+i).innerHTML = "bd: " + guiAntennaBands[i] + " (" + guiAntennaFreqArrayMHz[i] + ")";
            
            if( guiAntennaIntFlags[i] == true )
            {
                document.getElementById("bi_id"+i).checked = true;
            }
            else
            {
                document.getElementById("be_id"+i).checked = true;
            }
            
    
            // Disable selection if auto mode...
            if( guiAntennaManualFlag == false )
            {
                document.getElementById("bi_id"+i).disabled = true;
                document.getElementById("be_id"+i).disabled = true;
                
                // Uncheck radio buttons for now until Ares software is updated 
                // to provide visibility during auto mode.
                document.getElementById("bi_id"+i).checked = false;
                document.getElementById("be_id"+i).checked = false;               
            }
            
        }
        else
        {
            document.getElementById("b"+i).innerHTML = "-";
            document.getElementById("bi_id"+i).disabled = true;
            document.getElementById("be_id"+i).disabled = true;
        }
    }
}
// End of Settings View ............................................................................................





// ProcessDownloadView............................................................................................
function ProcessDownloadView()
{
    var i;
    var myId;
    
    if( lastGuiCurrentMode != guiCurrentMode )
    {
        PrintLog(1, "GUI: ProcessDownloadView()");
        
        // Draw the view...
        var myUniiIcon      = (bUniiStatusKnown && bUniiUp) ? szUniiIconButton + szUniiIconUp + "</button>" : szUniiIconButton + szUniiIconDown + "</button>";
        var mySbIfIcon = isSouthBoundIfCnx ? szSbIfIconButton + szSbIfIconOn + "</button>" : szSbIfIconButton + szSbIfIconOff + "</button>";
        var myRegIcon  = (nxtyRxRegLockStatus == 0x00) ? szRegIconButton + "</button>" : isRegistered ? szRegIconButton + szRegIconReg + "</button>" : szRegIconButton + szRegIconNotReg + "</button>";

                
        var myHtml = 
            "<img src='img/header_dld.png' width='100%' />" +
            "<button id='back_button_id' type='button' class='back_icon' onclick='RequestModeChange(PROG_MODE_MAIN)'><img src='img/go_back.png'/></button>"+
            myRegIcon +
            mySbIfIcon +
            myUniiIcon +
            

            "<br><br>" +
            "<div class='downloadSelectContainer'>" +
            
            
            "<table id='dldTable' align='center'>" +
            "<tr> <th style='padding: 10px;' colspan='4'>Update Software Menu</th></tr>" + 
            "<tr> <th>Image</th>  <th>Cel-Fi</th> <th>Cloud</th> <th>Status</th> </tr>" +
            "<tr> <td id='n0'></td> <td id='v0'></td>  <td id='c0'></td> <td id='s0'></td> </tr>" +
            "<tr> <td id='n1'></td> <td id='v1'></td>  <td id='c1'></td> <td id='s1'></td> </tr>" +
            "<tr> <td id='n2'></td> <td id='v2'></td>  <td id='c2'></td> <td id='s2'></td> </tr>" +
            "<tr> <td id='n3'></td> <td id='v3'></td>  <td id='c3'></td> <td id='s3'></td> </tr>" +
            "<tr> <td id='n4'></td> <td id='v4'></td>  <td id='c4'></td> <td id='s4'></td> </tr>" +
            "<tr> <td style='padding: 20px;' colspan='4'><input style='font-size: 24px;' id='update_id' type='button' value='Update' onclick='SetSoftwareUpdate()'></input> </td> </tr>" +
            "</table> </div>" +            
            
            

            szMyStatusLine;

        $('body').html(myHtml);  
        


        document.getElementById("sb_icon_id").addEventListener('touchstart', HandleButtonUp );      // up, adds transparency
        document.getElementById("sb_icon_id").addEventListener('touchend',   HandleButtonDown );    // down, back to normal, no transparency
        document.getElementById("reg_icon_id").addEventListener('touchstart', HandleButtonUp );     // up, adds transparency
        document.getElementById("reg_icon_id").addEventListener('touchend',   HandleButtonDown );   // down, back to normal, no transparency
        document.getElementById("unii_icon_id").addEventListener('touchstart', HandleButtonUp );      // up, adds transparency
        document.getElementById("unii_icon_id").addEventListener('touchend',   HandleButtonDown );    // down, back to normal, no transparency
        
        document.getElementById("back_button_id").addEventListener('touchstart', HandleButtonDown );
        document.getElementById("back_button_id").addEventListener('touchend',   HandleButtonUp );
        
        
        // Make the "Update" button look pretty...
        document.getElementById("update_id").addEventListener('touchstart', HandleButtonDown );
        document.getElementById("update_id").addEventListener('touchend',   HandleButtonUp );
        
        
        lastGuiCurrentMode = guiCurrentMode;    
    }
    
    if( guiSoftwareDirtyFlag == true )
    {
        for( i = 0; i < guiSwNames.length; i++ )
        {
            myId = "n" + i;
            document.getElementById(myId).innerHTML = guiSwNames[i];
            myId = "v" + i;
            document.getElementById(myId).innerHTML = guiSwCelFiVers[i];
            myId = "c" + i;
            document.getElementById(myId).innerHTML = guiSwCldVers[i];
            myId = "s" + i;
            document.getElementById(myId).innerHTML = guiSwStatus[i];
        }
    
        document.getElementById("update_id").disabled = guiSoftwareButtonFlag?false:true;
        document.getElementById("update_id").value    = guiSoftwareButtonText;
        
    
        guiSoftwareDirtyFlag = false;
    }
    
}
// End of Download View ............................................................................................



function redirectToDashboard(){
	window.location = "advanced.html";
}




// DisplayGuiPopUps............................................................................................
function DisplayGuiPopUps()
{
    // See if any popups need to be displayed...
    // Give priority to the alert...
    if( alertPopUpObj.bDirty )
    {
        alertPopUpObj.onDirty();
    }
    else if( decisionPopUpObj.bDirty )
    {
        decisionPopUpObj.onDirty();
    }
    else if( waitPopUpObj.bDirty )
    {
        waitPopUpObj.onDirty();
    }


    if( statusObj.bDirty )
    {
        statusObj.onDirty();
    }

}



// decisionPopUpObj..................................................................................
var decisionPopUpObj = 
{
    bDirty      : false,
    szTitle     : null,
    szMsg       : null,
    fHandler    : null,
    buttonArray : null,
     

    // Save the data for display...
    post: function( msg, handler, title, buttonList )
    {
        if( this.bDirty == false )
        {
            this.szMsg       = msg;
            this.fHandler    = handler;
            this.szTitle     = title;
            this.buttonArray = buttonList;
            
            this.bDirty = true;
            setTimeout( DisplayGuiPopUps, 10 );     // Kick the display loop...
        }        
    }, 
         
    // Call this handler if the bDirty flag is set by the system...
    onDirty: function() 
    {
        if( this.bDirty )
        {
            PrintLog(1, "ShowConfirmPopUpMsg: " + this.szTitle + " : " + this.szMsg );
            if(ImRunningOnPhone)
            {
                /*navigator.notification.confirm(
                    this.szMsg,                              // message
                    this.fHandler,                           // callback to invoke with index of button pressed
                    this.szTitle,                            // title
                    this.buttonArray );                      // buttonLabels
                */
            	//alert(this.szTitle);
            	switch (this.szTitle){
            	case "Privacy Policy":
            		util.showErrorPopup();
            		document.getElementById("commonPopup").classList.add("privacyPolicy");
            		privacyPolicyBodyContent1 = "Your privacy is important to us. Please refer to <a href='#' onclick='window.open(\"http://www.cel-fi.com/privacypolicy\", \"_system\");'>www.cel-fi.com/privacypolicy</a> for our detailed privacy policy.";
            		privacyPolicyBodyContent2 = "I have read and agree to the privacy policy";
            		var privacyHeader = document.getElementById("popupHeader");
                	var privacyBody = document.getElementById("popupBody");
                	var privacyFooter = document.getElementById("popupFooter");
                	privacyHeader.className = "privacyHeader";
                	privacyBody.className = "privacyBody";
                	privacyFooter.className = "privacyFooter";
                	privacyFooter.align = "center";
                	
                	privacyHeader.innerHTML = this.szTitle;
                	privacyBody.innerHTML = this.szMsg;
                	
                	var privacyAcceptanceContainer = util.createAppendElem("div", "privacyAcceptanceContainer", "privacyAcceptanceContainer", privacyBody);
                	var privacyAcceptanceTextContainer = util.createAppendElem("div", "privacyAcceptanceTextContainer", "privacyAcceptanceTextContainer", privacyAcceptanceContainer);
                	privacyAcceptanceTextContainer.innerHTML = privacyPolicyBodyContent2;
                	var privacyCheckboxContainer = util.createAppendElem("div", "privacyCheckboxContainer", "privacyCheckboxContainer", privacyAcceptanceContainer);
                	var privacyCheckbox = util.createAppendElem("input", "privacyCheckbox", "privacyCheckbox", privacyCheckboxContainer);
                	privacyCheckbox.type = "checkbox";
                	privacyCheckbox.addEventListener("click", privacyPolicy.checkboxPrivacyStatus, false);
                	var checkboxLabel = util.createAppendElem("label", "checkboxLabel", "", privacyCheckboxContainer);
                	checkboxLabel.setAttribute("for", "privacyCheckbox");
                	var privacyAcceptanceContainer = util.createAppendElem("div", "", "cb", privacyBody);
                	var acceptBtn = util.createAppendElem("button", "privacyAcceptBtn", "defaultButtonDisabled", privacyFooter);
            		acceptBtn.innerHTML = "Accept";
            		
            		break;
            		
            	case "Location Acquired":
            		util.showErrorPopup();
            		var locationHeader = document.getElementById("popupHeader");
                	var locationBody = document.getElementById("popupBody");
                	var locationFooter = document.getElementById("popupFooter");
                	locationHeader.className = "locationHeader";
                	locationBody.className = "locationBody";
                	locationFooter.className = "locationFooter";
                	locationFooter.align = "center";
                	
                	locationHeader.innerHTML = this.szTitle;
                	locationBody.innerHTML = this.szMsg;
                	
                	var locBtn = util.createAppendElem("button", "locationAcquiredBtn", "defaultButton", locationFooter);
    		        locBtn.innerHTML = errorHandler.locationAcquiredBtnContent;
    		        locBtn.addEventListener("click", function(){
    		        	util.removeElement("blackOverlay");
    			    	util.removeElement("commonPopup");
    		        	HandleLocationBack(1);
    		        }, false);
                	
            		break;
            		
            	case "Bluetooth Required":
            		errorHandler.showErrorPopup('bluetoothError');
            		break;
            		
            	case "Update Phone Software":
            		errorHandler.showErrorPopup('OSUpdateError');
            		break;
            		
            	case "Wireless Link Down":
            		errorHandler.showErrorPopup('linkDown');
            		break;
            		
            	case "Update PIC Software":
            		errorHandler.showErrorPopup('updatePIC');
            		break;
            		
            	case "No WiFi or Cell":
            		errorHandler.showErrorPopup('noWifiORCell');
            		break;
            		
            	case "HW Commanded from USB?":
            		errorHandler.showErrorPopup('USBCommand');
            		break;
            		
            	case "Update PIC Software":
            		errorHandler.showErrorPopup('updatePIC');
            		break;
            		
            	case "Unable to acquire GPS.":
            		errorHandler.showErrorPopup('unableGPS');
            		break;
            		
            	case "Location":
            		util.showErrorPopup();
            		//locationAcquiredContent = "Lat:Long " + position.coords.latitude + ":" + position.coords.longitude;
            		var locationHeader = document.getElementById("popupHeader");
                	var locationBody = document.getElementById("popupBody");
                	var locationFooter = document.getElementById("popupFooter");
                	locationHeader.className = "locationHeader";
                	locationBody.className = "locationBody";
                	locationFooter.className = "locationFooter";
                	locationFooter.align = "center";
                	
                	locationHeader.innerHTML = this.szTitle;
                	locationBody.innerHTML = this.szMsg;
                	
                	/*var locBtn = util.createAppendElem("button", "locationNoBtn", "defaultButton", locationFooter);
    		        locBtn.innerHTML = "No";
    		        locBtn.addEventListener("click", function(){
    		        	util.removeElement("blackOverlay");
    			    	util.removeElement("commonPopup");
    		        	HandleConfirmLocation(0);
    		        }, false);
    		        
    		        var locBtn = util.createAppendElem("button", "locationYesBtn", "defaultButton", locationFooter);
    		        locBtn.innerHTML = "Yes";
    		        locBtn.addEventListener("click", function(){
    		        	util.removeElement("blackOverlay");
    			    	util.removeElement("commonPopup");
    		        	HandleConfirmLocation(1);
    		        }, false);
            		break;*/
                	
                	var locBtn = util.createAppendElem("button", "locationNoBtn", "defaultButton", locationFooter);
    		        locBtn.innerHTML = "OK";
    		        locBtn.addEventListener("click", function(){
    		        	util.removeElement("blackOverlay");
    			    	util.removeElement("commonPopup");
    			    	redirectToDashboard();
    		        }, false);
            	}
            }
            else
            {
                alert(this.szTitle ? (this.szTitle + ": " + this.szMsg) : this.szMsg);
                this.fHandler(1);
            }
                
            this.bDirty = false;
        }        
    }
}

// waitPopUpObj..................................................................................
var waitPopUpObj = 
{
    bDirty      : false,
    bActive     : false,
    szTitle     : null,
    szMsg       : null,
     

    // Save the data for display...
    post: function( title, msg )
    {
        if( this.bDirty == false )
        {
            this.szTitle     = title;
            this.szMsg       = msg;
            
            this.bDirty = true;
            setTimeout( DisplayGuiPopUps, 10 );     // Kick the display loop...
        }        
    }, 
         
    // Call this handler if the bDirty flag is set by the system...
    onDirty: function() 
    {
        if( this.bDirty )
        {
            PrintLog(1, "ShowWaitPopUpMsg: " + this.szTitle + " : " + this.szMsg );

            // Had to add a plugin for Spinners since IOS does not support navigator.notification.activityStart()
            this.stop();
            
            if(ImRunningOnPhone)
            {
                // Note: spinner dialog is cancelable by default on Android and iOS. On WP8, it's fixed by default
                // so make fixed on all platforms.
                // Title is only allowed on Android so never show the title.
                window.plugins.spinnerDialog.show(null, this.szMsg, true);
            }
            else
            {
            }
            
                
            this.bActive = true;    
            this.bDirty  = false;
        }        
    },
    
    stop: function()
    {
        if( this.bActive )
        {
            PrintLog(1, "Stop: ShowWaitPopUpMsg: " );
            if(ImRunningOnPhone)
            {
                window.plugins.spinnerDialog.hide();
            }
            else
            {
            }
            this.bActive = false;
        }
    }
}


// alertPopUpObj..................................................................................
var alertPopUpObj = 
{
    bDirty      : false,
    szTitle     : null,
    szMsg       : null,
     

    // Save the data for display...
    post: function( title, msg )
    {
        if( this.bDirty == false )
        {
            this.szTitle     = title;
            this.szMsg       = msg;
            
            this.bDirty = true;
            setTimeout( DisplayGuiPopUps, 10 );     // Kick the display loop...
        }        
    }, 
         
    // Call this handler if the bDirty flag is set by the system...
    onDirty: function() 
    {
        if( this.bDirty )
        {
            PrintLog(1, "ShowAlertPopUpMsg: " + this.szTitle + " : " + this.szMsg );

            if(ImRunningOnPhone) 
            {
            	if(this.szTitle == "Registration Required."){
            		util.showErrorPopup();
            		var locationHeader = document.getElementById("popupHeader");
                	var locationBody = document.getElementById("popupBody");
                	var locationFooter = document.getElementById("popupFooter");
                	locationHeader.className = "privacyHeader";
                	locationBody.className = "privacyBody";
                	locationFooter.className = "privacyFooter";
                	locationFooter.align = "center";
                	
                	locationHeader.innerHTML = this.szTitle;
                	locationBody.innerHTML = this.szMsg;
                	
                	var locBtn = util.createAppendElem("button", "locationAcquiredBtn", "defaultButton", locationFooter);
    		        locBtn.innerHTML = "OK";
    		        locBtn.addEventListener("click", function(){
    		        	util.removeElement("blackOverlay");
    			    	util.removeElement("commonPopup");
    			    	//ProcessRegistrationView();
    			    	RequestModeChange(PROG_MODE_REGISTRATION);
    		        }, false);
            	}else{
            		navigator.notification.alert(this.szMsg, null, this.szTitle, 'ok');
            	}
            } 
            else 
            {
                alert(this.szTitle ? (this.szTitle + ": " + this.szMsg) : this.szMsg);
            }
            this.bDirty  = false;
        }        
    }
}


// statusObj..................................................................................
var statusObj = 
{
    bDirty      : false,
    szMsg       : null,
     
    // Save the data for display...
    post: function( msg )
    {
        if( this.bDirty == false )
        {
            this.szMsg  = msg;
            this.bDirty = true;
            setTimeout( DisplayGuiPopUps, 10 );     // Kick the display loop...
        }        
    }, 
         
    onDirty: function() 
    {
        if( this.bDirty )
        {
            if( document.getElementById("status_line_id") != null )
            {
                document.getElementById("status_line_id").innerHTML = this.szMsg;
                PrintLog(1, "StatusLine: " + this.szMsg );
            }
            else
            {
                PrintLog(99, "No Status Line ID for: " + this.szMsg );
            }

            this.bDirty  = false;
        }        
    }
};

var util = {
		syncData: 'Syncing data...',
		searchMessage: 'Searching for Cel-Fi devices...',
	    showErrorPopup: function(errorType){
	    	this.createBlackOverlay();
	    	this.createCommonPopup();
	    },
	    
	    createBlackOverlay: function(){
	    	var blackOverlay = document.createElement("div");
	    	blackOverlay.id = "blackOverlay";
	    	mainContainer.appendChild(blackOverlay);	
	    },
	    
	    createCommonPopup: function(){
	    	util.removeElement("commonPopup");
	    	util.removeElement("blackOverlay");
	    	/*var popupContainer = document.createElement("div");
	    	popupContainer.id = "commonPopup";
	    	popupContainer.className = "commonPopup";
	    	mainContainer.appendChild(popupContainer);*/
	    	var popupContainer = util.createAppendElem("div", "commonPopup", "commonPopup", mainContainer);
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
	    	uiElem.style.marginTop = remHeight + "px !important";
	    	uiElem.style.marginLeft = remWidth + "px !important";
	    	//alert("Height:"+deviceHeight+"/"+remHeight+" Width: "+deviceWidth+"/"+remWidth);
	    },
	    
	    createAppendElem : function(elemType, elemId, elemClass, appendTo){
	    	var newElem = document.createElement(elemType);
	    	if(elemId!=""){	newElem.id = elemId;}
	    	if(elemClass!=""){ newElem.className = elemClass;}
	    	appendTo.appendChild(newElem);
	    	
	    	return document.getElementById(elemId);
	    },
	    
	    removeElement: function(elmId){
	    	var uiElement = document.getElementById(elmId);
	    	if(uiElement){
	    		uiElement.parentNode.removeChild(uiElement);
	    	}
	    },
	    
	    showSearchAnimation: function(){
	    	util.removeElement("searchBoxContainer");
	    	util.removeElement("searchIconContainer");
	    	util.removeElement("searchMessageBox");
	    	if(typeof searchAnimationLoop != "undefined"){clearInterval(searchAnimationLoop);}
	    	var searchBoxContainer = util.createAppendElem("div", "searchBoxContainer", "", mainContainer);
	    	if(window.localStorage.getItem("deviceType")=="phone"){
	    		searchBoxContainer.innerHTML = '<svg width="500px" height="800px" xmlns="http://www.w3.org/2000/svg" version="1.1"><defs><radialGradient id="grad1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%"><stop offset="0%" style="stop-color:white;stop-opacity:0" /><stop offset="100%" style="stop-color:white;stop-opacity:0.03" /></radialGradient><radialGradient id="grad2" cx="50%" cy="50%" r="50%" fx="50%" fy="50%"><stop offset="0%" style="stop-color:white;stop-opacity:0" /><stop offset="100%" style="stop-color:white;stop-opacity:0.08" /></radialGradient><radialGradient id="grad3" cx="50%" cy="50%" r="50%" fx="50%" fy="50%"><stop offset="0%" style="stop-color:white;stop-opacity:0" /><stop offset="100%" style="stop-color:white;stop-opacity:0.13" /></radialGradient><radialGradient id="grad4" cx="50%" cy="50%" r="50%" fx="50%" fy="50%"><stop offset="0%" style="stop-color:white;stop-opacity:0" /><stop offset="100%" style="stop-color:white;stop-opacity:0.18" /></radialGradient></defs><circle id="circle1" cx="'+eval(deviceWidth/2)+'" cy="'+eval(deviceHeight/2)+'" r="200" fill="url(#grad1)" /><circle id="circle2" cx="'+eval(deviceWidth/2)+'" cy="'+eval(deviceHeight/2)+'" r="150" fill="url(#grad2)" /><circle id="circle3" cx="'+eval(deviceWidth/2)+'" cy="'+eval(deviceHeight/2)+'" r="100" fill="url(#grad3)" /><circle id="circle4" cx="'+eval(deviceWidth/2)+'" cy="'+eval(deviceHeight/2)+'" r="50" fill="url(#grad4)" /><circle id="mainCircle" cx="'+eval(deviceWidth/2)+'" cy="'+eval(deviceHeight/2)+'" r="50" fill="white" /></svg>';
	    	}else{
	    		searchBoxContainer.innerHTML = '<svg width="500px" height="500px" xmlns="http://www.w3.org/2000/svg" version="1.1"><defs><radialGradient id="grad1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%"><stop offset="0%" style="stop-color:white;stop-opacity:0" /><stop offset="100%" style="stop-color:white;stop-opacity:0.03" /></radialGradient><radialGradient id="grad2" cx="50%" cy="50%" r="50%" fx="50%" fy="50%"><stop offset="0%" style="stop-color:white;stop-opacity:0" /><stop offset="100%" style="stop-color:white;stop-opacity:0.08" /></radialGradient><radialGradient id="grad3" cx="50%" cy="50%" r="50%" fx="50%" fy="50%"><stop offset="0%" style="stop-color:white;stop-opacity:0" /><stop offset="100%" style="stop-color:white;stop-opacity:0.13" /></radialGradient><radialGradient id="grad4" cx="50%" cy="50%" r="50%" fx="50%" fy="50%"><stop offset="0%" style="stop-color:white;stop-opacity:0" /><stop offset="100%" style="stop-color:white;stop-opacity:0.18" /></radialGradient></defs><circle id="circle1" cx="250" cy="250" r="200" fill="url(#grad1)" /><circle id="circle2" cx="250" cy="250" r="150" fill="url(#grad2)" /><circle id="circle3" cx="250" cy="250" r="100" fill="url(#grad3)" /><circle id="circle4" cx="250" cy="250" r="50" fill="url(#grad4)" /><circle id="mainCircle" cx="250" cy="250" r="50" fill="white" /></svg>';
	    	}
	    	this.initiateSearchAnimation();
	    	var searchMessageBox = util.createAppendElem("div", "searchMessageBox", "w100", mainContainer);
	    	searchMessageBox.align = "center";
	    	searchMessageBox.innerHTML = util.searchMessage;
	    	var searchIconContainer = util.createAppendElem("div", "searchIconContainer", "searchIconContainer", mainContainer);
	    },
	    
	    initiateSearchAnimation: function(){
	    	circle1 = document.getElementById("circle1"), circle2 = document.getElementById("circle2"), circle3 = document.getElementById("circle3"), circle4 = document.getElementById("circle4");
			var circle1_r = circle1.getAttribute("r"), circle2_r = circle2.getAttribute("r"), circle3_r = circle3.getAttribute("r"), circle4_r = circle4.getAttribute("r");
			var radiusStartLimit = 0;
			var radiusEndLimit = 50;
			var tempCircle1_r = parseInt(circle1_r)+1, tempCircle2_r = parseInt(circle2_r)+1, tempCircle3_r = parseInt(circle3_r)+1, tempCircle4_r = parseInt(circle4_r)+1;
			searchAnimationLoop = setInterval(function(){
				if((tempCircle1_r-circle1_r)>49){
					tempCircle1_r = parseInt(circle1_r)+1;
					tempCircle2_r = parseInt(circle2_r)+1;
					tempCircle3_r = parseInt(circle3_r)+1;
					tempCircle4_r = parseInt(circle4_r)+1;
				}
				circle1.setAttribute("r",tempCircle1_r++);
				circle2.setAttribute("r",tempCircle2_r++);
				circle3.setAttribute("r",tempCircle3_r++);
				circle4.setAttribute("r",tempCircle4_r++);
			}, 15);
	    },
	    
	    deviceIdentified: function(){
	    	util.stopSearchAnimation();
	    	clearInterval(searchAnimationLoop);
	    	document.getElementById("searchIconContainer").style.background = "";
	    	document.getElementById("searchIconContainer").style.background = "url('img/assets/icons/Done.svg') no-repeat";
	    	document.getElementById("searchMessageBox").innerHTML = util.syncData;
	    },
	    
	    stopSearchAnimation: function(){
	    	circle1.setAttribute("r",200);
			circle2.setAttribute("r",150);
			circle3.setAttribute("r",100);
			circle4.setAttribute("r",50);
	    },
	    
	    closeApplication: function(){
			navigator.app.exitApp();	
		}
	};

var privacyPolicy = {
		checkboxPrivacyStatus: function(){
	    	var checkBox = document.getElementById("privacyCheckbox");
	    	var privacyBtn = document.getElementById("privacyAcceptBtn");
	    	if(checkBox.checked == true){
	    		privacyBtn.className = "defaultButton";
	    		privacyBtn.addEventListener("click",privacyPolicy.acceptPrivacyPolicy);
	    	}else{
	    		privacyBtn.className = "defaultButtonDisabled";
	    		privacyBtn.removeEventListener("click",privacyPolicy.acceptPrivacyPolicy);
	    	}
	    },
	    
	    acceptPrivacyPolicy: function(){
	    	window.localStorage.setItem("privacyPolicy","1");
	    	util.removeElement("blackOverlay");
	    	util.removeElement("commonPopup");
	    	//bluetooth.searchForCelFiDevice();
	    	HandlePrivacyConfirmation(1);
	    }
};

var errorHandler = {
    OSUpdateError : {
    	errorTitle : "Error",
    	errorBody : "Your Operating System is out of date.<br>Please upgrade it in order to run this app.",
    },
    
    UpgradeButtonContent : "Upgrade Now",
    enableBluetoothButtonContent : "Activate Bluetooth",
    searchDeviceAgainBtnContent : "Try Again",
    tryAgainBtnContent : "Retry",
    updateNowBtnContent : "Update",
    locationAcquiredBtnContent : "OK",
    
    bluetoothError : {
    	errorTitle : "Bluetooth Required",
    	errorBody : "This app requires Bluetooth to be enabled.<br>Please activate Bluetooth from your system settings.",
    },
    signalError : {
    	errorTitle : "Not receiving a signal (E1)",
    	errorBody : "The cellular signal might be too weak to boost.<br>Try our Signal Finder tool for the best location for the Network Unit (NU).",
    },
    registrationError:{
    	errorTitle : "Registration Error",
    	errorBody : "Error in user registration.<br>Please contact your network operator.",
    },
    linkDownError:{
    	errorTitle : "Wireless Link Down",
    	errorBody : "Wireless link between the Network Unit and Coverage Unit is down.  Please wait for the link to connect and try again.",
    },
    updatePICError:{
    	errorTitle : "Update PIC Software",
    	errorBody : "PIC software is out of date.<br>Select Ok to update...",
    },
    noWifiError:{
    	errorTitle : "No WiFi or Cell",
    	errorBody : "Unable to connect to cloud, no WiFi or Cell available.",
    },
    USBCommandError:{
    	errorTitle : "HW Commanded from USB?",
    	errorBody : "Cel-Fi may be receiving commands from USB. Unable to support both USB commands and Bluetooth.",
    },
    unableGPSError:{
    	errorTitle : "Unable to acquire GPS.",
    	errorBody : "No location information will be stored.",
    },
    showErrorPopup: function(errorType){
    	util.createBlackOverlay();
    	util.createCommonPopup();
    	this.modifyErrorPopup(errorType);
    },
    
    modifyErrorPopup: function(errorType){
    	var errHeader = document.getElementById("popupHeader");
    	errHeader.className = "errorHeader";
    	
    	var errorIcon = util.createAppendElem("div", "errorIcon", "errorIcon", errHeader);
    	var errTitleContainer = util.createAppendElem("div", "errTitleContainer", "errTitleContainer", errHeader);
    	var errBody = document.getElementById("popupBody");
    	errBody.className = "errorBody";
    	
    	var errFooter = document.getElementById("popupFooter");
    	errFooter.align = "center";
    	
    	switch(errorType) {
		    case "OSUpdateError":
		        var errObj = errorHandler.OSUpdateError;
		        var errBtn = util.createAppendElem("button", "errUpgradeBtn", "defaultButton", errFooter);
		        errBtn.innerHTML = errorHandler.UpgradeButtonContent;
		        errBtn.addEventListener("click", function(){util.closeApplication();}, false);
				break;
				
		    case "bluetoothError":
		        var errObj = errorHandler.bluetoothError;
		        var errBtn = util.createAppendElem("button", "errBluetoothBtn", "defaultButton", errFooter);
		        errBtn.innerHTML = errorHandler.enableBluetoothButtonContent;
		        errBtn.addEventListener("click", function(){util.closeApplication();}, false);
				break;
				
			case "signalError":
		        var errObj = errorHandler.signalError;
		        var errBtn = util.createAppendElem("button", "errDeviceSearch", "defaultButton", errFooter);
		        errBtn.innerHTML = errorHandler.searchDeviceAgainBtnContent;
		        errBtn.addEventListener("click", function(){
		        	util.removeElement("blackOverlay");
		        	util.removeElement("commonPopup");
		        	bluetooth.placeSearchAnimation();
		        }, false);
		        break;
				
			case "registrationError":
		        var errObj = errorHandler.registrationError;
				break;
			
			case "linkDown":
				var errObj = errorHandler.linkDownError;
		        var errBtn = util.createAppendElem("button", "errLinkDown", "defaultButton", errFooter);
		        errBtn.innerHTML = errorHandler.tryAgainBtnContent;
		        errBtn.addEventListener("click", function(){HandleUniiRetry(1);}, false);
				break;
				
			case "updatePIC":
				var errObj = errorHandler.updatePICError;
		        var errBtn = util.createAppendElem("button", "errupdatePIC", "defaultButton", errFooter);
		        errBtn.innerHTML = errorHandler.updateNowBtnContent;
		        errBtn.addEventListener("click", function(){HandlePicUpdateConfirmation(1);}, false);
				break;
				
			case "noWifiORCell":
				var errObj = errorHandler.noWifiError;
		        var errBtn = util.createAppendElem("button", "errNoWifi", "defaultButton", errFooter);
		        errBtn.innerHTML = errorHandler.tryAgainBtnContent;
		        errBtn.addEventListener("click", function(){HandleCloudRetry(1);}, false);
				break;
			
			case "USBCommand":
				var errObj = errorHandler.USBCommandError;
		        var errBtn = util.createAppendElem("button", "errUSBCommand", "defaultButton", errFooter);
		        errBtn.innerHTML = errorHandler.tryAgainBtnContent;
		        errBtn.addEventListener("click", function(){HandleUsbConflictConfirmation(1);}, false);
				break;
				
			case "unableGPS":
				var errObj = errorHandler.unableGPSError;
		        var errBtn = util.createAppendElem("button", "errUnableGPS", "defaultButton", errFooter);
		        errBtn.innerHTML = errorHandler.locationAcquiredBtnContent;
		        errBtn.addEventListener("click", function(){HandleLocationBack(1);}, false);
				break;
				
		}
    	
    	errTitleContainer.innerHTML = errObj.errorTitle;
    	errBody.innerHTML = errObj.errorBody;
    },
    
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
