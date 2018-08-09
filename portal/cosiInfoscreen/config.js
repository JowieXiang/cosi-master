define(function () {
    var config = {
        postMessageUrl: "http://localhost:8080",
        footer: {
            visibility: false
        },
        quickHelp: false,
        cosiMode: {
            isInfoscreen: true
        },
        isLocalStorage: true,
        portalConf: "../cosiInfoscreen/config.json",
        layerConf: "../portal/cosiInfoscreen/services.json",
        restConf: "../portal/cosiInfoscreen/rest-services.json",
        styleConf: "../portal/cosiInfoscreen/style.json",
        proxyURL: "/cgi-bin/proxy.cgi",
        attributions: true,
        scaleLine: true,
        mouseHover: {
            numFeaturesToShow: 2,
            infoText: "(weitere Objekte. Bitte zoomen.)"
        },
        isMenubarVisible: true,
        geoAPI: false,
        clickCounter: {}
    };

    return config;
});
