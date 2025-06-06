import { useEffect, useRef, useCallback, useState } from "react";
import L, { marker } from "leaflet";
import "leaflet-rotate";
import "leaflet/dist/leaflet.css";
import { IsPointInRadius } from "../helper";
import { useMessage } from "@/context/messageContext";
import { CancleIcon } from "@/components/icon";
import { markerService } from "@/services/markerService";

export default function useLeafletMap({
  event,
  center = [-7.5360639, 112.2384017],
  zoom = 13,
  markers = [],
  onClickMarker,
  onCancelMarker,
  onPressMap,
  onReleaseMap,
} = {}) {
  ////////////////////////////////
  // GLOBAL CONTEXT
  const { showMessage } = useMessage()

  const GPSCenterRef = useRef(null);


  const eventRef = useRef(null)
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersRef = useRef([]);
  const markerLayerRef = useRef(null);
  const gpsMarkerRef = useRef(null);
  const markerAddRef = useRef(null)
  const gpsCircleRef = useRef(null);

  const tileLayerRef = useRef(null);
  const dataLayerRef = useRef(null);

  const [markerData, setMarkerData] = useState([]); // State to track all markers

  const [currentBaseMap, setCurrentBaseMap] = useState("hybrid");
  const [currentDataMap, setCurrentDataMap] = useState("none");

  const baseMapOptions = {
    road: "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
    hybrid: "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
    terrain: "https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}",
  };

  const dataMapOptions = {
    none: null, // No base map
    dds: "https://tile.digitalisasi-pi.com/data/jatim_ds/{z}/{x}/{y}.png",
    ifri: "https://tile.digitalisasi-pi.com/data/jatim_ifri/{z}/{x}/{y}.png",
  };

  const _initialize = (container, instance) => {
    if (!container.current || instance.current) return;
    instance.current = L.map(container.current, {
      center,
      zoom,
      zoomControl: false,
      rotateControl: false,
    });
    tileLayerRef.current = L.tileLayer(baseMapOptions[currentBaseMap]).addTo(instance.current);
    markerLayerRef.current = L.layerGroup().addTo(instance.current);

    if (onPressMap) {
      instance.current.on("contextmenu", async (event) => {
        const { lat, lng } = event.latlng;

        if (GPSCenterRef.current && eventRef.current == "survey") {
          if (IsPointInRadius(lat, lng, GPSCenterRef.current.lat, GPSCenterRef.current.lng, 200)) {
            try {
              const radiusData = {
                lat: lat,
                lon: lng,
                radius_km: 0.1
              };
              
              const response = await markerService.checkRadius(radiusData);
              if (response.data === true) {
                showMessage(
                  "Tidak diperbolehkan menambahkan titik karena berada pada radius titik lain",
                  <CancleIcon />
                );
                mapInstanceRef.current.setView(event.latlng);
                return;
              }

              if (markerAddRef.current) {
                mapInstanceRef.current.removeLayer(markerAddRef.current);
              }
              markerAddRef.current = L.marker(event.latlng, {
                icon: L.icon({
                  iconUrl: "/marker-add.png",
                  iconSize: [32, 38],
                }),
              }).addTo(mapInstanceRef.current);
              onPressMap({ lat, lng });
            } catch (error) {
              console.error("Error checking radius:", error);
              showMessage(
                "Terjadi kesalahan saat memeriksa radius",
                <CancleIcon />
              );
            }
          } else {
            showMessage(
              "Titik yang dipilih berada di luar radius area Anda. Silakan pilih titik di dalam area atau dekati lokasi komoditas",
              <CancleIcon />
            )
            mapInstanceRef.current.setView(event.latlng);
          }
        } else {
          mapInstanceRef.current.setView(event.latlng);
        }
      });
    }
  };
 
  const _destroy = (instance) => {
    if (instance.current) {
      instance.current.eachLayer((layer) => instance.current.removeLayer(layer));
      instance.current.remove();
      instance.current = null;
      layersRef.current = [];
    }
  };

  // handle change events
  useEffect(() => {
    eventRef.current = event
    if (event == "view") {
      if (markerAddRef.current) {
        mapInstanceRef.current.removeLayer(markerAddRef.current);
      }
    }
  }, [event])

  useEffect(() => {
    if (mapContainerRef.current && !mapInstanceRef.current) {
      _initialize(mapContainerRef, mapInstanceRef);
    }
    return () => {
      if (mapInstanceRef.current) {
        _destroy(mapInstanceRef);
      }
    };
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current && tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
      tileLayerRef.current = L.tileLayer(baseMapOptions[currentBaseMap]).addTo(mapInstanceRef.current);
    }
  }, [currentBaseMap]);

  const setCenter = useCallback((newCenter, newZoom = zoom) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(newCenter, newZoom);
    }
  }, []);

  const addLayer = useCallback((layerUrl, options = {}) => {
    if (mapInstanceRef.current) {
      const newLayer = L.tileLayer(layerUrl, options).addTo(mapInstanceRef.current);
      layersRef.current.push(newLayer);
    }
  }, []);

  const removeLayer = useCallback((layerUrl) => {
    if (mapInstanceRef.current) {
      const layerIndex = layersRef.current.findIndex(layer => layer._url === layerUrl);
      if (layerIndex !== -1) {
        mapInstanceRef.current.removeLayer(layersRef.current[layerIndex]);
        layersRef.current.splice(layerIndex, 1);
      }
    }
  }, []);


  const setGpsLocation = useCallback((center, radius = 200, zoom = 20) => {
    if (!mapInstanceRef.current) return;

    if (gpsMarkerRef.current) {
      mapInstanceRef.current.removeLayer(gpsMarkerRef.current);
    }
    if (gpsCircleRef.current) {
      mapInstanceRef.current.removeLayer(gpsCircleRef.current);
    }

    gpsMarkerRef.current = L.marker(center, {
      icon: L.icon({
        iconUrl: "/pin.png",
        iconSize: [20, 20],
      }),
    }).addTo(mapInstanceRef.current);

    gpsCircleRef.current = L.circle(center, {
      radius: radius,
      fillColor: "#0080FB",
      fillOpacity: 0.2,
      weight: 0,
    }).addTo(mapInstanceRef.current);

    mapInstanceRef.current.setView(center, zoom);
    GPSCenterRef.current = center;
  }, []);


  const getGpsLocation = useCallback(() => {
    return GPSCenterRef.current
  }, []);

  const getMarkerAddLocation = useCallback(() => {
    return markerAddRef.current.getLatLng();
  }, []);

  const setBaseMap = useCallback((newBaseMap) => {
    if (!mapInstanceRef.current) return;

    // Remove existing base map (tile layer) but keep data layers
    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }

    // Add new base map layer
    if (baseMapOptions[newBaseMap]) {
      tileLayerRef.current = L.tileLayer(baseMapOptions[newBaseMap]).addTo(mapInstanceRef.current);
    }

    setCurrentBaseMap(newBaseMap);

    // ✅ Ensure the data map remains by reapplying it after the base map changes
    if (dataLayerRef.current) {
      dataLayerRef.current.addTo(mapInstanceRef.current);
    }
  }, []);

  const setDataMap = useCallback((newDataMap, opacity = 0.5) => {
    if (!mapInstanceRef.current) return;

    // Remove existing data layer
    if (dataLayerRef.current) {
      mapInstanceRef.current.removeLayer(dataLayerRef.current);
      dataLayerRef.current = null;
    }

    // Add new data layer if not "none"
    if (dataMapOptions[newDataMap] && newDataMap !== "none") {
      dataLayerRef.current = L.tileLayer(dataMapOptions[newDataMap], {
        opacity,
        maxZoom: 18,
        maxNativeZoom: 17
      }).addTo(mapInstanceRef.current);
    }

    setCurrentDataMap(newDataMap);
  }, []);


  // Function to initialize markers from an external data source
  const initializeMarkers = useCallback((initialMarkers) => {
    if (!markerLayerRef.current || !mapInstanceRef.current) return;

    markerLayerRef.current.clearLayers();
    setMarkerData([]);


    const newMarkers = initialMarkers.map(({ id, location, commodity }) => {
      const { lat, lon } = location;
      let iconOptions;
      switch (commodity) {
        case "padi":
          iconOptions = { iconUrl: "/marker-padi.png", iconSize: [32, 38] };
          break;
        case "jagung":
          iconOptions = { iconUrl: "/marker-jagung.png", iconSize: [32, 38] };
          break;
        case "tebu":
          iconOptions = { iconUrl: "/marker-tebu.png", iconSize: [32, 38] };
          break;
        default:
          iconOptions = { iconUrl: "/marker-other.png", iconSize: [32, 38] };
      }

      const marker = L.marker([lat, lon], { icon: L.icon(iconOptions) }).addTo(markerLayerRef.current);
      marker.on("click", () => onClickMarker && onClickMarker({ id }));

      return { id, marker, lat, lon, commodity };
    });

    setMarkerData(newMarkers);
  }, []);

  // Function to append a new marker while keeping data consistent
  const appendMarker = useCallback((type, id) => {
    if (!markerLayerRef.current || !markerAddRef.current) return;

    const currentMarkerAddPosition = markerAddRef.current.getLatLng();
    const { lat, lng } = currentMarkerAddPosition;

    let iconOptions;
    switch (type) {
      case "padi":
        iconOptions = { iconUrl: "/marker-padi.png", iconSize: [32, 38] };
        break;
      case "jagung":
        iconOptions = { iconUrl: "/marker-jagung.png", iconSize: [32, 38] };
        break;
      case "tebu":
        iconOptions = { iconUrl: "/marker-tebu.png", iconSize: [32, 38] };
        break;
      default:
        iconOptions = { iconUrl: "/marker-other.png", iconSize: [32, 38] };
    }

    const newMarker = L.marker([lat, lng], {
      icon: L.icon(iconOptions),
    }).addTo(markerLayerRef.current);

    newMarker.on("click", () => {
      if (onClickMarker) {
        onClickMarker({ id });
      }
    });

    setMarkerData((prevMarkers) => [
      ...prevMarkers,
      { id, marker: newMarker, lat, lng, type },
    ]);

    if (markerAddRef.current) {
      mapInstanceRef.current.removeLayer(markerAddRef.current);
    }
  }, []);

  const removeMarker = useCallback((id) => {
    if (!markerLayerRef.current) return;

    setMarkerData((prevMarkers) => {
      const markerIndex = prevMarkers.findIndex((m) => m.id === id);
      if (markerIndex === -1) return prevMarkers;

      const markerToRemove = prevMarkers[markerIndex].marker;
      markerLayerRef.current.removeLayer(markerToRemove);

      return prevMarkers.filter((m) => m.id !== id);
    });
  }, []);

  const updateMarker = useCallback((id, newLocation, newType) => {
    setMarkerData((prevMarkers) => {
      return prevMarkers.map((markerObj) => {
        if (markerObj.id === id) {
          markerObj.marker.setLatLng(newLocation);
          let iconOptions;
          switch (newType) {
            case "padi":
              iconOptions = { iconUrl: "/marker-padi.png", iconSize: [32, 38] };
              break;
            case "jagung":
              iconOptions = { iconUrl: "/marker-jagung.png", iconSize: [32, 38] };
              break;
            case "tebu":
              iconOptions = { iconUrl: "/marker-tebu.png", iconSize: [32, 38] };
              break;
            default:
              iconOptions = { iconUrl: "/marker-other.png", iconSize: [32, 38] };
          }
          markerObj.marker.setIcon(L.icon(iconOptions));
          return { ...markerObj, lat: newLocation.lat, lon: newLocation.lng, type: newType };
        }
        return markerObj;
      });
    });
  }, []);

  const removeMarkerAdd = useCallback(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(markerAddRef.current);
    }
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current && currentDataMap !== "none") {
      setDataMap(currentDataMap);
    }
  }, [currentBaseMap]); // ✅ Whenever the base map changes, re-add the data layer

  return {
    mapContainerRef,
    setCenter,
    addLayer,
    removeLayer,
    setGpsLocation,
    getGpsLocation,
    getMarkerAddLocation,
    setBaseMap,
    setDataMap,
    appendMarker,
    removeMarker,
    removeMarkerAdd,
    updateMarker,
    initializeMarkers,
    markerData,
    currentBaseMap,
    currentDataMap,
  };
}