// smil is an xml string
export function parseSmil(smil) {
    if (!smil || smil.trim() == '') {
        throw new Error("Bad input");
    }
    let smilModel = parse(smil);
    let smilPars = visit(smilModel.body, accumulatePars, []);   
    smilPars = smilPars.filter(item => item != null);
    return smilPars;
}
// convert to a list of TextTrackCues
export function convertToTextTrackCues(smilPars) {
    let audioUrl = '';
    let startOffset = 0;
    let endOffset = 0;
    if (smilPars.length > 0) {
        let firstAudio = smilPars[0].media.find(item => item.type == 'audio');
        if (firstAudio) {
            startOffset = firstAudio.clipBegin;
        }
        let lastAudio = smilPars.reverse()[0].media.find(item => item.type == 'audio');
        if (lastAudio) {
            endOffset = lastAudio.clipEnd;
        }
        else {
            console.error("Could not process SMIL");
            return null;
        }
        smilPars.reverse(); // unreverse them
    }
    else {
        console.error("Could not process SMIL");
        return null;
    }
    
    let cues = smilPars.map(item => {
        let audio = item.media.find(media => media.type == 'audio');
        let text = item.media.find(media => media.type == 'text');
        return new VTTCue(
            parseFloat(audio.clipBegin), 
            parseFloat(audio.clipEnd), 
            JSON.stringify({selector: {type:"FragmentSelector",value: text.src.split('#')[1]}})
        );
    });

    return cues;

}
function accumulatePars(node) {
    if (node.type == 'par') {
        return node;
    }
    else {
        return null;
    }
}
// Visit a tree of objects with media children
function visit(node, fn, collectedData) {
    let retval = fn(node);
    if (node?.media) {
        return [retval, ...node.media.map(n => visit(n, fn, collectedData)).flat()];
    }
   else {
    return retval;
   }
}

let isMedia = name => name == "text" || name == "audio" 
    || name == "ref" || name == "video" 
    || name == "img";


function parse(xml) {
    let model = {};
    let domparser = new DOMParser();
    let doc = domparser.parseFromString(xml, "application/xml");
    let bodyElm = doc.documentElement.getElementsByTagName("body");
    if (bodyElm.length > 0) {
        model.body = parseNode(bodyElm[0]);
    }
    return model;
}

function parseNode(node) {
    if (node.nodeName == "body" || node.nodeName == "seq" || node.nodeName == "par") {
        // body has type "seq"
        let type = node.nodeName == "body" || node.nodeName == "seq" ? "seq" : "par";
        let obj = {
            type
        };
        if (node.id) {
            obj.id = node.getAttribute("id");
        }
        if (node.hasAttribute('epub:type')) {
            obj.epubType = node.getAttribute('epub:type').split(' ');
        }
        obj.media = Array.from(node.children).map(n => parseNode(n));
        return obj;
    }
    else if (isMedia(node.nodeName)) {
        let obj = {
            type: node.nodeName,
            src: node.getAttribute("src"),
        };
        if (node.id) {
            obj.id = node.getAttribute("id");
        }
        if (node.nodeName == "audio") {
            obj.clipBegin = parseClockValue(node.getAttribute("clipBegin"));
            obj.clipEnd = parseClockValue(node.getAttribute("clipEnd"));
        }
        obj.xmlString = node.outerHTML.replace('xmlns="http://www.w3.org/ns/SMIL"', '');
        return obj;
    }
}

// parse the timestamp and return the value in seconds
// supports this syntax: https://www.w3.org/publishing/epub/epub-mediaoverlays.html#app-clock-examples
function parseClockValue(value) { 
    if (!value) {
        return null;
    }
    let hours = 0;
    let mins = 0;
    let secs = 0;
    
    if (value.indexOf("min") != -1) {
        mins = parseFloat(value.substr(0, value.indexOf("min")));
    }
    else if (value.indexOf("ms") != -1) {
        var ms = parseFloat(value.substr(0, value.indexOf("ms")));
        secs = ms/1000;
    }
    else if (value.indexOf("s") != -1) {
        secs = parseFloat(value.substr(0, value.indexOf("s")));                
    }
    else if (value.indexOf("h") != -1) {
        hours = parseFloat(value.substr(0, value.indexOf("h")));                
    }
    else {
        // parse as hh:mm:ss.fraction
        // this also works for seconds-only, e.g. 12.345
        let arr = value.split(":");
        secs = parseFloat(arr.pop());
        if (arr.length > 0) {
            mins = parseFloat(arr.pop());
            if (arr.length > 0) {
                hours = parseFloat(arr.pop());
            }
        }
    }
    let total = hours * 3600 + mins * 60 + secs;
    return total;
}

export function secondsToHMSMS(seconds) {
    // Calculate hours, minutes, seconds, and milliseconds
    let hours = Math.floor(seconds / 3600);
    let minutes = Math.floor((seconds % 3600) / 60);
    let sec = seconds % 60;
    let milliseconds = Math.round((sec - Math.floor(sec)) * 1000);

    // Extract whole seconds
    let secondsInt = Math.floor(sec);

    // Format the output as hh:mm:ss.ttt
    return `${padZero(hours)}:${padZero(minutes)}:${padZero(secondsInt)}.${padZero(milliseconds, 3)}`;
}

// Helper function to pad single digits with leading zeroes
function padZero(num, length = 2) {
    return num.toString().padStart(length, '0');
}