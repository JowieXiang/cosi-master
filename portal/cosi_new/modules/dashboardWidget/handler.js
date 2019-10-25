import DashboardWidgetView from "./view";

const DashboardWidgetHandler = Backbone.Model.extend({
    defaults: {
        children: [],
        channel: "",
        ids: []
    },
    initialize (attrs = {}) {
        const channel = Radio.channel("Dashboard");

        this.set("channel", channel);
        this.initDefaults(attrs);

        channel.on({
            "append": this.append,
            "destroyChildById": this.destroyWidgetById,
            "getChildren": this.getChildren,
            "getChildById": this.getChildById
        }, this);
    },
    initDefaults (attrs) {
        for (const attr in attrs) {
            this.set(attr, attrs[attr]);
        }
    },
    append (child, parent = ".info-screen-children", opts) {
        const _opts = opts ? this.assignId(opts) : this.assignId({});

        this.getChildren().push(new DashboardWidgetView(child, parent, _opts));
    },
    assignId (opts) {
        if (this.get("ids").includes(opts.id)) {
            opts.id = Math.max(this.get("ids").filter(id => !isNaN(id))) + 1;
        }
        return opts;
    },
    destroyChildById (id) {
        this.getChildren().filter(v => {
            if (v.attrs.id === id) {
                v.remove();
                return false;
            }
            return true;
        });
    },
    getChildren () {
        return this.get("children");
    },
    getChildById (id) {
        return this.getChildren().find(v => v.attrs.id === id);
    },
    getChildrenByAttributes (attrs) {
        return this.getChildren().filter(v => {
            let match = true;

            for (const prop in attrs) {
                if (v[prop] !== attrs[prop]) {
                    match = false;
                    break;
                }
            }
            return match;
        });
    },
    getChildrenByIds (ids) {
        return this.getChildren().filter(v => ids.includes(v.attrs.id));
    }
});

export default DashboardWidgetHandler;

