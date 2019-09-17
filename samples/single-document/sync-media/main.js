import Narrator from "./Narrator.js";
import Utils from "./utils.js";

let narrator = new Narrator();
let utils = new Utils();
narrator.setHtmlDocument(document);
narrator.syncSource = true;

let states = {0: "NOTSTARTED", 1: "PLAYING", 2: "PAUSED"};
let state = 0;
let captionMode = false;
/* 
add controls
*/

let controls = document.querySelector("[id=controls]");
let content = document.querySelector("[id=content]");
let caption = document.querySelector("[id=caption]");
let source = document.querySelector("[id=source]");

/* 
play button
*/
let playButton = utils.makeButton("Start", controls);
playButton.onclick = (e) => {
  e.preventDefault();
  if (state === 0) {
    narrator.start();
  }
  else if (state === 1) {
    narrator.pause();
  }
  else if (state === 2) {
    narrator.resume();
  }
}



/*
next button
*/
let nextButton = utils.makeButton("Next", controls);
nextButton.onclick = (e) => {
  e.preventDefault();
  narrator.next();
}
/* 
escape button
*/
let escapeButton = utils.makeButton("Escape", controls);
escapeButton.onclick = (e) => {
  e.preventDefault();
  narrator.escape();
}
escapeButton.hidden = true;

/* 
show source
*/
let showsource = utils.makeCheckbox("showsource", "Show source", controls);
showsource.onclick = (e) => {
  source.hidden = !e.target.checked;
}

/* 
show caption
*/
let showcaption = utils.makeCheckbox("showcaption", "Caption mode", controls);
showcaption.onclick = (e) => {
  captionMode = e.target.checked;
  content.hidden = captionMode;
  caption.hidden = !captionMode;
}

/* 
events
*/
narrator.onStart = () => {
  playButton.textContent = "Pause";
  state = 1;
}
narrator.onPause = () => {
  playButton.textContent = "Play";
  state = 2;
}
narrator.onResume = () => {
  playButton.textContent = "Pause";
  state = 1;
}
narrator.onDone = () => {
  playButton.textContent = "Start";
  state = 0;
}
narrator.onCanEscape = rolevalue => {
  escapeButton.hidden = false;
  escapeButton.textContent = `Escape ${rolevalue}`;
}
narrator.onEscape = () => {
  escapeButton.hidden = true;
}
narrator.onHighlight = (id) => {
  if (id.indexOf("src_") == -1) {
    // extract the text and display it
    let elm = document.querySelector(`[id=${id}]`);
    caption.textContent = elm.textContent;
  }
}

let narrationFile = document.querySelector("[rel=sync-media]").getAttribute("href");
let narrationJson; 

fetch(narrationFile)
.then(res => res.text())
.then(text => {
  narrationJson = JSON.parse(text);
  utils.loadSource(narrationJson, 0);
  narrator.loadJson(narrationJson);
  
})
.catch(err => console.log(err));


source.hidden = true;
caption.hidden = true;



