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
            "destroyWidgetById": this.destroyWidgetById
        }, this);

        channel.reply({
            "getChildren": this.getChildren,
            "getWidgetById": this.getWidgetById
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
        this.pushId(_opts.id);
    },
    assignId (opts) {
        if (this.get("ids").includes(opts.id) || !opts.id) {
            opts.id = Math.max(this.get("ids").filter(id => !isNaN(id))) + 1;
        }
        return opts;
    },
    destroyWidgetById (id) {
        this.set("children", this.getChildren().filter(v => {
            if (v.attrs.id === id) {
                v.remove();
                this.removeId(id);
                return false;
            }
            return true;
        }, this));
    },
    getChildren () {
        return this.get("children");
    },
    getWidgetById (id) {
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
    },
    getIds () {
        return this.get("ids");
    },
    pushId (id) {
        this.getIds().push(id);
    },
    removeId (id) {
        this.set("ids", this.getIds().filter(_id => _id !== id));
    }
});

export default DashboardWidgetHandler;

