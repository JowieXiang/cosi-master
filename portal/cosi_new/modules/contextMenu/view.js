import "./style.less";
import Template from "text-loader!./template.html";

const ContextMenuView = Backbone.View.extend({
    events: {
        "click .close": "closeContextMenu",
        "click #actions": "closeContextMenu",
        "click #actions input": function (evt) {
            evt.stopPropagation();
        }
    },
    initialize () {
        $(".masterportal-container").after(this.$el);

        this.channel = Radio.channel("ContextMenu");

        this.channel.on({
            "addContextMenu": this.addContextMenu,
            "setActions": this.setActions
        }, this);

        window.oncontextmenu = (evt) => {
            evt.preventDefault();
            return false;
        };

        this.render();
    },
    template: _.template(Template),
    id: "context-menu",
    targets: [],
    model: {},
    channel: "",
    render () {
        this.$el.html(this.template());
        return this;
    },
    addContextMenu (element) {
        element.addEventListener("mouseup", this.mouseButtonHandler.bind(this));
        element.addEventListener("touchstart", this.touchStart.bind(this));
        element.addEventListener("touchend", this.touchEnd.bind(this));
    },
    setActions (element, title = "Aktionen", glyphicon = "glyphicon-wrench") {
        this.$el.find("#actions").html(element);
        this.$el.find("#name").html(title);
        this.$el.find("#glyphicon").attr("class", `glyphicon ${glyphicon}`);
    },
    mouseButtonHandler (evt) {
        const button = evt.button;

        switch (button) {
            case 0:
                this.closeContextMenu();
                break;
            case 2:
                this.openContextMenu(evt);
                break;
            default:
                break;
        }
    },
    touchStart () {
        this.touchStart = Date.now();
        console.log(Date.now());
    },
    touchEnd (evt) {
        if (Date.now() > this.touchStart + 500) {
            this.openContextMenu(evt);
        }
        else {
            this.closeContextMenu();
        }

        console.log(Date.now());
    },
    openContextMenu (evt) {
        this.$el.removeClass("hidden");

        const _evt = evt.type === "touchend" ? evt.touches[0] : evt;

        if (_evt.clientY + this.el.clientHeight < window.innerHeight) {
            this.$el.css({
                "top": _evt.clientY,
                "bottom": "auto"
            });
        }
        else {
            this.$el.css({
                "top": "auto",
                "bottom": window.innerHeight - _evt.clientY
            });
        }

        if (_evt.clientX + this.el.clientWidth < window.innerWidth) {
            this.$el.css({
                "left": _evt.clientX,
                "right": "auto"
            });
        }
        else {
            this.$el.css({
                "left": "auto",
                "right": window.innerWidth - _evt.clientX
            });
        }
    },
    closeContextMenu () {
        this.$el.addClass("hidden");
        this.$el.find("#actions").empty();
    }
});

export default ContextMenuView;
