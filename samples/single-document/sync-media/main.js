import Narrator from "./Narrator.js";
let narrator = new Narrator();
narrator.setHtmlDocument(document);

let states = {0: "NOTSTARTED", 1: "PLAYING", 2: "PAUSED"};
let state = 0;

let controls = document.querySelector("[id=controls]");
let button = document.createElement("button");
button.setAttribute("id", "startButton");
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

let narrationFile = document.querySelector("[rel=sync-media]").getAttribute("href");
fetch(narrationFile)
.then(res => res.text())
.then(text => {
  narrator.loadJson(JSON.parse(text));
})
.catch(err => console.log(err));
