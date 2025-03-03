// components/Map.jsx
"use client";

import { useEffect, useState } from "react";
import useLeafletMap from "./hooks/useLeafletMap";
import { Compass, Crosshair, Layers, Search } from "lucide-react";

export default function Map({
  event,
  screen,
  callbackClickMarker,
  callbackCancelMarker,
  callbackPressMap,
  callbackReleaseMap,
}) {
  const [zoom, setZoom] = useState(11)

  const {
    mapContainerRef,
    setCenter,
    addLayer,
    removeLayer,
    drawMarkers,
    filterMarkers,
    setGpsLocation,
  } = useLeafletMap({
    zoom: zoom,
    tileLayerUrl: "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
    onClickMarker: callbackClickMarker,
    onCancelMarker: callbackCancelMarker,
    onPressMap: callbackPressMap,
    onReleaseMap: callbackReleaseMap
  });

  const handleGPS = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }, 100, 20);
        },
        (error) => {
          alert(error.message);
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  }

  useEffect(() => {
    // add layer to the map
    // addLayer('https://tile.digitalisasi-pi.com/data/merged_output_jatim_rgb/{z}/{x}/{y}.png')
  }, [])

  return (
    <div>
      <div ref={mapContainerRef} style={{ height: "100vh", width: "100%" }} />

      <div
        style={{
          position: 'absolute',
          top: '20px',
          zIndex: 9999,
        }}
        className="w-screen"
      >
        {event == "view" && (
          <div className="bg-white rounded mx-5 p-3 mb-5 flex text-black shadow-sm cursor-pointer">
            <div className="flex w-8"><Search style={{ top: '2px', position: 'relative' }} size={20} /></div>
            <div className="flex flex-auto"><input type="text" style={{ width: '100%' }} /></div>
          </div>
        )}

        <div className="float-right mr-5">
          <div className="bg-white rounded-full p-3 text-gray shadow-sm inline-block mb-1 cursor-pointer">
            <Layers size={22} />
          </div>
          <br></br>
          <div className="bg-white rounded-full p-3 text-gray shadow-sm inline-block mb-1 cursor-pointer">
            <Crosshair onClick={handleGPS} size={22} />
          </div>
          <br></br>
          <div className="bg-white rounded-full p-3 text-gray shadow-sm inline-block mb-1 cursor-pointer">
            <Compass size={22} />
          </div>
        </div>
      </div>
    </div>



  );
}

