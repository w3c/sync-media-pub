import Narrator from "./Narrator.js";
let narrator = new Narrator();
narrator.setHtmlDocument(document);

let narrationFile = document.querySelector("[rel=sync-media]").getAttribute("href");
fetch(narrationFile)
.then(res => res.text())
.then(text => {
  narrator.loadJson(JSON.parse(text));
  narrator.start();
})
.catch(err => console.log(err));
