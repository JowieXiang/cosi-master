import SelectAreaModel from "./model";
import Template from "text-loader!./template.html";

// define(function (require) {
//
//     let SelectAreaModel = require("modules/cosi/infoScreen/selectArea/model"),
//         Radio = require("backbone.radio"),
//         $ = require("jquery"),
//         Template = require("text-loader!modules/cosi/infoScreen/selectArea/template.html"),
//         SelectAreaView;

const SelectAreaView = Backbone.View.extend({
    id: "info-area-content",
    model: new SelectAreaModel(),
    template: _.template(Template),
    initialize: function () {
        this.listenTo(Radio.channel("LocalStorage"), {
            "newStorageMessage": function (message) {
                let element = message.data;
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
                if (!element.type) {
                    this.setInitElement();
                } else {
                    this.model.setSelectedFeature(element);
                }

                this.render();
            }
        }, this);

        this.setInitElement();
        this.render();
    },

    render: function () {
        $("#select-info-area").empty();
        let attr = this.model.toJSON();
        $("#select-info-area").append(this.$el.html(this.template(attr)));
    },

    setInitElement: function () {
        let element = {};
        element.type = 'init';
        this.model.setSelectedFeature(element);
    }
});
export default SelectAreaView;
