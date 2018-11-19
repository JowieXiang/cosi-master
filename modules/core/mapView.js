import {Projection, addProjection} from "ol/proj.js";
import View from "ol/View.js";

const MapView = Backbone.Model.extend({
    /**
     *
     */
    defaults: {
        epsg: "EPSG:25832",
        background: "",
        backgroundImage: "",
        extent: [510000.0, 5850000.0, 625000.4, 6000000.0],
        options: [
            {
                resolution: 66.14579761460263,
                scale: 250000,
                zoomLevel: 0
            },
            {
                resolution: 26.458319045841044,
                scale: 100000,
                zoomLevel: 1
            },
            {
                resolution: 15.874991427504629,
                scale: 60000,
                zoomLevel: 2
            },
            {
                resolution: 10.583327618336419,
                scale: 40000,
                zoomLevel: 3
            },
            {
                resolution: 5.2916638091682096,
                scale: 20000,
                zoomLevel: 4
            },
            {
                resolution: 2.6458319045841048,
                scale: 10000,
                zoomLevel: 5
            },
            {
                resolution: 1.3229159522920524,
                scale: 5000,
                zoomLevel: 6
            },
            {
                resolution: 0.6614579761460262,
                scale: 2500,
                zoomLevel: 7
            },
            {
                resolution: 0.2645831904584105,
                scale: 1000,
                zoomLevel: 8
            },
            {
                resolution: 0.13229159522920521,
                scale: 500,
                zoomLevel: 9
            }
        ],
        startResolution: 15.874991427504629,
        startCenter: [565874, 5934140],
        units: "m",
        DOTS_PER_INCH: $("#dpidiv").outerWidth() // Hack um die Bildschirmauflösung zu bekommen
    },

    /**
     * Die initiale Größe der #map beträgt 100%.
     * Der MenuLoader wird zu einem späteren Zeitpunkt required und verkleinert ggf. die Menüleiste.
     * @returns {void}
     */
    initialize: function () {
        var channel = Radio.channel("MapView");

        channel.reply({
            "getProjection": function () {
                return this.get("projection");
            },
            "getOptions": function () {
                return _.findWhere(this.get("options"), {resolution: this.get("view").constrainResolution(this.get("view").getResolution())});
            },
            "getCenter": function () {
                return this.getCenter();
            },
            "getZoomLevel": function () {
                return this.getZoom();
            },
            "getResolutions": function () {
                return this.get("resolutions");
            },
            "getResoByScale": this.getResoByScale,
            "getScales": function () {
                return _.pluck(this.get("options"), "scale");
            },
            "getCurrentExtent": this.getCurrentExtent
        }, this);

        channel.on({
            "setCenter": this.setCenter,
            "setCenterAnimation": this.setCenterAnimation,
            "toggleBackground": this.toggleBackground,
            "setZoomLevelUp": this.setZoomLevelUp,
            "setZoomLevelDown": this.setZoomLevelDown,
            "setScale": this.setResolutionByScale,
            "setConstrainedResolution": this.setConstrainedResolution,
            "resetView": this.resetView
        }, this);

        this.listenTo(this, {
            "change:background": function (model, value) {
                if (value === "white") {
                    $("#map").css("background", "white");
                }
                else {
                    $("#map").css("background", "url('" + value + "') repeat scroll 0 0 rgba(0, 0, 0, 0)");
                }
            }
        });

        this.setConfig();
        this.setResolutions();
        this.setUrlParams();
        this.setProjection();
        this.setView();

        // Listener für ol.View
        this.get("view").on("change:resolution", this.changedResolutionCallback.bind(this), this);
        this.get("view").on("change:center", function () {
            Radio.trigger("MapView", "changedCenter", this.getCenter());
        }, this);
    },

    /**
     * is called when the view resolution is changed
     * triggers the map view options
     * @param {ObjectEvent} evt - openlayers event object
     * @param {string} evt.key - the name of the property whose value is changing
     * @param {ol.View} evt.target - this.get("view")
     * @returns {void}
     */
    changedResolutionCallback: function (evt) {
        var mapView = evt.target,
            constrainResolution = mapView.constrainResolution(mapView.get(evt.key)),
            params = _.findWhere(this.get("options"), {resolution: constrainResolution});

        Radio.trigger("MapView", "changedOptions", params);
        Radio.trigger("MapView", "changedZoomLevel", this.getZoom());
        Radio.trigger("ClickCounter", "zoomChanged");
    },

    /**
     * finds the right resolution for the scale and sets it for this view
     * @param {number} scale - map view scale
     * @returns {void}
     */
    setResolutionByScale: function (scale) {
        var params = _.findWhere(this.get("options"), {scale: scale});

        if (!_.isUndefined(this.get("view"))) {
            this.get("view").setResolution(params.resolution);
        }
    },

    /**
     * @param {number} resolution -
     * @param {number} direction - 0 set the nearest, 1 set the largest nearest, -1 set the smallest nearest
     * @returns {void}
     */
    setConstrainedResolution: function (resolution, direction) {
        this.get("view").setResolution(this.get("view").constrainResolution(resolution, 0, direction));
    },

    resetView: function () {
        this.get("view").setCenter(this.get("startCenter"));
        this.get("view").setResolution(this.get("startResolution"));
        Radio.trigger("MapMarker", "hideMarker");
    },

    /*
    * Finalisierung der Initialisierung für config.json
    */
    setConfig: function () {
        /*
        *   Auslesen und Überschreiben durch Werte aus Config.json in spezifischer Reihenfolge
        */
        var mapViewSettings = Radio.request("Parser", "getItemsByAttributes", {type: "mapView"}),
            mapViewOptions = _.find(mapViewSettings, {"id": "options"}),
            mapViewEpsg = _.find(mapViewSettings, {"id": "epsg"}),
            mapViewImage = _.find(mapViewSettings, {"id": "backgroundImage"}),
            mapViewStartCenter = _.find(mapViewSettings, {"id": "startCenter"}),
            mapViewExtent = _.find(mapViewSettings, {"id": "extent"}),
            mapViewResolution = _.find(mapViewSettings, {"id": "resolution"}),
            mapViewZoomLevel = _.find(mapViewSettings, {"id": "zoomLevel"}),
            res;

        if (_.isUndefined(mapViewOptions) === false) {
            this.set("options", []);
            _.each(mapViewOptions.attr, function (opt) {
                this.pushHits("options", opt);
            }, this);
        }

        if (_.isUndefined(mapViewEpsg) === false) {
            this.setEpsg(mapViewEpsg.attr);
        }

        if (_.isUndefined(mapViewImage) === false) {
            this.setBackgroundImage(mapViewImage.attr);
            this.setBackground(mapViewImage.attr);
        }

        if (_.isUndefined(mapViewStartCenter) === false) {
            this.setStartCenter(mapViewStartCenter.attr);
        }

        if (_.isUndefined(mapViewExtent) === false) {
            this.setExtent(mapViewExtent.attr);
        }

        if (_.isUndefined(mapViewResolution) === false) {
            this.setStartResolution(mapViewResolution.attr);
        }
        else if (_.isUndefined(mapViewZoomLevel) === false) {
            res = this.get("options")[mapViewZoomLevel.attr].resolution;

            this.setStartResolution(res);
        }
    },

    setUrlParams: function () {
        /*
        *   Auslesen und Überschreiben durch Werte aus ParamUrl
        */
        var centerFromParamUrl = Radio.request("ParametricURL", "getCenter"),
            zoomLevelFromParamUrl = Radio.request("ParametricURL", "getZoomLevel");

        if (!_.isUndefined(centerFromParamUrl)) {
            this.setStartCenter(centerFromParamUrl);
        }

        if (!_.isUndefined(zoomLevelFromParamUrl)) {
            this.set("startResolution", this.get("resolutions")[zoomLevelFromParamUrl]);
        }
    },

    // setter for epsg
    setEpsg: function (value) {
        this.set("epsg", value);
    },

    setBackground: function (value) {
        this.set("background", value);
    },

    setBackgroundImage: function (value) {
        this.set("backgroundImage", value);
    },

    setStartCenter: function (value) {
        this.set("startCenter", value);
    },

    setStartResolution: function (value) {
        this.set("startResolution", value);
    },
    toggleBackground: function () {
        if (this.get("background") === "white") {
            this.setBackground(this.get("backgroundImage"));
        }
        else {
            this.setBackground("white");
        }
    },

    setResolutions: function () {
        this.set("resolutions", _.pluck(this.get("options"), "resolution"));
    },

    // setter for extent
    setExtent: function (value) {
        this.set("extent", value);
    },

    /**
     * Setzt die ol Projektion anhand des epsg-Codes
     * @returns {void}
     */
    setProjection: function () {
        var epsgCode = this.get("epsg"),
            proj = Radio.request("CRS", "getProjection", epsgCode);

        if (!proj) {
            Radio.trigger("Alert", "alert", "Unknown CRS " + epsgCode + ". Can't set projection.");
            return;
        }

        proj = new Projection({
            code: epsgCode,
            units: this.get("units"),
            extent: this.get("extent"),
            axisOrientation: "enu",
            global: false
        });

        addProjection(proj);

        // attach epsg and projection object to Config.view for further access by other modules
        Config.view = {
            epsg: proj.getCode(),
            proj: proj
        };

        this.set("projection", proj);
    },

    setView: function () {
        var view = new View({
            projection: this.get("projection"),
            center: this.get("startCenter"),
            extent: this.get("extent"),
            resolution: this.get("startResolution"),
            resolutions: this.get("resolutions")
        });

        this.set("view", view);
    },

    setCenter: function (coords, zoomLevel) {
        if (coords.length === 2) {
            this.get("view").setCenter(coords);
        }
        else {
            this.get("view").setCenter([coords[0], coords[1]]);
        }
        if (!_.isUndefined(zoomLevel)) {
            this.get("view").setZoom(zoomLevel);
        }
    },

    setCenterAnimation: function (coords, zoomLevel) {
        this.get("view").animate({
            center: coords,
            duration: 2000,
            zoom: zoomLevel
        });
    },

    setZoomLevelUp: function () {
        this.get("view").setZoom(this.getZoom() + 1);
    },

    setZoomLevelDown: function () {
        this.get("view").setZoom(this.getZoom() - 1);
    },

    /**
     * Gibt zur Scale die entsprechende Resolution zurück.
     * @param  {String|number} scale -
     * @param  {String} scaleType - min oder max
     * @return {number} resolution
     */
    getResoByScale: function (scale, scaleType) {
        var scales = _.pluck(this.get("options"), "scale"),
            unionScales = _.union(scales, [parseInt(scale, 10)]),
            index;

        unionScales = _.sortBy(unionScales, function (num) {
            return -num;
        });
        index = _.indexOf(unionScales, parseInt(scale, 10));
        if (unionScales.length === scales.length || scaleType === "max") {
            return this.get("resolutions")[index];
        }
        else if (scaleType === "min") {
            return this.get("resolutions")[index - 1];
        }
        return null;
    },

    getCenter: function () {
        return this.get("view").getCenter();
    },

    getResolution: function (scale) {
        var units = this.get("units"),
            mpu = Projection.METERS_PER_UNIT[units],
            dpi = this.get("DOTS_PER_INCH"),
            resolution = scale / (mpu * 39.37 * dpi);

        return resolution;
    },

    /**
     *
     * @return {[type]} [description]
     */
    getZoom: function () {
        return this.get("view").getZoom();
    },

    /**
     * calculate the extent for the current view state and the passed size
     * @return {ol.extent} extent
     */
    getCurrentExtent: function () {
        var mapSize = Radio.request("Map", "getSize");

        return this.get("view").calculateExtent(mapSize);
    },

    pushHits: function (attribute, value) {
        var tempArray = _.clone(this.get(attribute));

        tempArray.push(value);
        this.set(attribute, _.flatten(tempArray));
    }
});

export default MapView;
