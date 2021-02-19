<script>
    import { onMount } from 'svelte';
    import { createEventDispatcher } from 'svelte';
    import { currentTimegraphEntry, playState } from './store.js';
    const dispatch = createEventDispatcher();

    export let asset;
    let audio;
    let startEvent, midEvent, endEvent;
    
    let basename = path => typeof path === 'string' ? path.split('/').reverse()[0] : '';

    function audioTimeUpdate() {
        // console.log("audio timeupdate", audio.src);
        // console.log(".. timestamp", audio.currentTime);
        if ((startEvent && audio.currentTime >= startEvent.node.clipEnd) || 
            (midEvent && audio.currentTime >= midEvent.node.clipEnd)) {
            console.log(`AUDIO :: ${basename(audio.src.href)} :: END OF CLIP :: ${startEvent ? startEvent.node.clipEnd : midEvent.node.clipEnd}`);
            audio.removeEventListener('timeupdate', audioTimeUpdate);
            // emit "done" event for this clip 
            // "last" = true means this clip does not appear in the next timegraph entry
            // so when it's done, it helps signify that the timegraph entry is also done
            if ((startEvent && startEvent.last) || (midEvent && midEvent.last)) {
                dispatch('done', {  event: startEvent ?? midEvent});
            }
            else {
                console.log(`AUDIO :: ${basename(audio.src.href)} :: event is not 'last' :: ${startEvent ?? midEvent}`);
            }
        }
    }

    async function loadAudio(asset) {
        console.log(`AUDIO :: ${basename(asset.src.href)} :: LOADING`);
        return new Promise((resolve, reject) => {
            let audioCanPlayThrough = event => {
                audio.removeEventListener("canplaythrough", audioCanPlayThrough);
                // console.log("loaded audio");
                resolve();
            };
            audio.addEventListener("canplaythrough", audioCanPlayThrough);
            audio.setAttribute('src', asset.src);
        });
    }
    onMount(async () => {
        // console.log("Audio on mount", asset);
        await loadAudio(asset);
        update();
    });

    currentTimegraphEntry.subscribe(() => {
        if (audio) update();
    });

    playState.subscribe(() => {
        console.log(`AUDIO :: ${basename(asset.src.href)} :: PLAYSTATE :: ${$playState}`);
        if ($playState == "PLAYING") {
            if (audio) update();

        }
        else if ($playState == "STOPPED") {
            if (audio) audio.pause();
        }
    })
    
    function update() {
        console.log(`AUDIO :: ${basename(asset.src.href)} :: CURRENT TG POINT :: ${currentTimegraphEntry}`);
        
        // events relevant to this asset
        let events = $currentTimegraphEntry.events.filter(event => 
            event.node.type == "audio" &&
            event.node.src.href == asset.src);
        startEvent = events.find(event => event.eventType == "start");
        midEvent = events.find(event => event.eventType == "mid");
        endEvent = events.find(event => event.eventType == "end");

        if (startEvent || midEvent) {
            let event = startEvent ?? midEvent;
            let clipStartTime;
            if (startEvent) {
                console.log(`AUDIO :: ${basename(event.node.src.href)} :: START EVENT :: ${event.node.clipBegin} - ${event.node.clipEnd}`);
                clipStartTime = event.node.clipBegin;
            }
            else {
                console.log(`AUDIO :: ${basename(event.node.src.href)} :: MID EVENT :: ${event.node.clipBegin} - ${event.node.clipEnd}`);
                clipStartTime = event.node.clipBegin + event.elapsed;
            }
            processParams(event);
            audio.addEventListener('timeupdate', audioTimeUpdate);
            if (audio.currentTime < event.node.clipBegin - .40 || 
                audio.currentTime > event.node.clipBegin + .40) {
                console.log(`AUDIO :: ${basename(audio.src)} :: current time = ${audio.currentTime}`);
                console.log(`AUDIO :: ${basename(audio.src)} :: clip start time = ${clipStartTime}`);
                console.log(`AUDIO :: ${basename(audio.src)} :: repositioning clip`);
                audio.currentTime = clipStartTime;
            }
            console.log(`AUDIO :: ${basename(audio.src)} :: current time = ${audio.currentTime}`);
            console.log(`AUDIO :: ${basename(audio.src)} :: clip start time = ${clipStartTime}`);
            if ($playState == "PLAYING") audio.play();
        }
        else if (endEvent) {
            console.log(`AUDIO :: ${basename(endEvent.node.src.href)} :: END EVENT`);
            audio.pause();
            dispatch('done', {  event: endEvent});
        }
        else {
            // if there's no event, make sure we're not playing
            audio.pause();
        }
        
    }   

    function processParams(timegraphEvent) {
        if (timegraphEvent?.node?.params) {
            for (var paramName in timegraphEvent.node.params) {
                if (paramName == "playbackRate") {
                    audio.playbackRate = timegraphEvent.node.params[paramName];
                }
            }
        }
    }
</script>
<audio bind:this={audio}></audio>