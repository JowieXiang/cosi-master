import DashboardWidgetView from "./view";
import {selection} from "d3-selection";

const DashboardWidgetHandler = Backbone.Model.extend({
    defaults: {
        children: [],
        channel: "",
        ids: [],
        rawDashboardWidget: {}
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

        this.listenTo(this, {
            "change:rawDashboardWidget": function () {
                const newWidget = this.get("rawDashboardWidget");

                this.append(newWidget.child, newWidget.parent, newWidget.opts, true);
            }
        });
    },
    initDefaults (attrs) {
        for (const attr in attrs) {
            this.set(attr, attrs[attr]);
        }
    },
    append (child, parent = ".info-screen-children", opts, cullButtons = false) {
        var _child = child;
        const _opts = opts ? this.assignId(opts) : this.assignId({});

        // send Widget to InfoScreen if infoScreenOpen
        if (Radio.request("InfoScreen", "getIsWindowOpen")) {
            CosiStorage.setItem("rawDashboardWidget", JSON.stringify({
                child: this.convertChildToHtml(_child),
                parent,
                opts
            }));
        }

        // remove Buttons on transfer via localStorage
        if (cullButtons) {
            _child = $(_child);
            _child.find("button").remove();
        }

        this.getChildren().push(new DashboardWidgetView(_child, parent, _opts));
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
    },
    convertChildToHtml (child) {
        if (child instanceof Backbone.View) {
            return this.content.render().el;
        }
        else if (child instanceof $) {
            return child.html();
        }
        else if (child instanceof selection) {
            return child.node();
        }

        return child;
    }
});

export default DashboardWidgetHandler;
