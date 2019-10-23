import DashboardContainerView from "./view";

const DashboardContainerHandler = Backbone.Model.extend({
    defaults: {
        children: new Set(),
        channel: "",
        id: ""
    },
    initialize (attrs = {}) {
        const channel = Radio.channel("DashboardContainer");

        this.set("channel", channel);
        this.initDefaults(attrs);

        channel.on({
            "append": this.append,
            "destroy": this.destroy
        }, this);
    },
    initDefaults (attrs) {
        for (const attr in attrs) {
            this.set(attr, attrs[attr]);
        }
    },
    append (child, parent = ".infoScreen") {
        this.getChildren().add(new DashboardContainerView(child, parent));

    },
    getChildren () {
        return this.get("children");
    }
});

export default DashboardContainerHandler;

