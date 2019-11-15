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
import CalculateRatio from "./calculateRatio/model";
import ReachabilityAnalysis from "./reachabiliyAnalysis/model";
import CompareDistricts from "./compareDistricts/model";

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
        compareDistricts: new CompareDistricts({
            id: "compareDistricts",
            parentId: "tools",
            type: "tool",
            name: "Vergleichbare Gebiete ermitteln",
            glyphicon: "glyphicon-screenshot"
        }),
        calculateRatio: new CalculateRatio({
            parentId: "tools",
            type: "tool",
            id: "calculateRatio",
            name: "Angebotsdeckung ermitteln",
            glyphicon: "glyphicon-tasks",
            modifierInfoText: "<h3>Gewichtung:</h3><p>Hiermit können Sie eine beliebige Gewichtung für die Berechnung der Angebots/Zielgruppen-Verhältnisse festlegen um die Deckung der Nachfrage zu überprüfen.<br />z.B.: 'Wieviele Qudaratmeter pädagogische Fläche benötigt ein Kitakind?'<br />Sie können zwischen 'geteilt' ('/') und 'multipliziert' ('x') wählen.</p><p><strong>Der eingegebene Wert entspricht keinem offiziellen, rechtlich bindenden Schlüssel, sonder dient rein der explorativen Analyse.</strong></p>"
        }),
        reachabilityAnalysis: new ReachabilityAnalysis({
            id: "reachabilityAnalysis",
            parentId: "tools",
            type: "tool",
            name: "Erreichbarkeitsanalyse",
            glyphicon: "glyphicon-road"
        }),
        reachability: new Reachability({
            id: "reachability",
            parentId: "tools",
            type: "tool",
            isVisibleInMenu: false,
            name: "Erreichbarkeit",
            glyphicon: "glyphicon-road"
        }),
        serviceCoverage: new ServiceCoverage({
            id: "serviceCoverage",
            parentId: "tools",
            type: "tool",
            name: "Erreichbarket im Gebiet",
            isVisibleInMenu: false,
            glyphicon: "glyphicon-time"
        }),
        colorCodeMap: new ColorCodeMap(),
        saveSelectionCosi: new SaveSelectionCosi({
            parentId: "utilities",
            type: "tool",
            glyphicon: "glyphicon-copy"
        }),
        timeSlider: new TimeSlider({
            parentId: "tools",
            type: "tool"
        })
    } : {};

export { tools, general };
