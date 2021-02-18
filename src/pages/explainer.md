---
title: SyncMedia Explainer
---
This document is a work in progress {.wip}

[[TOC]]

## Background

The formal historical precedent for the concept of SyncMedia is the [EPUB3 Media Overlays specification](http://www.idpf.org/epub/31/spec/epub-mediaoverlays.html) (digital publications with synchronized text-audio playback).

EPUB3 Media Overlays itself can be seen as the "mainstream publishing" alternative to the [DAISY Digital Talking Book format](http://www.daisy.org/daisypedia/daisy-digital-talking-book), which is an accessible book format for people with print disabilities.

SyncMedia is the evolution of these concepts, optimized for the open web platform, and expanded to incorporate additional media types.

## Concepts

A SyncMedia presentation is a linear timeline of external media objects. The timeline is arranged into parallel and sequential groupings of media references. Groupings carry semantic inflection via a `sync:role` property.

Examples of SyncMedia use cases are:
* HTML document synchronized with audio narration
* Audio-only presentation, structured with SyncMedia to provide phrase-level navigation
* SVG synchronized with audio
* Video synchronized with a transcript

In each of these use cases, the presentation is composed of external media objects, organized into fragments, and synchronized on a timeline.

However, straight-through beginning-to-end playback is not the only way that the timeline will be consumed. Users may start in at a mid-point. They may escape out of complex structures (e.g. tables or asides). They may navigate through the presentation via an authored granularity (e.g. previous/next sentence). In addition, they may control other aspects of the presentation: lower the volume of background music, turn off sound effects, change the highlight color of text, or slow down a video. Therefore, the format must allow a standard way to expose this information to a user agent.

Just like EPUB Media Overlays, Sync Media is based on [SMIL 3.0](https://www.w3.org/TR/REC-smil/smil30.html). It is designed to offer a lossless upgrade path for existing Media Overlays documents.


## Technology Selection

See [technology candidates](technology-candidates.html) for an overview of the languages that were evaluated for suitability.

The technology selection is to __extend SMIL 3.0__ with customizations. Given the success of SMIL with EPUB Media Overlays, it makes sense to continue down this path. And given that SMIL has not had a refresh for the modern web platform, we anticipate extending it allows these gaps to be filled.

Choosing a serialization format (e.g. XML or JSON) was not part of this selection process, as the Synchronized Media for Publications CG felt [it is more desireable to define a model first](https://lists.w3.org/Archives/Public/public-sync-media-pub/2020Jul/0005.html) before deciding on one or multiple serializations.  

## Relationship to SMIL3 and EPUB Media Overlays

SyncMedia is, like EPUB3 Media Overlays, a subset of SMIL3 plus custom extensions. SyncMedia puts fewer restrictions on the use of SMIL3 than EPUB3 Media Overlays does, and, additionally, it incorporates more elements from SMIL3. The custom extensions in EPUB Media Overlays have been replaced in SyncMedia with more generic mechanisms.

The following table compares SyncMedia features with the closest point of comparison in EPUB3 Media Overlays.

| Purpose | SyncMedia feature | EPUB3 Media Overlays feature |
|---------|-------------------|-----------------------------|
| Semantics | `sync:role` plus [DPUB-ARIA](https://www.w3.org/TR/dpub-aria-1.0/), [WAI-ARIA Document Structure Roles](https://www.w3.org/TR/wai-aria/#document_structure_roles) and [landmark roles](https://www.w3.org/TR/wai-aria-1.1/#landmark_roles)   | [`epub:type`](https://www.w3.org/publishing/epub/epub-contentdocs.html#attrdef-epub-type) plus [EPUB SSV](https://idpf.github.io/epub-vocabs/structure/)|
| Nested text structures | Unrestricted use of `par` and `seq` nesting | [`epub:textref`](https://www.w3.org/publishing/epub/epub-mediaoverlays.html#attrdef-body-textref) | 
| Styling | `param` elements | Metadata in the EPUB Package Document |
| Parallel timed media, e.g. background music | Unrestricted use of `par` and `seq` nesting | None |
| Reference embedded media | Dereference src of appropriate media element (`text`, `video`, `image`, `audio`, `ref`), e.g. `<video src="page.html#vid-elem" clipBegin="0" clipEnd="3">` | Not really supported, just worked around.|

SyncMedia's custom extensions on top of its use of SMIL3 are:

| Custom extension | Type | Context | Required |
|------------------|------|---------|----------|
| List of param names | Attribute values | Param element's `name` attribute | No |
| `sync:role` | Attribute | Time container elements | No |
| `sync:track` | Element | Document head | No |
| `sync:track` | Attribute | Media elements | No |
| `sync:label` | Attribute | Track element | Yes* |
| `sync:defaultSrc` | Attribute | Track element | No |
| `sync:defaultFor` | Attribute | Track element | No |
| `sync:trackType` | Attribute | Track element | No |
| List of track types | Attribute values | Track element's `sync:trackType` attribute | No |

\* Required on the `sync:track` element; use of which is itself optional

## Features

### Navigation

### Tracks

* Features afforded by tracks
* Tracks vs SMIL regions

Application: lets user mix different tracks during playback.

### Self-contained within HTML