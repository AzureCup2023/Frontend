import atlas, { data } from "azure-maps-control";
import { AzureMapLayerProvider } from "react-azure-maps";
import React from "react";
import { fillBucketsWithDiscoveredPoints, getEmptyBuckets } from "./Bucketizer";
import {
  getBoundingBoxFromCenter,
  getBoundingBoxFromLeftBottom, getTileCoordinatesFromBoundingBox,
} from "./MapsHelper";

export abstract class FogBlob {
  protected boundingBox: data.BoundingBox;

  protected constructor(
    public tileCoordinates: atlas.data.Position[],
    public opacity: number
  ) {
    this.tileCoordinates = tileCoordinates;
    this.opacity = opacity;
    this.boundingBox = new data.BoundingBox(tileCoordinates[3], tileCoordinates[1]);
  }

  abstract renderFog(): any;

  abstract dissolve(discoveredLocationsInCurrentTile: atlas.data.Position[],
                    discoveredLocationsInNeighborTiles: atlas.data.Position[]): FogBlob;

  containsPosition(position: atlas.data.Position): boolean {
    return data.BoundingBox.containsPosition(this.boundingBox, position);
  }
}

export class FullFog extends FogBlob {
  constructor(
    tileCoordinates: atlas.data.Position[],
    opacity: number
  ) {
    super(tileCoordinates, opacity);
  }

  function;

  renderFog(): any {
    console.log("Rendering full fog");
    const rendId = Math.random();
    return (
      <AzureMapLayerProvider
        key={rendId}
        options={{
          url: "/static/images/locato/seamless.avif",
          coordinates: this.tileCoordinates,
          opacity: this.opacity,
          fadeDuration: 500,
        }}
        type={"ImageLayer"}
      />
    );
  }

  dissolve(discoveredLocationsInCurrentTile: atlas.data.Position[],
           discoveredLocationsInNeighborTiles: atlas.data.Position[]): FogBlob {
    console.log("Dissolving full fog");
    return new PartialFog(this.tileCoordinates, this.opacity, discoveredLocationsInCurrentTile, discoveredLocationsInNeighborTiles);
  }
}

export class PartialFog extends FogBlob {
  private locationRadius: number = 0.005;
  private gridUnits: number = 8;
  private readonly discoveredLocations: atlas.data.Position[];
  private readonly buckets: data.Position[][][];

  constructor(
    tileCoordinates: atlas.data.Position[],
    opacity: number,
    discoveredLocationsInCurrentTile: atlas.data.Position[],
    discoveredLocationsInNeighborTiles: atlas.data.Position[]
  ) {
    super(tileCoordinates, opacity);
    this.discoveredLocations = discoveredLocationsInCurrentTile.concat(discoveredLocationsInNeighborTiles);
    this.buckets = getEmptyBuckets(this.gridUnits);
    fillBucketsWithDiscoveredPoints(this.buckets, discoveredLocationsInCurrentTile, this.boundingBox, this.gridUnits);
  }

  renderFog(): any {
    const subTileBoundingBoxes: atlas.data.BoundingBox[] = [];
    const longGridTileSize = (data.BoundingBox.getEast(this.boundingBox) - data.BoundingBox.getWest(this.boundingBox)) / this.gridUnits;
    const latGridTileSize = (data.BoundingBox.getNorth(this.boundingBox) - data.BoundingBox.getSouth(this.boundingBox)) / this.gridUnits;

    const numberOfCircularTiles = 7;
    this.createBoundaryTiles(longGridTileSize, latGridTileSize, subTileBoundingBoxes);
    this.createCircularTiles(longGridTileSize, latGridTileSize, numberOfCircularTiles, subTileBoundingBoxes);
    this.createSubTiles(longGridTileSize, latGridTileSize, subTileBoundingBoxes);

    const finalFogTiles: atlas.data.Position[][] = [];
    for (let i = 0; i < subTileBoundingBoxes.length; i++) {
      const subTileBoundingBox = subTileBoundingBoxes[i];

      // Clear tiles in some proximity to discovered locations
      if (!this.isCloseToDiscoveredLocation(subTileBoundingBox)) {
        const tileCoordinates = getTileCoordinatesFromBoundingBox(subTileBoundingBox);
        finalFogTiles.push(tileCoordinates);
      }
    }

    console.log("Rendering partial fog");
    return finalFogTiles.map(x => this.renderSubTile(x));
  }

  dissolve(discoveredLocationsInCurrentTile: atlas.data.Position[],
           discoveredLocationsInNeighborTiles: atlas.data.Position[]): FogBlob {
    console.log("Dissolving partial fog");
    this.discoveredLocations.push(...discoveredLocationsInCurrentTile);
    this.discoveredLocations.push(...discoveredLocationsInNeighborTiles);
    return this;
  }

