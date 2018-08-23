define(function (require) {

    var Layer = require("modules/core/modelList/layer/model"),
        ol = require("openlayers"),
        OSMLayer;

    OSMLayer = Layer.extend({
        initialize: function () {
            if (!this.get("isChildLayer")) {
                Layer.prototype.initialize.apply(this);
            }
        },

        createLayerSource: function () {
            // Is this really needed? Confusing...
            this.setLayerSource(new ol.source.OSM({}));
        },

        createLayer: function () {
            this.setLayer(new ol.layer.Tile({
                source: new ol.source.OSM({})
            }));
        },

        createLegendURL: function () {
            // no legend available
        },

        checkForScale: function () {
            this.setIsOutOfRange(false);
        }
    });

    return OSMLayer;
});
