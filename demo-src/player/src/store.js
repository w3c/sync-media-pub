import { writable, derived } from 'svelte/store';

function createSyncMedia() {
	const {subscribe, set, update} = writable(null);
	return {
		set,
		subscribe,
		next: () => {
			return update(sm => {
				if (sm.canGotoNext()) {
					sm.gotoNext();
				}
				return sm;
			});
		},
		previous: () => {
			return update(sm => {
				if (sm.canGotoPrevious()) {
					sm.gotoPrevious();
				}
				return sm;
			});
		},
		nextPlayable: () => {
			return update(sm => {
				if (sm.canGotoNextPlayable()) {
					sm.gotoNextPlayable();
					// console.log("Next playable", sm.index);
				}
				return sm;
			});
		},
		previousPlayable: () => {
			return update(sm => {
				if (sm.canGotoPreviousPlayable()) {
					sm.gotoPreviousPlayable();
					// console.log("Previous playable", sm.index);
				}
				return sm;
			});
		}
	}
}
const syncMedia = createSyncMedia();

const currentTimegraphEntry = derived(syncMedia, $syncMedia => $syncMedia ? $syncMedia.getCurrent() : null);
const assets = writable({});
const playState = writable("NULL");
export {
	syncMedia, 
	currentTimegraphEntry, 
	assets,
	playState
};
