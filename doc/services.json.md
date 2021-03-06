>Zurück zur **[Dokumentation Masterportal](doc.md)**.

[TOC]

# services.json #
Die den Portalen zur Verfügung stehenden Dienste (WMS und WFS SensorThings-API) bzw. deren Layer werden in einer JSON-Datei konfiguriert und gepflegt. Die Datei wird in der Datei *config.js*  der einzelnen Portale unter dem Parameter *layerConf* über ihren Pfad referenziert. Als Beispiel für eine solche Datei ist in *examples.zip* im Verzeichnis */examples/lgv-config*  *services-internet-webatlas.json* vorhanden. Hier werden alle Informationen der Layer hinterlegt, die das Portal für die Nutzung der Dienste benötigt. Die Konfiguration unterscheidet sich leicht zwischen WMS, WFS und SensorThings-API (Sensor). Hier geht es zu einem **[Beispiel](https://bitbucket.org/geowerkstatt-hamburg/masterportal-config-public/raw/master/services-internet.json)**.
Es können auch lokale GeoJSON-Dateien in das Portal geladen werden (Siehe Beispiel GeoJSON).

## WMS-Layer ##

|Name|Verpflichtend|Typ|default|Beschreibung|Beispiel|
|----|-------------|---|-------|------------|--------|
|cache|nein|Boolean||Ist dieser Layer Teil eines gecachten Dienstes? Wenn true wird bei Portalen, die in der **[config.json](config.json.md)** den „Baumtyp“ = „default“ benutzen, dieser Layer den Layern vorgezogen, die mit demselben Metadatensatz verknüpft sind, aber „cache“ = false haben. Bei anderen Baumtypen hat dieser Parameter keine Auswirkungen.|`false`|
|**[datasets](#markdown-header-wms_wfs_datasets)**|nein|Object||Verknüpfung zu den Metadaten. Hier werden die Metadatensätze der Datensätze angegeben, die in diesem Layer dargestellt werden. Sie werden nach Click auf den „i“-Button des Layers in den Layerinformationen über die CSW-Schnittstelle angesprochen und dargestellt. Dazu muss in der **[rest-services.json](rest-services.json.md)** die URL des Metadatenkatalogs bzw. seiner CSW-Schnittstelle angegeben sein. Die Angaben unter *kategorie_opendata*, *kategorie_inspire* und *kategorie_organisation* werden verwandt, um die Layer in die entprechenden Kategorien einzuordnen, wenn in der **[config.json](config.json.md)** der Baumtyp *default* gesetzt ist.||
|featureCount|ja|String||Anzahl der zurückzugebenden Features bei GFI-Abfragen. Entspricht dem *GetFeatureInfo-Parameter "FEATURE_COUNT"*|`"1"`|
|format|ja|String||Grafikformat der Kachel, die vom Portal über den *GetMap* aufgerufen wird. Muss einem der Werte aus den Capabilities unter *Capability/Request/GetMap/Format* entsprechen.|`"image/jpeg"`|
|**[gfiAttributes](#markdown-header-gfi_attributes)**|ja|String/Object||GFI-Attribute die angezeigt werden sollen.|`"ignore"`|
|gfiTheme|ja|String||Darstellungsart der GFI-Informationen für diesen Layer. Wird hier nicht *default* gewählt, können eigens für diesen Layer erstellte Templates ausgewählt werden, die es erlauben die GFI-Informationen in anderer Struktur als die Standard-Tabellendarstellung anzuzeigen.|`"default"`|
|gutter|nein|String|"0"|Wert in Pixel, mit dem bei gekachelten Anfragen die Kacheln überlagert werden. Dient zur Vermeidung von abgeschnittenen Symbolen an Kachelgrenzen.|`"0"`|
|id|ja|String||Frei wählbare Layer-ID|`"8"`|
|layerAttribution|nein|String|"nicht vorhanden"|Zusätzliche Information zu diesem Layer, die im Portal angezeigt wird, sofern etwas anderes als *"nicht vorhanden"* angegeben und in dem jeweiligen Portal das *Control LayerAttribution* aktiviert ist.|`"nicht vorhanden"`|
|layers|ja|String||Layername im Dienst. Dieser muss dem Wert aus den Dienste-Capabilities unter *Layer/Layer/Name* entsprechen.|`"1"`|
|legendURL|ja|String||Link zur Legende, um statische Legenden des Layers zu verknüpfen. **ignore**: Es wird keine Legende abgefragt, ““ (Leerstring): GetLegendGraphic des Dienstes wird aufgerufen.|`"ignore"`|
|maxScale|ja|String||Bis zu diesem Maßstab wird der Layer im Portal angezeigt|`"1000000"`|
|minScale|nein|String||Ab diesem Maßstab wird der Layer im Portal angezeigt|`"0"`|
|name|ja|String||Anzeigename des Layers im Portal. Dieser wird im Portal im Layerbaum auftauchen und ist unabhängig vom Dienst frei wählbar.|`"Luftbilder DOP 10"`|
|singleTile|nein|Boolean||Soll die Grafik als eine große Kachel ausgeliefert werden? Wenn true wird immer der gesamte Kartenausschnitt angefragt, wenn false wird der Kartenausschnitt in kleineren Kacheln angefragt und zusammengesetzt.|`false`|
|tilesize|ja|String||Kachelgröße in Pixel. Diese wird verwandt wenn singleTile=false gesetzt ist.|`"512"`|
|transparent|ja|Boolean||Hintergrund der Kachel transparent oder nicht (false/true). Entspricht dem GetMap-Parameter *TRANSPARENT*|`true`|
|typ|ja|String||Diensttyp, in diesem Fall WMS (**[WFS siehe unten](#markdown-header-wfs-layer)** und **[SensorThings-API siehe unten](#markdown-header-sensor-layer)**)|`"WMS"`|
|url|ja|String||Dienste URL|`"https://geodienste.hamburg.de/HH_WMS_DOP10"`|
|version|ja|String||Dienste Version, die über GetMap angesprochen wird.|`"1.3.0"`|
**Beispiel WMS:**


```
#!json

{
      "id" : "8",
      "name" : "Luftbilder DOP 10",
      "url" : "https://geodienste.hamburg.de/HH_WMS_DOP10",
      "typ" : "WMS",
      "layers" : "1",
      "format" : "image/jpeg",
      "version" : "1.3.0",
      "singleTile" : false,
      "transparent" : true,
      "tilesize" : "512",
      "gutter" : "0",
      "minScale" : "0",
      "maxScale" : "1000000",
      "gfiAttributes" : "ignore",
      "gfiTheme" : "default",
      "layerAttribution" : "nicht vorhanden",
      "legendURL" : "ignore",
      "cache" : false,
      "featureCount" : "1",
      "datasets" : [
         {
            "md_id" : "25DB0242-D6A3-48E2-BAE4-359FB28491BA",
            "rs_id" : "HMDK/25DB0242-D6A3-48E2-BAE4-359FB28491BA",
            "md_name" : "Digitale Orthophotos 10cm - FHHNET",
            "bbox" : "461468.97,5916367.23,587010.91,5980347.76",
            "kategorie_opendata" : [
               "Sonstiges"
            ],
            "kategorie_inspire" : [
               "nicht INSPIRE-identifiziert"
            ],
            "kategorie_organisation" : "Landesbetrieb Geoinformation und Vermessung"
         }
      ]
   }
```


## WFS-Layer ##

|Name|Verpflichtend|Typ|default|Beschreibung|Beispiel|
|----|-------------|---|-------|------------|--------|
|**[datasets](#markdown-header-wms_wfs_datasets)**|ja|Object||Hier werden die Metadatensätze der dargestellten Datensätze referenziert. Diese Werden in der Layerinfo (i-Knopf) im Portal zur Laufzeit aus dem Metadatenkatalog bzw. seiner CS-W – Schnittstelle abgerufen und dargestellt. Die Angaben unter „Kategorie_...“ werden im default-tree zur Auswahl der Kategorien bzw. zur Strukturierung des Layerbaums verwandt.||
|featureNS|ja|String||featureNamespace. Ist gewöhnlich im Header der WFS-Capabilities referenziert und löst den Namespace auf, der unter FeatureType/Name angegeben wird.|`"http://www.deegree.org/app"`|
|featureType|ja|String||featureType-Name im Dienst. Dieser muss dem Wert aus den Dienste-Capabilities unter *FeatureTypeList/FeatureType/Name* entsprechen. Allerdings ohne Namespace.|`"bab_vkl"`|
|**[gfiAttributes](#markdown-header-gfi_attributes)**|ja|String/Object||GFI-Attribute die angezeigt werden sollen.|`"ignore"`|
|gfiFormat|nein|String/Object||Optionale Steuerung des Inhaltes der GFI-Informationen für diesen Layer. Der Inhalt kann im Rahmen eines Projektes frei gewählt werden. Die Steuerung der Inhalte über diesen Parameter ist z.B. bei der Verwendung eines gfi-Themes für mehrere Layer von zentraler Bedeutung.|`{"exampleProjectSwitch" : {"domain": "statistical", "property": "school", "unit": "percent"}}`|
|id|ja|String||Frei wählbare Layer-ID|`"44"`|
|layerAttribution|nein|String|"nicht vorhanden"|Zusätzliche Information zu diesem Layer, die im Portal angezeigt wird, sofern etwas anderes als *"nicht vorhanden"* angegeben und in dem jeweiligen Portal das *Control LayerAttribution* aktiviert ist.|`"nicht vorhanden"`|
|legendURL|nein|String||Link zur Legende, um statische Legenden des Layers zu verknüpfen. **ignore**: Es wird keine Legende abgefragt, ““ (Leerstring): GetLegendGraphic des Dienstes wird aufgerufen.|`""`|
|name|ja|String||Anzeigename des Layers im Portal. Dieser wird im Portal im Layerbaum auftauchen und ist unabhängig vom Dienst frei wählbar.|`"Verkehrslage auf Autobahnen"`|
|typ|ja|String||Diensttyp, in diesem Fall WFS (**[WMS siehe oben](#markdown-header-wms-layer)** und **[SensorThings-API siehe unten](#markdown-header-sensor-layer)**)|`"WFS"`|
|url|ja|String||Dienste URL|`"https://geodienste.hamburg.de/HH_WFS_Verkehr_opendata"`|
|version|nein|String||Dienste Version, die über GetFeature angesprochen wird.|`"1.1.0"`|
|altitudeMode|nein|enum["clampToGround","absolute","relativeToGround"]|"clampToGround"|Höhenmodus für die Darstellung in 3D.|`"absolute"`|
|altitude|nein|Number||Höhe für die Darstellung in 3D in Metern. Wird eine altitude angegeben, so wird die vorhandene Z-Koordinate überschrieben. Falls keine Z-Koordinate vorhanden ist, wird die altitude als Z-Koordinate gesetzt.|`527`|
|altitudeOffset|nein|Number||Höhenoffset für die Darstellung in 3D in Metern. Wird ein altitudeOffset angegeben, so wird die vorhandene Z-Koordinate um den angegebenen Wert erweitert. Falls keine Z-Koordinate vorhanden ist, wird der altitudeOffset als Z-Koordinate gesetzt.|`10`|

**Beispiel WFS:**


```
#!json

{
      "id" : "44",
      "name" : "Verkehrslage auf Autobahnen",
      "url" : "https://geodienste.hamburg.de/HH_WFS_Verkehr_opendata",
      "typ" : "WFS",
      "featureType" : "bab_vkl",
      "format" : "image/png",
      "version" : "1.1.0",
      "featureNS" : "http://www.deegree.org/app",
      "gfiAttributes" : "showAll",
      "gfiFormat": {"exampleProjectSwitch" : {"domain": "statistical", "property": "school", "unit": "percent"}}                                             },
      "layerAttribution" : "nicht vorhanden",
      "legendURL" : "",
      "datasets" : [
         {
            "md_id" : "2FC4BBED-350C-4380-B138-4222C28F56C6",
            "rs_id" : "HMDK/6f62c5f7-7ea3-4e31-99ba-97407b1af9ba",
            "md_name" : "Verkehrslage auf Autobahnen (Schleifen) Hamburg",
            "bbox" : "461468.97,5916367.23,587010.91,5980347.76",
            "kategorie_opendata" : [
               "Transport und Verkehr"
            ],
            "kategorie_inspire" : [
               "nicht INSPIRE-identifiziert"
            ],
            "kategorie_organisation" : "Behörde für Wirtschaft, Verkehr und Innovation"
         }
      ]
   }
```


## Sensor-Layer ##

Ein Feature kann mehrere Datastreams vorhalten. Im Portal wird für jeden Datasteam die neueste Beobachtung als Attribut am Feature wie folgt eingetragen: "dataStream_[id]_[name]". id ist die @iot.id des Datastreams.
Der Name wird aus datastream.properties.type ausgelesen. Ist dieser parameter nicht verfügbar wird der Wert aus datastream.unitOfMeasurement.name verwendet.

|Name|Verpflichtend|Typ|default|Beschreibung|Beispiel|
|----|-------------|---|-------|------------|--------|
|epsg|nein|String|"EPSG:4326"|Koordinatensystem der SensorThings-API|`"EPSG:4326"`|
|**[gfiAttributes](#markdown-header-gfi_attributes)**|ja|String/Object||GFI-Attribute die angezeigt werden sollen.|`"ignore"`|
|**[gfiTheme](#markdown-header-gfi_theme)**|ja|String/Object||Darstellungsart der GFI-Informationen für diesen Layer. Wird hier nicht default gewählt, können eigens für diesen Layer erstellte Templates ausgewählt werden, die es erlauben die GFI-Informationen in anderer Struktur als die Standard-Tabellendarstellung anzuzeigen.|`"default"`|
|id|ja|String||Frei wählbare Layer-ID|`"999999"`|
|legendURL|ja|String||Link zur Legende, um statische Legenden des Layers zu verknüpfen. **ignore**: Es wird keine Legende abgefragt, ““ (Leerstring): GetLegendGraphic des Dienstes wird aufgerufen.|`""`|
|name|ja|String||Anzeigename des Layers im Portal. Dieser wird im Portal im Layerbaum auftauchen und ist unabhängig vom Dienst frei wählbar.|`"Elektro Ladestandorte"`|
|typ|ja|String||Diensttyp, in diesem Fall SensorThings-API (**[WMS siehe oben](#markdown-header-wms-layer)** und **[WFS siehe oben](#markdown-header-wfs-layer)**)|`"SensorThings"`|
|url|ja|String||Dienste URL die um "urlParameter" ergänzt werden kann |`"https://51.5.242.162/itsLGVhackathon"`|
|**[urlParameter](#markdown-header-url_parameter)**|nein|Object||Angabe von Query Options. Diese schränken die Abfrage der Sensordaten ein (z.B. durch "filter" oder "expand"). ||
|useProxyURL|nein|Boolean|false|Gibt an, ob die URL des Dienstes über einen Proxy angefragt werden soll, dabei werden die Punkte in der Domain durch Unterstriche ersetzt.|false|
|version|nein|String||Dienste Version, die beim Anfordern der Daten angesprochen wird.|`"1.0"`|
|mergeThingsByCoordinates|nein|Boolean|false|Gibt an ob Things mit gleicher Coordinate zusammenfasst werden sollen.|`true`|
|showNoDataValues|nein|Boolean|true|Gibt an ob Datastreams ohne Observations angegeben werden sollen.|`true`|
|noDataValue|nein|String|"no data"|Platzhalter für nciht vorhandenen Observations der Datastreams.|`"Keine Daten"`|
|altitudeMode|nein|enum["clampToGround","absolute","relativeToGround"]|"clampToGround"|Höhenmodus für die Darstellung in 3D.|`"absolute"`|
|altitude|nein|Number||Höhe für die Darstellung in 3D in Metern. Wird eine altitude angegeben, so wird die vorhandene Z-Koordinate überschrieben. Falls keine Z-Koordinate vorhanden ist, wird die altitude als Z-Koordinate gesetzt.|`527`|
|altitudeOffset|nein|Number||Höhenoffset für die Darstellung in 3D in Metern. Wird ein altitudeOffset angegeben, so wird die vorhandene Z-Koordinate um den angegebenen Wert erweitert. Falls keine Z-Koordinate vorhanden ist, wird der altitudeOffset als Z-Koordinate gesetzt.|`10`|

**Beispiel Sensor:**


```
#!json

   {
      "id" : "999999",
      "name" : "Live - Elektro Ladestandorte",
      "typ" : "SensorThings",
      "version" : "1.0",
      "url" : "https://51.5.242.162/itsLGVhackathon",
      "urlParameter" : {
         "filter" : "startswith(Things/name,'Charging')",
         "expand" : "Locations,Datastreams/Observations($orderby=phenomenonTime%20desc;$top=1)"
      },
      "epsg": "EPSG:4326",
      "gfiTheme" : "default",
      "gfiAttributes" : {
         "phenomenonTime" : "Letze Zustandsänderung",
         "state" : "Zustand",
         "plug" : "Stecker",
         "type" : "Typ",
         "dataStreamId" : "DataStreamID"
      },
      "mergeThingsByCoordinates": true
   }
```


## url_Parameter ##

Über die UrlParameter können die daten aus der SensorThingsAPI gefiltert werden.

|Name|Verpflichtend|Typ|default|Beschreibung|Beispiel|
|----|-------------|---|-------|------------|--------|
|filter|nein|String||Koordinatensystem der SensorThings-API|`"startswith(Things/name,'Charging')"`|
|expand|nein|String/Array||Koordinatensystem der SensorThings-API|`"Locations,Datastreams/Observations($orderby=phenomenonTime%20desc;$top=1)"`|

**Beispiel urlParameter: Zeige alle Things deren Name mit 'Charging' beginnt und alle zugehörigen Datastreams. Zeige auch von jedem Datastream die neueste Observation**
```
#!json

   {
      "urlParameter" : {
         "filter" : "startswith(Things/name,'Charging')",
         "expand" : "Locations,Datastreams/Observations($orderby=phenomenonTime%20desc;$top=1)"
      }
   }
```
**Beispiel urlParameter: Zeige alle Things deren Name mit 'Charging' beginnt und alle zugehörigen Datastreams die im Namen 'Lastenrad' enthalten. Zeige auch von jedem Datastream die neueste Observation und das Phänomen (ObservedProperty), das beobachtet wird. Wenn vorhanden wird die ObservedProperty für die dynamische Attributerstellung verwendet.**
```
#!json

   {
      "urlParameter": {
			"filter": "startswith(Things/name,'Charging')",
			"expand": [
				"Locations",
				"Datastreams($filter=indexof(Datastream/name,'Lastenrad') ge 1)",
				"Datastreams/Observations($orderby=phenomenonTime%20desc;$top=1)",
            "Datastreams/ObservedProperty"
			]
		}
   }
```
## WMS_WFS_datasets ##

Hier werden die Metadatensätze der dargestellten Datensätze referenziert. Diese werden in der Layerinfo (i-Knopf) im Portal zur Laufzeit aus dem Metadatenkatalog bzw. seiner CS-W – Schnittstelle abgerufen und dargestellt. Die Angaben unter *kategorie..* werden im default-tree zur Auswahl der Kategorien bzw. zur Strukturierung des Layerbaums verwandt.

|Name|Verpflichtend|Typ|default|Beschreibung|
|----|-------------|---|-------|------------|
|md_id|nein|String||Metadatensatz-Identifier des Metadatensatzes|
|rs_id|nein|String||Ressource-Identifier des Metadatensatzes|
|md_name|nein|String||Name des Datensatzes|
|bbox|nein|String||Ausdehnung des Datensatzes|
|kategorie_opendata|nein|String||Opendata-Kategorie aus der Codeliste von govdata.de|
|kategorie_inspire|nein|String||Inspire-Kategorie aus der Inspire-Codeliste wenn vorhanden, wenn nicht vorhanden *„nicht Inspire-identifiziert“*|
|kategorie_organisation|nein|String||Organisationsname der datenhaltenden Stelle|

## gfi_theme ##

Das Attribut "gfiTheme" kann entweder als String angegeben werden oder als Objekt.
Wird es als String angegeben, so wird das entsprechende Template verwendet.

Wird es als Objekt verwendet, so gelten folgende Parameter.

|Name|Verpflichtend|Typ|default|Beschreibung|
|----|-------------|---|-------|------------|
|name|ja|String||Name des gfi Templates.|
|**[params](#markdown-header-gfi_theme_params)**|nein|Object||Template spezifische Attribute.|

Beispiel gfiTheme für das template "sensor"
```
#!json
"gfiTheme": {
   "name": "sensor",
   "params": {
         "grafana": true
   }
}
```
## gfi_theme_params ##
Hier werden die Parameter für die GFI-Templates definiert.

|Name|params|
|----|------|
|sensor|**[params](#markdown-header-gfi_theme_sensor_params)**|

## gfi_theme_sensor_params ##
Hier werden die Parameter für das GFI-Template "sensor" definiert.

|Name|Verpflichtend|Typ|default|Beschreibung|
|----|-------------|---|-------|------------|
|grafana|nein|Boolean||Gibt an ob im Template ein weiterer Tab erzeugt wird um die Grafana-urls als Iframe anzubinden. Die Grafana-urls müssen als Attribute am gfiFeature hinterlegt sein und mit "grafana_url" beginnen. **[Grafana](https://grafana.com/)** wird verwendet um Diagramm-Darstellungen nicht aufwendig im Portal generieren zu müssen. Dadurch können portalseitig Ressourcen gespart werden.|

## gfi_attributes ##
Hier erlauben Key-Value-Paare die portalseitige Übersetzung manchmal diensteseitig kryptischer Attributnamen in lesbare. Weitere Optionen sind:
**ignore**: keine GFI-Abfrage möglich,
**showAll**: alle GFI-Attribute werden abgefragt und wie vom Dienst geliefert angezeigt.
Bestimmte Standard-Attribute ohne Informationswert für den Benutzer werden immer aus der Anzeige im Portal ausgeschlossen, siehe(**[config.js](config.js.md)**)

Beispiel gfiAttributes als String
```
#!json
{
   "gfiAttributes": "showAll"
}
```

Beispiel gfiAttributes als String
```
#!json
{
   "gfiAttributes": "ignore"
}
```

Beispiel gfiAttributes als Objekt
```
#!json
{
   "gfiAttributes": {
      "key1": "Key der im Portal gezeigt wird 1",
      "key2": "Key der im Portal gezeigt wird 2",
      "key3": "Key der im Portal gezeigt wird 3"
   }
}
```
Wird gfiAttributes als Objekt übergeben, kann der Value auch ein Objekt sein. Dann wird ein Key erst verwendet, wenn eine Bedingung erfüllt ist

|Name|Verpflichtend|Typ|default|Beschreibung|Beispiel|
|----|-------------|---|-------|------------|--------|
|name|true|String||Name bei exakt einem Match angezeigt werden soll. |'"Test"'|
|condition|true|enum["contains", "startsWith", "endsWith"]|| Bedingung nach welcher der key gegen alle Attribute des Features geprüft wird.| '"startsWith"'|

Beispiel gfiAttributes als Objekt
```
#!json
{
   "gfiAttributes": {
      "key1": "Key der im Portal gezeigt wird 1",
      "key2": "Key der im Portal gezeigt wird 2",
      "key3": {
         "name": "Key der im Portal gezeigt wird 3",
         "condition": "contains"
      }
   }
}
```

## GeoJSON-Layer ##

|Name|Verpflichtend|Typ|default|Beschreibung|Beispiel|
|----|-------------|---|-------|------------|--------|
|**[gfiAttributes](#markdown-header-gfi_attributes)**|ja|String/Object||GFI-Attribute die angezeigt werden sollen.|`"ignore"`|
|id|ja|String||Frei wählbare Layer-ID|`"11111"`|
|layerAttribution|nein|String|"nicht vorhanden"|Zusätzliche Information zu diesem Layer, die im Portal angezeigt wird, sofern etwas anderes als *"nicht vorhanden"* angegeben und in dem jeweiligen Portal das *Control LayerAttribution* aktiviert ist.|`"nicht vorhanden"`|
|legendURL|nein|String||Link zur Legende, um statische Legenden des Layers zu verknüpfen. **ignore**: Es wird keine Legende abgefragt, ““ (Leerstring): GetLegendGraphic des Dienstes wird aufgerufen.|`""`|
|name|ja|String||Anzeigename des Layers im Portal. Dieser wird im Portal im Layerbaum auftauchen und ist unabhängig vom Dienst frei wählbar.|`"lokale GeoJSON"`|
|typ|ja|String||Diensttyp, in diesem Fall GeoJSON |`"GeoJSON"`|
|subTyp|nein|enum["OpenSenseMap]||SubTyp um spezielle Daten nachzuladen. |`"OpenSenseMap"`|
|url|ja|String||Pfad/URL zur GeoJSON. Der Pfad ist relativ zur index.html|`"/myJsons/test.json"`|
|altitudeMode|nein|enum["clampToGround","absolute","relativeToGround"]|"clampToGround"|Höhenmodus für die Darstellung in 3D.|`"absolute"`|
|altitude|nein|Number||Höhe für die Darstellung in 3D in Metern. Wird eine altitude angegeben, so wird die vorhandene Z-Koordinate überschrieben. Falls keine Z-Koordinate vorhanden ist, wird die altitude als Z-Koordinate gesetzt.|`527`|
|altitudeOffset|nein|Number||Höhenoffset für die Darstellung in 3D in Metern. Wird ein altitudeOffset angegeben, so wird die vorhandene Z-Koordinate um den angegebenen Wert erweitert. Falls keine Z-Koordinate vorhanden ist, wird der altitudeOffset als Z-Koordinate gesetzt.|`10`|

**Beispiel GeoJSON:**


```
#!json

    {
      "id" : "11111",
      "name" : "lokale GeoJSON",
      "url" : "myJsons/test.json",
      "typ" : "GeoJSON",
      "gfiAttributes" : "showAll",
      "layerAttribution" : "nicht vorhanden",
      "legendURL" : "",
   }
```

## Heatmap-Layer ##

|Name|Verpflichtend|Typ|default|Beschreibung|Beispiel|
|----|-------------|---|-------|------------|--------|
|id|ja|String||Frei wählbare Layer-ID|`"11111"`|
|layerAttribution|nein|String|"nicht vorhanden"|Zusätzliche Information zu diesem Layer, die im Portal angezeigt wird, sofern etwas anderes als *"nicht vorhanden"* angegeben und in dem jeweiligen Portal das *Control LayerAttribution* aktiviert ist.|`"nicht vorhanden"`|
|name|ja|String||Anzeigename des Layers im Portal. Dieser wird im Portal im Layerbaum auftauchen und ist unabhängig vom Dienst frei wählbar.|`"Mein Heatmap Layer"`|
|typ|ja|String||Diensttyp, in diesem Fall Heatmap |`"Heatmap"`|
|attribute|nein|String|""|Attributname. Nur Features, die dem "attribute" und "value" entsprechen, werden verwendet. |`"attr1"`|
|value|nein|String|""|Attributwert. Nur Features, die dem "attribute" und "value" entsprechen, werden verwendet.|`"val1"`|
|radius|nein|Number|10|Radius der Heatmap features.|`10`|
|blur|nein|Number|15|Blur der Heatmap Features |`15`|
|gradient|nein|String[]|["#00f", "#0ff", "#0f0", "#ff0", "#f00"]|Farbgradient der Heatmap |`["#f00", "#0f0", "#00f"]`|
|dataLayerId|ja|String||Id des Layers der die Features für die Heatmap liefert |`"4321"`|

**Beispiel HeatmapLayer:**


```
#!json

    {
		"id": "1234",
		"name": "Heatmap des Vektorlayers mit der layerid 4321",
		"typ": "Heatmap",
		"attribute": "state",
		"value": "charging",
		"radius": 20,
		"blur": 30,
		"gradient": [
			"#ffffb2",
			"#fd8d3c",
			"#fd8d3c",
			"#f03b20",
			"#bd0026"
		],
        "gfiAttributes": "ignore",
        "dataLayerId": "4321"
	}
```

## 3D Object Layer TileSet ##

|Name|Verpflichtend|Typ|default|Beschreibung|Beispiel|
|----|-------------|---|-------|------------|--------|
|**[datasets](#markdown-header-wms_wfs_datasets)**|ja|Object||Hier werden die Metadatensätze der dargestellten Datensätze referenziert. Diese Werden in der Layerinfo (i-Knopf) im Portal zur Laufzeit aus dem Metadatenkatalog bzw. seiner CS-W – Schnittstelle abgerufen und dargestellt. Die Angaben unter „Kategorie_...“ werden im default-tree zur Auswahl der Kategorien bzw. zur Strukturierung des Layerbaums verwandt.||
|**[gfiAttributes](#markdown-header-gfi_attributes)**|ja|String/Object||GFI-Attribute die angezeigt werden sollen.|`"ignore"`|
|id|ja|String||Frei wählbare Layer-ID|`"44"`|
|layerAttribution|nein|String|"nicht vorhanden"|Zusätzliche Information zu diesem Layer, die im Portal angezeigt wird, sofern etwas anderes als *"nicht vorhanden"* angegeben und in dem jeweiligen Portal das *Control LayerAttribution* aktiviert ist.|`"nicht vorhanden"`|
|legendURL|nein|String||Link zur Legende, um statische Legenden des Layers zu verknüpfen. **ignore**: Es wird keine Legende abgefragt, ““ (Leerstring): GetLegendGraphic des Dienstes wird aufgerufen.|`""`|
|name|ja|String||Anzeigename des Layers im Portal. Dieser wird im Portal im Layerbaum auftauchen und ist unabhängig vom Dienst frei wählbar.|`"Verkehrslage auf Autobahnen"`|
|hiddenFeatures|nein|Array||Liste mit IDs, die in der Ebene versteckt werden sollen|`["id_1", "id_2"]`|
|typ|ja|String||Diensttyp, in diesem Fall TileSet3D |`"TileSet3D"`|
|url|ja|String||Dienste URL|`"https://geodienste.hamburg.de/buildings_lod2"`|
|**[cesium3DTilesetOptions]**|nein|Object|Cesium 3D Tileset Options, werden direkt an das Cesium Tileset Objekt durchgereicht. maximumScreenSpaceError ist z.B. für die Sichtweite relevant.

[cesium3DTilesetOptions]: https://cesiumjs.org/Cesium/Build/Documentation/Cesium3DTileset.html

**Beispiel Tileset:**


```
#!json

{
      "id" : "buildings",
      "name" : "Gebäude",
      "url" : "https://geodienste.hamburg.de/b3dm_hamburg_lod2",
      "typ" : "Tileset3D",
      "gfiAttributes" : "showAll",
      "layerAttribution" : "nicht vorhanden",
      "legendURL" : "ignore",
      "hiddenFeatures": ["id1", "id2"],
      "cesium3DTilesetOptions" : {
        maximumScreenSpaceError : 6
      },
      "datasets" : [
         {
            "md_id" : "2FC4BBED-350C-4380-B138-4222C28F56C6",
            "rs_id" : "HMDK/6f62c5f7-7ea3-4e31-99ba-97407b1af9ba",
            "md_name" : "LOD 2 Gebäude",
            "bbox" : "461468.97,5916367.23,587010.91,5980347.76",
            "kategorie_opendata" : [
               "LOD 2 Gebäude"
            ],
            "kategorie_inspire" : [
               "LOD 2 Gebäude"
            ],
            "kategorie_organisation" : "Behörde für Wirtschaft, Verkehr und Innovation"
         }
      ]
   }
```

## Terrain3D Quantized Mesh Dataset ##

|Name|Verpflichtend|Typ|default|Beschreibung|Beispiel|
|----|-------------|---|-------|------------|--------|
|**[datasets](#markdown-header-wms_wfs_datasets)**|ja|Object||Hier werden die Metadatensätze der dargestellten Datensätze referenziert. Diese Werden in der Layerinfo (i-Knopf) im Portal zur Laufzeit aus dem Metadatenkatalog bzw. seiner CS-W – Schnittstelle abgerufen und dargestellt. Die Angaben unter „Kategorie_...“ werden im default-tree zur Auswahl der Kategorien bzw. zur Strukturierung des Layerbaums verwandt.||
|id|ja|String||Frei wählbare Layer-ID|`"44"`|
|layerAttribution|nein|String|"nicht vorhanden"|Zusätzliche Information zu diesem Layer, die im Portal angezeigt wird, sofern etwas anderes als *"nicht vorhanden"* angegeben und in dem jeweiligen Portal das *Control LayerAttribution* aktiviert ist.|`"nicht vorhanden"`|
|legendURL|nein|String||Link zur Legende, um statische Legenden des Layers zu verknüpfen. **ignore**: Es wird keine Legende abgefragt, ““ (Leerstring): GetLegendGraphic des Dienstes wird aufgerufen.|`""`|
|name|ja|String||Anzeigename des Layers im Portal. Dieser wird im Portal im Layerbaum auftauchen und ist unabhängig vom Dienst frei wählbar.|`"Verkehrslage auf Autobahnen"`|
|typ|ja|String||Diensttyp, in diesem Fall Terrain3D |`"Terrain3D"`|
|url|ja|String||Dienste URL|`"https://geodienste.hamburg.de/terrain"`|
|**[cesiumTerrainProviderOptions]**|nein|Object|Cesium TerrainProvider Options, werden direkt an den Cesium TerrainProvider durchgereicht. requestVertexNormals ist z.B. für das Shading auf der Oberfläche relevant.

[cesiumTerrainProviderOptions]: https://cesiumjs.org/Cesium/Build/Documentation/CesiumTerrainProvider.html


**Beispiel Terrain:**

```
#!json
   {
      "id" : "buildings",
      "name" : "Terrain",
      "url" : "https://geodienste.hamburg.de/terrain",
      "typ" : "Terrain3D",
      "gfiAttributes" : "showAll",
      "layerAttribution" : "nicht vorhanden",
      "legendURL" : "ignore",
      "cesiumTerrainProviderOptions": {
        "requestVertexNormals" : true
      },
      "datasets" : [
         {
            "md_id" : "2FC4BBED-350C-4380-B138-4222C28F56C6",
            "rs_id" : "HMDK/6f62c5f7-7ea3-4e31-99ba-97407b1af9ba",
            "md_name" : "Terrain",
            "bbox" : "461468.97,5916367.23,587010.91,5980347.76",
            "kategorie_opendata" : [
               "Terrain"
            ],
            "kategorie_inspire" : [
               "Terrain"
            ],
            "kategorie_organisation" : "Behörde für Wirtschaft, Verkehr und Innovation"
         }
      ]
   }
```
## Oblique Layer ##

|Name|Verpflichtend|Typ|default|Beschreibung|Beispiel|
|----|-------------|---|-------|------------|--------|
|**[datasets](#markdown-header-wms_wfs_datasets)**|ja|Object||Hier werden die Metadatensätze der dargestellten Datensätze referenziert. Diese Werden in der Layerinfo (i-Knopf) im Portal zur Laufzeit aus dem Metadatenkatalog bzw. seiner CS-W – Schnittstelle abgerufen und dargestellt. Die Angaben unter „Kategorie_...“ werden im default-tree zur Auswahl der Kategorien bzw. zur Strukturierung des Layerbaums verwandt.||
|id|ja|String||Frei wählbare Layer-ID|`"44"`|
|layerAttribution|nein|String|"nicht vorhanden"|Zusätzliche Information zu diesem Layer, die im Portal angezeigt wird, sofern etwas anderes als *"nicht vorhanden"* angegeben und in dem jeweiligen Portal das *Control LayerAttribution* aktiviert ist.|`"nicht vorhanden"`|
|legendURL|nein|String||Link zur Legende, um statische Legenden des Layers zu verknüpfen. **ignore**: Es wird keine Legende abgefragt, ““ (Leerstring): GetLegendGraphic des Dienstes wird aufgerufen.|`""`|
|name|ja|String||Anzeigename des Layers im Portal. Dieser wird im Portal im Layerbaum auftauchen und ist unabhängig vom Dienst frei wählbar.|`"Verkehrslage auf Autobahnen"`|
|typ|ja|String||Diensttyp, in diesem Fall Oblique |`"Oblique"`|
|hideLevels|nein|Number||Anzahl der Level der Bildpyramide, die nicht angezeigt werden sollen. |`0`|
|minZoom|nein|Number||Minimale Zoomstufe 0 zeigt das komplette Schrägluftbild in der Mitte des Bildschirms. |`0`|
|terrainUrl|nein|String||URL zu Cesium Quantized Mesh Terrain dataset |`"https://geodienste.hamburg.de/terrain"`|
|resolution|nein|Number||Auflösung der Schrägluftbilder in cm z.B. 10 . |`10`|
|projection|ja|String||Projektion der Schrägluftbild ebene. |`EPSG:25832`|
|url|ja|String||Dienste URL|`"https://geodienste.hamburg.de/oblique"`|


**Beispiel Oblique Ebene:**

```
#!json
   {
      "id" : "oblique",
      "name" : "Oblique",
      "url" : "https://geodienste.hamburg.de/oblique",
      "typ" : "Oblique",
      "gfiAttributes" : "showAll",
      "layerAttribution" : "nicht vorhanden",
      "legendURL" : "ignore",
      "datasets" : [
         {
            "md_id" : "2FC4BBED-350C-4380-B138-4222C28F56C6",
            "rs_id" : "HMDK/6f62c5f7-7ea3-4e31-99ba-97407b1af9ba",
            "md_name" : "Oblique",
            "bbox" : "461468.97,5916367.23,587010.91,5980347.76",
            "kategorie_opendata" : [
               "Oblique"
            ],
            "kategorie_inspire" : [
               "Oblique"
            ],
            "kategorie_organisation" : "Behörde für Wirtschaft, Verkehr und Innovation"
         }
      ]
   }
```

## Entities Layer 3D ##

Entities Layer um 3D Modelle im Gltf oder Glb Format darzustellen.

|Name|Verpflichtend|Typ|default|Beschreibung|Beispiel|
|----|-------------|---|-------|------------|--------|
|**[datasets](#markdown-header-wms_wfs_datasets)**|ja|Object||Hier werden die Metadatensätze der dargestellten Datensätze referenziert. Diese Werden in der Layerinfo (i-Knopf) im Portal zur Laufzeit aus dem Metadatenkatalog bzw. seiner CS-W – Schnittstelle abgerufen und dargestellt. Die Angaben unter „Kategorie_...“ werden im default-tree zur Auswahl der Kategorien bzw. zur Strukturierung des Layerbaums verwandt.||
|id|ja|String||Frei wählbare Layer-ID|`"44"`|
|layerAttribution|nein|String|"nicht vorhanden"|Zusätzliche Information zu diesem Layer, die im Portal angezeigt wird, sofern etwas anderes als *"nicht vorhanden"* angegeben und in dem jeweiligen Portal das *Control LayerAttribution* aktiviert ist.|`"nicht vorhanden"`|
|legendURL|nein|String||Link zur Legende, um statische Legenden des Layers zu verknüpfen. **ignore**: Es wird keine Legende abgefragt, ““ (Leerstring): GetLegendGraphic des Dienstes wird aufgerufen.|`""`|
|name|ja|String||Anzeigename des Layers im Portal. Dieser wird im Portal im Layerbaum auftauchen und ist unabhängig vom Dienst frei wählbar.|`"Verkehrslage auf Autobahnen"`|
|typ|ja|String||Diensttyp, in diesem Fall Entities3D |`"Entities3D"`|
|entities|ja|Array||Modelle, die angezeigt werden sollen |`[]`|

Entity Optionen

|Name|Verpflichtend|Typ|default|Beschreibung|Beispiel|
|----|-------------|---|-------|------------|--------|
|url|ja|String|`""`|Url zu dem Modell|`"https://hamburg.virtualcitymap.de/gltf/4AQfNWNDHHFQzfBm.glb"`|
|attributes|nein|Object|{}|Attribute für das Modell|`{"name": "test"}`|
|latitude|ja|Number| |Breitengrad des Modell-Origins in Grad|`53.541831`|
|longitude|ja|Number| |Längengrad des Modell-Origins in Grad|`9.917963`|
|height|nein|Number|0|Höhe des Modell-Origins|`10`|
|heading|nein|Number|0|Rotation des Modells, in Grad|`0`|
|pitch|nein|Number|0|Neigung des Modells in Grad |`0`|
|roll|nein|Number|0|Roll des Modells in Grad|`0`|
|scale|nein|Number|1|Skalierung des Modells|`1`|
|allowPicking|nein|Boolean|true|Ob das Modell angeklickt werden darf (GFI)|`true`|
|show|nein|Boolean|true|Ob das Modell angezeigt werden soll (sollte true sein)|`true`|



**Beispiel Entities3D Ebene:**

```
#!json
   {
     "id": "gltfLayer",
     "name": "GltfLayer",
     "typ": "Entities3D",
     "layerAttribution": "nicht vorhanden",
     "legendURL": "ignore",
     "entities": [
       {
         "url": "https://hamburg.virtualcitymap.de/gltf/4AQfNWNDHHFQzfBm.glb",
         "attributes": {
           "name": "Fernsehturm.kmz"
         },
         "latitude": 53.541831,
         "longitude": 9.917963,
         "height": 10,
         "heading": -1.2502079000000208,
         "pitch": 0,
         "roll": 0,
         "scale": 5,
         "allowPicking": true,
         "show": true
       }
     ],
     "datasets": [
       {
         "md_id": "A39B4E86-15E2-4BF7-BA82-66F9913D5640",
         "rs_id": "https://registry.gdi-de.org/id/de.hh/6D10BE89-636D-4359-8B27-4AB4DCA02F3A",
         "md_name": "Digitales Höhenmodell Hamburg DGM 1",
         "bbox": "461468.97,5916367.23,587010.91,5980347.76",
         "kategorie_opendata": [
           "Geographie, Geologie und Geobasisdaten"
         ],
         "kategorie_inspire": [
           "Höhe"
         ],
         "kategorie_organisation": "Landesbetrieb Geoinformation und Vermessung"
       }
     ]
   }
```
>Zurück zur **[Dokumentation Masterportal](doc.md)**.
