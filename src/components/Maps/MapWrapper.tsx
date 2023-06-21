import "src/styles/mui-override.css";
import "azure-maps-drawing-tools";
import "src/components/Maps/Legend/LegendControl";

import React, { useState, useEffect, useMemo } from "react";
import { Box, Button, Card, Typography } from "@mui/material";
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
  AzureMapPopup,
  AzureMapsProvider,
  IAzureCustomControls,
  IAzureMapControls, IAzureMapHtmlMarkerEvent, IAzureMapLayerType, IAzureMapOptions
} from "react-azure-maps";
import { FogBlobProps, FullFog, getSmallFog, SmallFog } from "./FogBlob";
import { fillBucketsWithDiscoveredPoints, getEmptyBuckets, getSurroundingPoints } from "./Bucketizer";
import { getTileCoordinatesFromLeftBottom } from "./MapsHelper";
import { PointOfInterest, PointOfInterestProps } from "./PointOfInterest";
import newId from "./NewId";
import { getAll, getExplored, getViewpoints } from "../../restClient/RestClient";

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

  const memoizedOptions: SymbolLayerOptions = {
    textOptions: {
      textField: ["get", "title"],
      offset: [0, 1.2]
    }
  };

  // ----=======================---- States, Hooks ----=======================---- //

  const [currentMapOptions, setMapOptions] = useState(mapOptions);
  const [markersLayer] = useState<IAzureMapLayerType>("SymbolLayer");
  const [layerOptions, setLayerOptions] = useState<SymbolLayerOptions>(memoizedOptions);
  const [playerPosition, setPlayerPosition] = useState(pragueCenter);
  const [fogPositions, setFogPositions] = useState<FogBlobProps[]>([]);
  const [discoveredPositions, setDiscoveredPositions] = useState([]);
  const [pointsOfInterest, setPointsOfInterest] = useState<PointOfInterestProps[]>([]);
  const [popUpContent, setPopUpContent] = useState({lat:0, lon:0, content:"", visible: false});

  useEffect(() => {
    console.log("Moved map center to: " + currentMapOptions.center);
  }, [currentMapOptions]);

  // ----=======================---- Map Markers ----========================---- //

  useEffect(() => {
    console.log("Player position changed to: " + playerPosition);
    setPlayerPosition(playerPosition);
    setPopUpContent({lat:0, lon:0, content:"", visible: false});
  }, [playerPosition]);

  useEffect(() => {
    async function discoveredPositionsSetter() {
      const positions = await getExplored();
      setDiscoveredPositions([...positions, playerPosition]);
      setFogPositions(getDefaultFoggyMap(pragueBoundingBox, [...positions, playerPosition]));
    }

    if (discoveredPositions.length === 0 && pointsOfInterest.length === 0)
      discoveredPositionsSetter().then();
  }, []);

  useEffect(() => {
    async function locationsSetter() {
      const locations = await getAll();
      const convertedLocations = locations.slice(0, 20).map((location) => {
        const coordinates = new data.Position(location.longitude, location.latitude);
        const props: PointOfInterestProps = {
          type: location.type,
          name: location.name,
          coordinates: coordinates,
          discovered: checkPoIAlreadyDiscovered(coordinates, discoveredPositions),
          onUpdate: () => {}
        }

        return new PointOfInterest(props);
      });

      setPointsOfInterest(convertedLocations);
    }

    if (pointsOfInterest.length === 0)
      locationsSetter().then();
  }, []);

  function checkPoIAlreadyDiscovered(coordinates: data.Position, discoveredPositions: data.Position[]): boolean {
    const locationRadius = 0.005;
    const bottomLeftPoint = new data.Position(coordinates[0] - locationRadius, coordinates[1] - locationRadius);
    const topRightPoint = new data.Position(coordinates[0] + locationRadius, coordinates[1] + locationRadius);
    const boundingBox = new data.BoundingBox(bottomLeftPoint, topRightPoint);

    return discoveredPositions.some((position) => data.BoundingBox.containsPosition(boundingBox, position));
  }

  function updateExploredPoI(coordinates: data.Position) {
    const locationRadius = 0.005;
    const bottomLeftPoint = new data.Position(coordinates[0] - locationRadius, coordinates[1] - locationRadius);
    const topRightPoint = new data.Position(coordinates[0] + locationRadius, coordinates[1] + locationRadius);
    const boundingBox = new data.BoundingBox(bottomLeftPoint, topRightPoint);

    const updatedPointsOfInterest = pointsOfInterest.map((poi) => {
      if (data.BoundingBox.containsPosition(boundingBox, poi.coordinates)) {
        poi.discovered = true;
      }

      return poi;
    });

    setPointsOfInterest(updatedPointsOfInterest);
  }

  function playerHtmlMapMarkerOptions(coordinates: data.Position): HtmlMarkerOptions {
    return {
      position: coordinates,
      draggable: true
    };
  }

  const setPlayerPositionAndDiscover = (coordinates: data.Position) => {
    setPlayerPosition(coordinates);

    // TODO: More locations should be added (neighbouring locations should be revealed)
    setDiscoveredPositions([...discoveredPositions, coordinates]);

    const newFogPositions = [];
    for (let i = 0; i < fogPositions.length; i++) {
      if (fogPositions[i].containsPosition(coordinates)) {
        const dissolvedFog = fogPositions[i].dissolve([coordinates], []);
        newFogPositions.push(...dissolvedFog);
      } else {
        newFogPositions.push(fogPositions[i]);
      }
    }

    updateExploredPoI(coordinates);
    setFogPositions(newFogPositions);
  };

  const updatePlayerPosition = (e: any) => {
    const markerPosition = e.target.getOptions().position;
    console.log("You moved the player to: ", markerPosition);
    setPlayerPositionAndDiscover(markerPosition);
  };

  const onClick = (e: any) => {
    console.log("You click on: ", e);
  };

  const eventToMarker: Array<IAzureMapHtmlMarkerEvent> = [
    { eventName: "click", callback: onClick },
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

  const handleLocationUpdate = (targetIndex: number, newLocation: PointOfInterestProps) => {
    const newLocations = pointsOfInterest.map((location, index) =>
      index == targetIndex ? newLocation : location);
    setPointsOfInterest(newLocations);
  };

  const pointsOfInterestRender = useMemo(() => {
    console.log("pointsOfInterestRender");
    return pointsOfInterest.map((location, index) => (
      <PointOfInterest key={newId()} {...location}
                       popUpContentF={setPopUpContent}
                       onUpdate={() => handleLocationUpdate(index, location)} />
    ));
  }, [pointsOfInterest]);

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

  function getDefaultFoggyMap(mapBoundingBox: data.BoundingBox, positions): FogBlobProps[] {
    console.log("Getting default foggy map");
    // The grid is 8x8 units
    const gridUnits = 5;
    const buckets: data.Position[][][] = getEmptyBuckets(gridUnits);
    fillBucketsWithDiscoveredPoints(buckets, positions, mapBoundingBox, gridUnits);

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

  let watchId = null;

  function startTracking() {
    if (!watchId) {
      watchId = navigator.geolocation.watchPosition(function(geoPosition) {
        const userPosition = [geoPosition.coords.longitude, geoPosition.coords.latitude];
        setPlayerPositionAndDiscover(userPosition);
      }, function(error) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            alert("User denied the request for Geolocation.");
            break;
          case error.POSITION_UNAVAILABLE:
            alert("Position information is unavailable.");
            break;
          case error.TIMEOUT:
            alert("The request to get user position timed out.");
            break;
          default:
            alert("An unknown error occurred.");
            break;
        }
      });
    }
  }

  function stopTracking() {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }

  // ----=======================---- DOM Elements ----=======================---- //

  return (
    <>
      <Card
        sx={{
          overflow: "visible",
          margin: "10px"
        }}
      >
        <Box
          sx={{
            p: "10px",
            display: "flex",
            alignItems: "center"
          }}
        >
          <Typography variant="h4" noWrap>
            Warning: Developer Mode is Active!
          </Typography>
          <Button sx={{ mr: "5px", ml: "auto" }} size="small" variant="contained" color="primary"
                  onClick={startTracking}>
            Start Tracking
          </Button>
          <Button size="small" variant="contained" color="primary" onClick={stopTracking}>
            Stop Tracking
          </Button>
        </Box>
      </Card>

      <Box
        borderRadius="lg"
        style={{ overflow: "hidden" }}>

        <AzureMapsProvider>
          <div style={{ height: "calc(100vh - 180px)" }}>
            <AzureMap options={currentMapOptions} controls={controls}>
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
                {pointsOfInterestRender}
                {renderPlayerHTMLPoint(playerPosition)}
                <AzureMapPopup
                  isVisible={popUpContent.visible}
                  options={{
                    position: new data.Position(
                      popUpContent.lat,
                      popUpContent.lon,
                    ),
                    pixelOffset: [0, -10],
                  }}
                  popupContent={
                    <div style={{padding: "1rem", fontSize: "1.2rem"}}>{popUpContent.content}</div>
                  }
                />
              </AzureMapDataSourceProvider>
            </AzureMap>
          </div>
        </AzureMapsProvider>
      </Box>
    </>
  );
}

export default MapWrapper;