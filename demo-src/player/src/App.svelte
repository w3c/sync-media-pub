<script>
	import {SyncMedia} from './synclib.js';
	import {syncMedia, currentTimegraphEntry, playState} from './store.js';
	import AudioAsset from './AudioAsset.svelte';
	import TextAsset from './TextAsset.svelte';
	import ImageAsset from './ImageAsset.svelte';
	import VideoAsset from './VideoAsset.svelte';

	let mediaWait = 0;
	let mediaDoneCount = 0;

	currentTimegraphEntry.subscribe(() => {
		if ($currentTimegraphEntry && $currentTimegraphEntry.events) {
			let playingEvents = $currentTimegraphEntry.events.filter(event => 
				(event.node.type == "audio" || event.node.type == "video") && event.last);
			mediaWait = playingEvents.length; 
			console.log(`waiting for ${mediaWait} nodes to finish`);
			playingEvents.map(e => console.log("... ", e.node.src.href));
		}
	});
	function mediaDone(event) {
		console.log("Media done", event.detail.event.node.src);
		if (event.detail.event.last) {
			mediaDoneCount++;
		}
		if (mediaDoneCount >= mediaWait) {
			mediaDoneCount = 0;
			if ($syncMedia.canGotoNext()) {
				console.log("proceeding");
				syncMedia.next();
			}
			else {
				console.log("DOC DONE");
			}	
		}
		// else still waiting for more media to finish before proceeding along timegraph
	};
	function pause() {
		console.log("click pause");
		playState.set("STOPPED");
	}
	function resume() {
		console.log("click play");
		playState.set("PLAYING");
	}

	async function loadSyncMedia() {
		let file = '/fairytale/THE-MASTER-CAT;-OR,-PUSS-IN-BOOTS.xml';
		let url = new URL(file, document.baseURI);
		let parsedSyncMedia = new SyncMedia();
		await parsedSyncMedia.loadUrl(url);
		syncMedia.set(parsedSyncMedia);
		return syncMedia;
	}

	let promise = loadSyncMedia();

</script>


{#await promise }

<p>Loading...</p>

{:then}
<!-- for every asset, create a renderer that will respond to updates to data in the store -->
{#each $syncMedia.assets.filter(a => a.type == "audio") as asset}
<AudioAsset {asset} on:done={mediaDone}/>
{/each}

<div class="texts">
	{#each $syncMedia.assets.filter(a => a.type == "text") as asset}
	<TextAsset {asset}/>
	{/each}
</div>

<div class="images">
	{#each $syncMedia.assets.filter(a => a.type == "image") as asset}
	<ImageAsset {asset}/>
	{/each}
</div>

<div class="videos">
	{#each $syncMedia.assets.filter(a => a.type == "video") as asset}
	<VideoAsset {asset}/>
	{/each}
</div>

<button on:click={syncMedia.previousPlayable} disabled='{!$syncMedia.canGotoPreviousPlayable()}'>Previous</button>
<button on:click={syncMedia.nextPlayable} disabled='{!$syncMedia.canGotoNextPlayable()}'>Next</button>
<button on:click={pause}>Pause</button>
<button on:click={resume}>Play</button>

{/await}

<style>
	button {
		display: inline;
		margin-right: 2rem;
	}
	div.texts {
		display: flex;
	}
</style>