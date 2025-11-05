// components/Map.jsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { LoadingOutlined } from '@ant-design/icons';
import useLeafletMap from "./hooks/useLeafletMap";
import { Compass, Crosshair, Info, Layers, Search, X } from "lucide-react";
import { Drawer, Spin, Modal } from "antd";
import { motion } from "framer-motion";
import { useLoading } from "@/context/loadingContext";
import { useGps } from "@/context/gpsContext";
import { CancleIcon } from "@/components/icon";
import axios from "axios";
import { debounce } from "lodash";

export default function Map({
  event,
  screen,
  gps = true,
  callbackClickMarker,
  callbackCancelMarker,
  callbackPressMap,
  callbackReleaseMap,
  onMapReady,
  showMessage
}) {
  const { showLoading, hideLoading } = useLoading();
  const {
    hasGpsPermission,
    getCurrentPosition
  } = useGps();

  const [zoom, setZoom] = useState(11)
  const [isActiveGPS, setIsActiveGPS] = useState(true)
  const [isGpsPositioning, setIsGpsPositioning] = useState(false)


  const {
    mapContainerRef,
    setCenter,
    setGpsLocation,
    getGpsLocation,
    getMarkerAddLocation,
    setBaseMap,
    setDataMap,
    currentBaseMap,
    currentDataMap,
    appendMarker,
    removeMarker,
    removeMarkerAdd,
    updateMarker,
    initializeMarkers,
  } = useLeafletMap({
    event: event,
    zoom: zoom,
    onClickMarker: callbackClickMarker,
    onCancelMarker: callbackCancelMarker,
    onPressMap: callbackPressMap,
    onReleaseMap: callbackReleaseMap
  });

  // Function to fetch fresh GPS location
  const onGeolocationUpdate = async () => {
    try {
      showLoading("Mohon tunggu ya, Kami sedang mencari lokasi Anda ..");
      setIsGpsPositioning(true);
      
      const newLocation = await getCurrentPosition();
      setGpsLocation(newLocation, 500, 17, () => {
        localStorage.setItem("gps_location", "allowed");
        setIsActiveGPS(true);
        setIsGpsPositioning(false);
        hideLoading();
      });
    } catch (error) {
      console.error("Geolocation error:", error.message);
      localStorage.setItem("gps_location", "not-allowed");
      setIsGpsPositioning(false);
      hideLoading();

      // Show specific error message based on error type
      let errorMessage = "Tidak dapat membaca GPS pada lokasi Anda";
      if (error.code === 3) { // TIMEOUT
        errorMessage = "Tidak dapat membaca GPS pada lokasi Anda - waktu tunggu habis";
      } else if (error.code === 1) { // PERMISSION_DENIED
        errorMessage = "Akses lokasi ditolak. Silakan izinkan akses lokasi";
      } else if (error.code === 2) { // POSITION_UNAVAILABLE
        errorMessage = "Tidak dapat membaca GPS pada lokasi Anda - sinyal tidak tersedia";
      }

      // Show error message to user
      if (typeof showMessage === 'function') {
        showMessage(errorMessage, <CancleIcon />);
      } else {
        alert(errorMessage);
      }

      setIsActiveGPS(false);
    }
  };

  useEffect(() => {
    // add layer to the map
    if (onMapReady) {
      onMapReady({
        appendMarker,
        removeMarker,
        removeMarkerAdd,
        updateMarker,
        getGpsLocation,
        getMarkerAddLocation,
        initializeMarkers,
        onGeolocationUpdate,
      });

      if (hasGpsPermission()) {
        // Add a delay to ensure the map is fully initialized
        // Check if map container exists before attempting GPS positioning
        const checkMapReady = () => {
          if (mapContainerRef.current) {
            onGeolocationUpdate();
          } else {
            // If map not ready, wait a bit longer and check again
            setTimeout(checkMapReady, 200);
          }
        };
        setTimeout(checkMapReady, 100);
      } else {
        setIsActiveGPS(false)
      }
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
    debounce(fetchSearchSuggestions, 300), // Adjust the debounce delay (500ms)
    []
  );

  const handleSelectLocation = (location) => {
    const lat = parseFloat(location.lat);
    const lon = parseFloat(location.lon);

    setCenter([lat, lon], 18); // Move map to selected location
    setSearchSuggestions([]); // Clear suggestions
    setDropdownSearchVisible(false);
  };

  ////////////////////////////////////////////////////////////////
  //// MAP INFORMATION
  const [isLegendOpen, setIsLegendOpen] = useState(false);
  const [transparencyLevel, setTransparencyLevel] = useState(50);
  const transparencyOptions = [0, 25, 50, 75, 100];


  const onInformationOpen = () => {
    setIsLegendOpen(true)
  }
  const onCloseInformation = () => {
    setIsLegendOpen(false)
  }

  useEffect(() => {
    setDataMap(currentDataMap, transparencyLevel / 100)
  }, [transparencyLevel])

  return (
    <div>

      <div ref={mapContainerRef} style={{ height: "100dvh", width: "100%" }} />

      <div
        style={{
          position: 'absolute',
          top: '10px',
          zIndex: 9991,
        }}
        className="w-screen"
      >
        {event != "survey" && (
          <div className="bg-white rounded-lg mx-3 py-1 px-3 mb-3 flex text-black cursor-pointer border border-gray-200 items-center">
            <div className="flex mr-2"><Search size={16} /></div>
            <div className="flex flex-auto">
              <input
                type="text"
                style={{ width: '100%', height: '35px' }}
                className="text-sm focus:border-transparent focus:ring-0 focus:outline-none"
                placeholder="Cari Lokasi"
                onChange={(e) => {
                  debouncedFetchSearchSuggestions(e.target.value);
                }}
                onFocus={() => {
                  setDropdownSearchVisible(true)
                }}
                onBlur={() => {
                  setTimeout(() => {
                    setDropdownSearchVisible(false)
                  }, 300)
                }}
              />
            </div>
          </div>
        )}

        {event != "survey" && isDropdownSearchVisible && searchSuggestions.length > 0 && (
          <div className="px-3 absolute w-screen" style={{ zIndex: 9991 }}>
            <div className="bg-white border border-gray-200 rounded-lg shadow-md w-full max-h-60 overflow-y-auto ">
              {searchSuggestions.map((location) => (
                <div
                  key={location.place_id}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                  onClick={() => handleSelectLocation(location)}
                >
                  {location.display_name}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={"absolute right-3 " + (event == "summary" ? "top-[120px]" : "")} style={{ zIndex: -1 }}>
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
          <div
            className="bg-white rounded-full p-3 text-gray shadow-lg inline-block mb-1 cursor-pointer"
            onClick={onInformationOpen}
          >
            <Info size={22} />
          </div>
        </div>
      </div>

      <Drawer
        placement="bottom"
        closeIcon={false}
        onClose={onCloseSelectMap}
        open={isSelectMapOpen}
        zIndex={99999999}
        height={300}
        className="drawer-body-modified"
      >
        <div className="font-semibold text-black px-5 py-3 text-base">
          Atur Peta
        </div>
        <div className="text-gray-500 text-xs px-5 font-medium">
          Jenis Peta
        </div>
        <div className="py-3 text-center w-full flex justify-around px-5">
          <div style={{ width: '70px' }} className="rounded text-center mx-2 cursor-pointer"
            onClick={() => {
              setBaseMap("road")
              setIsSelectMapOpen(false)
            }}
          >
            <img src="/base-road.png"
              className={`icon-basemap ml-auto mr-auto 
                ${currentBaseMap == "road" ? "border border-blue" : ""
                }`}
            ></img>
            <div className="font-semibold text-xs mt-1.5">
              Default
            </div>
          </div>
          <div style={{ width: '70px' }} className="rounded text-center mx-2 cursor-pointer"
            onClick={() => {
              setBaseMap("hybrid")
              setIsSelectMapOpen(false)
            }}
          >
            <img src="/base-sattelite.png"
              className={`icon-basemap ml-auto mr-auto 
                ${currentBaseMap == "hybrid" ? "border border-blue" : ""
                }`}
            ></img>
            <div className="font-semibold text-xs mt-1.5">
              Sattelite
            </div>
          </div>
          <div style={{ width: '70px' }} className="rounded text-center mx-2 cursor-pointer"
            onClick={() => {
              setBaseMap("terrain")
              setIsSelectMapOpen(false)
            }}
          >
            <img src="/base-terrain.png"
              className={`icon-basemap ml-auto mr-auto 
                ${currentBaseMap == "terrain" ? "border border-blue" : ""
                }`}
            ></img>
            <div className="font-semibold text-xs mt-1.5">
              Terrain
            </div>
          </div>
        </div>

        <div className="text-gray-500 text-xs px-5 font-medium">
          Model Data
        </div>
        <div className="py-3 text-center w-full flex justify-around px-5">
          <div style={{ width: '70px' }} className="rounded text-center mx-2 cursor-pointer"
            onClick={() => {
              setDataMap("none", transparencyLevel / 100)
              setIsSelectMapOpen(false)
            }}
          >
            <img src="/model-null.png"
              className={`icon-basemap ml-auto mr-auto 
                ${currentDataMap == "none" ? "border border-blue" : ""
                }`}
            ></img>
            <div className="font-semibold text-xs mt-1.5">
              Kosong
            </div>
          </div>
          <div style={{ width: '70px' }} className="rounded text-center mx-2 cursor-pointer"
            onClick={() => {
              setDataMap("dds", transparencyLevel / 100)
              setIsSelectMapOpen(false)
            }}
          >
            <img src="/model-icon.png"
              className={`icon-basemap ml-auto mr-auto 
                ${currentDataMap == "dds" ? "border border-blue" : ""
                }`}
            ></img>
            <div className="font-semibold text-xs mt-1.5">
              Model DDS
            </div>
          </div>

          <div style={{ width: '70px' }} className="rounded text-center mx-2 cursor-pointer"
            onClick={() => {
              setDataMap("ifri", transparencyLevel / 100)
              setIsSelectMapOpen(false)
            }}
          >
            <img src="/model-icon.png"
              className={`icon-basemap ml-auto mr-auto 
                ${currentDataMap == "ifri" ? "border border-blue" : ""
                }`}
            ></img>
            <div className="font-semibold text-xs mt-1.5">
              Model IFRI
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
          {!hasGpsPermission() ? "Izinkan Akses Lokasi" : "Akses Lokasi Diperlukan"}
        </h2>
        <p className="text-sm text-center text-gray-500 mt-3 mb-3 leading-5">
          {!hasGpsPermission()
            ? "Kami memerlukan akses lokasi Anda untuk mendapatkan lokasi yang akurat untuk mendukung layanan dan fungsi aplikasi"
            : "Lokasi tidak dapat diakses. Pastikan GPS aktif dan izinkan akses lokasi untuk melanjutkan."
          }
        </p>

        <button
          className={`py-3 w-full rounded font-semibold text-white mt-3 ${isGpsPositioning ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue'
            }`}
          onClick={isGpsPositioning ? undefined : onGeolocationUpdate}
          disabled={isGpsPositioning}
        >
          {isGpsPositioning
            ? "Mencari lokasi..."
            : (!hasGpsPermission() ? "Ya, Izinkan" : "Coba Lagi")
          }
        </button>
      </Modal>

      <Drawer
        closeIcon={false}
        open={isLegendOpen}
        zIndex={9999999}
        placement="bottom"
        className="drawer-body-modified rounded-xl"
        height={350}
        onClose={onCloseInformation}
      >
        <div className="flex justify-between items-center pt-3 px-3">
          <div>
            <h1 className="text-base font-semibold text-black">Informasi Peta</h1>
          </div>
          <h1 className="text-lg font-semibold text-black"
            onClick={onCloseInformation}
          >
            <X />
          </h1>
        </div>

        {isLegendOpen && (
          <div className="px-3 mt-3">
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-2 font-medium">Tingkat Transparansi Peta</p>
              <div className="flex items-center justify-between gap-2">
                {transparencyOptions.map((level) => (
                  <button
                    key={level}
                    onClick={() => { setTransparencyLevel(level); setIsLegendOpen(false) }}
                    className={`px-3 py-1.5 text-xs font-medium rounded ${transparencyLevel === level ? 'bg-blue text-white' : 'border border-gray-300 text-gray'
                      }`}
                  >
                    {level}%
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="grid grid-cols-2 gap-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs text-gray-500 font-medium">Legend Peta</h4>
                </div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs text-gray-500 font-medium">Penanda</h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-800 rounded"></span>
                  <span className="text-sm">Padi</span>
                </div>
                <div className="flex items-center gap-2">
                  <img src="/marker-padi.png" className="w-6 h-7" />
                  <span className="text-sm">Padi</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-yellow-700 rounded"></span>
                  <span className="text-sm">Jagung</span>
                </div>
                <div className="flex items-center gap-2">
                  <img src="/marker-jagung.png" className="w-6 h-7" />
                  <span className="text-sm">Jagung</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-teal-700 rounded"></span>
                  <span className="text-sm">Tebu</span>
                </div>
                <div className="flex items-center gap-2">
                  <img src="/marker-tebu.png" className="w-6 h-7" />
                  <span className="text-sm">Tebu</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-gray-200 rounded"></span>
                  <span className="text-sm">Komoditas lain</span>
                </div>
                <div className="flex items-center gap-2">
                  <img src="/marker-other.png" className="w-6 h-7" />
                  <span className="text-sm">Komoditas lain</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </Drawer>

    </div>
  );
}

