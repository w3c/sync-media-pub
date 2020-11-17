---
title: SyncMedia 1.0
layout: spec.njk
---
<section id="abstract">
    <p>This specification defines SyncMedia, a format for synchronized media presentations. A presentation consists of media, potentially of different types, orchestrated in a linear timeline. SyncMedia presentations are rendered to a user by a SyncMedia-aware player.</p>    
</section>

<section id="sotd">
</section>

<section id="conformance">
</section>

## Relationship to Other Specifications

SyncMedia is an evolution of [EPUB3 Media Overlays](https://www.w3.org/publishing/epub32/epub-mediaoverlays.html) and, like Media Overlays, is built on [[SMIL3]]. Compared to Media Overlays, SyncMedia incorporates additional SMIL concepts, and also includes custom extensions. 

## SyncMedia

This section defines SyncMedia's terms and properties, and gives examples. Examples in this section are written in SMIL XML with the `sync` namespace used for custom extensions. Choosing a serialization formation remains an open issue.

### Definitions  

<dfn id="dfn-media-object" data-dfn-type="dfn">Media Object</dfn>
: A media resource in the [=Sync Media Document=]

<dfn id="dfn-media-param" data-dfn-type="dfn">Media Param</dfn>
:   Named parameters to communicate options to the [=Media Object Renderer=]

<dfn id="dfn-media-object-renderer" data-dfn-type="dfn">Media Object Renderer</dfn>
:   A component used by the [=Sync Media Player=] to render [=Media Objects=]. Different media types may necessitate different renderers.

<dfn id="dfn-parallel-time-container" data-dfn-type="dfn">Parallel Time Container</dfn>
:   A [=Time Container=] in which children are rendered in parallel

<dfn id="dfn-role" data-dfn-type="dfn">Role</dfn>
:   Gives the semantic(s) for the item

<dfn id="dfn-sequential-time-container" data-dfn-type="dfn">Sequential Time Container</dfn>
:   A [=Time Container=] in which children are rendered in sequence

<dfn id="dfn-sync-media-document" data-dfn-type="dfn">Sync Media Document</dfn>
:   The synchronized presentation.

<dfn id="dfn-sync-media-player" data-dfn-type="dfn">Sync Media Player</dfn>
:   A user agent that knows how to process and playback [=Sync Media Documents=]

<dfn id="dfn-timeline" data-dfn-type="dfn">Timeline</dfn>
:   Linear arrangement of [=Time Containers=]

<dfn id="dfn-time-container">Time Container</dfn>
:   The container that dictates the playback order for its children

<dfn id="dfn-track">Track</dfn>
:   An organizational concept that defines a purposeful virtual rendering space for media objects, not tied to a visual layout, with default properties


### Document Structure

A SyncMedia document contains two parts: a `head` and a `body`. The temporal presentation of media objects is laid out in the body. Time containers can be used to render media in parallel or to arrange sub-sequences. The head contains metainformation and track information.

A SyncMedia document MUST have a `body`. It MAY have a `head`.

| Term | Data type | Description |
| -----| --------- | ------------|
| `head`{#head} | Node | Information not related to temporal behavior |
| `body`{#body} | Node | Main [=sequential time container=] for the presentation. |

### Time Containers

Media objects are arranged in time containers, which determine whether they are rendered together (in parallel) or one after the other (in sequence). Time containers MAY be nested in other time containers (but MUST NOT be nested  in media objects).

| Term | Data type | Description |
| -----| --------- | ------------|
| `seq`{#seq} | Node | A [=sequential time container=] for media and/or time containers. |
| `par`{#par} | Node | A [=parallel time container=] for media and/or time containers. | 


{% example "Using time containers to associate text references with audio clips, to create a synchronized text and audio presentation"%}
<body>
    <par>
        <audio src="chapter01.mp3" clipBegin="30" clipEnd="40"/>
        <text src="chapter01.html#heading_01"/>
    </par>
    <par>
        <audio src="chapter01.mp3" clipBegin="40" clipEnd="50"/>
        <text src="chapter01.html#para_01"/>
    </par>
    <par>
        <audio src="chapter01.mp3" clipBegin="50" clipEnd="60"/>
        <text src="chapter01.html#para_02"/>
    </par>
</body>
{% endexample %}

#### Structural Semantics

There are benefits to applying structural semantics to time containers in SyncMedia. User agents that understand semantic role values MAY customize the user experience, for example by enabling the skipping of types of secondary content that interferes with the flow of narration (such as page number announcements, often included to provide a point of reference between print and digital editions); or escaping complex structures, such as tables or charts.

#### Properties

| Term | Data type | Description |
| -----| --------- | ------------|
| `role`{#role} | One or more `strings` | Semantic role(s) | 

Values for the `role` property on time containers must come from [WAI-ARIA Document Structure](https://www.w3.org/TR/wai-aria/#document_structure_roles) or [DPUB-ARIA](https://www.w3.org/TR/dpub-aria-1.0/). 

::: .TODO
__TODO__
[Issue 12](https://github.com/w3c/sync-media-pub/issues/12)
:::

{% example "Using role to mark a page number" %}
<body>
    <par>
        <audio src="chapter01.mp3" clipBegin="50" clipEnd="60"/>
        <text src="chapter01.html#para_02"/>
    </par>
    <par sync:role="doc-pagebreak">
        <audio src="chapter01.mp3" clipBegin="60" clipEnd="62"/>
        <text src="chapter01.html#pg_04"/>
    </par>
    <par>
        <audio src="chapter01.mp3" clipBegin="62" clipEnd="70"/>
        <text src="chapter01.html#para_03"/>
    </par>
</body>
{% endexample %}

### Media Objects

Media resources are included in SyncMedia via media objects. The actual media resource is an external file, or quite commonly, a segment of a file, such as an audio or video clip, or part of an HTML document.

The table below describes the media objects in SyncMedia. `Ref` can be used to represent any media, but authors often prefer to use media type-specific synonyms.

| Term | Data type | Description |
| -----| --------- | ----------- | 
| `audio`{#audio} | Node | References audio media.| 
| `image`{#image} | Node | References image media.|
| `ref`{#ref} | Node | Generic media reference | 
| `text`{#text} | Node | References text content in an HTML document.|
| `video`{#video} | Node | References video media.|

#### Properties

Properties on media objects are used to 
* express the location of the media source, including segment
* assign a media object to a [=track=]
* indicate that a media object repeats

| Term | Data type | Description |
| -----| --------- | ------------|
| `clipBegin`{#clipBegin}| <a href="https://www.w3.org/publishing/epub/epub-mediaoverlays.html#app-clock-examples">Clock value</a> | Start of a timed media clip | 
| `clipEnd`{#clipEnd} | <a href="https://www.w3.org/publishing/epub/epub-mediaoverlays.html#app-clock-examples">Clock value</a> | End of a timed media clip |
| `containerType`{#containerType} | Media type | If `src` references media embedded in a document, `containerType` gives the media type of the embedding document |
| `panZoom`{#panZoom} | Ordered list of 4 values, as in SMIL3's <a data-cite="SMIL3/smil30.html#smil-extended-media-object-adef-panZoom">panZoom</a>| Rectangular portion of media object |
| `repeatCount`{#repeatCount} | Number, or "indefinite", as in SMIL3's <a data-cite="SMIL3/smil-timing.html#adef-repeatCount">repeatCount</a> | For timed media. Specifies the number of iterations. |
| `src`{#src} | URL | Location of media file, optionally including a media fragment [[media-frags]] | 
| `track`{#trackref} | ID | Specifies the ID of a track.|

If both an `src` with a media fragment and `clipBegin`/`clipEnd` attributes are present, it is RECOMMENDED to apply clipping to the resource with respect to the media fragment offset(s), as defined in [All Media Fragment Clients](https://www.w3.org/TR/media-frags/#media-fragment-clients). 

::: {.note}
It is RECOMMENDED to use a media fragment on `src` to refer to a large chunk of media; and to use `clipBegin` and `clipEnd` for defining fine-grained clips. This is to separate the requirement on the client of retrieving the resource, perhaps done using a URI request to a server, from locating a segment of the resource, done with clip start/end points. Otherwise, if a client is fetching every phrase individually, it would then have to implement complex caching to smooth out playback so as to remove glitching between clips.
:::

`containerType` SHOULD be specified when the media is being referenced in the context of an embedding document. It SHOULD NOT be used for `text` elements referencing HTML text, as this relationship is implied.

{% example "Using containerType to describe the context of video media" %}
<par>
    <text src="doc.html#para1"/>
    <video src="doc.html#video1" sync:containerType="text/html" clipBegin="0" clipEnd="10"/>
</par>
{% endexample %}

#### Parameters

SyncMedia uses SMIL3's <a data-cite="SMIL3/smil30.html#smil-extended-media-object-edef-param">param</a> to send parameters to [=media object renderer=]s.

| Term | Data type | Description |
| -----| --------- | ------------|
| `param`{#param} | Node | Name/value pair sent to a media object renderer. |

The properties of `param` are:

| Term | Data type | Description |
| -----| ----------|-------------|
| `name`{#name} | `string` | Parameter name |
| `value`{#value} | `string` | Parameter value |

The following parameter `name`s are defined:

| Name | Allowed value(s) | For media type | Description | 
|------| ------|------------|-------------|
| `cssClass` | One or more strings | Media that can be styled with CSS | Indicates class name(s) to apply |
| `clipPath` | As defined by the [SVG path data attribute](https://www.w3.org/TR/SVG11/paths.html#DAttribute) | Visual media | The shape that will be used to apply a clip mask to the media |
| `pan` | Between -1 (full left) and 1 (full right) | Audible media | Indicates the volume pan |
| `playbackRate` | 1.0 (normal rate), less, or more | Timed media | Indicates the playback rate. Values should align with HTML's {%raw%}{{HTMLMediaElement/playbackRate}}{%endraw%}. |
| `volume` | Between 0 and 1 | Audible media | Indicates the volume |

::: {.note}
`clipPath` specifies a clipping path using an SVG path definition. The clipping is applied to the visible region of the Media Object on which it is defined. When combined with `panZoom` the `clipPath` SHOULD be applied inside the rect defined by the `panZoom` attribute.
:::

{% example "Using param to add synchronized highlighting to HTML element" %}
<body>
    <par>
        <audio src="chapter01.mp3" clipBegin="30" clipEnd="40"/>
        <text src="chapter01.html#heading_01">
            <param name="cssClass" value="highlight"/>
        </text>
    </par>
    <par>
        <audio src="chapter01.mp3" clipBegin="40" clipEnd="50"/>
        <text src="chapter01.html#para_01">
            <param name="cssClass" value="highlight"/>
        </text>
    </par>
    <par>
        <audio src="chapter01.mp3" clipBegin="50" clipEnd="60"/>
        <text src="chapter01.html#para_02">
            <param name="cssClass" value="highlight"/>
        </text>
    </par>
</body>
{% endexample %}


### Tracks

SyncMedia presentations organize media objects of the same types into virtual spaces called "tracks". Tracks MUST be placed in the SyncMedia document `head`. Tracks have several useful features:

1. A track MAY provide default [params](#param) that then get applied to any media object on that track. 
2. A track MAY be set as the default for a given media object type (e.g. all the `audio` media objects can be automatically assigned to a track).
3. A track MAY have a default source for all its media objects to use, in combination with any fragment specifier on the media object itself.

All of these features reduce verbosity as otherwise these properties would have to be explicitly stated on each media object. 

| Term | Description |
| -----| ----------- |
| `track`{#track} | A virtual space to which [=Media Objects=] are assigned. A user agent MAY offer interface controls on a per-track basis (e.g. adjust volume on the narration track). A `sync:track` MAY have [=Media Params=], which act as defaults for [=Media Objects=] on that track.  |

#### Properties

| Term | Data type | Description |
| -----| --------- | ------------|
| `label`{#label} | `string` | The track's label |
| `defaultSrc`{#defaultSrc} | `URL` | Source of the default file that media objects on this track will use.|
| `defaultFor`{#defaultFor} | One of: `audio`, `image`, `video`, `text`, `ref` | Media objects of the type specified are automatically assigned to this track. |
| `trackType`{#trackType} | One of: `backgroundAudio`, `audioNarration`, `signLanguageVideo`, `contentDocument` | Presentation feature embodied by this track. |
| `containerType` | Media type | If `defaultSrc` refers to media embedded in a document, `containerType` gives the media type of that document. See [containerType](#containerType). |

::: .TODO
__TODO__:
[Issue 31](https://github.com/w3c/sync-media-pub/issues/31)
:::


{% example "A track for an HTML document with default values and a cssClass param" %}
<head>
    <sync:track sync:label="Page" sync:defaultFor="text" 
        sync:defaultSrc="chapter01.html" sync:trackType="contentDocument">
        <param name="cssClass" value="highlight"/>
    </sync:track>
</head>
<body>
    <par>
        <audio src="chapter01.mp3" clipBegin="30" clipEnd="40"/>
        <text src="#heading_01"/>
    </par>
    <par>
        <audio src="chapter01.mp3" clipBegin="40" clipEnd="50"/>
        <text src="#para_01"/>
    </par>
    <par>
        <audio src="chapter01.mp3" clipEnd="50" clipEnd="60"/>
        <text src="#para_02"/>
    </par>
</body>
{% endexample %}

{% example "Two audio tracks: one for narration (the default track for audio media objects), and one for background music."%}
<head>
    <sync:track id="background-music" sync:trackType="backgroundAudio">
        <param name="volume" value="0.5"/>
    </sync:track>
    <sync:track sync:label="Narration" sync:defaultFor="audio" sync:trackType="audioNarration"/>
    <sync:track sync:label="Page" sync:defaultFor="text" sync:trackType="contentDocument">
        <param name="cssClass" value="highlight"/>
    </sync:track>
</head>
<body>
    <par>
        <audio sync:track="background-music" src="bkmusic.mp3" repeat="indefinite"/>
        <seq>
            <par>
                <audio src="chapter01.mp3" clipBegin="30" clipEnd="40"/>
                <text src="chapter01.html#heading_01"/>
            </par>
            <par>
                <audio src="chapter01.mp3" clipBegin="40" clipEnd="50"/>
                <text src="chapter01.html#para_01"/>
            </par>
            <par>
                <audio src="chapter01.mp3" clipEnd="50" clipEnd="60"/>
                <text src="chapter01.html#para_02"/>
            </par>
        </seq>
    </par>
</body>
{% endexample %}

The reason for including a narration `track`, even though it supplies no default values, is because it would enable a user agent to have separate controls for narration audio vs background music audio. {.note}


### Metadata
SyncMedia has a generic mechanism for incorporating metadata but does not require or define any specific metadata. Metadata MUST go in the SyncMedia document `head`.

| Term | Description |
| -----| ----------- |
| `metadata`{#metadata} | Extension point that allows the inclusion of metadata from any metainformation structuring language |


## Playback

### Processing

### Applying track values to media objects

[=Tracks=] MAY provide defaults for [=media objects=]. This section gives the rules for how to apply these values.

| Track attribute | Impact on media object |
|-----------------|------------------------|
| defaultSrc      | Provides the `src` for the media object. If the media object has an `src` which is only a selector, then the selector is appended to the track's `defaultSrc`. Any other value for a media object `src` overrides the track's `defaultSrc`. |
| containerType   | If the track's `defaultSrc` is referencing embedded media, this gives the type of the containing document. |


::: .TODO
__TODO__:
Finish this section
:::

### Rendering

After the SyncMedia document has been processed, it is ready to be rendered.

| Object | Rendering behavior | 
|--------|--------------------|
| `body` | Render like `seq`  |
| `seq` | Render each child in order, each starting after the previous completes. Done when the last child is finished.|
| `par` | Render each child at the same time. Done when all the children are finished.|
| `audio` | Play the referenced portion of audio media and apply `params`. Done when the referenced portion has finished. |
| `image` | Load the image file or segment and apply `params`. Not timed, so considered done immediately. |
| `ref` | Infer the media type and, if supported, render the file or segment, and apply `params`. If timed, done when the segment is finished; if untimed, done immediately. |
| `text` | Display the HTML document, ensure the referenced element is visible, and apply `params`. Not timed, so considered done immediately. |
| `video` | Play the video file or segment and apply `params`. Done when the segment is finished. |


Note about media with `repeatCount` and when it's considered done {.note}


### User Interaction

::: .TODO
__TODO__: how much to cover here?
:::

* Moving through the presentation meaningfully, e.g. previous/next sentence or para
* Exposing controls for multitrack presentations
* Note about global adjustments and track types (indicated by `trackType`) that they might not make sense for, e.g. speeding up a presentation but not speeding up the background music.

## Encoding and Serialization

::: .TODO
__TODO__: 
[Issue 10](https://github.com/w3c/sync-media-pub/issues/10)
:::

### XML

Note about global XML attributes applying everywhere, e.g. `id` {.note}

Note about the root element `smil`, which hasn't been mentioned yet {.note}

Note about custom extensions in the `sync` namespace {.note}

#### Content model

<table summary="XML content model for SyncMedia">
    <thead><tr><th>Element</th><th>Attributes</th><th>Content</th></tr></thead>
    <tbody>
        <tr>
            <td>`smil`</td>
            <td>None</td>
            <td>
                In this order:
                <ul>
                    <li><a href="#head">`head`</a> (0 or 1)</li>
                    <li><a href="#body">`body`</a> (exactly 1)</li>
                </ul>
            </td>
        </tr>
        <tr>
            <td><a href="#head">`head`</a></td>
            <td>None</td>
            <td>
                In any order:
                <ul>
                    <li><a href="#metadata">`metadata`</a> (0 or more)</li>
                    <li><a href="#track">`sync:track`</a> (0 or more)</li>
                </ul>
            </td>
        </tr>
        <tr>
            <td><a href="#metadata">`metadata`</a></td>
            <td>None</td>
            <td>0 or more elements from any namespace</td>
        </tr>
        <tr>
            <td><a href="#track">`sync:track`</a></td>
            <td>
                <ul>
                    <li><a href="#label">`sync:label`</a></li>
                    <li><a href="#defaultSrc">`sync:defaultSrc`</a></li>
                    <li><a href="#defaultFor">`sync:defaultFor`</a></li>
                    <li><a href="#trackType">`sync:trackType`</a></li>
                    <li><a href="#containerType">`sync:containerType`</a></li>
                </ul>
            </td>
            <td>
                <ul>
                    <li><a href="#param">`param`</a> (0 or more) </li>
                </ul>
            </td>
        </tr>
        <tr>
            <td><a href="#param">`param`</a></td>
            <td>
                <ul>
                    <li><a href="#name">`name`</a></li>
                    <li><a href="#value">`value`</a></li>
                </ul>
            </td>
            <td>Empty</td>
        </tr>
        <tr>
            <td><a href="#body">`body`</a></td>
            <td>
                <ul>
                    <li><a href="#role">`sync:role`</a></li>
                </ul>
            </td>
            <td>
                In any order:
                <ul>
                    <li><a href="#audio">`audio`</a> (0 or more)</li>
                    <li><a href="#image">`image`</a> (0 or more)</li>
                    <li><a href="#par">`par`</a> (0 or more)</li>
                    <li><a href="#ref">`ref`</a> (0 or more)</li>
                    <li><a href="#seq">`seq`</a> (0 or more)</li>
                    <li><a href="#text">`text`</a> (0 or more)</li>
                    <li><a href="#video">`video`</a> (0 or more)</li>
                </ul>
            </td>
        </tr>
        <tr>
            <td><a href="#seq">`seq`</a></td>
            <td>
                <ul>
                    <li><a href="#role">`sync:role`</a></li>
                </ul>
            </td>
            <td>
                In any order:
                <ul>
                    <li><a href="#audio">`audio`</a> (0 or more)</li>
                    <li><a href="#image">`image`</a> (0 or more)</li>
                    <li><a href="#par">`par`</a> (0 or more)</li>
                    <li><a href="#ref">`ref`</a> (0 or more)</li>
                    <li><a href="#seq">`seq`</a> (0 or more)</li>
                    <li><a href="#text">`text`</a> (0 or more)</li>
                    <li><a href="#video">`video`</a> (0 or more)</li>
                </ul>
            </td>
        </tr>
        <tr>
            <td><a href="#par">`par`</a></td>
            <td>
                <ul>
                    <li><a href="#role">`sync:role`</a></li>
                </ul>
            </td>
            <td>
                In any order:
                <ul>
                    <li><a href="#audio">`audio`</a> (0 or more)</li>
                    <li><a href="#image">`image`</a> (0 or more)</li>
                    <li><a href="#par">`par`</a> (0 or more)</li>
                    <li><a href="#ref">`ref`</a> (0 or more)</li>
                    <li><a href="#seq">`seq`</a> (0 or more)</li>
                    <li><a href="#text">`text`</a> (0 or more)</li>
                    <li><a href="#video">`video`</a> (0 or more)</li>
                </ul>
            </td>
        </tr>
        <tr>
            <td><a href="#audio">`audio`</a></td>
            <td>
                <ul>
                    <li><a href="#clipBegin">`clipBegin`</a></li>
                    <li><a href="#clipEnd">`clipEnd`</a></li>
                    <li><a href="#containerType">`sync:containerType`</a></li>
                    <li><a href="#repeatCount">`repeatCount`</a></li>
                    <li><a href="#src">`src`</a></li>
                    <li><a href="#track">`sync:track`</a></li>
                </ul>
            </td>
            <td>
                <ul>
                    <li><a href="#param">`param`</a> (0 or more)</li>
                </ul>
            </td>
        </tr>
        <tr>
            <td><a href="#image">`image`</a></td>
            <td>
                <ul>
                    <li><a href="#containerType">`sync:containerType`</a></li>
                    <li><a href="#src">`src`</a></li>
                    <li><a href="#track">`sync:track`</a></li>
                    <li><a href="#panZoom">`panZoom`</a></li>
                </ul>
            </td>
            <td>
                <ul>
                    <li><a href="#param">`param`</a> (0 or more)</li>
                </ul>
            </td>
        </tr>
        <tr>
            <td><a href="#ref">`ref`</a></td>
            <td>
                <ul>
                    <li><a href="#clipBegin">`clipBegin`</a></li>
                    <li><a href="#clipEnd">`clipEnd`</a></li>
                    <li><a href="#containerType">`sync:containerType`</a></li>
                    <li><a href="#panZoom">`panZoom`</a></li>
                    <li><a href="#repeatCount">`repeatCount`</a></li>
                    <li><a href="#src">`src`</a></li>
                    <li><a href="#track">`sync:track`</a></li>
                </ul>
            </td>
            <td>
                <ul>
                    <li><a href="#param">`param`</a> (0 or more)</li>
                </ul>
            </td>
        </tr>
        <tr>
            <td><a href="#text">`text`</a></td>
            <td>
                <ul>
                    <li><a href="#containerType">`sync:containerType`</a></li>
                    <li><a href="#src">`src`</a></li>
                    <li><a href="#track">`sync:track`</a></li>
                </ul>
            </td>
            <td>
                <ul>
                    <li><a href="#param">`param`</a> (0 or more)</li>
                </ul>
            </td>
        </tr>
        <tr>
            <td><a href="#video">`video`</a></td>
            <td>
                <ul>
                    <li><a href="#clipBegin">`clipBegin`</a></li>
                    <li><a href="#clipEnd">`clipEnd`</a></li>
                    <li><a href="#containerType">`sync:containerType`</a></li>
                    <li><a href="#panZoom">`panZoom`</a></li>
                    <li><a href="#repeatCount">`repeatCount`</a></li>
                    <li><a href="#src">`src`</a></li>
                    <li><a href="#track">`sync:track`</a></li>
                </ul>
            </td>
            <td>
                <ul>
                    <li><a href="#param">`param`</a> (0 or more)</li>
                </ul>
            </td>
        </tr>
    </tbody>
</table>


### JSON

::: .TODO
__TODO__:
Lossless roundtrip from XML to JSON
:::

## Acknowledgements {.appendix}

At the time of publication, the members of the [Synchronized Multimedia for Publications Community Group](https://www.w3.org/community/sync-media-pub/) were:

Avneesh Singh (DAISY Consortium), Ben Dugas (Rakuten, Inc.), Chris Needham (British Broadcasting Corporation), Daniel Weck (DAISY Consortium), Didier Gehrer, Farrah Little (BC Libraries Cooperative), George Kerscher (DAISY Consortium), Ivan Herman (W3C), James Donaldson, Lars Wallin (Colibrio), Livio Mondini, Lynn McCormack (CAST, Inc), Marisa DeMeglio (DAISY Consortium, chair), Markku Hakkinen (Educational Testing Service), Matt Garrish (DAISY Consortium), Michiel Westerbeek (Tella), Nigel Megitt (British Broadcasting Corporation), Romain Deltour (DAISY Consortium), Wendy Reid (Rakuten, Inc.), Zheng Xu (Rakuten, Inc.)
