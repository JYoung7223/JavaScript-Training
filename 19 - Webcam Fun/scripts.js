// Get Elements
const video = document.querySelector('.player');
const canvas = document.querySelector('.photo');
const ctx = canvas.getContext('2d');
const strip = document.querySelector('.strip');
const snap = document.querySelector('.snap');
let rgbFilter = {}; 
let rgbAdjust = {}; 
let shutter = document.querySelector(".shutter input");
let offset = document.querySelector(".split input");

// Helper Functions
function getVideo() {
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(localMediaStream => {            
            try {
                video.srcObject = localMediaStream; // New way of getting stream
            } catch (error) {
                video.src = window.URL.createObjectURL(localMediaStream); // Old way, deprecated on newer browsers
            }
            video.play();
        })
        .catch(error => {
            console.log("Error Getting Video Stream", error);
        })
        ;
}

function pushToCanvas() {
    const width = video.videoWidth; // Width from WebCam
    const height = video.videoHeight; // Height from WebCam
    canvas.width = width; // Set Width to same as WebCam
    canvas.height = height; // Set Height to same as WebCam

    // How often to push image to canvas (in ms)
    return setInterval(() => {        

        ctx.drawImage(video, 0, 0, width, height);

        // shutter effect is canvas wide
        if (document.getElementById("shutter-active").checked) {            
            shutterEffect(ctx, shutter.value);
        } else {
            ctx.globalAlpha = 1;
        }

        // Get pixels to perform pixel based effects
        let pixels = ctx.getImageData(0, 0, width, height);        

        // Perform pixel manipulations             

        if (document.getElementById("filter-rgb-active").checked) {
            document.querySelectorAll(".filter-rgb input").forEach((found) => { rgbFilter[found.name] = found.value; });
            pixels = greenScreenEffect(pixels, rgbFilter);
        }

        if (document.getElementById("adjust-rgb-active").checked) {
            document.querySelectorAll(".adjust-rgb input").forEach((found) => { rgbAdjust[found.name] = found.value; });
            pixels = adjustColorEffect(pixels, rgbAdjust);
        }
        
        if (document.getElementById("split-rgb-active").checked) {
            pixels = colorSplitEffect(pixels, parseFloat(offset.value));
        }

        // draw results
        ctx.putImageData(pixels, 0, 0);        

    }, 16);
}

function takePhoto() {
    // Play sound
    snap.currentTime = 0;
    snap.play();

    // Get data from the canvas
    const data = canvas.toDataURL("image/jpeg"); // gets image in base64
    const picLink = document.createElement("a");
    picLink.href = data;
    picLink.setAttribute("download", "heyThatsMe");
    picLink.textContent = "Download Image";
    picLink.innerHTML = `<img src="${data}" alt="I See You" />`;
    strip.insertBefore(picLink, strip.firstChild);
}

function shutterEffect(context, opacity) {
    context.globalAlpha = opacity;
}

function greenScreenEffect(pixels, levels) {
    for (let i = 0; i < pixels.data.length; i += 4) {
        const r = pixels.data[i + 0];
        const g = pixels.data[i + 1];
        const b = pixels.data[i + 2];

        // filter pixels in range
        if ((parseFloat(levels.rmin) <= r && r <= parseFloat(levels.rmax))
            || (parseFloat(levels.gmin) <= g && g <= parseFloat(levels.gmax))
            || (parseFloat(levels.bmin) <= b && b <= parseFloat(levels.bmax))) {
            pixels.data[i + 3] = 0; // sets opacity to 0 (fully transparent)
        }
    }
    return pixels;
}

function adjustColorEffect(pixels, levels) {
    let red = parseFloat(levels.r);
    let green = parseFloat(levels.g);
    let blue = parseFloat(levels.b);
    for (let i = 0; i < pixels.data.length; i += 4) { // increment by 4 as each pixel is 4 elements RGBA
        pixels.data[i + 0] = pixels.data[i + 0] + red;
        pixels.data[i + 1] = pixels.data[i + 1] + green;
        pixels.data[i + 2] = pixels.data[i + 2] + blue;        
    }
    return pixels;
}

function colorSplitEffect(pixels, offset) {
    for (let i = 0; i < pixels.data.length; i += 4) {
        let redOffset = i + 0 + offset;
        let greenOffset = i + 1;
        let blueOffset = (i + 2 - offset);
        if ((redOffset <= pixels.data.length) && (redOffset >= 0)) {
            pixels.data[i + 0] = pixels.data[redOffset]; // R        
        }
        if ((greenOffset <= pixels.data.length) && (greenOffset >= 0)) { 
            pixels.data[i + 1] = pixels.data[greenOffset]; // G
        }
        if ((blueOffset <= pixels.data.length) && (blueOffset >= 0)) {
            pixels.data[i + 2] = pixels.data[blueOffset]; // B
        }
    }
    return pixels;
}

// Logic
getVideo();
video.addEventListener("canplay", pushToCanvas);