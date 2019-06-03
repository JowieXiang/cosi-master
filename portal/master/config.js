const Config = {
    ignoredKeys: ["BOUNDEDBY", "SHAPE", "SHAPE_LENGTH", "SHAPE_AREA", "OBJECTID", "GLOBALID", "GEOMETRY", "SHP", "SHP_AREA", "SHP_LENGTH", "GEOM"],
    gfiWindow: "detached",
    simpleMap: false,
    wfsImgPath: "/lgv-config/img/",
    allowParametricURL: true,
    zoomToFeature: {
        attribute: "flaechenid",
        wfsId: "4560",
        styleId: "location_eventlotse"
    },
    namedProjections: [
        // GK DHDN
        ["EPSG:31467", "+title=Bessel/Gauß-Krüger 3 +proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=bessel +datum=potsdam +units=m +no_defs"],
        // ETRS89 UTM
        ["EPSG:25832", "+title=ETRS89/UTM 32N +proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"],
        // LS 320: zusammen mit Detlef Koch eingepflegt und geprüft
        ["EPSG:8395", "+title=ETRS89/Gauß-Krüger 3 +proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=GRS80 +datum=GRS80 +units=m +no_defs"],
        // WGS84
        ["EPSG:4326", "+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs"]
    ],
    footer: {
        urls: [
            {
                "bezeichnung": "Kartographie und Gestaltung: ",
                "url": "http://www.geoinfo.hamburg.de/",
                "alias": "Landesbetrieb Geoinformation und Vermessung",
                "alias_mobil": "LGV"
            }
        ],
        version: {
            "showVersion": true,
            "MasterportalVersion": "$Version"
        }
    },
    quickHelp: {
        imgPath: "/lgv-config/img/"
    },
    cswId: "3",
    metaDataCatalogueId: "2",
    portalConf: "./",
    layerConf: "/lgv-config/services-fhhnet-ALL.json",
    restConf: "/lgv-config/rest-services-fhhnet.json",
    styleConf: "/lgv-config/style_v2.json",
    proxyURL: "/cgi-bin/proxy.cgi",
    attributions: true,
    scaleLine: true,
    mouseHover: {
        numFeaturesToShow: 2,
        infoText: "(weitere Objekte. Bitte zoomen.)"
    },
    isMenubarVisible: true,
    geoAPI: false,
    clickCounter: {},
    startingMap3D: false,
    obliqueMap: true,
    shadowTime: {
        year: "2014",
        month: "6",
        day: "20",
        hour: "13",
        minute: "0",
        second: "0",
        millisecond: "0"
    },
    cesiumParameter: {
        tileCacheSize: 20,
        enableLighting: false,
        fog: {
            enabled: true,
            density: 0.0002,
            screenSpaceErrorFactor: 2.0
        },
        maximumScreenSpaceError: 2,
        fxaa: true
    },
    defaultToolId: "gfi"
};
