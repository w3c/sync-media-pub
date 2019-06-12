import AudioPlayer from './AudioPlayer.js';

export default class Narrator {
  constructor() {
    this.items = [];
    this.htmlDocument = null;
    this.position = 0;
    this.audioPlayer = new AudioPlayer();
    this.onstart = null;
    this.onpause = null;
    this.ondone = null;
    this.onresume = null;
  }

  loadJson(json) {
    this.items = json["narration"];
  }

  setHtmlDocument(document) {
    this.htmlDocument = document;
  }

  start(){
    console.log("Starting");
    this.onstart();
    this.position = 0;
    this.render(this.items[this.position]);
    document.getElementsByTagName("body")[0].classList.add("-sync-media-document-playing");
  }

  pause() {
    console.log("Pausing");
    this.onpause();
    this.audioPlayer.pause();
  }

  resume() {
    console.log("Resuming");
    this.onresume();
    this.audioPlayer.resume();
  }

  next() {
    if (this.position+1 < this.items.length) {
      this.position++;
      console.log("Loading clip " + this.position);
      this.render(
        this.items[this.position],
        this.position+1 >= this.items.length);
    }
    else {
      document.getElementsByTagName("body")[0].classList.remove("-sync-media-document-playing");
      console.log("Document done");
      this.ondone();
    }
  }

  render(item, isLast) {
    let textid = item.text.split("#")[1];
    this.highlightText(textid);

    let audiofile = item.audio.split("#t=")[0];
    let start = item.audio.split("#t=")[1].split(",")[0];
    let end = item.audio.split("#t=")[1].split(",")[1];

    this.audioPlayer.playClip(audiofile, start, end, isLast, ()=>{
      console.log("Clip done");
      this.resetTextStyle(textid);
      this.next();
    });
  }

  highlightText(id) {
    let elm = this.htmlDocument.getElementById(id);
    elm.classList.add("-sync-media-active-element");
  }

  resetTextStyle(id) {
    let elm = this.htmlDocument.getElementById(id);
    elm.classList.remove("-sync-media-active-element");
  }

}
