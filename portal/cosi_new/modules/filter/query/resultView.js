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
    zoomToFacility: function (evt) {
        const features = Radio.request("ModelList", "getModelByAttributes", { id: evt.target.getAttribute("layerId") }).get("layer").getSource().getFeatures(),
            // have to use this method because template doesn't support openlayer 'Extent',
            // therefore we can not pass a 'coordinate' attr to the dom element
            feature = features.filter(f => f.getProperties()[evt.target.getAttribute("selector")] === evt.target.innerHTML.trim())[0],
            geometry = feature.getGeometry();
        let coord = [];

        coord = geometry.getType() === "Point" ? geometry.getCoordinates().splice(0, 2) : Extent.getCenter(geometry.getExtent());
        Radio.trigger("MapMarker", "showMarker", coord);
        Radio.trigger("MapView", "setCenter", coord);
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
