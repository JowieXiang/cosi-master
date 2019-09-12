import Tool from "../../core/modelList/tool/model";

const CompareDistrictsModel = Tool.extend({
    defaults: _.extend({}, Tool.prototype.defaults, {
        // selectedLayers: [],
        layerFilterList: [], // e.g {layerId: "", filter: [{key: value},...]}
        mapLayerName: "compare-district"
    }),

    initialize: function () {

        this.superInitialize();


        this.listenTo(Radio.channel("Map"), {
            "isReady": function () {
            }
        });

        this.listenTo(Radio.channel("Layer"), {
            "featuresLoaded": function (layerId, features) {
            }
        });

        this.listenTo(Radio.channel("SelectDistrict"), {
            "selectionChanged": function () {

            }
        });


    }
    // setSelectedLayers: function (value) {
    //     this.set("selectedLayers", value);
    // },


});

export default CompareDistrictsModel;
