import "src/styles/mui-override.css";
import "azure-maps-drawing-tools";
import "src/components/Maps/Legend/LegendControl";

import React, { useState, useEffect, memo, useMemo } from "react";
import { Box, Button } from "@mui/material";
import { capitalizeFirstLetter } from "src/helpers/StringUtils";
import { LegendControl, LegendType } from "./Legend";
import atlas, {
  AuthenticationOptions,
  AuthenticationType,
  ControlOptions,
  ControlPosition,
  data,
  HtmlMarkerOptions,
  SymbolLayerOptions
} from "azure-maps-control";
import {
  AzureMap,
  AzureMapDataSourceProvider,
  AzureMapHtmlMarker,
  AzureMapLayerProvider,
  AzureMapsProvider,
  IAzureCustomControls,
  IAzureDataSourceChildren,
  IAzureMapControls, IAzureMapHtmlMarkerEvent, IAzureMapLayerType, IAzureMapOptions
} from "react-azure-maps";
import { FogBlob, FullFog, PartialFog } from "./FogBlob";
import { fillBucketsWithDiscoveredPoints, getEmptyBuckets } from "./Bucketizer";
import { getTileCoordinatesFromLeftBottom } from "./MapsHelper";

// ----=======================---- Map Options & Controls ----=======================---- //

const legends: LegendType[] = [
  {
    type: "gradient",
    subtitle: "Intensity",

    // @ts-ignore
    stops: [{
      offset: 0, color: "royalblue", label: "low"
    }, {
      offset: 0.25, color: "cyan"
    }, {
      offset: 0.5, color: "lime", label: "medium"
    }, {
      offset: 0.75, color: "yellow"
    }, {
      offset: 1, color: "red", label: "high"
    }]
  }];

//Add the custom control to the map.
const legend = new LegendControl({
  //Global title to display for the legend.
  title: "Legend",
  legends: legends

  //How the legend control should layout multiple legend cards. Options: "list" | "carousel" | "accordion"
  // layout: "accordion",

  //container: "outsidePanel",
});

const controls: IAzureMapControls[] = [{
  controlName: "CompassControl",
  controlOptions: { rotationDegreesDelta: 10 },
  options: { position: ControlPosition.TopLeft } as ControlOptions
}, {
  controlName: "ZoomControl", options: { position: ControlPosition.TopLeft } as ControlOptions
}];

const consistentZoomOptions = {
  radius: [
    "interpolate",
    ["exponential", 2],
    ["zoom"],
    //For all zoom levels 10 or lower, set the radius to 2 pixels.
    10, 2,

    //Between zoom level 10 and 22, exponentially scale the radius from 2 pixels to 50000 pixels.
    22, 50000
  ],
  intensity: 0.5,
  opacity: 0.5
};

// ----=======================---- React Component ----=======================---- //

