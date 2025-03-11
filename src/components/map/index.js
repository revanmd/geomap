// components/Map.jsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { LoadingOutlined } from '@ant-design/icons';
import useLeafletMap from "./hooks/useLeafletMap";
import { Compass, Crosshair, Layers, Search } from "lucide-react";
import { Drawer, Spin, Modal } from "antd";
import { motion } from "framer-motion";
import { useLoading } from "@/context/loadingContext";
import axios from "axios";
import { debounce } from "lodash";

export default function Map({
  event,
  screen,
  gps = true,
  expandedBar = false,
  callbackClickMarker,
  callbackCancelMarker,
  callbackPressMap,
  callbackReleaseMap,
  onMapReady
}) {
  const { showLoading, hideLoading } = useLoading();

  const [zoom, setZoom] = useState(11)
  const [isActiveGPS, setIsActiveGPS] = useState(!gps)

  const {
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
  } = useLeafletMap({
    event: event,
    zoom: zoom,
    onClickMarker: callbackClickMarker,
    onCancelMarker: callbackCancelMarker,
    onPressMap: callbackPressMap,
    onReleaseMap: callbackReleaseMap
  });

  const onGeolocationUpdate = () => {
    showLoading("Mohon tunggu ya . . <br /> Kami sedang mencari lokasi Anda");
    setIsActiveGPS(true)
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }, 100, 20);
          setIsActiveGPS(true)
        },
        (error) => {
          alert(error.message);
          setIsActiveGPS(false)
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
      setIsActiveGPS(false)
    }
    hideLoading()
  }

  useEffect(() => {
    // add layer to the map
    // addLayer('https://tile.digitalisasi-pi.com/data/merged_output_jatim_rgb/{z}/{x}/{y}.png')
    if (onMapReady) {
      onMapReady({
        appendMarker,
        removeMarker,
        getGpsLocation,
        getMarkerAddLocation,
        initializeMarkers,
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

  ///////////////////////////////////////////////////////////////////////////////////////////
  /// SEARCH FUNCTIONALITY
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [isDropdownSearchVisible, setDropdownSearchVisible] = useState(false);


  const fetchSearchSuggestions = async (input) => {
    if (!input) {
      setSearchSuggestions([]);
      return;
    }
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search`,
        {
          params: {
            q: input,
            format: "json",
            addressdetails: 1,
            limit: 5, // Limit results to 5 locations
          },
        }
      );

      setSearchSuggestions(response.data);
      setDropdownSearchVisible(true);
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  }

  const debouncedFetchSearchSuggestions = useCallback(
    debounce(fetchSearchSuggestions, 500), // Adjust the debounce delay (500ms)
    []
  );

  const handleSelectLocation = (location) => {
    const lat = parseFloat(location.lat);
    const lon = parseFloat(location.lon);

    setCenter([lat, lon]); // Move map to selected location
    setSearchQuery(location.display_name); // Update input field with selected location
    setSearchSuggestions([]); // Clear suggestions
    setDropdownSearchVisible(false);
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
          <div className="bg-white rounded-lg mx-3 py-1 px-3 mb-3 flex text-black cursor-pointer border border-gray-200 items-center">
            <div className="flex mr-2"><Search size={16} /></div>
            <div className="flex flex-auto">
              <input
                type="text"
                style={{ width: '100%', height: '35px' }}
                className="text-sm"
                placeholder="Cari Lokasi"
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  debouncedFetchSearchSuggestions(e.target.value);
                }}
                onFocus={()=>{
                  setDropdownSearchVisible(true)
                }}
                onBlur={() => {
                  setTimeout(()=>{
                    setDropdownSearchVisible(false)
                  },500)
                }}
              />
            </div>
          </div>
        )}

        {event == "view" && isDropdownSearchVisible && searchSuggestions.length > 0 && (
          <div className="mx-3">
            <div className="bg-white border border-gray-200 rounded-lg shadow-md w-full max-h-60 overflow-y-auto ">
              {searchSuggestions.map((location) => (
                <div
                  key={location.place_id}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-xs"
                  onClick={() => handleSelectLocation(location)}
                >
                  {location.display_name}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={"absolute right-3 " + (expandedBar ? "top-[125px]" : "")}>
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
        </div>
      </div>

      <Drawer
        title="Ubah Jenis Peta"
        placement="bottom"
        closeIcon={false}
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
        <h2 className="text-base text-black text-center font-semibold">
          Izinkan Akses Lokasi
        </h2>
        <p className="text-xs text-center mt-3 mb-3 leading-5">
          Kami memerlukan akses lokasi Anda untuk mendapatkan lokasi yang akurat untuk mendukung layanan dan fungsi aplikasi
        </p>

        <button
          className={`py-3 w-full rounded font-semibold text-white mt-3 bg-blue`}
          onClick={onGeolocationUpdate}
        >
          Ya, Izinkan
        </button>
      </Modal>

    </div>
  );
}

