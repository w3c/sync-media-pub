// PROD
import { SyncMedia } from '../../build/synclib.js';
// DEV
// import { SyncMedia } from '../../src/index.js';

const expect = chai.expect;
let resolve = filename => new URL(filename, document.baseURI);

describe(`syncmedia-js tests`, function() {
    
    describe('Parses a simple xml file', function () {
        let filename = resolve('files/standalone/simple.xml');
        it(`Returns a model with the right number of children for <body>`, async function() {
            let syncMedia = new SyncMedia();
            await syncMedia.loadUrl(filename);
            let syncModel = syncMedia.model;
            expect(syncModel).to.not.be.empty;
            expect(syncModel.body).to.not.be.null;
            expect(syncModel.body.media.length).to.equal(3);
        });
        it(`Resolves srcs`, async function() {
            let syncMedia = new SyncMedia();
            await syncMedia.loadUrl(filename);
            let syncModel = syncMedia.model;
            let syncMediaUrl = new URL(filename, document.location.href);
            let url = new URL("chapter01.mp3", syncMediaUrl.href);
            expect(syncModel.body.media[0].media[0].src.href).to.equal(url.href);
        });
    });

    describe('Parses a simple xml file with tracks', function () {
        let filename = resolve('files/standalone/simple-plus-tracks.xml');
        it(`Returns a model with the right number of tracks`, async function() {
            let syncMedia = new SyncMedia();
            await syncMedia.loadUrl(filename);
            let syncModel = syncMedia.model;
            expect(syncModel).to.not.be.empty;
            expect(syncModel.head.tracks.length).to.equal(2);
            expect(syncModel.head.tracks[0]).to.not.be.undefined;
        });
        it (`Processes track information for media objects`, async function() {
            let syncMedia = new SyncMedia();
            await syncMedia.loadUrl(filename);
            let syncModel = syncMedia.model;
            expect(syncModel.body.media[0].media[0].track instanceof Object).to.be.true;
            expect(syncModel.body.media[0].media[0].src.pathname).to.equal('/synclib/tests/files/standalone/chapter01.mp3');
        });
        it(`Gives parents to time container and media nodes`, async function() {
            let syncMedia = new SyncMedia();
            await syncMedia.loadUrl(filename);
            let syncModel = syncMedia.model;
            expect(syncModel.body.media[0].hasOwnProperty('parent')).to.be.true;
            expect(syncModel.body.media[2].hasOwnProperty('parent')).to.be.true;
            expect(syncModel.body.media[0].media[0].hasOwnProperty('parent')).to.be.true;
        });
    });

    describe('Assigns internal IDs', function() {
        let filename = resolve('files/standalone/simple-plus-tracks.xml');
        it(`Returns a model with an _id property on all objects`, async function() {
            let syncMedia = new SyncMedia();
            await syncMedia.loadUrl(filename);
            let syncModel = syncMedia.model;
            // spot check a few places for _id
            expect(syncModel._id).to.not.be.undefined;
            expect(syncModel.body.media[0]._id).to.not.be.undefined;
            expect(syncModel.body.media[1].media[1]._id).to.not.be.undefined;
            expect(syncModel.head.tracks[1]._id).to.not.be.undefined;
        });
    });

    describe('Removes null properties', function() {
        let filename = resolve('files/standalone/simple-plus-tracks.xml');
        it(`Does not leave an empty array for role`, async function() {
            let syncMedia = new SyncMedia();
            await syncMedia.loadUrl(filename);
            let syncModel = syncMedia.model;
            expect(syncModel.body.media[0].hasOwnProperty('roles')).to.be.false;
            expect(syncModel.body.hasOwnProperty('roles')).to.be.false;
        });
    });
    describe('Reads a file with some empty time containers', function() {
        let filename = resolve('files/standalone/partial-no-media.xml');
        it("Creates a model without the empty time containers", async function() {
            let syncMedia = new SyncMedia();
            await syncMedia.loadUrl(filename);
            expect (syncMedia.model).to.not.be.null;
            expect (syncMedia.model.body.media.length).to.equal(1);
        });
    })
    describe(`Reads a file with no media objects`, function() {
        let filename = resolve('files/standalone/no-media.xml');
        it(`Raises an error`, async function() {
            let syncMedia = new SyncMedia();
            await syncMedia.loadUrl(filename);
            let errors = syncMedia.errors;
            expect(errors.length).to.not.equal(0);
        });
    });

    describe("Collects role data", function() {
        let filename = resolve('files/standalone/roles.xml');
        it(`Lists 4 roles`, async function() {
            let syncMedia = new SyncMedia();
            await syncMedia.loadUrl(filename);
            let roles = syncMedia.roles;
            expect(roles.length).to.equal(4);
        });
    });

    describe("Simple timegraph", function() {
        let filename = resolve('files/standalone/simple-plus-tracks.xml');
        it(`Creates a timegraph`, async function() {
            let syncMedia = new SyncMedia();
            await syncMedia.loadUrl(filename);
            let graph = syncMedia.graph;
            expect(graph).to.not.be.null;
        });
        it(`Creates a timegraph with 4 points`, async function() {
            let syncMedia = new SyncMedia();
            await syncMedia.loadUrl(filename);
            let graph = syncMedia.graph;
            expect(graph.length).to.equal(4);
        });
    });

    describe("Complex timegraph", function() {
        let filename = resolve("files/standalone/test-complex.xml");
        it(`Parses a complex file`, async function() {
            let syncMedia = new SyncMedia();
            await syncMedia.loadUrl(filename);
            let model = syncMedia.model;
            let graph = syncMedia.graph;
            expect(model).to.not.be.null;
            expect(graph).to.not.be.null;
        })
    })
});





