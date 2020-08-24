---
title: Design Principles
---
# Design Principles

## Storing and retrieving sync documents

* Package sync documents independently of the publication they correspond to (for side-loading)

## Addressibility

* Reference a position in the sync document by
    * ID
    * Media src + segment
* Reference the sync document itself by URL

## Processing requirements

* Serialization format must work with an off-the-shelf parser

