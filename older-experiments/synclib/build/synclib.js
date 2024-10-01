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

var utils = /*#__PURE__*/Object.freeze({
  __proto__: null,
  calculateDuration: calculateDuration,
  fetchXmlFile: fetchXmlFile,
  isSequence: isSequence,
  isPar: isPar,
  isMedia: isMedia,
  isTimeContainer: isTimeContainer,
  isTimedMedia: isTimedMedia,
  visit: visit,
  fetchFile: fetchFile,
  circularStringify: circularStringify,
  simpleTimegraph: simpleTimegraph,
  simpleTree: simpleTree
});

/* 
timegraph: 
ordered by timestamp
[
    {
        timestamp: 0,
        events: [
            {   
                node: {
                    src,
                    selector,
                    roles,
                    params,
                    clipBegin,
                    clipEnd,
                    type,
                    track,
                    dur
                },
                eventType: start | end | mid,
                elapsed: presentation time that's elapsed since start of node,
                timegraphEntries: all timegraph entries where this node appears in the events list
            }
            ...
        ]
    },
    ...
]
*/
function buildTimegraph(body) {
    addDurations(body);
    fixZeroDurations(body);
    let timegraph = createEvents(body);
    let entryId = 0;
    // add a property: last
    // this indicates that the node ends after this clip or segment is done
    timegraph.map((entry, idx) => {
        let startAndMidEvents = entry.events.filter(event => event.eventType == "start" || event.eventType == "mid");
        startAndMidEvents.map(event => {
            event.last = false;
            if (idx < timegraph.length - 1) {
                let nextEntry = timegraph[idx + 1];
                let endEvents = nextEntry.events.filter(event => event.eventType == "end");
                if (endEvents.find(endEvent => endEvent.node == event.node)) {
                    event.last = true;
                }
            }    
        });
        entry._id = entryId;
        entryId++;
    });
    
    return timegraph;
}

function addDurations(node) {
    if (node.dur) {
        return;
    }
    if (isMedia(node.type)) {
        if (isTimedMedia(node)) {
            node.dur = calculateDuration(node);
        }
        else {
            node.dur = 0;
        }
    }
    else if (isSequence(node.type)) {
        node.media?.map(item => addDurations(item));
        let sum = node.media?.map(item => item.dur)
            .reduce((dur, acc) => acc + dur);
        node.dur = sum;
    }
    else if (isPar(node.type)) {
        let most = null;
        if (node.media?.length) {
            most = node.media[0];
            node.media.map(item => {
                addDurations(item);
                if (item.dur > most.dur) {
                    most = item;
                }
            });
            node.dur = most.dur;
        }
        else {
            node.dur = 0;
        }
    }
}

// any node with a duration of zero should get the duration of its parent container
function fixZeroDurations(body) {
    visit(body, node => {
        if (node.dur == 0) {
            if (node.parent) {
                node.dur = node.parent.dur;
            }
        }
    });
}

function createEvents(node) {
    let timegraph = createStartEndEvents(node, 0);

    let started = [];
    // fill in the mid events
    timegraph.map(entry => {
        entry.events.map(event => {
            if (event.eventType == "end") {
                let idx = started.findIndex(n => n.node == event.node);
                started.splice(idx, 1);
            }
        });
        started.map(info => {
            let midEvent = {node: info.node, eventType: "mid", elapsed: entry.timestamp - info.timestamp};
            entry.events.push(midEvent);
            info.node.timegraphEntries.push(entry);
        });
        entry.events.map(event => {
            if (event.eventType == "start") {
                started.push({node: event.node, timestamp: entry.timestamp});
            }
        });
    });

    return timegraph;
}

