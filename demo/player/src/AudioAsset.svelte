<script>
    import { onMount } from 'svelte';
    import { createEventDispatcher } from 'svelte';
    import { currentTimegraphEntry } from './store.js';

    const dispatch = createEventDispatcher();

    export let asset;
    let audio;
    let startEvent;
    let endEvent;
    
    function audioTimeUpdate() {
        audio.playbackRate = 2.0; // speed up for debugging
        if (startEvent && audio.currentTime >= startEvent.node.clipEnd) {
            audio.removeEventListener('timeupdate', audioTimeUpdate);
            // emit "done" event for this clip 
            if (startEvent.node.hasShortestDur) {
                console.log("reporting audio done");
                dispatch('done', {  node: startEvent.node});
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
            audio.setAttribute('src', asset.src);
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
        let events = $currentTimegraphEntry.events.filter(event => 
            event.node.type == "audio" &&
            event.node.src.href == asset.src);
        startEvent = events.find(event => event.eventType == "start");
        endEvent = events.find(event => event.eventType == "end");

        if (startEvent) {
            audio.addEventListener('timeupdate', audioTimeUpdate);
            if (audio.currentTime < startEvent.node.clipBegin - .10 || 
                audio.currentTime > startEvent.node.clipEnd + .10) {
                audio.currentTime = startEvent.node.clipBegin;
                audio.play();
            }
            else {
                audio.play();
            }
        }
        if (endEvent && !startEvent) {
            audio.pause();
        }
    }
</script>
<audio bind:this={audio}></audio>