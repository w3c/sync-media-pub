# "sync media" for web documents, technical proposal

## Background information

### Synchronized text+audio playback, "talking" books

The formal historical precedent for the concept of "sync media" is the EPUB3 Media Overlays specification (digital publications with synchronized text-audio playback):
http://www.idpf.org/epub/31/spec/epub-mediaoverlays.html

EPUB3 Media Overlays itself can be seen as the "mainstream publishing" alternative to the DAISY Digital Talking Book format, which serves the accessibility community more specifically:
http://www.daisy.org/daisypedia/daisy-digital-talking-book

### Synchronized playback in Web Publications

The W3C Publishing Working Group is now undertaking the creation of "Web Publications" standard that borrows some of the key concepts from EPUB:
https://w3c.github.io/wpub

In this context, a Community Group has been formed to explore potential definitions of "sync media" for Web Publications:
https://www.w3.org/community/sync-media-pub/

In a nutshell, the proposal under consideration is a "progressive enhancement" ; very much in lineage of EPUB3 Media Overlays ; which adds playback functionality (e.g. audio clips synchronized with text highlights) over the reading order of a publication (i.e. the ordered collection of HTML files also known as "spine" in the EPUB world). Playback can be uninterrupted from beginning to end, paused/resumed, started at any arbitrary location using regular navigation affordances (e.g. the table of contents), etc. (more information in the "requirements" document)

### Synchronization overlay for Web documents

The use-case for synchronized text-audio playback emerged for digital publications, where a "superstructure" defines how multiple HTML documents are aggregated together into a coherent publication unit. However, it is evident that "synchronized playback" functionality can be applied to individual Web documents, irrespective of this "superstructure".

The technical proposal herein aims to define "sync media" for the Web, in isolation from Web Publications. A separate proposal (TODO: link) covers the specific integration requirements of Web Publications.

## Metadata

### The `readBy` property

* Defined by Schema.org for the `AudioBook` type (see https://bib.schema.org/readBy and https://bib.schema.org/Audiobook )
* Already included in the Web Publications draft (see https://w3c.github.io/wpub/#creators and https://w3c.github.io/wpub/#audiobook )

Microdata:

```html
<head itemscope itemtype="https://bib.schema.org/Audiobook">
  <meta itemprop="readBy" content="Somebody">
</head>
```

### The `duration` property

* Proposed by Schema.org for the `AudioBook` type (see https://pending.schema.org/duration ), using the ISO8601 date/time syntax ( see https://en.wikipedia.org/wiki/ISO_8601 )
* Instead of ISO8601, we propose (see https://github.com/w3c/wpub/issues/307 ) using a *much simpler* clock syntax consisting in a floating-point value / decimal fraction representing seconds and milliseconds, as per the "Normal Play Time" `npt-sec` syntax specified by RFC 2326 (see http://www.ietf.org/rfc/rfc2326.txt ). Note that this NPT syntax is also used by Media Fragments URI ("temporal dimension", see https://www.w3.org/TR/media-frags/#naming-time ), which is how "table of contents" links reference audio timestamps in an `AudioBook` publication (e.g. `#t=123.4`), and which is also how the "sync media" overlay / JSON format defines audio "clips" (i.e. begin + end timestamps, e.g. `#t=123.4,567.8`). More on that below.

Microdata:

```html
<head itemscope itemtype="https://bib.schema.org/Audiobook">
  <meta itemprop="duration" content="123.45">
</head>
```

### Playback styling properties

The EPUB3 Media Overlays specification defines the notion of "active CSS class" and "playing CSS class" so that authors can provide styling information to reading systems. For example, whenever an HTML element is being "narrated" (i.e. audio playback synchronized with this particular DOM fragment), the reading system injects a CSS class name into this HTML element so that the authored styles are applied dynamically for the currently-playing (aka "active") element. There is also the notion of global "playing" state, which requires reading systems to inject a CSS class on the top-level DOM node (i.e. HTML `html` element). Note that the EPUB3 specification defines default CSS class names (i.e. `-epub-media-overlay-active` and `-epub-media-overlay-playing`), so authors are not actually required to specify them.

* Here we propose two descriptive properties that would provide the same functionality as EPUB3 Media Overlays: `css-class-active` and `css-class-playing`.
* We also propose to evaluate the applicability of the `:current` CSS pseudo class from CSS Selectors 4 (see https://www.w3.org/TR/selectors-4/#the-current-pseudo ). The `:past` and `:future` counterparts would provide additional semantics.

Custom metadata names:

```html
<head>
  <meta name="sync-media-css-class-active" content="-epub-media-overlay-active">
  <meta name="sync-media-css-class-playing" content="-epub-media-overlay-playing">
</head>
```

## The "sync media" overlay link

```html
<head>
  <link
    rel="sync-media"
    href="sync-media/index.json"
    type="application/vnd.wp-sync-media+json">
</head>
```

Note that the `application/vnd.wp-sync-media+json` mime / media type (typically for the HTTP Content-Type header) used in the `encodingFormat` JSON property does not formally exist. Such value would need to be proposed for IANA registration (see https://www.iana.org/assignments/media-types/media-types.xhtml ). To be discussed.

## The "sync media" JSON format

* The proposed JSON format is a compact adaptation of the EPUB3 Media Overlays SMIL syntax (see  http://www.idpf.org/epub/31/spec/epub-mediaoverlays.html ).
* This provides a tree representation of the synchronization points, i.e. mapping between DOM elements (HTML documents) and their associated audio fragments.
* Just like with the SMIL format of EPUB3 Media Overlays, the root of the tree corresponds to the body of the content document.
* Each tree node has an optional `children` property to contain one or more direct descendant(s), providing a "mirror" structural image of the HTML document to synchronize with.
* The `role` property of a node encodes additional information about the type of HTML DOM element that is referenced (equivalent `epub:type` in the EPUB3 model), such as "bodymatter" or "section". To be discussed: what default vocabulary, what possible extensions, and what reading system affordances / behaviours (for example, well-defined skippability and escapability semantics, hints for multiple synchronization granularities, etc.).
* The `text` property is a URL "fragment" which is typically a unique identifier that references a document element (e.g. `#section2.3`), but this can also be based on another "fragment" syntax such as EPUB CFI (e.g. for referencing a range of characters within the targeted HTML document, for instance `#doc-cfi(/4[body_1]/10[paragraph_5],/2/1:1,/3:4)`, see https://www.idpf.org/epub/linking/cfi/epub-cfi.html ).
* The `audio` property is a Media Fragment URL that points to an audio resource, referenced via a begin/end tuple of time values, such as `audio.mp3#t=123.45,678.9` (see https://www.w3.org/TR/media-frags/#naming-time ).
* A `text` + `audio` "pair" in the tree is effectively the equivalent of a SMIL `par` in EPUB3 Media Overlays, whereas other instances of isolated `text` references are equivalent to the SMIL `seq` container. In this lighweight JSON syntax, the time containers are implicit, and can be inferred by the presence of `text` and `audio` properties.

Example:

`sync-media/index.json` (referenced from `index.html`):

```
{
    "text": "#body",
    "role": [
        "bodymatter",
        "chapter"
    ],
    "children": [
        {
            "text": "#section1",
            "role": [
                "section"
            ],
            "children": [
                {
                    "text": "#id1",
                    "audio": "audio.mp3#t=12.3,45.6"
                },
                {
                    "text": "#id2",
                    "audio": "audio.mp3#t=45.6,78.9"
                },
                "..."
            ]
        }
    ]
}
```
