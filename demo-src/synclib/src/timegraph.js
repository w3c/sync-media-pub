import * as utils from './utils.js';

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
    if (utils.isMedia(node.type)) {
        if (utils.isTimedMedia(node)) {
            node.dur = utils.calculateDuration(node);
        }
        else {
            node.dur = 0;
        }
    }
    else if (utils.isSequence(node.type)) {
        node.media?.map(item => addDurations(item));
        let sum = node.media?.map(item => item.dur)
            .reduce((dur, acc) => acc + dur);
        node.dur = sum;
    }
    else if (utils.isPar(node.type)) {
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
    utils.visit(body, node => {
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
    
    if (utils.isSequence(node.type)) {
        let elapsed = 0;
        node.media?.map(item => {
            createStartEndEvents(item, wallclock + elapsed, timegraph);
            elapsed += item.dur;
        });
    }
    else if (utils.isPar(node.type)) {
        node.media?.map(item => createStartEndEvents(item, wallclock, timegraph));
    }

    return timegraph.sort((a,b) => a.timestamp < b.timestamp ? -1 : 1);
}

export { buildTimegraph }