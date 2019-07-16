import CalcTemplate from "text-loader!./template.html";

const CosiCalculatorView = Backbone.View.extend({
    events: {

    },

    /**
     * initialize the drawTool
     * that would be called by creates this tool
     * create an instance from download tool
     * @return {void}
     */
    initialize: function () {

    },

    template: _.template(CalcTemplate),

    /**
     * render the cosi calculator
     * @param {Backbone.model} model - draw model
     * @param {boolean} isActive - from tool
     * @return {Backbone.View} DrawView
     */
    render: function (model, isActive) {


    },

});

export default CosiCalculatorView;
