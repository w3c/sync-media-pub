# Selection Process

This document provides an overview of the pros and cons of a range of web technologies that were considered for expressing synchronized media in [Web Publications](https://www.w3.org/TR/wpub/). Refer to the functional requirements document to see the use cases under consideration.

## Features

The following aspects were considered, ranked roughly from most to least important:
* Browser support
* Ability to point to external text
 * Text format must be HTML5
* Developer-friendly syntax
 * XML is ok; JSON is better
* Nested structure support
 * Used for skip/escape features

| Name                            | Browser support | External text | Syntax | Nesting |
|:--------------------------------|:----------------|:--------------|:-------|:--------|
| [SMIL](#smil)                   | No              | Yes           | XML    | Yes     |
| [TTML2](#ttml2)                 | No              | No            | XML    | Yes     |
| [WebVTT](#webvtt)               | Yes             | yes*          | Text   | No      |
| [WebAnimations](#webanimations) | Yes             | n/a           | n/a    | n/a     |
| [Custom](#custom)               | No              | Yes           | JSON   | Yes     |


### SMIL
[https://www.w3.org/AudioVideo/](https://www.w3.org/AudioVideo/)

While SMIL was successfully used in EPUB3 Media Overlays, it has a verbose syntax and no specific advantages that would make us keep using it.

### TTML2
[https://www.w3.org/TR/ttml2/](https://www.w3.org/TR/ttml2/)

TTML2 is capable of complex media synchronization beyond text + video. However, the text lives in the same file as the timing information -- it does not support pointing to external text documents. This makes it hard to integrate into the Web Publications environment.

### WebVTT
[https://www.w3.org/TR/webvtt1/](https://www.w3.org/TR/webvtt1/)

Theoretically, one could use WebVTT to synchronize audio with custom metadata that points to text. However, we can't leverage existing browser support - our custom metadata would not necessarily be recognized by any implementations except ours.

### WebAnimations
[https://www.w3.org/TR/web-animations-1/](https://www.w3.org/TR/web-animations-1/)

While web animations provides good timing and playback support, the lack of a declarative syntax makes it not an option.

### WebAnnotations
[https://www.w3.org/annotation/](https://www.w3.org/annotation/)

Web annotations could represent everything that we need it to, but there's no associated processing model for playback as a sequence of audio clips.

### Custom
None of the candidates above that have browser support can adequately express what we require at minimum, so we can consider creating our own format that is developer-friendly, compact, and easily supports the features we want. We can learn from [Readium2 experiments](drafts/readium2.md) in representing Media Overlays in JSON. We can also tie our work into the Audio TF work, because we really don't want audio-only vs audio + text books to be done in wildly different ways.
