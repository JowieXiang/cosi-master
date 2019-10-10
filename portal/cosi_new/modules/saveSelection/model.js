import SaveSelection from "../../../../modules/tools/saveSelection/model";

const SaveSelectionCosi = SaveSelection.extend({
    defaults: _.extend({}, SaveSelection.prototype.defaults, {
        id: "saveSelectionCosi",
        name: "Auswahl speichern",
        selectedDistrictIds: [],
        scope: ""
    }),
    initialize: function (options) {
        this.listenTo(this, {
            "change:isActive": function (model, value) {
                if (value) {
                    this.setSelectedDistrictIdsAndScope(Radio.request("SelectDistrict", "getSelectedDistricts"), Radio.request("SelectDistrict", "getScopeAndSelector"));
                }
            }
        });

        this.constructor.__super__.initialize.apply(this, options);
    },
    setSelectedDistrictIdsAndScope (selectedDistricts, scope) {
        this.set("selectedDistrictIds", selectedDistricts.map(dist => dist.get(scope.selector)));
        this.set("scope", scope.scope);
    },
    setUrl: function () {
        this.set("url", location.origin + location.pathname + "?layerIDs=" + this.get("layerIdList") + "&visibility=" + this.get("layerVisibilityList") + "&transparency=" + this.get("layerTransparencyList") + "&center=" + this.get("centerCoords") + "&zoomlevel=" + this.get("zoomLevel") + "&scope=" + this.get("scope") + "&selectedDistricts=" + this.get("selectedDistrictIds"));
    }
});

export default SaveSelectionCosi;