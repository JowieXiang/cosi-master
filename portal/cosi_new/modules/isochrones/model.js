import { Fill, Stroke, Style } from "../../../../node_modules/ol/style.js";
import GeometryCollection from "../../../../node_modules/ol/geom/GeometryCollection";
import Geometry from '../../../../node_modules/ol/geom/Geometry';
import Tool from "../../../../modules/core/modelList/tool/model";
import DropdownModel from "../../../../modules/snippets/dropdown/model";

const IsoChrones = Tool.extend({
    defaults: _.extend({}, Tool.prototype.defaults, {
        openrouteUrl: "https://api.openrouteservice.org/v2/isochrones/",
        key: "5b3ce3597851110001cf6248043991d7b17346a38c8d50822087a2c0",
        coordinate: [],
        pathType: "",
        range: 0,
        steps: 3, // step of subIsochrones
        isochroneFeatures: [], // isochrone features
        dropDownModel: {}
    }),
    initialize: function () {
        this.superInitialize();
        const layerList = _.union(Radio.request("Parser", "getItemsByAttributes", { typ: "WFS", isBaseLayer: false }), Radio.request("Parser", "getItemsByAttributes", { typ: "GeoJSON", isBaseLayer: false })),
            layerNames = layerList.map(layer => layer.featureType.trim());

        this.setDropDownModel(layerNames);
    },
    /**
     * sets the selection list for the time slider
     * @param {object[]} valueList - available values
     * @returns {void}
     */
    setDropDownModel: function (valueList) {
        const dropdownModel = new DropdownModel({
            name: "Thema",
            type: "string",
            values: valueList,
            snippetType: "dropdown",
            isMultiple: false,
            isGrouped: false,
            displayName: "Facility type",
            liveSearch: true,
            isDropup: true
        });

        this.listenTo(dropdownModel, {
            "valuesChanged": this.dropDownCallback
        }, this);

        this.set("dropDownModel", dropdownModel);
    },
    /**
     * callback function for the "valuesChanged" event in the dropdown model
     * sets the features based on the dropdown selection
     * @param {Backbone.Model} valueModel - the value model which was selected or deselected
     * @param {boolean} isSelected - flag if value model is selected or not
     * @returns {void}
     */
    dropDownCallback: function (valueModel, isSelected) {
        if (isSelected) {
            const selectedId = Radio.request("RawLayerList", "getLayerAttributesWhere", { featureType: valueModel.get("value") }).id,
                featureCollection = Radio.request("FeaturesLoader", "getAllFeaturesByAttribute", { id: selectedId }),
                polygonGeometry = this.get("isochroneFeatures")[this.get("steps") - 1].getGeometry(),
                selectedFeatures = [];

            console.log("featureCollection: ", featureCollection);
            _.each(featureCollection, feature => {
                if (feature.getGeometry()) {
                    const featureGeometry = feature.getGeometry();

                    if (polygonGeometry.intersectsExtent(featureGeometry.getExtent())) {
                        selectedFeatures.push(feature);
                    }
                }
            });

            console.log("featureLength: ", featureCollection.length);
            console.log("featureLength: ", selectedFeatures.length);
        }
    }

});

export default IsoChrones;
