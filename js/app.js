import Vue from "vue";
import App from "../src/App.vue";
import store from "../src/store";
import RestReaderList from "../modules/restReader/collection";
import Autostarter from "../modules/core/autostarter";
import Util from "../modules/core/util";
import StyleList from "../modules/vectorStyle/list";
import Preparser from "../modules/core/configLoader/preparser";
import ParametricURL from "../modules/core/parametricURL";
import Map from "../modules/core/map";
import AddGeoJSON from "../modules/tools/addGeoJSON/model";
import WPS from "../modules/core/wps";
import RemoteInterface from "../modules/remoteInterface/model";
import RadioMasterportalAPI from "../modules/remoteInterface/radioMasterportalAPI";
import CswParserModel from "../modules/cswParser/model";
import WFSTransactionModel from "../modules/wfsTransaction/model";
import GraphModel from "../modules/tools/graph/model";
import ColorScale from "../modules/tools/colorScale/model";
import MenuLoader from "../modules/menu/menuLoader";
import ZoomToGeometry from "../modules/zoomToGeometry/model";
import ZoomToFeature from "../modules/zoomToFeature/model";
import SliderView from "../modules/snippets/slider/view";
import SliderRangeView from "../modules/snippets/slider/range/view";
import DropdownView from "../modules/snippets/dropdown/view";
import LayerinformationModel from "../modules/layerInformation/model";
import FooterView from "../modules/footer/view";
import ClickCounterModel from "../modules/clickCounter/model";
import MouseHoverPopupView from "../modules/mouseHover/view";
import QuickHelpView from "../modules/quickHelp/view";
import ScaleLineView from "../modules/scaleLine/view";
import WindowView from "../modules/window/view";
import SidebarView from "../modules/sidebar/view";
import LegendLoader from "../modules/legend/legendLoader";
import MeasureView from "../modules/tools/measure/view";
import CoordPopupView from "../modules/tools/getCoord/view";
import ShadowView from "../modules/tools/shadow/view";
import DrawView from "../modules/tools/draw/view";
import ParcelSearchView from "../modules/tools/parcelSearch/view";
import SearchByCoordView from "../modules/tools/searchByCoord/view";
import LineView from "../modules/tools/pendler/lines/view";
import AnimationView from "../modules/tools/pendler/animation/view";
import FilterView from "../modules/tools/filter/view";
import SaveSelectionView from "../modules/tools/saveSelection/view";
import StyleWMSView from "../modules/tools/styleWMS/view";
import LayerSliderView from "../modules/tools/layerSlider/view";
import CompareFeaturesView from "../modules/tools/compareFeatures/view";
import ImportView from "../modules/tools/kmlImport/view";
import WFSFeatureFilterView from "../modules/wfsFeatureFilter/view";
import ExtendedFilterView from "../modules/tools/extendedFilter/view";
import AddWMSView from "../modules/tools/addWMS/view";
import RoutingView from "../modules/tools/viomRouting/view";
import Contact from "../modules/tools/contact/view";
import TreeFilterView from "../modules/treeFilter/view";
import Formular from "../modules/formular/view";
import FeatureLister from "../modules/featureLister/view";
import PrintView from "../modules/tools/print_/view";

// @deprecated in version 3.0.0
// remove "version" in doc and config.
// rename "print_" to "print"
// only load PrintView
import PrintView2 from "../modules/tools/print/view";
// controls
import ControlsView from "../modules/controls/view";
import ZoomControlView from "../modules/controls/zoom/view";
import OrientationView from "../modules/controls/orientation/view";
import MousePositionView from "../modules/controls/mousePosition/view";
import FullScreenView from "../modules/controls/fullScreen/view";
import TotalView from "../modules/controls/totalView/view";
import AttributionsView from "../modules/controls/attributions/view";
import OverviewmapView from "../modules/controls/overviewMap/view";
import FreezeModel from "../modules/controls/freeze/model";
import MapMarkerView from "../modules/mapMarker/view";
import SearchbarView from "../modules/searchbar/view";
import TitleView from "../modules/title/view";
import HighlightFeature from "../modules/highlightFeature/model";
import Button3DView from "../modules/controls/button3d/view";
import ButtonObliqueView from "../modules/controls/buttonOblique/view";
import Orientation3DView from "../modules/controls/orientation3d/view";
import BackForwardView from "../modules/controls/backForward/view";
import "es6-promise/auto";
import VirtualcityModel from "../modules/tools/virtualCity/model";

