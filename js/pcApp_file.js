//=================================================================================================
//
//  File: filePcApp.js
//
//  Description:  Support file which contains all file system functionality.
//
//      OpenFileSystem()
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




// Local file variables........................................................
var bfileOpenLogFileSuccess         = null;
var bfileWriteInProgress            = false;
var fileWriterObject                = null;
var fileWriteBuffer                 = "";

var QtFileSystemIf                  = null; // the QT object that will do the actual work
var FileInitIntervalHandle          = null; // loop handle that will try initialize the filesystem and get path to temp dir




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
    PrintLog(10, "OpenFileSystem");
    FileInitIntervalHandle = setInterval(FileWaitNativeInit, 1000 ); // start timer
}

function FileWaitNativeInit()
{
    if(QtFileSystemIf != null)
    {
        clearInterval(FileInitIntervalHandle);
        g_fileSystemDir = QtFileSystemIf.GetDownloadDir("");
        PrintLog(10, "FileWaitNativeInit: Got filesystem on directory: " + g_fileSystemDir);
    }
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
    fileWriteBuffer += myData;
    if(QtFileSystemIf != null)
    {
        QtFileSystemIf.WriteLogFile(fileWriteBuffer);
        fileWriteBuffer = "";
    }
    else
        fileWriteBuffer += "\n";
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
    PrintLog(10, "ReadFile:" + myFileName);
    if(QtFileSystemIf != null)
    {
        if(true == QtFileSystemIf.doesFileExist(myFileName))
            g_fileReadSuccess = true;
        else
            g_fileReadSuccess = false;
    }
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

