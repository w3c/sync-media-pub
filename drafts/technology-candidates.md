---
Title: Technology Candidates
---
# SyncMedia Technology Candidates

The primary considerations when choosing a language to represent the concepts required for the [use cases](use-cases.html) were:
* __Has declarative syntax__: As opposed to a purely scripted custom solution, a declarative syntax provides a more rigid framework for content that will be played on a variety of systems, and will persist in publisher and library collections for years to come.
* __Supports nested structures__: Required for putting complex content (e.g. tables) in a subtree, out of the way of the main presentation, and offering users options for _escaping_.
* __External media references__: The media objects in a SyncMedia presentation exist on their own and do not need to be duplicated in the presentation format. They just need to be referenced.

That said, here are the candidates and how each fares regarding the requirements.

## SMIL
[SMIL3](https://www.w3.org/TR/SMIL3/) {.link}


### Pros
* Successfully used in EPUB3 Media Overlays
* Declarative syntax
* Supports nesting

### Cons
* Never was broadly adopted
* WG is no longer active to propose changes to

## Timing Object
[Timing Object](http://webtiming.github.io/timingobject/)

### Pros

* Capable of complex media synchronization

### Cons
* No declarative syntax
* Spec is incomplete

## TTML2

[TTML2](https://www.w3.org/TR/ttml2/)

### Pros

Capable of complex media synchronization

### Cons

Text lives in the same file as the timing information -- pointing to an external text document is not supported. 


## WebVTT

[WebVTT](https://www.w3.org/TR/webvtt1/)

### Pros

Browser support

### Cons
* No external text referencing
* No nested structures


## WebAnimations
[WebAnimations](https://www.w3.org/TR/web-animations-1/)

### Pros

Enables timing and playback

### Cons

No declarative syntax


## WebAnnotations

[WebAnnotations](https://www.w3.org/annotation/)

### Pros

Good range of selectors

### Cons
* No nesting
* No processing model for playback
      

## Custom

### Pros

Complete control

### Cons

Risk reinventing the wheel

## Existing language + custom extensions

### Pros
* Take advantage of what exists
* Add what's missing

### Cons
* Inherit complexity of existing language
* Risk of additions being short-sighted
