const DashboardContainerModel = Backbone.Model.extend({
    defaults: {
        content: {},
        channel: "",
        id: ""
    },
    initialize (content, attrs = {}) {
        const channel = Radio.channel("DashboardContainer");

        this.set("channel", channel);
        this.initDefaults(attrs);

        channel.on({
            "append": this.append,
            "destroy": this.destroy
        }, this);
    }
});

export default DashboardContainerModel;
