// components/Map.jsx
"use client";

import { useEffect, useState } from "react";
import { LoadingOutlined } from '@ant-design/icons';
import useLeafletMap from "./hooks/useLeafletMap";
import { Compass, Crosshair, Layers, Search } from "lucide-react";
import { Drawer, Spin, Modal } from "antd";
import { motion } from "framer-motion";

export default function Map({
  event,
  screen,
  callbackClickMarker,
  callbackCancelMarker,
  callbackPressMap,
  callbackReleaseMap,
  onMapReady
}) {
  const [zoom, setZoom] = useState(11)
  const [isActiveGPS, setIsActiveGPS] = useState(false)
  const [loadingGPS, setLoadingGPS] = useState(false)

  const {
    mapContainerRef,
    setCenter,
    addLayer,
    removeLayer,
    setGpsLocation,
    setBaseMap,
    appendMarker,
    removeMarker,
  } = useLeafletMap({
    event: event,
    zoom: zoom,
    onClickMarker: callbackClickMarker,
    onCancelMarker: callbackCancelMarker,
    onPressMap: callbackPressMap,
    onReleaseMap: callbackReleaseMap
  });

  const onGeolocationUpdate = () => {
    setLoadingGPS(true)
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }, 100, 20);
          setIsActiveGPS(true)
          setLoadingGPS(false)
        },
        (error) => {
          alert(error.message);
          setLoadingGPS(false)
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
      setLoadingGPS(false)
    }
  }

  useEffect(() => {
    // add layer to the map
    // addLayer('https://tile.digitalisasi-pi.com/data/merged_output_jatim_rgb/{z}/{x}/{y}.png')
    if (onMapReady) {
      onMapReady({
        appendMarker,
        removeMarker,
      });
    }
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
          <div className="bg-white rounded-lg mx-5 py-2 px-3 mb-3 flex text-black shadow-sm cursor-pointer">
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
            onClick={() => {
              setBaseMap("road")
            }}
          >
            <img src="/base-road.png" className="icon-basemap ml-auto mr-auto"></img>
            <div className="font-semibold text-xs mt-1.5">
              Default
            </div>
          </div>
          <div style={{ width: '70px' }} className="rounded text-center mx-2 cursor-pointer"
            onClick={() => {
              setBaseMap("hybrid")
            }}
          >
            <img src="/base-sattelite.png" className="icon-basemap ml-auto mr-auto"></img>
            <div className="font-semibold text-xs mt-1.5">
              Sattelite
            </div>
          </div>
          <div style={{ width: '70px' }} className="rounded text-center mx-2 cursor-pointer"
            onClick={() => {
              setBaseMap("terrain")
            }}
          >
            <img src="/base-terrain.png" className="icon-basemap ml-auto mr-auto"></img>
            <div className="font-semibold text-xs mt-1.5">
              Terrain
            </div>
          </div>
        </div>
      </Drawer>


      <Modal
        footer={false}
        open={!isActiveGPS}
        zIndex={9999999}
        centered
        closeIcon={false}
        className="modal-margin"
      >
        <h2 className="text-lg text-black text-center font-semibold">
          Izinkan Akses Lokasi
        </h2>
        <p className="text-sm text-center mt-3 mb-3 leading-5">
          Kami memerlukan akses lokasi Anda untuk mendapatkan lokasi yang akurat untuk mendukung layanan dan fungsi aplikasi
        </p>

        <button
          className={`py-3 w-full rounded font-semibold text-white mt-3 bg-blue`}
          onClick={onGeolocationUpdate}
        >
          Ya, Izinkan
        </button>
      </Modal>

      {
        loadingGPS && (
          <motion.div
            className="loading-container text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <Spin indicator={<LoadingOutlined style={{ fontSize: 48, color: "white" }} spin />} />
              <div className="text-xs text-white mt-3" style={{ lineHeight: "18px" }}>
                Mohon tunggu ya . . <br />
                Kami sedang mencari lokasi Anda
              </div>
            </div>
          </motion.div>
        )
      }


    </div>
  );
}

