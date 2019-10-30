const ToleranceModel = Backbone.Model.extend({
    defaults: {
        sliderValue: 0,
        lowerTolerance: 0,
        upperTolerance: 0,
        key: null
    }
});

export default ToleranceModel;
