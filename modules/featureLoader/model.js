
const FeatureLoaderModel = Backbone.Model.extend({
    defaults: {
        layerGroups: {
            "stadtteil": [
                "1694"
            ],
            "stadtteil-layers": [
                "2763",
                "2769",
                "2768",
                "2771"
            ],
            "statgebiet-layers": [
                "15563",
                "15564",
                "15565",
                "15989"
            ],
            "Sportstätten-layer": [
                "12868"
            ],
            "Grünflächen-layer": [
                "1534"
            ],
            "Kindertagesstätten-layer": [
                "753"
            ]
        },
        featureCollections: []
    },
    initialize: function () {
        this.channel = Radio.channel("FeatureLoader");

        this.channel.reply({
            "getFeaturesByLayerId": this.getFeaturesByLayerId,
            "checkIfLayermodelExist": this.checkIfLayermodelExist
        }, this);
        /**
         * todo: load data only when needed
         */
        this.listenTo(Radio.channel("SelectDistrict"), {
            "selectionChanged": function () {
                const selector = Radio.channel("SelectDistrict", "getSelector"),
                    layerList = _.union(Radio.request("Parser", "getItemsByAttributes", { typ: "WFS", isBaseLayer: false }), Radio.request("Parser", "getItemsByAttributes", { typ: "GeoJSON", isBaseLayer: false })),
                    selectedLayerGroup = layerList.filter(layer => layer.selector === selector);
            }
        });

        this.listenTo(Radio.channel("Layer"), {
            "featuresLoaded": function (layerId, features) {
                this.processData(layerId, features);
            }
        });
    },
    processData: function (layerId, features) {
        const currentLayerIds = this.get("featureCollections").length > 0 ? this.get("featureCollections").map(collection => collection.layerId) : [],
            layerCategory = _.allKeys(this.get("layerGroups")).filter(groupName => {
                const layerGroup = this.get("layerGroups")[groupName];

                return _.contains(layerGroup, layerId);
            });
        // console.log("layerGroup: ", layerCategory, layerId);

        if (!_.contains(currentLayerIds, layerId) && layerCategory.length > 0) {
            switch (layerCategory[0]) {
                case "stadtteil-layers": {
                    this.processStatteilData(features);
                    break;
                }
                case "stadtteil": {
                    this.processStatteilData(features);
                    break;
                }
                case "statgebiet-layers": {
                    console.log("gebiet layer: ", features[0].getProperties());
                    this.processStatgebietData(features);
                    break;
                }
                case "Sportstätten-layer": {
                    this.processSportsData(features);
                    break;
                }
                case "Grünflächen-layer": {
                    this.processGreenData(features);
                    break;
                }
                case "Kindertagesstätten-layer": {
                    this.processKinderData(features);
                    break;
                }
                default: {
                    break;
                }
            }
            this.channel.trigger("addFeatureCollection", layerId, features);
            this.pushFeatureCollection(layerId, features);
            console.log("layer:", layerId);
        }
    },
    processStatteilData: function (features) {
        _.each(features, feature => {
            if (_.contains(Object.keys(feature.getProperties()), "stadtteil")) {
                let stadtteil = feature.getProperties().stadtteil.replace(/_/g, "");

                stadtteil = stadtteil.replace(/-/g, "");
                stadtteil = stadtteil.replace(/\s+/g, "");
                feature.set("stadtteil", stadtteil);
            }
        }, this);
    },
    processStatgebietData: function (features) {
        _.each(features, feature => {
            // move "stat_gebiet" value to "statgebiet" for gebiet features
            if (_.contains(Object.keys(feature.getProperties()), "stat_gebiet")) {
                feature.set("statgebiet", feature.getProperties().stat_gebiet);
            }
        }, this);
    },
    processSportsData: function (sportFeatures) {

        const districtLayer = this.get("featureCollections").filter(collection => collection.layerId === this.get("layerGroups").stadtteil[0])[0];


        _.each(districtLayer.collection, districtFeature => {
            const districtGeometry = [districtFeature.getGeometry()];
            // console.log("districtGeometry: ", districtGeometry);

            if (districtGeometry) {
                const sports = sportFeatures.filter(sportFeature => districtFeature.getGeometry().intersectsExtent(sportFeature.getGeometry().getExtent()));

                districtFeature.set("Sportstätten", sports.length);
            }
            // console.log("districtFeature.getProperties().sports: ", districtFeature.getProperties()["Sportstätten"]);

        });
    },
    processGreenData: function (features) {
        _.each(features, feature => {

        }, this);
    },
    processKinderData: function (features) {
        _.each(features, feature => {

        }, this);
    },

    sendAddedLayer: function (layerId, features) {
        return {
            "layerId": layerId,
            "collection": features
        };
    },

    // push feature collection to this model
    pushFeatureCollection: function (layerId, features) {
        var featureCollections = this.get("featureCollections");

        featureCollections.push({
            "layerId": layerId,
            "collection": features
        });
        // console.log("featurepushed: ", features[0].getProperties());
        this.set("featureCollections", featureCollections);
    },

    getFeaturesByLayerId: function (layerId) {
        const selectedCollection = this.get("featureCollections").filter(collection => collection.layerId === layerId);
        let features = [];

        if (selectedCollection.length > 0) {
            features = selectedCollection[0].collection;
        }

        return features;
    },

    /**
     * Prüft ob das Layermodel schon existiert
     * @param   {object[]}  layerIds Konfiguration der Layer aus config.json
     * @returns {void}
     */
    checkIfLayermodelExist: function (layerIds) {
        _.each(layerIds, function (layer) {
            if (Radio.request("ModelList", "getModelsByAttributes", { id: layer.layerId }).length === 0) {
                this.addLayerModel(layer.layerId);
            }
        }, this);
    },
    /**
     * Fügt das Layermodel kurzzeitig der Modellist hinzu um prepareLayerObject auszuführen und entfernt das Model dann wieder.
     * @param   {string}  layerId    Id des Layers
     * @returns {void}
     */
    addLayerModel: function (layerId) {
        Radio.trigger("ModelList", "addModelsByAttributes", { id: layerId });
        this.sendModification(layerId, true);
        this.sendModification(layerId, false);
    },
    /**
     * Ermittelt die Sichtbarkeit der layerIds
     * @param   {string} activeLayerId id des activeLayer
     * @returns {void}
     */
    toggleLayerVisibility: function (activeLayerId) {
        _.each(this.get("layerIds")[this.get("scope")], function (layer) {
            var status = layer.layerId === activeLayerId;

            this.sendModification(layer.layerId, status);
        }, this);
    },

    /**
     * Triggert übers Radio die neue Sichtbarkeit
     * @param   {string}    layerId layerId
     * @param   {boolean}   status  Sichtbarkeit true / false
     * @returns {void}
     */
    sendModification: function (layerId, status) {
        Radio.trigger("ModelList", "setModelAttributesById", layerId, {
            isSelected: status,
            isVisibleInMap: status
        });
    }

});

export default FeatureLoaderModel;
