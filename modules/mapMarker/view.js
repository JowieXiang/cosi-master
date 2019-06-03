import MapHandlerModel from "./model";

const MapMarkerView = Backbone.View.extend({
    /**
    * @description View des Map Handlers
    * @returns {void}
    */
    initialize: function () {
        var markerPosition,
            channel = Radio.channel("MapMarker");

        this.model = new MapHandlerModel();

        channel.on({
            "zoomTo": this.zoomTo,
            "hideMarker": this.hideMarker,
            "showMarker": this.showMarker,
            "hidePolygon": this.hidePolygon,
            "showPolygon": this.showPolygon,
            "zoomToBKGSearchResult": this.zoomToBKGSearchResult
        }, this);

        if (!_.isUndefined(Radio.request("ParametricURL", "getProjectionFromUrl"))) {
            this.model.setProjectionFromParamUrl(Radio.request("ParametricURL", "getProjectionFromUrl"));
        }

        if (!_.isUndefined(Radio.request("ParametricURL", "getMarkerFromUrl"))) {
            this.model.setMarkerFromParamUrl(Radio.request("ParametricURL", "getMarkerFromUrl"));
        }

        this.render();
        // For BauInfo: requests customModule and askes for marker position to set.
        markerPosition = Radio.request("CustomModule", "getMarkerPosition");
        if (markerPosition) {
            this.showMarker(markerPosition);
        }
        else {
            this.showStartMarker();
        }
    },
    render: function () {
        this.model.get("marker").setElement(this.$el[0]);
        return this;
    },
    id: "searchMarker",
    className: "glyphicon glyphicon-map-marker",

    /**
    * @description Zoom auf Treffer
    * @param {Object} hit - Treffer der Searchbar
    * @returns {void}
    */
    zoomTo: function (hit) {
        // Lese index mit Maßstab 1:1000 als maximal Scale, sonst höchstmögliche Zommstufe
        var resolutions = Radio.request("MapView", "getResolutions"),
            index = _.indexOf(resolutions, 0.2645831904584105) === -1 ? resolutions.length : _.indexOf(resolutions, 0.2645831904584105),
            isMobile,
            coord;

        if (!_.isUndefined(hit.coordinate) && _.isArray(hit.coordinate)) {
            coord = hit.coordinate;
        }
        else if (!_.isUndefined(hit.coordinate) && !_.isArray(hit.coordinate)) {
            coord = hit.coordinate.split(" ");
        }

        this.hideMarker();
        this.hidePolygon();
        switch (hit.type) {
            case "Straße": {
                this.model.setWkt("POLYGON", coord);

                Radio.trigger("Map", "zoomToExtent", this.model.getExtent(), {maxZoom: index});
                break;
            }
            case "Parcel": {
                Radio.trigger("MapView", "setCenter", coord, this.model.get("zoomLevel"));
                this.showMarker(coord);
                break;
            }
            case "Adresse": {
                this.showMarker(coord);
                Radio.trigger("MapView", "setCenter", coord, this.model.get("zoomLevel"));
                break;
            }
            case "Stadtteil": {
                if (coord.length === 2) {
                    this.showMarker(coord);
                    Radio.trigger("MapView", "setCenter", coord, this.model.get("zoomLevel"));
                }
                else if (coord.length > 2) {
                    this.model.setWkt("POLYGON", coord);
                    Radio.trigger("Map", "zoomToExtent", this.model.getExtent(), {maxZoom: index});

                    this.showMarker(this.model.getCenterFromExtent(this.model.getExtent()));
                }
                break;
            }
            case "Thema": {
                isMobile = Radio.request("Util", "isViewMobile");

                // desktop - Themenbaum wird aufgeklappt
                if (isMobile === false) {
                    Radio.trigger("ModelList", "showModelInTree", hit.id);
                }
                // mobil
                else {
                    // Fügt das Model zur Liste hinzu, falls noch nicht vorhanden
                    Radio.trigger("ModelList", "addModelsByAttributes", {id: hit.id});
                    Radio.trigger("ModelList", "setModelAttributesById", hit.id, {isSelected: true});
                }
                Radio.trigger("ModelList", "refreshLightTree");
                break;
            }
            case "SearchByCoord": {
                Radio.trigger("MapView", "setCenter", coord, this.model.get("zoomLevel"));
                this.showMarker(coord);
                break;
            }
            case "Feature-Lister-Hover": {
                this.showMarker(coord);
                break;
            }
            case "Feature-Lister-Click": {
                Radio.trigger("Map", "zoomToExtent", coord);
                break;
            }
            case "POI": {
                Radio.trigger("Map", "zoomToExtent", coord, {maxZoom: index});
                break;
            }
            case "Schulstandorte": {
                this.showMarker(coord);
                Radio.trigger("MapView", "setCenter", coord, 6);
                break;
            }
            case "flaecheninfo": {
                this.model.setWkt("POLYGON", coord);
                this.showPolygon();
                Radio.trigger("MapView", "setCenter", coord, this.model.get("zoomLevel"));
                break;
            }
            // Features
            default: {
                if (coord.length === 2) {
                    Radio.trigger("MapView", "setCenter", coord, this.model.get("zoomLevel"));
                    this.showMarker(coord);
                }
                else if (coord.length === 3) {
                    Radio.trigger("MapView", "setCenter", [coord[0], coord[1]], this.model.get("zoomLevel"));
                    this.showMarker(coord);
                }
                else if (coord.length === 4) {
                    Radio.trigger("Map", "zoomToExtent", coord);
                }
                else if (coord.length > 4) {
                    this.model.setWkt("POLYGON", coord);
                    this.model.showFeature(); // bei Flächen soll diese sichtbar sein
                    Radio.trigger("Map", "zoomToExtent", this.model.getExtent(), {maxZoom: index});
                }
                Radio.trigger("Filter", "resetFilter", hit.feature);
                break;
            }
        }
    },

    /*
    * @description Getriggert von bkg empfängt diese Methode die XML der gesuchten Adresse
    * @param {string} data - Die Data-Object des request.
    */
    zoomToBKGSearchResult: function (data) {
        if (data.features.length !== 0 && !_.isNull(data.features[0].geometry) && data.features[0].geometry.type === "Point") {
            Radio.trigger("MapView", "setCenter", data.features[0].geometry.coordinates, this.model.get("zoomLevel"));
            this.showMarker(data.features[0].geometry.coordinates);
        }
        else if (data.features.length !== 0 && !_.isNull(data.features[0].properties) && !_.isNull(data.features[0].properties.bbox) &&
            !_.isNull(data.features[0].properties.bbox.type) && data.features[0].properties.bbox.type === "Polygon") {
            this.model.setWkt("POLYGON", _.flatten(data.features[0].properties.bbox.coordinates[0]));
            Radio.trigger("Map", "zoomToExtent", this.model.getExtent());
        }
    },

    showMarker: function (coordinate) {
        this.hideMarker();
        if (coordinate.length === 2) {
            this.model.get("marker").setPosition(coordinate);
        }
        else {
            this.model.get("marker").setPosition([coordinate[0], coordinate[1]]);
        }
        this.$el.show();
        // Re-renders the map to remove a marker that's offset by several pixels.
        Radio.trigger("Map", "render");
    },

    hideMarker: function () {
        this.$el.hide();
    },

    showPolygon: function () {
        this.model.showFeature();
    },

    hidePolygon: function () {
        this.model.hideFeature();
    },

    showStartMarker: function () {
        var startMarker = this.model.get("startMarker"),
            projectionFromParamUrl = this.model.get("projectionFromParamUrl");

        if (!_.isUndefined(startMarker)) {
            if (!_.isUndefined(projectionFromParamUrl)) {
                startMarker = Radio.request("CRS", "transformToMapProjection", projectionFromParamUrl, startMarker);
            }
            Radio.trigger("MapMarker", "showMarker", startMarker);
        }
    }

});

export default MapMarkerView;
