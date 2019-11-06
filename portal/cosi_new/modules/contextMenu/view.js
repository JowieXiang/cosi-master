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
        element.onmouseup = this.mouseButtonHandler.bind(this);
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
    openContextMenu (evt) {
        this.$el.removeClass("hidden");
        this.$el.css({
            "left": evt.clientX,
            "top": evt.clientY
        });
    },
    closeContextMenu () {
        this.$el.addClass("hidden");
        this.$el.find("#actions").empty();
    }
});

export default ContextMenuView;
