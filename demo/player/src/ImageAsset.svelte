<script>
    import { onMount } from 'svelte';
    import { currentTimegraphEntry } from './store.js';
    export let asset;

    let image;
    let startEvent;
    let endEvent;

    async function loadImage(asset) {
        console.log("loading image", asset.src.href);
        return new Promise((resolve, reject) => {
            image.onload = () => {
                console.log("loaded image", image.src);
                resolve();     
            };
            image.setAttribute('src', asset.src.href);
        });
    }

    onMount(async () => {
        console.log("image onmount", asset);
        await loadImage(asset);
        update();
    });

    currentTimegraphEntry.subscribe(() => {
        if (image) update();
    });
    
    function update() {
        console.log("Current tg point", $currentTimegraphEntry);
        // events relevant to this asset
        let events = $currentTimegraphEntry.events.filter(event => 
            event.node.type == "image" &&
            event.node.src.href == asset.src);
        startEvent = events.find(event => event.eventType == "start");
        endEvent = events.find(event => event.eventType == "end");

        if (startEvent) {
            image.classList.remove("nodisplay");
            applyStyle();
        }
        if (endEvent && !startEvent) {
            image.classList.add("nodisplay");
        }
    }
    
</script>
<img class="nodisplay" bind:this={image}>

<style>
    img.nodisplay {
        display: none;
    }
</style>