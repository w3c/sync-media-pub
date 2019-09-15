import Narrator from "./Narrator.js";

let narrator = new Narrator();
narrator.setHtmlDocument(document);
narrator.syncSource = true;

let states = {0: "NOTSTARTED", 1: "PLAYING", 2: "PAUSED"};
let state = 0;

let controls = document.querySelector("[id=controls]");
//controls.setAttribute("aria-live", "polite");
let button = document.createElement("button");
button.textContent = "Start";
button.onclick = (e) => {
  e.preventDefault();
  console.log("CLICK");
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
controls.appendChild(button);

let escapeButton = document.createElement("button");
escapeButton.textContent = "Escape";
escapeButton.onclick = (e) => {
  e.preventDefault();
  narrator.escape();
}
escapeButton.hidden = true;
controls.append(escapeButton);

narrator.onstart = () => {
  button.textContent = "Pause";
  state = 1;
}
narrator.onpause = () => {
  button.textContent = "Play";
  state = 2;
}
narrator.onresume = () => {
  button.textContent = "Pause";
  state = 1;
}
narrator.ondone = () => {
  button.textContent = "Start";
  state = 0;
}
narrator.oncanescape = rolevalue => {
  escapeButton.hidden = false;
  escapeButton.textContent = `Escape ${rolevalue}`;
}
narrator.onescape = () => {
  escapeButton.hidden = true;
}

let narrationFile = document.querySelector("[rel=sync-media]").getAttribute("href");
fetch(narrationFile)
.then(res => res.text())
.then(text => {
  narrator.loadJson(JSON.parse(text));
})
.catch(err => console.log(err));

let showsource_wrapper = document.createElement("div");
showsource_wrapper.id = "showsource_wrapper";

let showsource = document.createElement("input");
showsource.id = "showsource";

let showsource_label = document.createElement("label");
showsource_label.id = "showsource_label";
showsource_label.for = "showsource";
showsource_label.textContent ="Show source";

showsource.textContent = "Show source";
showsource.type = "checkbox";
showsource_wrapper.appendChild(showsource);
showsource_wrapper.appendChild(showsource_label);

controls.appendChild(showsource_wrapper);

let source = document.querySelector("[id=source]");
source.hidden = true;

showsource.onclick = (e) => {
  source.hidden = !e.target.checked;
}

