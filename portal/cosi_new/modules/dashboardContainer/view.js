import Template from "text-loader!./template.html";
import {selection, select} from "d3-selection";

const DashboardContainerView = Backbone.View.extend({
    events: {
        "click .dashboard-container-close": "remove"
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
            console.log("view");
            this.renderView();
        }
        else if (this.content instanceof $) {
            console.log("$");
            this.render$el();
        }
        else if (typeof this.content === "string") {
            console.log("html");
            this.renderHtml();
        }
        else if (this.content instanceof selection) {
            console.log("d3");
            this.renderD3();
        }

        return this;
    },
    initializeDOMElement (parent) {
        const container = document.createElement("div");
        container.className = "dashboard-container";

        $(parent).append($(container));
        this.setElement(container);
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
    }
});

export default DashboardContainerView;