  private isCloseToDiscoveredLocation(subTileBoundingBox: atlas.data.BoundingBox) {
    for (let i = 0; i < this.discoveredLocations.length; i++) {
      const location = this.discoveredLocations[i];

      const shiftedPoints = [
        location,
        [location[0], location[1] - this.locationRadius / 2],
        [location[0], location[1] + this.locationRadius / 2],
        [location[0] - this.locationRadius / 2, location[1]],
        [location[0] + this.locationRadius / 2, location[1]],

        // TODO: Adjust the diagonal points
        // [location[0] - Math.sin(Math.PI / 4) * this.locationRadius, location[1] - Math.sin(Math.PI / 4) * this.locationRadius],
        // [location[0] + Math.sin(Math.PI / 4) * this.locationRadius, location[1] - Math.sin(Math.PI / 4) * this.locationRadius],
        // [location[0] - Math.sin(Math.PI / 4) * this.locationRadius, location[1] + Math.sin(Math.PI / 4) * this.locationRadius],
        // [location[0] + Math.sin(Math.PI / 4) * this.locationRadius, location[1] + Math.sin(Math.PI / 4) * this.locationRadius]
      ];

      for (let j = 0; j < shiftedPoints.length; j++) {
        const shiftedPoint = shiftedPoints[j];
        if (data.BoundingBox.containsPosition(subTileBoundingBox, shiftedPoint))
          return true;
      }
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
    const finerLongGridTileSize = longGridTileSize / 4;
    const finerLatGridTileSize = latGridTileSize / 4;

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
          url: `/static/images/locato/partial-${Math.floor(rendId * 4)}.png`,
          coordinates: this.expandCoordinates(subTileCoordinates),
          // TODO: Opacity should be based on distance from discovered locations
          opacity: this.opacity,
          fadeDuration: 500
        }}
        type={"ImageLayer"}
      />
    );
  }

  expandCoordinates(coordinates: atlas.data.Position[]): atlas.data.Position[] {
    // Expand the coordinates randomly to avoid the grid pattern
    // const xShift = Math.random() * this.locationRadius * 2 - this.locationRadius;
    // const yShift = Math.random() * this.locationRadius * 2 - this.locationRadius;
    // return coordinates.map(x => [x[0] + xShift, x[1] + yShift]);

    const topShift = Math.random() * this.locationRadius / 2;
    const bottomShift = Math.random() * this.locationRadius / 2;
    const leftShift = Math.random() * this.locationRadius / 2;
    const rightShift = Math.random() * this.locationRadius / 2;

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

  private createBoundaryTiles(longGridTileSize: number, latGridTileSize: number, subTileBoundingBoxes: atlas.data.BoundingBox[]) {
    // Create tiles around the boundary of the fog
    for (let i = 0; i < this.gridUnits; i++) {
      let bottomLeftPoint = new data.Position(
        data.BoundingBox.getWest(this.boundingBox) + longGridTileSize * i,
        data.BoundingBox.getSouth(this.boundingBox) - latGridTileSize / 2
      );
      let tileBoundingBox = getBoundingBoxFromLeftBottom(bottomLeftPoint, longGridTileSize, latGridTileSize);
      subTileBoundingBoxes.push(tileBoundingBox);

      bottomLeftPoint = new data.Position(
        data.BoundingBox.getWest(this.boundingBox) + longGridTileSize * i,
        data.BoundingBox.getNorth(this.boundingBox) - latGridTileSize / 2
      );
      tileBoundingBox = getBoundingBoxFromLeftBottom(bottomLeftPoint, longGridTileSize, latGridTileSize);
      subTileBoundingBoxes.push(tileBoundingBox);

      bottomLeftPoint = new data.Position(
        data.BoundingBox.getWest(this.boundingBox) - longGridTileSize / 2,
        data.BoundingBox.getSouth(this.boundingBox) + latGridTileSize * i,
      );
      tileBoundingBox = getBoundingBoxFromLeftBottom(bottomLeftPoint, longGridTileSize, latGridTileSize);
      subTileBoundingBoxes.push(tileBoundingBox);

      bottomLeftPoint = new data.Position(
        data.BoundingBox.getEast(this.boundingBox) - longGridTileSize / 2,
        data.BoundingBox.getSouth(this.boundingBox) + latGridTileSize * i,
      );
      tileBoundingBox = getBoundingBoxFromLeftBottom(bottomLeftPoint, longGridTileSize, latGridTileSize);
      subTileBoundingBoxes.push(tileBoundingBox);
    }
  }
}