const DistrictSelectorModel = Backbone.Model.extend({
    defaults: {
        districtNames: [], // all select options (vector layers in the map)
        selectedDistrict: "" // selected option

    },
    initialize: function () {

        this.listenTo(Radio.channel("SelectDistrict"), {
            "selectionChanged": function () {
                const districtNames = Radio.request("SelectDistrict", "getSelectedDistricts").map(feature => feature.getProperties().stadtteil);

                this.setDistrictNames(districtNames);
            }
        });
    },
    setDistrictNames: function (value) {
        this.set("districtNames", value);

    },
    setSelectedDistrict: function (value) {
        this.set("selectedDistrict", value);
    }
});

export default DistrictSelectorModel;
