const FilterModel = Backbone.Model.extend({
    defaults: {
        selectOptions: []
    },
    initialize: function () {

        this.listenTo(Radio.channel("Map"), {
            "isReady": function () {
                const layers = Radio.request("Parser", "getItemsByAttributes", { typ: "WFS" }),
                    layerNames = layers.map(layer => layer.name);

                this.setSelectOptions(layerNames);
            }
        });

    },
    setSelectOptions: function (value) {
        this.set("selectOptions", value);
    }

});

export default FilterModel;