function MapWrapper() {

  //const [controller] = useMaterialUIController();
  //const { darkMode } = controller;
  const darkMode = false;
  // ----=======================---- Map Options ----=======================---- //

  const authTokenOptions: AuthenticationOptions = {
    authType: AuthenticationType.subscriptionKey, subscriptionKey: process.env.REACT_APP_MAP_API_KEY
  };

  const pragueCenter = [14.4378, 50.0755];
  const pragueBoundingBox: data.BoundingBox = new data.BoundingBox([14.2, 49.9], [14.6, 50.2]);
  const mapOptions: IAzureMapOptions = {
    // @ts-ignore
    authOptions: authTokenOptions,
    style: "satellite",
    showFeedbackLink: false,
    language: "en-US",
    view: "Auto",

    // This is Prague specific:
    center: pragueCenter,
    zoom: 14,
    maxZoom: 20,
    minZoom: 12,
    maxBounds: pragueBoundingBox
  };

  // @ts-ignore
  const customControls: [IAzureCustomControls] = [
    {
      // @ts-ignore
      control: legend,
      controlOptions: {
        position: ControlPosition.BottomLeft
      }
    }
  ];

  const memoizedOptions: SymbolLayerOptions = {
    textOptions: {
      textField: ["get", "title"], //Specify the property name that contains the text you want to appear with the symbol.
      offset: [0, 1.2]
    }
  };

  // ----=======================---- States, Hooks ----=======================---- //

  const [displayedOverlayUrl, setDisplayedOverlayUrl] = useState("");
  const [currentMapOptions, setMapOptions] = useState(mapOptions);
  const [currentCustomControls, setCustomControls] = useState([]);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [htmlMarkers, setHtmlMarkers] = useState(getDiscoveredPositions());
  const [markersLayer] = useState<IAzureMapLayerType>("SymbolLayer");
  const [layerOptions, setLayerOptions] = useState<SymbolLayerOptions>(memoizedOptions);
  const [fogPositions, setFogPositions] = useState(getFoggyMap(pragueBoundingBox));

  useEffect(() => {
    console.log("Light/dark mode switched.");
    setMapOptions({ ...currentMapOptions, style: darkMode ? "grayscale_dark" : "grayscale_light" });
  }, [darkMode]);

  useEffect(() => {
    console.log("Moved map center to: " + currentMapOptions.center);
    setForceUpdate(forceUpdate + 1);
  }, [currentMapOptions]);

  useEffect(() => {
    console.log("The legend has been added");
    setForceUpdate(forceUpdate + 1);
  }, [currentCustomControls]);


  // ----=======================---- Map Markers ----========================---- //


  function azureHtmlMapMarkerOptions(coordinates: data.Position): HtmlMarkerOptions {
    return {
      position: coordinates,
      text: "My text",
      title: "Title"
    };
  }

  const addHiddenLocation = () => {
    const randomLongitude = Math.random() * (14.6 - 14.2) + 14.2;
    const randomLatitude = Math.random() * (50.15 - 50.0) + 50.0;
    const newPoint = new data.Position(randomLongitude, randomLatitude);
    setHtmlMarkers([...htmlMarkers, newPoint]);
  };

  const onClick = (e: any) => {
    console.log("You click on: ", e);
  };

  const eventToMarker: Array<IAzureMapHtmlMarkerEvent> = [{ eventName: "click", callback: onClick }];

  function renderHTMLPoint(coordinates: data.Position): any {
    const rendId = Math.random();
    return (
      <AzureMapHtmlMarker
        key={rendId}
        markerContent={<div className="pulseIcon"></div>}
        options={{ ...azureHtmlMapMarkerOptions(coordinates) } as any}
        events={eventToMarker}
      />
    );
  }

  const memoizedHtmlMarkerRender: IAzureDataSourceChildren = useMemo(
    (): any => htmlMarkers.map((marker) => renderHTMLPoint(marker)),
    [htmlMarkers]
  );

  function clusterClicked(e: any) {
    console.log("clusterClicked", e);
  }

  const memoizedFogRender: any = useMemo(
    (): any => fogPositions.map((fogPoint) => fogPoint.renderFog()),
    [fogPositions]
  );

  function getFoggyMap(mapBoundingBox: data.BoundingBox): FogBlob[] {
    const discoveredPositions = getDiscoveredPositions();

    // The grid is 8x8 units
    const gridUnits = 5;
    const buckets: data.Position[][][] = getEmptyBuckets(gridUnits);
    fillBucketsWithDiscoveredPoints(buckets, discoveredPositions, mapBoundingBox, gridUnits);

    const fogBlobs: FogBlob[] = [];
    const longGridTileSize = (data.BoundingBox.getEast(mapBoundingBox) - data.BoundingBox.getWest(mapBoundingBox)) / gridUnits;
    const latGridTileSize = (data.BoundingBox.getNorth(mapBoundingBox) - data.BoundingBox.getSouth(mapBoundingBox)) / gridUnits;

    // TODO: Why is this getting called 2x/3x on refresh?

    for (let i = 0; i < gridUnits; i++) {
      for (let j = 0; j < gridUnits; j++) {
        const tileCoordinates = getTileCoordinatesFromLeftBottom(new data.Position(
          data.BoundingBox.getWest(mapBoundingBox) + (data.BoundingBox.getEast(mapBoundingBox) - data.BoundingBox.getWest(mapBoundingBox)) * i / gridUnits,
          data.BoundingBox.getSouth(mapBoundingBox) + (data.BoundingBox.getNorth(mapBoundingBox) - data.BoundingBox.getSouth(mapBoundingBox)) * j / gridUnits
        ), longGridTileSize, latGridTileSize);

        if (!buckets[i][j].length) {
          fogBlobs.push(new FullFog(tileCoordinates, 0.95));
        } else {
          fogBlobs.push(new PartialFog(tileCoordinates, 0.95, buckets[i][j], getSurroundingPoints(buckets, i, j)));
        }
      }
    }

    return fogBlobs;
  }

  function getSurroundingPoints(buckets: data.Position[][][], i: number, j: number): data.Position[] {
    const surroundingPoints: data.Position[] = [];
    if (i > 0) {
      surroundingPoints.push(...buckets[i - 1][j]);
    }
    if (i < buckets.length - 1) {
      surroundingPoints.push(...buckets[i + 1][j]);
    }
    if (j > 0) {
      surroundingPoints.push(...buckets[i][j - 1]);
    }
    if (j < buckets.length - 1) {
      surroundingPoints.push(...buckets[i][j + 1]);
    }
    if (i > 0 && j > 0) {
      surroundingPoints.push(...buckets[i - 1][j - 1]);
    }
    if (i < buckets.length - 1 && j < buckets.length - 1) {
      surroundingPoints.push(...buckets[i + 1][j + 1]);
    }
    if (i > 0 && j < buckets.length - 1) {
      surroundingPoints.push(...buckets[i - 1][j + 1]);
    }
    if (i < buckets.length - 1 && j > 0) {
      surroundingPoints.push(...buckets[i + 1][j - 1]);
    }
    return surroundingPoints;
  }

  function getDiscoveredPositions(): atlas.data.Position[] {
    return [
      [14.4378, 50.0755],
      [14.4378 - 0.005, 50.0755],
      [14.4378 + 0.005, 50.0755]
    ];
  }

  // ----=======================---- DOM Elements ----=======================---- //

  return (
    <>
      <Button size="small" variant="contained" color="primary" onClick={addHiddenLocation}>
        {" "}
        HTML MARKER
      </Button>

      <Box
        borderRadius="lg"
        style={{ overflow: "hidden" }}>

        <AzureMapsProvider>
          <div style={{ height: "calc(100vh - 160px)" }}>
            <AzureMap options={currentMapOptions} controls={controls} customControls={currentCustomControls}>
              <AzureMapDataSourceProvider
                events={{
                  dataadded: (e: any) => {
                    console.log("Data on FogDataProvider added", e);
                  }
                }}
                id={"FogDataProvider"}
                options={{ cluster: true, clusterRadius: 2 }}
              >
                {memoizedFogRender}
              </AzureMapDataSourceProvider>
              <AzureMapDataSourceProvider
                events={{
                  dataadded: (e: any) => {
                    console.log("Data on HiddenLocationDataProvider added", e);
                  }
                }}
                id={"HiddenLocationDataProvider"}
                options={{ cluster: true, clusterRadius: 2 }}
              >
                <AzureMapLayerProvider
                  id={"HiddenLocationLayerProvider"}
                  options={layerOptions}
                  events={{
                    click: clusterClicked,
                    dbclick: clusterClicked
                  }}
                  lifecycleEvents={{
                    layeradded: () => {
                      console.log("HiddenLocationLayer added to map");
                    }
                  }}
                  type={markersLayer}
                />
                {memoizedHtmlMarkerRender}
              </AzureMapDataSourceProvider>
            </AzureMap>
          </div>
        </AzureMapsProvider>
      </Box>
    </>
  );
}

export default MapWrapper;