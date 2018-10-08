define(function (require) {

    var SelectAreaModel = require("modules/cosi/infoScreen/selectArea/model"),
        Radio = require("backbone.radio"),
        $ = require("jquery"),
        Template = require("text!modules/cosi/infoScreen/selectArea/template.html"),
        SelectAreaView;

    SelectAreaView = Backbone.View.extend({
        id: "info-area-content",
        model: new SelectAreaModel(),
        template: _.template(Template),
        initialize: function () {
            this.listenTo(Radio.channel("LocalStorage"), {
                "newStorageMessage": function (message) {
                        var element = message.data;
                        if (element.hasOwnProperty("KapKita")) {
                            element.type = 'kita';
                        } else if (element.hasOwnProperty("shop")) {
                            element.type = 'shop';
                        } else if (element.hasOwnProperty("amenity")) {
                            element.type = 'pharmacy';
                        } else if (element.hasOwnProperty("gruenart")) {
                            element.type = 'greenArea';
                        } else if (element.hasOwnProperty("1bis6range")) {
                            element.type = 'statisticalArea';
                        }
                        console.log(element)
                        this.model.setSelectedFeature(element);
                        this.render()
                }
            }, this);

            var element = {};
            element.type = 'init';
            this.model.setSelectedFeature(element);

            this.render();
        },

        render: function () {
            $("#select-info-area").empty()
            var attr = this.model.toJSON();
            $("#select-info-area").append(this.$el.html(this.template(attr)));
        }
    });

    return SelectAreaView;
});
