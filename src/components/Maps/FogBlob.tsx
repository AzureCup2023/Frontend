import atlas, { data } from "azure-maps-control";
import { AzureMapLayerProvider } from "react-azure-maps";
import React from "react";
import {
  getBoundingBoxFromCenter,
  getBoundingBoxFromLeftBottom, getTileCoordinatesFromBoundingBox
} from "./MapsHelper";
import newId from "./NewId";

export interface FogBlobProps {
  id: string;
  tileCoordinates: atlas.data.Position[],
  opacity: number
  discoveredLocationsInCurrentTile: atlas.data.Position[],
  discoveredLocationsInNeighborTiles: atlas.data.Position[]
  containsPosition: (position: atlas.data.Position) => boolean;
  dissolve: (discoveredLocationsInCurrentTile: atlas.data.Position[],
             discoveredLocationsInNeighborTiles: atlas.data.Position[]) => FogBlobProps[];
  onUpdate: () => void;
}

export class FullFog extends React.Component<FogBlobProps> implements FogBlobProps {
  id: string;
  tileCoordinates: atlas.data.Position[];
  opacity: number;
  discoveredLocationsInCurrentTile: atlas.data.Position[] = [];
  discoveredLocationsInNeighborTiles: atlas.data.Position[] = [];
  boundingBox: atlas.data.BoundingBox;
  onUpdate: () => void;

  constructor(props: FogBlobProps) {
    super(props);
    this.id = props.id;
    this.tileCoordinates = props.tileCoordinates;
    this.opacity = props.opacity;
    this.onUpdate = props.onUpdate;
    this.boundingBox = new data.BoundingBox(this.tileCoordinates[3], this.tileCoordinates[1]);
  }

  shouldComponentUpdate(nextProps: Readonly<FogBlobProps>, nextState: Readonly<{}>, nextContext: any): boolean {
    return false;
  }

  handleUpdate = () => {
    this.onUpdate();
  };

  containsPosition(position: atlas.data.Position): boolean {
    return data.BoundingBox.containsPosition(this.boundingBox, position);
  }

  render() {
    const rendId = Math.random();
    return (
      <AzureMapLayerProvider
        key={rendId}
        options={{
          url: "/static/images/locato/seamless.avif",
          coordinates: this.tileCoordinates,
          opacity: this.opacity,
          fadeDuration: 500
        }}
        type={"ImageLayer"}
      />
    );
  }

  dissolve(discoveredLocationsInCurrentTile: atlas.data.Position[],
           discoveredLocationsInNeighborTiles: atlas.data.Position[]): FogBlobProps[] {
    console.log("Dissolving full fog");
    return getSmallFog(this.tileCoordinates, discoveredLocationsInCurrentTile.concat(discoveredLocationsInNeighborTiles));
  }
}

export class SmallFog extends React.Component<FogBlobProps> implements FogBlobProps {
  id: string;
  tileCoordinates: atlas.data.Position[];
  opacity: number;
  discoveredLocationsInCurrentTile: atlas.data.Position[] = [];
  discoveredLocationsInNeighborTiles: atlas.data.Position[] = [];
  boundingBox: atlas.data.BoundingBox;
  onUpdate: () => void;

  constructor(props: FogBlobProps) {
    super(props);
    this.id = props.id;
    this.tileCoordinates = props.tileCoordinates;
    this.opacity = props.opacity;
    this.onUpdate = props.onUpdate;
    this.boundingBox = new data.BoundingBox(this.tileCoordinates[3], this.tileCoordinates[1]);
  }

  shouldComponentUpdate(nextProps: Readonly<FogBlobProps>, nextState: Readonly<{}>, nextContext: any): boolean {
    return false;
  }

  handleUpdate = () => {
    this.onUpdate();
  };

  containsPosition(position: atlas.data.Position): boolean {
    if (data.BoundingBox.containsPosition(this.boundingBox, position))
      return data.BoundingBox.containsPosition(this.boundingBox, position);
  }

  render() {
    const rendId = Math.random();
    return (
      <AzureMapLayerProvider
        key={rendId}
        options={{
          url: `/static/images/locato/partial-${Math.floor(rendId * 4)}-min.png`,
          coordinates: this.expandCoordinates(0.005, this.tileCoordinates),
          // TODO: Opacity should be based on distance from discovered locations
          opacity: this.opacity,
          fadeDuration: 500
        }}
        type={"ImageLayer"}
      />
    );
  }

  dissolve(discoveredLocationsInCurrentTile: atlas.data.Position[],
           discoveredLocationsInNeighborTiles: atlas.data.Position[]): FogBlobProps[] {
    console.log("Dissolving small fog");
    return [];
  }

