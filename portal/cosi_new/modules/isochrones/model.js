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
        range: 0,
        geojsonObject: {
            'type': 'FeatureCollection',
            'crs': {
                'type': 'name',
                'properties': {
                    'name': 'EPSG:3857'
                }
            },
            'features': [{
                'type': 'Feature',
                'geometry': {
                    'type': 'Point',
                    'coordinates': [0, 0]
                }
            }, {
                'type': 'Feature',
                'geometry': {
                    'type': 'LineString',
                    'coordinates': [[4e6, -2e6], [8e6, 2e6]]
                }
            }, {
                'type': 'Feature',
                'geometry': {
                    'type': 'LineString',
                    'coordinates': [[4e6, 2e6], [8e6, -2e6]]
                }
            }, {
                'type': 'Feature',
                'geometry': {
                    'type': 'Polygon',
                    'coordinates': [[[-5e6, -1e6], [-4e6, 1e6], [-3e6, -1e6]]]
                }
            }, {
                'type': 'Feature',
                'geometry': {
                    'type': 'MultiLineString',
                    'coordinates': [
                        [[-1e6, -7.5e5], [-1e6, 7.5e5]],
                        [[1e6, -7.5e5], [1e6, 7.5e5]],
                        [[-7.5e5, -1e6], [7.5e5, -1e6]],
                        [[-7.5e5, 1e6], [7.5e5, 1e6]]
                    ]
                }
            }, {
                'type': 'Feature',
                'geometry': {
                    'type': 'MultiPolygon',
                    'coordinates': [
                        [[[-5e6, 6e6], [-5e6, 8e6], [-3e6, 8e6], [-3e6, 6e6]]],
                        [[[-2e6, 6e6], [-2e6, 8e6], [0, 8e6], [0, 6e6]]],
                        [[[1e6, 6e6], [1e6, 8e6], [3e6, 8e6], [3e6, 6e6]]]
                    ]
                }
            }, {
                'type': 'Feature',
                'geometry': {
                    'type': 'GeometryCollection',
                    'geometries': [{
                        'type': 'LineString',
                        'coordinates': [[-5e6, -5e6], [0, -5e6]]
                    }, {
                        'type': 'Point',
                        'coordinates': [4e6, -5e6]
                    }, {
                        'type': 'Polygon',
                        'coordinates': [[[1e6, -6e6], [2e6, -4e6], [3e6, -6e6]]]
                    }]
                }
            }]
        }
    }),
    initialize: function () {
        this.superInitialize();
    }

});

export default IsoChrones;
