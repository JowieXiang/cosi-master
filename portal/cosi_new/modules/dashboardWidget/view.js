import Template from "text-loader!./template.html";
import {selection} from "d3-selection";
import "./style.less";

const DashboardWidgetView = Backbone.View.extend({
    events: {
        "click .dashboard-widget-close": "remove",
        "click .win-control.open": "toggleOpen"
    },
    initialize (content, parent, opts = {}) {
        const attrs = content.model ? content.model.defaults : opts;

        this.content = content;
        this.attrs = {
            id: attrs.id ? attrs.id : "view",
            name: attrs.name ? attrs.name : "Daten",
            glyphicon: attrs.glyphicon ? attrs.glyphicon : "glyphicon-info-sign"
        };

        this.initializeDOMElement(parent);
        this.render();
    },
    content: {},
    attrs: {},
    template: _.template(Template),
    render () {
        this.$el.append(this.template(this.attrs));

        if (this.content instanceof Backbone.View) {
            this.renderView();
        }
        else if (this.content instanceof $) {
            this.render$el();
        }
        else if (typeof this.content === "string") {
            this.renderHtml();
        }
        else if (this.content instanceof selection) {
            this.renderD3();
        }

        return this;
    },
    initializeDOMElement (parent) {
        const widget = document.createElement("div");

        widget.className = "dashboard-widget";
        $(parent).append($(widget));
        this.setElement(widget);
    },
    renderView () {
        this.content.setElement(this.$el.find("#content").get(0));
        this.content.render();
    },
    render$el () {
        this.$el.find("#content").append(this.content);
    },
    renderHtml () {
        this.$el.find("#content").html(this.content);
    },
    renderD3 () {
        this.$el.find("#content").html(this.content.node());
    },
    toggleOpen (evt) {
        evt.stopPropagation();
        this.$el.toggleClass("open");
    }
});

export default DashboardWidgetView;
