import {tools, general} from "./tools";
import ColorCodeMapView from "./colorCodeMap/view";
import DashboardView from "./dashboard/view";
import DashboardTableView from "./dashboardTable/view";
import DashboardWidgetHandler from "./dashboardWidget/handler";
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

/**
 * @returns {void}
 * @summary that is incredibly unelegant!
 */
function initializeCosi () {
    const dashboard = new DashboardView({model: general.dashboard});

    new DashboardTableView({model: general.dashboardTable});
    new DashboardWidgetHandler({
        replies: {
            FeaturesLoader: [
                "getDistrictsByScope",
                "getDistrictsByValue",
                "getAllFeaturesByAttribute",
                "getAllValuesByScope"
            ]
        }
    });
    new ContextMenuView();
    new GraphModel();

    Radio.trigger("ModelList", "addModelsAndUpdate", Object.values(general));

    // Handle TouchScreen / InfoScreen Loading
    if (!window.location.pathname.includes("infoscreen.html")) {
        Radio.trigger("ModelList", "addModelsAndUpdate", Object.values(tools));
        new CalculateRatioView({model: tools.calculateRatio});
        new ReachabilityView({model: tools.reachability});
        new ServiceCoverageView({model: tools.serviceCoverage});
        new ColorCodeMapView({model: tools.colorCodeMap});
        new SaveSelectionCosiView({model: tools.saveSelectionCosi});
        new TimeSliderView({model: tools.timeSlider});
        new SelectDistrictView({model: tools.selectDistrict});
        new PrintView({model: tools.print});
    }
    else {
        // load dashboard content into infoscreen window
        new InfoScreenView({
            title: "CoSI InfoScreen",
            children: [dashboard]
        });
    }
}

export default initializeCosi;
