import FeaturesLoader from "./featuresLoader/model";
import BboxSettor from "./bboxSettor/model";
import ColorCodeMap from "./colorCodeMap/model";
import Dashboard from "./dashboard/model";
import DashboardTable from "./dashboardTable/model";
import SelectDistrict from "./selectDistrict/model";
import SaveSelectionCosi from "./saveSelection/model";
import TimeSlider from "./timeSlider/model";
import InfoScreenHandler from "./infoScreen/infoScreenHandler/model";
import Reachability from "./reachability/model";
import ServiceCoverage from "./serviceCoverage/model";
import OpenRouteService from "./openRouteService/model";

new FeaturesLoader();
new BboxSettor();
new OpenRouteService();

const general = {
        dashboardTable: new DashboardTable({
            name: "Übersicht",
            id: "dashboardTable"
        }),
        dashboard: new Dashboard({
            parentId: "root",
            type: "tool",
            name: "Dashboard",
            id: "dashboard",
            glyphicon: "glyphicon-dashboard",
            renderToWindow: false
        })
    },
    tools = !window.location.pathname.includes("infoscreen.html") ? {
        selectDistrict: new SelectDistrict({
            id: "selectDistrict",
            parentId: "root",
            type: "tool",
            name: "Gebiet auswählen",
            glyphicon: "glyphicon-picture",
            districtLayer: [
                {
                    name: "Stadtteile",
                    selector: "stadtteil",
                    id: "1694"
                },
                {
                    name: "Statistische Gebiete",
                    selector: "statgebiet",
                    id: "6071"
                }
            ]
        }),
        infoScreenHandler: new InfoScreenHandler({
            parentId: "utilities",
            type: "tool",
            windowName: "CoSI Info Screen",
            title: "CoSI Info Screen",
            name: "Zweites Fenster öffnen",
            glyphicon: "glyphicon-new-window",
            renderToWindow: false
        }),
        reachability: new Reachability({
            id: "reachability",
            parentId: "tools",
            type: "tool",
            name: "Erreichbarkeit",
            glyphicon: "glyphicon-road"
        }),
        serviceCoverage: new ServiceCoverage({
            id: "serviceCoverage",
            parentId: "tools",
            type: "tool",
            name: "serviceCoverage",
            glyphicon: "glyphicon-time"
        }),
        colorCodeMap: new ColorCodeMap(),
        saveSelectionCosi: new SaveSelectionCosi({
            parentId: "utilities",
            type: "tool"
        }),
        timeSlider: new TimeSlider({
            parentId: "tools",
            type: "tool"
        })
    } : {};

export {tools, general};