  private expandCoordinates(locationRadius: number, coordinates: atlas.data.Position[]): atlas.data.Position[] {
    const topShift = Math.random() * locationRadius / 2;
    const bottomShift = Math.random() * locationRadius / 2;
    const leftShift = Math.random() * locationRadius / 2;
    const rightShift = Math.random() * locationRadius / 2;

    coordinates[0][0] -= leftShift;
    coordinates[0][1] += topShift;
    coordinates[1][0] += rightShift;
    coordinates[1][1] += topShift;
    coordinates[2][0] += rightShift;
    coordinates[2][1] -= bottomShift;
    coordinates[3][0] -= leftShift;
    coordinates[3][1] -= bottomShift;

    return coordinates;
  }
}

export function getSmallFog(tileCoordinates: data.Position[], discoveredLocations: data.Position[]): FogBlobProps[] {
  console.log("Creating a small fog list");
  const gridUnits = 8;
  const locationRadius = 0.005;
  const boundingBox = new data.BoundingBox(tileCoordinates[3], tileCoordinates[1]);
  const subTileBoundingBoxes: atlas.data.BoundingBox[] = [];
  const longGridTileSize = (data.BoundingBox.getEast(boundingBox) - data.BoundingBox.getWest(boundingBox)) / gridUnits;
  const latGridTileSize = (data.BoundingBox.getNorth(boundingBox) - data.BoundingBox.getSouth(boundingBox)) / gridUnits;
  const numberOfCircularTiles = 7;

  createBoundaryTiles(boundingBox, gridUnits, longGridTileSize, latGridTileSize, subTileBoundingBoxes);
  createCircularTiles(discoveredLocations, locationRadius, longGridTileSize, latGridTileSize, numberOfCircularTiles, subTileBoundingBoxes);
  createSubTiles(boundingBox, gridUnits, longGridTileSize, latGridTileSize, subTileBoundingBoxes);

  const finalFogTiles: atlas.data.Position[][] = [];
  for (let i = 0; i < subTileBoundingBoxes.length; i++) {
    const subTileBoundingBox = subTileBoundingBoxes[i];

    // Clear tiles in some proximity to discovered locations
    if (!isCloseToDiscoveredLocation(discoveredLocations, locationRadius, subTileBoundingBox)) {
      const tileCoordinates = getTileCoordinatesFromBoundingBox(subTileBoundingBox);
      finalFogTiles.push(tileCoordinates);
    }
  }

  return finalFogTiles.map(x => new SmallFog({
    id: newId(),
    tileCoordinates: x,
    opacity: 1,
    discoveredLocationsInCurrentTile: [],
    discoveredLocationsInNeighborTiles: [],
    containsPosition: () => false,
    dissolve: () => [],
    onUpdate: () => {
    }
  }));
}

function createBoundaryTiles(boundingBox: data.BoundingBox, gridUnits: number, longGridTileSize: number, latGridTileSize: number, subTileBoundingBoxes: atlas.data.BoundingBox[]) {
  // Create tiles around the boundary of the fog
  for (let i = 0; i < gridUnits; i++) {
    let bottomLeftPoint = new data.Position(
      data.BoundingBox.getWest(boundingBox) + longGridTileSize * i,
      data.BoundingBox.getSouth(boundingBox) - latGridTileSize / 2
    );
    let tileBoundingBox = getBoundingBoxFromLeftBottom(bottomLeftPoint, longGridTileSize, latGridTileSize);
    subTileBoundingBoxes.push(tileBoundingBox);

    bottomLeftPoint = new data.Position(
      data.BoundingBox.getWest(boundingBox) + longGridTileSize * i,
      data.BoundingBox.getNorth(boundingBox) - latGridTileSize / 2
    );
    tileBoundingBox = getBoundingBoxFromLeftBottom(bottomLeftPoint, longGridTileSize, latGridTileSize);
    subTileBoundingBoxes.push(tileBoundingBox);

    bottomLeftPoint = new data.Position(
      data.BoundingBox.getWest(boundingBox) - longGridTileSize / 2,
      data.BoundingBox.getSouth(boundingBox) + latGridTileSize * i
    );
    tileBoundingBox = getBoundingBoxFromLeftBottom(bottomLeftPoint, longGridTileSize, latGridTileSize);
    subTileBoundingBoxes.push(tileBoundingBox);

    bottomLeftPoint = new data.Position(
      data.BoundingBox.getEast(boundingBox) - longGridTileSize / 2,
      data.BoundingBox.getSouth(boundingBox) + latGridTileSize * i
    );
    tileBoundingBox = getBoundingBoxFromLeftBottom(bottomLeftPoint, longGridTileSize, latGridTileSize);
    subTileBoundingBoxes.push(tileBoundingBox);
  }
}

