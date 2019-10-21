import template from "text-loader!./template.html";
import FilterView from "./filterSelector/view";
import FilterModel from "./filterSelector/model";
import DistrictSelectorView from "./districtSelector/view";
import FilterList from "./filterSelector/list";
import VectorSource from "ol/source/Vector";
import { Fill, Stroke, Style } from "ol/style.js";

const CompareDistrictsView = Backbone.View.extend({

    events: {
        "click #add-filter": "addFilterModel"
    },

    initialize: function () {
        this.createMapLayer(this.model.get("mapLayerName"));

        // create filter collection
        this.filterList = new FilterList();

        this.createDistrictSelectorView();

        this.listenTo(this.model, {
            "change:isActive": function (model, value) {
                if (value) {
                    this.render();
                    this.filterList.reset();
                }
            },
            "change:layerFilterList": this.setCompareFeatures
        });

        this.listenTo(this.filterList, {
            "change:layerFilter": this.updateLayerFilterList,
            "change:selectedLayer": function () {
                this.resetLayerFilterList();
            },
            "add": this.addFilterView
        });

        this.listenTo(this.model, {
            "change:isActive": function (model, value) {
                if (value) {
                    this.selectDistrictReminder();
                    this.model.set("layerFilterList", "");
                }
            }
        });

    },

    template: _.template(template),

    render: function () {
        var attr;

        if (this.model.get("isActive") === true) {
            attr = this.model.toJSON();
            this.setElement(document.getElementsByClassName("win-body")[0]);
            this.$el.html(this.template(attr));
            this.renderDistrictSelectorView(this.districtSelector);
            this.delegateEvents();
        }
        else {
            this.$el.empty();
            this.undelegateEvents();
        }
        return this;
    },

    createMapLayer: function (name) {
        const newLayer = Radio.request("Map", "createLayerIfNotExists", name),
            newSource = new VectorSource();

        newLayer.setSource(newSource);
        newLayer.setVisible(false);
    },

    resetLayerFilterList: function () {
        const newList = [];

        this.filterList.forEach(filter => {
            newList.push(JSON.parse(filter.get("layerFilter")));
        });

        this.model.set("layerFilterList", JSON.stringify(newList));
    },

    updateLayerFilterList: function (filterModel) {

        if (this.model.get("layerFilterList").length === 0) {
            this.resetLayerFilterList();
        }
        const layerId = filterModel.attributes.selectedLayer.layerId;
        var newList = JSON.parse(this.model.get("layerFilterList"));

        _.each(newList, layerFilter => {
            if (layerFilter.layerId === layerId) {
                // console.log("layerFilters: ", filterModel.attributes.layerFilter);
                // console.log("layerFilter.filter: ", layerFilter.filter);
                // console.log("filterModel.attributes.layerFilter.filter: ", JSON.parse(filterModel.attributes.layerFilter).filter);

                layerFilter.filter = JSON.parse(filterModel.attributes.layerFilter).filter;
            }
        });
        // this.model.set("layerFilterList", []); // have to reset the field in order to trigger change event
        this.model.set("layerFilterList", JSON.stringify(newList));
        // console.log("update filterList: ", this.model.get("layerFilterList"));

    },

    // todo
    setCompareFeatures: function (model, value) {
        // var filterArray = [];
        if (value.length > 0) {
            var results = [],
                intersection = [],
                comparableFeatures = [],
                resultNames = [];
            const layerFilterList = JSON.parse(value);


            _.each(layerFilterList, layerFilter => {
                // this.filterOne(layerFilter);
                resultNames.push(this.filterOne(layerFilter).map(feature => feature.getProperties().stadtteil));
                results.push(this.filterOne(layerFilter));
            }, this);
            // console.log("results: ", results);

            comparableFeatures = results[0];
            // console.log("newFeatures1: ", comparableFeatures);
            // console.log(result);
            if (results.length > 1) {
                // console.log("...results: ", ...results);

                intersection = _.intersection(...resultNames);
                // console.log("newFeatures2: ", intersection);

                comparableFeatures = results[0].filter(feature => _.contains(intersection, feature.getProperties().stadtteil));
            }
            // console.log("newFeatures2: ", comparableFeatures);
            this.showComparableDistricts(comparableFeatures);
        }
    },

    filterOne: function (layerFilter) {
        const layerId = layerFilter.layerId,
            refDistrictName = this.districtSelector.getSelectedDistrict(),
            featureCollection = Radio.request("FeatureLoader", "getFeaturesByLayerId", layerId),
            refFeature = featureCollection.filter(feature => feature.getProperties().stadtteil === refDistrictName)[0];
        var filterResults = [],
            intersection = [];
        // console.log("layerFilter.filter: ", layerFilter.filter);
        // console.log("refDistrictName: ", refDistrictName);

        // console.log("refFeature: ", refFeature);

        _.each(Object.keys(layerFilter.filter), filterKey => {
            const tolerance = parseFloat(layerFilter.filter[filterKey]) * 0.001,
                bounds = this.getBounds(featureCollection, filterKey),
                selectedFeatures = featureCollection.filter(feature => Math.abs(feature.getProperties()[filterKey] - refFeature.getProperties()[filterKey]) / bounds < tolerance);

            filterResults.push(selectedFeatures);
            console.log("filterResults: ", filterResults[0]);
            console.log("filterResults.length: ", filterResults.length);

        }, this);
        if (filterResults.length > 1) {
            intersection = _.intersection(...filterResults);
            return intersection;
        }
        // console.log("filterResults: ", JSON.stringify(filterResults[0]));
        // console.log("filterResults[0]", filterResults[0]);
        return filterResults[0];
    },

    showComparableDistricts: function (districtFeatures) {
        var mapLayer = Radio.request("Map", "getLayerByName", this.model.get("mapLayerName"));

        _.each(districtFeatures, (feature) => {
            feature.setStyle(new Style({
                fill: new Fill({
                    color: [8, 119, 95, 0.3]
                }),
                stroke: new Stroke({
                    color: [8, 119, 95, 0.3],
                    width: 3
                })
            }));
        });
        mapLayer.setVisible(true);

        mapLayer.getSource().addFeatures(districtFeatures);
        console.log("feature added");
    },
    getBounds: function (features, filterKey) {
        const values = features.map(feature => parseFloat(feature.getProperties()[filterKey])),
            bounds = Math.max(...values) - Math.min(...values);

        return bounds;
    },

    // setSelectedLayers: function () {
    //     const selectedLayers = this.filterList.map((filter) => {
    //         return filter.get("selectedLayer");
    //     });

    //     this.model.setSelectedLayers(selectedLayers);
    // },

    addFilterModel: function () {
        const filterModel = new FilterModel();

        this.filterList.add(filterModel);
    },

    addFilterView: function (model) {

        const filterView = new FilterView({ model: model });

        this.$el.find("#filter-container").append(filterView.render().el);
    },

    createDistrictSelectorView: function () {
        this.districtSelector = new DistrictSelectorView();
    },

    renderDistrictSelectorView: function (districtSelector) {
        this.$el.find("#district-selector-container").append(districtSelector.render().el);
    },

    // reminds user to select district before using the ageGroup slider
    selectDistrictReminder: function () {
        const selectedDistricts = Radio.request("SelectDistrict", "getSelectedDistricts");

        if (selectedDistricts.length === 0) {
            Radio.trigger("Alert", "alert", {
                text: "<strong> Bitte wählen Sie zuerst die Gebiet mit 'Gebiet wählen' im Werkzeugmenü aus</strong>",
                kategorie: "alert-warning"
            });
        }
    },

    setLayerFilterList: function () {
        var newDataList = [];

        this.filterList.forEach(filter => {
            if (filter.get("filterData")) {
                newDataList = [].concat(newDataList, filter.get("filterData"));
            }
        });
        this.model.set("layerFilterList", newDataList);
    },

    filterlayerNames: function (changedModel) {
        this.filterList.forEach(filter => {
            filter.filterlayerNames(changedModel.get("selectedLayer"));
        });
    }
});


export default CompareDistrictsView;