function createStartEndEvents(node, wallclock = 0, timegraph = []) {
    let tgStartEntry = timegraph.find(entry => entry.timestamp === wallclock);
    let tgEndEntry = timegraph.find(entry => entry.timestamp === wallclock + node.dur);

    if (!tgStartEntry) {
        tgStartEntry = {timestamp: wallclock, events: []};
        timegraph.push(tgStartEntry);
    }
    if (!tgEndEntry) {
        if (node.dur == 0) {
            tgEndEntry = tgStartEntry;
        }
        else {
            tgEndEntry = {timestamp: wallclock + node.dur, events: []};
            timegraph.push(tgEndEntry);
        }
        
    }
    
    if (!node.timegraphEntries) {
        node.timegraphEntries = [tgStartEntry, tgEndEntry];
    }

    let startEvent = {
        node,
        eventType: "start",
        elapsed: 0
    };
    let endEvent = {
        node,
        eventType: "end",
        elapsed: wallclock + node.dur
    };

    tgStartEntry.events.push(startEvent);
    tgEndEntry.events.push(endEvent);
    
    if (isSequence(node.type)) {
        let elapsed = 0;
        node.media?.map(item => {
            createStartEndEvents(item, wallclock + elapsed, timegraph);
            elapsed += item.dur;
        });
    }
    else if (isPar(node.type)) {
        node.media?.map(item => createStartEndEvents(item, wallclock, timegraph));
    }

    return timegraph.sort((a,b) => a.timestamp < b.timestamp ? -1 : 1);
}

// input: SyncMedia XML string

function parse(xml) {
    let model = {};
    let domparser = new DOMParser();
    let doc = domparser.parseFromString(xml, "application/xml");
    let headElm = doc.documentElement.getElementsByTagName("head");
    if (headElm.length > 0) {
        model.head = parseHead(headElm[0]);
    }
    let bodyElm = doc.documentElement.getElementsByTagName("body");
    if (bodyElm.length > 0) {
        model.body = parseNode(bodyElm[0]);
    }
    return model;
}

function parseHead(node) {
    let obj = {};
    let tracks = Array.from(node.getElementsByTagName("sync:track"));
    obj.tracks = tracks.map(track => {
        let paramElms = Array.from(track.getElementsByTagName("param"));
        let trackObj = {
            label: track.getAttribute("sync:label"),
            defaultSrc: track.getAttribute("sync:defaultSrc"),
            defaultFor: track.getAttribute("sync:defaultFor"),
            trackType: track.getAttribute("sync:trackType"),
            id: track.getAttribute("id"),
            param: {}
        };
        if (paramElms.length > 0) {
            trackObj.params = parseParam(paramElms);
        }
        return trackObj;
    });
    obj.metadata = {};
    let metadataElm = Array.from(node.getElementsByTagName('metadata'));
    if (metadataElm.length > 0) {
        metadataElm = metadataElm[0]; // there's just one <metadata> element
        Array.from(metadataElm.children).map(metaElm => {
            // support <meta name=".." content=".."/>
            // and
            // <customTag>value</customTag> e.g. <dc:description>...</dc:description>
            if (metaElm.tagName == 'meta') {
                let name = metaElm.getAttribute('name');
                let content = metaElm.getAttribute('content');
                if (name && content) {
                    obj.metadata[name] = content;
                }
            }
            else {
                let name = metaElm.tagName;
                let content = metaElm.textContent;
                if (name && content) {
                    obj.metadata[name] = content;
                }
            }
        });
    }
    return obj;
}

function parseNode(node) {
    if (node.nodeName == "body" || node.nodeName == "seq" || node.nodeName == "par") {
        // body has type "seq"
        let type = node.nodeName == "body" || node.nodeName == "seq" ? "seq" : "par";
        let obj = {
            type,
            roles: parseRoles(node.getAttribute("sync:role")),
            media: Array.from(node.children).map(n => parseNode(n)),
            id: node.getAttribute("id")
        };
        return obj;
    }
    else if (isMedia(node.nodeName)) {
        let paramElms = Array.from(node.getElementsByTagName("param"));
        let obj = {
            type: node.nodeName,
            src: node.getAttribute("src"),
            track: node.getAttribute("sync:track"),
            id: node.getAttribute("id"),
            clipBegin: parseClockValue(node.getAttribute("clipBegin")),
            clipEnd: parseClockValue(node.getAttribute("clipEnd")),
            params: {}
        };
        if (paramElms.length > 0) {
            obj.params = parseParam(paramElms);
        }
        return obj;
    }
}

