let trackHighlights = {};
let audioElm;

export function setupTracks(audio) {
    audioElm = audio;
    let tracks = Array.from(audio.textTracks);
    tracks.map(track => {
        let cues = Array.from(track.cues);
        cues.map(cue => cue.onenter = e => enterCue(e));
    });
}
export function applyHighlights() {
    let trackIds = Object.keys(trackHighlights);
    for (let trackId of trackIds) {
        if (document.querySelector(`#highlight-option-${trackId}`).checked) {
            CSS.highlights.set(trackId, trackHighlights[trackId]);
        }
    }           
}
export function removeHighlight(trackId) {
    if (CSS.highlights.has(trackId)) {
        CSS.highlights.delete(trackId);
    }
}
export function nextCue(trackId) {
    navigateCues(trackId, 1);
}

export function prevCue(trackId) {
    navigateCues(trackId, -1);
}

function enterCue(event) {
    let cue = event.target;
    try {
        let cueMeta = JSON.parse(cue.text);
        let elmRange = createRange(cueMeta.selector)
        let newHighlight = new Highlight(elmRange);
        trackHighlights[cue.track.id] = newHighlight;
        applyHighlights();
        let node = elmRange.startContainer.nodeType == 1 ? elmRange.startContainer : elmRange.startContainer.parentNode;
        if (!isInViewport(node)) {
            node.scrollIntoView();
        }
    }
    catch(err) {
        console.debug("ERROR ", cue.text);
    }
}
// dir = 1: next, -1: prev
function navigateCues(trackId, dir) {
    let track = Array.from(audioElm.textTracks).find(track => track.id == trackId);
    if (!track.activeCues.length) {
        return;
    }
    let activeCue = track.activeCues[0];
    console.log("Current #", activeCue.id, `(time ${activeCue.startTime})`);
    let sortedCues = sortCuesByTime(track);
    if (dir < 0) {
        sortedCues.reverse();
    }
    let idx = sortedCues.findIndex(cue => cue.id == activeCue.id);
    if (idx < sortedCues.length - 1) {
        let targetCue = sortedCues[idx+1];
        console.debug("Skipping to ", targetCue.startTime, " #", targetCue.id);
        document.querySelector(`#${dir > 0 ? 'next' : 'prev'}`).disabled = true;
        audioElm.addEventListener("timeupdate", e => {
            document.querySelector(`#${dir > 0 ? 'next' : 'prev'}`).disabled = false;
            audioElm.play();
        }, { once: true });
        audioElm.currentTime = targetCue.startTime;
    }
}

// to know what 'next' and 'prev' mean
function sortCuesByTime(track) {
    let sortedCues = Array.from(track.cues).sort((a,b) => {
        return a.startTime < b.startTime ? -1 : a.startTime > b.startTime ? 1 : 0;
    });
    return sortedCues;
}


function isInViewport(elm) {
    let bounding = elm.getBoundingClientRect();
    let doc = elm.ownerDocument;
    return (
        bounding.top >= 0 &&
        bounding.left >= 0 &&
        bounding.bottom <= (doc.defaultView.innerHeight || doc.documentElement.clientHeight) &&
        bounding.right <= (doc.defaultView.innerWidth || doc.documentElement.clientWidth)
    );
}

// for CssSelector optionally with TextPositionSelector as its refinedBy
function createRange(rangeSelector) {
    let node = document.querySelector(rangeSelector.value);
    let startOffset = 0;
    let endOffset = 0;
    if (rangeSelector.hasOwnProperty('refinedBy')) {
        startOffset = rangeSelector.refinedBy.start;
        endOffset = rangeSelector.refinedBy.end;
        
        return new StaticRange({
            startContainer: node.firstChild,
            startOffset,
            endContainer: node.firstChild,
            endOffset: endOffset + 1
        });
    }
    
    return new StaticRange({
        startContainer: node,
        startOffset: 0,
        endContainer: node.nextSibling,
        endOffset: 0 
    });
}
