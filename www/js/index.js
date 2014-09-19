function downloadFile(downloadURL, savedFileName) {
    var fileTransfer = new FileTransfer();
    var uri = encodeURI(downloadURL);
    var fileURI = 'mnt/sdcard/' + savedFileName;
    
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



$(document).on('deviceready', function() {
    alert("device ready.");
    
    var socket = plugin.socket.io.connect("http://192.168.2.8:3001");
    
    socket.on("connect", function() {
        alert("connected");
        socket.emit('message', "android");
    });
    
    socket.on('sendImgUrl', function(imgUrl) {
        alert(imgUrl);
        downloadFile(imgUrl, "2.png");
    });
    
    socket.on("error", function(err) {
        alert(err);
    });
    
});

