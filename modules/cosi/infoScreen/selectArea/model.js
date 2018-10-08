define(function (require) {

    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        InfoScreenModel;

    InfoScreenModel = Backbone.Model.extend({
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

    return InfoScreenModel;
});
