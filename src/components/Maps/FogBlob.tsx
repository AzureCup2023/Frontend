import atlas, { data } from "azure-maps-control";
import { AzureMapLayerProvider } from "react-azure-maps";
import React from "react";
import { fillBucketsWithDiscoveredPoints, getEmptyBuckets } from "./Bucketizer";
import {
  getBoundingBoxFromCenter,
  getBoundingBoxFromLeftBottom, getTileCoordinatesFromBoundingBox,
  getTileCoordinatesFromCenter,
  getTileCoordinatesFromLeftBottom
} from "./MapsHelper";

export abstract class FogBlob {
  public imagePath: string;

  protected constructor(
    public tileCoordinates: atlas.data.Position[],
    public opacity: number
  ) {
    this.tileCoordinates = tileCoordinates;
    this.opacity = opacity;
  }

  abstract renderFog(): any;
}

export class FullFog extends FogBlob {
  constructor(
    tileCoordinates: atlas.data.Position[],
    opacity: number
  ) {
    super(tileCoordinates, opacity);
    this.imagePath = "/static/images/locato/fog.jpg";
  }

  function;

  renderFog(): any {
    const rendId = Math.random();
    return (
      <AzureMapLayerProvider
        key={rendId}
        options={{
          url: this.imagePath,
          coordinates: this.tileCoordinates,
          opacity: this.opacity
        }}
        type={"ImageLayer"}
      />
    );
  }
}

export class PartialFog extends FogBlob {
  private locationRadius: number = 0.005;
  private gridUnits: number = 8;
  private discoveredLocations: atlas.data.Position[];
  private boundingBox: data.BoundingBox;
  private buckets: data.Position[][][];

  constructor(
    tileCoordinates: atlas.data.Position[],
    opacity: number,
    discoveredLocationsInCurrentTile: atlas.data.Position[],
    discoveredLocationsInNeighborTiles: atlas.data.Position[]
  ) {
    super(tileCoordinates, opacity);
    this.imagePath = "/static/images/locato/cloud.png";
    this.discoveredLocations = discoveredLocationsInCurrentTile.concat(discoveredLocationsInNeighborTiles);
    this.boundingBox = new data.BoundingBox(tileCoordinates[3], tileCoordinates[1]);
    this.buckets = getEmptyBuckets(this.gridUnits);
    fillBucketsWithDiscoveredPoints(this.buckets, discoveredLocationsInCurrentTile, this.boundingBox, this.gridUnits);
  }

  renderFog(): any {
    const subTileBoundingBoxes: atlas.data.BoundingBox[] = [];
    const longGridTileSize = (data.BoundingBox.getEast(this.boundingBox) - data.BoundingBox.getWest(this.boundingBox)) / this.gridUnits;
    const latGridTileSize = (data.BoundingBox.getNorth(this.boundingBox) - data.BoundingBox.getSouth(this.boundingBox)) / this.gridUnits;

    const numberOfCircularTiles = 7;
    this.createCircularTiles(longGridTileSize, latGridTileSize, numberOfCircularTiles, subTileBoundingBoxes);
    this.createSubTiles(longGridTileSize, latGridTileSize, subTileBoundingBoxes);

    console.log(this.discoveredLocations.length);

    const finalFogTiles: atlas.data.Position[][] = [];
    for (let i = 0; i < subTileBoundingBoxes.length; i++) {
      const subTileBoundingBox = subTileBoundingBoxes[i];

      // Clear tiles in some proximity to discovered locations
      if (!this.isCloseToDiscoveredLocation(subTileBoundingBox)) {
        const tileCoordinates = getTileCoordinatesFromBoundingBox(subTileBoundingBox);
        finalFogTiles.push(tileCoordinates);
      }
    }

    return finalFogTiles.map(x => this.renderSubTile(x));
  }

