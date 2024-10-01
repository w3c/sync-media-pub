// input: SyncMedia XML string
// output: JSON data model
import * as Util from './utils.js';

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
        model.body = parseNode(bodyElm[0], model);
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
                else {
                    // TODO issue a warning
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
    else if (Util.isMedia(node.nodeName)) {
        let paramElms = Array.from(node.getElementsByTagName("param"));
        let obj = {
            type: node.nodeName,
            src: node.getAttribute("src"),
            track: node.getAttribute("sync:track"),
            id: node.getAttribute("id"),
            clipBegin: parseClockValue(node.getAttribute("clipBegin")),
            clipEnd: parseClockValue(node.getAttribute("clipEnd")),
            params: {}
        }
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
export {parse};