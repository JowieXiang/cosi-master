define(function (require) {

    var ListTemplate = require("text!modules/menu/table/layer/templates/template.html"),
        SingleLayerView = require("modules/menu/table/layer/singleLayerView"),
        $ = require("jquery"),
        Config = require("config"),
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

            if (Config.cosiMode) {
                this.listenTo(Radio.channel("Cosi"), {
                    "selectTopic": this.addCosiFilter
                });
            }
        },
        id: "table-layer-list",
        className: "table-layer-list table-nav",
        template: _.template(ListTemplate),
        cosiLayerFiler: ["basic"],
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
            var models = {};
            if (Config.cosiMode) {
                for (var i = 0; i < this.cosiLayerFiler.length; i++) {
                    var filter = this.cosiLayerFiler[i];
                    if ($.isEmptyObject(models)) {
                        models = this.collection.where({topic: filter});
                    } else {
                        models.push.apply(models, this.collection.where({topic: filter}));
                    }
                }
            } else {
                models = this.collection.where({type: "layer"});
            }

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
        },
        removeAllViews: function () {
            $(this.$el.find("ul.layers")).empty();
        },
        addCosiFilter: function (filterValue) {
            this.cosiLayerFiler = ["basic"];
            this.cosiLayerFiler.push(filterValue);
            this.removeAllViews();
            this.renderList();
        }
    });

    return LayerView;
});
