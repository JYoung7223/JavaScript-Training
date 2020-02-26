/* Get elements */
const player = document.querySelector(".player");
const viewer = player.querySelector(".viewer");
const progress = player.querySelector(".progress");
const progressBar = player.querySelector(".progress__filled");
const toggle = player.querySelector(".toggle");
const skipButtons = player.querySelectorAll("[data-skip]");
const ranges = player.querySelectorAll(".player__slider");
const volumeLabel = player.querySelector(".volume");
const rateLabel = player.querySelector(".rate");
const resizeButton = player.querySelector(".resize");

let mouseDown = false;

/* Helper fuctions */
/** Function will start and stop the video */
function togglePlay() {
    if (viewer.paused) {
        viewer.play();
    } else {
        viewer.pause();
    }
}
/** Function will change the toolbar icon between '►' and '❚❚'  */
function togglePlayIcon() {
    const icon = this.paused ? '►' : '❚❚';
    toggle.textContent = icon;
}

/** Function will skip by specified increment. Calling object must have a "data-skip" attribute with a value of a float */
function skip() {
    viewer.currentTime += parseFloat(this.dataset.skip);
}

/** Function will update the passed attributed with the passed value,  */
function updateRange() {  
    if (this.name == "volume") {
        volumeLabel.innerHTML = parseInt(this.value * 100) + "%"
    } else if (this.name == "playbackRate") {
        rateLabel.innerHTML = parseFloat(this.value,2) + "x";
    }
    viewer[this.name] = this.value;   
}

/** Function will update the video play progress bar */
function updateProgress() {    
    const fillPercent = (viewer.currentTime / viewer.duration)*100;
    progressBar.style.flexBasis = `${fillPercent}%`;
}
/**
 *  Function will change currentTime of the viewer to position passed in
 * @param {any} event
 */
function progressSkip(event) {
    const newTime = (event.offsetX / progress.offsetWidth) * viewer.duration;
    viewer.currentTime = newTime;
}

/** Function will resize video player between full and normal screen */
function resizeViewer() {        
    if (!document.fullscreenElement){
        player.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}
/* Event Listeners */
/** Play/Pause  events*/
toggle.addEventListener("click", togglePlay);
viewer.addEventListener("click", togglePlay);
viewer.addEventListener("pause", togglePlayIcon);
viewer.addEventListener("play", togglePlayIcon);

/** jumpAhead, jumpBack events */
skipButtons.forEach(button => button.addEventListener("click", skip));
progress.addEventListener("click", progressSkip);
progress.addEventListener("mousedown", () => mouseDown = true);
progress.addEventListener("mouseup", () => mouseDown = false);
progress.addEventListener("mousemove", (e) => mouseDown && progressSkip(e));
viewer.addEventListener("timeupdate", updateProgress);

/** volume, playbackRate events */
ranges.forEach(range => range.addEventListener("mousedown", () => mouseDown = true));
ranges.forEach(range => range.addEventListener("mouseup", () => mouseDown = false));
ranges.forEach(range => range.addEventListener("change", () => mouseDown && updateRange));
ranges.forEach(range => range.addEventListener("mousemove", updateRange));

/** fullscreen/exitFullscreen events */
resizeButton.addEventListener("click", resizeViewer);