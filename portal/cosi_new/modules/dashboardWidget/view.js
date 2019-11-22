import Template from "text-loader!./template.html";
import {selection} from "d3-selection";
import "./style.less";

const DashboardWidgetView = Backbone.View.extend({
    events: {
        "click .dashboard-widget-close": "removeWidget",
        "click .win-control.open": "toggleOpen",
        "click .tool-name": "widgetInfo",
        "mousedown .drag": "resizeStart",
        "mousedown .header": "moveStart"
    },
    initialize (content, parent, opts = {}) {
        const attrs = opts;

        this.parent = parent;
        this.content = content;
        this.attrs = {
            id: attrs.id ? attrs.id : "view",
            name: attrs.name ? attrs.name : "Daten",
            glyphicon: attrs.glyphicon ? attrs.glyphicon : "glyphicon-info-sign",
            append: attrs.append !== undefined ? attrs.append : true,
            width: attrs.width ? attrs.width : null,
            height: attrs.height ? attrs.height : null,
            scalable: attrs.scalable ? attrs.scalable : false
        };

        this.render();
    },
    minimized: false,
    resizing: false,
    moving: false,
    dragStartXY: [],
    parent: "",
    content: {},
    attrs: {},
    template: _.template(Template),
    render () {
        this.initializeDOMElement();
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

        if (this.attrs.width === "full") {
            this.attrs.width = ($(this.parent).width() - 50) + "px";
        }
        if (this.attrs.height === "full") {
            this.attrs.height = ($(this.parent).height() - 50) + "px";
        }

        this.el.style.width = this.attrs.width || "auto";
        this.el.style.height = this.attrs.height || "auto";

        window.addEventListener("mouseup", this.dragEnd.bind(this));
        window.addEventListener("mousemove", this.drag.bind(this));

        Radio.trigger("ContextMenu", "addContextMenu", this.el);

        return this;
    },
    initializeDOMElement () {
        const widget = document.createElement("div");

        widget.className = "dashboard-widget";
        // check to prepend or append the widget
        if (this.attrs.append) {
            $(this.parent).append($(widget));
        }
        else {
            $(this.parent).prepend($(widget));
        }
        this.setElement(widget);

        return this;
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
        this.$el.toggleClass("minimized");
        this.minimized = !this.minimized;

        if (this.minimized) {
            this.el.style.height = this.$el.find(".header").outerHeight() + 20 + "px";
        }
        else {
            this.el.style.height = isNaN(this.attrs.height) ? this.attrs.height : this.attrs.height + "px";
        }
    },
    removeWidget () {
        Radio.trigger("Dashboard", "destroyWidgetById", this.attrs.id);
    },
    moveStart (evt) {
        if (evt.button === 0) {
            evt.preventDefault();
            this.$el.addClass("dragging");

            this.$el.find(".widget-shadow").css({
                width: this.el.clientWidth + "px",
                height: this.el.clientHeight + "px"
            }).addClass("dragging");

            this.moving = true;
        }

        console.log("move");
    },
    resizeStart (evt) {
        if (evt.button === 0) {
            evt.preventDefault();
            this.dragStartXY = [evt.clientX, evt.clientY];
            this.$el.addClass("dragging");

            this.resizing = true;
        }

        console.log("size");
    },
    dragEnd (evt) {
        if (evt.button === 0) {
            if (this.moving) {
                evt.preventDefault();
                this.$el.find(".widget-shadow").removeClass("dragging");

                const widgets = document.querySelectorAll(".dashboard-widget"),
                    newOrder = Array.from(widgets).sort((a, b) => {
                        var aPos = a === this.el ? [evt.clientX, evt.clientY] : [$(a).offset().left, $(a).offset().top],
                            bPos = b === this.el ? [evt.clientX, evt.clientY] : [$(b).offset().left, $(b).offset().top];

                        if (aPos[1] < bPos[1]) {
                            return -1;
                        }
                        if (aPos[0] < bPos[0]) {
                            return -1;
                        }
                        return 1;
                    }, this);

                for (let i = 0; i < newOrder.length; i++) {
                    newOrder[i].style.order = i;
                }
            }
            this.resizing = false;
            this.moving = false;
            this.$el.removeClass("dragging");
        }
    },
    drag (evt) {
        if (this.resizing) {
            evt.preventDefault();
            const dX = evt.clientX - this.dragStartXY[0],
                dY = evt.clientY - this.dragStartXY[1];

            this.attrs.width = this.el.clientWidth + dX;
            this.attrs.height = this.el.clientHeight + dY;

            this.el.style.width = this.attrs.width + "px";
            this.el.style.height = this.attrs.height + "px";

            this.dragStartXY = [evt.clientX, evt.clientY];
        }
        if (this.moving) {
            this.$el.find(".widget-shadow").css({
                top: evt.clientY + "px",
                left: evt.clientX + "px"
            });
        }
    },
    widgetInfo () {
        console.log(this);
    }
});

export default DashboardWidgetView;
