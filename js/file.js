//=================================================================================================
//
//  File: file.js
//
//  Description:  Support file which contains all mobile phone file functionality.
//
//      OpenFileSyste()
//      ReadFile()
//      WriteFile()
//          Requires:     <gap:plugin name="org.apache.cordova.file" />
//
//      FileTransferDownload()
//          Requires:    <gap:plugin name="org.apache.cordova.file-transfer" />       
//
//=================================================================================================

// Global file variables.......................................................
var g_fileSystemDir                 = null;
var g_fileReadSuccess               = null;
var g_fileReadEvent                 = null;
var g_fileTransferSuccess           = null;


var bfileOpenLogFileSuccess         = null;
var bfileWriteInProgress            = false;
var fileWriterObject                = null;
var fileWriteBuffer                 = "";


// Local file variables........................................................
var tempFileName                    = null;





// Global File System calls .....................................................................................

// OpenFileSystem................................................................................................
//
//   Opens the file system on the phone for access.
//     Android: Download directory
//     IOS:     Documents directory (Should be able to be seen using iTunes)
// 
//  Input: none
//
//  Outputs: g_fileSystemDir set via callback.
//
function OpenFileSystem() 
{
    if( window.device.platform == iOSPlatform )
    {
        // This gets a file system pointing to the App's documents directory on IOS....
        window.resolveLocalFileSystemURL( cordova.file.documentsDirectory, onFSSuccessCB, onFSErrorCB);
    }
    else
    {
        // This gets a file system pointing to the Download directory on Android....
        window.resolveLocalFileSystemURL( "file:///storage/emulated/0/Download/", onFSSuccessCB, onFSErrorCB);
    }
} 


// ReadFile................................................................................................
//
//   Reads a file from the file system directory and copies it into the u8 buffer passed in.
// 
//  Input: fileName:   Name of file to open and read.
//
//  Outputs: g_fileReadSuccess:     set to null then true or false via callback.
//           g_fileReadEvent:       file event information and contents.  File contents are in evt.target.result
//
//
function ReadFile( myFileName ) 
{
    g_fileReadSuccess = null;
    g_fileReadEvent   = null;
    tempFileName      = myFileName;
    g_fileSystemDir.getFile( myFileName, {create:false}, onReadFileSuccessCB, onReadFileErrorCB );
}                  

// OpenLogFile..............................................................................................
//
//   Opens a log file in the file system directory for writing.
// 
//  Input: none:  File name hardcoded to "wave.log"
//
//  Outputs: bfileOpenLogFileSuccess:     set to true or false via callback.
//           fileWriteObject:             Used internally to write to the file.
//
//
function OpenLogFile() 
{
    bfileOpenLogFileSuccess = false;
    fileWriterObject        = null;
    g_fileSystemDir.getFile( "wave.log", {create:true, exclusive: false}, onOpenWriteFileSuccessCB, onOpenWriteFileErrorCB );
}                  

// WriteLogFile..............................................................................................
//
//   Writes a string of data to the log file, "wave.log" if opened successfully.
// 
//  Input: string to write.
//
//  Outputs: none
//
//
function WriteLogFile( myData )
{
    if( bfileOpenLogFileSuccess )
    {
        // Make it a new line in the log file.
        fileWriteBuffer += "\n" + myData;
          
        if( bfileWriteInProgress == false)
        {
            bfileWriteInProgress = true;
            fileWriterObject.write( fileWriteBuffer );
            fileWriteBuffer = "";
        }
    }
}


// FileTransferDownload..............................................................................................
//
//  Downloads a file from server.
// 
//  Input: fromUrl:  URL to download from including file name.
//         toUrl:    URL to download to including file name.
//
//  Outputs: none
//
//
function FileTransferDownload( fromUrl, toUrl )
{

    PrintLog(1, "FileTransferDownload: from: " + fromUrl + "  to: " + toUrl );

    // Perform a file transfer from the platform to the destination directory...        
    var fileTransfer = new FileTransfer();         
    
    g_fileTransferSuccess   = null;
    
    fileTransfer.download(
           fromUrl,
           toUrl,
           onFileTransferSuccessCB,
           onFileTransferFailCB );
}


// CopyFile..............................................................................................
//
//   Copies a file from the distribution into the download directory.
//     - Android: apk to download directory
//     - IOS:     ipa to documents directory
// 
//  Inputs: 
//           fromFileName:      Distribution file name compiled with APK/IPA
//           toFileName:        File name for the Download or Documents directory.
//
//  Outputs: none
//
//
// The following talks about how the files in the Android apk are not available using the file system.
// http://stackoverflow.com/questions/21880109/phonegap-how-to-access-file-in-www-folder
//
function CopyFile( fromFileName, toFileName )
{

    PrintLog(1, "CopyFile( " + fromFileName + ", " + toFileName + " )" );

    // Had to use XMLHttpRequest(), XHR, to get file from APK since the File plugins do not work for APK files.
    var xReq = new XMLHttpRequest();
    xReq.open("GET", fromFileName, true);
    xReq.responseType = "arraybuffer";
    
    xReq.onload = function(xEvent) 
    {
        var arrayBuffer = xReq.response;      // Note: not xReq.responseText
      
        if( arrayBuffer ) 
        {
            WriteDownloadFile( toFileName, arrayBuffer );
        }
    }

    xReq.send(null);

}



