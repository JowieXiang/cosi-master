import "../model";
import * as ElasticSearch from "../../core/elasticsearch";

const GdiModel = Backbone.Model.extend({
    defaults: {
        minChars: 3,
        serviceId: "",
        sorting: {},
        size: 10000
    },
    /**
     * @description Initialise GDI-Search via ElasticSearch
     * @param {Object} config - gdi-ConfigObject
     * @param {integer} [config.minChars=3] - minimal number of searchcharacters
     * @param {string} config.serviceId - rest-services Id
     * @returns {void}
     */
    initialize: function () {
        var channel = Radio.channel("GDI-Search");

        channel.on({
            "addLayer": this.addLayer
        }, this);

        this.setSorting("_score", "desc");

        this.listenTo(Radio.channel("Searchbar"), {
            "search": this.search
        });
    },

    search: function (searchString) {
        var query = this.createQuery(searchString),
            response = null;

        if (searchString.length >= this.get("minChars")) {
            response = ElasticSearch.search(this.get("serviceId"), query, this.get("sorting"), this.get("size"));
            if (response && response.hits) {
                _.each(response.hits, function (hit) {
                    Radio.trigger("Searchbar", "pushHits", "hitList", {
                        name: hit.name,
                        type: "Fachthema",
                        glyphicon: "glyphicon-list",
                        id: hit.id,
                        triggerEvent: {
                            channel: "GDI-Search",
                            event: "addLayer"
                        },
                        source: hit
                    });
                }, this);
            }

            Radio.trigger("Searchbar", "createRecommendedList");
        }
    },
    createQuery: function (searchString) {
        /* Zur Zeit noch nicht fuzzy */
        var query = {
            bool: {
                must: [
                    {
                        query_string: {
                            "fields": ["datasets.md_name^2", "name^2", "datasets.keywords"],
                            "query": "*" + searchString + "*",
                            "lowercase_expanded_terms": false
                        }
                    },
                    {match:
                        {
                            typ: "WMS"
                        }
                    }
                ]
            }
        };

        return query;
    },
    addLayer: function (hit) {
        var treeType = Radio.request("Parser", "getTreeType"),
            parentId = "tree",
            level = 0,
            layerTreeId;

        if (hit.source) {

            /* Erst mal prüfen, ob es den Layer schon im Themenbaum gibt */
            layerTreeId = Radio.request("Parser", "getItemByAttributes", {id: hit.source.id});
            /* wenn es den Layer noch nicht gibt, diesen aus dem ElasticSearch-Ergebnis erzeugen */
            if (_.isUndefined(layerTreeId)) {

                if (treeType === "custom") {
                    /* Im Custom-Tree erst mal einen neuen Folder erzeugen und diesem den Folder "Ext.Thema" hinzufügen (falls es diese noch nicht gibt) */
                    parentId = "extthema";
                    level = 2;
                    if (_.isUndefined(Radio.request("Parser", "getItemByAttributes", {id: "ExternalLayer"}))) {
                        Radio.trigger("Parser", "addFolder", "Externe Fachdaten", "ExternalLayer", "tree", 0);
                        Radio.trigger("ModelList", "renderTree");
                        $("#Overlayer").parent().after($("#ExternalLayer").parent());
                    }
                    if (_.isUndefined(Radio.request("Parser", "getItemByAttributes", {id: parentId}))) {
                        Radio.trigger("Parser", "addFolder", "Fachthema", parentId, "ExternalLayer", 1, true);
                    }
                }

                /* Dann den neuen Layer aus dem ElasicSearch-Ergebnis erzeugen */
                Radio.trigger("Parser",
                    "addGDILayer",
                    {
                        name: hit.source.name,
                        id: hit.source.id,
                        parentId: parentId,
                        level: level,
                        layers: hit.source.layers,
                        url: hit.source.url,
                        version: hit.source.version,
                        gfiAttributes: hit.source.gfiAttributes ? hit.source.gfiAttributes : "showAll",
                        datasets: hit.source.datasets,
                        isJustAdded: true
                    });

                /* und der ModelList hinzufügen */
                Radio.trigger("ModelList", "addModelsByAttributes", {id: hit.source.id});
            }

            Radio.trigger("ModelList", "showModelInTree", hit.source.id);
            if (treeType === "light") {
                Radio.trigger("ModelList", "refreshLightTree");
            }
        }
        else {
            console.error("Es konnte kein Eintrag für Layer " + hit.id + " in ElasticSearch gefunden werden.");
        }
    },
    setMinChars: function (value) {
        this.set("minChars", value);
    },
    setServiceId: function (value) {
        this.set("serviceId", value);
    },
    setSorting: function (key, value) {
        if (key && value) {
            this.get("sorting")[key] = value;
        }
    },
    setSize: function (value) {
        if (typeof value === "number") {
            this.set("size", value);
        }
    }

});

export default GdiModel;
