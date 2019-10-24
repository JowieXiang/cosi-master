import tools from "./tools";

import FeaturesLoader from "./featuresLoader/model";
import ColorCodeMapView from "./colorCodeMap/view";
import ColorCodeMap from "./colorCodeMap/model";
import Dashboard from "./dashboard/model";
import DashboardView from "./dashboard/view";
import DashboardContainerHandler from "./dashboardContainer/handler";
import SelectDistrictView from "./selectDistrict/view";
import SaveSelectionCosiView from "./saveSelection/view";
import InfoScreenView from "./infoScreen/view";
import TimeSliderView from "./timeSlider/view";

/**
 * @returns {void}
 */
function initializeCosi () {
    const dashboard = new DashboardView({model: tools.dashboard}),
        dashboardContainerhandler = new DashboardContainerHandler();

    // Handle TouchScreen / InfoScreen Loading
    if (!window.location.pathname.includes("infoscreen.html")) {
        new FeaturesLoader();
        Radio.trigger("ModelList", "addModelsAndUpdate", Object.values(tools));

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
