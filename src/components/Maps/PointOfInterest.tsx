import React from "react";
import { HtmlMarkerOptions, data } from "azure-maps-control";
import { AzureMapHtmlMarker, IAzureMapHtmlMarkerEvent, useCreatePopup } from "react-azure-maps";
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import Visibility from '@mui/icons-material/Visibility';

export interface PointOfInterestProps {
  type: number;
  name: string;
  coordinates: data.Position;
  discovered: boolean;
  onUpdate: () => void;
  popUpContentF?: (x:{}) => void;
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
    const onClick = (e: any) => {
      this.props.popUpContentF({
        lat: e.target.element.childNodes[0].attributes['data-lat'].value.split(",")[0],
        lon: e.target.element.childNodes[0].attributes['data-lat'].value.split(",")[1],
        content: e.target.element.childNodes[0].attributes['data-name'].value,
        visible: true,
      });
    };
  
    const eventToMarker: Array<IAzureMapHtmlMarkerEvent> = [
      { eventName: "click", callback: onClick },
    ];
  
    console.log("PointOfInterest.render: " + this.coordinates);
    const { name, coordinates } = this.props;
    const rendId = Math.random();
    console.log(this.props)
    return (
      this.discovered ?
        <AzureMapHtmlMarker
          key={rendId}
          markerContent={<div className="discoveredLocation" data-name={name} data-lat={coordinates} data-lon={coordinates}>
            {
              this.props.type == 1 && 
              <Visibility />
            }
            {
              this.props.type == 2 || this.props.type == 0 && 
              <AccountBalanceIcon />
            }
          </div>}
          options={{ ...this.discoveredLocationHtmlMapMarkerOptions() } as any}
          events={eventToMarker}
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