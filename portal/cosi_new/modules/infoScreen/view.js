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
            "change:content": function (isActive) {
                if (isActive) {
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
        this.window = window.open("/portal/cosi_new/modules/infoScreen/hostWindow", this.model.get("title"), this.model.get("winOpts"));
        this.updateWindow();
    },
    updateWindow () {
        console.log(this.window.document, this.$el, this.model.get("content"));
        this.window.document.write(this.$el);
    }
});

export default InfoScreen;
