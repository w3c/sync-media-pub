# Proposed "sync media" extensions for the Web Publications manifest, JSON syntax, and processing model

## Useful links

### This GitHub

https://github.com/w3c/sync-media-pub

### W3C Community Group

https://www.w3.org/community/sync-media-pub/

Mailing list: https://lists.w3.org/Archives/Public/public-sync-media-pub/

### Web Publications draft

https://w3c.github.io/wpub

## Metadata / Descriptive Properties

See https://w3c.github.io/wpub/#descriptive-properties

**ISSUE 1**: Schema.org defines the `AudioBook` type (see https://bib.schema.org/Audiobook ) as an extension of the `Book` type (see https://schema.org/Book ) which is itself a more generic `CreativeWork` (and indeed a `Thing` too). The top-level `type` JSON property of the Web Publications manifest is an array of string values, or a single string value (see https://w3c.github.io/wpub/#manifest-pub-types ). So ; in *principle* ; when the `type` property only specifies `AudioBook`, processors are expected to allow the constructs of `Book` too. In *practice* though, would it be necessary to explicitly list both types? (todo: check that prevailing JSON-LD / Schema.org implementations work correctly with type "inheritance")

For example:


```json
{
    "@context": [
        "https://schema.org",
        "https://www.w3.org/ns/wp-context"
    ],
    "type": [
        "Book",
        "Audiobook"
    ],
    ...
}
```

vs.


```json
{
    "@context": [
        "https://schema.org",
        "https://www.w3.org/ns/wp-context"
    ],
    "type": "Audiobook",
    ...
}
```

**ISSUE 1b**: Schema.org does not define a `VideoBook` type, yet we might actually end up considering extending support for synchronizing text and video in a similar fashion to text + audio (details yet to be determined). Arguably, there is a long history in the publishing world / maketplace of synchronized "full-text full-audio" publications (i.e. DAISY Digital Talking Books, and later EPUB3 Media Overlays). However there isn't a well-defined design approach for synchronizing web documents with video media (obviously, other than video subtitling / captioning, which is already covered by other specifications). Use-cases include: mapping video timestamps with a full text transcript, or aligning sign language video with a text translation (note that there are ad-hoc solutions on the web for this, but no "publishing" standard for authoring / interchange / distribution). So the question is whether this should be examined further in this initial "sync media" iteration? If not, is there a risk of technical oversight / potential roadblock that would impede a future attempt to support some form of synchronized text + video. For example, the `readBy` property described below may have a `signedBy` equivalent for sign language. The `duration` property may need to be complemented with `width` and `height` in order for reading systems / user agents to render media content appropriately. To be discussed.

### The `readBy` property

* Defined by Schema.org for the `AudioBook` type (see https://bib.schema.org/readBy and https://bib.schema.org/Audiobook )
* Already included in the Web Publications draft (see https://w3c.github.io/wpub/#creators and https://w3c.github.io/wpub/#audiobook )

```json
{
    "@context": [
        "https://schema.org",
        "https://www.w3.org/ns/wp-context"
    ],
    "type": "Audiobook",
    "author": "Somebody",
    "readBy": "Somebody Else",
    ...
}
```

### The `duration` property

* Proposed by Schema.org for the `AudioBook` type (see https://pending.schema.org/duration ), using the ISO8601 date/time syntax ( see https://en.wikipedia.org/wiki/ISO_8601 )
* Note that we propose to use the `duration` property not only as descriptive metadata for the top-level `AudioBook` type (as per Schema.org), but also as an additional property for the `PublicationLink` type (see https://w3c.github.io/wpub/#publicationLink ). More on that below. PS: the same remark applies if a future revision of the Web Publications specification replaces the ad-hoc `PublicationLink` type with Schema.org's `LinkRole` (see https://pending.schema.org/LinkRole and https://github.com/w3c/wpub/issues/235 )

**ISSUE 2**: (see https://github.com/w3c/wpub/issues/307 ) instead of ISO8601, we propose using a *much simpler* clock syntax consisting in a floating-point value / decimal fraction representing seconds and milliseconds, as per the "Normal Play Time" `npt-sec` syntax specified by RFC 2326 (see http://www.ietf.org/rfc/rfc2326.txt ). Note that this NPT syntax is also used by Media Fragments URI ("temporal dimension", see https://www.w3.org/TR/media-frags/#naming-time ), which is how "table of contents" links reference audio timestamps in an `AudioBook` publication (e.g. `#t=123.4`), and which is also how the "sync media" JSON format defines audio "clips" (i.e. begin + end timestamps, e.g. `#t=123.4,567.8`). More on that below.

```json
{
    "@context": [
        "https://schema.org",
        "https://www.w3.org/ns/wp-context"
    ],
    "type": "Audiobook",
    "duration": 123.45,
    ...
}
```

### "sync media" -specific descriptive properties

The EPUB3 Media Overlays specification defines the notion of "active CSS class" and "playing CSS class" so that authors can provide styling information to reading systems. For example, whenever an HTML element is being "narrated" (i.e. audio playback synchronized with this particular DOM fragment), the reading system injects a CSS class name into this HTML element so that the authored styles are applied dynamically for the currently-playing (aka "active") element. There is also the notion of global "playing" state, which requires reading systems to inject a CSS class on the top-level DOM node (i.e. HTML `html` element). Note that the EPUB3 specification define default CSS class names (i.e. `-epub-media-overlay-active` and `-epub-media-overlay-playing`), so authors are not actually required to specify them.

* Here we propose two descriptive properties that would provide the same functionality as EPUB3 Media Overlays: `css-class-active` and `css-class-playing`.
* We also propose to evaluate the applicability of the `:current` CSS pseudo class from CSS Selectors 4 (see https://www.w3.org/TR/selectors-4/#the-current-pseudo ). The `:past` and `:future` counterparts would provide additional semantics.

Note about "multiple synchronization granularities": this is an additional use-case, currently not supported by the EPUB3 Media Overlays specification. There will be a supplemental proposal in a separate document to detail this functionality, and to formally describe the extensions required (to this baseline proposal) in terms of descriptive properties / metadata, and with respect to the "sync media" JSON format.

**ISSUE 3**: the `readBy` and `duration` properties are applicable to the audio-book "profile" of Web Publications, and are a good match for synchronized text-audio publications too. On the other hand, there are a number of domain-specific metadata properties historically and purposefully designed for synchronized text-audio publications (EPUB3 Media Overlays, and all the way back to DAISY Digital Talking Books standards). So, can / should descriptive properties related specifically to "sync media" be grouped under a common metadata object, or should these properties be "expanded" using a common naming prefix? (to ensure that they are easily recognizable / identifiable)

For example:

```json
{
    "@context": [
        "https://schema.org",
        "https://www.w3.org/ns/wp-context"
    ],
    "type": "Audiobook",
    "sync-media": {
        "css-class-active": "-epub-media-overlay-active",
        "css-class-playing": "-epub-media-overlay-playing"
    },
    ...
```

vs.

```json
{
    "@context": [
        "https://schema.org",
        "https://www.w3.org/ns/wp-context"
    ],
    "type": "Audiobook",
    "sync-media-css-class-active": "-epub-media-overlay-active",
    "sync-media-css-class-playing": "-epub-media-overlay-playing"
    ...
```

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

**ISSUE 6** The "application/vnd.wp-sync-media+json" mime type / HTTP Content-Type is made up. It is currently used in the examples for the `encodingFormat` JSON property of the Web Publications manifest.

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
                "encodingFormat": "application/vnd.wp-sync-media+json", // See **ISSUE 6**
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
                "encodingFormat": "application/vnd.wp-sync-media+json", // See **ISSUE 6**
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
                "encodingFormat": "application/vnd.wp-sync-media+json", // See **ISSUE 6**
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
            "encodingFormat": "application/vnd.wp-sync-media+json", // See **ISSUE 6**
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
