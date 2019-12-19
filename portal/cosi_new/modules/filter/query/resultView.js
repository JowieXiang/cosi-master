import * as Extent from "ol/extent";
import resultTemplate from "text-loader!./resultTemplate.html";
import "./style.less";

const ResultView = Backbone.View.extend({
    events: {
        "click #show-in-dashboard": "showInDashboard",
        "click .name-tag": "zoomToFacility"
    },
    className: "result-view",
    template: _.template(resultTemplate),
    render: function () {
        const attr = this.model.toJSON();

        this.$el.html(this.template(attr));
        this.delegateEvents();
        return this;
    },
    // show results in dashboard
    showInDashboard: function () {
        Radio.trigger("Dashboard", "append", this.$el, "#dashboard-containers", {
            id: "filter",
            name: "Filter",
            glyphicon: "glyphicon-filter"
        });
    }
});

export default ResultView;
