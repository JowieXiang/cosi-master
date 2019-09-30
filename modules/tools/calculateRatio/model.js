import Tool from "../../core/modelList/tool/model";
import SnippetDropdownModel from "../../snippets/dropdown/model";
import AdjustParameterView from "../../snippets/adjustParameter/view";
import ExportButtonModel from "../../snippets/exportButton/model";
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
        results: {},
        area: {},
        initialDemographicLayers: [],
        numerators: {},
        denominators: {},
        resolution: 1000,
        numDropdownModel: {},
        numValues: {},
        denDropdownModel: {},
        denValues: {},
        message: "",
        adjustParameterViews: [],
        exportButtonModel: {}
    }),
    initialize: function () {
        this.superInitialize();

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

        this.listenTo(this.get("numDropdownModel"), {
            "valuesChanged": this.setNumerators
        });
        this.listenTo(this.get("denDropdownModel"), {
            "valuesChanged": this.setDenominators
        });
        this.listenTo(this, {
            "change:numerators": this.updateModifiers
        });
        this.listenTo(Radio.channel("Layer"), {
            "layerVisibleChanged": this.getActiveLayersWithValues
        });
        this.listenTo(Radio.channel("Map"), {
            "isReady": function () {
                this.getActiveLayersWithValues();
                this.updateDropdownMenus();
            }
        }, this);
        this.on({
            "change:denValues": this.updateDropdownMenus,
            "change:numValues": this.updateDropdownMenus
        }, this);
    },
    generateExport: function () {
        this.set("exportButtonModel", new ExportButtonModel({
            tag: "Als CSV herunterladen",
            rawData: this.get("results"),
            filename: "CoSI-Angebotsdeckung",
            fileExtension: "csv"
        }));
    },
    getRatiosForSelectedFeatures: function () {
        this.resetResults();

        const selectedDistricts = Radio.request("SelectDistrict", "getSelectedDistricts"),
            selector = Radio.request("SelectDistrict", "getSelector");
        let facilities,
            demographics,
            ratio,
            totalFacilities = 0,
            totalDemographics = 0,
            totalRatio;

        if (selectedDistricts.length > 0) {
            _.each(selectedDistricts, (district) => {
                // get the facilities and demographics for each district
                facilities = this.getFacilitiesInDistrict(district);
                demographics = this.getTargetDemographicsInDistrict(district);

                // add up all demographics and facilities for all selected districts
                totalFacilities += facilities;
                totalDemographics += demographics;

                // calculate Ratio for district
                ratio = this.calculateRatio(facilities, demographics, district.getProperties()[selector]);
                this.setResultForDistrict(district.getProperties()[selector], {
                    ratio: ratio,
                    facilities: facilities,
                    demographics: demographics
                });
            });
            // Calculate total value and add it to results
            totalRatio = this.calculateRatio(totalFacilities, totalDemographics);
            this.setResultForDistrict("Gesamt", {
                ratio: totalRatio,
                facilities: totalFacilities,
                demographics: totalDemographics
            });
        }
        else {
            this.setMessage("Bitte wählen Sie mindestens einen Stadtteil aus.");
        }

        this.generateExport();
        this.trigger("renderResults");
    },
    calculateRatio (facilities, demographics, area = "allen Unterschungsgebieten") {
        if (demographics >= 0) {
            return (this.get("resolution") * facilities) / demographics;
        }
        this.setMessage(`In ${area} ist keine Population der Zielgruppe vorhanden. Daher können keine Ergebnisse angezeigt werden.`);
        return "n/a";
    },
    getTargetDemographicsInDistrict: function (district) {
        const districtGeometry = district.getGeometry();
        let targetPopulation = 0;

        if (typeof this.getDenominators() !== undefined) {
            if (this.getDenominators().length > 0) {
                _.each(this.getDenominators(), (den) => {
                    const layerId = this.get("denValues")[den],
                        layer = Radio.request("ModelList", "getModelByAttributes", {id: layerId}),
                        features = layer.get("layerSource").getFeatures(),
                        districtProperties = features.filter((feature) => {
                            return Extent.containsExtent(Extent.buffer(districtGeometry.getExtent(), 10), feature.getGeometry().getExtent());
                        })[0].getProperties();

                    if (layer.get("mouseHoverField")) {
                        const field = layer.get("mouseHoverField") === "dynamic" ? Radio.request("Timeline", "getLatestFieldFromProperties", districtProperties) : layer.get("mouseHoverField");

                        targetPopulation += parseInt(districtProperties[field], 10);
                    }
                    else {
                        this.setMessage("Entschuldigung! Der zu prüfende Layer besitzt keine gültige Spalte für Verhältnisanalysen. Bitte wählen Sie einen anderen Layer aus.");
                    }
                });
            }
            else {
                this.setMessage("Bitte wählen Sie eine demografische Zielgruppe aus.");
            }
        }
        else {
            this.setMessage("Bitte wählen Sie eine demografische Zielgruppe aus.");
        }

        return targetPopulation;
    },
    addFeatureModifier: function (feature, layer) {
        const modifier = this.get("adjustParameterViews").find((currentModifier) => currentModifier.model.get("layerId") === layer.get("id")).model.getSelectedOption(),
            featureProperties = feature.getProperties();

        return typeof featureProperties[modifier[0]] === "undefined" ? modifier[1] : featureProperties[modifier[0]] * modifier[1];
    },
    getFacilitiesInDistrict: function (district) {
        const districtGeometry = district.getGeometry(),
            featuresInDistrict = [];
        let featureCount = 0;

        if (typeof this.getNumerators() !== undefined) {
            if (this.getNumerators().length > 0) {
                _.each(this.getNumerators(), (num) => {
                    const layerId = this.get("numValues")[num],
                        layer = Radio.request("ModelList", "getModelByAttributes", {id: layerId}),
                        features = layer.get("layerSource").getFeatures();

                    _.each(features, (feature) => {
                        const geometry = feature.getGeometry(),
                            coordinate = geometry.getType() === "Point" ? geometry.getCoordinates() : Extent.getCenter(geometry.getExtent()); // Remove later for more reliable fallback

                        if (districtGeometry.intersectsCoordinate(coordinate)) {
                            featuresInDistrict.push(feature);
                            featureCount += this.addFeatureModifier(feature, layer);
                        }
                    });
                });
            }
            else {
                this.setMessage("Bitte wählen Sie einen Einrichtungstyp aus.");
            }
        }
        else {
            this.setMessage("Bitte wählen Sie einen Einrichtungstyp aus.");
        }

        return featureCount;
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
        denDropdownModel.set("values", _.allKeys(this.get("denValues")));
    },
    setDropdownSnippets: function (values) {
        if (values.numerators) {
            this.set("numDropdownModel", values.numerators);
        }
        if (values.denominators) {
            this.set("denDropdownModel", values.denominators);
        }
    },
    updateModifiers: function () {
        // check if modifier already exists
        _.each(this.getNumerators(), (numerator) => {
            if (!this.get("adjustParameterViews").find(modifier => modifier.model.get("layerName") === numerator)) {
                this.createModifier(numerator);
            }
        });
        // delete models that are unchecked
        this.set("adjustParameterViews", this.get("adjustParameterViews").filter((modifier) => {
            return this.getNumerators().includes(modifier.model.get("layerName"));
        }));
    },
    createModifier: function (layerName) {
        this.get("adjustParameterViews").push(new AdjustParameterView(this.get("numValues")[layerName], this.get("modifierInfoText")));
        this.trigger("change:adjustParameterViews");
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
        this.get("results")[district] = ratio;
    },
    resetResults: function () {
        this.set("results", {});
        this.set("message", "");
    },
    getResults: function () {
        return this.get("results");
    },
    setMessage: function (message) {
        this.set("message", message);
    }
});

export default CalculateRatioModel;
