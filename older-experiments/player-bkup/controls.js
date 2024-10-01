import * as Events from './events.js';
import * as Audio from './audio.js';
import * as Narrator from './narrator.js';
import * as Utils from './utils.js';

let isPlaying = false;

function init() {
    document.querySelector("#current-position").textContent = '--';

    document.querySelector("#rate").addEventListener("input", 
        e => setPlaybackRate(e.target.value));
    document.querySelector("#volume").addEventListener("input", 
        e => setPlaybackVolume(e.target.value));
    
    document.querySelector("#reset-rate").addEventListener("click", 
        e => setPlaybackRate(100));
    document.querySelector("#mute").addEventListener("click", e => toggleMute());
    
    document.querySelector("#next").addEventListener("click", e => next());
    document.querySelector("#prev").addEventListener("click", e => prev());

    document.querySelector("#rate").value = 100;
    setPlaybackRate(100);
    document.querySelector("#volume").value = 80;
    setPlaybackVolume(80);

    Events.on("Audio.PositionChange", onPositionChange);
    Events.on("Audio.Play", onPlay);
    Events.on("Audio.Pause", onPause);

    document.querySelector("#play-pause").addEventListener("click", e => {
        if (isPlaying) {
            Audio.pause();
        }
        else {
            Audio.resume();
        }
    });
}

function next() {
    Narrator.next();
}
function prev() {
    Narrator.prev();
}
function toggleMute() {
    if (Audio.isMuted()) {
        document.querySelector("#volume-wrapper").classList.remove("disabled");
        document.querySelector("#volume").disabled = false;
        document.querySelector("#mute").setAttribute("title", "Mute");
        document.querySelector("#mute").setAttribute("aria-label", "Mute");
        // make the x disappear on the icon
        Array.from(document.querySelectorAll(".mute-x")).map(node => node.classList.remove("muted"));
        Audio.unmute();
    }
    else {
        document.querySelector("#volume-wrapper").classList.add("disabled");
        document.querySelector("#volume").disabled = true;
        document.querySelector("#mute").setAttribute("title", "Unmute");
        document.querySelector("#mute").setAttribute("aria-label", "Unmute");
        // make the x appear on the icon
        Array.from(document.querySelectorAll(".mute-x")).map(node => node.classList.add("muted"));
        Audio.mute();
    }
}
function setPlaybackRate(val) {
    document.querySelector("#rate-value").textContent = `${val/100}x`;
    if (document.querySelector('#rate').value != val) {
        document.querySelector("#rate").value = val;
    }
    Audio.setRate(val/100);
}

function setPlaybackVolume(val) {
    document.querySelector("#volume-value").textContent = `${val}%`;
    Audio.setVolume(val/100);
}

function onPositionChange(position, fileDuration) {
    
    let currentPosition = Utils.secondsToHms(position);
    let fileLength = '--';
    if (!isNaN(fileDuration)) {
        let duration = Utils.secondsToHms(fileDuration);
        fileLength = Utils.secondsToHms(fileDuration);
    }
    // trim the leading zeros
    if (currentPosition.indexOf("00:") == 0) {
        currentPosition = currentPosition.slice(3);
    }
    if (fileLength.indexOf("00:") == 0) {
        fileLength = fileLength.slice(3);
    }

    document.querySelector("#current-position").innerHTML = `${currentPosition} of ${fileLength}`;
}

function onPlay() {
    document.querySelector("#pause").classList.remove("disabled");
    document.querySelector("#play").classList.add("disabled");
    document.querySelector("#play-pause").setAttribute("aria-label", "Pause");
    document.querySelector("#play-pause").setAttribute("title", "Pause");
    isPlaying = true;
}

function onPause() {
    document.querySelector("#pause").classList.add("disabled");
    document.querySelector("#play").classList.remove("disabled");
    document.querySelector("#play-pause").setAttribute("aria-label", "Play");
    document.querySelector("#play-pause").setAttribute("title", "Play");
    isPlaying = false;
}


export {
    init
}