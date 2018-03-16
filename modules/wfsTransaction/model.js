define(function (require) {

    var WFSTransaction = Backbone.Model.extend({

        /**
         * inits the radio channel for this model and registers the events
         */
        initialize: function () {
            var channel = Radio.channel("wfsTransaction");

            channel.on({
                "transact": this.transact
            }, this);
        },

        /**
         * executes the wfs transaction
         * @param  {String} layerId
         * @param  {String} featureId
         * @param  {String} mode - transaction mode insert|update|delete
         * @param  {Object} attributes - feature attributes to be changed
         */
        transact: function (layerId, featureId, mode, attributes) {
            var model = Radio.request("ModelList", "getModelByAttributes", {id: layerId}),
                feature,
                xmlString,
                dom;

            if (!_.isUndefined(model)) {
                feature = model.getLayer().getSource().getFeatureById(featureId);
                feature.setProperties(attributes);
                dom = this.writeTransaction(mode, [feature], this.getWriteOptions(model));
                xmlString = new XMLSerializer().serializeToString(dom);
                xmlString = xmlString.replace(/<Name>/g, "<Name>app:");
                this.sendRequest(model.get("url"), xmlString);
            }
        },

        /**
         * writes a WFS Transaction and return the DOM.
         * @param  {String} mode - transaction mode insert|update|delete
         * @param  {ol.Feature[]} features - features to insert, udpate or delete
         * @param  {Object} writeOptions
         * @return {DOM}
         */
        writeTransaction: function (mode, features, writeOptions) {
            var formatWFS = new ol.format.WFS(),
                dom;

            switch(mode) {
                case "insert": {
                    dom = formatWFS.writeTransaction(features, null, null, writeOptions);
                    break;
                }
                case "delete": {
                    dom = formatWFS.writeTransaction(null, null, features, writeOptions);
                    break;
                }
                case "update": {
                    dom = formatWFS.writeTransaction(null, features, null, writeOptions);
                    break;
                }
            }
            return dom;
        },

        /**
         * gets the write options for wfs transaction
         * @param  {Backbone.Model} model
         * @return {Object}
         */
        getWriteOptions: function (model) {
            return {
                featureNS: model.get("featureNS"),
                featureType: model.get("featureType"),
                featurePrefix: "app",
                srsName: "EPSG:25832"
            }
        },

        /**
         * sends a async POST request
         * @param  {String} url
         * @param  {String} data
         */
        sendRequest: function (url, data) {
            $.ajax(Radio.request("Util", "getProxyURL", url), {
                type: "POST",
                dataType: "xml",
                service: "WFS",
                processData: false,
                contentType: "text/xml",
                data: data
            });
        }
    });

    return WFSTransaction;
});
