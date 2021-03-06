import WFSStyle from "./model";

const StyleList = Backbone.Collection.extend(/** @lends StyleList.prototype */{
    model: WFSStyle,
    url: function () {
        if (!_.has(Config, "styleConf") || Config.styleConf === "") {
            return "keine Style JSON";
        }
        return Config.styleConf;
    },
    /**
     * @class StyleList
     * @extends Backbone.Collection
     * @memberof VectorStyle
     * @constructs
     * @description Collection that stores all the vector styles contained in style.json.
     * @fires Core.ConfigLoader#RadioRequestParserGetItemsByAttributes
     * @fires Alerting#RadioTriggerAlertAlert
     * @listens VectorStyle#RadioRequestStyleListReturnModelById
     */
    initialize: function () {
        var channel = Radio.channel("StyleList");

        channel.reply({
            "returnModelById": this.returnModelById,
            "getDefaultStyle": this.model.getDefaultStyle
        }, this);

        if (this.url() !== "keine Style JSON") {
            this.fetch({
                cache: false,
                async: false,
                error: function (model, xhr, error) {
                    const statusText = xhr.statusText;
                    let message,
                        position,
                        snippet;

                    if (statusText === "Not Found") {
                        Radio.trigger("Alert", "alert", {
                            text: "<strong>Die Datei '" + model.url() + "' ist nicht vorhanden!</strong>",
                            kategorie: "alert-warning"
                        });
                    }
                    else {
                        message = error.errorThrown.message;
                        position = parseInt(message.substring(message.lastIndexOf(" ")), 10);
                        snippet = xhr.responseText.substring(position - 30, position + 30);
                        Radio.trigger("Alert", "alert", {
                            text: "<strong>Die Datei '" + model.url() + "' konnte leider nicht geladen werden!</strong> <br> " +
                            "<small>Details: " + error.textStatus + " - " + error.errorThrown.message + ".</small><br>" +
                            "<small>Auszug:" + snippet + "</small>",
                            kategorie: "alert-warning"
                        });
                    }
                }
            });
        }
    },
    returnModelById: function (layerId) {
        return this.find(function (slmodel) {
            return slmodel.attributes.layerId === layerId;
        });
    },
    /**
     * overwrite parse function so that only the style-models are saved
     * whose layers are configured in the config.json
     * After that these models are automatically added to the collection
     * @param  {object[]} data parsed style.json
     * @return {object[]} filtered style.json objects
     * @fires Core.ConfigLoader#RadioRequestParserGetItemsByAttributes
     */
    parse: function (data) {
        var layers = Radio.request("Parser", "getItemsByAttributes", {type: "layer"}),
            tools = Radio.request("Parser", "getItemsByAttributes", {type: "tool"}),
            styleIds = [],
            filteredData = [];

        _.each(layers, function (layer) {
            if (layer.typ === "WFS" || layer.typ === "GeoJSON" || layer.typ === "SensorThings") {
                if (_.has(layer, "styleId")) {
                    styleIds.push(layer.styleId);
                }
            }
            else if (layer.typ === "GROUP") {
                _.each(layer.children, function (child) {
                    if (_.has(child, "styleId")) {
                        styleIds.push(child.styleId);
                    }
                });
            }
        });
        styleIds.push(this.getStyleIdForZoomToFeature());
        styleIds.push(this.getStyleIdForMapMarkerPoint());

        _.each(tools, function (tool) {
            if (_.has(tool, "styleId")) {
                styleIds.push(tool.styleId);
            }
        });

        filteredData = data.filter(function (styleModel) {
            return _.contains(styleIds, styleModel.layerId);
        });

        return filteredData;
    },

    /**
     * Gets styleId from config for zoomToFeature
     * @returns {String} - Style id
     */
    getStyleIdForZoomToFeature: function () {
        var styleId;

        if (Config && Config.hasOwnProperty("zoomToFeature") && Config.zoomToFeature.hasOwnProperty("styleId")) {
            styleId = Config.zoomToFeature.styleId;
        }
        return styleId;
    },

    /**
     * gets style id from MapMarker
     * @returns {String} - Style id of mapMarker.
     */
    getStyleIdForMapMarkerPoint: function () {
        let styleId;

        if (Config && Config.hasOwnProperty("mapMarker") && Config.mapMarker.hasOwnProperty("mapMarkerStyleId")) {
            styleId = Config.mapMarker.mapMarkerStyleId;
        }
        return styleId;
    }
});

export default StyleList;
