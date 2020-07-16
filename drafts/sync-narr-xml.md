# Synchronized Narration

* [Concepts](#concepts)
* [Example](#example)
* [Notes about SMIL](#notes-about-smil)

## Concepts

### `syncNarration` 
Root-level container. Children are:
* [`assets`](#assets) (one)
* [`sequence`](#sequence) (one)

### `assets`
Declaration of all media assets. Children are:
* [`asset`](#asset) (one or more)

### `asset`
References a single media file. 

Properties: 
* `id`: required
* `src`
* `mediaType`

Children: 
* [`property`](#property) (zero or more)

### `property`

Name-value pair specifying a parameter that affects media rendering, such as CSS class to apply or speed adjustment.

Properties:
* `name`: a single string
* `value`: a space-separated list

### `sequence`

An ordered list of playback steps.

Children: 
* [`step`](#step) (one or more)

### `step`

A collection of media nodes, to be rendered at the same time. The step is done rendering when all of its child media have finished rendering.

Children:
* [`media`](#media) (one or more)
* [`sequence`](#sequence) (zero or more)

### `media`

A segment of an asset.

Properties:
* `assetRef`: the ID of the asset
* `selector`: space-separated list of the segment(s) of the asset to render. If there is more than one segment, render them at the same time.

_Idea_: Add a `selectorType` property to [`media`](#media), which would have as its value a string expressing the type of the selector, to align with [Selectors](https://www.w3.org/TR/selectors-states/#selectors).


Children: 
* [`property`](#property) (zero or more): overrides default `asset` properties.

## Playback rules

### Rendering `syncNarration
* Starts at beginning of top-level `sequence` and renders it.

### Rendering a `sequence`
* Render the first `step`
* When that `step` is done, render the next `step`
* Proceed as such until the end is reached.

### Rendering a `step`
* Each `media` and `sequence` node is rendered in parallel

### Rendering `media`
* Render `media` by locating the `selector` of the referenced asset and displaying it or playing it
* When `media` is rendered, default and node-specific `property` values are applied, according to the [property rules](#property-rules)

### Property rules
* An `asset` may have one or more default properties
* A `media` node may override or add properties
* An overridden `property` replaces the default value for the `media` node on which it was declared
* An added `property` applies only to the `media` node on which it was declared

## Example

```
<syncNarration>
    <assets>
        <asset id="chapter" src="file.html" mediaType="text/html">
            <property name="cssClass" value="highlight"/>
        </asset>
        <asset id="narration" src="audio.mp3" mediaType="audio/mpeg"/>
    </assets>
    <sequence>
        <step>
            <media assetRef="chapter" selector="#p1"/>
            <media assetRef="narration" selector="#t=0,10"/>
        </step>
        <step>
            <media assetRef="chapter" selector="#p2"/>
            <media assetRef="narration" selector="#t=10,20"/>
        </step>
        <step role="sidebar">
            <!-- nested highlights -->
            <media assetRef="chapter" selector="#sidebar"/>
            <sequence>
                <step>
                    <media assetRef="chapter" selector="#sidebar-p1">
                        <property name="cssClass" value="outline highlight"/>
                    </media>
                    <media assetRef="narration" selector="#t=20,30"/>
                </step>
                <step>
                    <media assetRef="chapter" selector="#sidebar-p2"/>
                    <media assetRef="narration" selector="#t=30,40"/>
                </step>
            </sequence>
        </step>
    </sequence>
</syncNarration>
```

If you're curious how this would look in JSON, here is a [comparison](https://raw.githack.com/w3c/sync-media-pub/master/drafts/xml-json.html).

## Notes about SMIL

If you're familiar with [SMIL](https://www.w3.org/TR/SMIL3/), you will notice some similarities:
* [`sequence`](#sequence) and [`SMIL seq`](https://www.w3.org/TR/SMIL3/smil-timing.html#edef-seq) 
* [`step`](#step) and [`SMIL par`](https://www.w3.org/TR/SMIL3/smil-timing.html#edef-par)
* [`media`](#media) and [`SMIL ref`](https://www.w3.org/TR/SMIL3/smil-extended-media-object.html#edef-ref)
* [`property`](#property) and [`SMIL param`](https://www.w3.org/TR/SMIL3/smil-extended-media-object.html#edef-param)

It's true that SMIL thought of everything, far ahead of its time! The main arguments against using SMIL, however, are:

* Its non-intuitive names for elements
* Complicated timing models and events

[EPUB3 Media Overlays](https://www.w3.org/publishing/epub/epub-mediaoverlays.html#sec-overlays-def) solved the second objection by using a very minimal subset of SMIL3; so minimal, in fact, that it fell below the threshold of SMIL's own "most basic" profile. However, as the SMIL working group had dissolved, this was deemed to be ok.

Another way forward for us could be to build on the existing EPUB3 Media Overlays spec. Starting from that super minimal version of SMIL, we could build up to what we have here by way of the following modifications:

* Introduce `assets` and give them `params` or `paramGroups`. 
* Allow generic `ref` as a media reference
    * Allow a `ref` to reference an `asset` instead of having its own `src` to a file.
* Replace `epub:type` with `role` or some as-of-yet-not-thought-of not-loaded term.
* Use [`selectors`](https://www.w3.org/TR/selectors-states/#selectors)

Just for fun, see an [example](https://raw.githack.com/w3c/sync-media-pub/master/drafts/xml-json.html#smil) of what this could look like.

