import {tools, general} from "./tools";
import ColorCodeMapView from "./colorCodeMap/view";
import DashboardView from "./dashboard/view";
import DashboardTableView from "./dashboardTable/view";
import ContextMenuView from "./contextMenu/view";
import SelectDistrictView from "./selectDistrict/view";
import SaveSelectionCosiView from "./saveSelection/view";
import InfoScreenView from "./infoScreen/view";
import TimeSliderView from "./timeSlider/view";
import CalculateRatioView from "./calculateRatio/selectView";
import ReachabilityView from "./reachability/view";
import ServiceCoverageView from "./serviceCoverage/view";
import PrintView from "../../../modules/tools/print/view";
import GraphModel from "./graph_v2/model";
import ReachabilityAnalysisView from "./reachabiliyAnalysis/view";
import {storageListener, updateFromStorage} from "./storage";
import CompareDistrictsView from "./compareDistricts/view";

/**
 * @returns {void}
 * @summary that is incredibly unelegant!
 */
function initializeCosi () {
    // Define CoSI Namespace on window object
    var infoScreenOpen = JSON.parse(window.localStorage.getItem("infoScreenOpen"));

    window.CosiStorage = window.localStorage;

    const dashboard = new DashboardView({model: general.dashboard});

    new DashboardTableView({model: general.dashboardTable});
    new ContextMenuView();
    new GraphModel();

    Radio.trigger("ModelList", "addModelsAndUpdate", Object.values(general));

    // Handle TouchScreen / InfoScreen Loading
    if (!window.location.pathname.includes("infoscreen.html")) {
        CosiStorage.clear();

        Radio.trigger("ModelList", "addModelsAndUpdate", Object.values(tools));
        new CalculateRatioView({model: tools.calculateRatio});
        new ReachabilityAnalysisView({model: tools.reachabilityAnalysis});
        new ReachabilityView({model: tools.reachability});
        new ServiceCoverageView({model: tools.serviceCoverage});
        new ColorCodeMapView({model: tools.colorCodeMap});
        new SaveSelectionCosiView({model: tools.saveSelectionCosi});
        new TimeSliderView({model: tools.timeSlider});
        new SelectDistrictView({model: tools.selectDistrict});
        new PrintView({model: tools.print});
        new CompareDistrictsView({model: tools.compareDistricts});
    }
    else {
        // load dashboard content into infoscreen window
        new InfoScreenView({
            title: "CoSI InfoScreen",
            children: [dashboard],
            broadcasts: {
                SelectDistrict: [
                    "getScope",
                    "getSelector"
                ]
            }
        });
    }

    storageListener([
        general.dashboard,
        general.dashboardTable,
        general.dashboardWidgetHandler,
        tools.infoScreenHandler
    ]);

    updateFromStorage([
        general.dashboardTable
    ]);

    if (infoScreenOpen) {
        CosiStorage.setItem("infoScreenOpen", JSON.stringify(true));
    }
}

export default initializeCosi;
