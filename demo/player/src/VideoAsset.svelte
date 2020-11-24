<script>
    import { onMount } from 'svelte';
    import { createEventDispatcher } from 'svelte';
    import { currentTimegraphEntry } from './store.js';

    const dispatch = createEventDispatcher();

    export let asset;
    let video;
    let startEvent;
    let endEvent;
    
    function videoTimeUpdate() {
        video.playbackRate = 2.0; // speed up for debugging
        if (startEvent && video.currentTime >= startEvent.node.clipEnd) {
            video.removeEventListener('timeupdate', videoTimeUpdate);
            // emit "done" event for this clip 
            if (startEvent.node.hasShortestDur) {
                console.log("reporting video done");
                dispatch('done', {  node: startEvent.node});
            }
        }
    }

    async function loadVideo(asset) {
        console.log("loading video", asset.src.href);
        return new Promise((resolve, reject) => {
            let videoCanPlayThrough = event => {
                video.removeEventListener("canplaythrough", videoCanPlayThrough);
                console.log("loaded video");
                resolve();
            };
            video.addEventListener("canplaythrough", videoCanPlayThrough);
            video.setAttribute('src', asset.src);
        });
    }
    onMount(async () => {
        await loadVideo(asset);
        update();
    });

    currentTimegraphEntry.subscribe(() => {
        if (video) update();
    });
    
    function update() {
        console.log("Current tg point", $currentTimegraphEntry);
        // events relevant to this asset
        let events = $currentTimegraphEntry.events.filter(event => 
            event.node.type == "video" &&
            event.node.src.href == asset.src);
        startEvent = events.find(event => event.eventType == "start");
        endEvent = events.find(event => event.eventType == "end");

        if (startEvent) {
            video.addEventListener('timeupdate', videoTimeUpdate);
            if (video.currentTime < startEvent.node.clipBegin - .10 || 
                video.currentTime > startEvent.node.clipEnd + .10) {
                video.currentTime = startEvent.node.clipBegin;
                video.play();
            }
            else {
                video.play();
            }
        }
        if (endEvent && !startEvent) {
            video.pause();
        }
    }
</script>
<video bind:this={video}></video>