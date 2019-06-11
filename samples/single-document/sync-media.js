const CSS_ACTIVE_CLASS = "-sync-media-active-element";

const ATTR_PLAYHEAD = "playhead"; // custom data- suffix does not work! :(
const ID_AUDIO = "htmlAudio";
document.addEventListener("DOMContentLoaded", () => {
    const jsonUrl = document.querySelector("[rel=sync-media]").getAttribute("href");
    fetch(jsonUrl)
        .then((res) => {
            return res.text();
        })
        .then((text) => {
            const narration = JSON.parse(text).narration;
            // console.log(JSON.stringify(narration, null, 4));
            let audioRef = undefined;
            narration.forEach((textAudioPair) => {
                if (!audioRef) {
                    audioRef = textAudioPair.audio.replace(/^(.+)#t=.+$/, "$1");
                }
                const target = document.querySelector(textAudioPair.text);
                if (target) {
                    target.setAttribute(`data-${ATTR_PLAYHEAD}`, textAudioPair.audio.replace(/^.+#t=([0-9\.]+),([0-9\.]+)$/, "$1"));
                }
            });
            const audioEl = document.createElement("audio");
            audioEl.setAttribute("id", ID_AUDIO);
            audioEl.setAttribute("controls", "");
            audioEl.setAttribute("src", `${jsonUrl}/../${audioRef}`);
            document.body.appendChild(audioEl);

            const customReader = new CustomReadAloud(
                "body",
                `#${ID_AUDIO}`,
                {
                    "highlightClass": CSS_ACTIVE_CLASS,
                    "dataAttribute": ATTR_PLAYHEAD,
                    touchTextToPlay: true,
                    stopAfterCurrent: false,
                    playbackRate: 1,
                    audioClipBegin: 0,
                    audioClipEnd: null,
                }
            );
            customReader.play();
        })
        .catch((err) => {
            console.log(err);
        });
});