// WriteDownloadFile..............................................................................................
//
//   Writes a data object to the file specified in the apps download directory.
//     - Used to copy a file included with the application to the download directory.
// 
//  Inputs: 
//           fileName:         Will create if necessary or overwrite if existing.
//           dataObject:       Data to be written.
//
//  Outputs: none
//
//
function WriteDownloadFile( fileName, dataObject )
{
    PrintLog(1, "WriteDownloadFile( " + fileName + ", data )" );
    
    g_fileSystemDir.getFile( fileName, {create:true, exclusive: false},         // Create a file in the Download (Android) or Documents (IOS) directory 
        function(fileEntry)                 // Success
        {
            fileEntry.createWriter(
                function(fileWriter)        // Success
                {
                    fileWriter.write( dataObject );
                },
                function(err)               // Fail
                {
                    PrintLog(99, "Unable to createWriter for file " + fileName + " Error:" + err.toString() );
                }
            );
        },
        function(err)                       // Fail
        {
            PrintLog(99, "Unable to open file " + fileName + " Error:" + err.toString() );
        }
    );
}



// End of File System calls .....................................................................................






// File System callbacks.  Get a file system on the phone........................................................
function onFSSuccessCB(fs) 
{
    g_fileSystemDir = fs;
    PrintLog(1, "Got filesystem on directory: " + g_fileSystemDir.toURL() );

// jdo: IOS has issues with log file.
if( window.device.platform != iOSPlatform )
{
    // Open a log file for writing...
    OpenLogFile();
}    
    
} 

function onFSErrorCB(e) 
{
    PrintLog(99, e.toString() );
} 
// End of File System callbacks.  Get a file system that points to the download directory................................










// Read File callbacks.  ................................................................................................
function onReadFileSuccessCB(fileEntry) 
{
    PrintLog(1, "onReadFileSuccessCB()");
    fileEntry.file(onFileSuccessCB, onFileErrorCB);
}

function onReadFileErrorCB(e) 
{
    PrintLog(99, "Unable to open file: " + tempFileName + "  Error:" + e.toString() );
    g_fileReadSuccess = false;
    
    ShowAlertPopUpMsg( "File Open Error", "Unable to open file: " + tempFileName);

}


function onFileSuccessCB(file)
{
    PrintLog(1, "onFileSuccessCB()");
    readAsArrayBuffer(file);
}

function onFileErrorCB(e) 
{
    PrintLog(99, e.toString() );
    g_fileReadSuccess = false;
}




function readAsArrayBuffer(file) 
{
    var reader     = new FileReader();
    reader.onload  = ReadFileOnLoadCB;       // Called when the read has successfully completed.
    reader.onerror = ReadFileOnErrorCB;      // Called when the read has failed.
      
    reader.readAsArrayBuffer(file);
}

function ReadFileOnLoadCB(evt)
{
    PrintLog(1, "ReadFile Callback success: evt=" + JSON.stringify(evt) );
    g_fileReadSuccess = true;
    g_fileReadEvent   = evt;
}

function ReadFileOnErrorCB(evt)
{
    PrintLog(1, "Unable to read file: " + tempFileName );
    g_fileReadSuccess = false;

    ShowAlertPopUpMsg("File Read Error", "Unable to read file: " + tempFileName);
}
// End of Read File call backs....................................................................................




// Write File callbacks.  ................................................................................................
function onOpenWriteFileSuccessCB(fileEntry) 
{
    PrintLog(1, "onOpenWriteFileSuccessCB()");
    fileEntry.createWriter(onCreateWriterSuccessCB, onCreateWriterErrorCB);
}

function onOpenWriteFileErrorCB(e) 
{
    PrintLog(99, "Unable to open file: wave.log  Error:" + e.toString() );
}


function onCreateWriterSuccessCB(fileWriter)
{
    PrintLog(1, "onCreateWriterSuccessCB()");

    fileWriter.onwriteend   = WriteFileOnEndCB;      // Called when the file is written to.
    fileWriter.onerror      = WriteFileOnErrorCB;    // Called when the write has failed.

    fileWriterObject        = fileWriter;
    bfileOpenLogFileSuccess = true;
    bfileWriteInProgress    = true;
    
    var devText = "Log file opened: " + Date() + " Print level: " + PrintLogLevel + "\nPhone Model: " + window.device.model + "  OS: " + window.device.platform + " Ver: " + window.device.version;
    fileWriterObject.write( devText );
}

function onCreateWriterErrorCB(e) 
{
    PrintLog(99, "Unable to createWriter for file wave.log  Error:" + e.toString() );
}





function WriteFileOnEndCB(e)
{
    bfileWriteInProgress = false;
//    PrintLog(1, "Write file just finished successfully" + JSON.stringify(e) );
}

function WriteFileOnErrorCB(e)
{
//    PrintLog(1, "Write file failied: " + e.toString() );
}
// End of Write File call backs....................................................................................





// Download from Cloud File transfer callbacks..................................................................
function onFileTransferSuccessCB(successFile)
{
    PrintLog(1, "Download from cloud successfully complete: " + successFile.toURL());
    g_fileTransferSuccess = true;
}

function onFileTransferFailCB(error)
{
    var errText = "Download from cloud: source: " + error.source + " Target: " + error.target + " Error code: " + error.code;
    
    switch( error.code )
    {
        case 1: errText += " (File not found)";     break;
        case 2: errText += " (Invalid URL)";        break;
        case 3: errText += " (Connection error)";   break;
        case 4: errText += " (Abort error)";        break;
        case 5: errText += " (Not modified)";       break;
    }
    
    PrintLog(99, errText);
    g_fileTransferSuccess = false;
}
// End of Download from Cloud File transfer callbacks..................................................................








