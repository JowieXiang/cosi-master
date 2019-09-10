import Tool from "../../core/modelList/tool/model";
import SnippetDropdownModel from "../../snippets/dropdown/model";

const CompareDistrictsModel = Tool.extend({
    defaults: _.extend({}, Tool.prototype.defaults, {
        selectedLayerIds: [],
        snippetDropdownModelDistrict: {},
        filterModels: []
    }),

    initialize: function () {

        this.superInitialize();


        this.listenTo(Radio.channel("Map"), {
            "isReady": function () {
            }
        });

        this.listenTo(Radio.channel("Layer"), {
            "featuresLoaded": function (layerId, features) {
            }
        });

        this.listenTo(Radio.channel("SelectDistrict"), {
            "selectionChanged": function () {
                const districtNames = Radio.request("SelectDistrict", "getSelectedDistricts").map(feature => feature.getProperties().stadtteil);

                this.setDropDownSnippetDistrict(new SnippetDropdownModel({
                    name: "Bezirk",
                    type: "string",
                    displayName: "ausgewählte Bezirke",
                    values: districtNames,
                    snippetType: "dropdown",
                    isMultiple: false,
                    preselectedValues: districtNames[0]
                }));
            }
        });

        this.listenTo(this, {
            "change:isActive": function (model, value) {
                if (value) {
                    this.selectDistrictReminder();
                }
            }
        });

        this.listenTo(this.get("snippetDropdownModelDistrict"), {
            "valuesChanged": function () {

            }
        });
    },

    pushFilterModel: function (filterModel) {
        const filterModels = this.get("filterModels");

        filterModels.push(filterModel);
        this.set("filterModels", filterModels);
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
    setDropDownSnippetDistrict: function (value) {
        this.set("snippetDropdownModelDistrict", value);
    }


});

export default CompareDistrictsModel;
