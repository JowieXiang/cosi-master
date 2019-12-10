import Tool from "../../../../modules/core/modelList/tool/model";
import DropdownModel from "../../../../modules/snippets/dropdown/model";

const SelectModel = Tool.extend(/** @lends SelectModel.prototype */{
    defaults: _.extend({}, Tool.prototype.defaults, {
        dropDownModel: {},
        modes: ["Erreichbarkeit ab einem Referenzpunkt", "Erreichbarket im Gebiet"]
    }),
    /**
    * @class SelectModel
    * @extends Tool
    * @memberof Tools.Reachability
    * @constructs
    * @property {object} dropDownModel dropdown menu model
    * @property {Array} modes=["Erreichbarkeit ab einem Referenzpunkt", "Erreichbarket im Gebiet"] two modes of this function
    */
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
            values: this.get("modes"),
            snippetType: "dropdown",
            isMultiple: false,
            isGrouped: false,
            displayName: "",
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
            Radio.request("ModelList", "getModelByAttributes", {name: valueModel.get("value")}).set("isActive", true);
        }
    }
});

export default SelectModel;
