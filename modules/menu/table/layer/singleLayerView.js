define(function (require) {
    var TemplateSettings = require("text!modules/menu/table/layer/templates/templateSettings.html"),
        Template = require("text!modules/menu/table/layer/templates/templateSingleLayer.html"),
        $ = require("jquery"),
        Config = require("config"),
        LayerView;

    LayerView = Backbone.View.extend({
        events: {
            "click .icon-checkbox, .icon-checkbox2, .title": "toggleIsSelected",
            "click .icon-info": "showLayerInformation",
            "click .glyphicon-cog": "toggleIsSettingVisible",
            "click .arrows > .glyphicon-arrow-up": "moveModelUp",
            "click .arrows > .glyphicon-arrow-down": "moveModelDown",
            "click .glyphicon-plus-sign": "incTransparency",
            "click .glyphicon-minus-sign": "decTransparency",
            "change select": "setTransparency"
        },
        initialize: function () {
            this.listenTo(this.model, {
                "change:isSettingVisible": this.renderSetting,
                "change:transparency": this.render
            });
            this.$el.on({
                click: function (e) {
                    e.stopPropagation();
                }
            });
        },
        tagName: "li",
        className: "burgermenu-layer-list list-group-item",
        template: _.template(Template),
        templateSettings: _.template(TemplateSettings),
        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
            if (this.model.get("isSettingVisible") === true) {
                this.$el.append(this.templateSettings(attr));
                this.$el.addClass("layer-settings-activated");
            }
            return this.$el;
        },
        renderSetting: function () {
            var attr = this.model.toJSON();

            // Animation Zahnrad
            this.$(".glyphicon-cog").toggleClass("rotate rotate-back");
            // Slide-Animation templateSetting
            if (this.model.get("isSettingVisible") === false) {
                this.$el.find(".layer-settings").slideUp("slow", function () {
                    $(this).remove();
                });
            }
            else {
                this.$el.addClass("layer-settings-activated");
                this.$el.append(this.templateSettings(attr));
                this.$el.find(".layer-settings").hide();
                this.$el.find(".layer-settings").slideDown();
            }
        },
        toggleIsSelected: function () {
            // In CoSI mode the one checkbox serves for multiple layers (layerStages)
            var visibleStageCounterpart = Radio.request("ModelList", "getModelByAttributes", {stageId: this.model.get("stageId"), isVisibleInMap: true});
            if (Config.cosiMode &&
                visibleStageCounterpart) {
                this.model.setIsSelected(false);
                visibleStageCounterpart.setIsVisibleInMap(false);
                visibleStageCounterpart.setIsSelected(false);
            } else {
                this.model.toggleIsSelected();
            }
            this.render();
        },
        showLayerInformation: function () {
            this.model.showLayerInformation();
        },
        toggleIsSettingVisible: function () {
            this.model.toggleIsSettingVisible();
        },
        setTransparency: function (evt) {
            this.model.setTransparency(parseInt(evt.target.value, 10));
        },

        moveModelDown: function () {
            this.model.moveDown();
        },

        moveModelUp: function () {
            this.model.moveUp();
        },
        incTransparency: function () {
            this.model.incTransparency(10);
        },
        decTransparency: function () {
            this.model.decTransparency(10);
        }
    });

    return LayerView;
});
