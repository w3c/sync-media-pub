<script>
    import { onMount } from 'svelte';
    import { currentTimegraphEntry } from './store.js';
    export let asset;

    let iframe;
    let startEvent;
    let endEvent;

    let isInViewport = (elm, doc=iframe.contentDocument) => {
        let bounding = elm.getBoundingClientRect();
        return (
            bounding.top >= 0 &&
            bounding.left >= 0 &&
            bounding.bottom <= (doc.defaultView.innerHeight || doc.documentElement.clientHeight) &&
            bounding.right <= (doc.defaultView.innerWidth || doc.documentElement.clientWidth)
        );
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
            iframe.onload = () => {
                console.log("loaded text", iframe.src);
                resolve();     
            };
            iframe.setAttribute('src', asset.src.href);
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
        let events = $currentTimegraphEntry.events.filter(event => 
            event.node.type == "text" &&
            event.node.src.href == asset.src);
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
    
</script>
<iframe class="nodisplay" bind:this={iframe}></iframe>

<style>
    iframe {
        height: 40rem;
        width: 40rem;
    }
    iframe.nodisplay {
        display: none;
    }
</style>