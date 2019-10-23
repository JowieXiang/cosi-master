import { Fill, Stroke, Style } from "../../../../node_modules/ol/style.js";
import GeometryCollection from "../../../../node_modules/ol/geom/GeometryCollection";
import Geometry from '../../../../node_modules/ol/geom/Geometry';
import Tool from "../../../../modules/core/modelList/tool/model";
import SnippetDropdownModel from "../../../../modules/snippets/dropdown/model";

const IsoChrones = Tool.extend({
    defaults: _.extend({}, Tool.prototype.defaults, {
        openrouteUrl: "https://api.openrouteservice.org/v2/isochrones/",
        key: "5b3ce3597851110001cf6248043991d7b17346a38c8d50822087a2c0",
        coordinate: [],
        pathType: "",
        range: 0
    }),
    initialize: function () {
        this.superInitialize();
    }

});

export default IsoChrones;
