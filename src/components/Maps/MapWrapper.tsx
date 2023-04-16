import "src/styles/mui-override.css";
import "azure-maps-drawing-tools";
import "src/components/Maps/Legend/LegendControl";

import React, { useState, useEffect } from "react";
import { Box, Button, Grid, MenuItem, TextField } from "@mui/material";
import { capitalizeFirstLetter } from "src/helpers/StringUtils";
import { LegendControl, LegendType } from "./Legend";
import { AuthenticationOptions, AuthenticationType, ControlOptions, ControlPosition } from "azure-maps-control";
import { getAvailableCities, getAvailableOverlays, getCityOverlay } from "src/restClient/RestClient";
import {
  AzureMap,
  AzureMapDataSourceProvider,
  AzureMapLayerProvider,
  AzureMapsProvider,
  IAzureCustomControls,
  IAzureMapControls, IAzureMapOptions
} from "react-azure-maps";

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

  //How the legend control should layout multiple legend cards. Options: 'list' | 'carousel' | 'accordion'
  // layout: 'accordion',

  //container: 'outsidePanel',
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

  const authTokenOptions : AuthenticationOptions = {
    authType: AuthenticationType.subscriptionKey, subscriptionKey: process.env.REACT_APP_MAP_API_KEY
  }

  console.log("Map API Key: " + process.env.REACT_APP_MAP_API_KEY)

  const mapOptions : IAzureMapOptions = {
    authOptions: authTokenOptions, style: darkMode ? "grayscale_dark" : "grayscale_light", showFeedbackLink: false, language: "en-US", center: [0, 30], zoom: 2, view: "Auto"
  }

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

  // ----=======================---- States, Hooks ----=======================---- //

  const [selectedCity, setCity] = useState({ name: "" } as any);
  const [availableCities, setAvailableCities] = useState([]);

  const [selectedOverlay, setOverlay] = useState("");
  const [availableOverlays, setAvailableOverlays] = useState([]);

  const [displayedOverlayUrl, setDisplayedOverlayUrl] = useState("");

  const [currentMapOptions, setMapOptions] = useState(mapOptions);
  const [currentCustomControls, setCustomControls] = useState([]);
  const [forceUpdate, setForceUpdate] = useState(0);

  const handleCityChange = (event) => {
    const selectedCity = availableCities.find(city => city.name === event.target.value);

    console.log("New city selected by the UI: " + selectedCity.name);

    setCity(selectedCity);
    setMapOptions({ ...currentMapOptions, center: [selectedCity.latitude, selectedCity.longitude], zoom: selectedCity.defaultZoom });
  };

  const handleOverlayChange = (event) => {
    setOverlay(event.target.value as string);
  };

  const displaySelectedOverlay = () => {
    async function overlayFetcher() {
      const overlayUrl = await getCityOverlay(selectedCity.id, selectedOverlay.toLowerCase());
      setDisplayedOverlayUrl(overlayUrl["url"]);

      console.log("The displayed overlay URL was changed to: " + overlayUrl["url"]);

      if (overlayUrl["url"])
        setCustomControls(customControls);
    }

    overlayFetcher().then();
  };

  useEffect(() => {
    async function citiesSetter() {
      const cities = await getAvailableCities();
      setAvailableCities(cities);
      console.log("List of cities updated.");
    }

    citiesSetter().then();
  }, []);

  useEffect(() => {
    async function overlaysSetter() {
      if (!selectedCity.name) {
        return;
      }

      setOverlay("");
      setAvailableOverlays([]);

      const overlays = await getAvailableOverlays(selectedCity.id);
      setAvailableOverlays(overlays);
      console.log("List of overlays updated.");
    }

    overlaysSetter().then();
  }, [selectedCity]);

  useEffect(() => {
    console.log("Light/dark mode switched.")
    setMapOptions({ ...currentMapOptions,  style: darkMode ? "grayscale_dark" : "grayscale_light"});
  }, [darkMode]);

  useEffect(() => {
    console.log("Moved map center to: " + currentMapOptions.center);
    setForceUpdate(forceUpdate + 1);
  }, [currentMapOptions]);

  useEffect(() => {
    console.log("The legend has been added");
    setForceUpdate(forceUpdate + 1);
  }, [currentCustomControls]);

  // ----=======================---- DOM Elements ----=======================---- //

  // @ts-ignore
  // @ts-ignore
  // @ts-ignore
  // @ts-ignore
  return (
    <>

      <Grid container paddingBottom={3}>
        <Grid item xs={12} md={12} lg={4}>
          <Box
            sx={{ p: 2 }}>

            <TextField
              label="City"
              style={{ minWidth: "100%" }}
              select
              value={selectedCity.name}
              onChange={handleCityChange}
            >
              {availableCities.map((city, i) => <MenuItem key={i} value={city.name}>{city.name}</MenuItem>)}
            </TextField>

          </Box>
        </Grid>

        <Grid item xs={12} md={12} lg={4}>
          <Box
            sx={{ p: 2 }}>

            <TextField
              label="Data"
              style={{ minWidth: "100%" }}
              select
              value={selectedOverlay}
              onChange={handleOverlayChange}
              disabled={!selectedCity.name}
            >
              {availableOverlays.map((overlay, i) =>
                <MenuItem key={i} value={capitalizeFirstLetter(overlay)}>{capitalizeFirstLetter(overlay)}</MenuItem>)}
            </TextField>

          </Box>
        </Grid>

        <Grid item xs={12} md={12} lg={4}>

          <div className="stupidAssCenter">

            <Button
              variant="contained"
              color="info"
              disabled={!selectedOverlay}
              onClick={displaySelectedOverlay}
            >
              Display
            </Button>

          </div>

        </Grid>
      </Grid>

      <Box
        key={forceUpdate}
        shadow="lg"
        borderRadius="lg"
        style={{ overflow: "hidden" }}>

        <AzureMapsProvider>
          <div style={{ height: "calc(100vh - 160px)" }}>
            <AzureMap options={currentMapOptions} controls={controls} customControls={currentCustomControls}>
              {
                // Draw the heatmap whenever the display URL is non-empty.
                displayedOverlayUrl ?
                  (<AzureMapDataSourceProvider id={"DataSource"}
                                               dataFromUrl={displayedOverlayUrl}>
                      <AzureMapLayerProvider id={"HeatMap"} options={consistentZoomOptions} type={"HeatLayer"} />
                    </AzureMapDataSourceProvider>
                  )
                  :
                  <></>
              }
            </AzureMap>
          </div>
        </AzureMapsProvider>
      </Box>
    </>
  );
}

export default MapWrapper;