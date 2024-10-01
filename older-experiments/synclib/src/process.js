// input: SyncMedia JSON data model
// output: processed SyncMedia JSON data model

let internalId = 0;
import * as utils from './utils.js';

// return a model with 
// - track objects are attached to media objects
// - track properties are copied onto the media objects to which they apply
// - internal IDs are assigned
// - null properties removed
// - srcs as full URL objects, resolved against baseUrl
// - separate property for selector, parsed out from src
function process(model, baseUrl) {

    // add internal Ids, they'll be useful later
    addInternalIds(model, '');

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
        Object.keys(obj).map(k => addInternalIds(obj[k], k));
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

    if (utils.isMedia(node.type)) {
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
    if (utils.isMedia(node.type)) {
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
        // src for timed media may be embedded in HTML
        if (utils.isTimedMedia(node)) {
            let url = new URL(node.src);
            if (url.pathname.slice(url.length-6, url.length-1) == ".html") {
                node.src = resolveEmbeddedHtmlSrc(node);
                node.embeddedRef = url.href;
            }
        }
    }
    // else is a time container
    else {
        if (node.media) {
            node.media.map(m => resolveMediaData(m, map));
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
        if (utils.isTimeContainer(node.type) || utils.isMedia(node.type)) {
            node.parent = parent;
        }
    }
    if (utils.isTimeContainer(node.type) && node.media) {
        node.media.map(item => addParent(item, node));
    }
}
function removeTimeContainersWithNoMedia(timeContainerNode) {
    if (timeContainerNode.media && timeContainerNode.media.length > 0) {
        let media = Array.from(timeContainerNode.media);
        
        while (media.length > 0) {
            let item = media.pop();
            if (utils.isTimeContainer(item.type)) {
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

// node.src is file.html#ref and node.type is timed media
function resolveEmbeddedHtmlSrc(node) {
    // open the file
    let domparser = new DOMParser();
    let doc = domparser.parseFromString(src, "text/html");
    // find the reference
    // get the src 
}

export {
    process
};