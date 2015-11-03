requirejs.config({
    baseUrl: ".",
    optimize: "none",
    shim: {
        "angular": {
            "exports": "angular"
        }
    },
    paths: {
        "angular": "../bower_components/angular/angular",
        "videogular": "../bower_components/videogular/videogular",
        "videogular-buffering": "../bower_components/videogular-buffering/buffering",
        "videogular-controls": "../bower_components/videogular-controls/controls",
        "videogular-overlay-play": "../bower_components/videogular-overlay-play/overlay-play",
        "videogular-poster": "../bower_components/videogular-poster/poster",
        "angular-sanitize": "../bower_components/angular-sanitize/angular-sanitize",
        "angular-bootstrap": "../bower_components/angular-bootstrap/ui-bootstrap",
        "angular-bootstrap-tpls": "../bower_components/angular-bootstrap/ui-bootstrap-tpls"
    }
});