  private isCloseToDiscoveredLocation(subTileBoundingBox: atlas.data.BoundingBox) {
    for (let k = 0; k < this.discoveredLocations.length; k++) {
      const location = this.discoveredLocations[k];

      // Check the distance between the edge of the tile and the discovered location
      if (data.BoundingBox.containsPosition(subTileBoundingBox, location))
        return true;

      if (data.BoundingBox.containsPosition(subTileBoundingBox, [location[0], location[1] - this.locationRadius / 2]))
        return true;

      if (data.BoundingBox.containsPosition(subTileBoundingBox, [location[0], location[1] + this.locationRadius / 2]))
        return true;

      if (data.BoundingBox.containsPosition(subTileBoundingBox, [location[0] - this.locationRadius / 2, location[1]]))
        return true;

      if (data.BoundingBox.containsPosition(subTileBoundingBox, [location[0] + this.locationRadius / 2, location[1]]))
        return true;

      if (data.BoundingBox.containsPosition(subTileBoundingBox, [location[0] - Math.sin(Math.PI / 4) * this.locationRadius, location[1] - Math.sin(Math.PI / 4) * this.locationRadius]))
        return true;

      if (data.BoundingBox.containsPosition(subTileBoundingBox, [location[0] + Math.sin(Math.PI / 4) * this.locationRadius, location[1] - Math.sin(Math.PI / 4) * this.locationRadius]))
        return true;

      if (data.BoundingBox.containsPosition(subTileBoundingBox, [location[0] - Math.sin(Math.PI / 4) * this.locationRadius, location[1] + Math.sin(Math.PI / 4) * this.locationRadius]))
        return true;

      if (data.BoundingBox.containsPosition(subTileBoundingBox, [location[0] + Math.sin(Math.PI / 4) * this.locationRadius, location[1] + Math.sin(Math.PI / 4) * this.locationRadius]))
        return true;
      //if (Math.abs(location[0] - centerPoint[0]) < (longGridTileSize) && Math.abs(location[1] - centerPoint[1]) < (latGridTileSize)) {
    }

    return false;
  }

  private createSubTiles(longGridTileSize: number, latGridTileSize: number, subTileBoundingBoxes: atlas.data.BoundingBox[]) {
    for (let i = 0; i < this.gridUnits; i++) {
      for (let j = 0; j < this.gridUnits; j++) {
        const bottomLeftPoint = new data.Position(
          data.BoundingBox.getWest(this.boundingBox) + (data.BoundingBox.getEast(this.boundingBox) - data.BoundingBox.getWest(this.boundingBox)) * i / this.gridUnits,
          data.BoundingBox.getSouth(this.boundingBox) + (data.BoundingBox.getNorth(this.boundingBox) - data.BoundingBox.getSouth(this.boundingBox)) * j / this.gridUnits
        );

        const tileBoundingBox = getBoundingBoxFromLeftBottom(bottomLeftPoint, longGridTileSize, latGridTileSize);
        subTileBoundingBoxes.push(tileBoundingBox);
      }
    }
  }

  private createCircularTiles(longGridTileSize: number, latGridTileSize: number, numberOfCircularTiles: number, subTileBoundingBoxes: atlas.data.BoundingBox[]) {
    const finerLongGridTileSize = longGridTileSize / 2;
    const finerLatGridTileSize = latGridTileSize / 2;

    // Fill the borders around the proximity of the discovered locations
    for (let i = 0; i < this.discoveredLocations.length; i++) {
      const location = this.discoveredLocations[i];

      // Create tiles in a circle around the discovered location
      for (let j = 0; j < numberOfCircularTiles; j++) {
        // Distribute the tiles evenly around the circle
        const angle = 2 * Math.PI * j / numberOfCircularTiles;
        const xOffset = this.locationRadius * Math.cos(angle);
        const yOffset = this.locationRadius * Math.sin(angle);

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

  renderSubTile(subTileCoordinates: atlas.data.Position[]): any {
    const rendId = Math.random();
    return (
      <AzureMapLayerProvider
        key={rendId}
        options={{
          // TODO: Pick a random image from a set of images
          url: this.imagePath,
          coordinates: subTileCoordinates,
          // TODO: Opacity should be based on distance from discovered locations
          opacity: this.opacity
        }}
        type={"ImageLayer"}
      />
    );
  }
}