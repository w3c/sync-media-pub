# Readium2 experimentations

## Why not just continue to use SMIL?

1) XML: implementation experience of (EPUB) reading systems tells us that XML parsing in modern and older web browsers is doable, but that there are many quirks (e.g. namespace handling) and processing overhead which may be avoided by using a format like JSON.
2) Complexity: both EPUB3 Media Overlays and DAISY Talking Books (the historical format that preceded EPUB MO) use only a small subset of the SMIL standard, but the cognitive overhead (e.g. time / clock syntax) and lack of adoption in the Open Web Platform indicate that other solutions should be considered, particularly as there is now a broader choice of technologies for handling media / timing in web browsers (which wasn't the case at the time SMIL was chosen to fulfil the timing and synchronization requirements of audio / talking books).
3) Architecture: The convergence of publishing standards with the broader, distributed Open Web Platform offers an opportunity to define a system better suited for the HTTP client-server request-response design model, and the notion of URL service endpoint.

## System overview

In Readium2, EPUB3 publications are ingested and translated to an internal JSON format (structurally and semantically defined using JSON-LD) which carries information about the publication (i.e. metadata, collection of documents, resources, etc.).

In addition to exposing links to static publication assets such as images, stylesheets, etc., this central publication "manifest" also advertises URLs via which additional services can be accessed (e.g. search, indexing, pagination, etc.). These would typically be HTTP links, decorated with well-defined metadata in order to enable discovery (`rel` and `type` properties).

The Media Overlay data for the publication as a whole, or for specific documents within the publication, can be resolved using such links. The mechanism of URI Template is used to pass parameters such as the canonical path of a publication document, so that only the Media Overlay for that particular document is returned.

In other words, a client that consumes a publication for processing or rendering purposes, can issue a series of (HTTP) requests in order to incrementally access the desired data. Obviously, behind the scenes the content server may also implement "lazy loading" strategies to avoid unnecessary overheads.

Standard HTTP caching methods can be used to optimise performance, and Readium2 server implementations (aka "streamers") generate ETag headers. Side node: prefetch headers are emitted in HTTP responses so that web browsers can eagerly load commonly-used resources such as stylesheets and font faces.

## Timing and synchronisation

In Readium2, the Media Overlays format is JSON-based, just like the central "webpub manifest" (as it's internally called). A simplification from SMIL is the use of a "clock" syntax based on a decimal number  representing seconds (and fractions of a second). This time syntax is used in metadata (`duration` fields) and in URL Media Fragments (i.e. `audio.mp3#t=1.3,2.456` instead of the `clipbegin` and `clipEnd` XML attributes in SMIL files). The net benefit is that modern web browsers natively support audio and video playback using this syntax.

As in SMIL, locations within HTML documents are referenced using fragments identifiers. No change here. In fact, the very notion of "hash" (URL `#` segment) is extensible, and future revisions could add support for other audio/video/text referencing mechanisms (for example, character-level text ranges).

## Example

(truncated, for brevity)

```
{
    @context: "http://readium.org/webpub/default.jsonld",
    metadata: {
        @type: "http://schema.org/Book",
        title: "Moby-Dick",
        ...
        narrator: {
            name: "Stuart Wills"
        },
        duration: 860.5,
        media-overlay: {
            active-class: "-epub-media-overlay-active"
        }
    },
    links: [
        ...
        {
            href: "media-overlay.json?resource={path}",
            type: "application/vnd.readium.mo+json",
            templated: true,
            rel: "media-overlay"
        }
    ],
    spine: [
        ...
        {
            href: "OPS/chapter_001.xhtml",
            type: "application/xhtml+xml",
            properties: {
                media-overlay: "media-overlay.json?resource=OPS%2Fchapter_001.xhtml"
            },
            duration: 860.5
        },
        {
            href: "OPS/chapter_002.xhtml",
            type: "application/xhtml+xml",
            properties: {
                media-overlay: "media-overlay.json?resource=OPS%2Fchapter_002.xhtml"
            },
            duration: 543
        },
        ...
    ]
}
```

```
{
    media-overlay: [
        {
            role: [
                "section"
            ],
            children: [
                {
                    text: "OPS/chapter_001.xhtml",
                    role: [
                        "section",
                        "bodymatter",
                        "chapter"
                    ],
                    children: [
                        {
                            text: "OPS/chapter_001.xhtml#c01h01",
                            audio: "OPS/audio/mobydick_001_002_melville.mp4#t=24.5,29.268"
                        },
                        {
                            text: "OPS/chapter_001.xhtml#c01w00001",
                            audio: "OPS/audio/mobydick_001_002_melville.mp4#t=29.268,29.441"
                        },
                        ...
                    ]
                }
            ]
        }
    ]
}
```

## Additional information

https://github.com/readium/readium-2/tree/master/media-overlay  

https://github.com/readium/readium-2/blob/master/media-overlay/syntax.md  
