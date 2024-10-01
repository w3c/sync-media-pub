import * as Events from './events.js';

/* Audio events:
Play
Pause
PositionChange
ClipDone
*/

let settings = {
    volume: 0.8,
    rate: 1.0
};
let clip = {
    start: 0,
    end: 0,
    file: '',
    isLastClip: false,
    autoplay: true
};
let audio = null;
let waitForSeek = false;

function loadFile(file) {
    log.debug("Audio Player: file = ", file);
    clip.file = file;
    let wasMuted = false;
    if (audio) {
        audio.pause();
        wasMuted = audio.muted;
    }
    audio = new Audio(file);
    audio.currentTime = 0;
    audio.muted = wasMuted;
    audio.volume = settings.volume;
    audio.playbackRate = settings.rate;
    audio.addEventListener('progress', e => { onAudioProgress(e) });
    audio.addEventListener('timeupdate', e => { onAudioTimeUpdate(e) });
}

function playClip(file, autoplay, start = 0, end = -1, isLastClip = false) {
    clip.start = parseFloat(start);
    clip.end = parseFloat(end);
    clip.isLastClip = isLastClip;
    clip.autoplay = autoplay;
    if (file != clip.file) {
        loadFile(file);
    }
    else {
        waitForSeek = true;
        // check that the current time is far enough from the desired start time
        // otherwise it stutters due to the coarse granularity of the browser's timeupdate event
        if (audio.currentTime < clip.start - .10 || audio.currentTime > clip.start + .10) {
            audio.currentTime = clip.start;
        }
        else {
            // log.debug("Audio Player: close enough, not resetting");
        }
    }
}

async function pause() {
    if (audio) {
        Events.trigger('Audio.Pause');
        await audio.pause();
    }
}

async function resume() {
    Events.trigger('Audio.Play');
    await audio.play();
}

function isPlaying() {
    return !!(audio.currentTime > 0 
        && !audio.paused 
        && !audio.ended 
        && audio.readyState > 2);
}


// this event fires when the file downloads/is downloading
async function onAudioProgress(event) {
        // if the file is playing while the rest of it is downloading,
        // this function will get called a few times
        // we don't want it to reset playback so check that current time is zero before proceeding
    if (audio.currentTime == 0 && !isPlaying()) {
        log.debug("Audio Player: starting playback");
        audio.currentTime = clip.start;
        
        if (clip.autoplay) {
            Events.trigger('Audio.Play');
            await audio.play();
        }
        else {
            Events.trigger('Audio.Pause');
        }
    }
}

// this event fires when the playback position changes
async function onAudioTimeUpdate(event) {
    Events.trigger('Audio.PositionChange', audio.currentTime, audio.duration);
    
    if (waitForSeek) {
        waitForSeek = false;
        Events.trigger('Audio.Play');
        await audio.play();
    }
    else {
        if (clip.end != -1 && audio.currentTime >= clip.end) {
            if (clip.isLastClip) {
                Events.trigger('Audio.Pause');
                audio.pause();
            }
            Events.trigger("Audio.ClipDone", clip.file);
        }
        else if (audio.currentTime >= audio.duration && audio.ended) {
            Events.trigger('Audio.Pause');
            audio.pause();
            log.debug("Audio Player: element ended playback");
            Events.trigger("Audio.ClipDone", clip.file);
        }
    }
}

function setRate(val) {
    settings.rate = val;
    if (audio) {
        audio.playbackRate = val;
    }
}

function setPosition(val) {
    if (audio) {
        if (val < 0){ 
            audio.currentTime = 0;
        }
        else if (val > audio.duration) {
            audio.currentTime = audio.duration;
        }
        else {
            audio.currentTime = val;
        }
    }
}

function setVolume(val) {
    settings.volume = val;
    if (audio) {
        audio.volume = val;
    }
}

function getPosition() {
    if (audio) {
        return audio.currentTime;
    }
    else {
        return 0;
    }
}

function mute() {
    if (audio) {
        audio.muted = true;
    }
}

function unmute() {
    if (audio) {
        audio.muted = false;
    }
}
function isMuted() {
    if (audio) {
        return audio.muted;
    }
    return false;
}
export { 
    playClip,
    isPlaying,
    pause,
    resume,
    setRate,
    setPosition,
    getPosition,
    setVolume,
    mute,
    unmute,
    isMuted
};
