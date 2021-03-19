---
title: Use cases
---

# Comicbooks with guided narration

There are hundreds of thousands of existing titles of comicbooks, graphic novels and other publications which storytelling techniques rely heavily on more or less complex page layout. Deconstructing such page designs to fit on smaller screens or adding accessibility features for such publications is very hard, and many times not feasible as entire pages are often rendered as single bitmap images. 

SyncMedia lets an author describe a narrative journey through an existing publication using standard fragment selectors such as Media Fragments, PDF selectors and EPUB CFIs. Each step in the SyncMedia timeline directs the SyncMedia Player to a specific area on the page using X and Y coordinates as well as a prefered zoom level. A clip mask can also be applied after the translation has been completed in order to isolate the page content for clarity.

SyncMedia further allows the author to add spoken narration to each step and by doing so add accessibility features such as adding alternate descriptions of the overall context, as specific dialog present in speech bubbles etc.  

# Combined EPUB and Audiobooks

A very common use case for synchronization of different types of media is in book subscription services. Users of these services often expect a "seamless" transition between the text rendition and audio renditions of the same book. This is a feature that is hard to develop and maintain since there are no standardized ways to express these synchronization points.

SyncMedia offers a standardized way to add granular to relationships between equivalent content in different renditions of the same title. It uses existing selector formats such as EPUB CFIs and Media Fragments to link to resources and positions within the various formats. 

In addition to acting as a mapping between media formats its explicit linking between locations within the different formats also allow for parallell playback, analogous to the way that EPUB Media Overlays work.

# Sentence-level navigation in Audiobooks

Junko, an audiobook reader, wants to navigate a W3C Audiobook not only via chapter but also by sentence. In this example, the audiobook does not have any associated HTML text. But even when there is no text equivalent, SyncMedia has the ability to arrange audio segments in a timeline and a SyncMedia-aware player will allow moving through this timeline via segment. This book was produced so that these segments represent sentences, and so Junko can navigate the publication at the sentence level. 

# Add background music

Olga, a content creator, wants to include background music in her narrated publication. She chooses SyncMedia because it allows her to isolate the background music on its own `sync:track` and also allows her to use different music for different chapters.

# User control over background music

Sanjay starts reading a SyncMedia-enhanced publication that contains background music. He wants to mute the background music because he has an [Auditory Processing Disorder](https://www.inpp.org.uk/intervention-adults-children/help-by-diagnosis/auditory-processing-disorder/) that makes the background music very distracting. His SyncMedia-aware player gives him independent control over each `sync:track` and allows him to mute the background music track but leave the narration track unaffected.

# User control over sound effects

Casey starts reading a SyncMedia-enhanced comic book that includes sound effects in parallel with the narration. They would prefer to hear less of the sound effects and more of the narration. By using a SyncMedia-aware player, they are able to independently adjust the volume levels of the different types of audio, because the author of the comic book has used the `sync:track` feature of SyncMedia to place the sound effects audio on a different track than the narration audio.

# Narrated text book

Francesca, who has low-vision, prefers to read with very large text and simultaneous audio narration. She purchases the SyncMedia-enhanced version of a book for these reasons. When she reads, they can enlarge the HTML-based text, which reflows naturally on whatever size of screen she's using; and with the addition of SyncMedia for narration, the book has audio segments associated with each sentence. Her SyncMedia-aware player not only gives her high-level navigation for moving between publication chapters, but also lets her move by sentence. The experience is seamless because the text and audio remain synchronized throughout. 

# Synchronized text highlighting

https://w3c.github.io/coga/content-usable/#objective-8-support-adaptation-and-personalization-0


# Resume mid-presentation 

Olivia has been enjoying a SyncMedia-enhanced publication but gets interrupted and has to stop reading. When she resumes later, her SyncMedia-aware player automatically picks up where she left off.

# Speed adjustments

Juan is listening to a narrated book while also reading the text on a screen. They read slowly and want to reduce the rate of the narration to match. Their SyncMedia-aware player lets them slow down the presentation to 50% and maintains the fidelity of the audio (e.g. pitch) as much as possible. The rate modification does not affect the synchronization aspect of the presentation: the text segments are still aligned with the audio segments, even at a different playback speed.


## TODO

* Apply style to HTML element in sync point
* Apply style to more than one HTML element at once (e.g. nested highlights)
* Enhancing supplemental Audiobook content
* Video
  * Synchronize a video with its transcript
  * Highlight text in transcript as video plays
  * Make the video full screen and overlay the text as a caption
  * Make the text the primary visual item and the video is reduced in size but maintains a constant position even as user scrolls/navigates
  * Highlight the text in sync with the video playback
  * Associate an audio description with a segment of video
  * Pause the video and play the audio description
* Enable jumping out of complex structures and back into the reading flow ("escapability", e.g. "stop playing this table and go back to the main content")
* Enable filtering based on semantics ("skippability", e.g. "don't announce page numbers")
* Switch between media based on user preference (see [issue 27](https://github.com/w3c/sync-media-pub/issues/27))
* Support multiple granularities of navigation, switchable on the fly by the user. E.g.
  * Previous/next paragraph
  * Previous/next sentence
  * Previous/next word or phrase
