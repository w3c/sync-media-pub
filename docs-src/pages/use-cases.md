---
title: Use cases
---

This is a loosely sorted list of brief use case descriptions.

## Media

* Synchronize audio segments with HTML elements
* Apply style to HTML element in sync point
* Background music
* Include secondary audio, e.g. sound effects
* Delay start of timed media render by an offset
* Apply style to more than one HTML element at once (e.g. nested highlights)
* Support Audio-only presentations, where structural semantics are applied to audio segments, even if there is no corresponding text document
* Turn down the sound effects
* EPUB
  * Synchronize an audio book with an EPUB text equivalent
* SVG
  * Synchronize audio with an SVG comic
  * Zoom into a comic panel when rendering a sync point
  * Order of rendering media could matter
    * First, zoom into a panel and then highlight text while maintaining zoom
* Video
  * Synchronize a video with its transcript
  * Highlight text in transcript as video plays
  * Make the video full screen and overlay the text as a caption
  * Make the text the primary visual item and the video is reduced in size but maintains a constant position even as user scrolls/navigates
  * Highlight the text in sync with the video playback
  * Associate an audio description with a segment of video
  * Pause the video and play the audio description

## User interaction 

* Playback of synchronization points in a continuous sequence
* Start playback of synchronization points from any position in the sync document
* Pause playback at any point
* Adjust media speed and maintain sync relationships
* Advance or rewind playback by duration (e.g. 10s forward)
* Enable jumping out of complex structures and back into the reading flow ("escapability", e.g. "stop playing this table and go back to the main content")
* Enable filtering based on semantics ("skippability", e.g. "don't announce page numbers")
* Switch between media based on user preference (see [issue 27](https://github.com/w3c/sync-media-pub/issues/27))
* Support multiple granularities of navigation, switchable on the fly by the user. E.g.
  * Previous/next paragraph
  * Previous/next sentence
  * Previous/next word or phrase

## Examples of similar technologies

* [National Geographic Archives](https://archive.org/details/nationalgeograph21890nati/page/108/mode/2up)
    * TTS
    * image of a page with a moving highlight
    * speed up/slow down audio
    * change page and move thru presentation via slider control

# Comicbooks with guided narration

There are hundreds of thousands of existing titles of comicbooks, graphic novels and other publications which storytelling techniques rely heavily on more or less complex page layout. Deconstructing such page designs to fit on smaller screens or adding accessibility features for such publications is very hard, and many times not feasible as entire pages are often rendered as single bitmap images. 

SyncMedia lets an author describe a narrative journey through an existing publication using standard fragment selectors such as Media Fragments, PDF selectors and EPUB CFIs. Each step in the SyncMedia timeline directs the SyncMedia Player to a specific area on the page using X and Y coordinates as well as a prefered zoom level. A clip mask can also be applied after the translation has been completed in order to isolate the page content for clarity.

SyncMedia further allows the author to add spoken narration to each step and by doing so add accessibility features such as adding alternate descriptions of the overall context, as specific dialog present in speech bubbles etc.  

# Combined EPUB and Audiobooks

A very common use case for synchronization of different types of media is in book subscription services. Users of these services often expect a "seamless" transition between the text rendition and audio renditions of the same book. This is a feature that is hard to develop and maintain since there are no standardized ways to express these synchronization points.

SyncMedia offers a standardized way to add granular to relationships between equivalent content in different renditions of the same title. It uses existing selector formats such as EPUB CFIs and Media Fragments to link to resources and positions within the various formats. 

In addition to acting as a mapping between media formats its explicit linking between locations within the different formats also allow for parallell playback, analogous to the way that EPUB Media Overlays work.
