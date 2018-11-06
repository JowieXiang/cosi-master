const Config = {
    ignoredKeys: ["BOUNDEDBY", "SHAPE", "SHAPE_LENGTH", "SHAPE_AREA", "OBJECTID", "GLOBALID", "GEOMETRY", "SHP", "SHP_AREA", "SHP_LENGTH", "GEOM"],
    gfiWindow: "detached",
    simpleMap: false,
    wfsImgPath: "../portal/cosi/assets/",
    allowParametricURL: true,
    postMessageUrl: "http://localhost:8080",
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
    cosiMode: {
        topics: [
            {
                name: "gruenflaechen",
                displayName: "Grün­flä­chen"
            },
            {
                name: "nahversorgung",
                displayName: "Nah­ver­sor­gung"
            },
            {
                name: "kitas",
                displayName: "Ki­tas"
            }
        ],
        stages: [
            {
                name: "before",
                displayName: "Vor Bebauung"
            },
            {
                name: "after",
                displayName: "Nach Bebauung"
            }
        ],
        initialCenter: [564959.09, 5940777.71]
    },
    isLocalStorage: true,

    portalConf: "./",
    layerConf: "../../portal/cosi/services.json",
    restConf: "../../portal/cosi/rest-services.json",
    styleConf: "../../portal/cosi/style.json",
    proxyURL: "/cgi-bin/proxy.cgi",

    uiStyle: "table",
    attributions: true,
    scaleLine: true,
    mouseHover:
        {
            numFeaturesToShow: 2,
            infoText: "(weitere Objekte. Bitte zoomen.)"
        },
    isMenubarVisible: true,
    geoAPI: false,
    clickCounter: {},
    remoteInterface: true
};
