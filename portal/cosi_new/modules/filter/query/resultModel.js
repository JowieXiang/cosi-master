const ResultModel = Backbone.Model.extend(/** @lends ResultModel */{
    /**
     * @class ResultModel
     */
    defaults: {
        layerId: "",
        featureIds: []
    }
});

export default ResultModel;
