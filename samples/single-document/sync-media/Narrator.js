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
    this.oncanescape = null;
    this.onescape = null;
    this.syncSource = false;
  }

  loadJson(json) {
    this.items = flatten(json["narration"]);
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

  escape() {
    console.log("Escape");
    this.onescape();
    this.audioPlayer.pause();
    let textid = this.items[this.position].text.split("#")[1];
    this.resetTextStyle(textid);
    if (this.syncSource) {
      let srctextid = `src_${this.items[this.position].text.split("#")[1]}`;
      this.resetTextStyle(srctextid);
    }
    this.position = this.items.slice(this.position).findIndex(thing => thing.role === '') 
      + (this.items.length - this.items.slice(this.position).length) - 1;
    this.next();
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
    if (item['role'] != '') {
      // this is a substructure
      this.oncanescape(item["role"]);
    }
    let textid = item.text.split("#")[1];
    this.highlightText(textid);

    if (this.syncSource) {
      let sourceId = `src_${textid}`;
      this.highlightText(sourceId);
    }

    let audiofile = item.audio.split("#t=")[0];
    let start = item.audio.split("#t=")[1].split(",")[0];
    let end = item.audio.split("#t=")[1].split(",")[1];

    this.audioPlayer.playClip(audiofile, start, end, isLast, ()=>{
      console.log("Clip done");
      this.resetTextStyle(textid);
      if (this.syncSource) {
        this.resetTextStyle(`src_${textid}`);
      }
      this.next();
    });
  }

  highlightText(id) {
    let elm = this.htmlDocument.getElementById(id);
    elm.classList.add("-sync-media-active-element");
    if (!isInViewport(elm)) {
      elm.scrollIntoView();
    }
  }

  resetTextStyle(id) {
    let elm = this.htmlDocument.getElementById(id);
    elm.classList.remove("-sync-media-active-element");
  }

}

var isInViewport = function (elem) {
  var bounding = elem.getBoundingClientRect();
  return (
      bounding.top >= 0 &&
      bounding.left >= 0 &&
      bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      bounding.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

// flatten out any nested items
var flatten = function(itemsArr, roleValue) {
  var flatter = itemsArr.map(item => {
    if (item.hasOwnProperty("narration")) {
      return flatten(item['narration'], item['role']);
    }
    else {
      item.role = roleValue ? roleValue : '';
      return item;
    }
  }).reduce((acc, curr) => acc.concat(curr), []);

  return flatter;
}