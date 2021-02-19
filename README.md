# Synchronized Multimedia for Publications Community Group

This is the repository for ongoing work done by the [W3C Synchronized Multimedia for Publications Community Group](https://www.w3.org/community/sync-media-pub/).

The task of the CG is to explore and develop media synchronization techniques compatible with publishing formats on the web, including [Audiobooks](https://www.w3.org/TR/audiobooks/), [EPUB](https://www.w3.org/publishing/groups/epub-wg/), and standalone [HTML](https://www.w3.org/html/).

## What's currently available

* [Documents](https://w3c.github.io/sync-media-pub)
* [Visualizer demo](https://w3c.github.io/sync-media-pub/demo/visualizer)

## Repository structure

* `demo-src`: source code for demos
    * `player`: WIP user agent implementation. early stages. launch with `npm run dev`.
    * `synclib`: sync media file parser. creates a timegraph from a sync media xml file. Build with `build.sh`.
    * `visualizer`: uses `synclib` to create a visual representation of the timegraph.
* `docs`: what gets served at w3c.github.io/sync-media-pub (not the best directory name but it's what github requires)
* `docs-src`: source for the specification and related documents. Edit as markdown, build with `npm run build`. 
* `drafts`: old documents and stray ideas