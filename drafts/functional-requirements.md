# Requirements and design options for synchronized multimedia

## Requirements

The requirements here outline what is necessary to provide a comprehensive reading experience for users who interact with content in a non-visual way. We must look further than a simple audio stream version of a book to meet these needs, especially regarding navigation. And, while TTS has many advantages, there are some use cases which require pre-recorded audio. E.g.

* Users with cognitive disabilities who may not process TTS as well
* Not all languages have a corresponding TTS engine
* Pre-recorded audio meets professional production standards (voice actors)


### Essential Requirements

Organized by content type

#### Text supplemented with pre-recorded audio narration
* Use an authored navigation interface (e.g. TOC) to reach a point in a content document, and start audio playback from there
* Move around the text content and have the audio playback keep up. E.g. 
  * Previous/next paragraph
  * Previous/next page
* Start playback by clicking a point mid-page
* Speed up/slow down the audio while not affecting the pitch (timescale modification)
* Navigate by time chunk (e.g. skip forward/back 10s)
* Text chunks are highlighted in sync with the audio playback, at the authored granularity
* Text display keeps up with audio. E.g. start audio playback and have the pages turn automatically.
* Selectively filter out content based on semantics ("skippability" in the DAISY world). Note: might there be overlap here with WP personalization?
* Jump out of complex structures and back into the reading flow ("escapability" in the DAISY world)

#### Pre-recorded audio narration only (no text document)

In addition to the above applicable requirements,

* Use an authored navigation interface (e.g. TOC) to reach points in the audio stream and start playback 
* Navigate at the authored granularity, such as paragraph
* Reading system functions such as bookmarking and annotation should continue to function

#### Video supplemented with text transcript, standalone screenplay
* Select a point in a text transcript to jump to that part of the video
* Search the text of the transcript
* Highlight text in transcript as video plays

### Advanced Requirements

Organized by content type

#### Any type of content
* Support multiple granularities of navigation, switchable on the fly by the user. E.g. 
  * Previous/next paragraph
  * Previous/next sentence
  * Previous/next word or phrase

#### Text supplemented with sign-language video

* Synchronize the video to the text in a way that permits user navigation (as above for audio)
* Make the video full screen and overlay the text as a caption
* Make the text the primary visual item and the video is reduced in size but maintains a constant position even as user scrolls/navigates
* Highlight the text in sync with the video playback
* Play/pause the video

#### Video supplemented with descriptive audio

* Users may navigate the content via an authored navigation interface (e.g. TOC)
* Author may choose to have audio description and video played simultaneously for some parts, and for other parts, instruct the reading system to automatically pause the video and play audio description, and then resume the video playback
* User should be able to independently control volume and speed of both the video and audio description 

## Design

### Requirements

The solution must

* be able to be validated
* integrate as seamlessly as possible into a WP/PWP
* use existing web technologies as much as possible
* facilitate fast lookups by reading systems whenever possible. E.g. 
  * Given a content document, find its corresponding audio quickly.
  * Make reading options (e.g. don't read page numbers) easy to implement in audio playback

### Ideas

* Structured sync points
  * Supplemental media 'overlay' has granularity and structure
  * What we already do in EPUB3 with SMIL
* Flat list of sync points
  * Use the text content to inform reading system about granularity and structure
  * May not be the best for audio-only
* Referring to clips in timed media
  * Start/end points (like in SMIL)
  * Just list the start points
  * One-liner reference with url + clip times all in one string
* Referring to text
  * Url + ID
  * XPath
  * How could we reference content at the character level to support fine granularity

## Metadata

In both the "audio only" (i.e. structured "talking book" without text transcript) and "full-text full-audio" synchronisation use cases, content creators / publishers must be able to specify additional metadata for the publication as a whole, as well as for individual resources located within the publication. For instance, such metadata may provide "duration" information about the audio stream corresponding to the entire default / linear reading order, as well as for individual logical content fragments such as "book chapters" (which may or may not be tied to physical artefacts like HTML files). Other examples of metadata include narrator names, synthetic speech voices, (re)distribution rights, etc.

The ability to specify metadata for a publication whole or parts is not specific to the "synchronised multimedia" case. There should therefore not be any specific requirements defined here. It may however be necessary to define additional metadata vocabulary / naming schemes in order to support multimedia-related information (to be determined).
