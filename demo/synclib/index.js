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
    gotoNext() {
        if (this.canGotoNext()) {
            this.index++;
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
    canGotoNext() {
        return this.graph.length > 0 && this.index + 1 < this.indexOfLastStartEvent;
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
}

export { SyncMedia };

