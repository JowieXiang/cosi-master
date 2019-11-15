const ToleranceModel = Backbone.Model.extend({
    defaults: {
        lowerTolerance: 0,
        upperTolerance: 0,
        key: null
    }
});

export default ToleranceModel;
