var downloadFilePath = "cdvfile://localhost/persistent/ding/";
var adminPageIPaddress = "http://192.168.2.8:3001";

$(document).on('deviceready', function() {
    var socket = plugin.socket.io.connect(adminPageIPaddress);
    
    socket.on("connect", function() {
        alert("connected");
        //socket.emit('message', "android");
        socket.emit('message', {
          'from' : "android",
          'companyId' : "amc:torrance"
        });
    });
    
    socket.on('sendImgUrl', function(imgUrl) {
        alert(imgUrl);
        window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fs) {
          downloadFile(imgUrl, "3.png");
        }, errorHandler);
    });
    
    socket.on('getImgList', function() {
      alert(" receive event ");
      socket.emit('androidImgList', "android");
    });
    
    socket.on("error", function(err) {
        alert(err);
    });
    
});


function downloadFile(downloadURL, savedFileName) {
    var fileTransfer = new FileTransfer();
    var uri = encodeURI(downloadURL);
    var fileURI = downloadFilePath + savedFileName;
    
    console.log(" fileURI ==> " + fileURI);
    
    fileTransfer.download(
        uri,
        fileURI,
        function(entry) {
            console.log("download complete: " + entry.toURL());
        }, 
        function(error) {
            console.log("download error source " + error.source);
            console.log("download error target " + error.target);
            console.log("upload error code" + error.code);
        },
        false, 
        {
            headers: {
                "Authorization": "Basic dGVzdHVzZXJuYW1lOnRlc3RwYXNzd29yZA=="
            }
        }
    );
};


function fail(error) {
    alert(error.code);
}


function getFramesList() {
    
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fileSystem) {
        var sdcard = fileSystem.root;

        sdcard.getDirectory('DCIM/Camera',{create:false}, function(dcim){
            var directoryReader = dcim.createReader();
            directoryReader.readEntries(function(entries){
                onReadEntries (entries, fileSystem);
            }, fail);

        }, fail);
    }, fail);

    function onReadEntries (entries, fileSystem) {
        var img_arr = [];
        for (var i = 0; i < entries.length; i++) {
            
            console.log(entries[i]);
            
            var full_path = "/sdcard" + entries[i].fullPath;
            var file_extension = getFileExtension(entries[i].name);
            img_arr.push(full_path);
        }
        
        console.log(" *** img_arr ***" + img_arr);
        
    }

};

function errorHandler(e) {
    var msg = '';
  
    switch (e.code) {
        case FileError.QUOTA_EXCEEDED_ERR:
            msg = 'QUOTA_EXCEEDED_ERR';
            break;
        case FileError.NOT_FOUND_ERR:
            msg = 'NOT_FOUND_ERR';
            break;
        case FileError.SECURITY_ERR:
            msg = 'SECURITY_ERR';
            break;
        case FileError.INVALID_MODIFICATION_ERR:
            msg = 'INVALID_MODIFICATION_ERR';
            break;
        case FileError.INVALID_STATE_ERR:
            msg = 'INVALID_STATE_ERR';
            break;
        default:
            msg = 'Unknown Error';
            break;
    };
}

