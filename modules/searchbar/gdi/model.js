import "../model";
import ElasticSearch from "../../core/elasticsearch";

const GdiModel = Backbone.Model.extend(/** @lends GdiModel.prototype */{
    defaults: {
        minChars: 3,
        serviceId: "",
        queryObject: {
            id: "query",
            params: {
                query_string: "%%searchString%%"
            }
        },
        elasticSearch: new ElasticSearch()
    },
    /**
     * @description Initialise GDI-Search via ElasticSearch
     * @returns {void}
     */
    initialize: function () {
        this.listenTo(Radio.channel("Searchbar"), {
            "search": this.search
        });
    },
    /**
     * Searchs layer if enough characters have been touched (if >="minChars")
     * @param {String} searchString - what is searched
     * @returns {void}
     */
    search: function (searchString) {
        const payload = this.appendSearchStringToPayload(this.get("queryObject"), "query_string", searchString),
            xhrConfig = {
                serviceId: this.get("serviceId"),
                type: "GET",
                async: false,
                payload: payload,
                responseEntryPath: "hits.hits"
            };
        let result;

        if (searchString.length >= this.get("minChars")) {
            result = this.get("elasticSearch").search(xhrConfig);
            this.createRecommendedList(result.hits);
        }
    },

    /**
     * Creates the reccommended List
     * @param {Object[]} responseData Response data.
     * @fires Searchbar#RadioTriggerSearchbarPushHits
     * @fires Searchbar#RadioTriggerSearchbarRemoveHits
     * @fires Searchbar#RadioTriggerSearchbarCreateRecommendedList
     * @returns {void}
     */
    createRecommendedList: function (responseData) {
        const triggerEvent = {
                channel: "Parser",
                event: "addGdiLayer"
            },
            hitMap = {
                name: "_source.name",
                id: "_source.id",
                source: "_source"
            },
            hitType = "Fachthema",
            hitGlyphicon = "glyphicon-list";

        if (responseData.length > 0) {
            responseData.forEach(result => {
                const hit = this.createHit(result, hitMap, hitType, hitGlyphicon, triggerEvent);

                Radio.trigger("Searchbar", "pushHits", "hitList", hit);
            });
        }
        else {
            Radio.trigger("Searchbar", "removeHits", "hitList", {type: "Straße"});
        }
        Radio.trigger("Searchbar", "createRecommendedList", "elasticSearch");
    },

    /**
     * Creates hit that is sent to the hitList.
     * @param {Object} result Result object from elastcisearch request.
     * @param {Object} hitMap Mapping object. Used to map results attributes to neccessary hit attributes.
     * @param {String} hitType Type of hit.
     * @param {String} hitGlyphicon Glyphicon class to show in reccomendedList
     * @param {Object} triggerEvent Object defining channel and event. used to fire event on mouseover and click in recommendedList.
     * @returns {Object} - hit.
     */
    createHit: function (result, hitMap, hitType, hitGlyphicon, triggerEvent) {
        let hit = {};

        Object.keys(hitMap).forEach(key => {
            hit[key] = this.findAttributeByPath(result, hitMap[key]);
        });
        hit.type = hitType;
        hit.glyphicon = hitGlyphicon;
        if (Object.keys(triggerEvent).length > 0) {
            hit = Object.assign(hit, {triggerEvent: triggerEvent});
        }
        return hit;
    },

    /**
     * Returns the attribute value of the given object by path.
     * If path is an array, the function recursively iterates over the object for each part and pushes the value in an array.
     * Otherwise only the value of the given attribute path will be returned.
     * @param {Object} object Object to derive value from.
     * @param {String|String[]} path Path of the attribute. "." in the path indicates the next deeper level.
     * @returns {*} - Value that is at position of given path.
     */
    findAttributeByPath: function (object, path) {
        let attribute = object,
            paths;

        if (Array.isArray(path)) {
            attribute = [];
            path.forEach(pathPart => {
                attribute.push(this.findAttributeByPath(object, pathPart));
            });
        }
        else {
            paths = path.split(".");
            paths.forEach(pathPart => {
                attribute = attribute[pathPart];
            });
        }
        return attribute;
    },

    /**
     * Recursively searches for the searchStringAttribute key and sets the searchString.
     * Adds the search string to the payload using the given key
     * @param {Object} payload Payload as Object
     * @param {String} searchStringAttribute Attribute key to be added to the payload object.
     * @param {String} searchString Search string to be added using the searchStringAttribute.
     * @returns {Object} - the payload with the search string.
     */
    appendSearchStringToPayload: function (payload, searchStringAttribute, searchString) {
        Object.keys(payload).forEach(key => {
            if (typeof payload[key] === "object") {
                payload[key] = this.appendSearchStringToPayload(payload[key], searchStringAttribute, searchString);
            }
            if (key === searchStringAttribute) {
                payload[searchStringAttribute] = searchString;
            }
        });

        return payload;
    },

    /**
     * function for the layers that are being searched for
     * @param {String} datasources - layers that have been found
     * @returns {void}
     */
    triggerHitList: function (datasources) {
        if (datasources) {
            _.each(datasources, function (hit) {
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
    },
    /**
     * creates query for searched string (layer)
     * @param {String} searchString - string that will be touched
     * @param {Object} queryObject - Query object.
     * @returns {Oject} result
     */
    createQuery: function (searchString, queryObject) {
        const query_object = queryObject,
            string_query = JSON.stringify(query_object),
            replace_object = string_query.replace("%%searchString%%", searchString),
            result = JSON.parse(replace_object);

        return result;
    },
    /**
     * Setter for MinChars
     * @param {Number} value - value for minChars
     * @returns {void}
     */
    setMinChars: function (value) {
        this.set("minChars", value);
    },
    /**
     * Setter for ServiceId
     * @param {Number} value for serviceId
     * @returns {void}
     */
    setServiceId: function (value) {
        this.set("serviceId", value);
    }
});

export default GdiModel;