let sbconfig, controls, controlsView;

/**
 * load the configuration of master portal
 * @return {void}.
 */
function loadApp () {
    /* eslint-disable no-undef */
    const allAddons = Object.is(ADDONS, {}) ? {} : ADDONS,
        utilConfig = {},
        layerInformationModelSettings = {},
        cswParserSettings = {},
        mapMarkerConfig = Config.hasOwnProperty("mapMarker") ? Config.mapMarker : {},
        style = Radio.request("Util", "getUiStyle");
        /* eslint-disable no-undef */
    let app = {};

    if (_.has(Config, "uiStyle")) {
        utilConfig.uiStyle = Config.uiStyle.toUpperCase();
    }
    if (_.has(Config, "proxyHost")) {
        utilConfig.proxyHost = Config.proxyHost;
    }
    if (_.has(Config, "proxy")) {
        utilConfig.proxy = Config.proxy;
    }

    // RemoteInterface laden
    if (_.has(Config, "remoteInterface")) {
        new RemoteInterface(Config.remoteInterface);
        new RadioMasterportalAPI();
    }

    if (_.has(Config, "quickHelp")) {
        new QuickHelpView(Config.quickHelp);
    }

    Vue.config.productionTip = false;
    app = new Vue({
        render: h => h(App),
        store
    });

    app.$store.commit("addConfigToStore", Config);
    app.$mount();

    // Core laden
    new Autostarter();
    new Util(utilConfig);
    // Pass null to create an empty Collection with options
    new RestReaderList(null, {url: Config.restConf});
    new Preparser(null, {url: Config.portalConf});
    new StyleList();
    new ParametricURL();
    new Map(Radio.request("Parser", "getPortalConfig").mapView);
    new WPS();
    new AddGeoJSON();
    new WindowView();

    if (_.has(Config, "cswId")) {
        cswParserSettings.cswId = Config.cswId;
    }

    new CswParserModel(cswParserSettings);
    new GraphModel();
    new WFSTransactionModel();
    new MenuLoader();
    new ColorScale();

    if (Config.hasOwnProperty("zoomToGeometry")) {
        new ZoomToGeometry(Config.zoomToGeometry);
    }
    if (_.has(Config, "zoomToFeature")) {
        new ZoomToFeature(Config.zoomToFeature);
    }

    new SliderView();
    new SliderRangeView();
    new DropdownView();

    if (_.has(Config, "metaDataCatalogueId")) {
        layerInformationModelSettings.metaDataCatalogueId = Config.metaDataCatalogueId;
    }
    new LayerinformationModel(layerInformationModelSettings);

    if (_.has(Config, "footer")) {
        new FooterView(Config.footer);
    }

    if (_.has(Config, "clickCounter") && _.has(Config.clickCounter, "desktop") && Config.clickCounter.desktop !== "" && _.has(Config.clickCounter, "mobile") && Config.clickCounter.mobile !== "") {
        new ClickCounterModel(Config.clickCounter.desktop, Config.clickCounter.mobile, Config.clickCounter.staticLink);
    }

    if (_.has(Config, "mouseHover")) {
        new MouseHoverPopupView(Config.mouseHover);
    }

    if (_.has(Config, "scaleLine") && Config.scaleLine === true) {
        new ScaleLineView();
    }


    // Module laden
    // Tools

    new SidebarView();

    _.each(Radio.request("ModelList", "getModelsByAttributes", {type: "tool"}), function (tool) {
        switch (tool.id) {
            case "compareFeatures": {
                new CompareFeaturesView({model: tool});
                break;
            }
            case "lines": {
                new LineView({model: tool});
                break;
            }
            case "animation": {
                new AnimationView({model: tool});
                break;
            }
            case "filter": {
                new FilterView({model: tool});
                break;
            }
            case "coord": {
                new CoordPopupView({model: tool});
                break;
            }
            case "shadow": {
                new ShadowView({model: tool});
                break;
            }
            case "measure": {
                new MeasureView({model: tool});
                break;
            }
            case "draw": {
                new DrawView({model: tool});
                break;
            }
            case "print": {
                // @deprecated in version 3.0.0
                // remove "version" in doc and config.
                // rename "print_" to "print"
                // only load correct view
                if (tool.has("version") && (tool.get("version") === "mapfish_print_3" || tool.get("version") === "HighResolutionPlotService")) {
                    new PrintView({model: tool});
                }
                else {
                    new PrintView2({model: tool});
                }
                break;
            }
            case "parcelSearch": {
                new ParcelSearchView({model: tool});
                break;
            }
            case "searchByCoord": {
                new SearchByCoordView({model: tool});
                break;
            }
            case "saveSelection": {
                new SaveSelectionView({model: tool});
                break;
            }
            case "kmlimport": {
                new ImportView({model: tool});
                break;
            }
            case "wfsFeatureFilter": {
                new WFSFeatureFilterView({model: tool});
                break;
            }
            case "extendedFilter": {
                new ExtendedFilterView({model: tool});
                break;
            }
            case "treeFilter": {
                new TreeFilterView({model: tool});
                break;
            }
            case "routing": {
                new RoutingView({model: tool});
                break;
            }
            case "contact": {
                new Contact({model: tool});
                break;
            }
            case "addWMS": {
                new AddWMSView({model: tool});
                break;
            }
            case "featureLister": {
                new FeatureLister({model: tool});
                break;
            }
            case "formular": {
                new Formular({model: tool});
                break;
            }
            case "legend": {
                new LegendLoader(tool);
                break;
            }
            case "styleWMS": {
                new StyleWMSView({model: tool});
                break;
            }
            /**
             * layerslider
             * @deprecated in 3.0.0
             */
            case "layerslider": {
                new LayerSliderView({model: tool});
                break;
            }
            case "layerSlider": {
                new LayerSliderView({model: tool});
                break;
            }
            case "virtualCity": {
                new VirtualcityModel(tool.attributes);
                break;
            }
            default: {
                break;
            }
        }
    });
    if (!style || style !== "SIMPLE") {
        controls = Radio.request("Parser", "getItemsByAttributes", {type: "control"});
        controlsView = new ControlsView();

        _.each(controls, function (control) {
            var element,
                orientationConfigAttr = _.isString(control.attr) ? {zoomMode: control.attr} : control;

            switch (control.id) {
                case "zoom": {
                    if (control.attr === true) {
                        element = controlsView.addRowTR(control.id);
                        new ZoomControlView({el: element});
                    }
                    break;
                }
                case "orientation": {
                    element = controlsView.addRowTR(control.id, true);
                    orientationConfigAttr.epsg = Radio.request("MapView", "getProjection").getCode();
                    new OrientationView({el: element, config: orientationConfigAttr});
                    break;
                }
                case "mousePosition": {
                    if (control.attr === true) {
                        element = controlsView.addRowBL(control.id);
                        new MousePositionView({el: element});
                    }
                    break;
                }
                case "fullScreen": {
                    if (control.attr === true) {
                        element = controlsView.addRowTR(control.id);
                        new FullScreenView({el: element});
                    }
                    break;
                }
                /**
                 * totalView
                 * @deprecated in 3.0.0
                 */
                case "totalview": {
                    if (control.attr === true || _.isObject(control.attr)) {
                        console.warn("'totalview' is deprecated. Please use 'totalView' instead");
                        new TotalView(control.id);
                    }
                    break;
                }
                case "totalView": {
                    if (control.attr === true || _.isObject(control.attr)) {
                        new TotalView(control.id);
                    }
                    break;
                }
                case "attributions": {
                    if (control.attr === true || _.isObject(control.attr)) {
                        element = controlsView.addRowBR(control.id, true);
                        new AttributionsView({el: element});
                    }
                    break;
                }
                /**
                 * backforward
                 * @deprecated in 3.0.0
                 */
                case "backforward": {
                    if (control.attr === true || _.isObject(control.attr)) {
                        console.warn("'backforward' is deprecated. Please use 'backForward' instead");
                        element = controlsView.addRowTR(control.id, false);
                        new BackForwardView({el: element});
                    }
                    break;
                }
                case "backForward": {
                    if (control.attr === true || _.isObject(control.attr)) {
                        element = controlsView.addRowTR(control.id, false);
                        new BackForwardView({el: element});
                    }
                    break;
                }
                /**
                 * overviewmap
                 * @deprecated in 3.0.0
                 */
                case "overviewmap": {
                    if (control.attr === true || _.isObject(control.attr)) {
                        console.warn("'overviewmap' is deprecated. Please use 'overviewMap' instead");
                        element = controlsView.addRowBR(control.id, false);
                        new OverviewmapView(element, control.id, control.attr);
                    }
                    break;
                }
                case "overviewMap": {
                    if (control.attr === true || _.isObject(control.attr)) {
                        element = controlsView.addRowBR(control.id, false);
                        new OverviewmapView(element, control.id, control.attr);
                    }
                    break;
                }
                case "freeze": {
                    if (control.attr === true) {
                        element = controlsView.addRowTR(control.id);
                        new FreezeModel({uiStyle: style, el: element});
                    }
                    break;
                }
                case "button3d": {
                    if (control.attr === true) {
                        element = controlsView.addRowTR(control.id);
                        new Button3DView({el: element});
                    }
                    break;
                }
                case "buttonOblique": {
                    if (control.attr === true) {
                        element = controlsView.addRowTR(control.id);
                        new ButtonObliqueView({el: element});
                    }
                    break;
                }
                case "orientation3d": {
                    if (control.attr === true) {
                        element = controlsView.addRowTR(control.id);
                        new Orientation3DView({el: element});
                    }
                    break;
                }
                default: {
                    break;
                }
            }
        });
    }

    new MapMarkerView(mapMarkerConfig);

    sbconfig = _.extend({}, _.has(Config, "quickHelp") ? {quickHelp: Config.quickHelp} : {});
    sbconfig = _.extend(sbconfig, Radio.request("Parser", "getItemsByAttributes", {type: "searchBar"})[0].attr);
    if (sbconfig) {
        new SearchbarView(sbconfig);
        if (Radio.request("Parser", "getPortalConfig").PortalTitle || Radio.request("Parser", "getPortalConfig").portalTitle) {
            new TitleView();
        }
    }

    new HighlightFeature();

    if (Config.addons !== undefined) {
        Config.addons.forEach((addonKey) => {
            if (allAddons[addonKey] !== undefined) {
                // .js need to be removed so webpack only searches for .js files
                const entryPoint = allAddons[addonKey].replace(/\.js$/, "");

                import(/* webpackChunkName: "[request]" */ "../addons/" + entryPoint + ".js").then(module => {
                    /* eslint-disable new-cap */
                    const addon = new module.default();

                    // addons are initialized with 'new Tool(attrs, options);', that produces a rudimental model. Now the model must be replaced in modellist:
                    if (addon.model) {
                        Radio.trigger("ModelList", "replaceModelById", addon.model.id, addon.model);
                    }
                }).catch(error => {
                    console.error(error);
                    Radio.trigger("Alert", "alert", "Entschuldigung, diese Anwendung konnte nicht vollständig geladen werden. Bitte wenden sie sich an den Administrator.");
                });
            }
        });
    }

    Radio.trigger("Util", "hideLoader");
}

export {loadApp};
