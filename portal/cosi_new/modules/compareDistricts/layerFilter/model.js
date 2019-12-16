const LayerFilterModel = Backbone.Model.extend(/** @lends LayerFilterModel.prototype */{
    defaults: {
        districtInfo: [], // [{key:...,value:..., max: ..., min: ...},{},...]
        layerInfo: {},
        field: "",
        filter: "" // e.g {filterKey:[lt,ut],filterKey:[lt,ut],filterKey:[lt,ut],...},
    },
    /**
     * @class LayerFilterModel
     * @extends Backbone.Model
     * @memberof Tools.CompareDistricts.LayerFilter
     * @constructs
     * @property {Array} districtInfo list of filter information derived from data
     * @property {string} selectedDistrict="Leeren" selected districtname
     * @property {object} layerInfo layer name and layer id
     * @property {object} filter list of lower tolerance and upper tolerance values for all filters in the layer e.g {filterKey:[lt,ut],filterKey:[lt,ut],filterKey:[lt,ut],...},
     */
    initialize: function () {
        this.initializeDistrictInfo();
    },
    initializeFilter: function () {
        const newFilter = {};

        newFilter[this.get("field")] = [0, 0];
        this.set("filter", JSON.stringify(newFilter));
    },
    initializeDistrictInfo: function () {
        const selector = Radio.request("SelectDistrict", "getSelector"),
            layerId = this.get("layerInfo").layerId,
            featureCollection = Radio.request("FeaturesLoader", "getAllFeaturesByAttribute", {
                id: layerId
            }),
            districtInfo = [],
            field = Radio.request("Timeline", "getLatestFieldFromCollection", featureCollection),
            values = featureCollection.map(feature => parseFloat(feature.getProperties()[field])).filter(value => !_.isNaN(value)),
            max = parseInt(Math.max(...values), 10),
            min = parseInt(Math.min(...values), 10);
        let refValue = 0,
            newInfo = {};

        console.log(featureCollection);

        this.set("field", field);
        this.initializeFilter();

        if (Radio.request("DistrictSelector", "getSelectedDistrict") !== "Leeren") {
            const districtName = Radio.request("DistrictSelector", "getSelectedDistrict"),
                refFeature = featureCollection.filter(feature => feature.getProperties()[selector] === districtName)[0];

            refValue = parseInt(refFeature.getProperties()[field], 10);
        }
        else {
            refValue = 0;
        }

        newInfo = {
            key: field, value: refValue, max: max, min: min
        };

        districtInfo.push(newInfo);
        this.set("districtInfo", districtInfo);

    },
    updateRefDistrictValue: function () {
        const selector = Radio.request("SelectDistrict", "getSelector"),
            layerId = this.get("layerInfo").layerId,
            featureCollection = Radio.request("FeaturesLoader", "getAllFeaturesByAttribute", {
                id: layerId
            }),
            newDistrictInfo = _.map(this.get("districtInfo"), _.clone);

        let refValue = 0;

        if (Radio.request("DistrictSelector", "getSelectedDistrict") !== "Leeren") {
            const districtName = Radio.request("DistrictSelector", "getSelectedDistrict"),
                refFeature = featureCollection.filter(feature => feature.getProperties()[selector] === districtName)[0];

            refValue = parseInt(refFeature.getProperties()[this.get("field")], 10);
        }
        else {
            refValue = 0;
        }
        newDistrictInfo.filter(item => item.key === this.get("field"))[0].value = refValue;
        this.set("districtInfo", newDistrictInfo);
    }

});

export default LayerFilterModel;
