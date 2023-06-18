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
import { FogBlobProps, FullFog, getSmallFog, SmallFog } from "./FogBlob";
import { fillBucketsWithDiscoveredPoints, getEmptyBuckets, getSurroundingPoints } from "./Bucketizer";
import { getTileCoordinatesFromLeftBottom } from "./MapsHelper";
import { UndiscoveredLocation, UndiscoveredLocationProps } from "./UndiscoveredLocation";
import newId from "./NewId";

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

  // ----=======================---- Map Options ----=======================---- //

  const authTokenOptions: AuthenticationOptions = {
    authType: AuthenticationType.subscriptionKey, subscriptionKey: process.env.REACT_APP_MAP_API_KEY
  };

  const pragueCenter = [14.4206, 50.0679];
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

  const [currentMapOptions, setMapOptions] = useState(mapOptions);
  const [currentCustomControls, setCustomControls] = useState([]);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [undiscoveredLocations, setUndiscoveredLocations] = useState<UndiscoveredLocationProps[]>([]);
  const [discoveredLocations, setDiscoveredLocations] = useState<UndiscoveredLocationProps[]>([]);
  const [markersLayer] = useState<IAzureMapLayerType>("SymbolLayer");
  const [layerOptions, setLayerOptions] = useState<SymbolLayerOptions>(memoizedOptions);
  const [playerPosition, setPlayerPosition] = useState(pragueCenter);
  const [discoveredPositions, setDiscoveredPositions] = useState(getDiscoveredPositions());
  const [fogPositions, setFogPositions] = useState<FogBlobProps[]>(getDefaultFoggyMap(pragueBoundingBox));

  useEffect(() => {
    console.log("Moved map center to: " + currentMapOptions.center);
    setForceUpdate(forceUpdate + 1);
  }, [currentMapOptions]);

  useEffect(() => {
    console.log("The legend has been added");
    setForceUpdate(forceUpdate + 1);
  }, [currentCustomControls]);

  // ----=======================---- Map Markers ----========================---- //

  useEffect(() => {
    console.log("Player position changed to: " + playerPosition);
    setPlayerPosition(playerPosition);
  }, [playerPosition]);

  function undiscoveredLocationHtmlMapMarkerOptions(coordinates: data.Position): HtmlMarkerOptions {
    return {
      position: coordinates,
      text: "My text",
      title: "Title"
    };
  }

  function playerHtmlMapMarkerOptions(coordinates: data.Position): HtmlMarkerOptions {
    return {
      position: coordinates,
      draggable: true
    };
  }

  const addHiddenLocation = () => {
    const randomLongitude = Math.random() * (14.6 - 14.2) + 14.2;
    const randomLatitude = Math.random() * (50.15 - 50.0) + 50.0;
    const newPoint = new data.Position(randomLongitude, randomLatitude);
    const newMarker: UndiscoveredLocationProps = {
      type: 0,
      name: "Hidden location " + Math.random(),
      coordinates: newPoint,
      onUpdate: () => {
      }
    };
    setUndiscoveredLocations([...undiscoveredLocations, newMarker]);
  };

  const updatePlayerPosition = (e: any) => {
    const markerPosition = e.target.getOptions().position;
    console.log("You moved the player to: ", markerPosition);
    setPlayerPosition(markerPosition);

    // TODO: More locations should be added (neighbouring locations should be revealed)
    setDiscoveredPositions([...discoveredPositions, markerPosition]);

    const newFogPositions = [];
    for (let i = 0; i < fogPositions.length; i++) {
      if (fogPositions[i].containsPosition(markerPosition)) {
        const dissolvedFog = fogPositions[i].dissolve([markerPosition], []);
        newFogPositions.push(...dissolvedFog);
      } else {
        newFogPositions.push(fogPositions[i]);
      }
    }

    setFogPositions(newFogPositions);
  };

  const eventToMarker: Array<IAzureMapHtmlMarkerEvent> = [
    //{ eventName: "click", callback: onClick },
    { eventName: "dragend", callback: updatePlayerPosition }
  ];

  // TODO: Rewrite to memo
  function renderPlayerHTMLPoint(coordinates: data.Position): any {
    const rendId = Math.random();
    return (
      <AzureMapHtmlMarker
        key={rendId}
        markerContent={<div className="playerIcon"></div>}
        options={{ ...playerHtmlMapMarkerOptions(coordinates) } as any}
        events={eventToMarker}
      />
    );
  }

  const handleLocationUpdate = (targetIndex: number, newLocation: UndiscoveredLocationProps) => {
    const newLocations = undiscoveredLocations.map((location, index) =>
      index == targetIndex ? newLocation : location);
    setUndiscoveredLocations(newLocations);
  };

  const undiscoveredLocationsRender = useMemo(() => {
    return undiscoveredLocations.map((location, index) => (
      <UndiscoveredLocation key={location.name} {...location}
                            onUpdate={() => handleLocationUpdate(index, location)} />
    ));
  }, [undiscoveredLocations]);

  function clusterClicked(e: any) {
    console.log("clusterClicked", e);
  }

  // ----=======================---- Fog Rendering ----========================---- //

  const addFog = () => {
    const randomLongitude = Math.random() * (14.4 - 14.3) + 14.3;
    const randomLatitude = Math.random() * (50.08 - 50.05) + 50.05;
    const newFog: FogBlobProps = {
      id: newId(),
      tileCoordinates: [
        new data.Position(randomLongitude, randomLatitude),
        new data.Position(randomLongitude + 0.01, randomLatitude),
        new data.Position(randomLongitude + 0.01, randomLatitude - 0.01),
        new data.Position(randomLongitude - 0.01, randomLatitude - 0.01)
      ],
      opacity: 1,
      discoveredLocationsInCurrentTile: [],
      discoveredLocationsInNeighborTiles: [],
      onUpdate: () => {
      },
      containsPosition: (position: data.Position) => false,
      dissolve: () => {
        return [];
      }
    };

    setFogPositions([...fogPositions, new SmallFog(newFog)]);
  };

  const removeFog = () => {
    const newFogPositions = [...fogPositions];
    newFogPositions.splice(0, 1);
    setFogPositions(newFogPositions);
  };

  const handleFogUpdate = (targetIndex: number, newFogPoint: FogBlobProps) => {
    console.log("handleFogUpdate");
    const newFogPositions = fogPositions.map((fogPoint, index) =>
      index == targetIndex ? newFogPoint : fogPoint);
    setFogPositions(newFogPositions);
  };

  const memoizedFogRender = useMemo(() => {
    return fogPositions.map((fogPoint, index) => {
      if (fogPoint instanceof FullFog) { // @ts-ignore
        return (<FullFog key={fogPoint.id} {...fogPoint} onUpdate={() => handleFogUpdate(index, fogPoint)} />);
      }
      return (<SmallFog key={fogPoint.id} {...fogPoint} onUpdate={() => handleFogUpdate(index, fogPoint)} />);
    });
  }, [fogPositions]);

  function getDefaultFoggyMap(mapBoundingBox: data.BoundingBox): FogBlobProps[] {
    console.log("Getting default foggy map");
    // The grid is 8x8 units
    const gridUnits = 5;
    const buckets: data.Position[][][] = getEmptyBuckets(gridUnits);
    fillBucketsWithDiscoveredPoints(buckets, discoveredPositions, mapBoundingBox, gridUnits);

    const fogBlobs: FogBlobProps[] = [];
    const longGridTileSize = (data.BoundingBox.getEast(mapBoundingBox) - data.BoundingBox.getWest(mapBoundingBox)) / gridUnits;
    const latGridTileSize = (data.BoundingBox.getNorth(mapBoundingBox) - data.BoundingBox.getSouth(mapBoundingBox)) / gridUnits;

    // TODO: Why is this getting called 2x/3x on refresh?

    for (let i = 0; i < gridUnits; i++) {
      for (let j = 0; j < gridUnits; j++) {
        const tileCoordinates = getTileCoordinatesFromLeftBottom(new data.Position(
          data.BoundingBox.getWest(mapBoundingBox) + (data.BoundingBox.getEast(mapBoundingBox) - data.BoundingBox.getWest(mapBoundingBox)) * i / gridUnits,
          data.BoundingBox.getSouth(mapBoundingBox) + (data.BoundingBox.getNorth(mapBoundingBox) - data.BoundingBox.getSouth(mapBoundingBox)) * j / gridUnits
        ), longGridTileSize, latGridTileSize);

        const fogProps: FogBlobProps = {
          id: newId(),
          tileCoordinates: tileCoordinates,
          opacity: 0.85,
          discoveredLocationsInCurrentTile: [],
          discoveredLocationsInNeighborTiles: [],
          containsPosition: (position: data.Position) => false,
          dissolve: (discoveredPositions: data.Position[], surroundingPoints: data.Position[]) => null,
          onUpdate: () => {
          }
        };

        if (!buckets[i][j].length) {
          fogBlobs.push(new FullFog(fogProps));
        } else {
          const smallFog = getSmallFog(tileCoordinates, buckets[i][j].concat(getSurroundingPoints(buckets, i, j)));
          fogBlobs.push(...smallFog);
        }
      }
    }

    return fogBlobs;
  }

  function getDiscoveredPositions(): atlas.data.Position[] {
    return [
      playerPosition,
      [playerPosition[0] - 0.005, playerPosition[1]],
      [playerPosition[0] + 0.005, playerPosition[1]]
    ];
  }

  // ----=======================---- DOM Elements ----=======================---- //

  return (
    <>
      <Button size="small" variant="contained" color="primary" onClick={addHiddenLocation}>
        {" "}
        HTML MARKER
      </Button>

      <Button size="small" variant="contained" color="primary" onClick={addFog}>
        {" "}
        FOG
      </Button>

      <Button size="small" variant="contained" color="primary" onClick={removeFog}>
        {" "}
        POP
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
                {undiscoveredLocationsRender}
                {renderPlayerHTMLPoint(playerPosition)}
              </AzureMapDataSourceProvider>
            </AzureMap>
          </div>
        </AzureMapsProvider>
      </Box>
    </>
  );
}

export default MapWrapper;