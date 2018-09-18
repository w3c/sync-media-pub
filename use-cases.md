# In-scope use cases

## Text supplemented with pre-recorded audio narration
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
* Support multiple granularities of navigation, switchable on the fly by the user. E.g.
  * Previous/next paragraph
  * Previous/next sentence
  * Previous/next word or phrase

## Pre-recorded audio narration with ToC but no other text contents

* Most points from above apply here
* Opportunity to collaborate with the (Audio TF)[https://www.w3.org/TR/wpub/#audiobook]

# Out of scope use cases

## Video supplemented with text transcript, standalone screenplay
* Select a point in a text transcript to jump to that part of the video
* Search the text of the transcript
* Highlight text in transcript as video plays


## Text supplemented with sign-language video

* Synchronize the video to the text in a way that permits user navigation (as above for audio)
* Make the video full screen and overlay the text as a caption
* Make the text the primary visual item and the video is reduced in size but maintains a constant position even as user scrolls/navigates
* Highlight the text in sync with the video playback
* Play/pause the video

## Video supplemented with descriptive audio

* Users may navigate the content via an authored navigation interface (e.g. TOC)
* Author may choose to have audio description and video played simultaneously for some parts, and for other parts, instruct the reading system to automatically pause the video and play audio description, and then resume the video playback
* User should be able to independently control volume and speed of both the video and audio description
