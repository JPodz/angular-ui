requirejs.config({
    baseUrl: ".",
    optimize: 'none',
    shim: {
        "angular": {
            "exports": "angular"
        }
    },
    paths: {
        "angular": "../bower_components/angular/angular"
    }
});