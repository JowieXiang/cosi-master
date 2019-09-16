import template from "text-loader!./template.html";
import DistrictSelectorView from "./districtSelector/view";
import LayerFilterSelectorView from "./layerFilterSelector/view";
import VectorSource from "ol/source/Vector";
import { Fill, Stroke, Style } from "ol/style.js";
import LayerFilterModel from "./layerFilter/model";
import LayerFilterView from "./layerFilter/view";
import DistrictInfoView from "./districtInfo/view";
import DistrictInfoModel from "./districtInfo/model";

import LayerFilterCollection from "./layerFilter/list";

const CompareDistrictsView = Backbone.View.extend({
    events: {
        "click #add-filter": function (e) {
            this.addFilterModel(e);
            // this.addDistrictInfoTable(e);
        }

    },

    initialize: function () {

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
            "change:layerFilterList": this.setCompareFeatures
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
        this.$el.find("#selectors").append(this.districtSelector.render().el);
        this.layerFilterSelector = new LayerFilterSelectorView();
        this.$el.find("#selectors").append(this.layerFilterSelector.render().el);

    },

    addFilterModel: function () {
        // console.log(this.layerFilterSelector.getSelectedLayer());
        const layerInfo = this.layerFilterSelector.getSelectedLayer(),
            layerFilterModel = new LayerFilterModel({ layerInfo: layerInfo });
        // console.log("layerFilterModel added!");
        this.addOneToLayerFilterList(layerFilterModel);
        this.layerFilterCollection.add(layerFilterModel);
    },
    addDistrictInfoTable: function () {
        // console.log(this.$el.find(".table").html());
        if (this.$el.find(".table").html() == undefined) {
            const layerInfo = this.layerFilterSelector.getSelectedLayer(),
                districtInfoModel = new DistrictInfoModel({ layerInfo: layerInfo });

            this.districtInfoTable = new DistrictInfoView({ model: districtInfoModel });

            this.$el.find("#district-info-container").append(this.districtInfoTable.render().el);
        }
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

    addOneToLayerFilterList: function (model) {
        // console.log("model: ", model);

        // console.log("model.get(filter): ", model.get("filter"));
        const newItem = { layerId: model.get("layerInfo").layerId, filter: model.get("filter") },
            newList = this.model.get("layerFilterList") === "" ? [] : JSON.parse(this.model.get("layerFilterList"));

        newList.push(newItem);
        this.model.set("layerFilterList", JSON.stringify(newList));
        // console.log("newList: ", newList);
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
            // this.model.set("layerFilterList", []); // have to reset the field in order to trigger change event
            this.model.set("layerFilterList", JSON.stringify(newList));
            // console.log("update filterList: ", this.model.get("layerFilterList"));
        }
    },
    setCompareFeatures: function (model, value) {
        if (value !== "") {
            const layerFilterList = JSON.parse(value);
            // var empty = true;


            // _.each(layerFilterList, layerFilter => {
            //     // console.log("layerFilter.filter: ", layerFilter);
            //     if (layerFilter.filter !== "") {
            //         empty = false;
            //         return null;
            //     }
            // });
            // // console.log("filterNum: ", filterNum);

            // if (!empty) {
            var results = [],
                intersection = [],
                comparableFeatures = [],
                resultNames = [];

            // console.log("layerFilterList: ", value);

            _.each(layerFilterList, layerFilter => {

                resultNames.push(this.filterOne(layerFilter).map(feature => feature.getProperties().stadtteil));
                results.push(this.filterOne(layerFilter));
                // console.log("results: ", results);

            }, this);
            comparableFeatures = results[0];

            if (results.length > 1) {
                intersection = _.intersection(...resultNames);
                comparableFeatures = results[0].filter(feature => _.contains(intersection, feature.getProperties().stadtteil));
            }
            this.showComparableDistricts(comparableFeatures);
            // }
        }
    },

    filterOne: function (layerFilter) {
        const layerId = layerFilter.layerId,
            refDistrictName = this.districtSelector.getSelectedDistrict(),
            featureCollection = Radio.request("FeatureLoader", "getFeaturesByLayerId", layerId),
            refFeature = featureCollection.filter(feature => feature.getProperties().stadtteil === refDistrictName)[0],
            filterCollection = JSON.parse(layerFilter.filter);
        // console.log("refFeature: ", refFeature);
        var filterResults = [],
            intersection = [];
        // console.log("refDistrictName: ", refDistrictName);
        // console.log("layerFilter: ", layerFilter);

        _.each(Object.keys(filterCollection), filterKey => {
            const tolerance = parseFloat(filterCollection[filterKey]) * 0.01,
                bounds = this.getBounds(featureCollection, filterKey),
                selectedFeatures = featureCollection.filter(feature => Math.abs(feature.getProperties()[filterKey] - refFeature.getProperties()[filterKey]) / bounds < tolerance);
            // console.log("tolerance: ", tolerance);

            filterResults.push(selectedFeatures);
            // console.log("filterResults: ", filterResults[0]);
            // console.log("filterResults.length: ", filterResults.length);

        }, this);
        if (filterResults.length > 1) {
            intersection = _.intersection(...filterResults);
            return intersection;
        }

        return filterResults[0];
    },

    showComparableDistricts: function (districtFeatures) {
        var mapLayer = Radio.request("Map", "getLayerByName", this.model.get("mapLayerName"));

        mapLayer.getSource().clear();
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
    },
    getBounds: function (features, filterKey) {
        const values = features.map(feature => parseFloat(feature.getProperties()[filterKey])),
            bounds = Math.max(...values) - Math.min(...values);

        return bounds;
    },

    createMapLayer: function (name) {
        const newLayer = Radio.request("Map", "createLayerIfNotExists", name),
            newSource = new VectorSource();

        newLayer.setSource(newSource);
        newLayer.setVisible(false);
    }

});


export default CompareDistrictsView;
