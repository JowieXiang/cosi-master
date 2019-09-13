import Template from "text-loader!./template.html";
import DistrictSelectorModel from "./model";
const DistrictSelectorView = Backbone.View.extend({
    events: {
        "change select": "setSelectedDistrict"
    },
    initialize: function () {
        this.listenTo(this.model, {
            "change:districtNames": this.render
        });

    },
    tagName: "div",
    className: "selection-container",
    model: new DistrictSelectorModel(),
    template: _.template(Template),
    render: function () {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },
    setSelectedDistrict: function (evt) {
        this.model.setSelectedDistrict(evt.target.value);
    },
    getSelectedDistrict: function () {
        return this.model.get("selectedDistrict");
    }


});

export default DistrictSelectorView;