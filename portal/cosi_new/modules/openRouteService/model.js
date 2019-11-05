const openRouteService = Backbone.Model.extend({
    defaults: {
        baseUrl: "https://api.openrouteservice.org/v2/isochrones/",
        accessKey: "5b3ce3597851110001cf6248043991d7b17346a38c8d50822087a2c0"
    },
    initialize: function () {
        this.channel = Radio.channel("OpenRoute");
        this.channel.reply({
            "requestIsochrones": this.requestIsochrones
        }, this);
    },
    /**
     * send request to get Isochrone geoJSON
     * @param {String} pathType - type of transportation
     * @param {Array} coordinate - coordinate of origin
     * @param {Array} rangeArray - array of time range values
     * @returns {void}
     */
    requestIsochrones: function (pathType, coordinate, rangeArray) {
        var that = this;

        return new Promise(function (resolve, reject) {
            // const body = '{"locations":[[9.9937,53.5511],[9.9937,53.5511]],"range":[300,200]}',
            const queryBody = `{"locations":[${JSON.stringify(coordinate)}],"range":${JSON.stringify(rangeArray)}}`,
                url = that.get("baseUrl") + pathType.trim();
            var xhr = new XMLHttpRequest();

            xhr.open("POST", url);
            xhr.setRequestHeader('Accept', 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8');
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.setRequestHeader('Authorization', that.get("accessKey"));
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

export default openRouteService;
