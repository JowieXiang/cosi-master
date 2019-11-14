import Tool from "../../../../modules/core/modelList/tool/model";
import DropdownModel from "../../../../modules/snippets/dropdown/model";

const ReachabilityAnalysis = Tool.extend({
    defaults: _.extend({}, Tool.prototype.defaults, {
        dropDownModel: {},
        toolList: ["Erreichbarkeit", "serviceCoverage"]
    }),
    initialize: function () {
        this.superInitialize();

    },
    /**
     * sets the selection list for the time slider
     * @param {object[]} valueList - available values
     * @returns {void}
     */
    setDropDownModel: function () {
        const dropdownModel = new DropdownModel({
            name: "Thema",
            type: "string",
            values: this.get("toolList"),
            snippetType: "dropdown",
            isMultiple: false,
            isGrouped: false,
            displayName: "select function",
            liveSearch: false,
            isDropup: false
        });

        this.listenTo(dropdownModel, {
            "valuesChanged": this.functionSelected
        }, this);
        this.set("dropDownModel", dropdownModel);
    },

    functionSelected: function (valueModel, isSelected) {
        if (isSelected) {
            this.set("isActive", false);
            Radio.request("ModelList", "getModelByAttributes", { name: valueModel.get("value") }).set("isActive", true);
        }
    }
});

export default ReachabilityAnalysis;
