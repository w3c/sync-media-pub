async function fetchFile(file) {
    let data = await fetch(file);
    let text = await data.text();
    return text;
}

function isImage(encodingFormat) {
    return [
        'image/jpeg',
        'image/png',
        'image/svg+xml',
        'image/gif'
    ].includes(encodingFormat);
}

function isAudio(encodingFormat) {
    return [
        'audio/mpeg',
        'audio/ogg',
        'audio/mp-4'
    ].includes(encodingFormat);
}
function isText() {
    return true;
}
function isInViewport(elm, doc) {
    let bounding = elm.getBoundingClientRect();
    return (
        bounding.top >= 0 &&
        bounding.left >= 0 &&
        bounding.bottom <= (doc.defaultView.innerHeight || doc.documentElement.clientHeight) &&
        bounding.right <= (doc.defaultView.innerWidth || doc.documentElement.clientWidth)
    );
}
const secondsToHms = seconds => moment.utc(seconds * 1000).format('HH:mm:ss');

export { fetchFile, isImage, isAudio, isText, isInViewport, secondsToHms };