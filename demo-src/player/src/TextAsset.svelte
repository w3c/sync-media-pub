<script>
    import { onMount } from 'svelte';
    import { currentTimegraphEntry, syncMedia } from './store.js';
    export let asset;

    let iframe;
    let startEvents;
    let endEvents;

    let isInViewport = (elm, doc=iframe.contentDocument) => {
        let bounding = elm.getBoundingClientRect();
        return (
            bounding.top >= 0 &&
            bounding.left >= 0 &&
            bounding.bottom <= (doc.defaultView.innerHeight || doc.documentElement.clientHeight) &&
            bounding.right <= (doc.defaultView.innerWidth || doc.documentElement.clientWidth)
        );
    };

    let applyStyle = (selector, cssClass) => {
        console.log("Apply style", selector, cssClass);
        if (iframe.contentDocument) {
            let elm = iframe.contentDocument.querySelector(selector);
            // apply css class
            if (cssClass) {
                elm.classList.add(cssClass);
            }
            // ensure element is visible
            if (!isInViewport(elm)) {
                elm.scrollIntoView();
            }
        }
    };
    let removeStyle = (selector, cssClass) => {
        console.log("Remove style", selector, cssClass);
        if (iframe.contentDocument) {
            let elm = iframe.contentDocument.querySelector(selector);
            // remove css class
            if (cssClass) {
                elm.classList.remove(cssClass);
            }
        }
    }

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
        startEvents = events.filter(event => event.eventType == "start");
        endEvents = events.filter(event => event.eventType == "end");

        if (startEvents) {
            console.log("showing iframe", iframe.src);
            iframe.classList.remove("nodisplay");
            startEvents.map(startEvent => applyStyle(startEvent.node.selector, startEvent.node.params.cssClass));
        }
        if (endEvents) {
            endEvents.map(endEvent => {
                console.log("end event", endEvent);
                removeStyle(endEvent.node.selector, endEvent.node.params.cssClass);
            });

            // if nothing new is starting
            if (!startEvents) {
            
                if ($syncMedia.canGotoNext()) {
                    console.log("hiding iframe", iframe.src);
                    iframe.classList.add("nodisplay");
                }
                else {
                    // keep the text around, we're at the end
                }
            }
        } 
    }
    
</script>
<iframe class="nodisplay" bind:this={iframe}></iframe>

<style>
    iframe {
        height: 90vh;
        width: 90vw;
    }
    iframe.nodisplay {
        display: none;
    }
</style>