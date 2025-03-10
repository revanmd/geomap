import { useEffect, useRef, useCallback, useState } from "react";
import L, { marker } from "leaflet";
import "leaflet-rotate";
import "leaflet/dist/leaflet.css";
import { IsPointInRadius } from "../helper";
import { useMessage } from "@/context/messageContext";
import { CancleIcon } from "@/components/icon";

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

  const [markerData, setMarkerData] = useState([]); // State to track all markers

  const [currentBaseMap, setCurrentBaseMap] = useState("road");

  const baseMapOptions = {
    road: "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
    hybrid: "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
    terrain: "https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}",
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
      instance.current.on("contextmenu", (event) => {
        const { lat, lng } = event.latlng;
        //mapInstanceRef.current.setView(event.latlng);

        if (GPSCenterRef.current && eventRef.current == "survey") {
          if (IsPointInRadius(lat, lng, GPSCenterRef.current.lat, GPSCenterRef.current.lng, 100)) {
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
          } else {
            showMessage(
              "Titik yang dipilih berada di luar radius area Anda. Silakan pilih titik di dalam area atau dekati lokasi komoditas",
              <CancleIcon />
            )
            mapInstanceRef.current.setView(event.latlng);
            MarkerCenterRef
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


  const setGpsLocation = useCallback((center, radius = 100, zoom = 20) => {
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
    if (baseMapOptions[newBaseMap]) {
      setCurrentBaseMap(newBaseMap);
    }
  }, []);

  // Function to initialize markers from an external data source
  const initializeMarkers = useCallback((initialMarkers) => {
    if (!markerLayerRef.current || !mapInstanceRef.current) return;

    // Clear existing markers
    markerLayerRef.current.clearLayers();
    setMarkerData([]); // Reset state

    const newMarkers = initialMarkers.map((markerInfo) => {
      console.log(markerInfo)

      const { location, commodity } = markerInfo;
      const { lat, lon } = location
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

      const marker = L.marker([lat, lon], {
        icon: L.icon(iconOptions),
      }).addTo(markerLayerRef.current);

      return { marker, lat, lon, commodity };
    });

    setMarkerData(newMarkers);
  }, []);

  // Function to append a new marker while keeping data consistent
  const appendMarker = useCallback((type) => {
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

    setMarkerData((prevMarkers) => [
      ...prevMarkers,
      { marker: newMarker, lat, lng, type },
    ]);

    if (markerAddRef.current) {
      mapInstanceRef.current.removeLayer(markerAddRef.current);
    }

    return newMarker;
  }, []);

  // Function to remove a specific marker
  const removeMarker = useCallback((marker) => {
    if (!markerLayerRef.current || !marker) return;

    markerLayerRef.current.removeLayer(marker);

    setMarkerData((prevMarkers) =>
      prevMarkers.filter((m) => m.marker !== marker)
    );
  }, []);

  return {
    mapContainerRef,
    setCenter,
    addLayer,
    removeLayer,
    setGpsLocation,
    getGpsLocation,
    getMarkerAddLocation,
    setBaseMap,
    appendMarker,
    removeMarker,
    initializeMarkers,
    markerData,
  };
}