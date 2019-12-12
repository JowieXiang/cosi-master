import FeaturesLoader from "./featuresLoader/model";
import BboxSettor from "./bboxSettor/model";
import ColorCodeMap from "./colorCodeMap/model";
import Dashboard from "./dashboard/model";
import DashboardTable from "./dashboardTable/model";
import DashboardWidgetHandler from "./dashboardWidget/handler";
import SelectDistrict from "./selectDistrict/model";
import SaveSelectionCosi from "./saveSelection/model";
import InfoScreenHandler from "./infoScreen/infoScreenHandler/model";
import ReachabilityFromPoint from "./reachabilityFromPoint/model";
import ReachabilityInArea from "./reachabilityInArea/model";
import OpenRouteService from "./openRouteService/model";
import CalculateRatio from "./calculateRatio/model";
import ReachabilitySelect from "./reachabilitySelect/model";
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
            renderToWindow: false,
            keepOtherToolsOpened: true
        }),
        dashboardWidgetHandler: new DashboardWidgetHandler()
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
                    name: "Gebiete",
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
            glyphicon: "glyphicon glyphicon-random"
        }),
        calculateRatio: new CalculateRatio({
            parentId: "tools",
            type: "tool",
            id: "calculateRatio",
            name: "Versorgungsanalyse",
            glyphicon: "glyphicon-tasks",
            modifierInfoText: "<h3>Gewichtung:</h3><p>Hiermit können Sie eine beliebige Gewichtung für die Berechnung der Angebots/Zielgruppen-Verhältnisse festlegen um die Deckung der Nachfrage zu überprüfen.<br />z.B.: 'Wieviele Qudaratmeter pädagogische Fläche benötigt ein Kitakind?'<br /></p><p><strong>Der eingegebene Wert entspricht keinem offiziellen, rechtlich bindenden Schlüssel, sonder dient rein der explorativen Analyse.</strong></p>"
        }),
        reachabilitySelect: new ReachabilitySelect({
            id: "reachabilitySelect",
            parentId: "tools",
            type: "tool",
            name: "Erreichbarkeitsanalyse",
            glyphicon: "glyphicon-road"
        }),
        reachabilityFromPoint: new ReachabilityFromPoint({
            id: "reachability",
            parentId: "tools",
            type: "tool",
            isVisibleInMenu: false,
            name: "Erreichbarkeit ab einem Referenzpunkt",
            glyphicon: "glyphicon-road"
        }),
        reachabilityInArea: new ReachabilityInArea({
            id: "reachabilityInArea",
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
        })
    } : {};

export {tools, general};
