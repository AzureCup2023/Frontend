import React from "react";
import { HtmlMarkerOptions, data } from "azure-maps-control";
import { AzureMapHtmlMarker } from "react-azure-maps";

export interface PointOfInterestProps {
  type: number;
  name: string;
  coordinates: data.Position;
  discovered: boolean;
  onUpdate: () => void;
}

export class PointOfInterest extends React.Component<PointOfInterestProps> {
  type: number;
  name: string;
  coordinates: data.Position;
  discovered: boolean;

  constructor(props: PointOfInterestProps) {
    super(props);
    this.type = props.type;
    this.name = props.name;
    this.coordinates = props.coordinates;
    this.discovered = props.discovered;
  }

  shouldComponentUpdate(nextProps: Readonly<PointOfInterestProps>, nextState: Readonly<{}>, nextContext: any): boolean {
    console.log("PointOfInterest.shouldComponentUpdate: " + (nextProps.discovered != this.props.discovered ? "true" : "false"));
    return nextProps.discovered != this.props.discovered;
  }

  handleUpdate = () => {
    this.props.onUpdate();
  };

  render() {
    console.log("PointOfInterest.render: " + this.coordinates);
    const { name, coordinates } = this.props;
    const rendId = Math.random();
    return (
      this.discovered ?
        <AzureMapHtmlMarker
          key={rendId}
          markerContent={<div className="discoveredLocation"></div>}
          options={{ ...this.discoveredLocationHtmlMapMarkerOptions() } as any}
        />
        :
        <AzureMapHtmlMarker
          key={rendId}
          markerContent={<div className="undiscoveredLocation"></div>}
          options={{ ...this.undiscoveredLocationHtmlMapMarkerOptions() } as any}
        />
    );
  }

  undiscoveredLocationHtmlMapMarkerOptions(): HtmlMarkerOptions {
    return {
      position: this.coordinates
    };
  }

  discoveredLocationHtmlMapMarkerOptions(): HtmlMarkerOptions {
    return {
      position: this.coordinates,
      // TODO: One of these is not needed
      text: this.name,
      title: this.name,
    };
  }
}