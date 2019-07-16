

const CosiCalculator = Tool.extend({
    defaults: _.extend({}, Tool.prototype.defaults, {

    }),

    /**
     * create a DrawTool instance
     * @return {void}
     */
    initialize: function () {
        const channel = Radio.channel("cosiCalc");

        this.superInitialize();

        channel.reply({
            "getLayer": function () {
                return this.get("layer");
            }
        }, this);

        channel.on({
        }, this);

        this.listenTo(this, {

        });
    },

});

export default CosiCalculator;
