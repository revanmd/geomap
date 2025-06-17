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
  center,
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
    dds: [
      {
        url: "https://tile.digitalisasi-pi.com/data/jatim_ds/{z}/{x}/{y}.png",
        bounds: [[-8.7806, 110.8890], [-6.7157, 114.7012]], // East Java bounds
        name: "Jawa Timur"
      },
      {
        url: "https://tile.digitalisasi-pi.com/data/merged_all_zoom_jateng/{z}/{x}/{y}.png",
        bounds: [[-8.3017, 108.6571], [-5.7224, 111.7024]], // Central Java bounds
        name: "Jawa Tengah"
      },
      {
        url: "https://tile.digitalisasi-pi.com/data/merged_all_zoom_lampung1/{z}/{x}/{y}.png",
        bounds: [[-6.1474, 103.6351], [-3.7294, 106.0283]], // Lampung bounds
        name: "Lampung"
      },
      {
        url: "https://tile.digitalisasi-pi.com/data/merged_all_zoom_ntb7/{z}/{x}/{y}.png",
        bounds: [[-9.6668, 115.7472], [-8.0757, 119.3413]], // NTB bounds
        name: "Nusa Tenggara Barat"
      },
      {
        url: "https://tile.digitalisasi-pi.com/data/merged_all_zoom_sumsel1/{z}/{x}/{y}.png",
        bounds: [[-4.9209, 101.8713], [-1.6263, 106.2158]], // South Sumatra bounds
        name: "Sumatera Selatan"
      },
      {
        url: "https://tile.digitalisasi-pi.com/data/merged_all_zoom_sulsel1/{z}/{x}/{y}.png",
        bounds: [[-7.0184, 115.8217], [-0.8676, 120.9817]], // South Sulawesi bounds
        name: "Sulawesi Selatan"
      },
      {
        url: "https://tile.digitalisasi-pi.com/data/merged_all_zoom_jatim/{z}/{x}/{y}.png",
        bounds: [[-8.7806, 110.8890], [-6.7157, 114.7012]], // East Java bounds
        name: "Jawa Timur"
      },
      {
        url: "https://tile.digitalisasi-pi.com/data/merged_all_zoom_jabar/{z}/{x}/{y}.png",
        bounds: [[-7.8178, 106.3714], [-5.9023, 108.8403]], // West Java bounds
        name: "Jawa Barat"
      }
    ],
    ifri: {
      url: "https://tile.digitalisasi-pi.com/data/jatim_ifri/{z}/{x}/{y}.png",
      bounds: [[-8.7806, 110.8890], [-6.7157, 114.7012]], // East Java bounds
      name: "IFRI Jawa Timur"
    }
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

              if (markerAddRef.current && markerAddRef.current._leaflet_id) {
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
      instance.current.eachLayer((layer) => {
        if (layer && layer._leaflet_id) {
          instance.current.removeLayer(layer);
        }
      });
      instance.current.remove();
      instance.current = null;
      layersRef.current = [];
    }
  };

  // handle change events
  useEffect(() => {
    eventRef.current = event
    if (event == "view") {
      if (markerAddRef.current && markerAddRef.current._leaflet_id) {
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


  const setGpsLocation = useCallback((center, radius = 200, zoom = 20, onComplete) => {
    if (!mapInstanceRef.current) {
      if (onComplete) onComplete();
      return;
    }

    if (gpsMarkerRef.current && gpsMarkerRef.current._leaflet_id) {
      mapInstanceRef.current.removeLayer(gpsMarkerRef.current);
    }
    if (gpsCircleRef.current && gpsCircleRef.current._leaflet_id) {
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

    // Use setView with animation and wait for it to complete
    mapInstanceRef.current.setView(center, zoom);
    GPSCenterRef.current = center;

    // Wait for the map view animation to complete
    if (onComplete) {
      // Use a small delay to ensure the map view change has completed
      setTimeout(() => {
        onComplete();
      }, 200); // 300ms should be enough for the map animation
    }
  }, []);


  const getGpsLocation = useCallback(() => {
    return GPSCenterRef.current
  }, []);

  const getMarkerAddLocation = useCallback(() => {
    if (markerAddRef.current) {
      const latLng = markerAddRef.current.getLatLng();
      return {
        lat: latLng.lat,
        lng: latLng.lng
      };
    }
    return null;
  }, []);

  const setBaseMap = useCallback((newBaseMap) => {
    if (!mapInstanceRef.current) return;

    // Remove existing base map (tile layer) but keep data layers
    if (tileLayerRef.current && tileLayerRef.current._leaflet_id) {
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

    // Remove existing data layers
    if (dataLayerRef.current) {
      if (Array.isArray(dataLayerRef.current)) {
        dataLayerRef.current.forEach(layer => {
          if (layer) mapInstanceRef.current.removeLayer(layer);
        });
      } else if (dataLayerRef.current) {
        mapInstanceRef.current.removeLayer(dataLayerRef.current);
      }
      dataLayerRef.current = null;
    }

    // Add new data layer(s)
    if (dataMapOptions[newDataMap]) {
      if (Array.isArray(dataMapOptions[newDataMap])) {
        // Handle multiple layers for DDS
        dataLayerRef.current = dataMapOptions[newDataMap].map(layerConfig => {
          const layer = L.tileLayer(layerConfig.url, {
            opacity,
            maxZoom: 18,
            maxNativeZoom: 15,
            bounds: L.latLngBounds(layerConfig.bounds)
          });
          
          // Add the layer to the map
          layer.addTo(mapInstanceRef.current);
          
          return layer;
        });
      } else if (newDataMap !== "none") {
        // Handle single layer for other options
        const layerConfig = dataMapOptions[newDataMap];
        dataLayerRef.current = L.tileLayer(layerConfig.url, {
          opacity,
          maxZoom: 18,
          maxNativeZoom: 15,
          bounds: L.latLngBounds(layerConfig.bounds)
        }).addTo(mapInstanceRef.current);
      }
    }

    setCurrentDataMap(newDataMap);
  }, []);


  // Function to initialize markers from an external data source
  const initializeMarkers = useCallback((initialMarkers) => {
    if (!markerLayerRef.current || !mapInstanceRef.current) return;

    // Clear existing markers
    markerLayerRef.current.clearLayers();
    setMarkerData([]);

    if (!Array.isArray(initialMarkers)) {
      console.error("Invalid markers data:", initialMarkers);
      return;
    }

    const newMarkers = initialMarkers.map(({ id, location, commodity }) => {
      if (!id || !location?.lat || !location?.lon) {
        console.error("Invalid marker data:", { id, location, commodity });
        return null;
      }

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

      const marker = L.marker([lat, lon], { icon: L.icon(iconOptions) });
      
      // Add click handler
      marker.on("click", () => {
        if (onClickMarker) {
          onClickMarker({ id });
        }
      });

      // Add marker to layer
      markerLayerRef.current.addLayer(marker);

      return { id, marker, lat, lon, commodity };
    }).filter(Boolean); // Remove null entries

    setMarkerData(newMarkers);
  }, []);

  const appendMarker = useCallback((commodity, id) => {
    if (!mapInstanceRef.current || !markerLayerRef.current) return;

    const markerLocation = getMarkerAddLocation();
    if (!markerLocation) return;

    // Remove the temporary marker
    if (markerAddRef.current && markerAddRef.current._leaflet_id) {
      mapInstanceRef.current.removeLayer(markerAddRef.current);
      markerAddRef.current = null;
    }

    // Add the new permanent marker
    const newMarker = L.marker([markerLocation.lat, markerLocation.lng], {
      icon: L.icon({
        iconUrl: `/marker-${commodity}.png`,
        iconSize: [32, 38],
      }),
    });

    newMarker.on('click', () => {
      if (onClickMarker) {
        onClickMarker({ id });
      }
    });

    markerLayerRef.current.addLayer(newMarker);
    setMarkerData(prev => [...prev, { id, marker: newMarker }]);
  }, []);

  const removeMarker = useCallback((id) => {
    if (!markerLayerRef.current) return;

    setMarkerData((prevMarkers) => {
      const markerIndex = prevMarkers.findIndex((m) => m.id === id);
      if (markerIndex === -1) return prevMarkers;

      const markerToRemove = prevMarkers[markerIndex].marker;
      if (markerToRemove && markerToRemove._leaflet_id) {
        markerLayerRef.current.removeLayer(markerToRemove);
      }

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
    if (mapInstanceRef.current && markerAddRef.current && markerAddRef.current._leaflet_id) {
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