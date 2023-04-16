const serverUrl: string = "https://azurecupbackend.azurewebsites.net/";
export const controllers: string[] = [
  "Capabilities/GetAvailableCities",
  "Capabilities/GetAvailableOverlays",
  "Overlay/GetCityOverlay"
];

export async function getAvailableCities() {
  return await fetchFromController("Capabilities/GetAvailableCities");
}

export async function getAvailableOverlays(city: number) {
  return await fetchFromController("Capabilities/GetAvailableOverlays", { cityId: city });
}

export async function getCityOverlay(city: number, overlay: string) {
  return await fetchFromController("Overlay/GetCityOverlay", { cityId: city, overlayType: overlay });
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