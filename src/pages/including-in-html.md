---
title: Including SyncMedia in an HTML document
---
This document is a work in progress {.wip}

## Context

SyncMedia documents can be used to enhance web content, such as by adding audio narration to an HTML document. In this case, the HTML document should have a way to express that it has a SyncMedia presentation for its own content.

A SyncMedia-aware user agent can then load the presentation and invoke playback.

## Link to SyncMedia

One idea is to use the HTML `link` element and express the relationship via the `alternate` term.
`<link rel="alternate" type="syncmedia-mimetype-TODO" href="sync.xml">`

This goes along with using `alternate` for [incorporating SyncMedia into a Publication Manifest](incorporating-into-pubmanifest.html).