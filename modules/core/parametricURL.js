define([
    "backbone",
    "backbone.radio",
    "config"
], function (Backbone, Radio, Config) {

    var ParametricURL = Backbone.Model.extend({

        initialize: function () {
            var channel = Radio.channel("ParametricURL");

            channel.reply({
                "getResult": this.getResult,
                "getLayerParams": this.getLayerParams
            }, this);

            this.parseURL();
        },

        setResult: function (value) {
            this.set("result", value);
        },

        setLayerParams: function (value) {
            this.set("layerParams", value);
        },

        getResult: function () {
            return this.get("result");
        },

        getLayerParams: function () {
            return this.get("layerParams");
        },

        createLayerParams: function () {
            var layerIdString = _.values(_.pick(this.getResult(), "LAYERIDS"))[0],
                visibilityListString = "",
                transparencyListString = "",
                layerIdList = [],
                visibilityList = [],
                transparencyList = [],
                layerParams = [];

                if (_.has(this.getResult(), "VISIBILITY")) {
                    visibilityListString = _.values(_.pick(this.getResult(), "VISIBILITY"))[0];
                }
                if (_.has(this.getResult(), "TRANSPARENCY")) {
                     transparencyListString = _.values(_.pick(this.getResult(), "TRANSPARENCY"))[0];
                }

           if (layerIdString.indexOf(",") !== -1) {
               layerIdList = layerIdString.split(",");
               visibilityList = visibilityListString.split(",");
               transparencyList = transparencyListString.split(",");
           }
           else {
               layerIdList.push(layerIdString);
               visibilityList.push(visibilityListString);
               transparencyList.push(transparencyListString);
           }
           _.each(layerIdList, function (val, index) {
               layerParams.push({id: val, visibility: visibilityList[index], transparency: transparencyList[index]});
           });
           this.setLayerParams(layerParams);
        },

        parseURL: function (result) {
            // Parsen des parametrisierten Aufruf --> http://wscd0096/libs/lgv/portale/master?layerIDs=453,1346&center=555874,5934140&zoomLevel=4&isMenubarVisible=false
            var query = location.search.substr(1).toUpperCase(), // URL --> alles nach ? wenn vorhanden
                result = {};

            query.split("&").forEach(function (keyValue) {
                var item = keyValue.split("=");

                result[item[0]] = decodeURIComponent(item[1]); // item[0] = key; item[1] = value;
            });

            this.setResult(result);
            /**
             * Über diesen Parameter wird GeoOnline aus dem Transparenzporal aufgerufen
             * Der entsprechende Datensatz soll angezeigt werden
             * Hinter dem Parameter Id steckt die MetadatenId des Metadatensatzes
             * Die Metadatensatz-Id wird in die config geschrieben
             */
            if (_.has(result, "MDID")) {
                var values = _.values(_.pick(result, "MDID"))[0].split(",");

                Config.tree.metaIdsToSelected = values;
                Config.view.zoomLevel = 0;
            }

            /**
             * Gibt die initiale Zentrumskoordinate zurück.
             * Ist der Parameter "center" vorhanden wird dessen Wert zurückgegeben, ansonsten der Standardwert.
             */
            if (_.has(result, "CENTER")) {
                var values = _.values(_.pick(result, "CENTER"))[0].split(",");

                _.each(values, function (value, index) {
                    value = parseInt(value, 10);
                    values[index] = value;
                });
                Config.view.center = values;
            }

            if (_.has(result, "BEZIRK")) {
                var bezirk = _.values(_.pick(result, "BEZIRK"))[0],
                    bezirke = [
                        {name: "ALTONA", number: "2", position: [556681, 5937664]},
                        {name: "HAMBURG-HARBURG", number: "7", position: [560291, 5925817]},
                        {name: "HAMBURG-NORD", number: "4", position: [567677, 5941650]},
                        {name: "BERGEDORF", number: "6", position: [578779, 5924255]},
                        {name: "EIMSBÜTTEL", number: "3", position: [561618, 5940019]},
                        {name: "HAMBURG-MITTE", number: "1", position: [566380, 5932134]},
                        {name: "WANDSBEK", number: "5", position: [574344, 5943750]}
                    ];

                    if (bezirk.length === 1) {
                        Config.view.center = _.findWhere(bezirke, {number: bezirk}).position;
                    }
                    else {
                        Config.view.center = _.findWhere(bezirke, {name: bezirk.trim().toUpperCase()}).position;
                    }
            }

            /**
             * Gibt die LayerIDs für die Layer zurück, die initial sichtbar sein sollen.
             * Ist der Parameter "layerIDs" vorhanden werden dessen IDs zurückgegeben, ansonsten die konfigurierten IDs.
             */
            if (_.has(result, "LAYERIDS") && result.LAYERIDS.length > 0) {
                this.createLayerParams();
            }

            if (_.has(result, "FEATUREID")) {
                var id = _.values(_.pick(result, "FEATUREID"))[0];

                Config.zoomtofeature.id = id;
            }

            /**
             * Gibt die initiale Resolution (Zoomlevel) zurück.
             * Ist der Parameter "zoomLevel" vorhanden wird der Wert in die Config geschrieben und in der mapView ausgewertet.
             */
            if (_.has(result, "ZOOMLEVEL")) {
                var value = _.values(_.pick(result, "ZOOMLEVEL"))[0];

                Config.view.zoomLevel = value;
            }

            /**
            * Gibt den Wert für die config-Option isMenubarVisible zurück.
            * Ist der Parameter "isMenubarVisible" vorhanden, wird dieser zurückgegeben, ansonsten der Standardwert.
            *
            */
            if (_.has(result, "ISMENUBARVISIBLE")) {
                var value = _.values(_.pick(result, "ISMENUBARVISIBLE"))[0].toUpperCase();

                if (value === "TRUE") {
                    Config.isMenubarVisible = true;
                }
                else {
                    Config.isMenubarVisible = false;
                }
            }

            /**
            * Gibt den Wert für die config-Option isMenubarVisible zurück.
            * Ist der Parameter "isMenubarVisible" vorhanden, wird dieser zurückgegeben, ansonsten der Standardwert.
            *
            */
            if (_.has(result, "STARTUPMODUL")) {
                var value = _.values(_.pick(result, "STARTUPMODUL"))[0].toUpperCase();

                Config.startUpModul = value;
            }

            /**
            *
            */
            if (_.has(result, "QUERY")) {
                var value = _.values(_.pick(result, "QUERY"))[0].toLowerCase(),
                    initString = "";

                // Bei " " oder "-" im Suchstring
                if (value.includes(" ") || value.includes("-")) {

                    // nach " " splitten
                    var split = value.split(" ");

                    _.each (split, function (splitpart) {
                        initString += splitpart.substring(0, 1).toUpperCase() + splitpart.substring(1) + " ";
                    });
                    initString = initString.substring(0, initString.length - 1);

                    // nach "-" splitten
                    split = "";
                    split = initString.split("-");
                    initString = "";
                    _.each (split, function (splitpart) {
                        initString += splitpart.substring(0, 1).toUpperCase() + splitpart.substring(1) + "-";
                    });
                    initString = initString.substring(0, initString.length - 1);
                }
                else {
                    initString = value.substring(0, 1).toUpperCase() + value.substring(1);
                }
                Config.searchBar.initString = initString;
            }

            /**
            * Gibt den Wert für die config-Option clickCounter.enabled zurück.
            *
            */
            if (_.has(result, "CLICKCOUNTER")) {
                var value = _.values(_.pick(result, "CLICKCOUNTER"))[0].toUpperCase();

                Config.clickCounter.version = value;
            }

            /**
            * blendet alle Bedienelemente aus - für MRH
            *
            */
            if (_.has(result, "STYLE")) {
                var value = _.values(_.pick(result, "STYLE"))[0].toUpperCase();

                if (value === "SIMPLE") {
                    $("#main-nav").hide();
                }
            }
        }
    });

    return ParametricURL;
});