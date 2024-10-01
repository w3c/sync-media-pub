---
title: SyncMedia Community Group Overview
---
This is an overview of work being done by the [Synchronized Media for Publications Community Group](#about-this-group). 

* [Github repository](https://github.com/w3c/sync-media-pub)
* [Mailing list archives](https://lists.w3.org/Archives/Public/public-sync-media-pub/)


## Latest work: SyncMediaLite

* Uses the browser's inbuilt cue synchronization capabilities via WebVTT
* Easy to implement a synchronized text highlight
* Works well for common use cases of audio narrated HTML documents

### Documents

* [Explainer](explainer)
* [Use cases](use-cases)
* [Draft spec](sync-media-lite)
* Demos:
  * [Accessible Books in Browsers](https://daisy.github.io/accessible-books-in-browsers/): 
  _Self-playing text and audio books. The books here are converted automatically from DAISY 2.02/EPUB into multi-chapter sets of HTML files with built-in playback for SyncMediaLite_
  * [The Raven](demos/raven/index.html)
  _Poem with multi-level highlighting. This is a single-page document with built-in playback for SyncMediaLite and advanced highlighting features_
  * [Using TextTrackCues to play EPUB Media Overlays](https://github.com/marisademeglio/mo-player)
  _Using the same techniques as SyncMediaLite playback, this Media Overlays `.smil` file can be played_
  <!-- * [The World's Best Audiobook](https://github.com/marisademeglio/worlds-best-audiobook/tree/webvtt-experiment)
  _Enhanced W3C Audiobooks demo. This is more of a traditional "player" where the book documents are loaded into an `iframe`. The books are W3C Audiobooks with SyncMediaLite incorporated._
  -->

See [other work](https://github.com/w3c/sync-media-pub/tree/main/other-work) for more ideas this group has had over the years, including experiments with SMIL, and a syntactically-light JSON format. 

## About this group

### History
The [Synchronized Media for Publications Community Group](https://www.w3.org/community/sync-media-pub/) was formed to recommend the best way to synchronize media with document formats being developed by the
[Publishing Working Group](https://www.w3.org/publishing/groups/publ-wg/), in order to make publications accessible to people with different types of reading requirements.

### Present
The [Publishing Working Group](https://www.w3.org/publishing/groups/publ-wg/) is now primarily focused on spec maintenance; however, the work here continues to be to explore and develop synchronization techniques compatible with publishing formats on the web, including [Audiobooks](https://www.w3.org/TR/audiobooks/), [EPUB](https://www.w3.org/publishing/groups/epub-wg/), and standalone [HTML](https://www.w3.org/html/).

  

