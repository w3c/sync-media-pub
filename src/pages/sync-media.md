---
title: SyncMedia Specification
layout: spec.njk
---
<section id="abstract">
    <p>This specification defines SyncMedia, a format for synchronized media presentations. A presentation consists of different media types orchestrated in a linear timeline. SyncMedia presentations are rendered to a user by a SyncMedia-aware player.</p>    
</section>

<section id="sotd">
</section>

# Relationship to Other Specifications

SyncMedia is an evolution of [EPUB3 Media Overlays](https://www.w3.org/publishing/epub32/epub-mediaoverlays.html) and, like Media Overlays, is built on [SMIL](https://www.w3.org/TR/SMIL3/). Compared to Media Overlays, SyncMedia incorporates additional SMIL concepts, and also includes custom extensions, prefixed with `sync:`. 

# Sync Media

## Definitions  

<dfn id="dfn-media-object" data-dfn-type="dfn">Media Object</dfn>
: A media resource in the [Sync Media Document](#dfn-sync-media-document).

<dfn id="dfn-media-param" data-dfn-type="dfn">Media Param</dfn>
:   Named parameters to communicate options to the [Media Object Renderer](#dfn-media-object-renderer)

<dfn id="dfn-media-object-renderer" data-dfn-type="dfn">Media Object Renderer</dfn>
:   A component used by the [Sync Media Player](#dfn-sync-media-player) to render [Media Objects](#dfn-media-object). Different media types may necessitate different renderers.

<dfn id="dfn-parallel-time-container" data-dfn-type="dfn">Parallel Time Container</dfn>
:   A [Time Container](#dfn-time-container) in which children are rendered in parallel.

<dfn id="dfn-role" data-dfn-type="dfn">Role</dfn>
:   Gives the semantic inflection for the item.

<dfn id="dfn-sequential-time-container" data-dfn-type="dfn">Sequential Time Container</dfn>
:   A [Time Container](#dfn-time-container) in which children are rendered in sequence.

<dfn id="dfn-sync-media-document" data-dfn-type="dfn">Sync Media Document</dfn>
:   The synchronized presentation.

<dfn id="dfn-sync-media-player" data-dfn-type="dfn">Sync Media Player</dfn>
:   A user agent that knows how to process and playback [Sync Media Documents](#dfn-sync-media-document)

<dfn id="dfn-timeline" data-dfn-type="dfn">Timeline</dfn>
:   A timeline that lays out [Time Containers](#dfn-time-container) in a linear mode.

<dfn id="dfn-time-container">Time Container</dfn>
:   Container that dictates the playback mode for its children.

<dfn id="dfn-track">Track</dfn>
:   An organizational concept that defines a purposeful virtual rendering space, not tied to a layout, with default [Media Params](#dfn-media-param).

## Model

### `smil` 
Description
:   Root-level container

Content
:   * [`head`](#head) (zero or 1)
    * [`body`](#body) (exactly 1)


### `head`
Description
:   Information not related to temporal behavior

Content
:   * [`metadata`](#metadata) (zero or one)
    * [`sync:track`](#sync-track) (zero or more)


### `metadata`
Description
:   Extension point that allows the inclusion of metadata from any metainformation structuring language

Content
:   Zero or more items


### `sync:track`{#sync-track}
Description
:   A virtual space to which [Media Objects](#dfn-media-object) can be assigned. A user agent may offer interface controls on a per-track basis (e.g. adjust volume on the narration track). A `sync:track` can have [Media Params](#dfn-media-param), which act as defaults for [Media Objects](#dfn-media-object) on that track. 

Properties
:   * `id`: required
    * `type`: the role that the track plays in the presentation. Examples could be `document`, `sound-fx`, `narration`

Content
:   * [`param`](#param) (zero or more)

<div class="TODO" id="todo-1"><h4>TODO</h4> <p>
    Should we enumerate `type` values or is there a vocabulary we could reference?
</p></div>

### `param`
Description 
:   Allows a general parameter value to be sent to a media object renderer as a name/value pair.

Properties
:   * `name`: a single string
    * `value`: a space-separated list

<div class="TODO" id="todo-10"><h4>TODO</h4><p>
List param names
</p></div>

### `body`
Description
:   Temporal behavior of the presentation

Content
:   * [`seq`](#seq) (zero or more)
    * [`par`](#par) (zero or more)


### `seq`
Description
:   A sequence of elements

Content
:   * [`seq`](#seq) (zero or more)
    * [`par`](#par) (zero or more)
    * [`ref`](#ref) (zero or more)
    * [`text`](#text) (zero or more)
    * [`audio`](#audio) (zero or more)
    * [`video`](#video) (zero or more)
    * [`image`](#image) (zero or more)

At least one `par` or `seq` is required.

Properties
:   * `sync:role`: semantic role

<div class="TODO" id="todo-3"><h4>TODO</h4> <p>Should we specify a `role` vocabulary or stay agnostic?</p></div>

### `par`
Description
:   Contains media objects which are to be rendered in parallel.

Content
:   * [`seq`](#seq) (zero or more)
    * [`par`](#par) (zero or more)
    * [`ref`](#ref) (zero or more)
    * [`text`](#text) (zero or more)
    * [`audio`](#audio) (zero or more)
    * [`video`](#video) (zero or more)
    * [`image`](#image) (zero or more)

Properties
:   * `sync:role`: semantic role


### `ref`
Description
:   Generic media reference

Properties
:   * `sync:track`: the ID of a track
    * `src`: Location of media file, optionally including a [media fragment selector](https://www.w3.org/TR/selectors-states/#FragmentSelector_def)
    * `clipBegin`: Start of a timed media clip
    * `clipEnd`: End of a timed media clip
    * `panZoom`: As defined in [SMIL3](https://www.w3.org/TR/REC-smil/smil30.html#smil-extended-media-object-adef-panZoom)


### `text`
Description 
:   Synonym for [`ref`](#ref). References an element in an HTML document

Properties
:   * `sync:track`: the ID of a [track](#dfn-sync-track)
    * `src`: Location of media file, optionally including a [fragment selector](https://www.w3.org/TR/selectors-states/#FragmentSelector_def)

Content
:   * [`param`](#param) (zero or more)

<div class="TODO" id="todo-4"><h4>TODO</h4> <p>What should the approach be to referencing timed media in an HTML file? E.g. can you have `&lt;text src="file.html#video"/&gt;` where `#video` is an HTML video element?</p></div>


### `audio`
Description 
:   References a clip of audio media

Properties
:   * `sync:track`: the ID of a track
    * `src`: Location of media file, optionally including a [media fragment selector](https://www.w3.org/TR/selectors-states/#FragmentSelector_def)
    * `clipBegin`: Start of the audio media clip
    * `clipEnd`: End of the audio media clip

Content
:   * [`param`](#param) (zero or more)

<div class="TODO" id="todo-2"><h4>TODO</h4> <p>Decide what happens if both media fragment and clipBegin/End are given.</p></div>


### `video`
Description
:   References a clip of video media

Properties
:   * `sync:track`: the ID of a track
    * `src`: Location of media file, optionally including a [media fragment selector](https://www.w3.org/TR/selectors-states/#FragmentSelector_def)
    * `clipBegin`: Start of a timed media clip
    * `clipEnd`: End of a timed media clip
    * `panZoom`: As defined in [SMIL3](https://www.w3.org/TR/REC-smil/smil30.html#smil-extended-media-object-adef-panZoom)
    

### `image`
Description
:   References image media

Properties
:   * `sync:track`: the ID of a track
    * `src`: Location of media file, optionally including a [media fragment selector](https://www.w3.org/TR/selectors-states/#FragmentSelector_def)
    * `panZoom`: As defined in [SMIL3](https://www.w3.org/TR/REC-smil/smil30.html#smil-extended-media-object-adef-panZoom)

## Playback rules

### Rendering `body`
* `body` behaves like a `seq`

### Rendering `seq`
* Render each child in order, each starting after the previous completes.

### Rendering `par`
* Render each child in parallel.

### Rendering Media Objects
_`text`, `audio`, `video`, `image`, and `ref`_
* Locate the segment of the referenced media and render it
* Apply `param` values from the `sync:track` (if referenced)
* Apply `param` values local to the media object instance

## Encoding and File Formats

<div class="TODO"><p>The MIME type of SyncMedia documents is TBD.</p></div>

The examples below are shown as XML; however, it is still an open question which serialization format(s) SyncMedia documents may be expressed as.

# Examples

## HTML document with audio narration

This is a typical example of a structured document with audio narration. It features:

* Text fragments highlighted as the audio plays.
* Semantic information:
    * There is a page number (often given in ebooks as print page equivalents), indicated via `role`. This allows Sync Media Players to offer users an option to skip page number announcements
    * The document contains a table, also indicated via `role`, allowing players to offer users an option to escape and return to the main reading flow.
* Nested highlights: When active, the table is outlined with a yellow border, and individual rows are highlighted as they are read.


### SyncMedia presentation
```
<smil>
    <head>
        <sync:track id="doc" type="document">
            <param name="cssClass" value="highlight"/>
        </sync:track>
    </head>
    <body>
        <par>
            <audio src="audio.mp3#t=0,5"/>
            <text src="file.html#h1" sync:track="doc"/>
        </par>
        <par>
            <audio src="audio.mp3#t=5,10"/>
            <text src="file.html#p1" sync:track="doc"/>
        </par>
        <par>
            <audio src="audio.mp3#t=10,15"/>
            <text src="file.html#p2" sync:track="doc"/>
        </par>
        <par sync:role="page">
            <audio src="audio.mp3#t=15,17"/>
            <text src="file.html#pg" sync:track="doc"/>
        </par>
        <par>
            <audio src="audio.mp3#t=17,20"/>
            <text src="file.html#p3" sync:track="doc"/>
        </par>
        <par>
            <audio src="audio.mp3#t=20,22"/>
            <text src="file.html#h2" sync:track="doc"/>
        </par>
        <par sync:role="table">
            <text src="file.html#table" sync:track="doc"/>
            <seq>
                <par>
                    <audio src="audio.mp3#t=22,25"/>
                    <text src="file.html#tr1">
                </par>
                <par>
                    <audio src="audio.mp3#t=25,30"/>
                    <text src="file.html#tr2">
                </par>
                <par>
                    <audio src="audio.mp3#t=30,35"/>
                    <text src="file.html#tr3">
                </par>
                <par>
                    <audio src="audio.mp3#t=35,40"/>
                    <text src="file.html#tr4">
                </par>
            </seq>
        </par>
        <par>                  
            <audio src="audio.mp3#t=40,45"/>
            <text src="file.html#p4">
        </par>
    </body>
</smil>

```

### HTML document

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
            <span id="pg">4</span>
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

## Audio-only presentation 

* Nested structures
* Semantics

## Presentation with secondary audio

* Sound effects
* Background music

## Video with text transcript

* Synchronized highlight for the transcript

## EPUB with separate audio overlay

* EPUB chunks referenced with CFI
* Overlay side-loaded

## SVG comic with audio narration

* Zoom in on each comic panel
