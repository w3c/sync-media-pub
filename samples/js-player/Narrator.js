import AudioPlayer from './AudioPlayer.js';

export default class Narrator {
  constructor() {
    this.items = [];
    this.htmlDocument = null;
    this.position = 0;
    this.audioPlayer = new AudioPlayer();
    this.onStart = null;
    this.onPause = null;
    this.onDone = null;
    this.onResume = null;
    this.onCanEscape = null;
    this.onEscape = null;
    this.onHighlight = null;
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
    this.onStart();
    this.position = 0;
    this.render(this.items[this.position]);
    document.getElementsByTagName("body")[0].classList.add("-sync-media-document-playing");
  }

  pause() {
    console.log("Pausing");
    this.onPause();
    this.audioPlayer.pause();
  }

  resume() {
    console.log("Resuming");
    this.onResume();
    this.audioPlayer.resume();
  }

  escape() {
    console.log("Escape");
    this.onEscape();
    this.audioPlayer.pause();
    let textid = this.items[this.position].text.split("#")[1];
    this.resetTextStyle(textid);
    if (this.syncSource) {
      let srctextid = `src_${this.items[this.position].text.split("#")[1]}`;
      this.resetTextStyle(srctextid);
    }
    this.position = this.items.slice(this.position).findIndex(thing => thing.groupId !== this.items[this.position].groupId) 
      + (this.items.length - this.items.slice(this.position).length) - 1;
    this.next();
  }

  next() {
    let textid = this.items[this.position].text.split("#")[1];

    this.resetTextStyle(textid);
    if (this.syncSource) {
      let srctextid = `src_${this.items[this.position].text.split("#")[1]}`;
      this.resetTextStyle(srctextid);
    }
    
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
      this.onDone();
    }
  }

  render(item, isLast) {
    if (item['role'] != '') {
      // this is a substructure
      this.onCanEscape(item["role"]);
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
    this.onHighlight(id);
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

let groupId = 0;
// flatten out any nested items
var flatten = function(itemsArr, roleValue) {
  var flatter = itemsArr.map(item => {
    if (item.hasOwnProperty("narration")) {
      groupId++;
      return flatten(item['narration'], item['role']);
    }
    else {
      item.role = roleValue ? roleValue : '';
      item.groupId = groupId;
      return item;
    }
  }).reduce((acc, curr) => acc.concat(curr), []);
  groupId--;
  return flatter;
}