function createSubTiles(boundingBox: data.BoundingBox, gridUnits: number, longGridTileSize: number, latGridTileSize: number, subTileBoundingBoxes: atlas.data.BoundingBox[]) {
  for (let i = 0; i < gridUnits; i++) {
    for (let j = 0; j < gridUnits; j++) {
      let bottomLeftPoint = new data.Position(
        data.BoundingBox.getWest(boundingBox) + (data.BoundingBox.getEast(boundingBox) - data.BoundingBox.getWest(boundingBox)) * i / gridUnits,
        data.BoundingBox.getSouth(boundingBox) + (data.BoundingBox.getNorth(boundingBox) - data.BoundingBox.getSouth(boundingBox)) * j / gridUnits
      );
      let tileBoundingBox = getBoundingBoxFromLeftBottom(bottomLeftPoint, longGridTileSize, latGridTileSize);
      subTileBoundingBoxes.push(tileBoundingBox);

      // Shift the tile for added overlay
      bottomLeftPoint = new data.Position(bottomLeftPoint[0], bottomLeftPoint[1] + latGridTileSize / 2);
      tileBoundingBox = getBoundingBoxFromLeftBottom(bottomLeftPoint, longGridTileSize, latGridTileSize);
      subTileBoundingBoxes.push(tileBoundingBox);

      bottomLeftPoint = new data.Position(bottomLeftPoint[0] + longGridTileSize / 2, bottomLeftPoint[1]);
      tileBoundingBox = getBoundingBoxFromLeftBottom(bottomLeftPoint, longGridTileSize, latGridTileSize);
      subTileBoundingBoxes.push(tileBoundingBox);
    }
  }
}

function createCircularTiles(discoveredLocations: data.Position[], locationRadius: number, longGridTileSize: number, latGridTileSize: number, numberOfCircularTiles: number, subTileBoundingBoxes: atlas.data.BoundingBox[]) {
  const finerLongGridTileSize = longGridTileSize / 4;
  const finerLatGridTileSize = latGridTileSize / 4;

  // Fill the borders around the proximity of the discovered locations
  for (let i = 0; i < discoveredLocations.length; i++) {
    const location = discoveredLocations[i];

    // Create tiles in a circle around the discovered location
    for (let j = 0; j < numberOfCircularTiles; j++) {
      // Distribute the tiles evenly around the circle
      const angle = 2 * Math.PI * j / numberOfCircularTiles;
      const xOffset = locationRadius * Math.cos(angle);
      const yOffset = locationRadius * Math.sin(angle);

      const tileCenter = new data.Position(
        // Never ask a woman her age, a man his salary, or Denis why he's using an arbitrary number
        location[0] - xOffset - finerLongGridTileSize / 8,
        location[1] - yOffset
      );

      const tileBoundingBox = getBoundingBoxFromCenter(tileCenter, finerLongGridTileSize, finerLatGridTileSize);
      subTileBoundingBoxes.push(tileBoundingBox);
    }
  }
}

function isCloseToDiscoveredLocation(discoveredLocations: data.Position[], locationRadius: number, subTileBoundingBox: atlas.data.BoundingBox) {
  for (let i = 0; i < discoveredLocations.length; i++) {
    const location = discoveredLocations[i];

    const shiftedPoints = [
      location,
      [location[0], location[1] - locationRadius / 2],
      [location[0], location[1] + locationRadius / 2],
      [location[0] - locationRadius / 2, location[1]],
      [location[0] + locationRadius / 2, location[1]]

      // TODO: Adjust the diagonal points
      // [location[0] - Math.sin(Math.PI / 4) * locationRadius, location[1] - Math.sin(Math.PI / 4) * locationRadius],
      // [location[0] + Math.sin(Math.PI / 4) * locationRadius, location[1] - Math.sin(Math.PI / 4) * locationRadius],
      // [location[0] - Math.sin(Math.PI / 4) * locationRadius, location[1] + Math.sin(Math.PI / 4) * locationRadius],
      // [location[0] + Math.sin(Math.PI / 4) * locationRadius, location[1] + Math.sin(Math.PI / 4) * locationRadius]
    ];

    for (let j = 0; j < shiftedPoints.length; j++) {
      const shiftedPoint = shiftedPoints[j];
      if (data.BoundingBox.containsPosition(subTileBoundingBox, shiftedPoint))
        return true;
    }
  }

  return false;
}
