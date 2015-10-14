//=================================================================================================
//
//  File: usbPcApp.js
//
//  Description:  This file contains all functionality to connect and maintain a connection
//                to a Nextivity device via USB connection.
//
//
//                External functionality that must be maintained to support the SouthBound IF concept:
//
//                - OpenSouthBoundIf()
//                - WriteSouthBoundData()
//                - Response data must call function nxty.ProcessNxtyRxMsg().
//
//                - Flags
//                  - isSouthBoundIfStarted:    Check is isSouthBoundIfEnabled after isShouthBoundIfStarted is true...
//                  - isSouthBoundIfEnabled:
//                  - isSouthBoundIfCnx:        Set "true" or "false" accordingly.
//
//                - Messages
//                  - szSouthBoundIfEnableMsg
//                  - szSouthBoundIfNotCnxMsg
//                  - szSouthBoundIfInfoMsg
//
//=================================================================================================


// Use the following global variables to determine South Bound IF status.
var isSouthBoundIfStarted   = false;    // Check is isSouthBoundIfEnabled after isShouthBoundIfStarted is true...
var isSouthBoundIfEnabled   = false;
var isSouthBoundIfCnx       = false;
var szSouthBoundIfEnableMsg = "USB Required: Please Enable...";
var szSouthBoundIfNotCnxMsg = "USB not connected.";
var szSouthBoundIfInfoMsg   = "Indicates if connected to Cel-Fi device via USB.\nBlue means connected.\nGray means not connected.\nCurrent status: ";


var QtSerEngIf              = null; // the QT object that will inteface to the unit using the SerialEngine
var UsbInitIntervalHandle   = null; // loop handle that will try initialize the USB


var u8TxBuff          = new Uint8Array(260);  
var u8RxBuff          = new Uint8Array(260);  
var uTxMsgLen         = 0;


// OpenSouthBoundIf...................................................................................
function OpenSouthBoundIf()
{
    PrintLog(10, "OpenSouthBoundIf");
    isSouthBoundIfEnabled = false;
    isSouthBoundIfStarted = false;
    UsbInitIntervalHandle = setInterval(UsbNativeInit, 1000 ); // start timer that will try and open port
    UpdateUsbIcon(false);
}


// UsbNativeInit....................................................................................
function UsbNativeInit()
{
    if(QtSerEngIf != null)
    {
        if( true == QtSerEngIf.OpenUsbPort())
        {
            clearInterval(UsbInitIntervalHandle);
            isSouthBoundIfEnabled = true;
            isSouthBoundIfStarted = true;
        }
    }
}

// UpdateUsbIcon....................................................................................
function UpdateUsbIcon(cnx)
{
    if(cnx)
    {
        guiIconSbIfHtml       = szSbIfIconOn;
        isSouthBoundIfCnx     = true;
    }
    else
    {
        guiIconSbIfHtml       = szSbIfIconOff;
        isSouthBoundIfCnx     = false;
    }
}



// WriteSouthBoundData........................................................................
function WriteSouthBoundData( u8 )
{
    var i;
    
    // Check msg length...
    if( u8.length > u8TxBuff.length )
    {
        PrintLog(99, "USB: WriteSouthBoundData(len=" + u8.length + "): More than " + NXTY_BIG_MSG_SIZE + " bytes." );
        return;
    }

    uTxMsgLen  = u8.length;
    uTxBuffIdx = 0;

    // Transfer the complete message to our working buffer...
    var outText = "Msg Tx:"
    for( i = 0; i < uTxMsgLen; i++ )
    {
        u8TxBuff[i] = u8[i];
        outText = outText + " " + u8[i].toString(16);
    }
    PrintLog(10,  outText );


    // call SerialEngine with the bytes
    if(QtSerEngIf!=null)
        QtSerEngIf.WriteNxtyMsgToDevice(uTxMsgLen, u8TxBuff);  // Will callback into function nxty.ProcessNxtyRxMsg() when done    
}

// -------------------- http://ntt.cc/2008/01/19/base64-encoder-decoder-with-javascript.html
  var keyStr = "ABCDEFGHIJKLMNOP" +
               "QRSTUVWXYZabcdef" +
               "ghijklmnopqrstuv" +
               "wxyz0123456789+/" +
               "=";
  function encode64(input) {
     input = escape(input);
     var output = "";
     var chr1, chr2, chr3 = "";
     var enc1, enc2, enc3, enc4 = "";
     var i = 0;

     do {
        chr1 = input.charCodeAt(i++);
        chr2 = input.charCodeAt(i++);
        chr3 = input.charCodeAt(i++);

        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;

        if (isNaN(chr2)) {
           enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
           enc4 = 64;
        }

        output = output +
           keyStr.charAt(enc1) +
           keyStr.charAt(enc2) +
           keyStr.charAt(enc3) +
           keyStr.charAt(enc4);
        chr1 = chr2 = chr3 = "";
        enc1 = enc2 = enc3 = enc4 = "";
     } while (i < input.length);

     return output;
  }

  function decode64(input) {
     var output = "";
     var chr1, chr2, chr3 = "";
     var enc1, enc2, enc3, enc4 = "";
     var i = 0;

     // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
     var base64test = /[^A-Za-z0-9\+\/\=]/g;
     if (base64test.exec(input)) {
        alert("There were invalid base64 characters in the input text.\n" +
              "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
              "Expect errors in decoding.");
     }
     input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

     do {
        enc1 = keyStr.indexOf(input.charAt(i++));
        enc2 = keyStr.indexOf(input.charAt(i++));
        enc3 = keyStr.indexOf(input.charAt(i++));
        enc4 = keyStr.indexOf(input.charAt(i++));

        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;

        output = output + String.fromCharCode(chr1);

        if (enc3 != 64) {
           output = output + String.fromCharCode(chr2);
        }
        if (enc4 != 64) {
           output = output + String.fromCharCode(chr3);
        }

        chr1 = chr2 = chr3 = "";
        enc1 = enc2 = enc3 = enc4 = "";

     } while (i < input.length);

     return unescape(output);
  }
// --------------------


var N=0;
function WriteSouthBoundDataResult( passfail, u8len, u8 ) //return incrementing message counter for pass, else return empty QVariant to QT when someting fails
{
    var decodedData = decode64(u8);
    //PrintLog(10, "WriteSouthBoundDataResult callback triggered" );
    //PrintLog(10, "   passfail=" + passfail );
    //PrintLog(10, "   u8len=" + u8len );
    //PrintLog(10, "   u8=" + u8 );
    //PrintLog(10, "   decodedData=" + decodedData );

    //var outText = "Msg Rx: "
    for( i = 0; i < decodedData.length; i++ )
    {
        u8RxBuff[i] = decodedData.charCodeAt(i);
        //outText = outText + " " + u8RxBuff[i].toString(16);
    }
    //PrintLog(10,  outText );
    
    nxty.ProcessNxtyRxMsg( u8RxBuff, decodedData.length );
    
    return N++;
}

//var percentageDone = 0;
//function ProgramSouthBoundFile( eModuleType, sFilename, nAddress ){percentageDone = 0; return true; }
//function ProgramSouthBoundFileProgress(){percentageDone = percentageDone + 3;return percentageDone;}

function ProgramSouthBoundFile( eModuleType, sFilename, nAddress )
{
    if(QtSerEngIf!=null)
    {
        return QtSerEngIf.ProgramFileToAddress( eModuleType, sFilename, nAddress );
    }
    return false;
}

function ProgramSouthBoundFileProgress()
{
    return QtSerEngIf.ProgramFileToAddressProgress();
}

