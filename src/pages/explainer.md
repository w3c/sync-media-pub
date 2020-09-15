---
title: SyncMedia Explainer
---
## Background

The formal historical precedent for the concept of SyncMedia is the [EPUB3 Media Overlays specification](http://www.idpf.org/epub/31/spec/epub-mediaoverlays.html) (digital publications with synchronized text-audio playback).

EPUB3 Media Overlays itself can be seen as the "mainstream publishing" alternative to the [DAISY Digital Talking Book format](http://www.daisy.org/daisypedia/daisy-digital-talking-book), which is an accessible book format for people with print disabilities.

SyncMedia is the evolution of these concepts, optimized for the open web platform, and expanded to incorporate additional media types.

## Concepts

A SyncMedia presentation is a linear timeline of external media objects. The timeline is arranged into parallel and sequential groupings of media references. Groupings carry semantic inflection via a `sync:role` property.

Examples of SyncMedia use cases are:
* HTML document synchronized with audio narration
* Audio-only presentation, structured with SyncMedia to provide sentence-level previous/next controls
* SVG synchronized with audio
* Video synchronized with a transcript

In each of these use cases, the presentation is composed of external media objects, organized into fragments, and synchronized on a timeline.

However, straight-through beginning-to-end playback is not the only way that the timeline will be consumed. Users may start in at a mid-point. They may escape out of complex structures (e.g. tables or asides). They may navigate through the presentation via an authored granularity (e.g. previous/next sentence). In addition, they may control other aspects of the presentation: lower the volume of background music, turn off sound effects, change the highlight color of text, or slow down a video. Therefore, the format must allow a standard way to expose this information to a user agent.

Just like EPUB Media Overlays, Sync Media is based on [SMIL 3.0](https://www.w3.org/TR/REC-smil/smil30.html). It is designed to offer a lossless upgrade path for existing Media Overlays documents.

## Technology Candidates

The primary considerations when choosing a language to represent the concepts required for the [use cases](use-cases.html) were:
* __Has declarative syntax__: As opposed to a purely scripted custom solution, a declarative syntax provides a more rigid framework for content that will be played on a variety of systems, and will persist in publisher and library collections for years to come.
* __Supports nested structures__: Required for putting complex content (e.g. tables) in a subtree, out of the way of the main presentation, and offering users options for _escaping_.
* __External media references__: The media objects in a SyncMedia presentation exist on their own and do not need to be duplicated in the presentation format. They just need to be referenced.

That said, here are the candidates and how each fares regarding the requirements.

### SMIL
[SMIL3](https://www.w3.org/TR/SMIL3/) {.link}


#### Pros
* Successfully used in EPUB3 Media Overlays
* Declarative syntax
* Supports nesting

#### Cons
* Never was broadly adopted
* WG is no longer active to propose changes to
        

### TTML2

[TTML2](https://www.w3.org/TR/ttml2/)

#### Pros

Capable of complex media synchronization

#### Cons

Text lives in the same file as the timing information -- pointing to an external text document is not supported. 


### WebVTT

[WebVTT](https://www.w3.org/TR/webvtt1/)

#### Pros

Browser support

#### Cons
* No external text referencing
* No nested structures


### WebAnimations
[WebAnimations](https://www.w3.org/TR/web-animations-1/)

#### Pros

Enables timing and playback

#### Cons

No declarative syntax


### WebAnnotations

[WebAnnotations](https://www.w3.org/annotation/)

#### Pros

Good range of selectors

#### Cons
* No nesting
* No processing model for playback
      

### Custom

#### Pros

Complete control

#### Cons

Risk reinventing the wheel

### Existing language + custom extensions

#### Pros
* Take advantage of what exists
* Add what's missing

#### Cons
* Inherit complexity of existing language
* Risk of additions being short-sighted

## Technology Selection

The final conclusion is to __create a custom specification that draws heavily on SMIL 3.0__. Given the success of SMIL with EPUB Media Overlays, it makes sense to continue down this path. And given that SMIL has not had a refresh for the modern web platform, we anticipate extending it with some customizations to fill these gaps.

Choosing a serialization format (e.g. XML or JSON) was not part of this selection process, as the Synchronized Media for Publications CG felt [it is more desireable to define a model first](https://lists.w3.org/Archives/Public/public-sync-media-pub/2020Jul/0005.html) before deciding on one or multiple serializations.  