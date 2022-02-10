---
title: SyncMedia Community Group Overview
---
This is an overview of work being done by the Synchronized Media for Publications Community Group.

* [Github repository](https://github.com/w3c/sync-media-pub)
* [Mailing list archives](https://lists.w3.org/Archives/Public/public-sync-media-pub/)

## Introduction

### History
The [Synchronized Media for Publications Community Group](https://www.w3.org/community/sync-media-pub/) was formed to recommend the best way to synchronize media with document formats being developed by the
[Publishing Working Group](https://www.w3.org/publishing/groups/publ-wg/), in order to make publications accessible to people with different types of reading requirements.

### Present
The [Publishing Working Group](https://www.w3.org/publishing/groups/publ-wg/) is now primarily focused on spec maintenance; however, the work here continues to be to explore and develop synchronization techniques compatible with publishing formats on the web, including [Audiobooks](https://www.w3.org/TR/audiobooks/), [EPUB](https://www.w3.org/publishing/groups/epub-wg/), and standalone [HTML](https://www.w3.org/html/).

## Documents

The following are the currently available documents created in this CG. They represent two different strategies to synchronize media: 1. [With WebVTT](#with-webvtt) and 2. [With SMIL](#with-smil). 

### With WebVTT

This experimental approach defines a usage of WebVTT to synchronize HTML elements with audio. This would be good for combining single straightforward media references, e.g. one audio file for one HTML document. This also is suited to a web browser environment, when combined with a small amount of Javascript. No specialized player is needed.

* [Overview](https://lists.w3.org/Archives/Public/public-sync-media-pub/2021Nov/0000.html)
* [Demos](https://daisy.github.io/accessible-books-in-browsers/#demos)
* [Sample file](https://github.com/daisy/accessible-books-in-browsers/blob/main/demos/moby-dick/vtt/chapter_001.vtt)
* [Notes on Incorporating with Audiobooks](https://lists.w3.org/Archives/Public/public-sync-media-pub/2021Nov/0003.html)


### With SMIL

This approach defines a usage of SMIL plus extensions. This would be good for combining multiple non-destructive media references, e.g. portions of many audio files for one HTML document. This is completely declarative with no associated scripting. This also is suited to a "player" type of environment, where a SyncMedia-aware user agent is rendering the content. Implementation is more involved than the example above with WebVTT.

* [SyncMedia 1.0](sync-media.html)
* [Explainer](explainer.html)
* Incorporating SyncMedia
    * [Incorporating into a Publication Manifest](incorporating-into-pubmanifest.html)
    * [Standalone packaging](standalone-packaging.html)
    * [Including in an HTML doc](including-in-html.html)
* [Use cases](use-cases.html)
* [Design principles](design-principles.html)
* [Examples](examples.html)    
  
## Archives

These documents were developed by this community group but are not considered current or necessarily complete.

* [Synchronized Narration](archived/synchronized-narration.html)
* [Incorporating Synchronized Narration into a Publication Manifest](archived/incorporating-synchronized-narration.html)
