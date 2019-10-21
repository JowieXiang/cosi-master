import Template from "text-loader!./template.html";

const InfoScreen = Backbone.View.extend({
    events: {},
    initialize () {
        this.listenTo(this.model, {
            "change:isActive": function (isActive) {
                if (isActive) {
                    this.render();
                    this.castWindow();
                }
                else {
                    this.el$.remove();
                }
            },
            "change:content": function () {
                if (this.model.get("infoScreenOpen")) {
                    this.renderContent();
                    this.updateWindow();
                }
            }
        });
    },
    id: "infoscreen-view",
    className: "infoscreen",
    model: {},
    template: _.template(Template),
    window: {},
    render () {
        var attr = this.model.toJSON();

        this.$el.html(this.template(attr));
        this.renderContent();

        this.delegateEvents();

        return this;
    },
    renderContent () {
        this.$el.find('.input').empty();
        this.$el.find('.input').append(this.model.get("content"));
    },
    castWindow () {
        this.window = window.open("/portal/cosi_new/modules/infoScreen/hostWindow", ".dashboard", this.model.get("winOpts"));
        this.updateWindow();
        this.model.setIsWindowOpen(true);
    },
    updateWindow () {
        if (Object.keys(this.model.get("content")).length > 0) {
            this.window.postMessage({
                mode: "replace",
                node: this.model.get("content").html()
            });
        }
    }
});

export default InfoScreen;
