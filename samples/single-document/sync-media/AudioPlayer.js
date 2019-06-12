export default class AudioPlayer {

  constructor() {
    this.file = '';
    this.audioElm = null;
    this.start = 0;
    this.end = 0;
    this.doneCallback = null;
    this.waitForSeek = false;
    this.isLastClip = 0;
    console.log("AudioPlayer constructor");
  }
  setFile(file) {
    console.log("Audio file:", file);
    this.file = file;
    this.audioElm = new Audio(this.file);

    this.audioElm.addEventListener('progress', ()=>{this.onAudioProgress()});
    this.audioElm.addEventListener('timeupdate', ()=>{this.onAudioTimeUpdate()});

  }

  playClip(file, start, end, isLastClip, callback) {
    this.start = parseFloat(start);
    this.end = parseFloat(end);
    this.isLastClip = isLastClip;
    this.doneCallback = callback;

    if (file != this.file) {
      this.setFile(file);
    }
    else {
      this.waitForSeek = true;
      // check that the current time is far enough from the desired start time
      // otherwise it stutters due to the coarse granularity of the browser's timeupdate event
      if (this.audioElm.currentTime < this.start - .10 || this.audioElm.currentTime > this.start + .10) {
        this.audioElm.currentTime = this.start;
      }
      else {
        console.log(`${this.audioElm.currentTime} vs ${this.start}`);
        console.log("close enough, not resetting");
      }
    }
  }

  pause() {
    this.audioElm.pause();
  }
  resume() {
    this.audioElm.play();
  }

  // this event fires when the file downloads/is downloading
  onAudioProgress() {
    this.audioElm.currentTime = this.start;
    this.audioElm.play();
  }

  // this event fires when the playback position changes
  onAudioTimeUpdate() {
    if (this.waitForSeek) {
      this.waitForSeek = false;
      this.audioElm.play();
    }
    else {
      if (this.audioElm.currentTime >= this.end) {
        if (this.isLastClip) {
          this.audioElm.pause();
        }
        this.doneCallback();
      }
    }
  }
}
