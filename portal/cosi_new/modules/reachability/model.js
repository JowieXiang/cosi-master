import Tool from "../../../../modules/core/modelList/tool/model";
import DropdownModel from "../../../../modules/snippets/dropdown/model";

const Reachability = Tool.extend({
    defaults: _.extend({}, Tool.prototype.defaults, {
        coordinate: [],
        pathType: "",
        range: 0,
        steps: 3, // step of subIsochrones
        isochroneFeatures: [], // isochrone features
        dropDownModel: {},
        mapLayerName: "IsoChrones_name"
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
            "valuesChanged": this.displayLayer
        }, this);

        this.set("dropDownModel", dropdownModel);
    },
    /**
     * display corresponding facility layer
     * @param {Backbone.Model} valueModel - the value model which was selected or deselected
     * @param {boolean} isSelected - flag if value model is selected or not
     * @returns {void}
     */
    displayLayer: function (valueModel, isSelected) {
        if (isSelected) {
            const selectedItem = Radio.request("RawLayerList", "getLayerAttributesWhere", { featureType: valueModel.get("value") }),
                selectedLayerModel = Radio.request("ModelList", "getModelByAttributes", { id: selectedItem.id });
            console.log("selectedItem: ", selectedItem);
            console.log("selectedLayerModel: ", selectedLayerModel);

            if (selectedLayerModel) {
                selectedLayerModel.setIsSelected(true);
            } else {
                selectedItem.setIsSelected(true);
            }
        }
    }

});

export default Reachability;