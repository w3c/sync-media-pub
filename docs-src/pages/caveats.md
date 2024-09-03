---
title: SyncMediaLite caveats
---

# Caveats when going from EPUB Media Overlays to SyncMediaLite

When adopting a more modern synchronization strategy, as described in [SyncMediaLite](sync-media-lite), some adaptation is required. It may be that existing `.smil` files have to be transformed into `.vtt` files before being distributed to a system that expects `.vtt`. Or the user agent may be loading `.smil` files and internally transforming them to `TextTrackCues` so as to avoid writing a SMIL engine.

In any case where EPUB Media Overlays need to be transformed to work in a WebVTT-based playback scenario, there are some differences to be aware of.

## Multiple audio files. 

It's theoretically permitted in EPUB Media Overlays to have sync points in the same file referencing different audio files (in practice this isn't seen). 

## Non-contiguous audio segments.

Say we have an audio file of someone saying "Three one two". Our HTML text, though, says "1 2 3". Theoretically, SMIL can handle this, though it's worth mentioning that this type of content is not commonly found:

{% example "SMIL markup of non-contiguous audio segments" %}
<par>
    <audio src="audio.mp3" clipBegin="1s" clipEnd="2s"/>
    <text src="file.html#one"/>
</par>
<par>
    <audio src="audio.mp3" clipBegin="2s" clipEnd="3s"/>
    <text src="file.html#two"/>
</par>
<par>
    <audio src="audio.mp3" clipBegin="0s" clipEnd="1s"/>
    <text src="file.html#three"/>
</par>
{% endexample %}

You would see the highlight and audio start with "1" and proceed to "2", then "3", since each `<par>` indicates what portion of audio to render.

Now if you try to represent this in WebVTT, you would get:

{% example "WebVTT version" %}
10
00:00:01.000 --> 00:00:02.000
{"selector":{"type": "FragmentSelector", "value": "one"}}

20
00:00:02.000 --> 00:00:03.000
{"selector":{"type": "FragmentSelector", "value": "two"}}

30
00:00:00.000 --> 00:00:01.000
{"selector":{"type": "FragmentSelector", "value": "three"}}

{% endexample %}

But you would hear and see highlighted "3", followed by "1", then "2", since the audio playback is only based on the audio file, from start to end. 

## Solutions

In both cases, resolving the difference requires either additional special handling by the user agent, or audio file reformulation by the producer.
