import template from "text-loader!./template.html";
import "./style.less";
import DistrictSelectorView from "./districtSelector/view";
import LayerFilterSelectorModel from "./layerFilterSelector/model";
import LayerFilterSelectorView from "./layerFilterSelector/view";
import VectorSource from "ol/source/Vector";
import LayerFilterModel from "./layerFilter/model";
import LayerFilterView from "./layerFilter/view";
import LayerFilterCollection from "./layerFilter/list";
import InfoTemplate from "text-loader!./info.html";

const CompareDistrictsView = Backbone.View.extend({
    events: {
        "click #add-filter": function () {
            this.checkSelected();
        },
        "click .district-name": "zoomToDistrict",
        "click #help": "showHelp",
        "click #set-selected-district": "changeDistrictSelection",
        "click #show-in-dashboard": "showInDashboard"
    },

    initialize: function () {
        const channel = Radio.channel("CompareDistricts");

        this.listenTo(channel, {
            "closeFilter": this.addLayerOption,
            "selectRefDistrict": function () {
                this.setRefDistrict();
                this.updateLayerFilterCollection();
            }
        });
        this.listenTo(this.model, {
            "change:isActive": function (model, value) {
                this.createMapLayer(this.model.get("mapLayerName"));
                this.layerFilterCollection = new LayerFilterCollection();
                this.listenTo(this.layerFilterCollection, {
                    "add": this.renderLayerFilter,
                    "destroy": this.modelDestroy,
                    "change": this.updateLayerFilterList
                });
                if (value) {
                    // this.selectDistrictReminder();
                    this.render();
                }
                else {
                    this.$el.empty();
                    this.undelegateEvents();
                    this.model.set("layerFilterList", "");
                    Radio.trigger("Alert", "alert:remove");
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
        // disable buttons
        this.$el.find("#show-in-dashboard").hide();
        this.$el.find("#set-selected-district").hide();
        this.createSelectors();

        return this;
    },
    // reminds user to select district before using the ageGroup slider
    selectFilterReminder: function () {
        Radio.trigger("Alert", "alert", {
            text: "<strong> Please select the layer filter you want to add in the layerfilter dropdown menu</strong>",
            kategorie: "alert-warning"
        });
    },
    updateLayerFilterCollection: function () {
        this.layerFilterCollection.each(function (layerFilter) {
            layerFilter.updateRefDistrictValue();
        });
    },
    createSelectors: function () {
        this.$el.find("#district-selector-container").empty();
        this.districtSelector = new DistrictSelectorView();
        this.$el.find("#district-selector-container").append(this.districtSelector.render().el);

        this.layerFilterSelector = new LayerFilterSelectorView({ model: new LayerFilterSelectorModel() });
        this.$el.find("#layerfilter-selector-container").append(this.layerFilterSelector.render().el);
    },
    checkSelected: function () {
        if (this.layerFilterSelector.getSelectedLayer()) {
            Radio.trigger("Alert", "alert:remove");
            this.addFilterModel();
            this.filterLayerOptions();
        }
        else {
            this.selectFilterReminder();
        }
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
        const refDistrictName = Radio.request("DistrictSelector", "getSelectedDistrict"),
            domObj = this.$el.find("#reference-district");

        if (refDistrictName !== "Leeren") {
            domObj.empty();
            domObj.append("<p><strong>Referenzgebiet: </strong></p>");
            domObj.append(`<span class="name-tag district-name">${refDistrictName} </span>`);
            this.showRefDistrict(refDistrictName);
        }
        else {
            domObj.empty();
            this.model.set("refDistrict", null);
        }
    },
    setCompareResults: function (comparableDistricts) {
        let domString = "<p>";

        this.$el.find("#compare-results").empty();
        _.each(comparableDistricts, district => {
            domString += `<span class="name-tag district-name">${district} </span>`;
        });
        domString += "</p>";
        this.$el.find("#compare-results").append("<p><strong>Vergleichbare Gebiete: </strong></p>");
        this.$el.find("#compare-results").append(domString);
        if (comparableDistricts.length > 0) {
            this.$el.find("#set-selected-district").show();
            this.$el.find("#show-in-dashboard").show();
        }
    },
    addOneToLayerFilterList: function (model) {
        const newItem = { layerId: model.get("layerInfo").layerId, filter: model.get("filter"), districtInfo: model.get("districtInfo") },
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
                    layerFilter.districtInfo = model.get("districtInfo");
                }
            });
            this.model.set("layerFilterList", JSON.stringify(newList));
        }
    },
    setCompareFeatures: function (model, value) {
        if (JSON.parse(value).length > 0) {
            const layerFilterList = JSON.parse(value),
                selector = Radio.request("SelectDistrict", "getSelector"),
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
                this.model.set("comparableFeaturesNames", intersection);
                this.setCompareResults(intersection);
            }
            else {
                this.setCompareResults(resultNames.flat());
                this.model.set("comparableFeaturesNames", resultNames.flat());
            }
            this.showComparableDistricts(comparableFeatures);
        }
        else {
            this.$el.find("#compare-results").empty();
            this.$el.find("#show-in-dashboard").hide();
            this.$el.find("#set-selected-district").hide();
            this.clearMapLayer();
        }
    },
    filterOne: function (layerFilter) {
        var filterResults = [],
            intersection = [];
        const layerId = layerFilter.layerId,
            featureCollection = Radio.request("FeaturesLoader", "getAllFeaturesByAttribute", {
                id: layerId
            }),
            filterCollection = JSON.parse(layerFilter.filter);

        _.each(Object.keys(filterCollection), filterKey => {
            const tolerance = [parseFloat(filterCollection[filterKey][0]), parseFloat(filterCollection[filterKey][1])],
                refValue = layerFilter.districtInfo.filter(item => item.key === filterKey)[0].value,
                selectedFeatures = featureCollection.filter(feature => {
                    return feature.getProperties()[filterKey] >= refValue - tolerance[0]
                        && feature.getProperties()[filterKey] <= refValue + tolerance[1]
                        && feature.getProperties()[Radio.request("SelectDistrict", "getSelector")] !== Radio.request("DistrictSelector", "getSelectedDistrict");
                });

            filterResults.push(selectedFeatures);
        }, this);
        if (filterResults.length > 1) {
            intersection = _.intersection(...filterResults);
            return intersection;
        }
        return filterResults[0];
    },
    clearMapLayer: function () {
        const mapLayer = Radio.request("Map", "getLayerByName", this.model.get("mapLayerName"));

        mapLayer.getSource().clear();
    },
    showRefDistrict: function (refDistrictName) {
        /**
         * should add a radio function in the FeatureLoader module!!!
         */
        const mapLayer = Radio.request("Map", "getLayerByName", this.model.get("mapLayerName")),
            scope = Radio.request("SelectDistrict", "getScope"),
            districtLayer = Radio.request("ModelList", "getModelByAttributes", { "name": scope }),
            selector = Radio.request("SelectDistrict", "getDistrictLayer").filter(item => item.name === scope)[0].selector,
            featureCollection = districtLayer.get("layer").getSource().getFeatures(),
            refDistrict = featureCollection.filter(feature => feature.getProperties()[selector] === refDistrictName)[0],
            featureClone = refDistrict.clone();

        this.clearMapLayer();
        featureClone.setStyle(this.model.get("selectedStyle"));
        mapLayer.setVisible(true);
        mapLayer.getSource().addFeature(featureClone);
        this.model.set("refDistrict", refDistrict);
    },
    showComparableDistricts: function (districtFeatures) {
        const mapLayer = Radio.request("Map", "getLayerByName", this.model.get("mapLayerName")),
            cloneCollection = [];

        this.clearMapLayer();
        _.each(districtFeatures, (feature) => {
            const featureClone = feature.clone();

            featureClone.setStyle(this.model.get("selectedStyle"));
            cloneCollection.push(featureClone);
        });
        //  add refDistrict feature to the collection
        if (this.model.get("refDistrict")) {
            const refDistrictClone = this.model.get("refDistrict").clone();

            refDistrictClone.setStyle(this.model.get("selectedStyle"));
            cloneCollection.push(refDistrictClone);
        }
        mapLayer.setVisible(true);
        mapLayer.getSource().addFeatures(cloneCollection);
    },

    createMapLayer: function (name) {
        const newLayer = Radio.request("Map", "createLayerIfNotExists", name),
            newSource = new VectorSource();

        newLayer.setSource(newSource);
        newLayer.setVisible(false);
    },

    zoomToDistrict: function (evt) {
        Radio.trigger("SelectDistrict", "zoomToDistrict", evt.target.innerHTML.trim(), false);
    },

    showHelp: function () {
        Radio.trigger("Alert", "alert:remove");
        Radio.trigger("Alert", "alert", {
            text: InfoTemplate,
            kategorie: "alert-info"
        });

        $(".infoBox a").hover(function () {
            $($(this).attr("data")).css({
                "text-decoration": "underline"
            });
        }, function () {
            $($(this).attr("data")).css({
                "text-decoration": "none"
            });
        });
    },
    changeDistrictSelection: function () {
        const scope = Radio.request("SelectDistrict", "getScope"),
            districtLayer = Radio.request("ModelList", "getModelByAttributes", { "name": scope }),
            selector = Radio.request("SelectDistrict", "getDistrictLayer").filter(item => item.name === scope)[0].selector,
            featureCollection = districtLayer.get("layer").getSource().getFeatures(),
            selectedFeatures = featureCollection.filter(feature => _.contains(this.model.get("comparableFeaturesNames"), feature.getProperties()[selector]));

        if (this.model.get("refDistrict")) {
            selectedFeatures.push(this.model.get("refDistrict"));
        }
        Radio.request("SelectDistrict", "setSelectedDistrictsToFeatures", selectedFeatures);
    },
    showInDashboard: function () {
        const resultsClone = this.$el.find("#results").clone();

        Radio.trigger("Dashboard", "destroyWidgetById", "compareDistricts");
        Radio.trigger("Dashboard", "append", resultsClone, "#dashboard-containers", {
            id: "compareDistricts",
            name: "Vergleichbare Gebiete ermitteln",
            glyphicon: "glyphicon-screenshot"
        });
    }
});


export default CompareDistrictsView;
