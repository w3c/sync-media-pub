import { Sync } from './sync/index.js';
import * as Audio from './audio.js';
import * as Controls from './controls.js';
import * as Events from './events.js';

var syncgraph;

document.addEventListener("DOMContentLoaded", async () => {
    Events.on("Audio.PositionChange", onAudioPositionChange);
    Events.on("Narrator.Highlight", onNarratorHighlight);
    
    let urlSearchParams = new URLSearchParams(document.location.search);
    if (urlSearchParams.has("q")) {
        open(urlSearchParams.get("q"));
    }
});

async function open(url) {
    let sync = new Sync();
    await sync.loadUrl(url);
    if (sync.errors.length > 0) {
        console.log("Loading error(s)");
        return;
    }
    else {
        syncgraph = sync.graph;
        Controls.init();
    }
}


function onNarratorHighlight(ids, innerHTML) {
    
}

// event callback
// async function chapterPlaybackDone(src) {
//     log.debug("Player: end of chapter", src);
//     // narrator sends empty strings for src values
//     // we really just need to check it against the manifest for audio-only chapters
//     if (src == '' || src == manifest.getCurrentReadingOrderItem().url) {
//         let readingOrderItem = manifest.gotoNextReadingOrderItem();
//         if (readingOrderItem) {
//             await loadChapter(readingOrderItem.url);
//         }
//         else {
//             log.debug("Player: end of book");
//         }
//     }
//     // else ignore it, sometimes the audio element generates multiple end events
// }


// add offset data to the last read position
function onAudioPositionChange(position) {

}

