
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function is_promise(value) {
        return value && typeof value === 'object' && typeof value.then === 'function';
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = value;
            let child_ctx = info.ctx;
            if (key !== undefined) {
                child_ctx = child_ctx.slice();
                child_ctx[key] = value;
            }
            const block = type && (info.current = type)(child_ctx);
            let needs_flush = false;
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, 1, () => {
                                info.blocks[i] = null;
                            });
                            check_outros();
                        }
                    });
                }
                else {
                    info.block.d(1);
                }
                block.c();
                transition_in(block, 1);
                block.m(info.mount(), info.anchor);
                needs_flush = true;
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
            if (needs_flush) {
                flush();
            }
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component(current_component);
                update(info.then, 1, info.value, value);
                set_current_component(null);
            }, error => {
                set_current_component(current_component);
                update(info.catch, 2, info.error, error);
                set_current_component(null);
                if (!info.hasCatch) {
                    throw error;
                }
            });
            // if we previously had a then/catch block, destroy it
            if (info.current !== info.pending) {
                update(info.pending, 0);
                return true;
            }
        }
        else {
            if (info.current !== info.then) {
                update(info.then, 1, info.value, promise);
                return true;
            }
            info.resolved = promise;
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.29.7' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
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
        timegraph.map(timegraphEntry => {
            let shortestNode = null;
            timegraphEntry.events.map(event => {
                if (isTimedMedia(event.node)) {
                    if (!shortestNode) {
                        shortestNode = event.node;
                    }
                    else {
                        if (event.node.dur < shortestNode.dur) {
                            shortestNode = event.node;
                        }
                    }
                }
            });
            if (shortestNode) shortestNode.hasShortestDur = true;
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

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    function createSyncMedia() {
    	const {subscribe, set, update} = writable(null);
    	return {
    		set,
    		subscribe,
    		next: () => {
    			return update(sm => {
    				sm.gotoNext();
    				return sm;
    			});
    		},
    		previous: () => {
    			return update(sm => {
    				sm.gotoPrevious();
    				return sm;
    			});
    		}
    	}
    }
    const syncMedia = createSyncMedia();

    const currentTimegraphEntry = derived(syncMedia, $syncMedia => $syncMedia ? $syncMedia.getCurrent() : null);
    const nextTimegraphEntry = derived(syncMedia, $syncMedia => $syncMedia ? $syncMedia.peekNext() : null);
    const canGotoNext = derived(syncMedia, $syncMedia => $syncMedia ? $syncMedia.canGotoNext() : false);
    const canGotoPrevious = derived(syncMedia, $syncMedia => $syncMedia ? $syncMedia.canGotoPrevious() : false);

    /* src/AudioAsset.svelte generated by Svelte v3.29.7 */

    const { console: console_1 } = globals;
    const file = "src/AudioAsset.svelte";

    function create_fragment(ctx) {
    	let audio_1;

    	const block = {
    		c: function create() {
    			audio_1 = element("audio");
    			add_location(audio_1, file, 70, 0, 2369);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, audio_1, anchor);
    			/*audio_1_binding*/ ctx[2](audio_1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(audio_1);
    			/*audio_1_binding*/ ctx[2](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $currentTimegraphEntry;
    	validate_store(currentTimegraphEntry, "currentTimegraphEntry");
    	component_subscribe($$self, currentTimegraphEntry, $$value => $$invalidate(5, $currentTimegraphEntry = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("AudioAsset", slots, []);
    	const dispatch = createEventDispatcher();
    	let { asset } = $$props;
    	let audio;
    	let startEvent;
    	let endEvent;

    	function audioTimeUpdate() {
    		$$invalidate(0, audio.playbackRate = 2, audio); // speed up for debugging

    		if (startEvent && audio.currentTime >= startEvent.node.clipEnd) {
    			audio.removeEventListener("timeupdate", audioTimeUpdate);

    			// emit "done" event for this clip 
    			if (startEvent.node.hasShortestDur) {
    				console.log("reporting audio done");
    				dispatch("done", { node: startEvent.node });
    			}
    		}
    	}

    	async function loadAudio(asset) {
    		console.log("loading audio", asset.src.href);

    		return new Promise((resolve, reject) => {
    				let audioCanPlayThrough = event => {
    					audio.removeEventListener("canplaythrough", audioCanPlayThrough);
    					console.log("loaded audio");
    					resolve();
    				};

    				audio.addEventListener("canplaythrough", audioCanPlayThrough);
    				audio.setAttribute("src", asset.src);
    			});
    	}

    	onMount(async () => {
    		await loadAudio(asset);
    		update();
    	});

    	currentTimegraphEntry.subscribe(() => {
    		if (audio) update();
    	});

    	function update() {
    		console.log("Current tg point", $currentTimegraphEntry);

    		// events relevant to this asset
    		let events = $currentTimegraphEntry.events.filter(event => event.node.type == "audio" && event.node.src.href == asset.src);

    		startEvent = events.find(event => event.eventType == "start");
    		endEvent = events.find(event => event.eventType == "end");

    		if (startEvent) {
    			audio.addEventListener("timeupdate", audioTimeUpdate);

    			if (audio.currentTime < startEvent.node.clipBegin - 0.1 || audio.currentTime > startEvent.node.clipEnd + 0.1) {
    				$$invalidate(0, audio.currentTime = startEvent.node.clipBegin, audio);
    				audio.play();
    			} else {
    				audio.play();
    			}
    		}

    		if (endEvent && !startEvent) {
    			audio.pause();
    		}
    	}

    	const writable_props = ["asset"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<AudioAsset> was created with unknown prop '${key}'`);
    	});

    	function audio_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			audio = $$value;
    			$$invalidate(0, audio);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("asset" in $$props) $$invalidate(1, asset = $$props.asset);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		createEventDispatcher,
    		currentTimegraphEntry,
    		dispatch,
    		asset,
    		audio,
    		startEvent,
    		endEvent,
    		audioTimeUpdate,
    		loadAudio,
    		update,
    		$currentTimegraphEntry
    	});

    	$$self.$inject_state = $$props => {
    		if ("asset" in $$props) $$invalidate(1, asset = $$props.asset);
    		if ("audio" in $$props) $$invalidate(0, audio = $$props.audio);
    		if ("startEvent" in $$props) startEvent = $$props.startEvent;
    		if ("endEvent" in $$props) endEvent = $$props.endEvent;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [audio, asset, audio_1_binding];
    }

    class AudioAsset extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { asset: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AudioAsset",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*asset*/ ctx[1] === undefined && !("asset" in props)) {
    			console_1.warn("<AudioAsset> was created without expected prop 'asset'");
    		}
    	}

    	get asset() {
    		throw new Error("<AudioAsset>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set asset(value) {
    		throw new Error("<AudioAsset>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/TextAsset.svelte generated by Svelte v3.29.7 */

    const { console: console_1$1 } = globals;
    const file$1 = "src/TextAsset.svelte";

    function create_fragment$1(ctx) {
    	let iframe_1;

    	const block = {
    		c: function create() {
    			iframe_1 = element("iframe");
    			attr_dev(iframe_1, "class", "nodisplay svelte-nq47zk");
    			add_location(iframe_1, file$1, 77, 0, 2629);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, iframe_1, anchor);
    			/*iframe_1_binding*/ ctx[2](iframe_1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(iframe_1);
    			/*iframe_1_binding*/ ctx[2](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $currentTimegraphEntry;
    	validate_store(currentTimegraphEntry, "currentTimegraphEntry");
    	component_subscribe($$self, currentTimegraphEntry, $$value => $$invalidate(5, $currentTimegraphEntry = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("TextAsset", slots, []);
    	let { asset } = $$props;
    	let iframe;
    	let startEvent;
    	let endEvent;

    	let isInViewport = (elm, doc = iframe.contentDocument) => {
    		let bounding = elm.getBoundingClientRect();
    		return bounding.top >= 0 && bounding.left >= 0 && bounding.bottom <= (doc.defaultView.innerHeight || doc.documentElement.clientHeight) && bounding.right <= (doc.defaultView.innerWidth || doc.documentElement.clientWidth);
    	};

    	let applyStyle = () => {
    		if (iframe.contentDocument) {
    			let oldElms = Array.from(iframe.contentDocument.querySelectorAll("." + startEvent.node.params.cssClass));
    			oldElms.map(oldElm => oldElm.classList.remove(startEvent.node.params.cssClass));
    			let elm = iframe.contentDocument.querySelector(startEvent.node.selector);

    			// apply params
    			if (startEvent.node.params.cssClass) {
    				elm.classList.add(startEvent.node.params.cssClass);
    			}

    			if (!isInViewport(elm)) {
    				elm.scrollIntoView();
    			}
    		}
    	};

    	async function loadIframe(asset) {
    		console.log("loading text", asset.src.href);

    		return new Promise((resolve, reject) => {
    				//let iframeElement = document.querySelector("iframe");
    				$$invalidate(
    					0,
    					iframe.onload = () => {
    						console.log("loaded text", iframe.src);
    						resolve();
    					},
    					iframe
    				);

    				iframe.setAttribute("src", asset.src.href);
    			});
    	}

    	onMount(async () => {
    		console.log("text onmount", asset);
    		await loadIframe(asset);
    		update();
    	});

    	currentTimegraphEntry.subscribe(() => {
    		if (iframe) update();
    	});

    	function update() {
    		console.log("Current tg point", $currentTimegraphEntry);

    		// events relevant to this asset
    		let events = $currentTimegraphEntry.events.filter(event => event.node.type == "text" && event.node.src.href == asset.src);

    		startEvent = events.find(event => event.eventType == "start");
    		endEvent = events.find(event => event.eventType == "end");

    		if (startEvent) {
    			console.log("showing iframe", iframe.src);
    			iframe.classList.remove("nodisplay");
    			applyStyle();
    		}

    		if (endEvent && !startEvent) {
    			console.log("hiding iframe", iframe.src);
    			iframe.classList.add("nodisplay");
    		}
    	}

    	const writable_props = ["asset"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<TextAsset> was created with unknown prop '${key}'`);
    	});

    	function iframe_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			iframe = $$value;
    			$$invalidate(0, iframe);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("asset" in $$props) $$invalidate(1, asset = $$props.asset);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		currentTimegraphEntry,
    		asset,
    		iframe,
    		startEvent,
    		endEvent,
    		isInViewport,
    		applyStyle,
    		loadIframe,
    		update,
    		$currentTimegraphEntry
    	});

    	$$self.$inject_state = $$props => {
    		if ("asset" in $$props) $$invalidate(1, asset = $$props.asset);
    		if ("iframe" in $$props) $$invalidate(0, iframe = $$props.iframe);
    		if ("startEvent" in $$props) startEvent = $$props.startEvent;
    		if ("endEvent" in $$props) endEvent = $$props.endEvent;
    		if ("isInViewport" in $$props) isInViewport = $$props.isInViewport;
    		if ("applyStyle" in $$props) applyStyle = $$props.applyStyle;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [iframe, asset, iframe_1_binding];
    }

    class TextAsset extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { asset: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TextAsset",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*asset*/ ctx[1] === undefined && !("asset" in props)) {
    			console_1$1.warn("<TextAsset> was created without expected prop 'asset'");
    		}
    	}

    	get asset() {
    		throw new Error("<TextAsset>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set asset(value) {
    		throw new Error("<TextAsset>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.29.7 */
    const file$2 = "src/App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    // (31:0) {:else}
    function create_else_block(ctx) {
    	let await_block_anchor;
    	let promise_1;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block,
    		blocks: [,,,]
    	};

    	handle_promise(promise_1 = /*promise*/ ctx[6], info);

    	const block = {
    		c: function create() {
    			await_block_anchor = empty();
    			info.block.c();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, await_block_anchor, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			{
    				const child_ctx = ctx.slice();
    				info.block.p(child_ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(await_block_anchor);
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(31:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (27:0) {#if !userOk}
    function create_if_block(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Start!";
    			attr_dev(button, "class", "svelte-1x877iy");
    			add_location(button, file$2, 29, 0, 827);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*giveOk*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(27:0) {#if !userOk}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script>  import {SyncMedia}
    function create_catch_block(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block.name,
    		type: "catch",
    		source: "(1:0) <script>  import {SyncMedia}",
    		ctx
    	});

    	return block;
    }

    // (36:0) {:then}
    function create_then_block(ctx) {
    	let t0;
    	let div0;
    	let t1;
    	let div1;
    	let t2;
    	let div2;
    	let t3;
    	let button0;
    	let t4;
    	let button0_disabled_value;
    	let t5;
    	let button1;
    	let t6;
    	let button1_disabled_value;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_3 = /*$syncMedia*/ ctx[1].assets.filter(func);
    	validate_each_argument(each_value_3);
    	let each_blocks_3 = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks_3[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
    	}

    	const out = i => transition_out(each_blocks_3[i], 1, 1, () => {
    		each_blocks_3[i] = null;
    	});

    	let each_value_2 = /*$syncMedia*/ ctx[1].assets.filter(func_1);
    	validate_each_argument(each_value_2);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_2[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	const out_1 = i => transition_out(each_blocks_2[i], 1, 1, () => {
    		each_blocks_2[i] = null;
    	});

    	let each_value_1 = /*$syncMedia*/ ctx[1].assets.filter(func_2);
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out_2 = i => transition_out(each_blocks_1[i], 1, 1, () => {
    		each_blocks_1[i] = null;
    	});

    	let each_value = /*$syncMedia*/ ctx[1].assets.filter(func_3);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out_3 = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				each_blocks_3[i].c();
    			}

    			t0 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t1 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t2 = space();
    			div2 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t3 = space();
    			button0 = element("button");
    			t4 = text("Previous");
    			t5 = space();
    			button1 = element("button");
    			t6 = text("Next");
    			attr_dev(div0, "class", "texts svelte-1x877iy");
    			add_location(div0, file$2, 41, 0, 1134);
    			attr_dev(div1, "class", "images");
    			add_location(div1, file$2, 47, 0, 1259);
    			attr_dev(div2, "class", "videos");
    			add_location(div2, file$2, 53, 0, 1387);
    			button0.disabled = button0_disabled_value = !/*$canGotoPrevious*/ ctx[2];
    			attr_dev(button0, "class", "svelte-1x877iy");
    			add_location(button0, file$2, 59, 0, 1515);
    			button1.disabled = button1_disabled_value = !/*$canGotoNext*/ ctx[3];
    			attr_dev(button1, "class", "svelte-1x877iy");
    			add_location(button1, file$2, 60, 0, 1602);
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				each_blocks_3[i].m(target, anchor);
    			}

    			insert_dev(target, t0, anchor);
    			insert_dev(target, div0, anchor);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(div0, null);
    			}

    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div1, null);
    			}

    			insert_dev(target, t2, anchor);
    			insert_dev(target, div2, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}

    			insert_dev(target, t3, anchor);
    			insert_dev(target, button0, anchor);
    			append_dev(button0, t4);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, button1, anchor);
    			append_dev(button1, t6);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", syncMedia.previous, false, false, false),
    					listen_dev(button1, "click", syncMedia.next, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$syncMedia, mediaDone*/ 34) {
    				each_value_3 = /*$syncMedia*/ ctx[1].assets.filter(func);
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3(ctx, each_value_3, i);

    					if (each_blocks_3[i]) {
    						each_blocks_3[i].p(child_ctx, dirty);
    						transition_in(each_blocks_3[i], 1);
    					} else {
    						each_blocks_3[i] = create_each_block_3(child_ctx);
    						each_blocks_3[i].c();
    						transition_in(each_blocks_3[i], 1);
    						each_blocks_3[i].m(t0.parentNode, t0);
    					}
    				}

    				group_outros();

    				for (i = each_value_3.length; i < each_blocks_3.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (dirty & /*$syncMedia*/ 2) {
    				each_value_2 = /*$syncMedia*/ ctx[1].assets.filter(func_1);
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    						transition_in(each_blocks_2[i], 1);
    					} else {
    						each_blocks_2[i] = create_each_block_2(child_ctx);
    						each_blocks_2[i].c();
    						transition_in(each_blocks_2[i], 1);
    						each_blocks_2[i].m(div0, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_2.length; i < each_blocks_2.length; i += 1) {
    					out_1(i);
    				}

    				check_outros();
    			}

    			if (dirty & /*$syncMedia*/ 2) {
    				each_value_1 = /*$syncMedia*/ ctx[1].assets.filter(func_2);
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    						transition_in(each_blocks_1[i], 1);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						transition_in(each_blocks_1[i], 1);
    						each_blocks_1[i].m(div1, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks_1.length; i += 1) {
    					out_2(i);
    				}

    				check_outros();
    			}

    			if (dirty & /*$syncMedia*/ 2) {
    				each_value = /*$syncMedia*/ ctx[1].assets.filter(func_3);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div2, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out_3(i);
    				}

    				check_outros();
    			}

    			if (!current || dirty & /*$canGotoPrevious*/ 4 && button0_disabled_value !== (button0_disabled_value = !/*$canGotoPrevious*/ ctx[2])) {
    				prop_dev(button0, "disabled", button0_disabled_value);
    			}

    			if (!current || dirty & /*$canGotoNext*/ 8 && button1_disabled_value !== (button1_disabled_value = !/*$canGotoNext*/ ctx[3])) {
    				prop_dev(button1, "disabled", button1_disabled_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_3.length; i += 1) {
    				transition_in(each_blocks_3[i]);
    			}

    			for (let i = 0; i < each_value_2.length; i += 1) {
    				transition_in(each_blocks_2[i]);
    			}

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks_1[i]);
    			}

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks_3 = each_blocks_3.filter(Boolean);

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				transition_out(each_blocks_3[i]);
    			}

    			each_blocks_2 = each_blocks_2.filter(Boolean);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				transition_out(each_blocks_2[i]);
    			}

    			each_blocks_1 = each_blocks_1.filter(Boolean);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				transition_out(each_blocks_1[i]);
    			}

    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks_3, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div0);
    			destroy_each(each_blocks_2, detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks_1, detaching);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(button0);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(button1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block.name,
    		type: "then",
    		source: "(36:0) {:then}",
    		ctx
    	});

    	return block;
    }

    // (38:0) {#each $syncMedia.assets.filter(a => a.type == "audio") as asset}
    function create_each_block_3(ctx) {
    	let audioasset;
    	let current;

    	audioasset = new AudioAsset({
    			props: { asset: /*asset*/ ctx[8] },
    			$$inline: true
    		});

    	audioasset.$on("done", /*mediaDone*/ ctx[5]);

    	const block = {
    		c: function create() {
    			create_component(audioasset.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(audioasset, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const audioasset_changes = {};
    			if (dirty & /*$syncMedia*/ 2) audioasset_changes.asset = /*asset*/ ctx[8];
    			audioasset.$set(audioasset_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(audioasset.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(audioasset.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(audioasset, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3.name,
    		type: "each",
    		source: "(38:0) {#each $syncMedia.assets.filter(a => a.type == \\\"audio\\\") as asset}",
    		ctx
    	});

    	return block;
    }

    // (43:1) {#each $syncMedia.assets.filter(a => a.type == "text") as asset}
    function create_each_block_2(ctx) {
    	let textasset;
    	let current;

    	textasset = new TextAsset({
    			props: { asset: /*asset*/ ctx[8] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(textasset.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(textasset, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const textasset_changes = {};
    			if (dirty & /*$syncMedia*/ 2) textasset_changes.asset = /*asset*/ ctx[8];
    			textasset.$set(textasset_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(textasset.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(textasset.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(textasset, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(43:1) {#each $syncMedia.assets.filter(a => a.type == \\\"text\\\") as asset}",
    		ctx
    	});

    	return block;
    }

    // (49:1) {#each $syncMedia.assets.filter(a => a.type == "image") as asset}
    function create_each_block_1(ctx) {
    	let imageasset;
    	let current;

    	imageasset = new ImageAsset({
    			props: { asset: /*asset*/ ctx[8] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(imageasset.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(imageasset, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const imageasset_changes = {};
    			if (dirty & /*$syncMedia*/ 2) imageasset_changes.asset = /*asset*/ ctx[8];
    			imageasset.$set(imageasset_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(imageasset.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(imageasset.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(imageasset, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(49:1) {#each $syncMedia.assets.filter(a => a.type == \\\"image\\\") as asset}",
    		ctx
    	});

    	return block;
    }

    // (55:1) {#each $syncMedia.assets.filter(a => a.type == "video") as asset}
    function create_each_block(ctx) {
    	let videoasset;
    	let current;

    	videoasset = new VideoAsset({
    			props: { asset: /*asset*/ ctx[8] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(videoasset.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(videoasset, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const videoasset_changes = {};
    			if (dirty & /*$syncMedia*/ 2) videoasset_changes.asset = /*asset*/ ctx[8];
    			videoasset.$set(videoasset_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(videoasset.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(videoasset.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(videoasset, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(55:1) {#each $syncMedia.assets.filter(a => a.type == \\\"video\\\") as asset}",
    		ctx
    	});

    	return block;
    }

    // (32:17)   <p>Loading...</p>  {:then}
    function create_pending_block(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Loading...";
    			add_location(p, file$2, 33, 0, 896);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block.name,
    		type: "pending",
    		source: "(32:17)   <p>Loading...</p>  {:then}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (!/*userOk*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const func = a => a.type == "audio";
    const func_1 = a => a.type == "text";
    const func_2 = a => a.type == "image";
    const func_3 = a => a.type == "video";

    function instance$2($$self, $$props, $$invalidate) {
    	let $syncMedia;
    	let $canGotoPrevious;
    	let $canGotoNext;
    	validate_store(syncMedia, "syncMedia");
    	component_subscribe($$self, syncMedia, $$value => $$invalidate(1, $syncMedia = $$value));
    	validate_store(canGotoPrevious, "canGotoPrevious");
    	component_subscribe($$self, canGotoPrevious, $$value => $$invalidate(2, $canGotoPrevious = $$value));
    	validate_store(canGotoNext, "canGotoNext");
    	component_subscribe($$self, canGotoNext, $$value => $$invalidate(3, $canGotoNext = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let userOk = false;
    	let giveOk = () => $$invalidate(0, userOk = true);

    	function mediaDone(event) {
    		syncMedia.next();
    	}

    	

    	async function loadSyncMedia() {
    		let file = "/fairytale/THE-MASTER-CAT;-OR,-PUSS-IN-BOOTS.xml";
    		let url = new URL(file, document.baseURI);
    		let parsedSyncMedia = new SyncMedia();
    		await parsedSyncMedia.loadUrl(url);
    		syncMedia.set(parsedSyncMedia);
    		return syncMedia;
    	}

    	let promise = loadSyncMedia();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		SyncMedia,
    		syncMedia,
    		canGotoNext,
    		canGotoPrevious,
    		currentTimegraphEntry,
    		AudioAsset,
    		TextAsset,
    		userOk,
    		giveOk,
    		mediaDone,
    		loadSyncMedia,
    		promise,
    		$syncMedia,
    		$canGotoPrevious,
    		$canGotoNext
    	});

    	$$self.$inject_state = $$props => {
    		if ("userOk" in $$props) $$invalidate(0, userOk = $$props.userOk);
    		if ("giveOk" in $$props) $$invalidate(4, giveOk = $$props.giveOk);
    		if ("promise" in $$props) $$invalidate(6, promise = $$props.promise);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [userOk, $syncMedia, $canGotoPrevious, $canGotoNext, giveOk, mediaDone, promise];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    const app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
