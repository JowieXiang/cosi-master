import CalcTemplate from "text-loader!./template.html";
import CosiCalculatorModel from "./model";

const CosiCalculatorView = Backbone.View.extend({

    id: "cosi-calc",
    model: new CosiCalculatorModel(),
    template: _.template(CalcTemplate),

    events: {

    },

    /**
     * initialize the calcTool
     * that would be called by creates this tool
     * create an instance from download tool
     * @return {void}
     */
    initialize: function () {
        var channel = Radio.channel("cosiCalc");

        //TODO:  he channel gets called from a button click or something on the cosi inforscreen and then renders from here
    },

    template: _.template(CalcTemplate),

    /**
     * render the cosi calculator
     * @param {Backbone.model} model - draw model
     * @param {boolean} isActive - from tool
     * @return {Backbone.View} DrawView
     */
    render: function (model) {


    }

});

export default CosiCalculatorView;
