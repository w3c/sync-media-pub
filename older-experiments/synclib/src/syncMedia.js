// creates a normalized tree and a playlist from a Sync document given by URL

import * as graph from './timegraph.js';
import * as utils from './utils.js';
import {parse} from './ingestXml.js';
import {process} from './process.js';

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
        
            let file = await utils.fetchFile(url_);
            
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
            utils.visit(this.model.body, node => rolesList = rolesList.concat(node?.roles ?? []));
            this.roles = Array.from(new Set(rolesList));
            this.graph = graph.buildTimegraph(this.model.body);

            this.graph.reverse();
            // find the last timegraph node with a "start" event, which is not going to be the last node in the array
            let idx = this.graph.findIndex(entry => entry.events.find(event => event.eventType == "start"));
            // reverse the index
            this.indexOfLastStartEvent = this.graph.length - 1 - idx;
            this.graph.reverse();

            // just for debugging purposes, draw the timegraph with only media nodes (not time containers)
            let mediaGraph = this.graph.map(entry => {
                let events = entry.events.filter(event => utils.isMedia(event.node.type));
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

export { SyncMedia };

