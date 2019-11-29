import Tool from "../../../../modules/core/modelList/tool/model";
import SnippetDropdownModel from "../../../../modules/snippets/dropdown/model";
import AdjustParameterView from "./adjustParameter/view";
import ExportButtonModel from "../../../../modules/snippets/exportButton/model";
import * as Extent from "ol/extent";

const CalculateRatioModel = Tool.extend({
    defaults: _.extend({}, Tool.prototype.defaults, {
        deactivateGFI: true,
        data: {},
        results: [],
        area: {},
        numerators: {values: []},
        denominators: {values: []},
        resolution: 1,
        modifier: {},
        numDropdownModel: {},
        denDropdownModel: {},
        message: "",
        adjustParameterView: {},
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
            },
            "change:numerators": this.createModifier
        });


        this.listenTo(Radio.channel("ModelList"), {
            "updatedSelectedLayerList": this.updateFacilityLayerList
        }, this);

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
            displayName: "Themen auswählen",
            values: layerNameList,
            snippetType: "dropdown",
            isMultiple: false
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
            displayName: "Bezugsgröße auswählen",
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
        this.set("modifier", this.get("adjustParameterView").model.getSelectedOption());

        const renameResults = {},
            selectedDistricts = Radio.request("SelectDistrict", "getSelectedDistricts"),
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
                    coverage: ratio * this.get("modifier")[1],
                    facilities: facilities,
                    demographics: demographics
                });
            });
            // Calculate total value and add it to results
            totalRatio = this.calculateRatio(totalFacilities, totalDemographics);
            this.setResultForDistrict("Gesamt", {
                ratio: totalRatio,
                coverage: totalRatio * this.get("modifier")[1],
                facilities: totalFacilities,
                demographics: totalDemographics
            });
            this.setResultForDistrict("Durchschnitt", {
                ratio: totalRatio / selectedDistricts.length,
                coverage: (totalRatio * this.get("modifier")[1]) / selectedDistricts.length,
                facilities: totalFacilities / selectedDistricts.length,
                demographics: totalDemographics / selectedDistricts.length
            });
        }
        else {
            this.setMessage("Bitte wählen Sie mindestens einen Stadtteil aus.");
        }

        Object.keys(this.getResults()).forEach(function (objectKey) {
            renameResults[objectKey] = Radio.request("Util", "renameKeys", {ratio: "Verhältnis", coverage: "Abdeckung", facilities: this.getNumerators()[0], demographics: this.getDenominators().join(", ")}, this.getResults()[objectKey]);
        }, this);
        this.get("exportButtonModel").set("rawData", renameResults);
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
                    const districtFeature = Radio.request("FeaturesLoader", "getAllFeaturesByAttribute", {category: den})
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
    getFacilitiesInDistrict: function (district) {
        const districtGeometry = district.getGeometry();
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
                            featureCount += parseFloat(feature.getProperties()[this.get("modifier")[0]]) || 1;
                        }
                    });
                });
            }
            else {
                this.setMessage("Bitte wählen Sie ein Thema aus.");
            }
        }
        else {
            this.setMessage("Bitte wählen Sie ein Thema aus.");
        }

        return featureCount;
    },
    createModifier: function () {
        if (this.getNumerators().length > 0) {
            const layer = this.get("facilityLayerList").find((facilityLayer) => {
                return facilityLayer.get("name") === this.getNumerators()[0];
            });

            this.set("adjustParameterView", new AdjustParameterView(layer.get("id"), this.get("modifierInfoText")));
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
