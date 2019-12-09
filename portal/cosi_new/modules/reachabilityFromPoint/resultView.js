import resultTemplate from "text-loader!./resultTemplate.html";
import * as Proj from "ol/proj.js";

const ReachabilityResultView = Backbone.View.extend({
    events: {
        "click .isochrone-origin": "zoomToOrigin",
        "click #show-in-dashboard": "showInDashboard"
    },
    model: {},
    template: _.template(resultTemplate),
    render: function () {
        const attr = this.model.toJSON();

        this.$el.html(this.template(attr));

        this.delegateEvents();

        return this;
    },
    zoomToOrigin: function (evt) {
        const coord = [parseFloat(evt.target.value.split(",")[0].trim()), parseFloat(evt.target.value.split(",")[1].trim())];

        Radio.trigger("MapMarker", "showMarker", coord);
        Radio.trigger("MapView", "setCenter", coord);
    },
    // show results in dashboard
    showInDashboard: function () {
        Radio.trigger("Dashboard", "append", this.$el, "#dashboard-containers", {
            id: "reachability",
            name: "Erreichbarkeit ab einem Referenzpunkt",
            glyphicon: "glyphicon-road"
        });
    }
});

export default ReachabilityResultView;
