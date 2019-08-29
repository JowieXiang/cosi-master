import AgeSliderModel from "./model";
import Template from "text-loader!./template.html";

const AgeSliderView = Backbone.View.extend({
    events: {
        "click button": "toggleIsActive"
    },
    initialize: function () {
        this.listenTo(this.model, {
            "change:isActive": this.render
        });

        this.listenTo(this.model, {
            "change:isActive": function () {
                var slider = document.getElementById("myRange");
                var output = document.getElementById("age-group");
                // Update the current slider value (each time you drag the slider handle)
                slider.oninput = function () {
                    output.innerHTML = this.value;
                }
            }
        });
        if (this.model.get("isActive") === true) {
            this.render(this.model, true);
        }
    },
    model: new AgeSliderModel(),
    template: _.template(Template),

    render: function (model, value) {
        var attr = this.model.toJSON();

        if (value) {
            this.setElement(document.getElementsByClassName("win-body")[0]);
            this.$el.html(this.template(attr));
        }
        return this;
    },


    toggleIsActive: function () {
        this.model.toggleIsActive();
    }

});

export default AgeSliderView;
