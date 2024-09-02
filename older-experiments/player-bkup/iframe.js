import * as Events from './events.js';

async function openUrl(url, parentSelector) {
    return new Promise((resolve, reject) => {
        let content = document.querySelector(parentSelector);
        content.innerHTML = '';
        // disable the iframe parent element while we change the content and apply a stylesheet
        // but if it's already disabled, don't re-enable it at the end of this function 
        // because it means we're in captions mode and we want it to stay disabled
        let wasAlreadyDisabled = content.classList.contains('disabled') && 
            !document.querySelector("#player-captions").classList.contains('disabled');
        if (!wasAlreadyDisabled) {
            content.classList.add('disabled');
        }
        let iframe = document.createElement('iframe');
        iframe.onload = () => {
            log.debug(`iframe loaded ${url}`);
            if (iframe.contentDocument) {  
                if (localStorage.getItem("fontsize")) {
                    iframe.contentDocument.querySelector("body").style.fontSize = localStorage.getItem("fontsize");
                }

                // a bit hacky but ensures we are only listening for clicks in the main text area
                // and not the TOC
                if (parentSelector.indexOf("player-page") != -1) {
                    let allSyncedElms = Array.from(iframe.contentDocument.querySelectorAll("*[id]"));
                    allSyncedElms.map(elm => {
                        elm.addEventListener("click", e => {
                            Events.trigger("Document.Click", e.target.getAttribute("id"));
                        });
                    });
                }
                
                resolve(iframe.contentDocument);
            }
            else {
                log.warn("Can't access iframe content doc");
                resolve(null);
            }
            // a short delay prevents the screen from flashing as it becomes un-disabled
            setTimeout(() => {
                if (!wasAlreadyDisabled) {
                    content.classList.remove('disabled')
                }
            }, 300);
        };
        iframe.setAttribute('src', url);
        content.appendChild(iframe);
    });
}

export { openUrl };