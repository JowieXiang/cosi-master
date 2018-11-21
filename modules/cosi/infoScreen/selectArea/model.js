const InfoScreenModel = Backbone.Model.extend({
    defaults: {
        selectedFeature: {}
    },
    initialize: function () {
    },
    setSelectedFeature: function (selectedFeature) {
        return this.set("selectedFeature", selectedFeature);
    },
    getSelectedFeature: function () {
        return this.get("selectedFeature");
    }
});
export default InfoScreenModel;

