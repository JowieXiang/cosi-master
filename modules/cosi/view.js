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
            var channel = Radio.channel("Cosi");

            channel.reply({
                "getSavedTopicSelection": function (topic) {
                    return this.model.getTopicSelection(topic);
                }
            }, this);

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
            // Save currently selected layers before the topic switch
            this.saveCurrentTopicLayerSelection(this.model.getCurrentTopic());

            var clickTarget = $(evt.currentTarget);
            var currentTopic = clickTarget.attr('name').trim();
            this.model.setCurrentTopic(currentTopic);

            // Propagate the topic switch
            if(!clickTarget.hasClass("selected")) {
                $(".cosi-field").each(function( index ) {
                    $( this ).removeClass("selected");
                });
                clickTarget.addClass("selected");
                Radio.trigger("Cosi", "selectTopic", currentTopic);
                Radio.trigger("LocalStorage", "sendMessage", "topic-select", currentTopic);
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
        },
        saveCurrentTopicLayerSelection: function (topic) {
            var layerCollection = Radio.request("ModelList", "getCollection");
            layerCollection = layerCollection.where({isVisibleInMap: true, topic: topic});
            var selectedLayerIds = [];
            _.each(layerCollection, function (layer) {
                    selectedLayerIds.push(layer.get("id"))
            });

            this.model.setTopicSelection(topic, selectedLayerIds);
        }
    });

    return CosiView;
});
