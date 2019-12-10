import SaveSelection from "../../../../modules/tools/saveSelection/model";

const SaveSelectionCosi = SaveSelection.extend({
    defaults: _.extend({}, SaveSelection.prototype.defaults, {
        id: "saveSelectionCosi",
        name: "Sitzung speichern",
        selectedDistrictIds: [],
        scope: "",
        buffer: 0
    }),
    initialize: function (options) {
        this.listenTo(this, {
            "change:isActive": function (model, value) {
                if (value) {
                    this.setSelectedDistrictIdsAndScope(Radio.request("SelectDistrict", "getSelectedDistricts"), Radio.request("SelectDistrict", "getScopeAndSelector"), Radio.request("SelectDistrict", "getBuffer"));
                }
            }
        });

        this.constructor.__super__.initialize.apply(this, options);
    },
    setSelectedDistrictIdsAndScope (selectedDistricts, scope, buffer) {
        this.set("selectedDistrictIds", selectedDistricts.map(dist => dist.get(scope.selector)));
        this.set("scope", scope.scope);
        this.set("buffer", buffer);
    },
    setUrl: function () {
        // console.log(location);
        this.set("url", location.origin + location.pathname + "?layerIDs=" + this.get("layerIdList") + "&visibility=" + this.get("layerVisibilityList") + "&transparency=" + this.get("layerTransparencyList") + "&center=" + this.get("centerCoords") + "&zoomlevel=" + this.get("zoomLevel") + "&scope=" + this.get("scope") + "&selectedDistricts=" + this.get("selectedDistrictIds") + "&buffer=" + this.get("buffer"));
    }
});

export default SaveSelectionCosi;
