# Use cases

## Media

* Synchronize audio segments with HTML elements
* Apply style to HTML element in sync point
* Background music
* Include secondary audio, e.g. sound effects, in a sync point
* Delay start of timed media render by an offset
* Apply style to more than one HTML element at once (e.g. nested highlights)
* Support Audio-only presentations, where structural semantics are applied to audio segments, even if there is no corresponding text document
* EPUB
  * Synchronize an audio book with an EPUB text equivalent
* SVG
  * Synchronize audio with SVG
  * Zoom into part of an SVG when rendering a sync point
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

* 
* [National Geographic Archives](https://archive.org/details/nationalgeograph21890nati/page/108/mode/2up)
    * TTS
    * image of a page with a moving highlight
    * speed up/slow down audio
    * change page and move thru presentation via slider control
