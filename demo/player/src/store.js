import { writable, derived } from 'svelte/store';

function createSyncMedia() {
	const {subscribe, set, update} = writable(null);
	return {
		set,
		subscribe,
		next: () => {
			return update(sm => {
				sm.gotoNext();
				return sm;
			});
		},
		previous: () => {
			return update(sm => {
				sm.gotoPrevious();
				return sm;
			});
		}
	}
}
const syncMedia = createSyncMedia();

const currentTimegraphEntry = derived(syncMedia, $syncMedia => $syncMedia ? $syncMedia.getCurrent() : null);
const nextTimegraphEntry = derived(syncMedia, $syncMedia => $syncMedia ? $syncMedia.peekNext() : null);
const canGotoNext = derived(syncMedia, $syncMedia => $syncMedia ? $syncMedia.canGotoNext() : false);
const canGotoPrevious = derived(syncMedia, $syncMedia => $syncMedia ? $syncMedia.canGotoPrevious() : false);
const assets = writable({});
const assetsReady = writable(false);
export {syncMedia, currentTimegraphEntry, nextTimegraphEntry, canGotoNext, canGotoPrevious, assets, assetsReady };
