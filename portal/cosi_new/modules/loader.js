
import FeaturesLoader from "./featuresLoader/model";
import tools from "./tools";

import DashboardView from "./dashboard/view";
import SelectDistrictView from "./selectDistrict/view";
import SaveSelectionCosiView from "./saveSelection/view";
import InfoScreenView from "./infoScreen/view";
import ColorCodeMapView from "./colorCodeMap/view";
import TimeSliderView from "./timeSlider/view";

/**
 * @returns {void}
 */
function initializeCosi () {
    const dashboard = new DashboardView({model: tools.Dashboard});

    // Handle TouchScreen / InfoScreen Loading
    if (!window.location.pathname.includes("infoscreen.html")) {
        new FeaturesLoader();
        new ColorCodeMapView();

        Radio.trigger("ModelList", "addModelsAndUpdate", Object.values(tools));

        new SaveSelectionCosiView({model: tools.SaveSelectionCosi});
        new SelectDistrictView({model: tools.SelectDistrict});
        new TimeSliderView({model: tools.TimeSlider});
    }
    else {
        new InfoScreenView({
            title: "CoSI InfoScreen",
            children: [dashboard]
        });
    }
}

export default initializeCosi;
