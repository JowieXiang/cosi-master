import Tool from "../../../../modules/core/modelList/tool/model";
import DropdownModel from "../../../../modules/snippets/dropdown/model";

const ServiceCoverage = Tool.extend({
    defaults: _.extend({}, Tool.prototype.defaults, {
        coordinates: [],
        pathType: "",
        range: 0,
        steps: 3, // step of subIsochrones
        isochroneFeatures: [], // isochrone features
        dropDownModel: {},
        mapLayerName: "service-coverage"
    }),
    initialize: function () {
        this.superInitialize();
        this.setDropDownModel();
    },
    /**
     * sets the selection list for the time slider
     * @param {object[]} valueList - available values
     * @returns {void}
     */
    setDropDownModel: function () {
        const dropdownModel = new DropdownModel({
            name: "FacilityType",
            type: "string",
            values: [],
            snippetType: "dropdown",
            isMultiple: false,
            displayName: "Facility type",
            liveSearch: true,
            steps: 3
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

            if (selectedLayerModel) {
                const features = selectedLayerModel.get("layer").getSource().getFeatures(),
                    coordinatesBefore = features.map(feature => feature.getGeometry().getCoordinates().splice(0, 2)),
                    coordinates = coordinatesBefore.map(coord => Radio.request("CRS", "transform", { fromCRS: "EPSG:25832", toCRS: "EPSG:4326", point: coord }));

                this.set("coordinates", coordinates);
            }
        }
    }

});

export default ServiceCoverage;
