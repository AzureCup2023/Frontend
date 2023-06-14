import atlas, { data } from "azure-maps-control";

export function getTileCoordinatesFromLeftBottom(point: data.Position, longEpsilon: number, latEpsilon: number): atlas.data.Position[] {
  const topLeft = new data.Position(point[0], point[1] + latEpsilon);
  const topRight = new data.Position(point[0] + longEpsilon, point[1] + latEpsilon);
  const bottomRight = new data.Position(point[0] + longEpsilon, point[1]);
  const bottomLeft = new data.Position(point[0], point[1]);
  return [topLeft, topRight, bottomRight, bottomLeft];
}

export function getTileCoordinatesFromCenter(point: data.Position, longEpsilon: number, latEpsilon: number): atlas.data.Position[] {
  const topLeft = new data.Position(point[0] - longEpsilon / 2, point[1] + latEpsilon / 2);
  const topRight = new data.Position(point[0] + longEpsilon / 2, point[1] + latEpsilon / 2);
  const bottomRight = new data.Position(point[0] + longEpsilon / 2, point[1] - latEpsilon / 2);
  const bottomLeft = new data.Position(point[0] - longEpsilon / 2, point[1] - latEpsilon / 2);
  return [topLeft, topRight, bottomRight, bottomLeft];
}