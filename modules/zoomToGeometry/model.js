define(function (require) {

    var ol = require("openlayers"),
        Radio = require("backbone.radio"),
        ZoomToGeometry;

    ZoomToGeometry = Backbone.Model.extend({
        defaults: {
            wfsParams: {
                url: "https://geodienste.hamburg.de/HH_WFS_Verwaltungsgrenzen",
                version: "1.1.0",
                typename: "app:bezirke",
                attribute: "bezirk_name"
            }
        },
        initialize: function () {
            var name = Radio.request("ParametricURL", "getZoomToGeometry"),
                channel = Radio.channel("ZoomToGeometry");

            channel.on({
                "zoomToGeometry": this.zoomToGeometry
            });
            if (name.length > 0) {
                this.zoomToGeometry(name, this.getWfsParams());
            }
        },
        zoomToGeometry: function (name, wfsParams) {
            var wfsParams = wfsParams || this.getWfsParams();

            if (!this.validateWfsParams(wfsParams)) {
                return;
            }

            this.getGeometryFromWFS(name, wfsParams);
        },
        validateWfsParams: function (wfsParams) {
            var keysArray = _.keys(this.getWfsParams());

            _.each(keysArray, function (key) {
                if (!_.contains(wfsParams, key) || _.isUndefined(wfsParams[key])) {
                    return false;
                }
            });
            return true;
        },
        getGeometryFromWFS: function (name, wfsParams) {
            var data = "service=WFS&version=" + wfsParams.version + "&request=GetFeature&TypeName=" + wfsParams.typename;

            $.ajax({
                url: Radio.request("Util", "getProxyURL", wfsParams.url),
                data: encodeURI(data),
                context: this,
                async: false,
                type: "GET",
                success: function (data) {
                    this.zoomToFeature(data, name, wfsParams.attribute);
                },
                timeout: 6000,
                error: function () {
                   Radio.trigger("Alert", "alert", {
                        text: "<strong>Der parametrisierte Aufruf des Portals ist leider schief gelaufen!</strong> <br> <small>Details: Ein benötigter Dienst antwortet nicht.</small>",
                        kategorie: "alert-warning"
                    });
                }
            });
        },
        zoomToFeature: function (data, name, attribute) {
            var foundFeature = this.parseFeatures(data, name, attribute),
                extent;

                if (_.isUndefined(foundFeature)) {
                    Radio.trigger("Alert", "alert", {
                        text: "<strong>Der Parametrisierte Aufruf des Portals leider schief gelaufen!</strong> <br> <small>Details: Kein Objekt gefunden, dessen Attribut \"" + attribute + "\" den Wert \"" + name + "\" einnimmt.</small>",
                        kategorie: "alert-warning"
                    });
                }
                else {
                    extent = this.calcExtent(foundFeature);
                    Radio.trigger("Map", "zoomToExtent", extent);
                }
        },
        parseFeatures: function (data, name, attribute) {
            var format = new ol.format.WFS(),
            features = format.readFeatures(data),
            foundFeature = _.filter(features, function (feature) {
                if (!_.contains(feature.getKeys(), attribute)) {
                    return false;
                }
                return feature.get(attribute).toUpperCase().trim() === name.toUpperCase().trim();
            });

            return foundFeature[0];

        },
        calcExtent: function (feature) {
            return feature.getGeometry().getExtent();
        },
        // getter for wfsParams
        getWfsParams: function () {
            return this.get("wfsParams");
        },
        // setter for wfsParams
        setWfsParams: function (value) {
            this.set("wfsParams", value);
        }
    });
    return ZoomToGeometry;
});