import Tool from "../../core/modelList/tool/model";
import SnippetDropdownModel from "../../snippets/dropdown/model";
import Geometry from "ol/geom/Geometry";
import Feature from "ol/Feature";
import * as Extent from "ol/extent";
import VectorSource from "ol/source/Vector";

const CalculateRatioModel = Tool.extend({
    defaults: _.extend({}, Tool.prototype.defaults, {
        deactivateGFI: true,
        renderToWindow: true,
        isCollapsed: undefined,
        isCurrentWin: undefined,
        tooltipMessage: "Gebiete zum Starten auswählen",
        data: {},
        result: {},
        area: {},
        numerators: {},
        denominators: {},
        numDropdownModel: {},
        numValues: {},
        denDropdownModel: {},
        denValues: {},
    }),
    initialize: function () {
        this.superInitialize();
        this.getActiveLayersWithValues();
        this.setDropdownSnippets({
            numerators: new SnippetDropdownModel({
                name: "Einrichtungen",
                type: "string",
                displayName: "Einrichtungstypen auswählen",
                values: _.allKeys(this.get("numValues")),
                snippetType: "dropdown",
                isMultiple: true,
                preselectedValues: _.allKeys(this.get("numValues"))[0]
            }),
            denominators: new SnippetDropdownModel({
                name: "Zielgruppe",
                type: "string",
                displayName: "Zielgruppen auswählen",
                values: _.allKeys(this.get("denValues")),
                snippetType: "dropdown",
                isMultiple: true,
                preselectedValues: _.allKeys(this.get("denValues"))[0]
            })
        });
        this.setNumerators();
        this.setDenominators();

        this.listenTo(this.get("numDropdownModel"), {
            "valuesChanged": this.setNumerators
        });
        this.listenTo(this.get("denDropdownModel"), {
            "valuesChanged": this.setDenominators
        });
        this.listenTo(Radio.channel("Layer"), {
            "layerVisibleChanged": this.getActiveLayersWithValues
        });
        this.on({
            "change:denValues": this.updateDropdownMenus,
            "change:numValues": this.updateDropdownMenus
        }, this);
    },
    getFeatureValues: function () {
        this.resetResults();

        const selectedDistricts = Radio.request("SelectDistrict", "getSelectedDistricts");
        let facilities,
            demographics,
            ratio;

        if (selectedDistricts) {
            _.each(selectedDistricts, (district) => {
                facilities = this.getFacilitiesInDistrict(district);
                demographics = this.getTargetDemographicsInDistrict(district);

                if (demographics >= 0) {
                    ratio = facilities.length / demographics;
                }
                else {
                    console.error("In dem ausgewählten Gebiet ist keine Population der Zielgruppe vorhanden");
                }
                this.setResultForDistrict(district.getProperties().stadtteil, ratio);
            });
        }
        else {
            alert("Bitte wählen Sie mindestens einen Stadtteil aus.");
        }

        this.trigger("renderResults");
    },
    getTargetDemographicsInDistrict: function (district) {
        const districtGeometry = district.getGeometry();
        let targetPopulation = 0;

        _.each(this.getDenominators(), (den) => {
            const layerId = this.get("denValues")[den],
                layer = Radio.request("ModelList", "getModelByAttributes", {id: layerId}),
                features = layer.get("layerSource").getFeatures(),
                featureInDistrict = features.filter((feature) => {
                    return Extent.containsExtent(Extent.buffer(districtGeometry.getExtent(), 10), feature.getGeometry().getExtent());
                });

            if (layer.get("correlationsField")) {
                switch (layer.get("correlationsField").type) {
                    case "abs":
                        targetPopulation += parseInt(featureInDistrict[0].getProperties()[layer.get("correlationsField").field], 10);
                        break;
                    case "rel":
                        alert("Feature not yet implemented");
                        break;
                    default:
                        alert("Entschuldigung! Der zu prüfende Layer besitzt keine gültige Spalte für Verhältsanalysen! Bitte wählen Sie einen anderen Layer aus!");
                }
            }
        });

        return targetPopulation;
    },
    getFacilitiesInDistrict: function (district) {
        const districtGeometry = district.getGeometry(),
            featuresInDistrict = [];

        _.each(this.getNumerators(), (num) => {
            const layerId = this.get("numValues")[num],
                features = Radio.request("ModelList", "getModelByAttributes", {id: layerId}).get("layerSource").getFeatures();

            _.each(features, (feature) => {
                const geometry = feature.getGeometry(),
                    coordinate = geometry.getType() === "Point" ? geometry.getCoordinates() : Extent.getCenter(geometry.getExtent()); // Remove later for more reliable fallback

                if (districtGeometry.intersectsCoordinate(coordinate)) {
                    featuresInDistrict.push(feature);
                }
            });
        });
        return featuresInDistrict;
    },
    getActiveLayersWithValues: function () {
        const collection = Radio.request("ModelList", "getCollection"),
            possibleDenominators = collection.where({type: "layer", isVisibleInMap: true, isDemographic: true}),
            possibleNumerators = collection.where({type: "layer", isVisibleInMap: true, isFacility: true});

        this.setDropdownValues(possibleNumerators, "numValues");
        this.setDropdownValues(possibleDenominators, "denValues");
    },
    setDropdownValues: function (models, field) {
        const values = this.remapModelsToValues(models);

        this.set(field, values);
    },
    remapModelsToValues: function (models) {
        const values = {};

        models.forEach((model) => {
            values[model.get("name")] = model.get("id");
        });

        return values;
    },
    updateDropdownMenus: function () {
        const numDropdownModel = this.get("numDropdownModel"),
            denDropdownModel = this.get("denDropdownModel");

        numDropdownModel.set("values", _.allKeys(this.get("numValues")));
        numDropdownModel.initialize();
        denDropdownModel.set("values", _.allKeys(this.get("denValues")));
        denDropdownModel.initialize();
    },
    setDropdownSnippets: function (values) {
        if (values.numerators) {
            this.set("numDropdownModel", values.numerators);
        }
        if (values.denominators) {
            this.set("denDropdownModel", values.denominators);
        }
    },
    setNumerators: function () {
        this.set("numerators", this.get("numDropdownModel").getSelectedValues());
    },
    setDenominators: function () {
        this.set("denominators", this.get("denDropdownModel").getSelectedValues());
    },
    getNumerators: function () {
        return this.get("numerators").values;
    },
    getDenominators: function () {
        return this.get("denominators").values;
    },
    setResultForDistrict: function (district, ratio) {
        this.get("result")[district] = ratio;
    },
    resetResults: function () {
        this.set("result", {});
    },
    getResults: function () {
        return this.get("result");
    }
});

export default CalculateRatioModel;