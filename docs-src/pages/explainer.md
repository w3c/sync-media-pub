---
title: SyncMediaLite explainer
---
## History: EPUB and DAISY

The use case of reading with narration and synchronized highlight has long been a part of electronic publishing, and is already supported by existing standards ([DAISY](https://daisy.org/activities/standards/daisy/), [EPUB Media Overlays](https://www.w3.org/publishing/epub32/epub-mediaoverlays.html)). Under the hood, these standards use [SMIL](https://www.w3.org/TR/SMIL3/) to synchronize an audio file with an [HTML](https://html.spec.whatwg.org/multipage/) file, by pairing timestamps with phrase IDs.

## Issues 

* SMIL is seen as complicated and outdated.

Its roots are from the web's early days, before HTML supported native audio and video; and the full SMIL language is indeed quite complex. However, the usage of SMIL in EPUB Media Overlays is minimal and, with a few more restrictions, could be translated into a more modern format and be more easily implemented.

* Synchronized text and audio is expensive to produce.

Production of audio narrated text is a lot of work and hence not as common as standalone text or audio books. Now with more powerful speech and language processing tools, automated synchronization is becoming feasible. However, it's not fast enough to do on the client side (yet), so book producers are still going to have to create pre-synchronized contents. But advances in their own tools are going to make it easier for them to do this.

## Synchronization on the modern web

The same user experience is achieved with a more modern approach that is easier to implement. This is what is described in [SyncMediaLite](sync-media-lite).

### Media playback

Today, the HTMLMediaElement has built-in cue synchronization. When loaded with a series of TextTrackCues, the MediaElement will automatically fire off cue events at the right times, so unlike SMIL, it does not require hand-coding a timing engine.

### Highlighting 

The CSS Highlight API makes it easy to register highlights, which are then available for styling as pseudo-elements. There is then no need to add and remove class attributes throughout the DOM.


### Referencing text

In EPUB Media Overlays, this is done with fragment identifiers. By expanding this to include the use of [selectors](https://www.w3.org/TR/selectors-states/#selectors), we have a more flexible way to reference text, without requiring IDs on all the text, and can even go to the character level. 


## An upgrade path

EPUB Media Overlays could be replaced with SyncMediaLite, with the following modifications:

* Restrict: there can be one audio file per HTML document. 
* Restrict: the audio file must play in the correct order by default. 
* Expand: allow additional selectors, not just fragment IDs.

See [caveats](caveats) related to going from EPUB Media Overlays to SyncMediaLite.
