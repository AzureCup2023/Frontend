const serverUrl: string = "https://foxplore.azurewebsites.net/";
export const controllers: string[] = [
  "PointsOfInterest/GetViewpoints",
  "PointsOfInterest/GetParks",
  "PointsOfInterest/GetTechnicalFeatures",
  "PointsOfInterest/GetAll",
  "User/GetExplored",
  "User/Explore",
  "User/ExploreChunk",
  "User/ClearExplored"
];

export async function getViewpoints() {
  return await fetchFromController("PointsOfInterest/GetViewpoints");
}

export async function getParks() {
  return await fetchFromController("PointsOfInterest/GetParks");
}

export async function getTechnicalFeatures() {
  return await fetchFromController("PointsOfInterest/GetTechnicalFeatures");
}

export async function getAll() {
  return await fetchFromController("PointsOfInterest/GetAll");
}

export async function getExplored() {
  return await fetchFromController("User/GetExplored");
}

export async function explore(point: number[]) {
  return await postToController("User/Explore",
    {
      lat: point[0],
      long: point[1]
    });
}

export async function exploreChunk(points: number[][]) {
  return await postToController("User/ExploreChunk", { points });
}

export async function clearExplored() {
  return await deleteFromController("User/ClearExplored");
}

async function fetchFromController(controller: string, params?: any) {
  if (!controllers.includes(controller)) {
    throw new Error("Invalid controller");
  }

  const url = new URL(serverUrl + controller);

  if (params) {
    url.search = new URLSearchParams(params).toString();
  }

  const url1 = url.toString();
  console.log("Fetching from: " + url1);

  const response = await fetch(url1, {
    method: "GET", mode: "cors", headers: {
      "Content-Type": "application/json"
    }
  });
  console.log(response);

  return response.json();
}

async function postToController(controller: string, params?: any) {
  if (!controllers.includes(controller)) {
    throw new Error("Invalid controller");
  }

  const url1 = new URL(serverUrl + controller).toString();
  console.log("Posting to: " + url1);

  const response = await fetch(url1, {
    method: "POST", mode: "cors", headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(params)
  });
  console.log(response);

  return response.json();
}

async function deleteFromController(controller: string, params?: any) {
  if (!controllers.includes(controller)) {
    throw new Error("Invalid controller");
  }

  const url = new URL(serverUrl + controller);

  if (params) {
    url.search = new URLSearchParams(params).toString();
  }

  const url1 = url.toString();
  console.log("Deleting from: " + url1);

  const response = await fetch(url1, {
    method: "DELETE", mode: "cors", headers: {
      "Content-Type": "application/json"
    }
  });
  console.log(response);

  return response.json();
}