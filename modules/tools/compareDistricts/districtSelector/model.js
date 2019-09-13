const DistrictSelectorModel = Backbone.Model.extend({
    defaults: {
        districtNames: [], // all select options (vector layers in the map)
        selectedDistrict: "" // selected option

    },
    initialize: function () {
        this.initializeDistrictNames();

    },
    initializeDistrictNames: function () {

        const districtNames = Radio.request("SelectDistrict", "getSelectedDistricts").map(feature => feature.getProperties().stadtteil);

        this.set("districtNames", districtNames);
    },
    setSelectedDistrict: function (value) {
        this.set("selectedDistrict", value);
    }
});

export default DistrictSelectorModel;
