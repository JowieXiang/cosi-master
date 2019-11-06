const bboxSettor = Backbone.Model.extend({
    defaults: {
    },
    initialize: function () {
        const channel = Radio.channel("BboxSettor");

        channel.on({
            "setBboxGeometryToLayer": this.setBboxGeometryToLayer
        }, this);
    },
    /**
     * sets the bbox geometry for all vector layers and updates already loaded layers
     * @param {Object[]} itemList - all available vector layers(WFS)
     * @param {GeometryCollection} bboxGeometry - target geometry to be set as bbox
     * @returns {void}
     */
    setBboxGeometryToLayer: function (itemList, bboxGeometry) {
        const modelList = Radio.request("ModelList", "getCollection");

        itemList.forEach(function (item) {
            const model = modelList.get(item.id);

            // layer already exists in the model list
            if (model) {
                model.set("bboxGeometry", bboxGeometry);
                // updates layers that have already been loaded
                if (model.has("layer") && model.get("layer").getSource().getFeatures().length > 0) {
                    model.updateSource();
                }
            }
            // for layers that are not yet in the model list
            else {
                item.bboxGeometry = bboxGeometry;
            }
        }, this);
    }

});

export default bboxSettor;
