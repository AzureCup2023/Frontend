import atlas, { data } from "azure-maps-control";

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