import Tool from "../../../../modules/core/modelList/tool/model";
import DropdownModel from "../../../../modules/snippets/dropdown/model";
import * as Proj from "ol/proj.js";

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
            values: this.get("facilityNames"),
            snippetType: "dropdown",
            isMultiple: false,
            displayName: "Einrichtungstyp",
            liveSearch: true,
            steps: 3,
            facilityNames: []
        });

        this.listenTo(dropdownModel, {
            "valuesChanged": this.setCoordinates
        }, this);
        this.set("dropDownModel", dropdownModel);
    },
    /**
     * display corresponding facility layer
     * @param {Backbone.Model} valueModel - the value model which was selected or deselected
     * @param {boolean} isSelected - flag if value model is selected or not
     * @returns {void}
     */
    setCoordinates: function (valueModel, isSelected) {
        if (isSelected) {
            const selectedLayerModel = Radio.request("ModelList", "getModelByAttributes", {name: valueModel.get("value")});

            if (selectedLayerModel) {
                const features = selectedLayerModel.get("layer").getSource().getFeatures(),
                    coordinatesBefore = features.map(feature => feature.getGeometry().getCoordinates().splice(0, 2)),
                    coordinates = coordinatesBefore.map(coord => Proj.transform(coord, "EPSG:25832", "EPSG:4326"));

                this.set("coordinates", coordinates);
            }
        }
    }

});

export default ServiceCoverage;
