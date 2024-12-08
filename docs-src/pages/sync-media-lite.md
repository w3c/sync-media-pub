---json
{
    "title": "SyncMediaLite",
    "layout": "spec.njk",
    "editors": [
        {
            "name": "Marisa DeMeglio",
            "company": "DAISY Consortium",
            "companyURL": "https://www.daisy.org",
            "w3cid": 35713
        }
    ]
}
---
<section id="abstract">
    <p>This document shows how to use <a href="https://www.w3.org/TR/webvtt1/">WebVTT</a>, along with HTML, CSS, and Javascript for synchronizing text highlights with timed media playback, consumable directly in a web browser.</p>    
</section>

<section id="sotd">
</section>

<section id="conformance">
</section>

## Relationship to Other Specifications

### WebVTT

The synchronization data is in a WebVTT file; specifically, a [file using metadata content](https://www.w3.org/TR/webvtt1/#file-using-metadata-content).

### HTML

The text to be synchronized with timed media playback is in an [HTML](https://html.spec.whatwg.org/multipage/) document, consumed in a web browser. 

### Timed media

This document does not specify which format(s) of timed media are allowed. The media must be able to be rendered via an [HTMLMediaElement](https://html.spec.whatwg.org/multipage/media.html#htmlmediaelement).

### CSS

The highlight style is specified via the [`::highlight` pseudo-element](https://www.w3.org/TR/css-pseudo-4/#highlight-pseudo-element).

### Javascript

A small amount of Javascript is used to pair [TextTrackCue](https://html.spec.whatwg.org/multipage/media.html#texttrackcue) events with [Custom Highlights](https://www.w3.org/TR/css-highlight-api-1/).

### Selectors and states

Identify text to be highlighted with [a selector](https://www.w3.org/TR/selectors-states/#selectors).

## File Details

### The WebVTT file

The synchronization data must follow WebVTT's [file structure](https://www.w3.org/TR/webvtt1/#file-structure), which consists of a series of cues, following the `WEBVTT` declaration at the top.  

Each cue has an optional identifier (a number, in the example) and contains [timing information](https://www.w3.org/TR/webvtt1/#webvtt-cue-timings) for the media segment. It also includes a JSON-formatted custom cue payload with these properties:


| Name | Required | Type | Description |
| -----|----------|------|-------------|
| `selector`{#selector} | Required | [Selector](https://www.w3.org/TR/selectors-states/#selectors) | Selects the text in the document that corresponds with this cue. |

{% example "A WebVTT file" %}
WEBVTT

1
00:00:00.000 --> 00:00:03.187
{"selector":{"type":"FragmentSelector","value":"sentence1"}}

2
00:00:03.187 --> 00:00:07.184
{"selector":{"type":"FragmentSelector","value":"sentence2"}}

3
00:00:07.184 --> 00:00:10.945
{"selector":{"type":"FragmentSelector","value":"sentence3"}}

{% endexample %}

Because of how WebVTT files are parsed, it is important to not have a blank line anywhere in the cue payload.  
["Note that you cannot provide blank lines inside a metadata block, because the blank line signifies the end of the WebVTT cue,"](https://www.w3.org/TR/webvtt1/#introduction-metadata).

:::{.note}
This example uses `FragmentSelector`s, which link to element `id`s, but the [selector](#selector) property allows other selectors too. Other examples in this document use `CssSelector`s and `TextRangeSelector`s. See [Word-level selectors](#word-level-selectors) for notes on referencing sub-element ranges.
:::

{% example "The corresponding HTML markup" %}
<span id="sentence1">"Lorem ipsum!" she yelled.</span> 
<span id="sentence2">"Dolor sit amet," her friend replied, laughing.</span>
<span id="sentence3">She shook her head, "Qui sit voluptate."</span>
{% endexample %}


### Associating the WebVTT file with the HTMLMediaElement

The synchronization data of WebVTT is associated with an [HTMLMediaElement](https://html.spec.whatwg.org/multipage/media.html#media-elements) by being referenced as a metadata track on that media object.

{% example "Audio element with metadata track"%}
<audio controls autoplay src="chapter.mp3">
 <track default src="highlight.vtt" kind="metadata" id="highlights">
</audio>
{% endexample %}

:::{.note}
The entire audio file can be used, or a portion of it can be used via [media fragments](https://www.w3.org/TR/media-frags/#media-fragment-clients). 
:::


### Styling the highlight

Style the highlight in CSS using the [`::highlight` pseudo-element](https://www.w3.org/TR/css-pseudo-4/#highlight-styling):

{% example "CSS for the highlight" %}
::highlight {
    background-color: yellow;
}
{% endexample %}

[Text highlights](#text-highlights) shows how to make the cue into a [CSS Highlight](https://www.w3.org/TR/css-highlight-api-1/) and therefore available to style in this way.

::: {.note}
There are limitations when styling highlight pseudo-elements. Refer to [Styling Highlights](https://www.w3.org/TR/css-pseudo-4/#highlight-styling).
:::


## Processing

This section covers how to link media playback with text highlighting, using browser APIs.

### Cue events

As the HTMLMediaElement plays, associated TextTrackCues will trigger events when their timestamp is reached. For example, this is how to listen to the `enter` event, for when a cue starts:

{%example "Handling cue 'enter' events on an audio element" %}
let track = audio.textTracks[0];
for (let cue of track.cues) {
    cue.onenter = e => {
        let cuePayload = JSON.parse(cue.text);
        doHighlighting(cuePayload.selector);
    };
}
{% endexample %}

### Text highlights

This is how to programatically create a [Custom Highlight](https://www.w3.org/TR/css-highlight-api-1/) from a [selector](#selector).

Create a [StaticRange](https://dom.spec.whatwg.org/#interface-staticrange) from a [`selector`](#selector).

{% example "Selector for a portion of text" %}
{
    "selector":{
        "type": "CssSelector", 
        "value": "nth-child(1 of .stanza) > :nth-child(1 of .line)",
        "refinedBy": {
            "type": "TextPositionSelector",
            "start": 0,
            "end": 4
        }
    }
}
{% endexample %}

{% example "Creating a range from that selector" %}
function createRange(selector) {
    let node = document.querySelector(selector.value);
    return new StaticRange({
        startContainer: node.firstChild,
        startOffset: selector.refinedBy.start,
        endContainer: node.firstChild,
        endOffset: selector.refinedBy.end + 1
    });
}
{% endexample %}

Then create a [Custom Highlight](https://www.w3.org/TR/css-highlight-api-1/) using that range.

{% example "Using the CSS Custom Highlight API" %}
function doHighlighting(selector) {
    let range = createRange(selector);
    let highlight = new Highlight(range);
    CSS.highlights.set("sync", highlight); // "sync" is chosen arbitrarily here
}
{% endexample %}

#### Layering highlights

Multiple simultaneous highlights are possible when cues overlap. Here is an example using mulitple WebVTT files to provide highlight layers for words, lines, and stanzas of a poem. The track order gives the highlight priority order. In this example, stanzas are highlighted, followed by lines appearing on top of that, followed by words.

{% example "Audio element with multiple metadata tracks"%}
<audio controls autoplay src="chapter.mp3">
 <track id="stanzas" kind="metadata" src="stanza.vtt" label="Stanzas" default/>
 <track id="lines" kind="metadata" src="line.vtt" label="Lines" default/>
 <track id="words" kind="metadata" src="word.vtt" label="Words" default/>
</audio>
{% endexample %}

{% example "Multi-level highlights: Words" %}
WEBVTT

00:00:07.800 --> 00:00:08.200
{"selector": {"type": "CssSelector", "value": ":nth-child("1" of .stanza) > :nth-child(1 of .line)", refinedBy: {"type": "TextPositionSelector", "start": 0, "end": 3}}}

00:00:08.200 --> 00:00:08.800
{"selector": {"type": "CssSelector", "value": ":nth-child("1" of .stanza) > :nth-child(1 of .line)", refinedBy: {"type": "TextPositionSelector", "start": 5, "end": 8}}}

00:00:08.800 --> 00:00:09.200
{"selector": {"type": "CssSelector", "value": ":nth-child("1" of .stanza) > :nth-child(1 of .line)", refinedBy: {"type": "TextPositionSelector", "start": 10 "end": ,0"}}}
{% endexample %}

{% example "Multi-level highlights: Lines" %}
WEBVTT

00:00:07.800 --> 00:00:12.600
{"selector":{"type":"CssSelector","value":":nth-child(1 of .stanza) > :nth-child(1 of .line)"}}

00:00:12.600 --> 00:00:16.200
{"selector":{"type":"CssSelector","value":":nth-child(1 of .stanza) > :nth-child(2 of .line)"}}

00:00:17.200 --> 00:00:21.000
{"selector":{"type":"CssSelector","value":":nth-child(1 of .stanza) > :nth-child(3 of .line)"}}

{% endexample %}

{% example "Multi-level highlights: Stanzas" %}
WEBVTT

00:00:07.800 --> 00:00:31.100
{"selector":{"type":"CssSelector","value":":nth-child(1 of .stanza)"}}

00:00:32.300 --> 00:00:55.800
{"selector":{"type":"CssSelector","value":":nth-child(2 of .stanza)"}}

{% endexample %}

In that example, a cue from each WebVTT file starts at the same time. Their associated highlights can all be different, for example the stanza can have a light background, the line can have a stronger background, and the word can be underlined. All the highlights can co-exist simultaneously because each one has its own key in the HighlightRegistry. The link between the highlight's key in the HighlightRegistry and the track is given by the track's ID. 



{% example "Create highlight and use track ID to keep it on a unique layer" %}
let range = createRange(cuePayload.selector)
let highlight = new Highlight(range);
CSS.highlights.set(cue.track.id, highlight); 
{% endexample %}


{% example "CSS styles for highlights" %}
::highlight(stanzas) {
    background-color: lightyellow;
}

::highlight(lines) {
    text-decoration: none;
    background-color: yellow;
}
::highlight(words) {
    text-decoration: underline;
    text-decoration-style:dotted;
    text-decoration-thickness: 2px;
}
{% endexample %}

### Content navigation

#### Previous/next navigation

This user interface feature lets a user move between cues. When paired with multiple simultaneous tracks, it enables variation on the previous/next navigation feature, for example allowing a way to move to the next word, sentence, or paragraph.

Cues may appear in a WebVTT file in any order, not necessarily in document flow order. They can be sorted by timestamp when it is necessary to calculate previous and next cues.

#### Skip/escape

A user listening to a narrated document has certain elements "set to skip", e.g. page number announcements might be turned off; or wants to "escape" from a complex structure, e.g. a table or nested list, and return to the main content flow.

HTML document semantics provide all necessary information, requiring only to reposition the audio timeline past any cues that reference a construct being escaped or skipped. Therefore including skip/escape semantics and nesting in the WebVTT file becomes unnecessary.



## Word-level selectors {.appendix}

It is possible to use a `CssSelector` with a `TextPositionSelector` to reference a sub-element character range. 

{% example "Selecting a word with character offsets via TextPositionSelector"%}
{
    "selector":{
        "type": "CssSelector", 
        "value": "nth-child(1 of .stanza) > :nth-child(1 of .line)",
        "refinedBy": {
            "type": "TextPositionSelector",
            "start": 0,
            "end": 4
        }
    }
}
{% endexample %}

See the [multi-level highlights example](#layering-highlights) for a WebVTT excerpt using this type of selector.
::: {.note}
[The text of the poem](https://github.com/w3c/sync-media-pub/blob/main/docs-src/demos/raven/index.html) in the example did not need to be marked up with `id`s!
:::


## Autoplay policy {.appendix}

:::{.note}
At the time of writing, autoplay policy implementations were not working sufficiently for proper testing, but many browsers have another way to do this via a setting to allow autoplay per domain. This is not necessarily the most user-friendly way but it does work.
:::

In order to be able to potentially automatically start playback of HTML media elements, the HTML document to be synchronized should be served with a compatible [`autoplay` policy](https://html.spec.whatwg.org/multipage/infrastructure.html#policy-controlled-features). 

For example, in the context of a multi-HTML document presentation (like a book), this would enable a chapter to start playing as soon as it loads. When it's done, the next HTML file gets loaded automatically and starts playing as soon as it loads.

The page ultimately controls the request to enable/disable autoplay, so allowing `autoplay` at the server level is reasonable.

## Incorporating into other formats {.appendix}

In cases where the audio narration file is not referenced in the HTML document, more scaffolding is required to make the association among the HTML document, the audio narration, and the WebVTT cues.

[This relationship](#associating-the-webvtt-file-with-the-htmlmediaelement) then has to be made programatically by the user agent handling the format.

:::{.note}
These are ideas, nothing official yet! 
:::

### EPUB

Similar to how an EPUB manifest associates a Media Overlay document with a Content Document:
{% example "Media Overlays in EPUB package file manifest" %}
<item href="chapter1.xhtml" id="ch1" media-type="application/xhtml+xml" media-overlay="ch1-overlay"/>
<item href="audio/ch1.mp3" id="ch1-audio" media-type="audio/mpeg"/>
<item href="chapter1.smil" id="ch1-overlay" media-type="application/smil+xml"/>
{% endexample %}

We can expand the `media-overlay` attribute to allow multiple values, and determine the purpose of each via its `media-type`:

{% example "WebVTT in EPUB package file" %}
<item href="chapter1.xhtml" id="ch1" media-type="application/xhtml+xml" media-overlay="ch1-audio ch1-vtt"/>
<item href="audio/ch1.mp3" id="ch1-audio" media-type="audio/mpeg"/>
<item href="ch1.vtt" id="ch1-vtt" media-type="text/vtt"/>
{% endexample %}

The EPUB Reading System then dynamically loads the audio and associates the WebVTT file with it. It uses a small amount of scripting to synchronize highlights with cue events. 

Alternately, the audio for a chapter and its WebVTT file could live directly in the chapter's HTML file. 

### Audiobooks

The audio file is already in the manifest; the HTML file is its `alternate`; and the WebVTT file can be another `alternate`.

{% example "Audiobooks manifest with WebVTT reference" %}
"alternate" : [{
        "type" : "LinkedResource",
        "url" : "text/part001-1.html",
        "encodingFormat" : "text/html"
    },{
        "type" : "LinkedResource",
        "url" : "text/part001-1.vtt",
        "encodingFormat" : "text/vtt"
    }
]
{% endexample %}

This could raise the question of how the user agent presents alternate options. In this case, the desired approach is to use both `alternate`s together rather than choosing one or the other. 


## Acknowledgements {.appendix}

At the time of publication, the members of the [Synchronized Multimedia for Publications Community Group](https://www.w3.org/community/sync-media-pub/) were:

Avneesh Singh (DAISY Consortium), Ben Dugas (Rakuten, Inc.), Chris Needham (British Broadcasting Corporation), Daniel Weck (DAISY Consortium), Didier Gehrer, Farrah Little (BC Libraries Cooperative), George Kerscher (DAISY Consortium), Ivan Herman (W3C), James Donaldson, Lars Wallin (Colibrio), Livio Mondini, Lynn McCormack (CAST, Inc), Marisa DeMeglio (DAISY Consortium, chair), Markku Hakkinen (Educational Testing Service), Matt Garrish (DAISY Consortium), Michiel Westerbeek (Tella), Nigel Megitt (British Broadcasting Corporation), Romain Deltour (DAISY Consortium), Wendy Reid (Rakuten, Inc.), Zheng Xu (Rakuten, Inc.)