const Config = {
    ignoredKeys: ["BOUNDEDBY", "SHAPE", "SHAPE_LENGTH", "SHAPE_AREA", "OBJECTID", "GLOBALID", "GEOMETRY", "SHP", "SHP_AREA", "SHP_LENGTH", "GEOM"],
    gfiWindow: "detached",
    simpleMap: false,
    wfsImgPath: "../cosi_new/assets/",
    allowParametricURL: true,
    namedProjections: [
        // GK DHDN
        ["EPSG:31467", "+title=Bessel/Gauß-Krüger 3 +proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=bessel +datum=potsdam +units=m +no_defs"],
        // ETRS89 UTM
        ["EPSG:25832", "+title=ETRS89/UTM 32N +proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"],

        ["EPSG:8395", "+title=ETRS89/Gauß-Krüger 3 +proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=GRS80 +datum=GRS80 +units=m +no_defs"],
        // WGS84
        ["EPSG:4326", "+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs"]
    ],
    footer: {
        visibility: false,
        urls: [
            {
                "bezeichnung": "Kartographie und Gestaltung: ",
                "url": "http://www.geoinfo.hamburg.de/",
                "alias": "Landesbetrieb Geoinformation und Vermessung",
                "alias_mobil": "LGV"
            }
        ]
    },
    quickHelp: true,
    isLocalStorage: true,

    portalConf: "./",
    layerConf: "https://geoportal-hamburg.de/lgv-config/services-internet.json",
    restConf: "https://geoportal-hamburg.de/lgv-config/rest-services-internet.json",
    styleConf: "../../portal/cosi_new/style.json",
    proxyURL: "/cgi-bin/proxy.cgi",
    uiStyle: "DEFAULT",
    attributions: true,
    scaleLine: true,
    // mouseHover:
    // {
    //     numFeaturesToShow: 2,
    //     infoText: "(weitere Objekte. Bitte zoomen.)"
    // },
    // mouseHover_bev: false,
    isMenubarVisible: true,
    geoAPI: false,
    clickCounter: {},
    remoteInterface: {
        postMessageUrl: "http://localhost:9001"
    }
};
