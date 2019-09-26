import {WFS, GeoJSON} from "ol/format.js";

// https://geodienste.hamburg.de/HH_WFS_Statistische_Gebiete_Test?service=WFS&request=DescribeFeatureType&version=1.1.0&typename=de.hh.up:v_hh_statistik_bev_maennlich
let layerList = [];
let t = [];
/**
 *
 */
function initializeCosi () {
    const objectlist = Radio.request("RawLayerList", "getLayerListWhere", {url: "https://geodienste.hamburg.de/HH_WFS_Statistische_Gebiete_Test"});
    // console.info(objectlist);
    // console.info(objectlist[0].get("featureNS"));

    objectlist.forEach(function (lay) {
        t.push(
            fetch(lay.get("url") + "?service=WFS&request=Getfeature&SRSNAME=EPSG:25832&version=1.1.0&typename=" + lay.get("featureType") + "&propertyName=stat_gebiet,stadtteil,kategorie,jahr_2018,jahr_2017,jahr_2016,jahr_2015,jahr_2014,jahr_2013,jahr_2012,jahr_2011")
            .then(data => data.text())
            .then(function (res) {
                // console.info(res);
                var wfsReader,
                features;

            wfsReader = new WFS({
                featureNS: objectlist[0].get("featureNS")
            });
            features = wfsReader.readFeatures(res);
            // console.info(features);
            var geojsonReader = new GeoJSON();
            var json = geojsonReader.writeFeaturesObject(features);
            layerList.push(json);
            // console.info(layerList);
            })
            .catch(function(error) {
                console.info(error);
            })
        );
    });
    Promise.all(t).then(function() {
        console.log (layerList);
        // console.info(t);
    });
    // console.info(layerList);
    // case: parameter is URL
    // const Http = new XMLHttpRequest();

    // Http.timeout = 10000;
    // Http.open("GET", "https://geodienste.hamburg.de/HH_WFS_Statistische_Gebiete_Test?service=WFS&request=Getfeature&SRSNAME=EPSG:25832&version=1.1.0&typename=de.hh.up:v_hh_statistik_bev_maennlich&propertyName=jahr_2018");
    // Http.send();
    // Http.onload = function () {
    //     console.info(Http);
    //     // layerList = JSON.parse(Http);

    //     if (typeof callback === "function") {
    //         return callback(layerList);
    //     }
    //     var wfsReader,
    //         features;

    //     wfsReader = new WFS({
    //         featureNS: objectlist[0].get("featureNS")
    //     });
    //     features = wfsReader.readFeatures(Http.responseText);
    //     console.info(features);
    //     var geojsonReader = new GeoJSON();
    //     var json = geojsonReader.writeFeaturesObject(features);
    //     console.info(json);
    //     return true;
    // };
    // Http.onerror = function (e) {
    //     console.error("An error occured when trying to fetch services from '" + layerConf + "':", e);
    //     callback(false, e);
    // };
}

export default initializeCosi;
