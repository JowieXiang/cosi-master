import SnippetModel from "../model";

const AdjustParameterModel = SnippetModel.extend({
    defaults: {
        layerName: "",
        numericalValues: []
    },
    initialize: function () {
        this.superInitialize();
    },
    getNumericalValues: function () {
        return this.get("numericalValues");
    }
});

export default AdjustParameterModel;