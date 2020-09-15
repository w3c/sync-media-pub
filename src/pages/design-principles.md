---
title: Design Principles
---
## Storing and retrieving sync documents

* Package sync documents independently of the publication they correspond to (for side-loading)

## Addressibility

* Reference a position in the sync document by
    * ID
    * Other selector? 
* Reference the sync document itself by URL

## Processing requirements

* Serialization format(s) must work with off-the-shelf parsers

