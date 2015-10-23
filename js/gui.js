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
var settingsPanelContentMobile	= "<div id='settingsDataWrapper' class='col-sm-12'> <div class='group1 col-sm-12'> <div class='operatorContainer col-sm-6'> <div class='panel panel-default'> <div class='panel-group' id='settingsDataContainer'> <div class='panel-heading dropDown' id='operatorTitle'><h4 class='panel-title'><a data-toggle='collapse' data-parent='#settingsDataWrapper' href='#collapseOne'><div><div class='settingsDropIcns' id='operatorIcn'></div>Operator</div><span class='pull-right'><span class='toggle-icon glyphicon glyphicon-chevron-up'></span></span></a></h4></div><div id='collapseOne' class='panel-collapse collapse in'><div class='panel-body'><div><div class='operatorList col-xs-8'><button type='button' class='form-control'><span data-bind='label' id='operatorVal'>Verizon</span></span>&nbsp;<span class='caret'></span></button><div class='operatorListWrapper'><ul><li>AT&T</li><li>T-Mobile</li><li class='selectedListVal'>Verizon</li><li>I don't see my Operator</li></ul></div></div></div></div></div></div></div></div><div class='deviceContainer col-sm-6'> <div class='panel panel-default'> <div class='panel-heading dropDown' id='deviceTitle'><h4 class='panel-title'><a data-toggle='collapse' data-parent='#settingsDataWrapper' href='#collapseTwo'><div><div class='settingsDropIcns' id='deviceIcn'></div>Device</div><span class='pull-right'><span class='toggle-icon glyphicon glyphicon-chevron-down'></span></span></a></h4></div><div id='collapseTwo' class='panel-collapse collapse'><div class='panel-body'><div id='deviceDetailsWrapper'><div id='devicesFoundLbl'>Devices Found</div><div class='deviceList'><button type='button' class='form-control'><span data-bind='label' id='deviceVal'>Device 2</span></span>&nbsp;<span class='caret'></span></button><div class='deviceListWrapper'><ul><li>Device 1</li><li class='selectedListVal'>Device 2</li><li>Device 3</li><li>Device 4</li></ul></div></div><div class='cb'></div><div class='hr'></div><div id='devicesFoundLbl'>Give your Device a name</div><input type='text' id='deviceInput' class='col-xs-12'><div class='form-group' align='right'><button type='button' class='defaultButton' id='deviceUpdate' onclick=''>Update</button></div></div></div></div></div></div></div><div class='group2 col-sm-6'> <div class='versionContainer col-sm-12'> <div class='panel panel-default'> <div class='panel-heading dropDown' id='softwareTitle'><h4 class='panel-title'><a data-toggle='collapse' data-parent='#settingsDataWrapper' href='#collapseThree'><div><div class='settingsDropIcns' id='versionIcn'></div>Software Version</div><span class='pull-right'><span class='toggle-icon glyphicon glyphicon-chevron-down'></span></span></a></h4></div><div id='collapseThree' class='panel-collapse collapse'><div class='panel-body'><div id='versionWrapper'><div class='versionLbl'>Please update your software</div><div class='form-group' align='right'><button type='button' class='primaryButton' id='versionUpdate' onclick=''>Update</button></div><div class='versionLbl'>You're up-to-date</div><div class='doneTick'></div></div></div></div></div></div></div><div class='group3 col-sm-12'> <div class='antennaContainer col-sm-6'> <div class='panel panel-default'> <div class='panel-heading dropDown'><h4 class='panel-title'><a data-toggle='collapse' data-parent='#settingsDataWrapper' href='#collapseFour'><div><div class='settingsDropIcns' id='antennaIcn'></div>Antenna Settings</div><span class='pull-right'><span class='toggle-icon glyphicon glyphicon-chevron-down'></span></span></a></h4></div><div id='collapseFour' class='panel-collapse collapse'><div class='panel-body'><div class='hr'></div><div class='antennaDetailsWrapper'><div class='antennaLbl'>Antenna Control:</div><div class='toggleSwitch'> <label class='leftToggle on' for='antennaAuto'> Auto </label> <input type='radio' name='antennaCtrl' value='auto' id='antennaAuto'/> <label class='rightToggle off' for='antennaManual'> Manual </label> <input type='radio' checked name='antennaCtrl' value='manual' id='antennaManual'/> </div></div><div class='hr'></div><div class='antennaDetailsWrapper'> <div class='antennaLbl'>Band 17 (700):</div><div class='toggleSwitch'> <label class='leftToggle on' for='band_1_internal'> Internal </label> <input type='radio' name='band1' value='internal' id='band_1_internal'/> <label class='rightToggle off' for='band_1_external'> External </label> <input type='radio' checked name='band1' value='external' id='band_1_external'/> </div></div><div class='hr'></div><div class='antennaDetailsWrapper'> <div class='antennaLbl'>Band 4 (1700):</div><div class='toggleSwitch'> <label class='leftToggle on' for='band_2_internal'> Internal </label> <input type='radio' name='band2' value='internal' id='band_2_internal'/> <label class='rightToggle off' for='band_2_external'> External </label> <input type='radio' checked name='band2' value='external' id='band_2_external'/> </div></div><div class='hr'></div><div class='antennaDetailsWrapper'> <div class='antennaLbl disabledToggle'>Band 5 (850):</div><div class='toggleSwitch'> <label class='leftToggle disabledOn' for='band_3_internal'> Internal </label> <input type='radio' disabled name='band3' value='internal' id='band_3_internal'/> <label class='rightToggle disabledOff' for='band_3_external'> External </label> <input type='radio' disabled name='band3' value='external' id='band_3_external'/> </div></div><div class='hr'></div><div class='antennaDetailsWrapper'> <div class='antennaLbl'>Band 2 (1900):</div><div class='toggleSwitch'> <label class='leftToggle on' for='band_4_internal'> Internal </label> <input type='radio' name='band4' value='internal' id='band_4_internal'/> <label class='rightToggle off' for='band_4_external'> External </label> <input type='radio' checked name='band4' value='external' id='band_4_external'/> </div></div></div></div></div></div><div class='boosterContainer col-sm-6'> <div class='panel panel-default'> <div class='panel-heading dropDown'><h4 class='panel-title'><a data-toggle='collapse' data-parent='#settingsDataWrapper' href='#collapseFive'><div><div class='settingsDropIcns' id='boosterIcn'></div>Booster Settings</div><span class='pull-right'><span class='toggle-icon glyphicon glyphicon-chevron-down'></span></span></a></h4></div><div id='collapseFive' class='panel-collapse collapse'><div class='panel-body'><div id='boosterWrapper'><div class='boosterLbl'>Select by Technology:</div><div class='cb'></div><div class='radioButtonWrapper'><label class='radioBtnWrapper radioBtnSelected col-xs-6' for='auto'></label><div for='auto' class='boosterSelectedTxt'>Auto</div><input type='radio' name='technologyType' value='auto' id='auto'/></div><div class='radioButtonWrapper'><label class='radioBtnWrapper radioBtnUnSelected col-xs-6' for='3g_4g'></label><div for='3g_4g' class='boosterUnSelectedTxt'>3G/4G</div><input type='radio' name='technologyType' value='3g_4g' id='3g_4g'/></div><div class='radioButtonWrapper'><label class='radioBtnWrapper radioBtnUnSelected col-xs-6' for='lte'></label><div for='lte' class='boosterUnSelectedTxt'>LTE</div><input type='radio' name='technologyType' value='lte' id='lte'/></div><div class='boosterLbl'>Select by Band (Advanced):</div><div class='cb'></div><div class='radioButtonWrapper'><label class='radioBtnWrapper radioBtnUnSelected col-xs-6' for='band3'></label><div for='band3' class='boosterUnSelectedTxt'>Band 3</div><input type='radio' name='technologyType' value='band3' id='band3'/></div><div class='radioButtonWrapper'><label class='radioBtnWrapper radioBtnUnSelected col-xs-6' for='band5'></label><div for='band5' class='boosterUnSelectedTxt'>Band 5</div><input type='radio' name='technologyType' value='band5' id='band5'/></div><div class='radioButtonWrapper'><label class='radioBtnWrapper radioBtnUnSelected col-xs-6' for='band28'></label><div for='band28' class='boosterUnSelectedTxt'>Band 28</div><input type='radio' name='technologyType' value='band28' id='band28'/></div></div></div></div></div></div></div></div>";
var settingsPanelContentTablet	= "<div id='settingsDataWrapper' class='col-sm-12'> <div class='operatorDataWrapper col-sm-6 settingsTabViewWrapper'><div class='col-sm-12'><div><div class='settingsDropIcns' id='operatorIcn'></div>Operator</div><div><div class='operatorList col-xs-8'><button type='button' class='form-control'><span data-bind='label' id='operatorVal'>Verizon</span>&nbsp;<span class='caret'></span></button><div class='operatorListWrapper'><ul><li>AT&T</li><li>T-Mobile</li><li class='selectedListVal'>Verizon</li><li>I don't see my Operator</li></ul></div></div></div></div></div><div class='deviceDataWrapper col-sm-6 settingsTabViewWrapper'><div class='col-sm-12'><div><div class='settingsDropIcns' id='deviceIcn'></div>Device</div><div id='deviceDetailsWrapper'><div id='devicesFoundLbl'>Devices Found</div><div class='deviceList col-sm-8'><button type='button' class='form-control'><span data-bind='label' id='deviceVal'>Device 2</span></span>&nbsp;<span class='caret'></span></button><div class='deviceListWrapper'><ul><li>Device 1</li><li class='selectedListVal'>Device 2</li><li>Device 3</li><li>Device 4</li></ul></div></div><div class='cb'></div><div class='hr'></div><div id='devicesFoundLbl'>Give your Device a name</div><input type='text' id='deviceInput' class='col-sm-8'><div class='form-group' align='right'><button type='button' class='defaultButton' id='deviceUpdate' onclick=''>Update</button></div></div></div></div><div class='versionDataWrapper col-sm-6 settingsTabViewWrapper'><div class='col-sm-12'><div><div class='settingsDropIcns' id='versionIcn'></div>Software Version</div><div id='versionWrapper'><div class='versionLbl'>Please update your software</div><div class='form-group' align='right'><button type='button' class='primaryButton' id='versionUpdate' onclick=''>Update</button></div><div class='versionLbl'>You're up-to-date</div><div class='doneTick'></div></div></div></div><div class='antennaDataWrapper col-sm-6 settingsTabViewWrapper'><div class='col-sm-12'><div><div class='settingsDropIcns' id='antennaIcn'></div>Antenna Settings</div><div class='antennaDetailsWrapper'><div class='antennaLbl'>Antenna Control:</div><div class='antennaRadioWrapper col-sm-4'><div class='radioButtonWrapper'><label class='radioBtnWrapper radioBtnSelected col-xs-6' for='antennaAuto'></label><div for='auto' class='boosterSelectedTxt'>Auto</div><input type='radio' name='antennaCtrl' value='auto' id='antennaAuto'/></div><div class='cb'></div><div class='radioButtonWrapper'><label class='radioBtnWrapper radioBtnUnSelected col-xs-6' for='3g_4g'></label><div for='3g_4g' class='boosterUnSelectedTxt'>3G/4G</div><input type='radio' name='antennaCtrl' value='manual' id='antennaManual'/></div></div></div><div class='hr'></div><div class='antennaDetailsWrapper'> <div class='antennaLbl'>Band 17 (700):</div><div class='antennaRadioWrapper col-sm-4'><div class='radioButtonWrapper'><label class='radioBtnWrapper radioBtnSelected col-xs-6' for='band_1_internal'></label><div for='band_1_internal' class='boosterSelectedTxt'>Internal</div><input type='radio' name='antennaCtrl' value='internal' id='band_1_internal'/></div><div class='cb'></div><div class='radioButtonWrapper'><label class='radioBtnWrapper radioBtnUnSelected col-xs-6' for='band_1_external'></label><div for='band_1_external' class='boosterUnSelectedTxt'>3G/4G</div><input type='radio' name='antennaCtrl' value='external' id='band_1_external'/></div></div></div><div class='hr'></div><div class='antennaDetailsWrapper'> <div class='antennaLbl'>Band 4 (1700):</div><div class='antennaRadioWrapper col-sm-4'><div class='radioButtonWrapper'><label class='radioBtnWrapper radioBtnSelected col-xs-6' for='band_2_internal'></label><div for='band_1_internal' class='boosterSelectedTxt'>Internal</div><input type='radio' name='antennaCtrl' value='internal' id='band_2_internal'/></div><div class='cb'></div><div class='radioButtonWrapper'><label class='radioBtnWrapper radioBtnUnSelected col-xs-6' for='band_2_external'></label><div for='band_1_external' class='boosterUnSelectedTxt'>3G/4G</div><input type='radio' name='antennaCtrl' value='external' id='band_2_external'/></div></div></div><div class='hr'></div><div class='antennaDetailsWrapper'> <div class='antennaLbl disabledToggle'>Band 5 (850):</div><div class='antennaRadioWrapper col-sm-4'><div class='radioButtonWrapper'><label class='radioBtnWrapper radioBtnSelected col-xs-6' for='band_3_internal'></label><div for='band_1_internal' class='boosterSelectedTxt'>Internal</div><input type='radio' name='antennaCtrl' value='internal' id='band_1_internal'/></div><div class='cb'></div><div class='radioButtonWrapper'><label class='radioBtnWrapper radioBtnUnSelected col-xs-6' for='band_3_external'></label><div for='band_1_external' class='boosterUnSelectedTxt'>3G/4G</div><input type='radio' name='antennaCtrl' value='external' id='band_3_external'/></div></div></div><div class='hr'></div><div class='antennaDetailsWrapper'> <div class='antennaLbl'>Band 2 (1900):</div><div class='antennaRadioWrapper col-sm-4'><div class='radioButtonWrapper'><label class='radioBtnWrapper radioBtnSelected col-xs-6' for='band_4_internal'></label><div for='band_1_internal' class='boosterSelectedTxt'>Internal</div><input type='radio' name='antennaCtrl' value='internal' id='band_1_internal'/></div><div class='cb'></div><div class='radioButtonWrapper'><label class='radioBtnWrapper radioBtnUnSelected col-xs-6' for='band_4_external'></label><div for='band_1_external' class='boosterUnSelectedTxt'>3G/4G</div><input type='radio' name='antennaCtrl' value='external' id='band_1_external'/></div></div></div></div></div><div class='boosterSettingsWrapper col-sm-6 settingsTabViewWrapper'><div class='col-sm-12'><div><div class='settingsDropIcns' id='boosterIcn'></div>Booster Settings</div><div id='boosterWrapper'><div class='boosterLbl'>Select by Technology:</div><div class='cb'></div><div class='radioButtonWrapper'><label class='radioBtnWrapper radioBtnSelected col-xs-6' for='auto'></label><div for='auto' class='boosterSelectedTxt'>Auto</div><input type='radio' name='technologyType' value='auto' id='auto'/></div><div class='radioButtonWrapper'><label class='radioBtnWrapper radioBtnUnSelected col-xs-6' for='3g_4g'></label><div for='3g_4g' class='boosterUnSelectedTxt'>3G/4G</div><input type='radio' name='technologyType' value='3g_4g' id='3g_4g'/></div><div class='radioButtonWrapper'><label class='radioBtnWrapper radioBtnUnSelected col-xs-6' for='lte'></label><div for='lte' class='boosterUnSelectedTxt'>LTE</div><input type='radio' name='technologyType' value='lte' id='lte'/></div><div class='boosterLbl'>Select by Band (Advanced):</div><div class='cb'></div><div class='radioButtonWrapper'><label class='radioBtnWrapper radioBtnUnSelected col-xs-6' for='band3'></label><div for='band3' class='boosterUnSelectedTxt'>Band 3</div><input type='radio' name='technologyType' value='band3' id='band3'/></div><div class='radioButtonWrapper'><label class='radioBtnWrapper radioBtnUnSelected col-xs-6' for='band5'></label><div for='band5' class='boosterUnSelectedTxt'>Band 5</div><input type='radio' name='technologyType' value='band5' id='band5'/></div><div class='radioButtonWrapper'><label class='radioBtnWrapper radioBtnUnSelected col-xs-6' for='band28'></label><div for='band28' class='boosterUnSelectedTxt'>Band 28</div><input type='radio' name='technologyType' value='band28' id='band28'/></div></div></div></div></div>";
var dashboardPanelContent		= "<div class='dashboardPanel1'> <div class='col-xs-12 col-sm-3 userGreets'> Welcome back <span id='userDpName'></span> <br><span id='userDeviceStatusLine'>Things look </span> <span id='deviceStatus' class='good'></span> </div><div class='col-xs-12 col-sm-7 deviceDUO' id='deviceTypeBG'></div><div class='col-xs-12 col-sm-2 deviceSerialNumber'></div></div><div class='dashboardPanel2 w100'> <div class='col-xs-6 col-sm-3 dashboardContent'> <div id='gaugeContainer' class='graphicalRep'> <canvas id='boostGauge'></canvas> <div id='boosterLevel'>7</div></div><div class='dataTypeTitle'>BOOST</div></div><div class='col-xs-6 col-sm-3 dashboardContent'> <div id='signalStrengthContainer' class='graphicalRep'> <div class='signalContainer'> <div id='networkSignal1' class='networkSignalIndi activeStatus'></div><div id='networkSignal2' class='networkSignalIndi activeStatus'></div><div id='networkSignal3' class='networkSignalIndi activeStatus'></div><div id='networkSignal4' class='networkSignalIndi deactiveStatus'></div><div id='networkSignal5' class='networkSignalIndi deactiveStatus'></div></div></div><div class='dataTypeTitle'>NETWORK STREGNTH</div></div><div class='col-xs-6 col-sm-3 dashboardContent'> <div id='operatorContainer' class='graphicalRep'> <span>T-Mobile</span> </div><div class='dataTypeTitle'>OPERATOR</div></div><div class='col-xs-6 col-sm-3 dashboardContent'> <div id='coverageNamecontainer' class='graphicalRep'> <span>LTE</span> </div><div class='dataTypeTitle'>COVERAGE</div></div></div>";
var advancedPanelContent		= "<div class='advancedIcnContainer col-xs-12 col-sm-12' ><div id='sendIcnWrapper'><div id='sendIcn'></div><div class='advancedIcnLbl'>Send</div></div><div id='refreshIcnWrapper'><div id='refreshIcn'></div><div class='advancedIcnLbl'>Refresh</div></div></div><div class='cb'></div><div id='advancedContentwrapper'> <div class='panel-group' id='advancedDataContainer'> <div class='divider'>OVERVIEW</div><div class='panel panel-default col-sm-6'> <div class='panel-heading dropDown'> <h4 class='panel-title'><a data-toggle='collapse' data-parent='#advancedContentwrapper' href='#collapseOne'><div>Network Strength</div><span class='pull-right'> <span class='toggle-icon glyphicon glyphicon-chevron-up'></span></span></a></h4> </div><div id='collapseOne' class='panel-collapse collapse in'> <div class='panel-body'> <div id='networkDataContainer'> <div id='networkData1' class='col-xs-3 col-sm-3 networkData'> <div class='networkTitle'>A</div><div class='networkStrength'> <div class='signalContainerSM'> <div class='networkSignalIndiSM activeStatus networkBar1'></div><div class='networkSignalIndiSM activeStatus networkBar2'></div><div class='networkSignalIndiSM activeStatus networkBar3'></div><div class='networkSignalIndiSM deactiveStatus networkBar4'></div><div class='networkSignalIndiSM deactiveStatus networkBar5'></div></div></div><div class='networkStatus'> <div class='networkStatusLbl'>LTE</div><div class='networkFreq'>739 MHz</div></div></div><div id='networkData2' class='col-xs-3 col-sm-3 networkData'> <div class='networkTitle'>B</div><div class='networkStrength'> <div class='signalContainerSM'> <div class='networkSignalIndiSM activeStatus networkBar1'></div><div class='networkSignalIndiSM activeStatus networkBar2'></div><div class='networkSignalIndiSM activeStatus networkBar3'></div><div class='networkSignalIndiSM deactiveStatus networkBar4'></div><div class='networkSignalIndiSM deactiveStatus networkBar5'></div></div></div><div class='networkStatus'> <div class='networkStatusLbl'>LTE</div><div class='networkFreq'>739 MHz</div></div></div><div id='networkData3' class='col-xs-3 col-sm-3 networkData'> <div class='networkTitle'>C</div><div class='networkStrength'> <div class='signalContainerSM'> <div class='networkSignalIndiSM activeStatus networkBar1'></div><div class='networkSignalIndiSM activeStatus networkBar2'></div><div class='networkSignalIndiSM activeStatus networkBar3'></div><div class='networkSignalIndiSM activeStatus networkBar4'></div><div class='networkSignalIndiSM deactiveStatus networkBar5'></div></div></div><div class='networkStatus'> <div class='networkStatusLbl'>LTE</div><div class='networkFreq'>739 MHz</div></div></div><div id='networkData4' class='col-xs-3 col-sm-3 networkData'> <div class='networkTitle'>D</div><div class='networkStrength'> <div class='signalContainerSM'> <div class='networkSignalIndiSM activeStatus networkBar1'></div><div class='networkSignalIndiSM activeStatus networkBar2'></div><div class='networkSignalIndiSM deactiveStatus networkBar3'></div><div class='networkSignalIndiSM deactiveStatus networkBar4'></div><div class='networkSignalIndiSM deactiveStatus networkBar5'></div></div></div><div class='networkStatus'> <div class='networkStatusLbl'>LTE</div><div class='networkFreq'>739 MHz</div></div></div></div></div></div></div><div class='cb'></div><div class='divider'>SUPER CHANNELS</div><div class='firstGroup col-sm-6'> <div class='panel panel-default'> <div class='panel-heading drop-green dropDown'> <h4 class='panel-title'><a data-toggle='collapse' data-parent='#advancedContentwrapper' href='#collapseTwo'><div>Radio A Band 17: LTE (Boosting)</div><span class='pull-right'><span class='toggle-icon glyphicon glyphicon-chevron-down'></span></span></a></h4> </div><div id='collapseTwo' class='panel-collapse collapse'> <div class='panel-body'> <div class='dropDownList'> <div class='dropDownInnerTitle '> <div class='col-xs-8 col-sm-8'>Description</div><div class='col-xs-4 col-sm-4'>Value</div></div><div class='dropDownListValue'> <div class='col-xs-8 col-sm-8'>Bandwidth</div><div class='col-xs-4 col-sm-4'>0</div></div><div class='dropDownListValue'> <div class='col-xs-8 col-sm-8'>Download centre freq.</div><div class='col-xs-4 col-sm-4'>0</div></div><div class='dropDownListValue'> <div class='col-xs-8 col-sm-8'>Uplink centre freq.</div><div class='col-xs-4 col-sm-4'>0</div></div><div class='dropDownListValue'> <div class='col-xs-8 col-sm-8'>PRI Cell_ID</div><div class='col-xs-4 col-sm-4'>0</div></div><div class='dropDownListValue'> <div class='col-xs-8 col-sm-8'>Donor RSSI</div><div class='col-xs-4 col-sm-4'>0</div></div><div class='dropDownListValue'> <div class='col-xs-8 col-sm-8'>Donor RSCP</div><div class='col-xs-4 col-sm-4'>0</div></div><div class='dropDownListValue'> <div class='col-xs-8 col-sm-8'>Donor RSRQ</div><div class='col-xs-4 col-sm-4'>0</div></div><div class='dropDownListValue '> <div class='col-xs-8 col-sm-8'>Donor SINR</div><div class='col-xs-4 col-sm-4'>0</div></div><div class='dropDownListValue '> <div class='col-xs-8 col-sm-8'>Downlink [CU] TX powerc</div><div class='col-xs-4 col-sm-4'>0</div></div><div class='dropDownListValue '> <div class='col-xs-8 col-sm-8'>Uplink [NU] TX power</div><div class='col-xs-4 col-sm-4'>0</div></div><div class='dropDownListValue '> <div class='col-xs-8 col-sm-8'>Ext. antenna in use</div><div class='col-xs-4 col-sm-4'>0</div></div></div></div></div></div><div class='panel panel-default'> <div class='panel-heading drop-green dropDown'> <h4 class='panel-title'><a data-toggle='collapse' data-parent='#advancedContentwrapper' href='#collapseThree'><div>Radio B Band 4: LTE (Idle)</div><span class='pull-right'><span class='toggle-icon glyphicon glyphicon-chevron-down'></span></span></a></h4> </div><div id='collapseThree' class='panel-collapse collapse'> <div class='panel-body'> <div class='dropDownList'> <div class='dropDownInnerTitle '> <div class='col-xs-8 col-sm-8'>Description</div><div class='col-xs-4 col-sm-4'>Value</div></div><div class='dropDownListValue'> <div class='col-xs-8 col-sm-8'>Bandwidth</div><div class='col-xs-4 col-sm-4'>0</div></div><div class='dropDownListValue'> <div class='col-xs-8 col-sm-8'>Download centre freq.</div><div class='col-xs-4 col-sm-4'>0</div></div><div class='dropDownListValue'> <div class='col-xs-8 col-sm-8'>Uplink centre freq.</div><div class='col-xs-4 col-sm-4'>0</div></div><div class='dropDownListValue'> <div class='col-xs-8 col-sm-8'>PRI Cell_ID</div><div class='col-xs-4 col-sm-4'>0</div></div><div class='dropDownListValue'> <div class='col-xs-8 col-sm-8'>Donor RSSI</div><div class='col-xs-4 col-sm-4'>0</div></div><div class='dropDownListValue'> <div class='col-xs-8 col-sm-8'>Donor RSCP</div><div class='col-xs-4 col-sm-4'>0</div></div><div class='dropDownListValue'> <div class='col-xs-8 col-sm-8'>Donor RSRQ</div><div class='col-xs-4 col-sm-4'>0</div></div><div class='dropDownListValue '> <div class='col-xs-8 col-sm-8'>Donor SINR</div><div class='col-xs-4 col-sm-4'>0</div></div><div class='dropDownListValue '> <div class='col-xs-8 col-sm-8'>Downlink [CU] TX powerc</div><div class='col-xs-4 col-sm-4'>0</div></div><div class='dropDownListValue '> <div class='col-xs-8 col-sm-8'>Uplink [NU] TX power</div><div class='col-xs-4 col-sm-4'>0</div></div><div class='dropDownListValue '> <div class='col-xs-8 col-sm-8'>Ext. antenna in use</div><div class='col-xs-4 col-sm-4'>0</div></div></div></div></div></div></div><div class='secondGroup col-sm-6'> <div class='panel panel-default'> <div class='panel-heading drop-red dropDown'> <h4 class='panel-title'> <a data-toggle='collapse' data-parent='#advancedContentwrapper' href='#collapseFour'> <div>Radio C: Unused</div><span class='pull-right'> <span class='toggle-icon glyphicon glyphicon-chevron-down'></span> </span> </a> </h4> </div><div id='#collapseFour' class='panel-collapse collapse'> <div class='panel-body'> <div class='dropDownList'> <div class='dropDownInnerTitle '> <div class='col-xs-8 col-sm-8'>Description</div><div class='col-xs-4 col-sm-4'>Value</div></div><div class='dropDownListValue'> <div class='col-xs-8 col-sm-8'>Bandwidth</div><div class='col-xs-4 col-sm-4'>0</div></div><div class='dropDownListValue'> <div class='col-xs-8 col-sm-8'>Download centre freq.</div><div class='col-xs-4 col-sm-4'>0</div></div><div class='dropDownListValue'> <div class='col-xs-8 col-sm-8'>Uplink centre freq.</div><div class='col-xs-4 col-sm-4'>0</div></div><div class='dropDownListValue'> <div class='col-xs-8 col-sm-8'>PRI Cell_ID</div><div class='col-xs-4 col-sm-4'>0</div></div><div class='dropDownListValue'> <div class='col-xs-8 col-sm-8'>Donor RSSI</div><div class='col-xs-4 col-sm-4'>0</div></div><div class='dropDownListValue'> <div class='col-xs-8 col-sm-8'>Donor RSCP</div><div class='col-xs-4 col-sm-4'>0</div></div><div class='dropDownListValue'> <div class='col-xs-8 col-sm-8'>Donor RSRQ</div><div class='col-xs-4 col-sm-4'>0</div></div><div class='dropDownListValue '> <div class='col-xs-8 col-sm-8'>Donor SINR</div><div class='col-xs-4 col-sm-4'>0</div></div><div class='dropDownListValue '> <div class='col-xs-8 col-sm-8'>Downlink [CU] TX powerc</div><div class='col-xs-4 col-sm-4'>0</div></div><div class='dropDownListValue '> <div class='col-xs-8 col-sm-8'>Uplink [NU] TX power</div><div class='col-xs-4 col-sm-4'>0</div></div><div class='dropDownListValue '> <div class='col-xs-8 col-sm-8'>Ext. antenna in use</div><div class='col-xs-4 col-sm-4'>0</div></div></div></div></div></div><div class='panel panel-default'> <div class='panel-heading drop-red dropDown'> <h4 class='panel-title'> <a data-toggle='collapse' data-parent='#advancedContentwrapper' href='#collapseFive'> <div>Radio D: Unused</div><span class='pull-right'> <span class='toggle-icon glyphicon glyphicon-chevron-down'></span> </span> </a> </h4> </div><div id='#collapseFive' class='panel-collapse collapse'> <div class='panel-body'> <div class='dropDownList'> <div class='dropDownInnerTitle '> <div class='col-xs-8 col-sm-8'>Description</div><div class='col-xs-4 col-sm-4'>Value</div></div><div class='dropDownListValue'> <div class='col-xs-8 col-sm-8'>Bandwidth</div><div class='col-xs-4 col-sm-4'>0</div></div><div class='dropDownListValue'> <div class='col-xs-8 col-sm-8'>Download centre freq.</div><div class='col-xs-4 col-sm-4'>0</div></div><div class='dropDownListValue'> <div class='col-xs-8 col-sm-8'>Uplink centre freq.</div><div class='col-xs-4 col-sm-4'>0</div></div><div class='dropDownListValue'> <div class='col-xs-8 col-sm-8'>PRI Cell_ID</div><div class='col-xs-4 col-sm-4'>0</div></div><div class='dropDownListValue'> <div class='col-xs-8 col-sm-8'>Donor RSSI</div><div class='col-xs-4 col-sm-4'>0</div></div><div class='dropDownListValue'> <div class='col-xs-8 col-sm-8'>Donor RSCP</div><div class='col-xs-4 col-sm-4'>0</div></div><div class='dropDownListValue'> <div class='col-xs-8 col-sm-8'>Donor RSRQ</div><div class='col-xs-4 col-sm-4'>0</div></div><div class='dropDownListValue '> <div class='col-xs-8 col-sm-8'>Donor SINR</div><div class='col-xs-4 col-sm-4'>0</div></div><div class='dropDownListValue '> <div class='col-xs-8 col-sm-8'>Downlink [CU] TX powerc</div><div class='col-xs-4 col-sm-4'>0</div></div><div class='dropDownListValue '> <div class='col-xs-8 col-sm-8'>Uplink [NU] TX power</div><div class='col-xs-4 col-sm-4'>0</div></div><div class='dropDownListValue '> <div class='col-xs-8 col-sm-8'>Ext. antenna in use</div><div class='col-xs-4 col-sm-4'>0</div></div></div></div></div></div></div><div class='cb'></div><div class='divider'>SYSTEM OVERVIEW</div><div class='panel panel-default col-sm-6'> <div class='panel-heading drop-violet dropDown'> <h4 class='panel-title'> <a data-toggle='collapse' data-parent='#advancedContentwrapper' href='#collapseSix'> <div>Device State</div><span class='pull-right'> <span class='toggle-icon glyphicon glyphicon-chevron-down'></span> </span> </a> </h4> </div><div id='collapseSix' class='panel-collapse collapse'> <div class='panel-body'> <div class='dropDownList'> <div class='dropDownInnerTitle '> <div class='col-xs-8 col-sm-8'>Description</div><div class='col-xs-4 col-sm-4'>Value</div></div><div class='dropDownListValue'> <div class='col-xs-8 col-sm-8'>Bandwidth</div><div class='col-xs-4 col-sm-4'>0</div></div><div class='dropDownListValue'> <div class='col-xs-8 col-sm-8'>Download centre freq.</div><div class='col-xs-4 col-sm-4'>0</div></div><div class='dropDownListValue'> <div class='col-xs-8 col-sm-8'>Uplink centre freq.</div><div class='col-xs-4 col-sm-4'>0</div></div><div class='dropDownListValue'> <div class='col-xs-8 col-sm-8'>PRI Cell_ID</div><div class='col-xs-4 col-sm-4'>0</div></div><div class='dropDownListValue'> <div class='col-xs-8 col-sm-8'>Donor RSSI</div><div class='col-xs-4 col-sm-4'>0</div></div><div class='dropDownListValue'> <div class='col-xs-8 col-sm-8'>Donor RSCP</div><div class='col-xs-4 col-sm-4'>0</div></div><div class='dropDownListValue'> <div class='col-xs-8 col-sm-8'>Donor RSRQ</div><div class='col-xs-4 col-sm-4'>0</div></div><div class='dropDownListValue '> <div class='col-xs-8 col-sm-8'>Donor SINR</div><div class='col-xs-4 col-sm-4'>0</div></div><div class='dropDownListValue '> <div class='col-xs-8 col-sm-8'>Downlink [CU] TX powerc</div><div class='col-xs-4 col-sm-4'>0</div></div><div class='dropDownListValue '> <div class='col-xs-8 col-sm-8'>Uplink [NU] TX power</div><div class='col-xs-4 col-sm-4'>0</div></div><div class='dropDownListValue '> <div class='col-xs-8 col-sm-8'>Ext. antenna in use</div><div class='col-xs-4 col-sm-4'>0</div></div></div></div></div></div><div class='cb'></div><div class='divider'>TECH DATA</div><div class='panel panel-default col-sm-6'> <div class='panel-heading drop-yellow dropDown'> <h4 class='panel-title'> <a data-toggle='collapse' data-parent='#advancedContentwrapper' href='#collapseSeven'> <div>Stuff you won't understand</div><span class='pull-right'> <span class='toggle-icon glyphicon glyphicon-chevron-down'></span> </span> </a> </h4> </div><div id='collapseSeven' class='panel-collapse collapse'> </div></div><div class='cb'></div><div class='divider'>DEVICE VERSION</div><div class='panel panel-default col-sm-6'> <div class='panel-heading drop-lite-green dropDown'> <h4 class='panel-title'> <a data-toggle='collapse' data-parent='#advancedContentwrapper' href='#collapseTeehree'> <div>Software Versions</div><span class='pull-right'> <span class='toggle-icon glyphicon glyphicon-chevron-down'></span> </span> </a> </h4> </div><div id='collapseTeehree' class='panel-collapse collapse'> <div class='panel-body'> <div class='dropDownList'> <div class='dropDownInnerTitle '> <div class='col-xs-8 col-sm-8'>Description</div><div class='col-xs-4 col-sm-4'>Value</div></div><div class='dropDownListValue'> <div class='col-xs-8 col-sm-8'>Bandwidth</div><div class='col-xs-4 col-sm-4'>0</div></div><div class='dropDownListValue'> <div class='col-xs-8 col-sm-8'>Download centre freq.</div><div class='col-xs-4 col-sm-4'>0</div></div><div class='dropDownListValue'> <div class='col-xs-8 col-sm-8'>Uplink centre freq.</div><div class='col-xs-4 col-sm-4'>0</div></div><div class='dropDownListValue'> <div class='col-xs-8 col-sm-8'>PRI Cell_ID</div><div class='col-xs-4 col-sm-4'>0</div></div><div class='dropDownListValue'> <div class='col-xs-8 col-sm-8'>Donor RSSI</div><div class='col-xs-4 col-sm-4'>0</div></div><div class='dropDownListValue'> <div class='col-xs-8 col-sm-8'>Donor RSCP</div><div class='col-xs-4 col-sm-4'>0</div></div><div class='dropDownListValue'> <div class='col-xs-8 col-sm-8'>Donor RSRQ</div><div class='col-xs-4 col-sm-4'>0</div></div><div class='dropDownListValue '> <div class='col-xs-8 col-sm-8'>Donor SINR</div><div class='col-xs-4 col-sm-4'>0</div></div><div class='dropDownListValue '> <div class='col-xs-8 col-sm-8'>Downlink [CU] TX powerc</div><div class='col-xs-4 col-sm-4'>0</div></div><div class='dropDownListValue '> <div class='col-xs-8 col-sm-8'>Uplink [NU] TX power</div><div class='col-xs-4 col-sm-4'>0</div></div><div class='dropDownListValue '> <div class='col-xs-8 col-sm-8'>Ext. antenna in use</div><div class='col-xs-4 col-sm-4'>0</div></div></div></div></div></div></div></div>";
var topHorizontalMenu			= "<div class='headerContainer' id='headerContainer'> <div class='titlebarWrapper'> <div class='sliderMenuWrapper col-xs-2 col-sm-2'> <a href='#menu' class='menu-link'> <div class='sliderMenuIcn'></div></a> </div><div class='logoWrapper col-xs-8 col-sm-8'> <div class='logoImg'></div></div><div class='faqIcnWrapper col-xs-2 col-sm-2'> <div class='faqIcn'></div></div></div><div class='menuWrapper'> <div class='col-xs-4 col-sm-2 selectedTab' id='dashboardMenu'> <div>DASHBOARD</div></div><div class='col-xs-4 col-sm-2' id='settingsMenu'> <div>SETTINGS</div></div><div class='col-xs-4 col-sm-2' id='advancedMenu'> <div>ADVANCED</div></div></div></div><div class='cb'></div><div id='bodyContainer'></div>";
var mainContainerWithMenu		= "<div id='menu' class='panelMenu' role='navigation'> <div class='panelLogoWrapper'> <div class='panelLogo'></div></div><div class='panelMenuList'> <ul> <li> <a id='' href='javascript:void(0)'> <div class='menuIcns' id='finderIcn'></div><span>Signal Finder</span><div class='cb'></div></a> </li><li> <a id='' href='javascript:void(0)'> <div class='menuIcns' id='aboutIcn'></div><span>About</span><div class='cb'></div></a> </li><li> <a id='' href='javascript:void(0)'> <div class='menuIcns' id='feedBackIcn'></div><span>Send Feedback</span><div class='cb'></div></a> </li><li> <a id='' href='javascript:void(0)'> <div class='menuIcns' id='policyIcn'></div><span>Privacy Policy</span><div class='cb'></div></a> </li><li> <a id='' href='javascript:void(0)'> <div class='menuIcns' id='registerIcn'></div><span>Register Booster</span><div class='cb'></div></a> </li></ul> </div><div class='socialLinkWrapper'> <div class='socialLinkTitle'>Follow us:</div><div class='socialLinkIcnWrapper'> <div class='socialIcns' id='facebookIcn'></div><div class='socialIcns' id='twitterIcn'></div><div class='socialIcns' id='linkedinIcn'></div><div class='socialIcns' id='googleIcn'></div></div></div></div><div id='mainContainer' class='push'></div>";
var mainContainerWithoutMenu	= "<div id='mainContainer'></div>";
var mainContainerDisplayFlag	= 0;
var mainLoopCounter				= 0;
var mainScreenSelectedTab		= "";

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
        PrintLog(1, "GUI: ProcessMainView()");
        if(mainContainerDisplayFlag == 1){
    		if(mainScreenSelectedTab==""){
    			$('body').html(mainContainerWithMenu);
    			
    			mainContainer = document.getElementById("mainContainer");
    	    	if(window.localStorage.getItem("deviceType")=="phone"){
    		    	mainContainer.style.height = deviceHeight+"px";
    				mainContainer.style.width = deviceWidth+"px";
    		    }
    	    	$('#mainContainer').html(topHorizontalMenu);
    	    	$('#bodyContainer').html(dashboardPanelContent);
    	    	$('.menu-link').bigSlide();
    	    	util.topMenuEvents();
    	    	mainScreenSelectedTab = "dashboard";
    	    	util.loadBodyContainer(mainScreenSelectedTab);
    		}else{
    			util.loadBodyContainer(mainScreenSelectedTab);
    		}
    	}else{
    		$('body').html(mainContainerWithoutMenu);
    		
    		mainContainer = document.getElementById("mainContainer");
        	if(window.localStorage.getItem("deviceType")=="phone"){
    	    	mainContainer.style.height = deviceHeight+"px";
    			mainContainer.style.width = deviceWidth+"px";
    	    }
        	var mainViewContent = null;
        	mainContainer.classList.add("connectionBG");
    	}
    	$('.faqIcnWrapper').bind("click",function() {			
			util.showHelpMenu();
    	});
        lastGuiCurrentMode = guiCurrentMode;   
    }

    // Update the button status...   
    /*if( guiMainButtonsDisabled == false )
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
    
        // Display the settings button if the External Antenna selection is available or if we are on a GO product with BoosterFlag set.
        if( lastGuiButtonStDisplay != (guiAntennaFlag | guiBoosterFlag) )
        {
            // Add the Settings Button...had to use a div in case settins button not displayed and reg button displayed.
            document.getElementById("st_button_div_id").innerHTML = "<button id='st_button_id'  type='button' class='mybutton' onclick='RequestModeChange(PROG_MODE_SETTINGS)'><img src='img/button_Settings.png' /></button>";
            document.getElementById("st_button_id").disabled  = false;
            document.getElementById("st_button_id").addEventListener('touchstart', HandleButtonDown );
            document.getElementById("st_button_id").addEventListener('touchend',   HandleButtonUp );
            
            lastGuiButtonStDisplay = (guiAntennaFlag | guiBoosterFlag);
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
    }*/
}
// End of Main processing...........................................................................................








