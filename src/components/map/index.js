// components/Map.jsx
"use client";

import { useEffect, useState } from "react";
import { LoadingOutlined } from '@ant-design/icons';
import useLeafletMap from "./hooks/useLeafletMap";
import { Compass, Crosshair, Layers, Search } from "lucide-react";
import { Drawer, Spin } from "antd";

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
    setBaseMap
  } = useLeafletMap({
    event:event,
    zoom: zoom,
    onClickMarker: callbackClickMarker,
    onCancelMarker: callbackCancelMarker,
    onPressMap: callbackPressMap,
    onReleaseMap: callbackReleaseMap
  });

  const onGeolocationUpdate = () => {
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


  /////////////////////////////////////////////////////////////////////////////////////////////
  /// BASEMAP DRAWER FUNCTIONS

  const [isSelectMapOpen, setIsSelectMapOpen] = useState(false);
  const onShowSelectMap = () => {
    setIsSelectMapOpen(true)
  };
  const onCloseSelectMap = () => {
    setIsSelectMapOpen(false)
  };


  return (
    <div>

      <div ref={mapContainerRef} style={{ height: "100dvh", width: "100%" }} />

      <div
        style={{
          position: 'absolute',
          top: '20px',
          zIndex: 9999,
        }}
        className="w-screen"
      >
        {event == "view" && (
          <div className="bg-white rounded mx-5 p-3 mb-5 flex text-black shadow-lg cursor-pointer">
            <div className="flex w-8"><Search style={{ top: '2px', position: 'relative' }} size={20} /></div>
            <div className="flex flex-auto"><input type="text" style={{ width: '100%' }} placeholder="Cari Lokasi" /></div>
          </div>
        )}

        <div className="float-right mr-5">
          <div
            className="bg-white rounded-full p-3 text-gray shadow-lg inline-block mb-1 cursor-pointer"
            onClick={onShowSelectMap}
          >
            <Layers size={22} />
          </div>
          <br></br>
          <div
            className="bg-white rounded-full p-3 text-gray shadow-lg inline-block mb-1 cursor-pointer"
            onClick={onGeolocationUpdate}
          >
            <Crosshair size={22} />
          </div>
          <br></br>
          {/* <div
            className="bg-white rounded-full p-3 text-gray shadow-lg inline-block mb-1 cursor-pointer"
          >
            <Compass size={22} />
          </div> */}
        </div>
      </div>

      <Drawer
        title="Ubah Jenis Peta"
        placement="bottom"
        onClose={onCloseSelectMap}
        open={isSelectMapOpen}
        zIndex={99991}
        height={180}
        className="drawer-body-modified"
      >
        <div className="py-3 text-center w-full flex justify-around px-5">
          <div style={{ width: '70px' }} className="rounded text-center mx-2 cursor-pointer"
            onClick={()=>{
              setBaseMap("road")
            }}
          >
            <img src="/base-road.png" className="icon-basemap ml-auto mr-auto"></img>
            <div className="font-semibold text-sm mt-1.5">
              Default
            </div>
          </div>
          <div style={{ width: '70px' }} className="rounded text-center mx-2 cursor-pointer"
            onClick={()=>{
              setBaseMap("hybrid")
            }}
          >
            <img src="/base-sattelite.png" className="icon-basemap ml-auto mr-auto"></img>
            <div className="font-semibold text-sm mt-1.5">
              Sattelite
            </div>
          </div>
          <div style={{ width: '70px' }} className="rounded text-center mx-2 cursor-pointer"
            onClick={()=>{
              setBaseMap("terrain")
            }}
          >
            <img src="/base-terrain.png" className="icon-basemap ml-auto mr-auto"></img>
            <div className="font-semibold text-sm mt-1.5">
              Terrain
            </div>
          </div>
        </div>
      </Drawer>
    </div>
  );
}

