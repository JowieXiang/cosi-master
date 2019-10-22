import Template from "text-loader!./template.html";
import InfoScreenModel from "./model";

const InfoScreenView = Backbone.View.extend({
    events: {
        "click #title": "renderContent"
    },
    initialize (opts) {
        this.model = new InfoScreenModel(opts);

        this.render();

        this.listenTo(this.model, {
            "updateContent": function () {
                this.renderContent();
            }
        });
    },
    model: {},
    contentContainer: {},
    template: _.template(Template),
    render () {
        var attr = this.model.toJSON();

        this.setElement(document.getElementById("info-screen"));
        this.$el.html(this.template(attr));

        this.contentContainer = this.$el.find(".info-screen-children");

        return this;
    },
    renderContent () {
        console.log("trigger");
        this.contentContainer.empty();
        this.model.getChildren().forEach(child => {
            this.renderChild(child);
        });
    },
    renderChild (child) {
        this.contentContainer.append(child.$el);
    }
});

export default InfoScreenView;
