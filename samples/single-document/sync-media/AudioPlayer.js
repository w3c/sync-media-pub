export default class AudioPlayer {

  constructor() {
    this.file = '';
    this.audioElm = null;
    this.start = 0;
    this.end = 0;
    this.doneCallback = null;
    this.waitForSeek = false;
    console.log("HI I AM AUDIOPLAYRRR");
  }
  setFile(file) {
    console.log("Audio file:", file);
    this.file = file;
    this.audioElm = new Audio(this.file);
    var bufferedTimeRanges = this.audioElm.buffered;

    this.audioElm.addEventListener('progress', ()=>{this.onAudioProgress()});
    this.audioElm.addEventListener('timeupdate', ()=>{this.onAudioTimeUpdate()});

  }

  play(file, start, end, callback) {
    this.start = start;
    this.end = end;
    this.doneCallback = callback;

    if (file != this.file) {  
      this.setFile(file);
    }
    else {
      this.waitForSeek = true;
      this.audioElm.currentTime = start;
    }
  }

  // this event fires when the file downloads/is downloading
  onAudioProgress() {
    console.log("Audio progress:", this.audioElm.duration);
    this.audioElm.currentTime = this.start;
    this.audioElm.play();
  }

  // this event fires when the playback position changes
  // "this" is the audio element
  onAudioTimeUpdate() {
    console.log("Current time:", this.audioElm.currentTime);
    if (this.waitForSeek) {
      this.waitForSeek = false;
      this.audioElm.play();
    }
    else {
      if (this.audioElm.currentTime >= this.end) {
        this.audioElm.pause();
        this.doneCallback();
      }
    }
  }
}
