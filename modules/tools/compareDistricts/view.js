import template from "text-loader!./template.html";
import DistrictSelectorView from "./districtSelector/view";
import LayerFilterSelectorModel from "./layerFilterSelector/model";
import LayerFilterSelectorView from "./layerFilterSelector/view";
import VectorSource from "ol/source/Vector";
import { Fill, Stroke, Style } from "ol/style.js";
import LayerFilterModel from "./layerFilter/model";
import LayerFilterView from "./layerFilter/view";
import LayerFilterCollection from "./layerFilter/list";

const CompareDistrictsView = Backbone.View.extend({
    events: {
        "click #add-filter": function (e) {
            this.setRefDistrict();
            this.addFilterModel(e);
            this.filterLayerOptions();
        },
        "click #compare-results": "zoomToDistrict"
    },

    initialize: function () {
        const channel = Radio.channel("CompareDistricts");

        this.listenTo(channel, {
            "closeFilter": this.addLayerOption
        });
        this.listenTo(this.model, {
            "change:isActive": function (model, value) {
                this.createMapLayer(this.model.get("mapLayerName"));
                this.layerFilterCollection = new LayerFilterCollection();
                this.listenTo(this.layerFilterCollection, {
                    "add": this.renderLayerFilter,
                    "destroy": this.modelDestroy,
                    "change:filter": this.updateLayerFilterList
                });
                if (value) {
                    this.selectDistrictReminder();
                    this.render();
                }
                else {
                    this.$el.empty();
                    this.undelegateEvents();
                    this.model.set("layerFilterList", "");
                }
            },
            "change:layerFilterList": function (model, value) {
                if (this.model.get("layerFilterList") !== "") {
                    this.setCompareFeatures(model, value);
                }
            }
        });
    },

    template: _.template(template),

    render: function () {
        var attr;

        attr = this.model.toJSON();
        this.setElement(document.getElementsByClassName("win-body")[0]);
        this.$el.html(this.template(attr));
        this.delegateEvents();

        this.createSelectors();

        return this;
    },

    // reminds user to select district before using the ageGroup slider
    selectDistrictReminder: function () {
        const selectedDistricts = Radio.request("SelectDistrict", "getSelectedDistricts");

        if (selectedDistricts.length === 0) {
            Radio.trigger("Alert", "alert", {
                text: "<strong> Bitte wählen Sie zuerst die Bezirke mit 'Gebiet wählen' im Werkzeugmenü aus</strong>",
                kategorie: "alert-warning"
            });
        }
    },

    createSelectors: function () {
        this.districtSelector = new DistrictSelectorView();
        this.$el.find("#district-selector-container").append(this.districtSelector.render().el);
        this.layerFilterSelector = new LayerFilterSelectorView({ model: new LayerFilterSelectorModel() });
        this.$el.find("#layerfilter-selector-container").append(this.layerFilterSelector.render().el);
    },

    addFilterModel: function () {
        const layerInfo = this.layerFilterSelector.getSelectedLayer(),
            layerFilterModel = new LayerFilterModel({ layerInfo: layerInfo });

        this.addOneToLayerFilterList(layerFilterModel);
        this.layerFilterCollection.add(layerFilterModel);
    },
    filterLayerOptions: function () {
        const selectedLayer = this.layerFilterSelector.getSelectedLayer(),
            layerOptions = this.layerFilterSelector.getLayerOptions(),
            newOptions = layerOptions.filter(layer => layer.layerId !== selectedLayer.layerId);

        this.layerFilterSelector.setLayerOptions(newOptions);
        this.layerFilterSelector.render();
        this.layerFilterSelector.clearSelectedLayer();
        // this.$el.find("#layerfilter-selector-container").empty();
        // this.$el.find("#layerfilter-selector-container").append(this.layerFilterSelector.render().el);
    },
    addLayerOption: function (layerInfo) {
        const newOptions = this.layerFilterSelector.getLayerOptions();

        newOptions.push(layerInfo);
        this.layerFilterSelector.setLayerOptions(newOptions);
        this.layerFilterSelector.render();
    },
    renderLayerFilter: function (model) {
        const layerFilterView = new LayerFilterView({ model: model });

        this.$el.find("#layerfilter-container").append(layerFilterView.render().el);
    },

    modelDestroy: function (model) {
        this.removeOneFromLayerFilterList(model);
    },

    removeOneFromLayerFilterList: function (model) {
        const layerId = model.get("layerInfo").layerId;
        var newList = JSON.parse(this.model.get("layerFilterList"));

        newList = newList.filter((item) => {
            return item.layerId !== layerId;
        });
        this.model.set("layerFilterList", JSON.stringify(newList));
    },
    setRefDistrict: function () {
        this.model.set("refDistrict", this.districtSelector.getSelectedDistrict());
        this.$el.find("#refdistrict").html(`
        <span class="name-tag">${this.model.get("refDistrict")}</span>
        `);
    },
    setCompareResults: function (comparableDistricts) {
        let domString = "";

        this.$el.find("#compare-results").empty();
        _.each(comparableDistricts, district => {
            domString += `<span class="name-tag">${district} </span>`;
        });
        this.$el.find("#compare-results").append(domString);
    },
    addOneToLayerFilterList: function (model) {
        const newItem = { layerId: model.get("layerInfo").layerId, filter: model.get("filter") },
            newList = this.model.get("layerFilterList") === "" ? [] : JSON.parse(this.model.get("layerFilterList"));

        newList.push(newItem);
        this.model.set("layerFilterList", JSON.stringify(newList));
    },

    updateLayerFilterList: function (model) {
        if (this.model.get("layerFilterList") !== "") {
            const newList = JSON.parse(this.model.get("layerFilterList")),
                layerId = model.get("layerInfo").layerId;

            _.each(newList, layerFilter => {
                if (layerFilter.layerId === layerId) {
                    layerFilter.filter = model.get("filter");
                }
            });
            this.model.set("layerFilterList", JSON.stringify(newList));
        }
    },
    setCompareFeatures: function (model, value) {
        if (JSON.parse(value).length > 0) {
            const layerFilterList = JSON.parse(value),
                selector = Radio.request("SelectDistrict", "getSelector") === "statgebiet" ? "stat_gebiet" : Radio.request("SelectDistrict", "getSelector"),
                results = [],
                resultNames = [];
            let intersection = [],
                comparableFeatures = [];

            _.each(layerFilterList, layerFilter => {
                resultNames.push(this.filterOne(layerFilter).map(feature => feature.getProperties()[selector]));
                results.push(this.filterOne(layerFilter));
            }, this);
            comparableFeatures = results[0];
            if (results.length > 1) {
                intersection = _.intersection(...resultNames);
                comparableFeatures = results[0].filter(feature => _.contains(intersection, feature.getProperties()[selector]));
                this.setCompareResults(intersection);
            }
            else {
                this.setCompareResults(resultNames.flat());
            }
            this.showComparableDistricts(comparableFeatures);
        }
    },

    filterOne: function (layerFilter) {
        const selector = Radio.request("SelectDistrict", "getSelector") === "statgebiet" ? "stat_gebiet" : Radio.request("SelectDistrict", "getSelector"),
            layerId = layerFilter.layerId,
            refDistrictName = this.districtSelector.getSelectedDistrict(),
            featureCollection = Radio.request("FeaturesLoader", "getAllFeaturesByAttribute", { id: layerId }),
            refFeature = featureCollection.filter(feature => feature.getProperties()[selector] === refDistrictName)[0],
            filterCollection = JSON.parse(layerFilter.filter);
        var filterResults = [],
            intersection = [];

        _.each(Object.keys(filterCollection), filterKey => {
            const tolerance = parseFloat(filterCollection[filterKey]),
                selectedFeatures = featureCollection.filter(feature => Math.abs(feature.getProperties()[filterKey] - refFeature.getProperties()[filterKey]) < tolerance);

            filterResults.push(selectedFeatures);

        }, this);
        if (filterResults.length > 1) {
            intersection = _.intersection(...filterResults);
            return intersection;
        }

        return filterResults[0];
    },

    showComparableDistricts: function (districtFeatures) {
        const mapLayer = Radio.request("Map", "getLayerByName", this.model.get("mapLayerName")),
            cloneCollection = [];

        mapLayer.getSource().clear();
        _.each(districtFeatures, (feature) => {
            const featureClone = feature.clone();

            featureClone.setStyle(new Style({
                fill: new Fill({
                    color: [8, 119, 95, 0.3]
                }),
                stroke: new Stroke({
                    color: [8, 119, 95, 0.3],
                    width: 3
                })
            }));
            cloneCollection.push(featureClone);
        });
        mapLayer.setVisible(true);
        mapLayer.getSource().addFeatures(cloneCollection);
    },

    createMapLayer: function (name) {
        const newLayer = Radio.request("Map", "createLayerIfNotExists", name),
            newSource = new VectorSource();

        newLayer.setSource(newSource);
        newLayer.setVisible(false);
    },

    zoomToDistrict (evt) {
        Radio.trigger("SelectDistrict", "zoomToDistrict", evt.target.innerHTML.trim(), false);
    }

});


export default CompareDistrictsView;
