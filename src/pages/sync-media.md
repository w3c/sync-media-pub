---
title: SyncMedia Specification
---
# Introduction {#abstract}
This is an abstract model to represent synchronized text and audio presentations for the web. 

This model has been created by extending selections from SMIL with custom features. Extensions are prefixed with `sync:`. 

There is as of yet no serialization format. 


# Sync Media

## Model

### `smil` 
#### Description
Root-level container

#### Content
* [`head`](#head) (zero or 1)
* [`body`](#body) (exactly 1)


### `head`
#### Description
Information not related to temporal behavior

#### Content
* [`metadata`](#metadata) (zero or one)
* [`paramGroup`](#paramGroup) (zero or more)


### `metadata`
#### Description
Extension point that allows the inclusion of metadata from any metainformation structuring language

#### Content
Zero or more items


### `paramGroup`
#### Description
A collection of media parameters

#### Properties
* `id`: required

#### Content
* [`param`](#param) (zero or more)


### `param`
#### Description 
Allows a general parameter value to be sent to a media object renderer as a name/value pair.

#### Properties
* `name`: a single string
* `value`: a space-separated list


### `body`
#### Description
Temporal behavior of the presentation

#### Content
* [`seq`](#seq) (zero or more)
* [`par`](#par) (zero or more)


### `seq`
#### Description
A sequence of elements

#### Content
* [`seq`](#seq) (zero or more)
* [`par`](#par) (zero or more)
* [`text`](#text) (zero or more)
* [`audio`](#audio) (zero or more)

At least one `par` or `seq` is required.

#### Properties
* `sync:role`: semantic role


### `par`
#### Description
Contains media objects which are to be rendered in parallel.

#### Content
* [`seq`](#seq) (zero or more)
* [`par`](#par) (zero or more)
* [`text`](#text) (zero or more)
* [`audio`](#audio) (zero or more)

#### Properties
* `sync:role`: semantic role

### `text`
#### Description 
References an element in a markup document

#### Properties
* `paramGroup`: the ID of a paramGroup
* `src`: Location of media file, [optionally] including a [fragment selector](https://www.w3.org/TR/selectors-states/#FragmentSelector_def)

#### Content
* [`param`](#param) (zero or more)


### `audio`
#### Description 
References a clip of audio media

#### Properties
* `paramGroup`: the ID of a paramGroup
* `src`: Location of media file, [optionally] including a [media fragment selector](https://www.w3.org/TR/selectors-states/#FragmentSelector_def)


#### Content
* [`param`](#param) (zero or more)


## Playback rules

### Rendering `body`
* `body` behaves like a `seq`

### Rendering `seq`
* Render each child in order, each starting after the previous completes.

### Rendering `par`
* Render each child in parallel.

### Rendering `text` and `audio`
* Locate the segment of the referenced media and render it
* Apply `param` values from the `paramGroup` (if referenced)
* Apply `param` values local to the media object instance


## Issues

* Are there issues with using the term `role`?
* Should we specify a role vocabulary or stay agnostic? If the latter, where do authors indicate their role vocabulary?
* What should the approach be to referencing timed media in an HTML file? E.g. can you have `<ref src="file.html#video"/>` where `#video` is an HTML video element?
* How to refer to a SyncMedia file from an HTML document? How about `<link rel="alternate" type="syncmedia-mimetype-TODO" href="sync.xml">` ? This goes along with using `alternate` for [incorporating SyncMedia into a Publication Manifest](incorporating-into-pubmanifest.html).
* Would a `sync:selectorType` property help? 