import FilterTemplate from "text-loader!./template.html";
import FilterSliderList from "./filterSlider/list";
import FilterSliderModel from "./filterSlider/model";
import FilterSliderView from "./filterSlider/view";


const FilterView = Backbone.View.extend({
    events: {
        "change select": "setSelectedLayer"
    },

    initialize: function () {

        this.filterSliderList = new FilterSliderList();

        this.listenTo(this.model, {
            "change:layerOptions": this.render,
            "change:selectedLayer": function (model, value) {
                this.resetAllSliders(value);
                this.resetLayerFilter();
                this.setLayerFilter();
            }
        });

        this.listenTo(this.filterSliderList, {
            "add": this.addFilterSliderView,
            "change:sliderValue": this.updateLayerFilter
        });
    },

    tagName: "div",
    className: "selection-container",

    // model: new FilterSelectorModel(),
    template: _.template(FilterTemplate),

    render: function () {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },

    setSelectedLayer: function (evt) {
        this.model.setSelectedLayer(evt.target.value);
    },

    resetAllSliders: function (layerInfo) {
        this.$el.find("#filter-slider-container").empty();
        this.filterSliderList.reset();
        const selectedLayer = Radio.request("Parser", "getItemByAttributes", { id: layerInfo.layerId });

        if (selectedLayer !== undefined) {
            const keys = selectedLayer.mouseHoverField;

            _.each(keys, key => {
                this.addOneSlider(key);
            }, this);
        }

    },

    resetLayerFilter: function () {
        this.model.set("layerFilter", "");

    },

    setLayerFilter: function () {
        const layerInfo = this.model.get("selectedLayer"),
            selectedLayer = Radio.request("Parser", "getItemByAttributes", { id: layerInfo.layerId });
        var newLayerFilter = { layerId: layerInfo.layerId, filter: {} };

        if (selectedLayer !== undefined) {
            const keys = selectedLayer.mouseHoverField;

            _.each(keys, key => {
                newLayerFilter.filter[key] = 0;
                // console.log("newLayerFilter.filter[key]: ", newLayerFilter.filter[key]);
            });
        }
        else {
            alert("please make sure the WFS layer is in the map")
        }
        this.model.set("layerFilter", JSON.stringify(newLayerFilter));


    },

    updateLayerFilter: function (sliderModel) {

        const key = sliderModel.attributes.key;
        // console.log(this.model.get("layerFilter"));
        var newLayerFilter = JSON.parse(this.model.get("layerFilter"));

        newLayerFilter.filter[key] = sliderModel.attributes.sliderValue;
        // this.model.set("layerFilter", ""); // have to reset the field in order to trigger change event

        this.model.set("layerFilter", JSON.stringify(newLayerFilter));
    },

    addOneSlider: function (key) {
        const newSliderModel = new FilterSliderModel({ key: key }),
            silderView = new FilterSliderView({ model: newSliderModel });

        this.filterSliderList.add(newSliderModel);
        this.$el.find("#filter-slider-container").append(silderView.render().el);
    }

});

export default FilterView;