define(function (require) {

    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        InfoScreenModel;

    InfoScreenModel = Backbone.Model.extend({
        defaults: {
        },
        initialize: function () {

        }
    });

    return InfoScreenModel;
});
