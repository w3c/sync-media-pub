---
title: SyncMedia 1.0
layout: spec.njk
---
<section id="abstract">
    <p>This specification defines SyncMedia, a format for synchronized media presentations. A presentation consists of media, potentially of different types, orchestrated in a linear timeline. SyncMedia presentations are rendered to a user by a SyncMedia-aware player.</p>    
</section>

<section id="sotd">
</section>

## Relationship to Other Specifications

SyncMedia is an evolution of [EPUB3 Media Overlays](https://www.w3.org/publishing/epub32/epub-mediaoverlays.html) and, like Media Overlays, is built on [[SMIL3]]. Compared to Media Overlays, SyncMedia incorporates additional SMIL concepts, and also includes custom extensions. 

## SyncMedia

This section defines SyncMedia's terms and properties, and gives examples. Examples in this section are written in SMIL XML with the `sync` namespace used for custom extensions. Choosing serialization format(s) remains an open issue. 

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
:   Gives the semantic inflection for the item

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

A SyncMedia document contains two parts: a head and a body. The temporal presentation of media objects is laid out in the body. Time containers may be used to render media in parallel or to arrange sub-sequences. The head contains metainformation and track information.

| Term | Data type | Description |
| -----| --------- | ------------|
| `head`{#head} | Object / element | Information not related to temporal behavior |
| `body`{#body} | Object / element | Main [=sequential time container=] for the presentation. |

### Time Containers

Media objects are arranged in time containers to determine whether they are rendered together (in parallel) or one after the other (in sequence). Time containers can be nested in other time containers (but not in media objects).

| Term | Data type | Description |
| -----| --------- | ------------|
| `seq`{#seq} | Object / element | A [=sequential time container=] for media and/or time containers. |
| `par`{#par} | Object / element | A [=parallel time container=] for media and/or time containers. | 


{% example "Using time containers to associate text references with audio clips, to create a synchronized text and audio presentation"%}
<body>
    <par>
        <audio src="chapter01.mp3#t=30,40"/>
        <text src="chapter01.html#heading_01"/>
    </par>
    <par>
        <audio src="chapter01.mp3#t=40,50"/>
        <text src="chapter01.html#para_01"/>
    </par>
    <par>
        <audio src="chapter01.mp3#t=50,60"/>
        <text src="chapter01.html#para_02"/>
    </par>
</body>
{% endexample %}

#### Semantic Inflection

There are benefits to applying semantic inflection to time containers in SyncMedia. Users can customize their experience, for example by skipping types of secondary content that interferes with the flow of narration (such as page number announcements, often included to provide a point of reference between print and digital editions); or escaping complex structures, such as tables or charts.


| Term | Data type | Description |
| -----| --------- | ------------|
| `role`{#role} | One or more `string`s | Semantic role(s) | 

::: .TODO
__TODO__: There is an [open issue](https://github.com/w3c/sync-media-pub/issues/12) about referencing a role vocabulary.
:::

{% example "Using role to mark a page number" %}
<body>
    <par>
        <audio src="chapter01.mp3#t=50,60"/>
        <text src="chapter01.html#para_02"/>
    </par>
    <par sync:role="doc-pagebreak">
        <audio src="chapter01.mp3#t=60,62"/>
        <text src="chapter01.html#pg_04"/>
    </par>
    <par>
        <audio src="chapter01.mp3#t=62,70"/>
        <text src="chapter01.html#para_03"/>
    </par>
</body>
{% endexample %}

### Media Objects

Media resources are included in SyncMedia via media objects. The actual media resource is an external file, or quite commonly, a segment of a file, such as an audio or video clip, or part of an HTML document.

The table below describes the media objects in SyncMedia. `Ref` can be used to represent any media, but authors often prefer to use media type-specific synonyms.

| Term | Data type | Description |
| -----| --------- | ----------- | 
| `ref`{#ref} | Object / element | Generic media reference | 
| `audio`{#audio} | Object / element | Synonym for [`ref`](#ref) that specifically references audio media.| 
| `image`{#image} | Object / element | Synonym for [`ref`](#ref) that specifically references image media.|
| `text`{#text} | Object / element | Synonym for [`ref`](#ref) that specifically references an element in an HTML document.|
| `video`{#video} | Object / element | Synonym for [`ref`](#ref) that specifically references video media.|

::: .TODO
__TODO__:  What should the approach be to referencing timed media in an HTML file? E.g. can you have `<text src="file.html#video"/>` where `#video` is the ID of an HTML video element?
:::

#### Properties

Properties on media objects are used to express the location of the media source file as well as the applicable segment. There is also a property to assign a media object to a [=track=].

| Term | Data type | Description |
| -----| --------- | ------------|
| `src`{#src} | URL | Location of media file, optionally including a [fragment selector](https://www.w3.org/TR/selectors-states/#FragmentSelector_def) | 
| `track`{#trackref} | ID | Specifies the ID of a track.|

::: .TODO
__TODO__: 
Decide on whether to include media fragments in srcs; if so, `clipBegin`, `clipEnd`, and `panZoom` are not required. See <a href="https://github.com/w3c/sync-media-pub/issues/30">this issue</a>.
:::


| Term | Data type | Description |
| -----| --------- | ----------- | 
| `clipBegin`{#clipBegin}| See <a href="https://www.w3.org/publishing/epub/epub-mediaoverlays.html#app-clock-examples">clock values</a> | Start of a timed media clip | 
| `clipEnd`{#clipEnd} | See <a href="https://www.w3.org/publishing/epub/epub-mediaoverlays.html#app-clock-examples">clock values</a> | End of a timed media clip | 
| `panZoom`{#panZoom} | Ordered list of 4 values, as in SMIL3's <a data-cite="SMIL3/smil30.html#smil-extended-media-object-adef-panZoom">panZoom</a>| Rectangular portion of media object |


#### Parameters

Media objects can be rendered in many different ways, and to specify rendering details, SyncMedia uses SMIL3's <a data-cite="SMIL3/smil30.html#smil-extended-media-object-edef-param">param</a> to send parameters to media object renderers.

| Term | Data type | Description |
| -----| --------- | ------------|
| `param`{#param} | Object / element | Name/value pair sent to a media object renderer. |

The properties of `param` are:

| Term | Data type | Description |
| -----| ----------|-------------|
| `name`{#name} | `string` | Parameter name |
| `value`{#value} | `string` | Parameter value |

The following parameter `name`s are defined:

| Name | Allowed value(s) | For media type | Description | 
|------| ------|------------|-------------|
| `cssClass` | One or more strings | Media that can be styled with CSS | Indicates class name(s) to apply |
| `clipPath` | TODO | Visual media | TODO |
| `volume` | Between 0 and 1 | Audible media | Indicates the volume |
| `pan` | Between -1 (full left) and 1 (full right) | Audible media | Indicates the volume pan |
| `playbackRate` | 1.0 (normal rate), less, or more | Timed media | Indicates the playback rate. Values should align with HTML's {%raw%}{{HTMLMediaElement/playbackRate}}{%endraw%}. |
| `loop` | Empty string | Timed media | Repeat the media segment until the parent time container has completed | 
| `panZoom` | Empty string | Visual media | Transition with pan and zoom to the clipped region |


{% example "Using param to add synchronized highlighting to HTML element" %}
<body>
    <par>
        <audio src="chapter01.mp3#t=30,40"/>
        <text src="chapter01.html#heading_01">
            <param name="cssClass" value="highlight"/>
        </text>
    </par>
    <par>
        <audio src="chapter01.mp3#t=40,50"/>
        <text src="chapter01.html#para_01">
            <param name="cssClass" value="highlight"/>
        </text>
    </par>
    <par>
        <audio src="chapter01.mp3#t=50,60"/>
        <text src="chapter01.html#para_02">
            <param name="cssClass" value="highlight"/>
        </text>
    </par>
</body>
{% endexample %}


### Tracks

SyncMedia presentations can organize media objects of the same types into virtual spaces called "tracks". Tracks live in the document `head`. Tracks have several useful features:

1. A track can provide default [params](#param) that then get applied to any media object on that track. 
2. A track can be set as the default for a given media object type (e.g. all the `audio` media objects can be automatically assigned to a track).
3. A track can have a default source file for all its media objects to use, in combination with any fragment specifier on the media object itself.

All of these features help reduce verbosity as otherwise these properties would have to be explicitly stated for each media object. 

| Term | Description |
| -----| ----------- |
| `track`{#track} | A virtual space to which [=Media Objects=] can be assigned. A user agent may offer interface controls on a per-track basis (e.g. adjust volume on the narration track). A `sync:track` can have [=Media Params=], which act as defaults for [=Media Objects=] on that track.  |

#### Properties

| Term | Data type | Description |
| -----| --------- | ------------|
| `label`{#label} | `string` | The track's label |
| `defaultFile`{#defaultFile} | `URL` | Source of the default file that media objects on this track will use.|
| `defaultFor`{#defaultFor} | One of: `audio`, `image`, `video`, `text`, `ref` | Media objects of the type specified will automatically be assigned to this track. |
| `role`{#trackRole} | One of: `backgroundAudio`, `audioNarration`, `signLanguageVideo`, `contentDocument` | The role this track plays in the presentation. |

{% example "A track for an HTML document with default values and a cssClass param" %}
<head>
    <sync:track sync:label="Page" sync:defaultFor="text" 
        sync:defaultFile="chapter01.html" sync:role="contentDocument">
        <param name="cssClass" value="highlight"/>
    </sync:track>
</head>
<body>
    <par>
        <audio src="chapter01.mp3#t=30,40"/>
        <text src="#heading_01"/>
    </par>
    <par>
        <audio src="chapter01.mp3#t=40,50"/>
        <text src="#para_01"/>
    </par>
    <par>
        <audio src="chapter01.mp3#t=50,60"/>
        <text src="#para_02"/>
    </par>
</body>
{% endexample %}

{% example "Two audio tracks: one for narration (the default track for audio media objects), and one for background music."%}
<head>
    <sync:track id="background-music" sync:role="backgroundAudio">
        <param name="volume" value="0.5"/>
    </sync:track>
    <sync:track sync:label="Narration" sync:defaultFor="audio" sync:role="audioNarration"/>
    <sync:track sync:label="Page" sync:defaultFor="text" sync:role="contentDocument">
        <param name="cssClass" value="highlight"/>
    </sync:track>
</head>
<body>
    <par>
        <audio sync:track="background-music" src="bkmusic.mp3">
            <param name="loop" value=""/>
        </audio>
        <seq>
            <par>
                <audio src="chapter01.mp3#t=30,40"/>
                <text src="chapter01.html#heading_01"/>
            </par>
            <par>
                <audio src="chapter01.mp3#t=40,50"/>
                <text src="chapter01.html#para_01"/>
            </par>
            <par>
                <audio src="chapter01.mp3#t=50,60"/>
                <text src="chapter01.html#para_02"/>
            </par>
        </seq>
    </par>
</body>
{% endexample %}

The reason for including a narration `track`, even though it supplies no default values, is because it would enable a user agent to have separate controls for narration audio vs background music audio. 


### Metadata
SyncMedia has a generic mechanism for incorporating metadata but does not require or define any specific metadata. Metadata lives in the document `head`.

| Term | Description |
| -----| ----------- |
| `metadata`{#metadata} | Extension point that allows the inclusion of metadata from any metainformation structuring language |



## Playback

### Processing

Applying track defaults to media objects.. 
::: .TODO
Finish this section
:::

### Rendering

After the SyncMedia document has been processed, it is ready to be rendered.

| Object | Rendering behavior | 
|--------|--------------------|
| `body` | Render like `seq`  |
| `seq` | Render each child in order, each starting after the previous completes. |
| `par` | Render each child in parallel. |
| `text` | Display the HTML document, ensure the document segment is visible, and apply `param`s. |
| `audio` | Play the audio file or segment and apply `param`s |
| `video` | Play the video file or segment and apply `param`s |
| `image` | Load the image file or segment and apply `param`s |
| `ref` | Infer the media type and, if supported, render the file or segment, and apply `param`s |

Note about looping media {.note}

### User Interaction

::: .TODO
__TODO__: how much to cover here?
:::

* Moving through the presentation meaningfully, e.g. previous/next sentence or para
* Warning about looping media getting 'stuck' if there is no other timed media in its container (or child containers)
* Exposing controls for multitrack presentations
* Note about media with `ignoreRate`

## Encoding and Serialization

::: .TODO
__TODO__: 
Determine the MIME type(s) for SyncMedia documents. See [this issue](https://github.com/w3c/sync-media-pub/issues/10)</a>
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
                    <li><a href="#defaultFile">`sync:defaultFile`</a></li>
                    <li><a href="#defaultFor">`sync:defaultFor`</a></li>
                    <li><a href="#trackRole">`sync:role`</a></li>
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
                    <li><a href="#par">`par`</a> (0 or more)</li>
                    <li><a href="#seq">`seq`</a> (0 or more)</li>
                    <li><a href="#audio">`audio`</a> (0 or more)</li>
                    <li><a href="#image">`image`</a> (0 or more)</li>
                    <li><a href="#ref">`ref`</a> (0 or more)</li>
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
                    <li><a href="#par">`par`</a> (0 or more)</li>
                    <li><a href="#seq">`seq`</a> (0 or more)</li>
                    <li><a href="#audio">`audio`</a> (0 or more)</li>
                    <li><a href="#image">`image`</a> (0 or more)</li>
                    <li><a href="#ref">`ref`</a> (0 or more)</li>
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
                    <li><a href="#par">`par`</a> (0 or more)</li>
                    <li><a href="#seq">`seq`</a> (0 or more)</li>
                    <li><a href="#audio">`audio`</a> (0 or more)</li>
                    <li><a href="#image">`image`</a> (0 or more)</li>
                    <li><a href="#ref">`ref`</a> (0 or more)</li>
                    <li><a href="#text">`text`</a> (0 or more)</li>
                    <li><a href="#video">`video`</a> (0 or more)</li>
                </ul>
            </td>
        </tr>
        <tr>
            <td><a href="#ref">`ref`</a></td>
            <td>
                <ul>
                    <li><a href="#src">`src`</a></li>
                    <li><a href="#track">`sync:track`</a></li>
                    <li><a href="#clipBegin">`clipBegin`</a></li>
                    <li><a href="#clipEnd">`clipEnd`</a></li>
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
            <td><a href="#audio">`audio`</a></td>
            <td>
                <ul>
                    <li><a href="#src">`src`</a></li>
                    <li><a href="#track">`sync:track`</a></li>
                    <li><a href="#clipBegin">`clipBegin`</a></li>
                    <li><a href="#clipEnd">`clipEnd`</a></li>
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
            <td><a href="#text">`text`</a></td>
            <td>
                <ul>
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
                    <li><a href="#src">`src`</a></li>
                    <li><a href="#track">`sync:track`</a></li>
                    <li><a href="#clipBegin">`clipBegin`</a></li>
                    <li><a href="#clipEnd">`clipEnd`</a></li>
                    <li><a href="#panZoom">`panZoom`</a></li>
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

Much of the JSON representation of SyncMedia is a direct translation of the model described in this document. In the case of time containers and media objects, some additional properties are required

#### Time Container Object

These properties are in addition to what is already defined in [[[#time-containers]]].

| Property | Values |
|------|------------|
| `type`{#type-time-container} | One of `body`, `seq`, `par` |
| `media`{#media} | Array of <a href="#media-object">media objects</a> |

If `type` is `body` or `seq`, the array is an in-order sequence of media objects. If `type` is `par`, the order of media objects in the array does not matter.

{% example "JSON seq" %}
{
    "type": "seq",
    "media": [
        {
            "type": "audio",
            "src": "url1#frag"
        },
        {
            "type": "audio",
            "src": "url2#frag"
        }
    ]
}
{% endexample %}

#### Media Object

These properties are in addition to what is already defined in [[[#media-objects]]].

| Property | Values |
|----------|--------|
| `type`{#type-media-object} | One of `audio`, `image`, `ref`, `text`, `video` |

{% example "JSON audio media" %}
{
    "type": "audio",
    "src": "url#frag",
    ...
}
{% endexample %}

#### Shorthand

There is a shorthand for `par` objects where the media objects can exist as named properties, in cases where there is only one media object of its type in the `par`.

{% example "JSON shorthand for par" %}
{
    "audio": {"src": "url#frag"},
    "text": {"src": "url#frag"}
}
{% endexample %}

There is another shortcut that can be applied to this example, which is to consolidate the media object into a single property. This is possible when its only property is the `src`.

{% example "JSON shorthand for par and media object" %}
{
    "audio": "url#frag",
    "text": "url#frag"
}
{% endexample %}



#### Content Model

<table summary="JSON content model for SyncMedia">
    <thead><tr><th>Term</th><th>Required Value</th><th>Properties</th></tr></thead>
    <tbody>
        <tr>
            <td><a href="#head">`head`</a></td>
            <td>Object</td>
            <td>
                <ul>
                    <li><a href="#metadata">`metadata`</a></li>
                    <li><a href="#track">`tracks`</a></li>
                </ul>
            </td>
        </tr>
        <tr>
            <td><a href="#metadata">`metadata`</a></td>
            <td>Object</td>
            <td>Anything allowed</td>
        </tr>
        <tr>
            <td>`tracks`</td>
            <td>One or more objects with the given properties</td>
            <td>
                <ul>
                    <li><a href="#label">`label`</a></li>
                    <li><a href="#defaultFile">`defaultFile`</a></li>
                    <li><a href="#defaultFor">`defaultFor`</a></li>
                    <li><a href="#trackRole">`role`</a></li>
                    <li><a href="#param">`param`</a></li>
                </ul>
            </td>
        </tr>
        <tr>
            <td id="json-param"><a href="#param">`param`</a></td>
            <td>Object</td>
            <td>
                <ul>
                    <li>One or more <a href="#name">`name`</a>, e.g. `"param": {"volume": 0.5}"`</li>
                </ul>
            </td>
        </tr>
        <tr>
            <td><a href="#body">`body`</a></td>
            <td><a href="#time-container-object">Time Container Object</a></td>
            <td>
                <ul>
                    <li><a href="#type-time-container">`type`</a>: `"body"`</li>
                    <li><a href="#media">`media`</a></li>
                    <li><a href="#role">`role`</a></li>
                </ul>
            </td>
        </tr>
        <tr>
            <td><a href="#seq">`seq`</a></td>
            <td><a href="#time-container-object">Time Container Object</a></td>
            <td>
                <ul>
                    <li><a href="#type-time-container">`type`</a>: `"seq"`</li>
                    <li><a href="#media">`media`</a></li>
                    <li><a href="#role">`role`</a></li>
                </ul>
            </td>
        </tr>
        <tr>
            <td><a href="#par">`par`</a></td>
            <td><a href="#time-container-object">Time Container Object</a></td>
            <td>
                <ul>
                    <li><a href="#type-time-container">`type`</a>: `"par"`</li>
                    <li><a href="#media">`media`</a></li>
                    <li><a href="#role">`role`</a></li>
                </ul>
            </td>
        </tr>
        <tr>
            <td><a href="#ref">`ref`</a></td>
            <td><a href="#media-object">Media Object</a></td>
            <td>
                <ul>
                    <li><a href="#type-media-object">`type`</a>: `"ref"`</li>
                    <li><a href="#src">`src`</a></li>
                    <li><a href="#track">`track`</a></li>
                    <li><a href="#clipBegin">`clipBegin`</a></li>
                    <li><a href="#clipEnd">`clipEnd`</a></li>
                    <li><a href="#panZoom">`panZoom`</a></li>
                    <li><a href="#json-param">`param`</a></li>
                </ul>
            </td>
        </tr>
        <tr>
            <td><a href="#audio">`audio`</a></td>
            <td><a href="#media-object">Media Object</a></td>
            <td>
                <ul>
                    <li><a href="#type-media-object">`type`</a>: `"audio"`</li>
                    <li><a href="#src">`src`</a></li>
                    <li><a href="#track">`track`</a></li>
                    <li><a href="#clipBegin">`clipBegin`</a></li>
                    <li><a href="#clipEnd">`clipEnd`</a></li>
                    <li><a href="#json-param">`param`</a></li>
                </ul>
            </td>
        </tr>
        <tr>
            <td><a href="#image">`image`</a></td>
            <td><a href="#media-object">Media Object</a></td>
            <td>
                <ul>
                    <li><a href="#type-media-object">`type`</a>: `"image"`</li>
                    <li><a href="#src">`src`</a></li>
                    <li><a href="#track">`track`</a></li>
                    <li><a href="#panZoom">`panZoom`</a></li>
                    <li><a href="#json-param">`param`</a></li>
                </ul>
            </td>
        </tr>
        <tr>
            <td><a href="#text">`text`</a></td>
            <td><a href="#media-object">Media Object</a></td>
            <td>
                <ul>
                    <li><a href="#type-media-object">`type`</a>: `"text"`</li>
                    <li><a href="#src">`src`</a></li>
                    <li><a href="#track">`track`</a></li>
                    <li><a href="#json-param">`param`</a></li>
                </ul>
            </td>
        </tr>
        <tr>
            <td><a href="#video">`video`</a></td>
            <td><a href="#media-object">Media Object</a></td>
            <td>
                <ul>
                    <li><a href="#type-media-object">`type`</a>: `"video"`</li>
                    <li><a href="#src">`src`</a></li>
                    <li><a href="#track">`track`</a></li>
                    <li><a href="#clipBegin">`clipBegin`</a></li>
                    <li><a href="#clipEnd">`clipEnd`</a></li>
                    <li><a href="#panZoom">`panZoom`</a></li>
                    <li><a href="#json-param">`param`</a></li>
                </ul>
            </td>
        </tr>
    </tbody>
</table>


{% example "Everything spelled out" %}
{
    "head": {
        "tracks": [
            {
                "defaultFor": "text",
                "role": "contentDocument",
                "defaultFile": "file.html",
                "label": "Page",
                "params": {
                    "cssClass": "highlight"
                }
            },
            {
                "defaultFor": "audio",
                "label": "Narration",
                "defaultFile": "audio.mp3",
                "role": "audioNarration"
            }
        ]
    }, 
    "body": [
        {
            "type": "par",
            "media": [
                {"type": "audio", "src": "#t=0,5"},
                {"type": "text", "src": "#h1"}
            ]
        },
        {
            "type": "par",
            "media": [
                {"type": "audio",  "src": "#t=5,10"},
                {"type": "text", "src": "#p1"}
            ]
        },
        {
            "type": "par",
            "media": [
                {"type": "audio",  "src": "#t=10,15"},
                {"type": "text", "src": "#p2"}
            ]
        }
    ]
}
{% endexample %}

{% example "Shorthand; equivalent to the above example." %}
{
    "head": {
        "tracks": [
            {
                "defaultFor": "text",
                "role": "contentDocument",
                "label": "Page",
                "defaultFile": "file.html",
                "params": {
                    "cssClass": "highlight"
                }
            },
            {
                "defaultFor": "audio",
                "role": "audioNarration",
                "label": "Narration",
                "defaultFile": "audio.mp3"
            }
        ]
    },
    "body": [
        {
            "audio": "#t=0,5",
            "text": "#h1"
        },
        {
            "audio": "#t=5,10",
            "text": "#p1"
        },
        {
            "audio": "#t=10,15",
            "text": "#p2"
        }
    ]
}

{% endexample %}
#### Processing algorithm

::: .TODO
Finish this section
:::

* In cases where values can be an object or an array, normalize as an array
* Expand shorthand notation

## Additional Examples

### HTML document with audio narration

This is a typical example of a structured document with audio narration. It features:

* Text fragments highlighted as the audio plays.
* Semantic information:
    * There is a page number (often given in ebooks as print page equivalents), indicated via `role`. This allows Sync Media Players to offer users an option to skip page number announcements
    * The document contains a table, also indicated via `role`, allowing players to offer users an option to escape and return to the main reading flow.
* Nested highlights: When active, the table is outlined with a yellow border, and individual rows are highlighted as they are read.


#### SyncMedia presentation

##### XML version
```
<smil>
    <head>
        <sync:track sync:role="contentDocument" sync:defaultFile="file.html" 
            sync:defaultFor="text" sync:label="Page">
            <param name="cssClass" value="highlight"/>
        </sync:track>
        <sync:track sync:role="audioNarration" sync:label="Narration" 
            sync:defaultFile="audio.mp3" sync:defaultFor="audio" />
    </head>
    <body>
        <par>
            <audio src="#t=0,5"/>
            <text src="#h1"/>
        </par>
        <par>
            <audio src="#t=5,10"/>
            <text src="#p1"/>
        </par>
        <par>
            <audio src="#t=10,15"/>
            <text src="#p2"/>
        </par>
        <par sync:role="doc-pagebreak">
            <audio src="#t=15,17"/>
            <text src="#pg"/>
        </par>
        <par>
            <audio src="#t=17,20"/>
            <text src="#p3"/>
        </par>
        <par>
            <audio src="#t=20,22"/>
            <text src="#h2"/>
        </par>
        <par sync:role="table">
            <text src="#table"/>
            <seq>
                <par>
                    <audio src="#t=22,25"/>
                    <text src="#tr1">
                </par>
                <par>
                    <audio src="#t=25,30"/>
                    <text src="#tr2">
                </par>
                <par>
                    <audio src="#t=30,35"/>
                    <text src="#tr3">
                </par>
                <par>
                    <audio src="#t=35,40"/>
                    <text src="#tr4">
                </par>
            </seq>
        </par>
        <par>                  
            <audio src="#t=40,45"/>
            <text src="#p4">
        </par>
    </body>
</smil>

```
##### JSON version
```
{
    "head": {
        "tracks": [
            {
                "role": "contentDocument",
                "defaultFile": "file.html",
                "defaultFor": "text",
                "label": "Page",
                "params": {
                    "cssClass": "highlight"
                }
            },
            {
                "role": "audioNarration",
                "label": "Narration",
                "defaultFile": "audio.mp3",
                "defaultFor": "audio"
            }
        ]
    },
    "body": [
        {
            "audio": "#t=0,5",
            "text": "#h1"
        },
        {
            "audio": "#t=5,10",
            "text": "#p1"
        },
        {
            "audio": "#t=10,15",
            "text": "#p2"
        },
        {
            "role": "doc-pagebreak",
            "audio": "#t=15,17",
            "text": "#pg"
        },
        {
            "audio": "#t=17,20",
            "text": "#p3"
        },
        {    
            "audio": "#t=20,22",
            "text": "#h2"
        },
        {
            "type": "par",
            "role": "table",
            "media": [
                {
                    "type": "text",
                    "src": "#table"
                },
                {
                    "type": "seq",
                    "media": [
                        {
                            "audio": "#t=22,25",
                            "text": "#tr1"
                        },
                        {
                            "audio": "#t=25,30",
                            "text": "#tr2"     
                        },
                        {
                            "audio": "#t=30,35",
                            "text": "#tr3"
                        },
                        {
                            "audio": "#t=35,40",
                            "text": "#tr4"
                        }
                    ]
                }
            ]
        },
        {
            "audio": "#t=40,45",
            "text": "#p4"
        }
    }
}
```

#### HTML document

This is the corresponding HTML document for the above SyncMedia presentation.

```
<!DOCTYPE html>
<html>
    <head>
        <style>
            body {
                background-color: #FFE1E6;
                line-height: 2;
            }
            table {
                border-collapse: collapse;
                background-color: azure;
            }
            thead {
                background-color: navy;
                color: white;
            }
            td {
                border: thin black solid;
                padding: 0.5rem;
            }
            .highlight {
                background-color: lightyellow;
            }
            #table.highlight {
                border: thick solid yellow;
                background-color: azure;
            }
            #tr1.highlight {
                color: yellow;
                background-color: navy;
            }

        </style>
    </head>
    <body>
        <main>
            <h1 id="h1">Los Angeles, California</h1>
            <p id="p1">Anim anim ex deserunt laboris voluptate non exercitation ad consequat tempor et.</p>
            <p id="p2">Officia cillum commodo qui amet exercitation veniam.</p>
            <span id="pg4">4</span>
            <p id="p3">Aliqua mollit officia commodo nulla sunt excepteur in ex nostrud dolore dolor do in.</p>
            <h2 id="h2">Average Summer Temperatures in Los Angeles</h2>
            <table class="highlight" id="table" summary="average summer temperatures in los angeles">
                <thead>
                    <tr id="tr1" >
                        <td>Month</td>
                        <td>High</td>
                        <td>Low</td>
                    </tr>
                </thead>
                <tbody>
                    <tr id="tr2" class="highlight">
                        <td>June</td>
                        <td>79</td>
                        <td>62</td>
                    </tr>
                    <tr id="tr3">
                        <td>July</td>
                        <td>83</td>
                        <td>65</td>
                    </tr>
                    <tr id="tr4">
                        <td>August</td>
                        <td>85</td>
                        <td>66</td>
                    </tr>
                </tbody>
            </table>
            <p id="p4">Proident est veniam eu ea est culpa amet.</p>
        </main>
    </body>
</html>
```

### Audio-only presentation 

* Nested structures
* Semantics

### Presentation with secondary audio

* Sound effects
* Background music

### Video with text transcript

* Synchronized highlight for the transcript

### EPUB with separate audio overlay

* EPUB chunks referenced with CFI
* Overlay side-loaded

### SVG comic with audio narration

* Zoom in on each comic panel
