import {tools, general} from "./tools";

import FeaturesLoader from "./featuresLoader/model";
import ColorCodeMapView from "./colorCodeMap/view";
import DashboardView from "./dashboard/view";
import DashboardTableView from "./dashboardTable/view";
import DashboardWidgetHandler from "./dashboardWidget/handler";
import SelectDistrictView from "./selectDistrict/view";
import SaveSelectionCosiView from "./saveSelection/view";
import InfoScreenView from "./infoScreen/view";
import TimeSliderView from "./timeSlider/view";

/**
 * @returns {void}
 */
function initializeCosi () {
    const dashboard = new DashboardView({model: general.dashboard});

    new DashboardTableView({model: general.dashboardTable});
    new DashboardWidgetHandler();

    // Handle TouchScreen / InfoScreen Loading
    if (!window.location.pathname.includes("infoscreen.html")) {
        new FeaturesLoader();
        Radio.trigger("ModelList", "addModelsAndUpdate", Object.values(tools));
        Radio.trigger("ModelList", "addModelsAndUpdate", [general.dashboard]);

        new ColorCodeMapView({model: tools.colorCodeMap});
        new SaveSelectionCosiView({model: tools.saveSelectionCosi});
        new TimeSliderView({model: tools.timeSlider});
        new SelectDistrictView({model: tools.selectDistrict});
    }
    else {
        new InfoScreenView({
            title: "CoSI InfoScreen",
            children: [dashboard]
        });
    }
}

export default initializeCosi;
