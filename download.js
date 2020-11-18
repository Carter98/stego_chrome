var imageLoader = document.getElementById('imageLoader');   // image uploaded to encode a message
    imageLoader.addEventListener('change', handleImage, false);
var canvas = document.getElementById('imageCanvas');    // canvas equivalent of uploaded image
var ctx = canvas.getContext('2d');      // specify that this is a 2d representation
var messageInput = document.getElementById('message');      // message to be encoded

var textCanvas = document.getElementById('textCanvas');     // canvas that will hold the secret message encoded into its pixels
var tctx = textCanvas.getContext('2d');

//handle decoding
var decodeCanvas = document.getElementById('imageCanvas2');     // image that will display the decoded message
var dctx = decodeCanvas.getContext('2d');
var imageLoader2 = document.getElementById('imageLoader2');     // image that contains the image to be decoded
    imageLoader2.addEventListener('change', handleImage2, false);

function handleImage(e){
    var reader = new FileReader();
    reader.onload = function(event){    // execute whenever an HTML load event is detected
        var img = new Image();
        img.onload = function(){    // set both canvas dimensions equal to the loaded image
            canvas.width = img.width;
            canvas.height = img.height;
            textCanvas.width=img.width;
            textCanvas.height=img.height;
            tctx.font = "30px Arial";       // defing font for later fillText() API call on line 27
            var messageText = messageInput.value;    // extract the string message                        // var messageText = (messageInput.value.length) ? messageInput.value : 'Hello'; 
            tctx.fillText(messageText,10,50);       // using Canvas 2D API to draw a text string at the coordinates 10,50
            ctx.drawImage(img,0,0);     // another API method, to draw img onto canvas starting from top left corner  
            var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);      // returns underlying pixel data for the image canvas
            var textData = tctx.getImageData(0, 0, canvas.width, canvas.height);    // same for canvas with hidden text
            var pixelsInMsg = 0;
                pixelsOutMsg = 0;
            for (var i = 0; i < textData.data.length; i += 4) {     // the image data object has 4 values for each pixel (RGBA)
                if (textData.data[i+3] !== 0) {         // if blue value in text canvas is black
                    // make sure the corresponding pixel in the image canvas has a green value ending in 7
                    if (imgData.data[i+1]%10 == 7) {       
                        //do nothing, we're good
                    }
                    else if (imgData.data[i+1] > 247) {     
                        imgData.data[i+1] = 247;
                    }
                    else {
                        while (imgData.data[i+1] % 10 != 7) {   // increment green value until it ends in 7
                            imgData.data[i+1]++;
                        }
                    }
                    pixelsInMsg++;      // keep track of how many pixels make up our message
                }
                else {
                    if (imgData.data[i+1]%10 == 7) {        // make sure that pixels not making up our image don't have a green value ending in 7
                        imgData.data[i+1]--;
                    }
                    pixelsOutMsg++;     // keep track of how many pixels do not involve our message
                }
            }
            console.log('pixels within message borders: '+pixelsInMsg);
            console.log('pixels outside of message borders: '+pixelsOutMsg);
            ctx.putImageData(imgData, 0, 0);    // put the new edited image data onto the canvas
        };
        img.src = event.target.result;      
    };
    reader.readAsDataURL(e.target.files[0]);
}

function handleImage2(e){
    console.log('handle image 2');
    var reader2 = new FileReader();
    reader2.onload = function(event){
        console.log('reader2 loaded');
        var img2 = new Image();
        img2.onload = function(){       
            console.log('img2 loaded');
            decodeCanvas.width = img2.width;    // set decode canvas dimensions to be same as uploaded file
            decodeCanvas.height = img2.height;
            dctx.drawImage(img2,0,0);   // draw the image on the canvas starting at top left corner
            var decodeData = dctx.getImageData(0, 0, decodeCanvas.width, decodeCanvas.height);      // use API to get ImageData object
            for (var i = 0; i < decodeData.data.length; i += 4) {
                if (decodeData.data[i+1] % 10 == 7) {   // if the green value ends in a 7, make the pixel black
                    decodeData.data[i] = 0;
                    decodeData.data[i+1] = 0;
                    decodeData.data[i+2] = 0;
                    decodeData.data[i+3] = 255;
                }
                else {
                    decodeData.data[i+3] = 0;   // change alpha channel to be fully transparent
                }
            }
            dctx.putImageData(decodeData, 0, 0);        // put this new image data on the canvas
        };
        img2.src = event.target.result;
    };
    reader2.readAsDataURL(e.target.files[0]);
    var imageOutput = document.getElementById('imageOutput');
    imageOutput = canvas.toDataURL("image/png");
    document.write('<img src="'+imgageOutput+'"/>');
}