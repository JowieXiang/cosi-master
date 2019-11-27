import "./style.less";
import Template from "text-loader!./template.html";

const ContextMenuView = Backbone.View.extend({
    events: {
        "click .close": "closeContextMenu",
        "click #actions": "closeContextMenu"
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
        element.addEventListener("touchstart", this.touchHandler.bind(this));
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
    touchHandler (evt) {
        const touchCount = evt.touches.length;
        console.log(evt, touchCount);

        switch (touchCount) {
            case 2:
                this.openContextMenu(evt.touches[0]);
                break;
            default:
                this.closeContextMenu();
                break;
        }
    },
    openContextMenu (evt) {
        this.$el.removeClass("hidden");

        if (evt.clientY + this.el.clientHeight < window.innerHeight) {
            this.$el.css({
                "top": evt.clientY,
                "bottom": "auto"
            });
        }
        else {
            this.$el.css({
                "top": "auto",
                "bottom": window.innerHeight - evt.clientY
            });
        }

        if (evt.clientX + this.el.clientWidth < window.innerWidth) {
            this.$el.css({
                "left": evt.clientX,
                "right": "auto"
            });
        }
        else {
            this.$el.css({
                "left": "auto",
                "right": window.innerWidth - evt.clientX
            });
        }
    },
    closeContextMenu () {
        this.$el.addClass("hidden");
        this.$el.find("#actions").empty();
    }
});

export default ContextMenuView;
