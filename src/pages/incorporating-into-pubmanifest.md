---
title: Incorporating SyncMedia into a Publication Manifest
---

## Publication Manifest

[Publication Manifest](https://www.w3.org/TR/pub-manifest/) is a W3C specification which defines a manifest format for a digital publication. The resources of a publication are listed in the default reading order, the resources list, or the links list of the manifest. To incorporate SyncMedia into a Publication Manifest, a reference to a SyncMedia document is added to the manifest entry for the corresponding resource.

## Alternate

A Publication Manifest resource has the object type `LinkedResource`. A `LinkedResource` has an `alternate` property, the purpose of which is to specify one or more reformulation(s) of the resource in alternative formats. Note that the reformulation itself is a `LinkedResource`, too.

A SyncMedia document may use the following `LinkedResource` properties:

* `duration`: as in [Audiobooks](https://w3c.github.io/audiobooks/index.html#audio-duration)
* `encodingFormat`: [application/vnd.syncmedia+TODO](sync-media.html#mimetype)</li>
* `readBy`: as in [Audiobooks](https://w3c.github.io/audiobooks/#audio-creators)
* `url`: as in [Publication Manifest](https://www.w3.org/TR/pub-manifest/#address)

## Example

[Audiobooks](https://www.w3.org/TR/audiobooks/) contain a Publication Manifest and therefore can associate Sync Media in the manner described above.

Example of a SyncMedia `alternate` for an Audiobook chapter:

```
"readingOrder": [
    {
        "type": "LinkedResource",
        "url": "html/chapter-one.mp3",
        "encodingFormat": "audio/mpeg",
        "alternate": {
            "type": "LinkedResource",
            "url": "chapter-one-narration.TODO",
            "encodingFormat": "application/vnd.syncmedia+TODO",
            "duration": "10000s"
        }
    },
    ...
]
```