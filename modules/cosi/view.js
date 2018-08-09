define([
    "backbone",
    "config",
    "text!modules/cosi/template.html",
    "modules/cosi/model"
], function (Backbone, Config, Template, CosiModel) {

    var CosiView = Backbone.View.extend({
        template: _.template(Template),
        model: CosiModel,
        className: "cosi",
        events: {
            "click .cosi-field": "fieldClicked",
            "click .reset-button a": "recenterMap"
        },
        initialize: function () {
            // To set the inactivity of stages, we need to listen to changes
            this.listenTo(Radio.channel("Layer"), {
                "layerVisibleChanged": function (layerId, visible) {
                    this.setStageMenuVisibility();
                }
            }, this);
            //TODO: Wenn Layer initial angezeigt werden, muss hier auch auf *Radio.trigger("Cosi", "selectTopic"* gehört werden
            this.render();


            Radio.request("TableMenu", "setActiveElement", "Category");
        },
        render: function () {
            var attr = this.model.toJSON();
            $(".ol-viewport").append(this.$el.html(this.template(attr)));
        },
        fieldClicked : function (evt) {
            var clickTarget = $(evt.currentTarget);
            if(!clickTarget.hasClass("selected")) {
                $(".cosi-field").each(function( index ) {
                    $( this ).removeClass("selected");
                });
                clickTarget.addClass("selected");
                Radio.trigger("Cosi", "selectTopic", clickTarget.attr('name').trim());
                Radio.trigger("LocalStorage", "sendMessage", "topic-select", clickTarget.attr('name').trim());
            }
        },
        recenterMap: function () {
            Radio.trigger("MapView", "setCenter", this.model.getCenter(), 3);
        },
        setStageMenuVisibility: function () {
            var featureCollection = Radio.request("ModelList","getCollection");
            var  isStagesVisible = false;
            _.each(featureCollection["models"], function (feature) {
                if (feature["attributes"]["type"] == "layer" &&
                    feature["attributes"]["isVisibleInMap"] == true &&
                    feature["attributes"]["stageLayerMap"]) {
                    isStagesVisible = true;
                     return true;
                }
            });
            this.model.setIsStagesActive(isStagesVisible);
            if (isStagesVisible) {
                $(".stages").removeClass("inactive-stages");
            } else {
                $(".stages").addClass("inactive-stages");
            }
        }
    });

    return CosiView;
});
