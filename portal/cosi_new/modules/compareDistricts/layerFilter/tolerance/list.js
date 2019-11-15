import ToleranceModel from "./model";

const ToleranceCollection = Backbone.Collection.extend({
    model: ToleranceModel
});

export default ToleranceCollection;
