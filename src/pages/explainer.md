---
title: SyncMedia Explainer
---
This document is a work in progress {.wip}

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


## Technology Selection

See [technology candidates](technology-candidates.html) for an overview of the languages that were evaluated for suitability.

The technology selection is to __extend SMIL 3.0__ with customizations. Given the success of SMIL with EPUB Media Overlays, it makes sense to continue down this path. And given that SMIL has not had a refresh for the modern web platform, we anticipate extending it allows these gaps to be filled.

Choosing a serialization format (e.g. XML or JSON) was not part of this selection process, as the Synchronized Media for Publications CG felt [it is more desireable to define a model first](https://lists.w3.org/Archives/Public/public-sync-media-pub/2020Jul/0005.html) before deciding on one or multiple serializations.  

## Features

### Navigation

### Tracks

* Features afforded by tracks
* Tracks vs SMIL regions

### Self-contained within HTML