define(function (require) {

    var Template = require("text!modules/infoScreen/template.html"),
        InfoScreenModel = require("modules/title/model"),
        Radio = require("backbone.radio"),
        $ = require("jquery"),
        InfoScreenView;

    InfoScreenView = Backbone.View.extend({
        className: "info-screen",
        id: "infoScreen",
        model: new InfoScreenModel(),
        template: _.template(Template),
        initialize: function () {
            $("#info-screen").text("placehodler");
            this.listenTo(Radio.channel("LocalStorage"), {
                "newStorageMessage": function (message) {
                    $("#info-screen").text(JSON.stringify(message));
                }
            }, this);

        },

        render: function () {

        }
    });

    return InfoScreenView;
});
