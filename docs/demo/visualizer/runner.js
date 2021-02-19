var processor;
var exampleFile;
var libversion;
var onClearAllFn;
var onDisplayResultsFn;

// call when page is loaded
async function init(fileProcessor, exampleInput, version, onClearAll=null, onDisplayResults=null) {
    processor = fileProcessor;
    exampleFile = new URL(exampleInput, document.location.href).href;
    onClearAllFn = onClearAll;
    onDisplayResultsFn = onDisplayResults;

    libversion = version;
    
    createInputOutputElements();
    document.querySelector("#input").setAttribute("open", "open");
    document.querySelector("#inputFile").setAttribute('value', exampleFile);
    
    document.querySelector("#version").textContent = libversion;

    let urlSearchParams = new URLSearchParams(document.location.search);
    if (urlSearchParams.has("q") && urlSearchParams.get("q") != '') {
        document.querySelector("#inputFile").setAttribute("value", urlSearchParams.get("q"));
        await loadByUrl(urlSearchParams.get("q"));
    }

    document.querySelector("#loadFile").addEventListener('click', async e => {
        if (document.querySelector("#inputFile").value == '') {
            alert("Please enter a URL");
            return;
        }
        await loadByUrl(document.querySelector("#inputFile").value);
    });

    document.querySelector("#loadText").addEventListener('click', async e => {
        if (document.querySelector("#text").value == '') {
            alert("Please enter JSON data");
            return;
        }
        if (document.querySelector("#baseUrl").value == '') {
            alert("Please enter a base URL");
            return;
        }
        await loadJson(document.querySelector("#text").value, 
            document.querySelector("#baseUrl").value);
    });

    document.querySelector("#copyErrorsToClipboard").addEventListener('click', e => {
        navigator.clipboard.writeText(document.querySelector("#status").textContent);
    });

    document.querySelector("#copyDataToClipboard").addEventListener('click', e => {
        navigator.clipboard.writeText(document.querySelector("#data").textContent);
    });

}

async function loadByUrl(url) {
    clearAll();
    document.querySelector("#output h2 span").textContent = `for 
        ${new URL(url).pathname.split('/').reverse()[0]}`;
    await processor.loadUrl(url);
    displayResults();
}

async function loadJson(text, base) {
    clearAll();
    await processor.loadJson(JSON.parse(text), base);
    displayResults();
}

function displayResults() {
    document.querySelector("#input").removeAttribute("open");
    document.querySelector("#output").setAttribute("open", "open");
    let errorText = "No errors";
    if (processor.errors.length > 0) {
        errorText = JSON.stringify(processor.errors, null, 2);
        document.querySelector("#status").classList.add("errors");
    }
    else {
        document.querySelector("#status").classList.remove("errors");
    }
    
    document.querySelector("#status").innerHTML = errorText;
    document.querySelector("#data").innerHTML = JSON.stringify(processor.data, null, 2);
    
    document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightBlock(block);
    });

    if (onDisplayResultsFn) {
        onDisplayResultsFn();
    }
}
function clearAll() {
    document.querySelector("#output h2 span").textContent = '';
    document.querySelector("#status").innerHTML = '';
    document.querySelector("#data").innerHTML = '';

    if (onClearAllFn) {
        onClearAllFn();
    }
}

function createInputOutputElements() {
    document.querySelector("#io").innerHTML = `
    <details id="input">
        <summary><h2>Input</h2></summary>

        <div class="sidebyside">
            <div>
                <label for="inputFile">URL</label>
                <input id="inputFile" value="${exampleFile}"></input>
                <button id="loadFile">Load</button>
            </div>
                        
            <em class="big">OR</em>                     

            <div>
                <label for="baseUrl">Base URL</label>
                <input type="text" id="baseUrl" value="http://example.com"/>
                
                <label for="text">JSON</label>
                <textarea id="text" rows="30" cols="100" spellcheck="false"></textarea>
                <button id="loadText">Load</button>
            </div>
        </div>
    </details>
            
    <details id="output">
        <summary><h2>Output <span></span></h2></summary>
        <p><span>Errors:</span><button id="copyErrorsToClipboard">Copy</button></p>
        <pre><code id="status" class="json"></code></pre>
        <p><span>Data:</span><button id="copyDataToClipboard">Copy</button></p>
        <pre><code id="data" class="json"></code></pre> 
    </details>
    `;
}