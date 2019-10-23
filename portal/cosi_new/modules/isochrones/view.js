import Template from "text-loader!./template.html";
import SnippetDropdownView from "../../../../modules/snippets/dropdown/view";
import * as Proj from "ol/proj.js";

const IsoChronesView = Backbone.View.extend({
    events: {
        "click #create-isochrones": "createIsochrones",
        "click button#Submit": "checkIfSelected",
        "focus #range": "registerClickListener",
        "blur #range": "unregisterClickListener",
        "change #path-type": "setPathType",
        "change #range": "setRange"
    },
    initialize: function () {
        this.scopeDropdownView = new SnippetDropdownView({
            model: this.model.get("scopeDropdownModel")
        });

        this.listenTo(this.model, {
            "change:isActive": function (model, value) {
                this.render(model, value);
            }
        });

    },
    model: {},
    template: _.template(Template),
    render: function (model, value) {
        var attr = this.model.toJSON();

        if (value) {
            this.setElement(document.getElementsByClassName("win-body")[0]);
            this.$el.html(this.template(attr));
        }
        return this;
    },
    createIsochrones: function () {
        const openrouteUrl = this.model.get("openrouteUrl"),
            key = this.model.get("key"),
            coordinate = this.model.get("coordinate"),
            pathType = this.model.get("pathType"),
            range = this.model.get("range");

        if (coordinate.length > 0 && pathType !== "" && range !== 0) {
            this.makeRequest(openrouteUrl, key, pathType, coordinate, range).then(res => {
                console.log("res: ", res);
            });
        }
    },
    /**
     * listen for click events on the map when range input is focused
     * @returns {void}
     */
    registerClickListener: function () {
        this.clickListener = Radio.request("Map", "registerListener", "singleclick", this.setCoordinate.bind(this));
    },
    /**
     * unlisten click events when range input is blurred
     * @returns {void}
     */
    unregisterClickListener: function () {
        Radio.trigger("Map", "unregisterListener", this.clickListener);
    },
    /**
     * set coordinate value in model
     * @param {object} evt - click-on-map event
     * @returns {void}
     */
    setCoordinate: function (evt) {
        const coordinate = Proj.transform(evt.coordinate, "EPSG:25832", "EPSG:4326");

        this.model.set("coordinate", coordinate);
    },
    /**
     * set pathType value in model
     * @param {object} evt - select change event
     * @returns {void}
     */
    setPathType: function (evt) {
        this.model.set("pathType", evt.target.value);
    },
    /**
     * set range value in model
     * @param {object} evt - input change event
     * @returns {void}
     */
    setRange: function (evt) {
        this.model.set("range", evt.target.value);
    },

    makeRequest: function (baseUrl, key, pathType, coordinate, range) {
        return new Promise(function (resolve, reject) {
            // const body = '{"locations":[[9.9937,53.5511],[9.9937,53.5511]],"range":[300,200]}',
            const queryBody = `{"locations":[${JSON.stringify(coordinate)},[8.686507,49.41943]],"range":[${range}]}`,
                url = baseUrl + pathType.trim();
            var xhr = new XMLHttpRequest();

            xhr.open("POST", url);
            xhr.setRequestHeader('Accept', 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8');
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.setRequestHeader('Authorization', key);
            xhr.onload = function () {
                if (this.status >= 200 && this.status < 300) {
                    resolve(xhr.response);
                }
                else {
                    reject({
                        status: this.status,
                        statusText: xhr.statusText
                    });
                }
            };
            xhr.onerror = function () {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            };
            xhr.send(queryBody);
        });
    }
});

export default IsoChronesView;
