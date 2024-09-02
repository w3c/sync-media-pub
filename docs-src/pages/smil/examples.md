---
title: SyncMedia Examples
---
This document is a work in progress {.wip}


## HTML document with audio narration

This is a typical example of a structured document with audio narration. It features:

* Text fragments highlighted as the audio plays.
* Semantic information:
    * There is a page number (often given in ebooks as print page equivalents), indicated via `role`. This allows Sync Media Players to offer users an option to skip page number announcements
    * The document contains a table, also indicated via `role`, allowing players to offer users an option to escape and return to the main reading flow.
* Nested highlights: When active, the table is outlined with a yellow border, and individual rows are highlighted as they are read.


### SyncMedia presentation

```
<smil>
    <head>
        <sync:track sync:trackType="contentDocument" sync:defaultSrc="file.html" 
            sync:defaultFor="text" sync:label="Page">
            <param name="cssClass" value="highlight"/>
        </sync:track>
        <sync:track sync:trackType="audioNarration" sync:label="Narration" 
            sync:defaultSrc="audio.mp3" sync:defaultFor="audio" />
    </head>
    <body>
        <par>
            <audio src="#t=0,5"/>
            <text src="#h1"/>
        </par>
        <par>
            <audio src="#t=5,10"/>
            <text src="#p1"/>
        </par>
        <par>
            <audio src="#t=10,15"/>
            <text src="#p2"/>
        </par>
        <par sync:role="doc-pagebreak">
            <audio src="#t=15,17"/>
            <text src="#pg"/>
        </par>
        <par>
            <audio src="#t=17,20"/>
            <text src="#p3"/>
        </par>
        <par>
            <audio src="#t=20,22"/>
            <text src="#h2"/>
        </par>
        <par sync:role="table">
            <text src="#table"/>
            <seq>
                <par>
                    <audio src="#t=22,25"/>
                    <text src="#tr1">
                </par>
                <par>
                    <audio src="#t=25,30"/>
                    <text src="#tr2">
                </par>
                <par>
                    <audio src="#t=30,35"/>
                    <text src="#tr3">
                </par>
                <par>
                    <audio src="#t=35,40"/>
                    <text src="#tr4">
                </par>
            </seq>
        </par>
        <par>                  
            <audio src="#t=40,45"/>
            <text src="#p4">
        </par>
    </body>
</smil>

```

### HTML document

This is the corresponding HTML document for the above SyncMedia presentation.

```
<!DOCTYPE html>
<html>
    <head>
        <style>
            body {
                background-color: #FFE1E6;
                line-height: 2;
            }
            table {
                border-collapse: collapse;
                background-color: azure;
            }
            thead {
                background-color: navy;
                color: white;
            }
            td {
                border: thin black solid;
                padding: 0.5rem;
            }
            .highlight {
                background-color: lightyellow;
            }
            #table.highlight {
                border: thick solid yellow;
                background-color: azure;
            }
            #tr1.highlight {
                color: yellow;
                background-color: navy;
            }

        </style>
    </head>
    <body>
        <main>
            <h1 id="h1">Los Angeles, California</h1>
            <p id="p1">Anim anim ex deserunt laboris voluptate non exercitation ad consequat tempor et.</p>
            <p id="p2">Officia cillum commodo qui amet exercitation veniam.</p>
            <span id="pg4">4</span>
            <p id="p3">Aliqua mollit officia commodo nulla sunt excepteur in ex nostrud dolore dolor do in.</p>
            <h2 id="h2">Average Summer Temperatures in Los Angeles</h2>
            <table class="highlight" id="table" summary="average summer temperatures in los angeles">
                <thead>
                    <tr id="tr1" >
                        <td>Month</td>
                        <td>High</td>
                        <td>Low</td>
                    </tr>
                </thead>
                <tbody>
                    <tr id="tr2" class="highlight">
                        <td>June</td>
                        <td>79</td>
                        <td>62</td>
                    </tr>
                    <tr id="tr3">
                        <td>July</td>
                        <td>83</td>
                        <td>65</td>
                    </tr>
                    <tr id="tr4">
                        <td>August</td>
                        <td>85</td>
                        <td>66</td>
                    </tr>
                </tbody>
            </table>
            <p id="p4">Proident est veniam eu ea est culpa amet.</p>
        </main>
    </body>
</html>
```

### Audio-only presentation 

* Nested structures
* Semantics

### Presentation with secondary audio

* Sound effects
* Background music

### Video with text transcript

* Synchronized highlight for the transcript

### EPUB with separate audio overlay

* EPUB chunks referenced with CFI
* Overlay side-loaded

### SVG comic with audio narration

* Zoom in on each comic panel
