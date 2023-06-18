import { data } from "azure-maps-control";

export function getEmptyBuckets(gridUnits: number): data.Position[][][] {
  const buckets: data.Position[][][] = new Array(gridUnits);
  for (let i = 0; i < gridUnits; i++) {
    buckets[i] = new Array(gridUnits);
    for (let j = 0; j < gridUnits; j++) {
      buckets[i][j] = [];
    }
  }

  return buckets;
}

export function fillBucketsWithDiscoveredPoints(buckets: data.Position[][][], discoveredPositions: data.Position[], mapBoundingBox: number[], gridUnits: number) {
  for (let i = 0; i < discoveredPositions.length; i++) {
    const point = discoveredPositions[i];
    const x = Math.floor((point[0] - mapBoundingBox[0]) / (mapBoundingBox[2] - mapBoundingBox[0]) * gridUnits);
    const y = Math.floor((point[1] - mapBoundingBox[1]) / (mapBoundingBox[3] - mapBoundingBox[1]) * gridUnits);
    buckets[x][y].push(point);
  }
}

export function getSurroundingPoints(buckets: data.Position[][][], i: number, j: number): data.Position[] {
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