function parseParam(params) {
    let obj = {};
    params.map(param => {
        let name = param.getAttribute("name");
        let value = param.getAttribute("value");
        obj[name] = value;
    });
    return obj;
}

function parseRoles(roles) {
    if (roles) {
        let roleArray = roles.split(" ");
        return roleArray;
    }
    else {
        return [];
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

// input: SyncMedia JSON data model
// output: processed SyncMedia JSON data model

let internalId = 0;

// return a model with 
// - track objects are attached to media objects
// - track properties are copied onto the media objects to which they apply
// - internal IDs are assigned
// - null properties removed
// - srcs as full URL objects, resolved against baseUrl
// - separate property for selector, parsed out from src
function process(model, baseUrl) {

    // add internal Ids, they'll be useful later
    addInternalIds(model);

    if (model?.head?.tracks) {
        populateMediaObjectTracks(model.body, model.head.tracks);
    }
    
    resolveMediaData(model.body);
    removeNullAndEmptyProperties(model);
    addParent(model.body, null);
    let depth = getDepth(model.body, 1);
    let i;
    for (i=0; i<depth; i++) {
        removeTimeContainersWithNoMedia(model.body);
    }
    
    // allAssets is not filtered for uniqueness
    let allAssets = resolveSrc(model.body, baseUrl);
    // filter it for uniqueness and save as model.assets
    let uniqueSrcs = [];
    model.assets = allAssets.filter(asset => {
        let found = uniqueSrcs.includes(asset.src.href);
        if (!found) {
            uniqueSrcs.push(asset.src.href);
        }
        return !found;
    });
}

function addInternalIds(obj) {
    if (obj instanceof Array) {
        obj.map(item => addInternalIds(item));
    }
    else if (obj instanceof Object) {
        obj._id = internalId;
        internalId++;
        Object.keys(obj).map(k => addInternalIds(obj[k]));
    }
}

// replace the 'track' property of a media node with the actual track object
function populateMediaObjectTracks(node, tracks) {
    let findDefaultTrack = mediaType => {
        let defaultTrack = tracks.find(t => t.defaultFor == mediaType);
        return defaultTrack ?? null;
    };
    let findTrackById = trackId => {
        let foundTrack = tracks.find(t => t.id == trackId);
        return foundTrack ?? null;
    };

    if (isMedia(node.type)) {
        if (node.track) {
            let track = findTrackById(node.track);
            if (track) {
                node.track = track;
            }
        }
        else {
            let track = findDefaultTrack(node.type);
            if (track) {
                node.track = track;
            }
        }
    }
    else {
        if (node.media) {
            node.media.map(item => populateMediaObjectTracks(item, tracks));
        }
    }

}

// copy properties from tracks to media objects
function resolveMediaData(node, map) {
    // node could be a media object or a time container
    if (isMedia(node.type)) {
        // if this media object has a track mapped to it
        if (node.track) {
            let track = node.track;
            // go through the track properties and apply them to the media object
            if (track.defaultSrc) {
                // if the media object has an src
                if (node.src) {
                    // if it's just a fragment selector, then combine it with the track's default src
                    if (node.src[0] == "#") {
                        node.src = track.defaultSrc + node.src;
                        if (track.containerType) {
                            node.containerType = track.containerType;
                        }
                    }
                    // else node.src overrides track.defaultSrc
                    // so do nothing
                }
                // else the media object inherits the track's default src
                else {
                    node.src = track.defaultSrc;
                    if (track.containerType) {
                        node.containerType = track.containerType;
                    }
                }
            }
            if (track.params) {
                Object.keys(track.params).map(k => {
                    // defer to local params, otherwise inherit track params
                    if (!node.params.hasOwnProperty(k)) {
                        node.params[k] = track.params[k];
                    }
                });
            }
        }
    }
    // else is a time container
    else {
        if (node.media) {
            node.media.map(m => resolveMediaData(m));
        }
    }
}

function removeNullAndEmptyProperties(model) {
    Object.keys(model).map(k => {
        if (model[k] == null) {
            delete model[k];
        }
        if (model[k] instanceof Array) {
            if (model[k].length == 0) {
                delete model[k];
            }
            else {
                model[k].map(item => removeNullAndEmptyProperties(item));    
            }
        }
        else if (model[k] instanceof Object) {
            removeNullAndEmptyProperties(model[k]);
        }
    });
}

function addParent(node, parent) {
    if (parent != null && node.type) {
        if (isTimeContainer(node.type) || isMedia(node.type)) {
            node.parent = parent;
        }
    }
    if (isTimeContainer(node.type) && node.media) {
        node.media.map(item => addParent(item, node));
    }
}
function removeTimeContainersWithNoMedia(timeContainerNode) {
    if (timeContainerNode.media && timeContainerNode.media.length > 0) {
        let media = Array.from(timeContainerNode.media);
        
        while (media.length > 0) {
            let item = media.pop();
            if (isTimeContainer(item.type)) {
                removeTimeContainersWithNoMedia(timeContainerNode.media.find(entry => entry._id == item._id));
            }
        }
    }
    else {
        removeNode(timeContainerNode, "has no media objects");
    }
}

function removeNode(node, reason) {
    if (!node.parent) {
        throw new Error(`Cannot remove root node. Attempt was due to ${reason}`);
    }
    let idx = node.parent.media.indexOf(node);
    if (idx != -1) {
        node.parent.media.splice(idx, 1);
    }
}

function getDepth(node, depth) {
    if (node.media) {
        let depths = node.media.map(item => getDepth(item, depth+1));
        return Math.max(...depths);
    }
    return depth;
}

// return an array of {type, src}
function resolveSrc(node, baseUrl) {
    let srcs = [];
    if (node.src) {
        let idx = node.src.lastIndexOf("#");
        // trim trailing hash
        if (idx == node.src.length - 1) {
            node.src = node.src.slice(0, idx);
        }
        else {
            // separate out the selector from the src
            if (idx != -1) {
                node.selector = node.src.slice(idx);
                node.src = node.src.slice(0, idx);
            }
        }
        let url = new URL(node.src, baseUrl);
        node.src = url;
        srcs.push({type: node.type, src: url});
    }
    if (node.media) {
        let childSrcs = node.media.map(item => resolveSrc(item, baseUrl));
        srcs = srcs.concat(childSrcs.flat(1));
    }
    return srcs;
}

// creates a normalized tree and a playlist from a Sync document given by URL

class SyncMedia {
    constructor() {
        this.graph = [];
        this.model = null;
        this.errors = [];
        this.assets = [];
        this.index = 0;
        this.skips = [];
        this.roles = [];
        this.lastWithStartEventIndex = 0;
    }

    // url must be absolute. it may be a URL object or a string.
    async loadUrl(url) {
        console.log(`Loading ${url}`);
        this.errors = [];
        try {
            if (!(url instanceof URL) && typeof url != "string") {
                throw new Error("url must be a URL object or a string");
            }
            let url_ = typeof url === "string" ? new URL(url) : url;
        
            let file = await fetchFile(url_);
            
            if (file.contentType == "application/xml" || file.contentType == "application/xml+smil") {
                this.model = parse(file.textData);
            }
            else {
                throw new Error(`Unsupported input file ${file.contentType}`);
            }
            process(this.model, url_);

            this.assets = this.model.assets;

            // collect the roles
            let rolesList = [];
            visit(this.model.body, node => rolesList = rolesList.concat(node?.roles ?? []));
            this.roles = Array.from(new Set(rolesList));
            this.graph = buildTimegraph(this.model.body);

            this.graph.reverse();
            // find the last timegraph node with a "start" event, which is not going to be the last node in the array
            let idx = this.graph.findIndex(entry => entry.events.find(event => event.eventType == "start"));
            // reverse the index
            this.indexOfLastStartEvent = this.graph.length - 1 - idx;
            this.graph.reverse();

            // just for debugging purposes, draw the timegraph with only media nodes (not time containers)
            let mediaGraph = this.graph.map(entry => {
                let events = entry.events.filter(event => isMedia(event.node.type));
                return {... entry, events};
            });
            console.log(mediaGraph);
            
        }
        catch(err) {
            console.log("ERROR", err);
            this.errors.push(err);
        }
    }
    // returns the current timegraph node
    getCurrent() {
        if (this.index < 0 || this.index >= this.graph.length) {
            return null;
        }
        //console.log(this.graph[this.index]);
        return this.graph[this.index];
    }
    
    // goto functions move the cursor but don't return data
    gotoFirst() {
        this.index = 0;
    }
    gotoNextPlayable() {
        console.log("NEXT");
        if (this.canGotoNextPlayable()) {
            this.index = this.findNextStartEvent();
        }
    }
    gotoNext() {
        if (this.canGotoNext()) {
            this.index++;
        }
    }
    gotoPreviousPlayable() {
        console.log("PREVIOUS");
        if (this.canGotoPreviousPlayable()) {
            this.index = this.findPreviousStartEvent();
        }
    }
    gotoPrevious() {
        if (this.canGotoPrevious()) {
            this.index--;
        }
    }
    gotoLast() {
        if (this.graph.length == 0) {
            return;
        }
        return this.indexOfLastStartEvent;
        
    }
    peekNext() {
        if (this.canGoNext()) {
            return this.graph(this.index + 1);
        }
        return null;
    }
    canGotoNextPlayable() {
        return this.findNextStartEvent() != -1;
    }
    canGotoNext() {
        let res = this.graph.length > 0 && this.index + 1 < this.graph.length;
        console.log(`can go to next? idx = ${this.index}, so res = ${res}`);
        return res;
    }
    canGotoPreviousPlayable() {
        return this.findPreviousStartEvent() != -1;
    }
    canGotoPrevious() {
        return this.graph.length > 0 && this.index - 1 >= 0;
    }
    // TODO
    gotoSrc(src, selector) {
        // find the asset for this src
        // let asset = this.dom.querySelectorAll(`asset[src="${src}"]`);
        // let nodes = asset.internal.nodes;
        // if (nodes.length == 0){
        //     return null;
        // }
        // // find the node with the right selector
        // let targetNode;
        // if (selector != '') {
        //     targetNode = nodes.find (n => n.selector == selector);
        // }
        // else {
        //     targetNode = nodes[0];
        // }
        // if (node.internal.timegraphEntries.length > 0) {
        //     // the first timegraph entry should have the start event for this node
        //     return node.internal.timegraphEntries[0];
        // }
    }
    
    // pick the graph entry with the nearest timestamp
    // TODO test this
    gotoTimestamp(seconds) {
        if (this.graph.length == 0) {
            return null;
        }
        let nearest = this.graph[0];
        for (entry of this.graph) {
            if (entry.timestamp < seconds) {
                nearest = entry;
            }
            else {
                break;
            }
        }
        return this.graph.indexOf(nearest);
    }
    
    // TODO
    escapeCurrent(role = '') {
        // fast forward to the next timegraph entry after this time container has ended
        // which one is "this" time container?
        // if role is unspecified: choose the most recently-started time container with any role
        // if role is specified: choose the most recently-started time container with the given role
    }

    skipOn(role) {
        if (this.skips.indexOf(role) == -1) {
            this.skips.push(role);
        }
    }
    skipOff(role) {
        let idx = this.skips.indexOf(role);
        if (idx != -1) {
            this.skips = this.skips.splice(idx, 1);
        }
    }
    hasStartEvent(timegraphEntry) {
        return timegraphEntry.events.find(event => event.eventType == "start") != undefined;
    }
    findNextStartEvent() {
        let idx = this.index;
        let foundIdx = -1;
        while (idx < this.graph.length - 1) {
            idx++;
            if (this.hasStartEvent(this.graph[idx])) {
                foundIdx = idx;
                break;
            }
        }
        return foundIdx;
    }
    findPreviousStartEvent() {
        let idx = this.index;
        let foundIdx = -1;
        while (idx > 0) {
            idx--;
            if (this.hasStartEvent(this.graph[idx])) {
                foundIdx = idx;
                break;
            }
        }
        return foundIdx;
    }
}

const VERSION = '0.1.0';

export { SyncMedia, utils as Utils, VERSION };
