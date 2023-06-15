import atlas, { data } from "azure-maps-control";

export function getTileCoordinatesFromLeftBottom(point: data.Position, longEpsilon: number, latEpsilon: number): data.Position[] {
  const topLeft = new data.Position(point[0], point[1] + latEpsilon);
  const topRight = new data.Position(point[0] + longEpsilon, point[1] + latEpsilon);
  const bottomRight = new data.Position(point[0] + longEpsilon, point[1]);
  const bottomLeft = new data.Position(point[0], point[1]);
  return [topLeft, topRight, bottomRight, bottomLeft];
}

export function getTileCoordinatesFromCenter(point: data.Position, longEpsilon: number, latEpsilon: number): data.Position[] {
  const topLeft = new data.Position(point[0] - longEpsilon / 2, point[1] + latEpsilon / 2);
  const topRight = new data.Position(point[0] + longEpsilon / 2, point[1] + latEpsilon / 2);
  const bottomRight = new data.Position(point[0] + longEpsilon / 2, point[1] - latEpsilon / 2);
  const bottomLeft = new data.Position(point[0] - longEpsilon / 2, point[1] - latEpsilon / 2);
  return [topLeft, topRight, bottomRight, bottomLeft];
}

export function getTileCoordinatesFromBoundingBox(boundingBox: data.BoundingBox): data.Position[] {
  const topLeft = data.BoundingBox.getNorthWest(boundingBox);
  const topRight = data.BoundingBox.getNorthEast(boundingBox);
  const bottomRight = data.BoundingBox.getSouthEast(boundingBox);
  const bottomLeft = data.BoundingBox.getSouthWest(boundingBox);
  return [topLeft, topRight, bottomRight, bottomLeft];
}

export function getBoundingBoxFromCenter(point: data.Position, longEpsilon: number, latEpsilon: number): data.BoundingBox {
  const bottomLeft = new data.Position(point[0] - longEpsilon / 2, point[1] - latEpsilon / 2);
  const topRight = new data.Position(point[0] + longEpsilon / 2, point[1] + latEpsilon / 2);
  return new data.BoundingBox(bottomLeft, topRight);
}

export function getBoundingBoxFromLeftBottom(point: data.Position, longEpsilon: number, latEpsilon: number): data.BoundingBox {
  const topLeft = new data.Position(point[0], point[1]);
  const bottomRight = new data.Position(point[0] + longEpsilon, point[1] + latEpsilon);
  return new data.BoundingBox(topLeft, bottomRight);
}