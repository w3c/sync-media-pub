# Proposed "sync media" processing model, JSON syntax, and extensions for the Web Publications manifest

Latest editors' draft of the Web Publications (WPUB) specification: https://w3c.github.io/wpub

## Metadata

(see full example below)

* `readBy`: property already included in the WPUB draft, related to the `AudioBook` type. See https://bib.schema.org/readBy and https://bib.schema.org/Audiobook **ISSUE 1**: is it okay to combine `AudioBook` in the array value of the `type` JSON property with other types such as `Book`?
* `duration`: property will (likely) be included in the WPUB draft, related to the `AudioBook` type. See https://pending.schema.org/duration and also https://w3c.github.io/wpub/#audiobook **ISSUE 2**: proposed syntax is simple floating-point value representing seconds, which diverges from ISO8601 format as defined by Schema.org for "duration", see https://github.com/w3c/wpub/issues/307
* `sync-media` specific metadata, such as `css-class-active` and `css-class-playing` (which mirror the EPUB3 Media Overlays terminology). **ISSUE 3**: should we group related metadata items under single object key, or expand to multiple properties with common name prefix? (the example in this document adopts the former notation)

## Associating (HTML) documents with their "sync media" definition

(see full example below)

Links of type `PublicationLink` in the `readingOrder` or `resources` lists (i.e. array properties of the JSON manifest) can be associated with "sync media" definitions. For example, an HTML document that represents a publication "chapter" can be associated with its own definition of synchronization points between text paragraphs and corresponding audio narrations (such "sync media" definition typically maps segments of pre-recorded audio files with DOM elements referenced via their unique identifiers). This "progressive enhancement" design is very similar to / inspired by the EPUB3 Media Overlays specification: HTML documents are mostly unaffected (at authoring stage) by the introduction of external synchronized audio narration.

### Per-document "sync media" link

* In this proposal, the `PublicationLink` object is extended to allow an additional property named `sync-media`, which value is itself a `PublicationLink` that references a "sync media" definition (i.e. the link URL resolves to a JSON representation of the EPUB3 Media Overlays SMIL format, for the particular `readingOrder` or `resources` link it is associated with).

### Using `duration` in links

The publication-wide `duration` defined in the global metadata corresponds to the duration of the entire "audio book" (here to be precise: synchronized text-audio media) assuming the "play" function is invoked and subsequently uninterrupted until the "natural" end of the text/audio stream of information, as per the publication's reading order (i.e. the `readingOrder` property of the Web Publications manifest, therfore excluding the `resources` items that may also have their own "sync media" definitions but not taking part in the default reading order).

The link-specific `duration` indicates the playback duration of an individual "sync media" link in the `readingOrder` or `resources` lists. **ISSUE 4**: should the `duration` property be placed on the HTML link instead of the "sync media" link?

### Publication-wide "sync media" link

