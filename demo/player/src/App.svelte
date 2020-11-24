<script>
	import {SyncMedia} from './synclib/index.js';
	import {syncMedia, canGotoNext, canGotoPrevious, currentTimegraphEntry} from './store.js';
	import AudioAsset from './AudioAsset.svelte';
	import TextAsset from './TextAsset.svelte';

	let userOk = false;
	let giveOk = () => userOk = true;

	function mediaDone(event) {
		syncMedia.next();
	};

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

{#if !userOk}
<!-- browsers won't start media playback without the user "interacting" with the page, 
	so this is a cheap way to accommodate that -->
<button on:click={giveOk}>Start!</button>
{:else}
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

<button on:click={syncMedia.previous} disabled='{!$canGotoPrevious}'>Previous</button>
<button on:click={syncMedia.next} disabled='{!$canGotoNext}'>Next</button>

{/await}
{/if}
<style>
	button {
		display: inline;
		margin-right: 2rem;
	}
	div.texts {
		display: flex;
	}
</style>