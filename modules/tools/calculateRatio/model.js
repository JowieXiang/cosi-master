import Tool from "../../core/modelList/tool/model";
import SnippetDropdownModel from "../../snippets/dropdown/model";
import Geometry from 'ol/geom/Geometry';
import Feature from 'ol/Feature';

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
        denValues: {}
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
        const selectedDistricts = Radio.request("SelectDistrict", "getSelectedDistricts"),
            initExtent = selectedDistricts[0].getGeometry().getExtent();

        console.log(initExtent);
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
    }
});

export default CalculateRatioModel;