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

## References

### Skippability

DPUB a11y:  
https://www.w3.org/TR/dpub-accessibility/#skippability

EPUB 3 Media Overlays:  
http://www.idpf.org/epub/31/spec/epub-mediaoverlays.html#sec-skippability

### Escapability

DPUB a11y:  
https://www.w3.org/TR/dpub-accessibility/#escapability

EPUB 3 Media Overlays:  
http://www.idpf.org/epub/31/spec/epub-mediaoverlays.html#sec-escabaility

### Time / clock values

EPUB 3 Media Overlays:  
http://www.idpf.org/epub/31/spec/epub-mediaoverlays.html#app-clock-examples

SMIL 3:  
https://www.w3.org/TR/SMIL3/smil-timing.html#q22

TT:  
https://www.w3.org/AudioVideo/TT/  

TTML 2:  
https://www.w3.org/TR/ttml2/#timing-value-time-expression

VTT 1:  
https://www.w3.org/TR/webvtt1/#collect-a-webvtt-timestamp

### Other relevant work:

SMIL Animation:  
https://www.w3.org/TR/smil-animation/

Web Animations:  
https://w3c.github.io/web-animations/

SMIL Timesheets:  
https://www.w3.org/TR/timesheets/

Media Fragments URI:  
https://www.w3.org/TR/media-frags/#naming-time  

Web Media API (CG):  
https://www.w3.org/community/webmediaapi/  

Cloud Browser arch (note):  
https://w3c.github.io/Web-and-TV-IG/cloud-browser-tf/  

Multi Device Timing:  
http://webtiming.github.io  

Also see: https://github.com/w3c/publ-a11y/wiki/Publishing-issues-for-Silver#7-media-overlays

### Readium2 experimentations

#### Why not just continue to use SMIL?

1) XML: implementation experience of (EPUB) reading systems tells us that XML parsing in modern and older web browsers is doable, but that there are many quirks (e.g. namespace handling) and processing overhead which may be avoided by using a format like JSON.
2) Complexity: both EPUB3 Media Overlays and DAISY Talking Books (the historical format that preceded EPUB MO) use only a small subset of the SMIL standard, but the cognitive overhead (e.g. time / clock syntax) and lack of adoption in the Open Web Platform indicate that other solutions should be considered, particularly as there is now a broader choice of technologies for handling media / timing in web browsers (which wasn't the case at the time SMIL was chosen to fulfil the timing and synchronization requirements of audio / talking books).
3) Architecture: The convergence of publishing standards with the broader, distributed Open Web Platform offers an opportunity to define a system better suited for the HTTP client-server request-response design model, and the notion of URL service endpoint.

#### System overview

In Readium2, EPUB3 publications are ingested and translated to an internal JSON format (structurally and semantically defined using JSON-LD) which carries information about the publication (i.e. metadata, collection of documents, resources, etc.).

In addition to exposing links to static publication assets such as images, stylesheets, etc., this central publication "manifest" also advertises URLs via which additional services can be accessed (e.g. search, indexing, pagination, etc.). These would typically be HTTP links, decorated with well-defined metadata in order to enable discovery (`rel` and `type` properties).

The Media Overlay data for the publication as a whole, or for specific documents within the publication, can be resolved using such links. The mechanism of URI Template is used to pass parameters such as the canonical path of a publication document, so that only the Media Overlay for that particular document is returned.

In other words, a client that consumes a publication for processing or rendering purposes, can issue a series of (HTTP) requests in order to incrementally access the desired data. Obviously, behind the scenes the content server may also implement "lazy loading" strategies to avoid unnecessary overheads.

Standard HTTP caching methods can be used to optimise performance, and Readium2 server implementations (aka "streamers") generate ETag headers. Side node: prefetch headers are emitted in HTTP responses so that web browsers can eagerly load commonly-used resources such as stylesheets and font faces.

#### Timing and synchronisation

In Readium2, the Media Overlays format is JSON-based, just like the central "webpub manifest" (as it's internally called). A simplification from SMIL is the use of a "clock" syntax based on a decimal number  representing seconds (and fractions of a second). This time syntax is used in metadata (`duration` fields) and in URL Media Fragments (i.e. `audio.mp3#t=1.3,2.456` instead of the `clipbegin` and `clipEnd` XML attributes in SMIL files). The net benefit is that modern web browsers natively support audio and video playback using this syntax.

As in SMIL, locations within HTML documents are referenced using fragments identifiers. No change here. In fact, the very notion of "hash" (URL `#` segment) is extensible, and future revisions could add support for other audio/video/text referencing mechanisms (for example, character-level text ranges).

#### Example

(truncated, for brevity)

```
{
    @context: "http://readium.org/webpub/default.jsonld",
    metadata: {
        @type: "http://schema.org/Book",
        title: "Moby-Dick",
        ...
        narrator: {
            name: "Stuart Wills"
        },
        duration: 860.5,
        media-overlay: {
            active-class: "-epub-media-overlay-active"
        }
    },
    links: [
        ...
        {
            href: "media-overlay.json?resource={path}",
            type: "application/vnd.readium.mo+json",
            templated: true,
            rel: "media-overlay"
        }
    ],
    spine: [
        ...
        {
            href: "OPS/chapter_001.xhtml",
            type: "application/xhtml+xml",
            properties: {
                media-overlay: "media-overlay.json?resource=OPS%2Fchapter_001.xhtml"
            },
            duration: 860.5
        },
        {
            href: "OPS/chapter_002.xhtml",
            type: "application/xhtml+xml",
            properties: {
                media-overlay: "media-overlay.json?resource=OPS%2Fchapter_002.xhtml"
            },
            duration: 543
        },
        ...
    ]
}
```

```
{
    media-overlay: [
        {
            role: [
                "section"
            ],
            children: [
                {
                    text: "OPS/chapter_001.xhtml",
                    role: [
                        "section",
                        "bodymatter",
                        "chapter"
                    ],
                    children: [
                        {
                            text: "OPS/chapter_001.xhtml#c01h01",
                            audio: "OPS/audio/mobydick_001_002_melville.mp4#t=24.5,29.268"
                        },
                        {
                            text: "OPS/chapter_001.xhtml#c01w00001",
                            audio: "OPS/audio/mobydick_001_002_melville.mp4#t=29.268,29.441"
                        },
                        ...
                    ]
                }
            ]
        }
    ]
}
```

#### Additional information

https://github.com/readium/readium-2/tree/master/media-overlay  

https://github.com/readium/readium-2/blob/master/media-overlay/syntax.md  