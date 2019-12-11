import * as Extent from "ol/extent";
import resultTemplate from "text-loader!./resultTemplate.html";

const ReachabilityResultView = Backbone.View.extend({
    events: {
        "click .isochrone-origin": "zoomToOrigin",
        "click #show-in-dashboard": "showInDashboard",
        "click button.open": "toggleGroup",
        "click .name-tag": "zoomToFacility"
    },
    model: {},
    template: _.template(resultTemplate),
    render: function () {
        const attr = this.model.toJSON();

        this.$el.html(this.template(attr));
        this.delegateEvents();
        return this;
    },
    zoomToFacility: function (evt) {
        const features = Radio.request("ModelList", "getModelByAttributes", { id: evt.target.getAttribute("layerId") }).get("layer").getSource().getFeatures(),
            feature = features.filter(f => f.getProperties()[evt.target.getAttribute("idSelector")] === evt.target.innerHTML.trim())[0],
            geometry = feature.getGeometry();
        let coord = [];

        coord = geometry.getType() === "Point" ? geometry.getCoordinates().splice(0, 2) : Extent.getCenter(geometry.getExtent());
        Radio.trigger("MapMarker", "showMarker", coord);
        Radio.trigger("MapView", "setCenter", coord);
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
    },
    toggleGroup: function (evt) {
        // evt.stopPropagation();
        const layerName = this.$(evt.target).attr("id"),
            tr = this.$el.find(`#${layerName}_tr`);

        if (tr.css("display") === "none") {
            tr.show();
        }
        else {
            tr.hide();
        }

    }
});

export default ReachabilityResultView;
