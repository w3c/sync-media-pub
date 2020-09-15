---
title: Standalone Packaging of SyncMedia
---

This document is a work in progress {.wip}

_This document was taken from [this post](https://gist.githubusercontent.com/larscwallin/30f0ce72e70162079f2d2f84e2c864cb/raw/1720348adcb3daf162210f4924d908534fef714c/sync-media-smil-explainer-text.md)_

## PACKAGING AND SIDE LOADING

A Sync Media file can be "containarized" to allow the embedding of some or all of the resources that are referenced by its *Sync Media Document*. The container format used in these cases is the OCF Zip Container (https://www.w3.org/publishing/epub3/epub-ocf.html#sec-container-zip minus EPUB specific semantics).
The OCF format has all of the features, such as encryption; signing etc,  needed for the current version as well as foreseeable future versions of Sync Media.

### Side-loaded Sync Media

One of the objectives of the Sync Media specification is to let a *Sync Media Player* add synchronized media, such as Media Overlays, to an existing resource without the need to alter the resouce. This will help the adoption of synchronized media features in the accessibility space by enabling "non-destructive" methods to adding additional modes of narration to existing media resources.
 
## OCF PACKAGE EXAMPLE

Files are represented as *cursive* 

- OCF
    - META-INF
        - *container.xml*
        - *metadata.xml*
        - *encryption.xml*
        - *etc*

    - *my-sync-comic.smil*
    - assets
        - sounds
        - text


```xml

<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
    <rootfiles>
        <rootfile full-path="my-sync-comic.smil"
            media-type="application/smil+xml" />
    </rootfiles>
</container>

```