**ISSUE 5** AT RISK redundant feature! In the Readium2 "webpub manifest" experimental implementation of EPUB3 Media Overlays (see https://github.com/w3c/sync-media-pub/blob/master/drafts/readium2.md ), this link is in fact a templated URL that enables the reading system to fetch the "sync media" definition of individual resources (i.e. HTML spine items in the reading order) by passing into the URL syntax their respective path. Alternatively, the URL template can be invoked without any specific reference to a publication document, in which case a representation of the entire publication-wide "sync media" definition is requested (i.e. aggregation of individual consecutive "chapter-level" definitions). The assumption is that this templated URL is a service endpoint in the subsystem that serves publication resources, and that the "sync media" definitions are provided "on demand", as responses to incoming HTTP requests.

* Unique `PublicationLink` object in the `links` section, discoverable via its `rel` = `https://www.w3.org/ns/wp#sync-media`. Note that link relations are defined by IANA, see https://www.iana.org/assignments/link-relations/link-relations.xhtml

## The "sync media" definition JSON format

(see full example below)

This JSON compact format is an adaptation of the EPUB3 Media Overlays SMIL syntax (see  http://www.idpf.org/epub/31/spec/epub-mediaoverlays.html ). This JSON format provides a tree representation of the synchronization points between DOM elements (HTML documents) and their associated audio fragments. Just like with the SMIL format of EPUB3 Media Overlays, the root of the tree corresponds to the body of the content document. Each tree node has a `children` property to contain one or more direct descendant(s). The `role` property encodes the type of HTML DOM element that is referenced (equivalent `epub:type` in the EPUB3 model), such as "bodymatter" or "section". The `text` property designates the targeted document and (optionally) a specific element via its unique identifier. The `audio` property is a Media Fragment URL that points to an audio resource, referenced via a begin/end couple of time values (see https://www.w3.org/TR/media-frags/#naming-time ). A `text` + `audio` "pair" in the tree is effectively the equivalent of a SMIL `par` in EPUB3 Media Overlays, whereas other instances of isolated `text` references are equivalent to the SMIL `seq` container. In this lighweight JSON syntax, the time containers are implicit.

## Examples

### Web Publications manifest JSON

```
{
    "@context": [
        "https://schema.org",
        "https://www.w3.org/ns/wp-context"
    ],
    "type": [
        "Book",
        "Audiobook"  // See **ISSUE 1**
    ],
    "url": "https://publisher.example.org/sync-media-demo",
    "name": "WP sync-media demo",
    "author": "Somebody",
    "readBy": "Somebody Else",
    "duration": 1234.5, // See **ISSUE 2**
    "sync-media": { // See **ISSUE 3**
        "css-class-active": "-epub-media-overlay-active",
        "css-class-playing": "-epub-media-overlay-playing"
    },
    "readingOrder": [
        ...
        "preface.html",
        ...
        {
            "type": "PublicationLink",
            "url": "chapter1.html",
            "encodingFormat": "text/html",
            "sync-media": {
                "type": "PublicationLink",
                "url": "sync-media/chapter1.json",
                "encodingFormat": "application/vnd.wp-sync-media+json",
                "duration": 123.4 // See **ISSUE 2** and **ISSUE 4**
            }
        },
        {
            "type": "PublicationLink",
            "url": "chapter2.html",
            "encodingFormat": "text/html",
            "sync-media": {
                "type": "PublicationLink",
                "url": "sync-media/chapter2.json",
                "encodingFormat": "application/vnd.wp-sync-media+json",
                "duration": 567.8 // See **ISSUE 2** and **ISSUE 4**
            }
        },
        ...
        "postface.html",
        ...
    ],
    "resources": [
        {
            "type": "PublicationLink",
            "url": "table-of-contents.html",
            "encodingFormat": "text/html",
            "sync-media": {
                "type": "PublicationLink",
                "url": "sync-media/table-of-contents.json",
                "encodingFormat": "application/vnd.wp-sync-media+json",
                "duration": 432.1 // See **ISSUE 2** and **ISSUE 4**
            }
        },
        {
            "type": "PublicationLink",
            "url": "sync-media/chapter1.mp3",
            "encodingFormat": "audio/mpeg",
            "duration": 123.4 // See **ISSUE 2**
        },
        {
            "type": "PublicationLink",
            "url": "sync-media/chapter2.ogg",
            "encodingFormat": "audio/ogg",
            "duration": 567.8 // See **ISSUE 2**
        },
        {
            "type": "PublicationLink",
            "url": "sync-media/table-of-contents.mp4",
            "encodingFormat": "audio/mp4",
            "duration": 87.65 // See **ISSUE 2**
        },
        ...
        "cover.jpg",
        "styles.css",
        ...
    ],
    "links": [
        {
            "type": "PublicationLink",
            "url": "sync-media/all_chapters.json",
            "encodingFormat": "application/vnd.wp-sync-media+json",
            "rel": "https://www.w3.org/ns/wp#sync-media" // See **ISSUE 5**
        },
        ...
    ]
}
```

### Sync Media definition (also serialized to a JSON format)


`sync-media/chapter1.json`:
```
{
    "text": "../chapter1.html",
    "role": [
        "bodymatter",
        "chapter"
    ],
    "children": [
        {
            "role": [
                "section"
            ],
            "children": [
                {
                    "text": "../chapter1.html#id1",
                    "audio": "chapter1.mp3#t=12.3,45.6"
                },
                {
                    "text": "../chapter1.html#id2",
                    "audio": "chapter1.mp3#t=45.6,78.9"
                }
            ]
        }
    ]
}
```

`sync-media/chapter2.json`:
```
{
    "text": "../chapter2.html",
    "role": [
        "bodymatter",
        "chapter"
    ],
    "children": [
        {
            "role": [
                "section"
            ],
            "children": [
                {
                    "text": "../chapter2.html#id1",
                    "audio": "chapter2.mp3#t=12.3,45.6"
                },
                {
                    "text": "../chapter2.html#id2",
                    "audio": "chapter2.mp3#t=45.6,78.9"
                }
            ]
        }
    ]
}
```

`sync-media/table-of-contents.json`:
```
{
    "text": "../table-of-contents.html",
    "role": [
        "bodymatter"
    ],
    "children": [
        {
            "text": "../table-of-contents.html#navig",
            "role": [
                "nav"
            ],
            "children": [
                {
                    "text": "../table-of-contents.html#id1",
                    "audio": "table-of-contents.mp3#t=12.3,45.6"
                },
                {
                    "text": "../table-of-contents.html#id2",
                    "audio": "table-of-contents.mp3#t=45.6,78.9"
                }
            ]
        }
    ]
}
```
