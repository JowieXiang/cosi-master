import { Fill, Stroke, Style } from "ol/style.js";
import GeometryCollection from "ol/geom/GeometryCollection";
import Tool from "../../../../modules/core/modelList/tool/model";
import SnippetDropdownModel from "../../../../modules/snippets/dropdown/model";
import * as Extent from "ol/extent";
import * as Polygon from "ol/geom/Polygon";

const bboxSettor = Backbone.Model.extend({
    defaults: {
        statistischeGebieteUrl: "https://geodienste.hamburg.de/HH_WFS_Statistische_Gebiete_Test",
        statistischeGebiete: [],
        // does not exist yet
        stadtteileUrl: "",
        stadtteile: [],
        // store for all features
        featureList: {}
    },
    initialize: function () {
        const channel = Radio.channel("BboxSettor");

        channel.on({
            "setBboxGeometryToLayer": this.setBboxGeometryToLayer
        }, this);
    },
    /**
     * sets the bbox geometry for all vector layers and updates already loaded layers
     * @param {Object[]} itemList - all available vector layers(WFS)
     * @param {GeometryCollection} bboxGeometry - target geometry to be set as bbox
     * @returns {void}
     */
    setBboxGeometryToLayer: function (itemList, bboxGeometry) {
        const modelList = Radio.request("ModelList", "getCollection");

        itemList.forEach(function (item) {
            const model = modelList.get(item.id);

            // layer already exists in the model list
            if (model) {
                model.set("bboxGeometry", bboxGeometry);
                // updates layers that have already been loaded
                if (model.has("layer") && model.get("layer").getSource().getFeatures().length > 0) {
                    model.updateSource();
                }
            }
            // for layers that are not yet in the model list
            else {
                item.bboxGeometry = bboxGeometry;
            }
        }, this);
    }

});

export default bboxSettor;
