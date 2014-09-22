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
        
        async.waterfall([
            function(callback) {
                getFramesList(callback);
            }, 
            
            function(imgArr, callback) {
                async.map(imgArr, function(imgPackets, cback1) {
                    async.map(imgPackets, function(packet, cback2) {
                        setTimeout(function() {
                            socket.emit('androidImgList', packet);
                            cback2(null, "next");
                        }, 200);
                    }, cback1);
                }, callback);
            }
        ], function(error, result) {
            
        });
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


function getFramesList(done) {
    async.waterfall([
        function(callback) {
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fileSystem) {
                callback(null, fileSystem);
            }, fail);
        }, 

        function(fileSystem, callback) {
            var sdcard = fileSystem.root;
            sdcard.getDirectory('DCIM/Camera',{create:false}, function(dcim){
                callback(null, dcim);
            }, fail);
        }, 

        function(dcim, callback) {
            var directoryReader = dcim.createReader();
            directoryReader.readEntries(function(entries){
                async.map(entries, function(entry, cback) {
                    var full_path = "/sdcard" + entry.fullPath;
                    cback(null, full_path);
                }, callback);
            }, fail);
        }, 

        function(pathArr, callback) {
            console.log( " %%%% pathArr %%%% " + pathArr);
            async.map(pathArr, function(imageUri, cback) {
                encodeImageUri(imageUri, cback);
            }, callback);
        }, 

        function(imgArr, callback) {
            var i = 0;
            async.map(imgArr, function(data, cback) {
                
                var packetSize = 5000;
                var packets = [];
                var cnt = 0;
                
                var sum = Math.ceil(data.length / packetSize);
                while(data.length > 0) {
                    packets.push(i + "#" + ( cnt++ ) + "#" +sum + "#" +  data.substr(0, packetSize));
                    data = data.substr(packetSize);
                }
                i++;
                cback(null, packets);
            }, callback);
        }
    ], function(error, data) {
        return done(null, data);
    });
};


function encodeImageUri(imageUri, callback) {
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext("2d");
    var img = new Image();

    img.onload = function() {
        canvas.width = this.width;
        canvas.height = this.height;
        ctx.drawImage(img, 0, 0);

        if(typeof callback === 'function'){
            var dataURL = canvas.toDataURL();
            console.log(" ==== @ dataURL size @ ==== " + dataURL.length);
            callback(null, dataURL);
        }
    };
    img.src = imageUri;
}


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

