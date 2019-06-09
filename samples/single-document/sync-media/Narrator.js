import AudioPlayer from './AudioPlayer.js';

export default class Narrator {
  constructor() {
    this.items = [];
    this.htmlDocument = null;
    this.position = 0;
    this.audioPlayer = new AudioPlayer();
  }

  loadJson(json) {
    this.items = json["narration"];
  }

  setHtmlDocument(document) {
    this.htmlDocument = document;
    document.getElementsByTagName("body")[0].classList.add("-sync-media-document-playing");
  }

  start(){
    this.render(this.items[this.position]);
  }

  next() {
    if (this.position+1 < this.items.length) {
      this.position++;
      this.render(this.items[this.position]);
    }
    else {
      document.getElementsByTagName("body")[0].classList.remove("-sync-media-document-playing");
    }
  }

  render(item) {
    let textid = item.text.split("#")[1];
    this.highlightText(textid);

    let audiofile = item.audio.split("#t=")[0];
    let start = item.audio.split("#t=")[1].split(",")[0];
    let end = item.audio.split("#t=")[1].split(",")[1];

    this.audioPlayer.play(audiofile, start, end, ()=>{
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
