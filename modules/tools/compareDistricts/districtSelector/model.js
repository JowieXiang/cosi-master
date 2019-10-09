const DistrictSelectorModel = Backbone.Model.extend({
    defaults: {
        districtNames: [], // all select options (vector layers in the map)
        selectedDistrict: "" // selected option

    },
    initialize: function () {
        this.initializeDistrictNames();

    },
    initializeDistrictNames: function () {
        const selector = Radio.request("SelectDistrict", "getSelector"),
            districtNames = Radio.request("SelectDistrict", "getSelectedDistricts").map(feature => feature.getProperties()[selector]);

        this.set("districtNames", districtNames);
    },
    setSelectedDistrict: function (value) {
        this.set("selectedDistrict", value);
    }
});

export default DistrictSelectorModel;
