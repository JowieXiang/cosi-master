define(function (require) {

    var ListTemplate = require("text!modules/menu/table/layer/templates/template.html"),
        SingleLayerView = require("modules/menu/table/layer/singleLayerView"),
        $ = require("jquery"),
        LayerView;

    LayerView = Backbone.View.extend({
        initialize: function () {
            this.collection = Radio.request("ModelList", "getCollection");
            this.listenTo(Radio.channel("TableMenu"), {
                "hideMenuElementLayer": this.hideMenu
            });
            this.listenTo(this.collection, {
                "updateLightTree": function () {
                    this.render();
                }
            });
            // Aktiviert ausgewälter Layer; Layermenu ist aktiv
            this.listenTo(this.collection, {
                "updateSelection": function () {
                    this.render();
                    $("#table-nav-layers-panel").collapse("show");
                    this.$el.addClass("burgerMenuIsActive");
                }
            });
            // bootstrap collapse event
            this.$el.on("show.bs.collapse", function () {
                Radio.request("TableMenu", "setActiveElement", "Layer");
            });
        },
        id: "table-layer-list",
        className: "table-layer-list table-nav",
        template: _.template(ListTemplate),
        events: {
            "click .icon-burgermenu_alt": 'showMenuWorkaround'
        },
        showMenuWorkaround: function (evt) {
            $("#table-nav-layers-panel").show();
        },
        hideMenu: function () {
            $("#table-nav-layers-panel").collapse("hide");
        },
        render: function () {
            this.$el.html(this.template());
            if (Radio.request("TableMenu", "getActiveElement") === "Layer") {
                $("#table-nav-layers-panel").collapse("show");
            }
            this.renderList();
            return this.$el;
        },
        renderList: function () {
            var models = this.collection.where({type: "layer"});

            models = _.sortBy(models, function (model) {
                return model.get("selectionIDX");
            });
            this.addViews(models);
        },

        addViews: function (models) {
            var childElement = {};

            _.each(models, function (model) {
                childElement = new SingleLayerView({model: model}).render();
                this.$el.find("ul.layers").prepend(childElement);

            }, this);
        }
    });

    return LayerView;
});