// ProcessRegistrationView............................................................................................
function ProcessRegistrationView()
{
    if( lastGuiCurrentMode != guiCurrentMode )
    {
        PrintLog(1, "ProcessRegistrationView()");

        // Draw the view...
        /*var myUniiIcon = (bUniiStatusKnown == false) ? szUniiIconButton + "</button>"  : bUniiUp ? szUniiIconButton + szUniiIconUp + "</button>" : szUniiIconButton + szUniiIconDown + "</button>";
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
        document.getElementById("back_button_id").addEventListener('touchend',   HandleButtonUp );*/
        
        
        bProgBarDisplayed = false;
       
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
    PrintLog(1, "Reg: Reg key pressed, validating user data.");

                            
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
var UniiLabels       = ["CU 5G DL", "CU 5G UL", "CU UNII State", "NU RSSI", "CU RSSI", "NU Tx Pwr", "CU Tx Pwr", "CU BER", "CU Metric", "NU Dist Metric", "CU Build ID"];   
var CellDetailLabels = ["ID", "DL Freq", "RSCP", "ECIO"];   
var LteDetailLabels  = ["Lte ID", "Lte Freq", "RSRP", "RSRQ", "SINR", "Lte Ant", "Freq Err Res", "Freq Err Tot", "MP Early", "CFI BER", "HARQ Comb", "SIB 1 Cnt"];   


function ProcessTechView()
{
    if( lastGuiCurrentMode != guiCurrentMode )
    {
        PrintLog(1, "GUI: ProcessTechView()");

        // Draw the view...
        var myUniiIcon = (bUniiStatusKnown == false) ? szUniiIconButton + "</button>"  : bUniiUp ? szUniiIconButton + szUniiIconUp + "</button>" : szUniiIconButton + szUniiIconDown + "</button>";
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
        var myUniiIcon = (bUniiStatusKnown == false) ? szUniiIconButton + "</button>"  : bUniiUp ? szUniiIconButton + szUniiIconUp + "</button>" : szUniiIconButton + szUniiIconDown + "</button>";
        var mySbIfIcon = isSouthBoundIfCnx ? szSbIfIconButton + szSbIfIconOn + "</button>" : szSbIfIconButton + szSbIfIconOff + "</button>";
        var myRegIcon  = (nxtyRxRegLockStatus == 0x00) ? szRegIconButton + "</button>" : isRegistered ? szRegIconButton + szRegIconReg + "</button>" : szRegIconButton + szRegIconNotReg + "</button>";

                
        var myHtml = 
            "<img class='head_top' src='img/header_settings.png' width='100%' />" +
            "<button id='back_button_id' type='button' class='back_icon' onclick='RequestModeChange(PROG_MODE_MAIN)'><img src='img/go_back.png'/></button>"+
            myRegIcon +
            mySbIfIcon +
            myUniiIcon +
            "<br><br><br><br>";
            
            
            
            if( guiAntennaFlag )
            {
                myHtml +=  "<br>" +
                 
                "<div>" +
                
                
                
                "<table id='stgTable' align='center'>" +
                "<tr> <th style='padding: 8px;' colspan='4'>Antenna Selection</th></tr>" +
                "<tr> <th></th>  <th></th> <th>Auto</th> <th>Manual</th> </tr>" +
                "<tr> <td></td>  <td style='padding: 8px;'>Control</td>  <td><input type='radio' id='ba_id' name='AutoMan' class='myRdBtn' onclick='SetAntenna(0x0020)'></td> <td><input type='radio' id='bm_id' name='AutoMan' class='myRdBtn' onclick='SetAntenna(0x2000)'></td> </tr>" +
                 
                "<tr> <th></th>  <th style='padding: 8px;'>bd (MHz)</th> <th>Internal</th> <th>External</th> </tr>" +
                "<tr> <td style='padding: 8px;'>A</td> <td id='b0'>bd: </td>  <td><input type='radio' id='bi_id0' name='bdA' class='myRdBtn' onclick='SetAntenna(0x0002)'></td> <td><input type='radio' id='be_id0' name='bdA' class='myRdBtn' onclick='SetAntenna(0x0200)'></td> </tr>" +
                "<tr> <td style='padding: 8px;'>B</td> <td id='b1'>bd: </td>  <td><input type='radio' id='bi_id1' name='bdB' class='myRdBtn' onclick='SetAntenna(0x0004)'></td> <td><input type='radio' id='be_id1' name='bdB' class='myRdBtn' onclick='SetAntenna(0x0400)'></td> </tr>" +
                "<tr> <td style='padding: 8px;'>C</td> <td id='b2'>bd: </td>  <td><input type='radio' id='bi_id2' name='bdC' class='myRdBtn' onclick='SetAntenna(0x0008)'></td> <td><input type='radio' id='be_id2' name='bdC' class='myRdBtn' onclick='SetAntenna(0x0800)'></td> </tr>" +
                "<tr> <td style='padding: 8px;'>D</td> <td id='b3'>bd: </td>  <td><input type='radio' id='bi_id3' name='bdD' class='myRdBtn' onclick='SetAntenna(0x0010)'></td> <td><input type='radio' id='be_id3' name='bdD' class='myRdBtn' onclick='SetAntenna(0x1000)'></td> </tr>" +
                "</table> </div>" +            
         
                "<p style='text-align: center;'><button id='reset_button_id'  style='width: 35%; font-size: 20px;' type='button' onclick='ResetNu()'>Reset NU</button>";
            }

            if( guiBoosterFlag )
            {
                myHtml +=  "<br>" +
                 
                "<div>" +
                
                "<table id='goTable' align='center'>" +
                "<tr> <th style='padding: 8px;' colspan='4'>GO Mode Selection</th></tr>" +
                "<tr> <th>Mode</th> <th>Sel</th> <th>Mode</th> <th>Sel</th> </tr>" +
                "<tr>" +
                    "<td style='padding: 8px;'>Auto</td>             <td><input type='radio' id='b0_id' name='AutoBand' class='myRdBtn' onclick='SetBooster(0)'></td>" + 
                    "<td id='band_id0'>Band A</td>                   <td><input type='radio' id='b3_id' name='AutoBand' class='myRdBtn' onclick='SetBooster(3)'></td>" +
                "</tr>" + 
                "<tr>" +
                    "<td style='padding: 8px;'>3G</td>               <td><input type='radio' id='b1_id' name='AutoBand' class='myRdBtn' onclick='SetBooster(1)'></td>" +
                    "<td id='band_id1'>Band B</td>                   <td><input type='radio' id='b4_id' name='AutoBand' class='myRdBtn' onclick='SetBooster(4)'></td>" +
                "</tr>" + 
                "<tr>" +
                    "<td style='padding: 8px;'>4G/4GX</td>           <td><input type='radio' id='b2_id' name='AutoBand' class='myRdBtn' onclick='SetBooster(2)'></td>" +
                    "<td id='band_id2'>Band C</td>                   <td><input type='radio' id='b5_id' name='AutoBand' class='myRdBtn' onclick='SetBooster(5)'></td>" +
                "</tr>" +
                "</table> </div>";            
            }

     
            myHtml += szMyStatusLine;

        $('body').html(myHtml);  
        
    
        // Make sure all buttons are disabled until we get up and running...    
        if( guiAntennaFlag )
        {
            disableAntButtons();
            ShowAlertPopUpMsg("Cycle NU Power.", "Please cycle power on the Network Unit in order for antenna changes to take effect.");
        }
         
        document.getElementById("sb_icon_id").addEventListener('touchstart',   HandleButtonUp );      // up, adds transparency
        document.getElementById("sb_icon_id").addEventListener('touchend',     HandleButtonDown );    // down, back to normal, no transparency
        document.getElementById("reg_icon_id").addEventListener('touchstart',  HandleButtonUp );      // up, adds transparency
        document.getElementById("reg_icon_id").addEventListener('touchend',    HandleButtonDown );    // down, back to normal, no transparency
        document.getElementById("unii_icon_id").addEventListener('touchstart', HandleButtonUp );      // up, adds transparency
        document.getElementById("unii_icon_id").addEventListener('touchend',   HandleButtonDown );    // down, back to normal, no transparency
                 
        document.getElementById("back_button_id").addEventListener('touchstart', HandleButtonDown );
        document.getElementById("back_button_id").addEventListener('touchend',   HandleButtonUp );
        
        
        lastGuiCurrentMode = guiCurrentMode;    
    }
    
    if( guiSettingsDirtyFlag == true )
    {
        if( guiAntennaFlag )
        {
            updateAntButtons();
        }
        
        if( guiBoosterFlag )
        {
            updateBoosterButtons();
        }
        
        guiSettingsDirtyFlag = false;   // OK for GUI code to set to false... 
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



function updateBoosterButtons()
{
    var i;
    
    if( guiBoosterCurrentMode == GO_MODE_AUTO )                 
    {
        document.getElementById("b0_id").checked = true;
    }
    else if( guiBoosterCurrentMode == GO_MODE_3G )                 
    {
        document.getElementById("b1_id").checked = true;
    }
    else if( guiBoosterCurrentMode == GO_MODE_4G )                 
    {
        document.getElementById("b2_id").checked = true;
    }
    else if( guiBoosterCurrentMode == GO_MODE_BAND_A )                 
    {
        document.getElementById("b3_id").checked = true;
    }
    else if( guiBoosterCurrentMode == GO_MODE_BAND_B )                 
    {
        document.getElementById("b4_id").checked = true;
    }
    else if( guiBoosterCurrentMode == GO_MODE_BAND_C )                 
    {
        document.getElementById("b5_id").checked = true;
    }
    
    for( i = 0; i < guiBoosterBands.length; i++ )
    {
        if( guiBoosterBands[i] )
        {
            var myId = "band_id" + i;
            document.getElementById(myId).innerHTML = "Band: " + guiBoosterBands[i];
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
        var myUniiIcon = (bUniiStatusKnown == false) ? szUniiIconButton + "</button>"  : bUniiUp ? szUniiIconButton + szUniiIconUp + "</button>" : szUniiIconButton + szUniiIconDown + "</button>";
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
            		util.getCurrentLocationPrompt(this.szMsg);
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
                // window.plugins.spinnerDialog.show(null, this.szMsg, true);
            	util.createCommonSpinnerDialog(this.szMsg);
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
                //window.plugins.spinnerDialog.hide();
            	util.hideCommonSpinnerDialog();
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
                //navigator.notification.alert(this.szMsg, null, this.szTitle, 'ok');
            		util.showErrorPopup();
            		//var popupTitle = this.szTitle;
            		var alertHeader = document.getElementById("popupHeader");
                	var alertBody = document.getElementById("popupBody");
                	var alertFooter = document.getElementById("popupFooter");
                	alertFooter.align = "center";
                	
                	alertHeader.innerHTML = this.szTitle;
                	alertBody.innerHTML = this.szMsg;
                	
                	var locBtn = util.createAppendElem("button", "alertOKBtn", "defaultButton", alertFooter);
    		        locBtn.innerHTML = "OK";
    		        locBtn.addEventListener("click", function(){
    		        	if(alertPopUpObj.szTitle == "Registration Required."){
    		        		RequestModeChange(PROG_MODE_REGISTRATION);
    		        	}else{
    		        		util.hideCommonPopup();
    		        	}
    		        }, false);
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
    	util.hideCommonPopup();
    	this.createBlackOverlay();
    	this.createCommonPopup();
    },
    
    createBlackOverlay: function(){
    	util.removeElement('blackOverlay');
    	util.createAppendElem("div", "blackOverlay", "", mainContainer);
    },
    
    createCommonPopup: function(){
    	util.removeElement('commonPopup');
    	var popupContainer = util.createAppendElem("div", "commonPopup", "commonPopup", mainContainer);
    	var popElem = document.getElementById("commonPopup");
    	this.createAppendElem("div", "popupHeader", "", popElem);
    	this.createAppendElem("div", "popupBody", "", popElem);
    	this.createAppendElem("div", "popupFooter", "", popElem);
    },
    
    createCommonSpinnerDialog: function(sText){
    	util.hideCommonSpinnerDialog();
    	util.createBlackOverlay();
    	var popupContainer = util.createAppendElem("div", "spinnerDialog", "spinnerDialog", mainContainer);
    	var popElem = document.getElementById("spinnerDialog");
    	this.createAppendElem("div", "spinnerImgContainer", "spinnerImgContainer waitLoader fl", popElem);
    	var spinnerTextContainer = this.createAppendElem("div", "spinnerTextContainer", "spinnerTextContainer fl", popElem);
    	spinnerTextContainer.innerHTML = "<span>"+sText+"</span>";
    },
    
    alignElementCenter : function(uiElem){
    	var elemHeight = uiElem.clientHeight;
    	var elemWidth = uiElem.clientWidth;
    	var remHeight = parseInt((deviceHeight - elemHeight)/2);
    	var remWidth = parseInt((deviceWidth - elemWidth)/2);
    	uiElem.style.marginTop = remHeight + "px !important";
    	uiElem.style.marginLeft = remWidth + "px !important";
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
    	console.log(typeof searchTimeOut);
    	if(typeof searchTimeOut != "undefined"){
    		clearTimeout(searchTimeOut);
    	}
    	util.removeElement("searchBoxContainer");
    	util.removeElement("searchIconContainer");
    	util.removeElement("searchMessageBox");
    	mainContainer.innerHTML = "";
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
    	searchTimeOut = setTimeout(function(){ util.showNoDeviceFoundErrorPopup(); }, 120*1000);
    	//searchTimeOut = setTimeout(function(){ util.showNoDeviceFoundErrorPopup(); }, 30*1000);
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
    	mainContainerDisplayFlag = 1;
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
	},
	
	showNoDeviceFoundErrorPopup: function(){
		util.removeElement("searchBoxContainer");
    	util.removeElement("searchIconContainer");
    	util.removeElement("searchMessageBox");
	    util.showErrorPopup();
		var nodeviceHeader = document.getElementById("popupHeader");
    	var nodeviceBody = document.getElementById("popupBody");
    	var nodeviceFooter = document.getElementById("popupFooter");
    	nodeviceHeader.className = "nodeviceHeader";
    	nodeviceBody.className = "nodeviceBody";
    	nodeviceFooter.className = "nodeviceFooter";
    	nodeviceFooter.align = "center";
    	
    	nodeviceHeader.innerHTML = "Sorry, couldn't find any boosters";
    	nodeviceBody.innerHTML = "There are many reasons why the connection could fail. Please refer to our Help pages for troubleshooting tips.";
    	
    	var tryAgainBtn = util.createAppendElem("button", "noDeviceTryAgnBtn", "defaultButton fr", nodeviceFooter);
    	tryAgainBtn.innerHTML = "Try Again";
    	tryAgainBtn.addEventListener("click", function(){
    		util.hideCommonPopup();
    		util.showSearchAnimation();
    	}, false);
    	
    	var trblShtBtn = util.createAppendElem("button", "trblShtBtn", "trblShtBtn defaultButton fl", nodeviceFooter);
    	trblShtBtn.innerHTML = "Troubleshooting";
    	
    	isSouthBoundIfCnx = false;
    	StartBluetoothScan();
	},
	
	getCurrentLocationPrompt: function(msg){
    	util.createBlackOverlay();
    	util.createPromptPopup();
    	var promptElem = document.getElementById("promptPopup");
    	util.modifyLocationAccessPrompt(msg);
    },
    
    modifyLocationAccessPrompt: function(msg){
    	var promptBody = document.getElementById("promptBody");
    	var promptFooter = document.getElementById("promptFooter");
    	promptBody.innerHTML = msg;
    	var buttonDiv1 = util.createAppendElem("div", "buttonDiv1", "w50 h100", promptFooter);
    	var buttonDiv2 = util.createAppendElem("div", "buttonDiv2", "w50 h100", promptFooter);
    	var button1 = util.createAppendElem("div", "denyBtn", "w100 h100", buttonDiv1);
    	var button2 = util.createAppendElem("div", "allowBtn", "w100 h100", buttonDiv2);
    	button1.innerHTML = "Don't Allow";
    	button2.innerHTML = "OK";
    	button1.addEventListener("click", function(){
    		util.hidePromptBox();
    		HandleConfirmLocation(2);
    	}, false);
    	button2.addEventListener("click", function(){
    		util.hidePromptBox();
    		HandleConfirmLocation(1);
    	}, false);
    },
    
    createPromptPopup: function(){
   		this.removeElement("promptPopup");
    	var popupContainer = document.createElement("div");
    	popupContainer.id = "promptPopup";
    	popupContainer.className = "promptPopup";
    	mainContainer.appendChild(popupContainer);
    	var popElem = document.getElementById("promptPopup");
    	this.createAppendElem("div", "promptBody", "", popElem);
    	this.createAppendElem("div", "promptFooter", "", popElem);
    },
    
    hideCommonPopup: function(){
    	util.removeElement("commonPopup");
    	util.removeElement("blackOverlay");
    },
    
    hidePromptBox: function(){
    	util.removeElement("promptPopup");
    	util.removeElement("blackOverlay");
    },
    
    hideCommonSpinnerDialog: function(){
    	util.removeElement("spinnerDialog");
    	util.removeElement("blackOverlay");
    },
    
    showGauge: function(gValue){
		var opts = {
			lines: 12,
			angle: 0.1,
			lineWidth: 0.35,
			pointer: {
				length: 0,
				strokeWidth: 0,
				color: 'white'
			},
			limitMax: 'false', 
			percentColors: [[0.0, "#8BC34A" ], [0.50, "#8BC34A"], [1.0, "#8BC34A"]],
			strokeColor: '#F5F3F3',
			generateGradient: true
		};
		var target = document.getElementById('boostGauge');
		var gauge = new Gauge(target).setOptions(opts);
		gauge.maxValue = 9
		gauge.animationSpeed = 2;
		gauge.set(gValue);
	},
	
	dropdownToggle: function(){
		$('a[data-toggle="collapse"]').click(function () {
			$('span.toggle-icon').not($(this).find('span.toggle-icon')).removeClass('glyphicon-chevron-up');
			$('span.toggle-icon').not($(this).find('span.toggle-icon')).addClass('glyphicon-chevron-down');
			$(this).find('span.toggle-icon').toggleClass('glyphicon-chevron-up glyphicon-chevron-down');
		});
	},
	
	settingsSelectToggle: function(){
		$('.operatorList').click(function (e) {
			e.preventDefault();					
			$('.operatorListWrapper > ul').toggle();
		});
		
		$('#operatorTitle').click(function (e) {
			e.preventDefault();					
			$('.operatorListWrapper > ul').css('display', 'none');
		});
						
		$('.deviceList').click(function (e) {
			e.preventDefault();					
			$('.deviceListWrapper > ul').toggle();
		});
		
		$('#deviceTitle').click(function (e) {
			e.preventDefault();					
			$('.deviceListWrapper > ul').css('display', 'none');
		});
		
		$(".menu-toggle").click(function(e) {
       	 	e.preventDefault();
    		$("#wrapper").toggleClass("toggled");
		});			
		
		$(document.body).on('click', '.operatorListWrapper > ul li', function(event) {
			var $target = $(event.currentTarget);											
			$('#operatorVal').html($target.text());      								
			return false;
		});	
		
		$(document.body).on('click', '.deviceListWrapper > ul li', function(event) {
			var $target = $(event.currentTarget);											
			$('#deviceVal').html($target.text());      								
			return false;
		});	
	},
	
	topMenuEvents: function(){
		$('#dashboardMenu').click(function(){
		    $(".menuWrapper").find(".selectedTab").removeClass("selectedTab");
			util.loadBodyContainer('dashboard');
			$('#dashboardMenu').addClass("selectedTab");
		});
		$('#settingsMenu').click(function(){
		    $(".menuWrapper").find(".selectedTab").removeClass("selectedTab");
			util.loadBodyContainer('settings');
			$('#settingsMenu').addClass("selectedTab");
		});
		$('#advancedMenu').click(function(){
		    $(".menuWrapper").find(".selectedTab").removeClass("selectedTab");
			util.loadBodyContainer('advanced');
			$('#advancedMenu').addClass("selectedTab");
		});
	},
	
	loadBodyContainer: function(menuElem){
		mainScreenSelectedTab = menuElem;
		if(menuElem == "dashboard"){$('#bodyContainer').html(dashboardPanelContent);}
		else if(menuElem == "settings"){
			if(deviceType == "phone"){
				$('#bodyContainer').html(settingsPanelContentMobile);
			}else{
				$('#bodyContainer').html(settingsPanelContentTablet);
			}
		}
		else if(menuElem == "advanced"){$('#bodyContainer').html(advancedPanelContent);}
		util.updateContainerElements(menuElem);
	},
	
	updateContainerElements: function(menuElem){
		
		/*UI element updates for Dashboard view*/
		if(menuElem == "dashboard"){
			if(szRegFirstName!=""){
				$('#userDpName').html(szRegFirstName+",");
			}
			
			if(guiBoost >= 0 && guiBoost <= 3){
				$('#userDeviceStatusLine').html("Looks like there's a ");
				$('#deviceStatus').html('problem');
				$('#deviceStatus').removeClass().addClass('problem');
			}
			else if(guiBoost >= 4 && guiBoost <= 5){
				$('#userDeviceStatusLine').html("Things look ");
				$('#deviceStatus').html('poor');
				$('#deviceStatus').removeClass().addClass('problem');
			}
			else if(guiBoost >= 6 && guiBoost <= 7){
				$('#userDeviceStatusLine').html("Things look ");
				$('#deviceStatus').html('ok');
				$('#deviceStatus').removeClass().addClass('ok');
			}
			else if(guiBoost >= 8 && guiBoost <= 9){
				$('#userDeviceStatusLine').html("Things look ");
				$('#deviceStatus').html('good');
				$('#deviceStatus').removeClass().addClass('good');
			}
			
			if(guiProductType=="590NP34"){$('.deviceDUO').css("background","URL('img/assets/images/deviceImages/Pro.png')no-repeat");}
			else if(guiProductType=="590ND32"){$('.deviceDUO').css("background","URL('img/assets/images/deviceImages/Duo.png')no-repeat");}
			else if(guiProductType=="590NS32"){$('.deviceDUO').css("background","URL('img/assets/images/deviceImages/RS1.png')no-repeat");}
			else if(guiProductType=="590NG31"){$('.deviceDUO').css("background","URL('img/assets/images/deviceImages/RS2 White.png')no-repeat");}
			else if(guiProductType=="590NT34"){$('.deviceDUO').css("background","URL('img/assets/images/deviceImages/RS2.png')no-repeat");}
			
			$('.deviceSerialNumber').html('Device Serial Number: '+guiSerialNumber);
			$('#boosterLevel').html(guiBoost);
			util.showGauge(guiBoost);
			
			var netWorkSignalArr = ['networkSignal1', 'networkSignal2', 'networkSignal3', 'networkSignal4', 'networkSignal5'];
			var networkBarArr = guiNetworkBars;
			var i = networkBarArr.indexOf(Math.max.apply(Math, networkBarArr));
			for(var n=1; n<=networkBarArr[i]; n++){
				$('#networkSignal'+n).removeClass('deactiveStatus').addClass('activeStatus');
			}
			
			if(guiTechnologyTypes.indexOf('LTE') > -1){
				$('#coverageNamecontainer').html('<span>LTE</span>');
			}else{
				$('#coverageNamecontainer').html('<span>3G/4G</span>');
			}
		}
	},
	
	showHelpMenu: function () {
    	var productType = window.localStorage.getItem('_PRDTYP');	    	
    	if (typeof productType === 'undefined' || productType == null) {	    		    		
    		this.selectProductView();
    	} else {
	    	switch(productType) {
		    	case 'DUO' : {		    		
		    		break;
		    	}
		    	case 'GO' : {
		    		break;
		    	}
		    	case 'PRIME' : {
		    		break;
		    	}
		    	case 'PRO' : {
		    		break;
		    	}
	    	}
    	}
    	$('.headerContainer, #bodyContainer').hide();
		$('.modalWrapper').show();
	},
	
	selectProductView: function () {
		this.createModalWrapper();
		$('#modalTitle').html('Help Center');
		var productSelectionMenu = "<div class='modalHelpWrapper'>"
								+ "<p class='pageTitleContainer modalContentTitle modalContentPadding'>Select your product</p>"						
								+ "<div class='modalContentPadding' onClick='util.createHelpMenu(\"1\", \"duo\");'>"	
								+ "<div class='helpDeviceIcns' id='deviceDuoIcn'></div>"
								+ "<div class='modalBodyPanelHeaderTitle'>DUO</div>"
								+ "<div class='modalChevronRightIcns'></div>"	
								+ "</div>"																		
								+ "<div class='modalContentPadding' onClick='util.createHelpMenu(\"2\", \"go\");'>"	
								+ "<div class='helpDeviceIcns' id='deviceGoIcn'></div>"				
								+ "<div class='modalBodyPanelHeaderTitle'>GO</div>"
								+ "<div class='modalChevronRightIcns'></div>"	
								+ "</div>"	  
								+ "<div class='modalContentPadding' onClick='util.createHelpMenu(\"2\", \"prime\");'>"
								+ "<div class='helpDeviceIcns' id='devicePrimeIcn'></div>"
								+ "<div class='modalBodyPanelHeaderTitle'>PRIME</div>"
								+ "<div class='modalChevronRightIcns'></div>"	
								+ "</div>"
								+ "<div class='modalContentPadding' onClick='util.createHelpMenu(\"1\", \"pro\");'>"							 							
								+ "<div class='helpDeviceIcns' id='deviceProIcn'></div>"
								+ "<div class='modalBodyPanelHeaderTitle'>PRO</div>"
								+ "<div class='modalChevronRightIcns'></div>"	
								+ "</div></div>";
		$(productSelectionMenu).appendTo('.modalBodyWrapper')			
	},
	
	createModalWrapper: function () {			
		var modalWrapper = "<div class='modalWrapper'>"
							+ "<div class='modalHeaderWrapper' class='col-xs-12 col-sm-12'>"
							+ "<div id='modalTitle'></div>"
							+ "<div class='modalCloseBtn' onClick= 'util.removeModal();'></div>"
							+ "<div class='modalLeftBtn'></div>"				
							+ "</div>"						 
							+ "<div class='modalBodyWrapper'></div>"
							+ "</div>";
		if(typeof $('.modalWrapper') !== 'undefined') {
    		$('.modalWrapper').remove();
    	}
		$(modalWrapper).appendTo('body');
	},
	
	removeModal: function () {
		$('.modalWrapper').remove();
		$('.headerContainer, #bodyContainer').show();
	},
	
	createHelpMenu: function (menuType, menuSelected){			
		
		var title = 'Cel-Fi ' + menuSelected.toUpperCase();
		// List of menu items
		var menuListName = ['Installation Guide', 'Troubleshooting', 'Error Codes', 'Frequently Asked Questions', 'Registration', 'Contact Us'];
		var menuListId = ['menuInstall', 'menuTroubleShoot', 'menuErrorCodes', 'menuFaq', 'menuRegistration', 'menuContactUs'];
		
		/**
		 * check condition for registration menu here
		 * 
		 */
		/*if(isRegistered) {
			menuListName.splice(menuListName.indexOf('Registration'), 1 );
			menuListId.splice(menuListId.indexOf('menuRegistration'), 1 );				
		}*/
		
		// to show menu w.r.t device selected
		if(menuType === '2') {
			menuListName.splice(menuListName.indexOf('Troubleshooting'), 2 );
			menuListId.splice(menuListId.indexOf('menuTroubleShoot'), 2 );
		}
			
		//adding menu contents here
		var menuOptions = "<p class='pageTitleContainer modalContentTitle modalContentPadding'>" + title + "</p>";
							
		for(var i = 0; i < menuListName.length; i++) {
			var menu = i === 0 ? "<div class='modalContentPadding' id='"+ menuListId[i] +"'>"  :  "<div class='modalContentPadding' id='"+ menuListId[i] +"'>";
			menu += "<div class='modalBodyPanelHeaderTitle '>"
					+ menuListName[i]
					+ "</div>"
					+ "<div class='modalChevronRightIcns'></div>"							  
					+ "</div>";				
			menuOptions += menu;
		}
											 						 								
		$('.modalHelpWrapper').html(menuOptions);
		
		// Bind events for individual menu item
		for(var i = 0; i < menuListId.length; i++) {											
			if(menuListId[i] === 'menuInstall') {
				$('#' + menuListId[i]).bind("click", function() {						
					if(menuSelected === 'duo')
						util.duoInstallationGuide();
					else if(menuSelected === 'pro')
						util.proInstallationGuide();
					else if(menuSelected === 'prime')
						util.primeInstallationGuide();
					else if(menuSelected === 'go')
						util.goInstallationGuide();
			    });						
			} else if (menuListId[i] === 'menuTroubleShoot') {
				$('#' + menuListId[i]).bind("click", function() {						
					if(menuSelected === 'duo')
						util.duoTroubleShoot()
					else if(menuSelected === 'pro')
						util.proTroubleShoot();						
			    });	
			} else if (menuListId[i] === 'menuErrorCodes') {
				$('#' + menuListId[i]).bind("click", function() {						
					if(menuSelected === 'duo')
						util.duoErrorCodes()
					else if(menuSelected === 'pro')
						util.proErrorCodes();												
			    });	
			} else if (menuListId[i] === 'menuFaq') {
				$('#' + menuListId[i]).bind("click", function() {						
					util.faqDetails();
			    });	
			} else if (menuListId[i] === 'menuRegistration') {
				$('#' + menuListId[i]).bind("click", function() {						
					util.registrationInfo();
			    });	
			} else if (menuListId[i] === 'menuContactUs') {
				$('#' + menuListId[i]).bind("click", function() {						
					util.contactInfo();
			    });	
			}						
		}			
	},				
	
	duoInstallationGuide: function () {
		this.createModalWrapper();
		$('#modalTitle').html('Installation Guide');
		var duoInstallGuide = "<div class='installGuideWrapper'>"						
								+ "<p class='pageTitleContainer modalContentTitle modalContentPadding'>Installation Guide for Cel-Fi DUO</p>"
								+ "<div class='modalContentPadding'>"                      
								+ "<div class='helpContent installGuideContent'>STEP 1</div>"
								+ "<div class='helpHeadLine'>Find the location with the best coverage:</div>"
								+ "<div class='helpContent'>The first step in setting up your Cel-Fi DUO Signal Booster system is to find the location in your home or office with the best cellular signal. Use your phone to identify the area with the most bars of signal. Typically, the best service will be near a window in the highest floor of your home or office. Make sure a 3G, 4G or 4G LTE icon is displayed on your handset.</div>"
								+ "<div class='helpSubTitle installGuideContent'>STEP 2</div>"
								+ "<div class='helpHeadLine'>Plug in the Network Unit:</div>"
								+ "<div class='helpContent'>Plug the Network Unit into an easily accessible outlet near the area with the strongest 3G, 4G or 4G LTE signal. (Note: the power supplies in your kit are identical.) Make sure that at least one bar is displayed on the signal strength indicator on the front of the Network Unit. If you do not see at least one bar, try a different location.</div>"								
								+ "<div class='helpSubTitle installGuideContent'>STEP 3</div>"
								+ "<div class='helpHeadLine'>Optimize the Network Unit Placement:</div>"
								+ "<div class='helpContent'>The bars on the front of the device indicate the strength of the cellular signal in the area. Moving the Network Unit to a different location in your home may increase the signal, and can improve the quality of your service.</div>"
								+ "<div class='helpSubTitle installGuideContent'>STEP 4</div>"
								+ "<div class='helpHeadLine'>Place the Coverage Unit:</div>"
								+ "<div class='helpContent'>Move to a location in your home where you need to improve coverage. Plug the Coverage Unit into an easily accessible outlet. After several minutes, the numeric display will stop cycling.</br></br>If your device is set up properly, the green icons will appear on the display as seen above. It is possible to place the Coverage Unit too close or too far from the Network Unit. If this happens, a red icon will illuminate indicating that you need to move the Coverage Unit either closer to, or further away from the Network Unit.</div>"
								+ "<div class='helpSubTitle installGuideContent'>STEP 5</div>"
								+ "<div class='helpHeadLine'>Optimize The Coverage Unit Placement:</div>"
								+ "<div class='helpContent'>Place the Coverage Unit as far away as possible from the Network Unit. The number on the front of the Coverage Unit display indicates the quality of the placement. For the best service experience, move the Coverage Unit around your home until an 8 or 9 displays.</div>"
								+ "</div></div>";
		$(duoInstallGuide).appendTo('.modalBodyWrapper');
		$('.headerContainer, #bodyContainer').hide();
		$('.modalWrapper').show();
	},
	
	duoTroubleShoot: function () {
		this.createModalWrapper();
		$('#modalTitle').html('TroubleShooting');
		var duoTroubleShoot = "<div class='installGuideWrapper'>"						
								+ "<p class='pageTitleContainer modalContentTitle modalContentPadding'>Network Unit Troubleshooting</p>"
								+ "<div class='modalContentPadding'>"
								+ "<div class='helpHeadLine installGuideContent troubleShootSubTitle'>No Power – My Network Unit (aka Window Unit) won’t turn on!</div>"
								+ "<div class='helpContent'></br>When your system does not power up, one of the following things could be happening. You could have a power adaptor failure, a hardware failure, or the system could need a simple restart.</br></br>Try this… Both the Network Unit and Coverage Unit have identical power supplies. Try switching the power supplies to see if one of the following issues could be occurring:</br></br>If you switch the power supplies and the problem moves from one unit to the other unit then you are experiencing a power supply issue. Please reach out to your point of sale for a replacement power supply.</br></br>If, after switching power supplies, you still have no power on your Network Unit try another outlet, or lamp/appliance in the same outlet. If you continue to have problems with the Network Unit please reach out to your point of sale for a system replacement.</br></br>If, after switching power supplies both system are functioning properly then your Cel-Fi DUO system simply needed a restart. This is not something that should continue, but if it occurs frequently please reach out to your point of sale for support.</div>"
								+ "<div class='helpHeadLine installGuideContent troubleShootSubTitle'>No Bars – My Network Unit is not finding the cellular signal!</div>"
								+ "<div class='helpContent'></br>If your power light is still blinking while you have no bars, your Network Unit is still trying to find the incoming cellular network signal. This can sometimes take more than a few minutes.</br></br>Taking longer than 60 minutes? Try this…</br></br>Walk around your home/office with your cellular device. Try to find a signal inside your home/office with at least one consistent bar of 3G/4G/LTE. More bars is always better! Once you have found a signal place your Network Unit in that location.</br></br>If you have bars of service on your phone in the location of your Network Unit, and after 60 minutes you are still unable to receive bars of service on your Network Unit try a restart. To restart your Network Unit simply unplug for a moment and then it plug back in. If the restart does not solve the issue please reach out to your point of sale for support.</br></br>No bars and a red power indicator? Please refer to the section below about “Red power indicator”.</div>"												
								+ "<div class='helpHeadLine installGuideContent troubleShootSubTitle'>No LTE – My phone still doesn’t have LTE!</div>"
								+ "<div class='helpContent'></br>There are a few reasons why your phone would experience an issue with the LTE service. </br></br>You may not have LTE in your area, your Cel-Fi system may have lost the LTE signal due to intermittent network outages, your phone may not support LTE, or your phone may not be compatible with the frequency being boosted by the Cel-Fi DUO.</br></br></br>A flashing LTE light means that your Cel-Fi DUO system is actively searching for the LTE signal. The Cel-Fi DUO will scan at startup and scan again every 24 hours.</br></br>If your LTE light is not lit and not flashing, your Cel-Fi DUO has lost, or never found an LTE signal and has momentarily stopped searching. The Cel-Fi DUO will scan at startup and scan again every 24 hours.</div>"
								+ "<div class='helpHeadLine installGuideContent troubleShootSubTitle'>Red Power Indicator – My Network Unit has a red power light!</div>"
								+ "<div class='helpContent'></br>With a flashing red power indicator you may also see an error code displayed on the Coverage Unit (flashing an E then correlating error number).</br></br>E1 – Cellular Signal too weak to boost. Try this… Walk around your home/office with your cellular device. Try to find a signal indoors with at least one consistent bar of 3G/4G/LTE. More bars is always better! Once you have found a usable signal place your Network Unit in this location.</br></br>E3 – Coverage Unit is overheating. Insure that your Coverage Unit vents are uncovered and free of debris, and that the location of the unit allows free flow of air. Once the Coverage Unit has cooled to a normal functioning temperature it will restart and operate as normal.</br></br>E4 – Network Unit is overheating. Insure that your Network Unit vents are uncovered and free of debris, and that the location of the unit allows free flow of air. Once the Coverage Unit has cooled to a normal functioning temperature it will restart and operate as normal.</br></br>With a solid red power indicator you may also see and error code displayed on the Coverage Unit (flashing an E then correlating error number).</br></br>E8 – Input signal too strong. An E8 error code is letting you know that your Network Unit is too close to a cellular tower, not necessarily for your operator. This has reduced the output power (coverage bubble) to limit network interference. Try this…Move your Network Unit to another location. You might need to move your system to the other side of your home/office. Note: When you have an E8 your system will still offer you indoor cellular coverage.</br></br>E6 – Network Unit hardware error that may be remedied by a reset. Your Coverage Unit may not display a flashing error code. You will likely only see the solid red power indicator on your Network Unit. Try this…reset your Network Unit. Simply unplug your Network Unit for a few seconds and plug it back in.</div>"
								+ "<div class='helpHeadLine installGuideContent troubleShootSubTitle'>Flashing Green Power Indicator – My Network Unit’s power light is flashing green!</div>"
								+ "<div class='helpContent'></br>A flashing green power indicator on your Network Unit means that your system is still performing startup procedures. This could indicate that the Network Unit is trying to find a connection to either the cellular network or your Coverage Unit.</br></br>No bars with a flashing power indicator means the system is trying to locate the cellular network. This normally takes less 60 minutes. Make sure that your phone (cellular device) has at least one bar of 3G/4G/LTE signal where the Network Unit is located.</br></br>If you have bars but the power indicator is flashing this means that your Network Unit has located the cellular network and is now trying to locate your coverage unit. For more information about Coverage Unit issues <a href=\"#\" onclick=\"window.open('https://support.cel-fi.com/hc/en-us/articles/202987766-Troubleshoot-the-Cel-Fi-Network-Unit', '_system');\">click here</a></div>"
								+ "<div class='helpHeadLine installGuideContent troubleShootSubTitle'>Flashing Bars – My Network Unit bars are flashing. </div>"
								+ "<div class='helpContent'></br>With flashing bars on your Network Unit you may also see and error code displayed on the Coverage Unit (flashing an E then correlating error number).</br></br>E7 – The system has been disabled by the mobile network operator. Contact your operator for more information.</div>"
								+ "</div></br>"
								+ "<p class='pageTitleContainer modalContentTitle modalContentPadding'>Coverage Unit Troubleshooting</p>" 
								+ "<div class='modalContentPadding'>"
								+ "<div class='helpHeadLine installGuideContent troubleShootSubTitle'>No Power – My Coverage Unit won’t turn on!</div>"
								+ "<div class='helpContent'></br>When your system does not power up, or has a red power indicator, one of the following things could be happening. You might have a power adaptor failure, a hardware failure, or the system may need a simple restart.</br></br>Try this… Both the Coverage Unit and Network Unit have identical power supplies. Try switching the power supplies to see if one of the following issues could be occurring:</br></br>If you switch the power supplies and the problem moves from one unit to the other unit then you are experiencing a power supply issue. Please reach out to your point of sale for a replacement power supply.</br></br>If, after switching power supplies, you still have no power on your Coverage Unit try another outlet, or another lamp/appliance in the same outlet. If you continue to have problems with the unit please reach out to your point of sale for a system replacement.</br></br>If, after switching power supplies both system are functioning properly then your Cel-Fi DUO system simply needed a restart. This is not something that should continue, but if it occurs frequently please reach out to your point of sale for support.</div>"
								+ "<div class='helpHeadLine installGuideContent troubleShootSubTitle'>Numeric display keep cycling/rotating</div>"
								+ "<div class='helpContent'></br>When your Coverage Unit displays a rotating “0” zero your system is still preforming startup procedures. This process usually takes less than 20 minutes. If it takes longer than 45 minutes, please restart both units.</div>"
								+ "<div class='helpHeadLine installGuideContent troubleShootSubTitle'>Low Number on my Coverage Unit (0-6)</div>"
								+ "<div class='helpContent'></br>When you have a display of 0, 1, 2, 3, 4, 5, or 6 your Cel-Fi DUO system has established a connection but is not working to the fullest ability. Try this… move your units further apart. If you have a particular spot in your home that you want coverage more than others try installing your Cel-Fi system in reverse. Put your Coverage Unit where you need coverage the most then place your Network Unit at the furthest location where you can get at least 1 bar of service.</br></br>If you cannot get your systems further apart, and you have the coverage you need, a higher number is not always possible or necessary.</br></br>When you have a solid “0” zero display you may also see a flashing green power indicator. This display indicates that your Network Unit and Coverage Unit are “Too Close” together. Try moving the units further apart, starting with the Coverage Unit.</div>"
								+ "<div class='helpHeadLine installGuideContent troubleShootSubTitle'>Small Coverage Bubble – I only have signal within a few feet of the Coverage Unit!</div>"
								+ "<div class='helpContent'></br>Changes to your Cel-Fi placement can be made to improve your 3G/4G/LTE coverage.</br></br>The more bars shown on the Network Unit the better. Try moving the Network Unit to an area that has better 3G/4G/LTE coverage. If the home/office has more than 1 floor upstairs is usually better than downstairs. Putting the Network Unit near a window or higher on a shelf often helps as well.</br></br>The numeric value on the display of the Coverage Unit is an indication of the area covered. A higher number means a larger area is covered. To increase the coverage area move the Coverage Unit farther away from the Network Unit. The less obstacles in their direct line of sight the further apart you can get them. The higher the Coverage Unit number, the better the coverage.</div>"
								+ "<div class='helpHeadLine installGuideContent troubleShootSubTitle'>No LTE – My phone still doesn’t have LTE</div>"
								+ "<div class='helpContent'></br>There are a few reasons why your phone would experience an issue with the LTE service. You may not have LTE in your area, your Cel-Fi system may have lost the LTE signal due to intermittent network outages, your phone may not support LTE, or your phone may not be compatible with the frequency being boosted by the Cel-Fi DUO. You will need to check the display on your Network Unit for more information <a href=\"#\" onclick=\"window.open('https://support.cel-fi.com/hc/en-us/articles/202987756-Troubleshoot-the-Cel-Fi-Window-Network-Unit', '_system');\">click here</a></div>"
								+ "<div class='helpHeadLine installGuideContent troubleShootSubTitle'>Frequent or Intermitten “Too Far” message</div>"
								+ "<div class='helpContent'></br>Intermittent rotating/too far issues. While the number 9 is the largest distance between your Coverage Unit and your Network Unit you can have the systems slightly too far apart. This may cause you to experience intermittent interference which can cause the connection to break. Frequent or intermittent issues can be related to heavy WiFi saturation in your home/office, or obstacles that move between the two units line of sight. Make sure that each unit is as far as possible from any access points or other WiFi enabled devices. An example of a wireless device could be, but is not limited to, a wireless home phone, laptop computer, or wireless router.</div>"
								+ "<div class='helpHeadLine installGuideContent troubleShootSubTitle'>Flashing E message.</div>"
								+ "<div class='helpContent'></br>E1 Cellular Signal too weak to boost. Try this… Walk around your home/office with your cellular device. Try to find a signal indoors with at least one consistent bar of 3G/4G/LTE. More bars is always better! Once you have found a usable signal place your Network Unit in this location.</br></br>E2 Coverage Unit hardware error that may be remedied by a reset. Your Coverage Unit may not display a flashing error code. You will likely only see the solid red power indicator on your Coverage Unit.Try this….Reset your Coverage Unit. Simply unplug your Coverage Unit for a few seconds and plug back in.</br></br>E3 Your Coverage Unit is overheating. Try this… ensure that your Coverage Unit vents are clear of any blockage, and that the location of the unit allows free flow of air. Once your Coverage Unit has cooled down it will operate as normal.</br></br>E4 Your Network Unit is overheating. Try this… ensure that your Network Unit vents are clear of any blockage, and that the location of the unit allows free flow of air. If you have your Network Unit in an attic space you may need to relocate the device to ensure that the system does not continue to overheat. Once your Network Unit has cooled down it will operate as normal.</br></br>E7 The system has been disabled by the mobile network carrier. Contact your point of sale.</br></br>E8 Input signal too strong. An E8 error code is letting you know that your Network Unit is too close to a cellular tower, not necessarily for your operator. This has reduced the output power (coverage bubble) to limit network interference. Try this…Move your Network Unit to another location. You might need to move your system to the other side of your home. Note: When you have an E8 your system will still offer you indoor cellular coverage.</br></br>Too close, you may also see a solid zero on your Coverage Unit. Your Coverage Unit is “Too Close” to your Network Unit. Try this…moving the units further apart, starting with the Coverage Unit.</br></br>Too far, you may also see a rotating/cycling zero with red arrows on your Coverage Unit. Your Coverage Unit is “Too Far” from your Network Unit. Try moving the units slightly (5-10 feet) closer together, starting with the Coverage Unit.</br></br>Intermittent “Too Far” message? Frequent or intermittent issues can be related to heavy WiFi saturation in your home/office. Make sure that each unit is as far as possible from any access points or other WiFi enabled devices.</div>"
								+ "</div></div>";
		$(duoTroubleShoot).appendTo('.modalBodyWrapper');
		$('.headerContainer, #bodyContainer').hide();
		$('.modalWrapper').show();
	},
	
	duoErrorCodes: function () {
		$('#modalTitle').html('Error codes');
	},
	
	proInstallationGuide: function () {
		this.createModalWrapper();
		$('#modalTitle').html('Installation Guide');
		var duoInstallGuide = "<div class='installGuideWrapper'>"						
								+ "<p class='pageTitleContainer modalContentTitle modalContentPadding'>Installation Guide for Cel-Fi PRO</p>"
								+ "<div class='modalContentPadding'>"                      
								+ "<div class='helpContent installGuideContent'>STEP 1</div>"
								+ "<div class='helpHeadLine'>Find the best cellular signal</div>"
								+ "<div class='helpContent'>For Cel-Fi to work correctly, use your phone to find the best 3G, 4G or LTE signal. </br>Typically, you will get the best signal upstairs near a window.</div>"
								+ "<div class='helpSubTitle installGuideContent'>STEP 2</div>"
								+ "<div class='helpHeadLine'>Place the Network Unit</div>"
								+ "<div class='helpContent'>Place the Network Unit (NU) in the location where you get the best cellular signal.</div>"								
								+ "<div class='helpSubTitle installGuideContent'>STEP 3</div>"
								+ "<div class='helpHeadLine'>Place the Coverage Unit</div>"
								+ "<div class='helpContent'>Place the Coverage Unit (CU) in the location where you need improved coverage.</div>"
								+ "<div class='helpSubTitle installGuideContent'>STEP 4</div>"
								+ "<div class='helpHeadLine'>Optimize the Coverage</div>"
								+ "<div class='helpContent'>For best results, try moving the CU around to a few different spots. Typically, the farther the units are apart, the better coverage you will have. Although, it is possible to move the units too far apart.</div>"									
								+ "</div></div>";
		$(duoInstallGuide).appendTo('.modalBodyWrapper');
		$('.headerContainer, #bodyContainer').hide();
		$('.modalWrapper').show();
	},
	
	proTroubleShoot: function () {
		this.createModalWrapper();
		$('#modalTitle').html('TroubleShooting');
		var proTroubleShoot = "<div class='installGuideWrapper'>"						
								+ "<p class='pageTitleContainer modalContentTitle modalContentPadding'>Coverage Unit Troubleshooting</p>"
								+ "<div class='modalContentPadding'>"
								+ "<div class='helpHeadLine installGuideContent troubleShootSubTitle'>No Power – My Coverage Unit won’t turn on!</div>"
								+ "<div class='helpContent'></br>When your system does not power up, or has a red power indicator, one of the following things could be happening. You might have a power adaptor failure, a hardware failure, or the system may need a simple restart.</br></br>Try this… Both the Coverage Unit and Network Unit have identical power supplies. Try switching the power supplies to see if one of the following issues could be occurring:</br></br>If you switch the power supplies and the problem moves from one unit to the other unit then you are experiencing a power supply issue. Please reach out to your point of sale for a replacement power supply.</br></br>If, after switching power supplies, you still have no power on your Coverage Unit try another outlet, or another lamp/appliance in the same outlet (changed). If you continue to have problems with the unit please reach out to your point of sale for a system replacement.</br></br>If, after switching power supplies both system are functioning properlythen your Cel-Fi PRO system simply needed a restart. This is not something that should continue, but if it occurs frequently please reach out to your point of sale for support.</div>"
								+ "<div class='helpHeadLine installGuideContent troubleShootSubTitle'>No Bars – My Coverage Unit is not finding the Network Unit!</div>"
								+ "<div class='helpContent'></br>When you Coverage Unit does not have bars but your Network Unit icon does, the system is still performing startup procedures. </br></br>If it takes longer than 45 minutes, please restart both units and make sure they are within sight of each other.</br></br>Try placing the units roughly 30 feet from each other as a test to confirm that the units will pair, if not make sure you have matching serial numbers.</div>"
								+ "<div class='helpHeadLine installGuideContent troubleShootSubTitle'>Low amount of bars on your Coverage Unit – I can’t get more than 1/2 bars over the CU icon!</div>"
								+ "<div class='helpContent'></br>When you have a 1, or 2 bars on the Coverage Unit, your Cel-Fi PRO system has established a connection but might not be (changed) working to the fullest ability. Try this… move your units further apart. If you have a particular spot in your home that you want coverage more than others try installing your Cel-Fi system in reverse. Put your Coverage Unit where you need coverage the most then place your Network Unit at the furthest location where you can get at least 1 bar of service.</br></br>If you cannot get your systems further apart, and you have the coverage you need, a higher number is not always possible or necessary.</div>"
								+ "<div class='helpHeadLine installGuideContent troubleShootSubTitle'>Small Coverage Bubble – I only have signal within a few feet of the Coverage Unit!</div>"
								+ "<div class='helpContent'></br>Changes to your Cel-Fi placement can be made to improve your 3G/4G/LTE coverage.</br></br>The more bars shown on the Network Unit the better. Try moving the Network Unit to an area that has better 3G/4G/LTE coverage. If the home/office has more than 1 floor. Upstairs is usually better than downstairs. Putting the Network Unit near a window or higher on a self often helps as well.</br></br>The bar display of the Coverage Unit is an indication of the area covered. More bars on the Coverage Unit means a larger area is covered. To increase the coverage area move the Coverage Unit farther away from the Network Unit. The less obstacles in their direct line of sight the further apart you can get them. The more bars on your Coverage Unit, the better the coverage area will be.</div>"
								+ "<div class='helpHeadLine installGuideContent troubleShootSubTitle'>No LTE – My phone still doesn’t have LTE</div>"
								+ "<div class='helpContent'></br>There are a few reasons why your phone would experience an issue with the LTE service. </br></br>You may not have LTE in your area, your Cel-Fi system may have lost the LTE signal due to intermittent network outages, or your phone may not support LTE. </br></br>Check to see that your phone shows an LTE signal in the location of your Network Unit.</div>"									
								+ "</div></br>"
								+ "<p class='pageTitleContainer modalContentTitle modalContentPadding'>Network Unit Troubleshooting</p>" 
								+ "<div class='modalContentPadding'>"
								+ "<div class='helpHeadLine installGuideContent troubleShootSubTitle'>No Power – My Network Unit won’t turn on!</div>"
								+ "<div class='helpContent'></br>When your system does not power up, one of the following things could be happening. You could have a power adaptor failure, a hardware failure, or the system could need a simple restart.</br></br>Try this… Both the Network Unit and Coverage Unit have identical power supplies. Try switching the power supplies to see if one of the following issues could be occurring:</br></br>If you switch the power supplies and the problem moves from one unit to the other unit then you are experiencing a power supply issue. Please reach out to your point of sale for a replacement power supply.</br></br>If, after switching power supplies, you still have no power on your Network Unit try another outlet, or lamp/appliance in the same outlet. If you continue to have problems with the Network Unit please reach out to your point of sale for a system replacement.</br></br>If, after switching power supplies both system are functioning properly then your Cel-Fi PRO system simply needed a restart. This is not something that should continue, but if it occurs frequently please reach out to your point of sale for support.</br></br>If you have power on your Network Unit with a white or otherwise abnormal colored display, please contact your point of sale for specific warranty support.</div>"
								+ "<div class='helpHeadLine installGuideContent troubleShootSubTitle'>No Bars – My Network Unit is not finding the cellular signal!</div>"
								+ "<div class='helpContent'></br>If you have no bars, your Network Unit is still trying to find the incoming cellular network signal. Your Network Unit may display the “Searching for the Network…” message. This can sometimes take more than a few minutes.</br></br>Taking longer than 60 minutes? Try this…</br></br>Walk around your home/office with your cellular device. Try to find a signal inside your home/office with at least one consistent bar of 3G/4G/LTE. More bars is always better! Once you have found a signal place your Network Unit in that location.</br></br>If you have bars of service on your phone in the location of your Network Unit, and after 60 minutes you are still unable to receive bars of service on your Network Unit try a simple restart. To restart your Network Unit simply unplug for a moment and then plug back in. If the restart does not solve the issue please reach out to your point of sale for support.</div>"
								+ "<div class='helpHeadLine installGuideContent troubleShootSubTitle'>Network Unit (NU) continues to search for the Coverage Unit (CU)</div>"
								+ "<div class='helpContent'></br>Your Cel-Fi PRO has found the network and is displaying bars over the (NU) Network Unit icon, but continues to try and find a connection to the Coverage Unit (CU).</br></br>If this screen is displayed for more than 30 minutes, after your Network Unit shows bars, you could have one of the following issues with your Cel-Fi PRO system.</br></br>Try this… Insure that your Coverage Unit (CU) is plugged in and has power. If your Coverage Unit does not have power <a href=\"#\" onclick=\"window.open('https://support.cel-fi.com/hc/en-us/articles/202987766-Troubleshoot-the-Cel-Fi-Network-Unit', '_system');\">click here</a> for a link to the PRO Coverage Unit (CU) troubleshooting section.</br></br>Make sure that your Units are not too far apart. Try placing the systems 10-15 feet apart to insure they can connect. The more interference (i.e. walls, doors, refrigerators, filing cabinets) between the two units the closer they will need to be. Once you have established a connection you can optimize the displayed number by moving either unit.</br></br>Intermittent too far issues. While five CU bars is the largest distance between your Coverage Unit and your Network Unit you can have the systems slightly too far apart. This may cause you to experience intermittent interference which can cause the connection to break. Frequent or intermittent issues can be related to heavy WiFi saturation in your home/office, or obstacles that move between the two units line of sight. Make sure that each unit is as far as possible from any access points or other WiFi enabled devices. An example of a wireless device could be, but is not limited to, a wireless home phone, laptop computer, or wireless router.</div>"
								+ "</div></div>";
			
		$(proTroubleShoot).appendTo('.modalBodyWrapper');
		$('.headerContainer, #bodyContainer').hide();
		$('.modalWrapper').show();
	},
	
	proErrorCodes: function () {
		$('#modalTitle').html('Error codes');
	},
	
	primeInstallationGuide : function () {
		// Yet to be given
		$('#modalTitle').html('Installation Guide');
	},
	
	goInstallationGuide: function () {
		// Yet to be given
		$('#modalTitle').html('Installation Guide');
	},
	
	faqDetails: function() {
		this.createModalWrapper();
		$('#modalTitle').html('FAQ');
		var faqDetails = "<div class='modalHelpWrapper faqModalWrapper'>"
						+ "<p class='pageTitleContainer modalContentTitle modalContentPadding'>Top 20 Frequently Asked Questions</p>"
						+ "<div class='divLineDivider'></div>"
						+ "<div class='panel-group' id='accordion'>"
						+ "<div class='panel panel-default'>"				        
						+ "<div class='panel-heading FAQPanelHeaderColor'>"
						+ "<h4 class='panel-title'>"
						+ "<a data-toggle='collapse' data-parent='#accordion' href='#ModelOne'>"
						+ "<div>"
						+ "<p class='modalFAQPanelContent' >What is Cel-Fi?</p>"
						+ "</div>"
						+ "<span class='pull-right faqSpan' >"
						+ "<span class='toggle-icon glyphicon glyphicon-chevron-down'></span>"
						+ "</span>"
						+ "</a></h4></div>"
						+ "<div id='ModelOne' class='panel-collapse collapse'>"
						+ "<div class='panel-body'>"
						+ "<p class='modelFAQBodyContents'>"
						+ "Cel-Fi is Nextivity's brand of self-configuring, environmentally aware, indoor coverage solutions. Each Cel-Fi system consists of two units. The Network Unit is placed in the area where the strongest native signal can be received from the carrier network (signal levels as low as -120 dBm are acceptable). The Network Unit comprises a transmitter and receiver which communicates with the cell tower. The Coverage Unit is placed in the center of the home, communicates wirelessly with the Network Unit and “lights up” the interior of the house with significantly enhanced signal levels, thus enabling better quality calls and greater data throughput."
						+ "</p></div></div></div>"
						+ "<div class='divLineDivider'></div>"
						+ "<div class='panel panel-default'>"				        
						+ "<div class='panel-heading' style='color:#4FAEE0;'>"
						+ "<h4 class='panel-title'>"
						+ "<a data-toggle='collapse' data-parent='#accordion' href='#ModelTwo'>"
						+ "<div>"
						+ "<p class='modalFAQPanelContent'>What makes Cel-Fi so different from other signal boosters?</p>"
						+ "</div>"
						+ "<span class='pull-right faqSpan'>"
						+ "<span class='toggle-icon glyphicon glyphicon-chevron-down'></span>"
						+ "</span></a></h4></div>"
						+ "<div id='ModelTwo' class='panel-collapse collapse'>"
						+ "<div class='panel-body'>"
						+ "<div class='panel-body'>"
						+ "<p class='modelFAQBodyContents'>"
						+ "Cel-Fi is a smart signal booster. That means it relies on intelligent, self-organizing algorithms to ensure you benefit from the largest area of coverage without compromising or interfering with your mobile operator's networks or impeding other subscribers' signals. Cel-Fi does not require any new equipment, any configuring, or any changes to existing network infrastructure or mobile devices. It is also a plug and play device, which means that there is no need for professional installation, no drilling, and no cables. In addition, Cel-Fi has been recognized for its superior design and effectiveness and is the only consumer booster authorized for use by the communications commissions in Australia and the United Kingdom, and the only Smart Booster designed to meet the new FCC Safe Harbor 2 specifications that allow very high gain (very high signal gain is necessary to make low level signals useful in a large coverage area)."
						+ "</p></div></div></div></div>"							
						+ "<div class='divLineDivider'></div>"
						+ "<div class='panel panel-default'>"				        
						+ "<div class='panel-heading' id='operatorTitles'>"
						+ "<h4 class='panel-title'>"
						+ "<a data-toggle='collapse' data-parent='#accordion' href='#ModelThree'>"
						+ "<div>"
						+ "<p class='modalFAQPanelContent'>Does the Cel-Fi require an internet or GPS connection?</p>"
						+ "</div>"
						+ "<span class='pull-right faqSpan'>"
						+ "<span class='toggle-icon glyphicon glyphicon-chevron-down'></span>"
						+ "</span></a></h4></div>"
						+ "<div id='ModelThree' class='panel-collapse collapse'>"							
						+ "<div class='panel-body'>"
						+ "<p class='modelFAQBodyContents'>"
						+ "No. The Cel-Fi system only needs to have at least 1 bar of native cellular signal, in at least one spot of your home to be able to cover your whole home or office space."
						+ "</p></div></div></div>"	
						+ "<div class='divLineDivider'></div>"
						+ "<div class='panel panel-default'>"				        
						+ "<div class='panel-heading' id='operatorTitles'>"
						+ "<h4 class='panel-title'>"
						+ "<a data-toggle='collapse' data-parent='#accordion' href='#ModelFour'>"
						+ "<div>"
						+ "<p class='modalFAQPanelContent'>Will the Cel-Fi support voice and data or data only?</p>"
						+ "</div>"
						+ "<span class='pull-right faqSpan'>"
						+ "<span class='toggle-icon glyphicon glyphicon-chevron-down'></span>"
						+ "</span></a></h4></div>"
						+ "<div id='ModelFour' class='panel-collapse collapse'>"
						+ "<div class='panel-body'>"
						+ "<p class='modelFAQBodyContents'>"
						+ "Yes, Cel-Fi smart signal boosters can support both voice and data simultaneously. Note that Cel-Fi RS1 and RS2 models do not support LTE."
						+ "</p></div></div></div>"	
						+ "<div class='divLineDivider'></div>"
						+ "<div class='panel panel-default'>"				        
						+ "<div class='panel-heading' id='operatorTitles'>"
						+ "<h4 class='panel-title'>"
						+ "<a data-toggle='collapse' data-parent='#accordion' href='#ModelFive'>"
						+ "<div>"
						+ "<p class='modalFAQPanelContent'>How far apart can the Network (Window) Unit and the Coverage Unit be placed?</p>"
						+ "</div>"
						+ "<span class='pull-right faqSpan'>"
						+ "<span class='toggle-icon glyphicon glyphicon-chevron-down'></span>"
						+ "</span></a></h4></div>"
						+ "<div id='ModelFive' class='panel-collapse collapse'>"
						+ "<div class='panel-body'>"
						+ "<p class='modelFAQBodyContents'>"
						+ "Every instillation is different. The differences depend on the 'path loss' between the two units. Every obstacle in the line of sight means that the Coverage Unit and the Network Unit will have to be closer together. The cleaner the line of sight the further apart they can be placed. The more walls, doors, or refrigerators (obstacles), in the direct line of sight, the closer they units will have to be. The average distance for a typical construction home is 60 feet, however the placement can be as little as 20 feet or much as 120 feet apart."
						+ "</p></div></div></div>"	
						+ "<div class='divLineDivider'></div>"	
						+ "<div class='panel panel-default'>"				        
						+ "<div class='panel-heading'>"
						+ "<h4 class='panel-title'>"
						+ "<a data-toggle='collapse' data-parent='#accordion' href='#ModelSix'>"
						+ "<div>"
						+ "<p class='modalFAQPanelContent'>What coverage can I expect from a Cel-Fi system?</p>"
						+ "</div>"
						+ "<span class='pull-right faqSpan'>"
						+ "<span class='toggle-icon glyphicon glyphicon-chevron-down'></span>"
						+ "</span></a></h4></div>"
						+ "<div id='ModelSix' class='panel-collapse collapse'>"
						+ "<div class='panel-body'>"
						+ "<p class='modelFAQBodyContents'>"
						+ "The radius (half the width) of the coverage bubble is approximately the distance between the Coverage Unit and Network (window) Unit. Here are some examples:"
						+ "</br></br>Radius = 20 meters (66 ft.) for wood framed walls"
						+ "</br></br>Radius is less for concrete interior walls"
						+ "</br></br>Radius can easily exceed 65 meters (200 ft.) for open commercial spaces"
						+ "</p></div></div></div>"	
						+ "<div class='divLineDivider'></div>"
						+ "<div class='panel panel-default'>"				        
						+ "<div class='panel-heading'>"
						+ "<h4 class='panel-title'>"
						+ "<a data-toggle='collapse' data-parent='#accordion' href='#ModelSeven'>"
						+ "<div>"
						+ "<p class='modalFAQPanelContent'>Is it legal to use signal boosters?</p>"
						+ "</div>"
						+ "<span class='pull-right faqSpan'>"
						+ "<span class='toggle-icon glyphicon glyphicon-chevron-down'></span>"
						+ "</span></a></h4></div>"
						+ "<div id='ModelSeven' class='panel-collapse collapse'>"
						+ "<div class='panel-body'>"
						+ "<p class='modelFAQBodyContents'>"
						+ "Cel-Fi meets the newer regulatory requirements that allow a booster to be used (boosters that do not meet these requirements, which is the vast majority of them, are no longer legal).  For the FCC you can learn more by reading the new FCC Report and Order for signal boosters. According to these new regulations, consumers must receive permission from their carrier before using a booster. Consumer boosters sold after March 1, 2014, and some before that date will be marked with a label signifying it meets the FCC's new regulations."
						+ "</p></div></div></div>"	
						+ "<div class='divLineDivider'></div>"	
						+ "<div class='panel panel-default'>"				        
						+ "<div class='panel-heading'>"
						+ "<h4 class='panel-title'>"
						+ "<a data-toggle='collapse' data-parent='#accordion' href='#ModelEight'>"
						+ "<div>"
						+ "<p class='modalFAQPanelContent'>Is it necessary to register my Cel-Fi?</p>"
						+ "</div>"
						+ "<span class='pull-right faqSpan'>"
						+ "<span class='toggle-icon glyphicon glyphicon-chevron-down'></span>"
						+ "</span></a></h4></div>"
						+ "<div id='ModelEight' class='panel-collapse collapse'>"
						+ "<div class='panel-body'>"
						+ "<p class='modelFAQBodyContents'>"
						+ "If booster registration is required in your country, your system may arrive pre-registered or you may be asked to (it's very simple).  See your product insert for details.</br></br>"
						+ "The FCC is now requiring all boosters in the U.S. to be approved for use by the Operator, and that all consumers register their boosters.  To learn more please visit the FCC site: http://wireless.fcc.gov/signal-boosters/index.html"  
						+ "</p></div></div></div>"	
						+ "<div class='divLineDivider'></div>"
						+ "<div class='panel panel-default'>"				        
						+ "<div class='panel-heading' >"
						+ "<h4 class='panel-title'>"
						+ "<a data-toggle='collapse' data-parent='#accordion' href='#ModelNine'>"
						+ "<div>"
						+ "<p class='modalFAQPanelContent'>How do I register my Cel-Fi system?</p>"
						+ "</div>"
						+ "<span class='pull-right faqSpan'>"
						+ "<span class='toggle-icon glyphicon glyphicon-chevron-down'></span>"
						+ "</span></a></h4></div>"
						+ "<div id='ModelNine' class='panel-collapse collapse'>"
						+ "<div class='panel-body'>"
						+ "<p class='modelFAQBodyContents'>"
						+ "The process is very simple and just takes a minute by following the link below to your Operator's Registration site.  If your system was provided by your Operator it may be preregistered (see product box insert)."
						+ "</br></br>In the USA:</br></br>If your operator is T-Mobile, MetroPCS, TruPhone, or another T-Mobile network operator please register your booster at: www.T-Mobile.com/BoosterRegistration</br></br>If your operator is AT&T, Aio, or another AT&T network operator please register your booster at: www.attsignalbooster.com" 
						+ "</p></div></div></div>" 
						+ "<div class='divLineDivider'></div>"	
						+ "<div class='panel panel-default'>"				        
						+ "<div class='panel-heading'>"
						+ "<h4 class='panel-title'>"
						+ "<a data-toggle='collapse' data-parent='#accordion' href='#ModelTen'>"
						+ "<div>"
						+ "<p class='modalFAQPanelContent'>Why do I have to register my Cel-Fi?</p>"
						+ "</div>"
						+ "<span class='pull-right faqSpan'>"
						+ "<span class='toggle-icon glyphicon glyphicon-chevron-down'></span>"
						+ "</span>"
						+ "</a></h4></div>"
						+ "<div id='ModelTen' class='panel-collapse collapse'>"
						+ "<div class='panel-body'>"
						+ "<p class='modelFAQBodyContents'>"
						+ "Why is this being done?  Because cellular systems are protected assets of the Operators that own them.  Many boosters in the market cause problems for those networks (which means all of us using the networks too).  New FCC/Operator approved boosters are better and don't cause problems, and Cel-Fi is the only booster in a special class of boosters that allows 100 dB of signal gain (30 dB or 1000x the gain of all other boosters)."  
						+ "</p></div></div></div>"	
						+ "<div class='divLineDivider'></div>"	
						+ "<div class='panel panel-default'>"				        
						+ "<div class='panel-heading'>"
						+ "<h4 class='panel-title'>"
						+ "<a data-toggle='collapse' data-parent='#accordion' href='#ModelEleven'>"
						+ "<div>"
						+ "<p class='modalFAQPanelContent'>Will Cel-Fi boost the signal for Verizon or Sprint?</p>"
						+ "</div>"
						+ "<span class='pull-right faqSpan'>"
						+ "<span class='toggle-icon glyphicon glyphicon-chevron-down'></span>"
						+ "</span></a></h4></div>"
						+ "<div id='ModelEleven' class='panel-collapse collapse'>"
						+ "<div class='panel-body'>"
						+ "<p class='modelFAQBodyContents'>"
						+ "At this time Verizon and Sprint will not work with any of the Cel-Fi products. We are always adding new technology to the Cel-Fi device line-up. Feel free to sign up for exclusive news and blog emails at the bottom of the page."
						+ "</p></div></div></div>"	
						+ "<div class='divLineDivider'></div>"	
						+ "<div class='panel panel-default'>"				        
						+ "<div class='panel-heading'>"
						+ "<h4 class='panel-title'>"
						+ "<a data-toggle='collapse' data-parent='#accordion' href='#ModelTweleve'>"
						+ "<div>"
						+ "<p class='modalFAQPanelContent'>Can Cel-Fi boost the signal of multiple cellular networks at once?</p>"
						+ "</div>"
						+ "<span class='pull-right faqSpan'>"
						+ "<span class='toggle-icon glyphicon glyphicon-chevron-down'></span>"
						+ "</span></a></h4></div>"
						+ "<div id='ModelTweleve' class='panel-collapse collapse'>"
						+ "<div class='panel-body'>"
						+ "<p class='modelFAQBodyContents'>"
						+ "Cel-Fi signal boosters are Operator specific, and will only boost one Operator's channels at a time. Being Operator specific is one of the main reasons that we are network safe and can provide 100 dB of signal gain, and why we are the only signal booster approved by a growing number of Operators."
						+ "</p></div></div></div>"	
						+ "<div class='divLineDivider'></div>"	
						+ "<div class='panel panel-default'>"				        
						+ "<div class='panel-heading'>"
						+ "<h4 class='panel-title'>"
						+ "<a data-toggle='collapse' data-parent='#accordion' href='#ModelFourteen'>"
						+ "<div>"
						+ "<p class='modalFAQPanelContent'>Why is 100 dB of gain so important?</p>"
						+ "</div>"
						+ "<span class='pull-right faqSpan'>"
						+ "<span class='toggle-icon glyphicon glyphicon-chevron-down'></span>"
						+ "</span></a></h4></div>"
						+ "<div id='ModelFourteen' class='panel-collapse collapse'>"
						+ "<div class='panel-body'>"
						+ "<p class='modelFAQBodyContents'>"
						+ "System gain is critical to a booster's performance because it tells us how much a signal may be improved and how beneficial the boosted signal can be.  Example: If you have a low level signal such as -90 dBm per carrier, adding 100 dB of System Gain gives +10 dBm per carrier which can cover a large area.  In contrast adding only 70 dB of gain would only give -20 dBm of signal per carrier which would only cover a very small space.  Therefore a booster with a gain of 70 dB would need a very strong donor signal to be of much use, regardless of the stated transmit power that likely is going unused.</br></br>In other words, the higher the gain of the booster, the better it will work, even when far away from a base station."
						+ "</p></div></div></div>"	
						+ "<div class='divLineDivider'></div>"	
						+ "<div class='panel panel-default'>"				        
						+ "<div class='panel-heading'>"
						+ "<h4 class='panel-title'>"
						+ "<a data-toggle='collapse' data-parent='#accordion' href='#ModelFifteen'>"
						+ "<div>"
						+ "<p class='modalFAQPanelContent'>Is Cel-Fi carrier/operator specific?</p>"
						+ "</div>"
						+ "<span class='pull-right faqSpan'>"
						+ "<span class='toggle-icon glyphicon glyphicon-chevron-down'></span>"
						+ "</span></a></h4></div>"
						+ "<div id='ModelFifteen' class='panel-collapse collapse'>"
						+ "<div class='panel-body'>"
						+ "<p class='modelFAQBodyContents'>"
						+ "Yes, and for a good reason!  Cel-Fi is controlled by and operates as an extension of an operator's network.  This is what allows Cel-Fi (by regulatory authority) to boost signals about 1000x more than other solutions, and therefore cover very large areas even if the original network signal is weak.  And it works very well.</br></br>Broad-spectrum repeaters can cause interference and damage to networks, so operators have adopted a strict policy against the use of these legacy signal boosters on their own networks. However, Cel-Fi (the only smart signal booster of its kind), is authorized for use by each carrier and allowed to transmit on their licensed spectrum without ruining things for anyone else."
						+ "</p></div></div></div>"	
						+ "<div class='divLineDivider'></div>"	
						+ "<div class='panel panel-default'>"				        
						+ "<div class='panel-heading' >"
						+ "<h4 class='panel-title'>"
						+ "<a data-toggle='collapse' data-parent='#accordion' href='#ModelSixteen'>"
						+ "<div>"
						+ "<p class='modalFAQPanelContent'>Why doesn't Cel-Fi work with different operators?</p>"
						+ "</div>"
						+ "<span class='pull-right faqSpan'>"
						+ "<span class='toggle-icon glyphicon glyphicon-chevron-down'></span>"
						+ "</span></a></h4></div>"
						+ "<div id='ModelSixteen' class='panel-collapse collapse'>"
						+ "<div class='panel-body'>"
						+ "<p class='modelFAQBodyContents'>"
						+ "Not all cellular operators use the same technologies, and we do not boost the every technology available around the world. The Cel-Fi systems will support 3G(UMTS/WCMDA), 4G(HSPA & HAPS+), and LTE technology of operators that have approved the use of Cel-Fi on their network. You can reach out to your operator for more information on what specific technology they use."
						+ "</p></div></div></div>"	
						+ "<div class='divLineDivider'></div>"	
						+ "<div class='panel panel-default'>"				        
						+ "<div class='panel-heading'>"
						+ "<h4 class='panel-title'>"
						+ "<a data-toggle='collapse' data-parent='#accordion' href='#ModelSeventeen'>"
						+ "<div>"
						+ "<p class='modalFAQPanelContent'>What technologies does Cel-Fi support?</p>"
						+ "</div>"
						+ "<span class='pull-right faqSpan'>"
						+ "<span class='toggle-icon glyphicon glyphicon-chevron-down'></span>"
						+ "</span></a></h4></div>"
						+ "<div id='ModelSeventeen' class='panel-collapse collapse'>"
						+ "<div class='panel-body'>"
						+ "<p class='modelFAQBodyContents'>Cel-Fi system will support 3G(UMTS/WCDMA), 4G (HSPA/HSPA+) and LTE.</br></br>Each Cel-Fi system is different. Check your box for a Quick Start Guide, or visits the support section of our website for more specific information about your specific product."
						+ "</p></div></div></div>"	
						+ "<div class='divLineDivider'></div>"
						+ "<div class='panel panel-default'>"				        
						+ "<div class='panel-heading' >"
						+ "<h4 class='panel-title'>"
						+ "<a data-toggle='collapse' data-parent='#accordion' href='#ModelEighteen'>"
						+ "<div>"
						+ "<p class='modalFAQPanelContent'>I've installed Cel-Fi but I do not see more bars on my phone.</p>"
						+ "</div>"
						+ "<span class='pull-right faqSpan'>"
						+ "<span class='toggle-icon glyphicon glyphicon-chevron-down'></span>"
						+ "</span></a></h4></div>"
						+ "<div id='ModelEighteen' class='panel-collapse collapse'>"
						+ "<div class='panel-body'>"
						+ "<p class='modelFAQBodyContents'>There could be several reasons for this: First you can try rebooting your phone near the Coverage Unit so it takes a fresh look at the available channels. Also verify that your phone is compatible with the channels that your Cel-Fi model is boosting (maybe your handset is “unlocked” and actually does not fully support all your current Operator's channels). iPhones can also show fewer 'bars' of signal if the network is heavily loaded (click here to learn more).</br></br>Note that Cel-Fi RS1 and RS2 models do not support LTE. If your phone is LTE capable and therefore is not showing boosted service, if needed it is designed to switch over to non-LTE services when it needs to, such as in a call. This is true with or without Cel-Fi and what matters is that now you have reliable service where you need it!</br></br>If you would like the benefits of LTE service as well, you can always upgrade your Cel-Fi to a newer version that also supports LTE."
						+ "</p></div></div></div>"	
						+ "<div class='divLineDivider'></div>"
						+ "<div class='panel panel-default'>"				        
						+ "<div class='panel-heading' >"
						+ "<h4 class='panel-title'>"
						+ "<a data-toggle='collapse' data-parent='#accordion' href='#ModelNineteen'>"
						+ "<div>"
						+ "<p class='modalFAQPanelContent'>Once installed, will the Cel-Fi require maintenance, or adjustments if changes occur to the native cellular network?</p>"
						+ "</div>"
						+ "<span class='pull-right faqSpan'>"
						+ "<span class='toggle-icon glyphicon glyphicon-chevron-down'></span>"
						+ "</span></a></h4></div>"
						+ "<div id='ModelNineteen' class='panel-collapse collapse'>"
						+ "<div class='panel-body'>"
						+ "<p class='modelFAQBodyContents'>No. Cel-fi does not require any maintenance. The Cel-Fi systems will self-adjust and reconfigure automatically to changing cellular networks situations."
						+ "</p></div></div></div>"	
						+ "<div class='divLineDivider'></div>"
						+ "<div class='panel panel-default'>"				        
						+ "<div class='panel-heading'>"
						+ "<h4 class='panel-title'>"
						+ "<a data-toggle='collapse' data-parent='#accordion' href='#ModelTwenty'>"
						+ "<div>"
						+ "<p class='modalFAQPanelContent'>What is IntelliBoost?</p>"
						+ "</div>"
						+ "<span class='pull-right faqSpan'>"
						+ "<span class='toggle-icon glyphicon glyphicon-chevron-down'></span>"
						+ "</span></a></h4></div>"
						+ "<div id='ModelTwenty' class='panel-collapse collapse'>"
						+ "<div class='panel-body'>"
						+ "<p class='modelFAQBodyContents'>The Nextivity IntelliBoost Baseband Processor is the first core processor designed specifically to optimize the indoor transmission and reception of 3G and 4G/LTE wireless signals. With advanced filtering, equalization and echo cancellation techniques, Nextivity has developed an embedded architecture which delivers unprecedented in-building data rates and pervasive 3G and 4G/LTE connectivity. The IntelliBoost processor ensures that Cel-Fi products never negatively impact the macro network while providing maximum coverage."											
						+ "</p></div></div></div>"	
						+ "<div class='divLineDivider'></div>"
						+ "<div class='panel panel-default'>"				        
						+ "<div class='panel-heading' >"
						+ "<h4 class='panel-title'>"
						+ "<a data-toggle='collapse' data-parent='#accordion' href='#ModelTwentyOne'>"
						+ "<div>"
						+ "<p class='modalFAQPanelContent'>What frequencies link the Network (Window) Unit and Coverage Unit?</p>"
						+ "</div>"
						+ "<span class='pull-right faqSpan'>"
						+ "<span class='toggle-icon glyphicon glyphicon-chevron-down'></span>"
						+ "</span></a></h4></div>"
						+ "<div id='ModelTwentyOne' class='panel-collapse collapse'>"
						+ "<div class='panel-body'>"
						+ "<p class='modelFAQBodyContents'>Cel-Fi automatically selects clear, unused channels from the UNII bands (5.15-5.35 GHz, 5.47-5.725 GHz and 5725-5825 GHz) for communication between the Network (Window) Unit and the Coverage Unit. While in some cases these are the same frequencies as Wi-Fi, the Cel-Fi system uses a proprietary protocol for communication and is designed to work in harmony with existing wireless devices such as Wi-Fi routers, cordless telephones or baby monitors."
						+ "</p></div></div></div>"	
						+ "<div class ='divLineDivider' id='BottomDivMargin'>"							
						+ "</div></div></div>";
		
		$(faqDetails).appendTo('.modalBodyWrapper');
		$('.headerContainer, #bodyContainer').hide();
		$('.modalWrapper').show();
	},
	
	registrationInfo: function () {
		$('#modalTitle').html('Registration');
	},
	
	contactInfo: function () {
		// Yet to be given
		$('#modalTitle').html('Contact Us');
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
		        errFooter.className = "noSignalError"
		        var errBtn = util.createAppendElem("button", "errDeviceSearch", "defaultButton fr", errFooter);
		        errBtn.innerHTML = errorHandler.searchDeviceAgainBtnContent;
		        errBtn.addEventListener("click", function(){
		        	util.hideCommonPopup();
		        	util.showSearchAnimation();
		        }, false);
		        
		        var sgnlFndrBtn = util.createAppendElem("button", "sgnlFndrBtn", "sgnlFndrBtn defaultButton fl", errFooter);
		        sgnlFndrBtn.innerHTML = "Signal Finder";
		        break;
				
			case "registrationError":
		        var errObj = errorHandler.registrationError;
				break;
			
			case "linkDown":
				var errObj = errorHandler.linkDownError;
		        var errBtn = util.createAppendElem("button", "errLinkDown", "defaultButton", errFooter);
		        errBtn.innerHTML = errorHandler.tryAgainBtnContent;
		        errBtn.addEventListener("click", function(){
		        	util.hideCommonPopup();
		        	HandleUniiRetry(1);}, false);
				break;
				
			case "updatePIC":
				var errObj = errorHandler.updatePICError;
		        var errBtn = util.createAppendElem("button", "errupdatePIC", "defaultButton", errFooter);
		        errBtn.innerHTML = errorHandler.updateNowBtnContent;
		        errBtn.addEventListener("click", function(){
		        	util.hideCommonPopup();
		        	HandlePicUpdateConfirmation(1);}, false);
				break;
				
			case "noWifiORCell":
				var errObj = errorHandler.noWifiError;
		        var errBtn = util.createAppendElem("button", "errNoWifi", "defaultButton", errFooter);
		        errBtn.innerHTML = errorHandler.tryAgainBtnContent;
		        errBtn.addEventListener("click", function(){
		        	util.hideCommonPopup();
		        	HandleCloudRetry(1);}, false);
				break;
			
			case "USBCommand":
				var errObj = errorHandler.USBCommandError;
		        var errBtn = util.createAppendElem("button", "errUSBCommand", "defaultButton", errFooter);
		        errBtn.innerHTML = errorHandler.tryAgainBtnContent;
		        errBtn.addEventListener("click", function(){
		        	util.hideCommonPopup();
		        	HandleUsbConflictConfirmation(1);}, false);
				break;
				
			case "unableGPS":
				var errObj = errorHandler.unableGPSError;
		        var errBtn = util.createAppendElem("button", "errUnableGPS", "defaultButton", errFooter);
		        errBtn.innerHTML = errorHandler.locationAcquiredBtnContent;
		        errBtn.addEventListener("click", function(){
		        	util.hideCommonPopup();
		        	HandleLocationBack(1);}, false);
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

var splashScreen = {
	initiate: function(){
		window.localStorage.setItem("deviceType", deviceType);
		if(deviceType == "phone"){
			window.plugins.orientationchanger.lockOrientation('portrait');
		}
		$('body').html(mainContainerWithoutMenu);
		mainContainer = document.getElementById("mainContainer");
		mainContainer.className = "connectionBG";
		deviceHeight = document.documentElement.clientHeight;
		deviceWidth = document.documentElement.clientWidth;
		var logoContainer = document.createElement("div");
		logoContainer.id= "logoContainer";
		logoContainer.align = "center";
		logoContainer.className = "w100 vh100";
		mainContainer.appendChild(logoContainer);
		/*if(window.localStorage.getItem("deviceType")=="phone"){
	    	mainContainer.style.height = deviceHeight+"px";
			mainContainer.style.width = deviceWidth+"px";
	    }*/
		setTimeout(function(){ app.initialize(); }, 2000);
		//setTimeout(function(){ window.location = "registration.html"; }, 2000);
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
