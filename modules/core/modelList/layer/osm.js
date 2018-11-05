import Layer from "./model";
import OSM from "ol/source/OSM";
import Tile from "ol/layer/Tile";

const OSMLayer = Layer.extend({
        initialize: function () {
            if (!this.get("isChildLayer")) {
                Layer.prototype.initialize.apply(this);
            }
        },

        createLayerSource: function () {
            // Is this really needed? Confusing...
            this.setLayerSource(new OSM({}));
        },

        createLayer: function () {
            this.setLayer(new Tile({
                source: new OSM({})
            }));
        },

        createLegendURL: function () {
            // no legend available
        },

        checkForScale: function () {
            this.setIsOutOfRange(false);
        }
    });
export default OSMLayer;
