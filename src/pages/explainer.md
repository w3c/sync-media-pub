# Explainer

## Background

The formal historical precedent for the concept of SyncMedia is the [EPUB3 Media Overlays specification](http://www.idpf.org/epub/31/spec/epub-mediaoverlays.html) (digital publications with synchronized text-audio playback).

EPUB3 Media Overlays itself can be seen as the "mainstream publishing" alternative to the [DAISY Digital Talking Book format](http://www.daisy.org/daisypedia/daisy-digital-talking-book), which is an accessible book format for people with print disabilities.</p>

SyncMedia is the evolution of these concepts, optimized for the open web platform.


## Technology selection

Explains the candidates and considerations for each.

### SMIL

[SMIL3](https://www.w3.org/TR/SMIL3/)


#### Pros

Successfully used in EPUB3 Media Overlays
Declarative syntax
Supports nesting

#### Cons

Verbose syntax
WG is no longer active to propose changes to
        

### TTML2

[TTML2](https://www.w3.org/TR/ttml2/)

#### Pros
Capable of complex media synchronization

#### Cons
Text lives in the same file as the timing information -- pointing to an external text document is not supported. 
It is possible to use custom metadata or hack ID values to insert a reference, but this still means no out of the box support for what we need. 


### WebVTT

[WebVTT](https://www.w3.org/TR/webvtt1/)

#### Pros
Browser support

#### Cons
No external text referencing
No nested structures


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
No nesting
No processing model for playback
      
### Custom

#### Pros
Complete control

#### Cons
Risk reinventing the wheel

### Customized version of existing language

#### Pros
Take advantage of what exists
Add what's missing

#### Cons
Risk of seeming hacky

