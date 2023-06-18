import React from "react";
import { HtmlMarkerOptions, data } from "azure-maps-control";
import { AzureMapHtmlMarker } from "react-azure-maps";

export interface UndiscoveredLocationProps {
  type: number;
  name: string;
  coordinates: data.Position;
  onUpdate: () => void;
}

export class UndiscoveredLocation extends React.Component<UndiscoveredLocationProps> {
  type: number;
  name: string;
  coordinates: data.Position;

  constructor(props: UndiscoveredLocationProps) {
    super(props);
    this.type = props.type;
    this.name = props.name;
    this.coordinates = props.coordinates;
  }

  shouldComponentUpdate(nextProps: Readonly<UndiscoveredLocationProps>, nextState: Readonly<{}>, nextContext: any): boolean {
    console.log("UndiscoveredLocation.shouldComponentUpdate: " + (nextProps.coordinates != this.props.coordinates ? "true" : "false"));
    return nextProps.coordinates != this.props.coordinates;
  }

  handleUpdate = () => {
    this.props.onUpdate();
  };

  render() {
    console.log("UndiscoveredLocation.render");
    const { name, coordinates } = this.props;
    const rendId = Math.random();
    return (
      <AzureMapHtmlMarker
        key={rendId}
        markerContent={<div className="undiscoveredLocation"></div>}
        options={{ ...undiscoveredLocationHtmlMapMarkerOptions(coordinates) } as any}
      />
    );
  }
}

function undiscoveredLocationHtmlMapMarkerOptions(coordinates: data.Position): HtmlMarkerOptions {
  return {
    position: coordinates,
    text: "My text",
    title: "Title"
  };
}

/*
      <AzureMapHtmlMarker
      key={rendId}
      markerContent={<div className="undiscoveredLocation"></div>}
      options={{ ...undiscoveredLocationHtmlMapMarkerOptions(coordinates) } as any}
      events={eventToMarker}
    />
*/

/*
fetch(url)
  .then(response => response.json())
  .then(json => {
    const location = convertJsonToUndiscoveredLocation(json);
    // Do something with the location object
  });
  */