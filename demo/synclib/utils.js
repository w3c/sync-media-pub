function fetchXmlFile(url) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('get', url, true);
        xhr.responseType = 'document';
        xhr.onload = function () {
            var status = xhr.status;
            if (status == 200) {
                resolve(xhr.response);
            } else {
                reject(status);
            }
        };
        xhr.send();
    });
}

// returns {textData, contentType}
async function fetchFile(url) {
    let res = await fetch(url);
    if (res && res.ok) {
        let contentType = getContentType(res);
        let textData = await res.text();
        return {textData, contentType};
    }
    else {
        throw new Error(`Error fetching ${url}`);
    }
}

function getContentType(res) {
    let contentType = res.headers.get("Content-Type");
    if (contentType) {
        if (contentType.indexOf(';') != -1) {
            return contentType.split(';')[0];
        }
        else {
            return contentType;
        }
    }
}

function calculateDuration(node) {
    if (node.hasOwnProperty('clipBegin') && node.hasOwnProperty('clipEnd')) {
        return parseFloat(node.clipEnd) - parseFloat(node.clipBegin);
    }
    // TODO analyze src for duration in the cases where clipBegin/clipEnd is missing
    else {
        return 0;
    }
}

let isSequence = name => name == "seq" || name == "body";
let isPar = name => name == "par";
let isMedia = name => name == "text" || name == "audio" 
    || name == "ref" || name == "video" 
    || name == "img";

let isTimedMedia = node => node.clipBegin || node.clipEnd || node.type == "audio" || node.type == "video";

let isTimeContainer = name => isSequence(name) || isPar(name);

// Visit a tree of objects with media children
function visit(node, fn) {
    fn(node);
    if (node?.media) {
        node.media.map(n => visit(n, fn));
    }
}

const getCircularReplacer = () => {
    const seen = new WeakSet();
    return (key, value) => {
        if (typeof value === "object" && value !== null) {
            if (seen.has(value)) {
                return;
            }
            seen.add(value);
        }
        return value;
    };
};
  
// stringify the object and don't print circular references
function circularStringify(obj) {
    return JSON.stringify(obj, getCircularReplacer(), 2);
}

function simpleTree(node) {
    let n = {
        _id: node._id,
        type: node.type
    };
    if (node.src) {
        n.src = node.src.href;
    }
    if (node.selector) {
        n.selector = node.selector;
    }
    if (node.hasOwnProperty('clipBegin')) {
        n.clipBegin = node.clipBegin;
    }
    if (node.hasOwnProperty('clipEnd')) {
        n.clipEnd = node.clipEnd;
    }
    if (node.media) {
        n.media = node.media.map(item => simpleTree(item));
    }

    return n;
}
// return a simple version of the object, good for debugging
function simpleTimegraph(graph) {
    let simpleGraph = graph.map(g => {
        let events = g.events.map(e => {
            let event = {
                eventType: e.eventType,
                elapsed: e.elapsed,
                nodeType: e.node.type,
                nodeId: e.node._id,
                nodeSrc: e.node.src,
                nodeSelector: e.node.selector,
                dur: e.node.dur
            };
            if (e.node.hasOwnProperty('clipBegin')) {
                event.clipBegin = e.node.clipBegin;
            }
            if (e.node.hasOwnProperty('clipEnd')) {
                event.clipEnd = e.node.clipEnd;
            }
            return event;
        });

        return {
            timestamp: g.timestamp,
            events
        };
    });
    return simpleGraph;
}

export { 
    calculateDuration,
    fetchXmlFile, 
    isSequence, 
    isPar, 
    isMedia, 
    isTimeContainer, 
    isTimedMedia, 
    visit, 
    fetchFile,
    circularStringify,
    simpleTimegraph,
    simpleTree
};