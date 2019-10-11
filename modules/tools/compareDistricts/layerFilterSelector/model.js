const LayerFilterSelectorModel = Backbone.Model.extend({
    defaults: {
        layerOptions: [], // all select options (vector layers in the map) e.g. [{layerName:"",layerId:""},...]
        selectedLayer: null, // selected option e.g. {layerName:"",layerId:""}
        urls: {
            "statgebiet": "https://geodienste.hamburg.de/HH_WFS_Statistische_Gebiete_Test",
            "stadtteile": ""
        }
    },

    initialize: function () {
        const currentSelector = Radio.request("SelectDistrict", "getSelector"),
            layers = Radio.request("RawLayerList", "getLayerListWhere", {
                url: this.get("urls")[currentSelector]
            }),
            layerOptions = layers.map(layer => {
                return {
                    "layerName": layer.get("name").replace(/ /g, "_"), "layerId": layer.get("id")
                };
            });

        this.setLayerOptions(layerOptions);
    },

    setSelectedLayer: function (value) {
        const selectedLayer = this.get("layerOptions").filter(layer => layer.layerName.replace(/ /g, "_") === value)[0];

        selectedLayer.layerName = selectedLayer.layerName.replace(/_/g, " ");
        this.set("selectedLayer", selectedLayer);
    },

    setLayerOptions: function (value) {
        this.set("layerOptions", value);
    },
    getSelectedLayer: function () {
        return this.get("selectedLayer");
    },
    getLayerOptions: function () {
        return this.get("layerOptions");
    }

});

export default LayerFilterSelectorModel;
