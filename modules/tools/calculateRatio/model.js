import Tool from "../../core/modelList/tool/model";
import SnippetDropdownModel from "../../snippets/dropdown/model";
import AdjustParameterView from "./adjustParameter/view";
import ExportButtonModel from "../../snippets/exportButton/model";
import * as Extent from "ol/extent";

const CalculateRatioModel = Tool.extend({
    defaults: _.extend({}, Tool.prototype.defaults, {
        deactivateGFI: true,
        data: {},
        results: [],
        area: {},
        numerators: {},
        denominators: {},
        resolution: 1000,
        numDropdownModel: {},
        denDropdownModel: {},
        message: "",
        adjustParameterViews: [],
        exportButtonModel: {}
    }),
    initialize: function () {
        this.superInitialize();

        this.listenTo(this, {
            "change:isActive": function (model, isActive) {
                if (isActive) {
                    // const scope = Radio.request("SelectDistrict", "getScope");
                    let demographicValueList = Radio.request("FeaturesLoader", "getAllValuesByScope", "statgebiet");

                    demographicValueList = demographicValueList.filter(function (layer) {
                        return layer.valueType === "absolute";
                    });

                    this.updateFacilityLayerList(Radio.request("ModelList", "getModelsByAttributes", {type: "layer", isVisibleInMap: true}));
                    this.setDemographicDropdownModel(demographicValueList);
                }
            }
        });


        this.listenTo(Radio.channel("ModelList"), {
            "updatedSelectedLayerList": this.updateFacilityLayerList
        });

        this.listenTo(this, {
            "change:numerators": this.updateModifiers
        });

        this.setExportButton();
    },

    updateFacilityLayerList: function (layerList) {
        if (this.get("isActive")) {
            const facilityLayerList = layerList.filter((layer) => {
                return layer.get("isFacility") === true;
            });

            this.setFacilityLayerList(facilityLayerList);
            this.setFacilityDropdownModel(facilityLayerList);
        }
    },
    setFacilityLayerList: function (layerList) {
        this.set("facilityLayerList", layerList);
    },

    setFacilityDropdownModel: function (layerList) {
        const layerNameList = layerList.map(layer => {
            return layer.get("name");
        });

        this.set("numDropdownModel", new SnippetDropdownModel({
            name: "Einrichtungen",
            type: "string",
            displayName: "Einrichtungstypen auswählen",
            values: layerNameList,
            snippetType: "dropdown",
            isMultiple: true
        }));
        this.listenTo(this.get("numDropdownModel"), {
            "valuesChanged": this.setNumerators
        });
        this.trigger("renderFacilityDropDown");
    },

    setDemographicDropdownModel: function (layerList) {
        this.set("denDropdownModel", new SnippetDropdownModel({
            name: "Zielgruppe",
            type: "string",
            displayName: "Zielgruppen auswählen",
            values: layerList,
            snippetType: "dropdown",
            isMultiple: true,
            isGrouped: true
        }));
        this.listenTo(this.get("denDropdownModel"), {
            "valuesChanged": this.setDenominators
        });
    },

    setExportButton: function () {
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
                demographics = this.getTargetDemographicsInDistrict(district, selector);

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

        this.get("exportButtonModel").set("rawData", this.getResults());
        this.trigger("renderResults");
    },
    calculateRatio (facilities, demographics, area = "allen Unterschungsgebieten") {
        if (demographics >= 0) {
            return (this.get("resolution") * facilities) / demographics;
        }
        this.setMessage(`In ${area} ist keine Population der Zielgruppe vorhanden. Daher können keine Ergebnisse angezeigt werden.`);
        return "n/a";
    },
    getTargetDemographicsInDistrict: function (district, selector) {
        let targetPopulation = 0;

        if (typeof this.getDenominators() !== "undefined") {
            if (this.getDenominators().length > 0) {
                this.getDenominators().forEach((den) => {
                    const districtFeature = Radio.request("FeaturesLoader", "getAllFeaturesByAttribute", {name: den})
                        .filter(feature => feature.getProperties()[selector] === district.getProperties()[selector]);

                    if (districtFeature) {
                        const districtProperties = districtFeature[0].getProperties(),
                            field = Radio.request("Timeline", "getLatestFieldFromProperties", districtProperties);

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

        if (typeof this.getNumerators() !== "undefined") {
            if (this.getNumerators().length > 0) {
                _.each(this.getNumerators(), (num) => {
                    const layer = this.get("facilityLayerList").find((facilityLayer) => {
                            return facilityLayer.get("name") === num;
                        }),
                        features = layer.get("layerSource").getFeatures().filter(f => typeof f.style_ === "object" || f.style_ === null);

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
        const layer = this.get("facilityLayerList").find((facilityLayer) => {
            return facilityLayer.get("name") === layerName;
        });

        this.get("adjustParameterViews").push(new AdjustParameterView(layer.get("id"), this.get("modifierInfoText")));
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
