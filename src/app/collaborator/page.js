"use client"

import { Map, SquareMenu, CircleUserRound, ArrowLeft, X, Camera, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Webcam from "react-webcam";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { DatePicker, Drawer, Form, Input, Modal, Select } from "antd";
import { useMessage } from "@/context/messageContext";
import { useUser } from "@/context/userContext";
import { CancleIcon, ChecklistIcon, InfoIcon } from "@/components/icon";
import { markerService } from "@/services/markerService";
import { useLoading } from "@/context/loadingContext";
import { fileService } from "@/services/fileService";
import { CapitalizeFirstLetter, ConvertCommodityTypeToIndonesianCommodity, ConvertDateMonthToIndonesianMonth, ConvertIsoToIndonesianDate } from "@/utility/utils";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";

// Custom hooks
import useMapInteraction from "@/hooks/useMapInteraction";

// Components
import CameraCapture from "@/components/collaborator/CameraCapture";
import CommoditySelector from "@/components/collaborator/CommoditySelector";
import PlantingHistoryForm from "@/components/collaborator/PlantingHistoryForm";
import MarkerDetail from "@/components/collaborator/MarkerDetail";
import SummaryStats from "@/components/collaborator/SummaryStats";
import NavigationBar from "@/components/collaborator/NavigationBar";
import SurveyDrawer from "@/components/collaborator/SurveyDrawer";

// Dynamic Import Component
const MapComponent = dynamic(() => import("@/components/map"), {
    ssr: false,
});

export default function Collaborator() {
    const router = useRouter()

    ////////////////////////////////
    // CONTEXT
    const { showMessage } = useMessage()
    const { showLoading, hideLoading } = useLoading();
    const { username, userType } = useUser();

    // Custom hooks
    const mapInteraction = useMapInteraction()

    ////////////////////////////////
    // PROPS DRILLDOWN
    const [mapFunctions, setMapFunctions] = useState(null)
    const handleMapReady = (mapRefs) => {
        setMapFunctions(mapRefs)
    }

    // form-filling, detail, tagging
    const [event, setEvent] = useState('view')
    const [surveyStep, setSurveyStep] = useState(0)
    const [screen, setScreen] = useState('minimize')

    const callbackPressMap = () => {
        resetSurvey()
        setSurveyStep(1)
    }

    const callbackClickMarker = (params) => {
        setEvent("view")
        fetchMarkerDetail(params?.id)
    }

    const clickedAddMarker = () => {
        mapFunctions.onGeolocationUpdate()
        setEvent('survey')
    }


    ////////////////////////////////////////////////////////////////
    //// DETAIL MARKER
    const [isDetailOpen, setIsDetailOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)

    const [markerDetail, setMarkerDetail] = useState(null)
    const [uploadedImage, setUploadedImage] = useState("")

    // Fetch and display uploaded image
    const fetchImage = async (filename) => {
        try {
            const blob = await fileService.getFile(filename);
            const url = URL.createObjectURL(blob);
            setUploadedImage(url);
        } catch (error) {
            console.error("Failed to fetch image:", error);
        }
    };

    const fetchMarkerDetail = async (markerId) => {
        showLoading("Mohon tunggu ...")
        try {
            const marker = await markerService.getMarkerById(markerId)
            await fetchImage(marker?.data?.photo)
            setMarkerDetail(marker?.data)
            setSurveyCommodity(marker?.data.commodity)
            setSurveyHST(marker?.data.hst)
            setDataHistory(marker?.data.planting_history)
            setIsDetailOpen(true)
        } catch (error) {
        } finally {
            hideLoading()
        }
    }

    const onCloseDetail = () => {
        setIsDetailOpen(false)
    }

    const onEditDetail = () => {
        setIsDetailOpen(false)
        setIsEditOpen(true)
    }
    const onDeleteDetail = () => {
        setIsDeleteOpen(true)
    }

    const onCloseEdit = () => {
        setIsEditOpen(false)
        setIsDetailOpen(true)
        // Clear captured image when closing edit without saving
        setCapturedImage("")
    }

    const handleEditPhoto = () => {
        setIsEditOpen(false)
        setIsWebcamActive(true)
    }

    const handleFinishEdit = async () => {
        // Prevent multiple submissions
        if (isSubmitting) return;

        if (userType === "agronomist" && !surveyHST) {
            showMessage("HST wajib diisi untuk Agronomist", <CancleIcon />)
            return;
        }

        setIsSubmitting(true);
        showLoading("Mohon tunggu ...")
        
        try {
            let filename = markerDetail.photo
            if (capturedImage != "") {
                filename = await uploadFile(capturedImage, `${surveyCommodity}.png`)
            }

            if (filename) {
                const marker = {
                    photo: filename,
                    commodity: surveyCommodity,
                    location: {
                        lat: markerDetail?.location?.lat,
                        lon: markerDetail?.location?.lon
                    },
                    hst: parseInt(surveyHST) || 0,
                    planting_history: dataHistory
                }

                // Update marker
                const response = await markerService.updateMarker(markerDetail?.id, marker);

                // Update the marker detail with new data
                setMarkerDetail(response?.data);

                // Flagging as success
                mapFunctions.updateMarker(response?.data?.id, [markerDetail?.location?.lat, markerDetail?.location?.lon], surveyCommodity)
                showMessage("Komoditas berhasil diubah", <ChecklistIcon />)

                // Close edit and return to detail view
                setIsEditOpen(false)
                setIsDetailOpen(true)
                
                // Clear captured image but keep other data for detail view
                setCapturedImage("")
            } else {
                showMessage("Gagal mengupload foto", <CancleIcon />)
            }

            if (event == "summary") {
                mapInteraction.fetchSelfMarkers()
            }

        } catch (error) {
            console.log(error)
            showMessage("Gagal menambahkan komoditas", <CancleIcon />)
        } finally {
            setIsSubmitting(false);
            hideLoading()
        }
    }

    const handleCancelDelete = () => {
        setIsDeleteOpen(false)
    }
    const handleConfirmDelete = async () => {
        showLoading("Mohon tunggu...")
        setIsDeleteOpen(false)
        try {
            await markerService.deleteMarker(markerDetail?.id);
            mapFunctions.removeMarker(markerDetail?.id)
            if (event == "summary") {
                mapInteraction.fetchSelfMarkers()
            }

            showMessage("Berhasil menghapus komoditas", <ChecklistIcon />, event)

        } catch (error) {
            console.log(error)
            showMessage("Gagal menghapus komoditas", <CancleIcon />, event)
        }
        hideLoading()


        setIsEditOpen(false)
        setIsDetailOpen(false)
    }

    ////////////////////////////////////////////////////////////////
    //// SURVEY

    const [surveyCommodity, setSurveyCommodity] = useState("")
    const [surveyHST, setSurveyHST] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    ////////////////////////////////////////////////////////////////
    /// HISTORY TANAM

    const [isHistoryOpen, setIsHistoryOpen] = useState(false)
    const [dataHistory, setDataHistory] = useState()

    ////////////////////////////////////////////////////////////////
    //// WEBCAM

    const [isWebcamActive, setIsWebcamActive] = useState(false)
    const webcamRef = useRef(null)
    const [capturedImage, setCapturedImage] = useState("");

    ////////////////////////////////
    /// SUMMARY

    const [summary, setSummary] = useState(null)

    ////////////////////////////////////////////////////////////////
    //// LEADERBOARD
    const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false)

    const clickedCommodity = (commodityType) => {
        setSurveyCommodity(commodityType)
    }

    const handleBackSurvey = () => {
        if (event == "survey" && surveyStep == 0) {
            setEvent('view')
            resetSurvey()
        } else if (event == "survey" && surveyStep == 1) {
            setSurveyStep(0)
            resetSurvey()
        } else if (event == "survey" && surveyStep == 2) {
            setSurveyStep(1)
            setCapturedImage("")
            setIsWebcamActive(false)
        }
    }

    const handleSurveyPhoto = () => {
        setSurveyStep(2)
        setIsWebcamActive(true)
    }

    const onChangeHST = (event) => {
        setSurveyHST(event?.target?.value)
    }

    const resetSurvey = () => {
        if (event == "survey") {
            mapFunctions?.removeMarkerAdd()
        }
        setDataHistory()
        setSurveyHST("")
        setSurveyCommodity("")
        setSurveyStep(0)
        setCapturedImage("")
        setIsSubmitting(false)
    }

    const finishSurvey = async () => {
        // Prevent multiple submissions
        if (isSubmitting) return;

        setIsSubmitting(true);
        showLoading("Mohon tunggu ...")
        
        try {
            const filename = await uploadFile(capturedImage, `${surveyCommodity}.png`)
            if (filename) {
                // Prepare marker
                const markerLocation = mapFunctions.getMarkerAddLocation()
                const marker = {
                    photo: filename,
                    commodity: surveyCommodity,
                    location: {
                        lat: markerLocation.lat,
                        lon: markerLocation.lng
                    },
                    hst: parseInt(surveyHST) || 0,
                    planting_history: dataHistory
                }

                // Create marker
                const response = await markerService.createMarker(marker);

                // Flagging as success
                mapFunctions.appendMarker(surveyCommodity, response?.data?.id)
                showMessage("Komoditas berhasil ditambah", <ChecklistIcon />)
            } else {
                showMessage("Gagal mengupload foto", <CancleIcon />)
            }

        } catch (error) {
            console.log(error)
            showMessage("Gagal menambahkan komoditas", <CancleIcon />)
        } finally {
            resetSurvey()
            setEvent("view")
            setIsSubmitting(false);
            hideLoading()
        }
    }

    const handleKeyPress = (e) => {
        // Prevent anything that's not a digit
        if (!/^\d$/.test(e.key)) {
            e.preventDefault();
        }
    };

    ////////////////////////////////////////////////////////////////
    //// WEBCAM

    const captureWebcam = useCallback(() => {
        if (webcamRef.current) {
            const imageSrc = webcamRef.current.getScreenshot();
            setCapturedImage(imageSrc);
        }
    }, [webcamRef]);
    const videoConstraints = {
        width: { ideal: 1280 }, // HD resolution is usually supported
        height: { ideal: 720 },
        facingMode: "environment"
    };

    const handleWebcamCaptured = () => {
        setUploadedImage(capturedImage)
        setIsWebcamActive(false);
        if (event == "survey") {
            setSurveyStep(1)
        } else {
            setIsEditOpen(true)
        }
    }

    ////////////////////////////////
    /// SUMMARY

    const fetchSummary = async () => {
        try {
            const summary = await markerService.summary()
            console.log(summary)
            setSummary(summary.data)
        } catch (error) {

        }
    }


    ////////////////////////////////////////////////////////////////
    /// DATA
    const fetchMarker = async () => {
        try {
            const markers = await markerService.getMarkers()
            if (markers.data && mapFunctions) {
                mapFunctions.initializeMarkers(markers.data)
            }
        } catch (error) {
            console.log(error)
        }
    }

    const fetchSelfMarker = async () => {
        try {
            const summary = await markerService.summary()
            if (summary.data) {
                setSummary(summary.data)
            }

            const markers = await markerService.getSelfMarkers()
            if (markers.data && mapFunctions) {
                mapFunctions.initializeMarkers(markers.data)
            }
        } catch (error) {
            console.log(error)
        }
    }

    const uploadFile = async (base64Image, filename) => {
        try {
            const response = await fileService.uploadFile(base64Image, filename)
            return response.data.filename
        } catch (error) {
            return null
        }
    }

    ////////////////////////////////////////////////////////////////
    //// CALLBACK FUNCTIONS WITH DEBOUNCE PROTECTION

    // Handle submit with debounce protection
    const handleFinishSurvey = useCallback(() => {
        if (isSubmitting) return;
        finishSurvey();
    }, [isSubmitting, userType, surveyHST, capturedImage, surveyCommodity, dataHistory, mapFunctions]);

    // Handle edit submit with debounce protection
    const handleFinishEditWithDebounce = useCallback(() => {
        if (isSubmitting) return;
        handleFinishEdit();
    }, [isSubmitting, userType, surveyHST, capturedImage, surveyCommodity, dataHistory, markerDetail]);

    ////////////////////////////////
    /// NAVIGATION

    const handleMenuSurvey = async () => {
        showLoading("Mohon tunggu..");
        try {
            if (mapFunctions) {
                await mapInteraction.fetchMarkers();
            }
            setEvent("view");
        } catch (error) {
            console.error('Error fetching markers:', error);
        } finally {
            hideLoading();
        }
    };

    const handleMenuSummary = async () => {
        showLoading("Mohon tunggu..");
        try {
            const summaryData = await markerService.summary();
            setSummary(summaryData.data);
            if (mapFunctions) {
                await mapInteraction.fetchSelfMarkers();
            }
            setEvent("summary");
        } catch (error) {
            console.error('Error fetching summary:', error);
        } finally {
            hideLoading();
        }
    };

    const handleMenuAccount = async () => {
        try {
            showLoading("Mohon tunggu..");
            // Use replace instead of push to prevent back navigation
            await router.replace("/account");
        } catch (error) {
            console.error('Error navigating to account:', error);
            showMessage("Gagal membuka halaman akun", <CancleIcon />);
        } finally {
            // Hide loading after a short delay to ensure smooth transition
            setTimeout(() => {
                hideLoading();
            }, 500);
        }
    };

    const handleNavigate = (view) => {
        if (event === view) return; // Don't reload if already on the same view
        
        switch(view) {
            case 'view':
                handleMenuSurvey();
                break;
            case 'summary':
                handleMenuSummary();
                break;
            case 'account':
                handleMenuAccount();
                break;
        }
    };

    ////////////////////////////////////////////////////////////////
    /// HISTORY TANAM FUNCTIONS

    const onOpenHistory = () => {
        if (event == "view") {
            setIsEditOpen(false)
        }

        if (event == "survey") {
            setSurveyStep(0)
        }

        setIsHistoryOpen(true)
    }

    const onCloseHistory = () => {
        setIsHistoryOpen(false)
        
        if (event == "view") {
            setIsEditOpen(true)
        }

        if (event == "survey") {
            setSurveyStep(1)
        }
    }

    const handleFinishHistory = (formattedValues) => {
        setDataHistory(formattedValues)
        setIsHistoryOpen(false)

        if (event == "view") {
            setIsEditOpen(true)
        }

        if (event == "survey") {
            setSurveyStep(1)
        }
    }

    ////////////////////////////////////////////////////////////////
    //// LEADERBOARD


    useEffect(() => {
        if (typeof window != "undefined") {
            let navigation = new URLSearchParams(window.location.search);
            if (navigation.get("navigation") == "summary") {
                fetchSelfMarker();
                setEvent("summary");
            } else {
                setEvent("view");
            }
        }
    }, [])



    useEffect(() => {
        if (mapFunctions) {
            fetchMarker()
        }
    }, [mapFunctions])



    const leaderboards = [
        { "no": 1, "nama": "Sumanto", "point": 110 },
        { "no": 2, "nama": "Cut Nyak Dien", "point": 110 },
        { "no": 3, "nama": "Soedirman", "point": 110 },
        { "no": 4, "nama": "Hatta", "point": 110 },
        { "no": 5, "nama": "Raden Dewi", "point": 110 },
        { "no": 6, "nama": "Cipto Mangunkusumo", "point": 110 },
        { "no": 7, "nama": "Imam", "point": 110 },
        { "no": 8, "nama": "Achmad Yani", "point": 110 },
        { "no": 9, "nama": "Dewi Santika", "point": 110 },
        { "no": 10, "nama": "Kartika", "point": 110 },
    ]

    // Add cleanup effect
    useEffect(() => {
        return () => {
            hideLoading();
        };
    }, [hideLoading]);

    return (
        <main>
            <MapComponent
                event={event}
                screen={screen}
                callbackPressMap={callbackPressMap}
                callbackClickMarker={callbackClickMarker}
                onMapReady={handleMapReady}
                showMessage={showMessage}
            />

            {
                event == "summary" && (
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            zIndex: 999,
                        }}
                        className="bg-white pt-16 w-full pb-3 overflow-hidden"
                    >
                        <div className="flex justify-around">
                            <div className="w-20 text-gray-500 text-center cursor-pointer">
                                <div className="text-xl font-semibold">{summary?.count_total || 0}</div>
                                <div className="text-xs leading-[1]">Semua</div>
                            </div>
                            <div className="w-20 text-gray-500 text-center cursor-pointer">
                                <div className="text-xl font-semibold">{summary?.count_padi || 0}</div>
                                <div className="text-xs leading-[1]">Padi</div>
                            </div>
                            <div className="w-20 text-gray-500 text-center cursor-pointer">
                                <div className="text-xl font-semibold">{summary?.count_jagung || 0}</div>
                                <div className="text-xs leading-[1]">Jagung</div>
                            </div>
                            <div className="w-20 text-gray-500 text-center cursor-pointer">
                                <div className="text-xl font-semibold">{summary?.count_tebu || 0}</div>
                                <div className="text-xs leading-[1]">Tebu</div>
                            </div>
                            <div className="w-20 text-gray-500 text-center cursor-pointer">
                                <div className="text-xl font-semibold">{summary?.count_other || 0}</div>
                                <div className="text-xs leading-[1]">Lainnya</div>
                            </div>
                        </div>
                    </ div>
                )
            }


            {
                event != "survey" && (
                    <div
                        style={{
                            position: 'fixed',
                            bottom: 0,
                            zIndex: 99999
                        }}
                    >
                        {
                            event == "view" && (
                                <AnimatePresence>
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        transition={{ duration: 0.1, ease: "easeInOut" }}
                                    >
                                        <div className="glass-effect w-screen px-3 py-3">
                                            <button
                                                onClick={() => {
                                                    mapInteraction.updateGeolocation();
                                                    setEvent('survey');
                                                    setSurveyStep(0);
                                                }}
                                                className="w-full bg-blue text-white text-center font-semibold rounded py-2 px-2 shadow-lg text-sm"
                                            >
                                                + Tambahkan Penanda
                                            </button>
                                        </div>
                                    </motion.div>
                                </AnimatePresence>


                            )
                        }

                        <NavigationBar 
                            currentView={event}
                            onNavigate={handleNavigate}
                        />

                    </div>
                )
            }

            {
                event == "survey" && (
                    <div
                        style={{
                            position: 'absolute',
                            top: 10,
                            left: 0,
                            zIndex: 99993
                        }}
                    >
                        <div className="bg-white ml-5 p-3 rounded-full text-blue shadow-lg"
                            onClick={handleBackSurvey}
                        >
                            <ArrowLeft size={22} />
                        </div>
                    </div>
                )
            }

            {
                (event == "survey" && surveyStep == 0) && (
                    <div
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            zIndex: 9999
                        }}
                        className="bg-white w-screen"
                    >
                        <div className="m-3">
                            <div className="bg-blue-100 flex p-3 items-center">
                                <div className="w-5 flex mr-2">
                                    <InfoIcon />
                                </div>
                                <div className="flex-auto text-xs font-semibold">
                                    Silakan tekan area selama 2 detik di dalam lingkaran biru radius lokasi anda untuk menetapkan komoditas.
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            <SurveyDrawer 
                surveyStep={surveyStep}
                surveyCommodity={surveyCommodity}
                surveyHST={surveyHST}
                capturedImage={capturedImage}
                uploadedImage={uploadedImage}
                dataHistory={dataHistory}
                userType={userType}
                isHistoryOpen={isHistoryOpen}
                isSubmitting={isSubmitting}
                onCommoditySelect={setSurveyCommodity}
                onHSTChange={(e) => setSurveyHST(e.target.value)}
                onPhotoClick={() => {
                    setSurveyStep(2);
                    setIsWebcamActive(true);
                }}
                onHistoryClick={() => {
                    if (event === "view") {
                        setIsEditOpen(false);
                    }
                    setIsHistoryOpen(true);
                }}
                onFinish={handleFinishSurvey}
                handleKeyPress={handleKeyPress}
            />

            {/* Edit Drawer */}
            {isEditOpen && (
                <div
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        zIndex: 9999,
                        transform: 'translateY(0)',
                        transition: 'transform 0.2s ease-out'
                    }}
                    className="bg-white w-screen animate-slide-up"
                >
                    <div className="flex justify-between items-center px-4 pt-4">
                        <h1 className="text-base font-semibold text-black">Edit Komoditas</h1>
                        <button 
                            className="text-lg font-semibold text-black" 
                            onClick={onCloseEdit}
                        >
                            <X />
                        </button>
                    </div>

                    <h2 className="text-sm mt-4 px-4 font-medium">
                        <span className="font-semibold text-red-600">*</span> Pilih Komoditas
                    </h2>
                    
                    <CommoditySelector 
                        selectedCommodity={surveyCommodity}
                        onSelect={isSubmitting ? () => {} : setSurveyCommodity}
                        disabled={isSubmitting}
                    />

                    <h2 className="text-sm mt-4 px-4 font-medium">
                        Hari setelah Tanam
                        <span className="font-light text-gray-500"> (Opsional)</span>
                    </h2>
                    <div className="mx-4 mt-2">
                        <Input 
                            className="input-custom" 
                            placeholder="Masukkan HST"
                            value={surveyHST}
                            onChange={onChangeHST}
                            inputMode="numeric"
                            pattern="[0-9]*"
                            type="tel"
                            onKeyPress={handleKeyPress}
                            disabled={isSubmitting}
                        />
                    </div>

                    <h2 className="text-sm mt-4 px-4 font-medium">
                        <span className="font-semibold text-red-600">*</span> Foto komoditas
                    </h2>
                    <div className="px-4 mt-2">
                        <div 
                            className={`image-commodity-container-empty border rounded ${
                                isSubmitting 
                                    ? 'border-gray-200 cursor-not-allowed' 
                                    : 'border-gray-300 cursor-pointer hover:border-blue-400'
                            }`}
                            onClick={isSubmitting ? () => {} : handleEditPhoto}
                        >
                            {(capturedImage || uploadedImage) && (
                                <>
                                    <img src={uploadedImage} className="image-commodity-container rounded" alt="Preview" />
                                    <div className="absolute inset-0 bg-black opacity-50"></div>
                                </>
                            )}

                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 text-sm">
                                <div className={(capturedImage || uploadedImage) ? "text-white" : "text-gray-500"}>
                                    <Camera className="block w-full" size={16} />
                                    <div className="mt-1 text-center">
                                        {(capturedImage || uploadedImage) ? "Ganti Foto" : "Tambah foto komoditas"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {dataHistory && (
                        <div className="px-4 text-sm">
                            <h2 className="mt-4 font-medium">History Tanam</h2>
                            {[1, 2, 3].map((period) => {
                                const commodity = dataHistory[`commodity_mt_${period}`];
                                const tanam = dataHistory[`tanam_mt_${period}`];
                                const panen = dataHistory[`panen_mt_${period}`];

                                if (!commodity) return null;

                                return (
                                    <div key={period} className="flex justify-between mt-2">
                                        <span>{ConvertCommodityTypeToIndonesianCommodity(commodity)}</span>
                                        <span className="font-semibold">
                                            {ConvertDateMonthToIndonesianMonth(tanam)}
                                            &nbsp;-&nbsp;
                                            {ConvertDateMonthToIndonesianMonth(panen)}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div className="mx-4">
                        <button
                            className={`mt-4 font-semibold text-white text-center text-sm p-2 rounded w-full ${
                                (surveyCommodity !== "" && !isSubmitting) ? 'bg-blue' : 'bg-blue-200'
                            }`}
                            disabled={!surveyCommodity || isSubmitting}
                            onClick={handleFinishEditWithDebounce}
                        >
                            {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                        </button>
                        <button
                            className={`mb-4 mt-2 font-semibold text-center text-sm p-2 rounded border w-full ${
                                isSubmitting 
                                    ? 'text-gray-400 border-gray-200 cursor-not-allowed' 
                                    : 'text-black border-gray-400 hover:bg-gray-50'
                            }`}
                            onClick={onOpenHistory}
                            disabled={isSubmitting}
                        >
                            + Tambah Histori Tanam
                        </button>
                    </div>
                </div>
            )}

            <CameraCapture 
                isActive={isWebcamActive}
                capturedImage={capturedImage}
                onCapture={setCapturedImage}
                onSave={() => {
                    setUploadedImage(capturedImage);
                    setIsWebcamActive(false);
                    if (event === "survey") {
                        setSurveyStep(1);
                    } else {
                        setIsEditOpen(true);
                    }
                }}
                onRetake={() => setCapturedImage("")}
            />

            <MarkerDetail 
                isOpen={isDetailOpen}
                onClose={onCloseDetail}
                onEdit={onEditDetail}
                onDelete={onDeleteDetail}
                markerDetail={markerDetail}
                uploadedImage={uploadedImage}
                isCurrentUser={markerDetail?.username === username}
            />

            <PlantingHistoryForm 
                isOpen={isHistoryOpen}
                onClose={onCloseHistory}
                onSave={handleFinishHistory}
                initialData={dataHistory}
            />

            <Modal
                open={isDeleteOpen}
                zIndex={9999999}
                footer={false}
                closable={false}
                closeIcon={false}
                className="modal-margin"
                centered
            >
                <svg className="ml-auto mr-auto" width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="4" y="4" width="48" height="48" rx="24" fill="#FEE4E2" />
                    <rect x="4" y="4" width="48" height="48" rx="24" stroke="#FEF3F2" stroke-width="8" />
                    <path d="M28 17.875C25.9975 17.875 24.0399 18.4688 22.3749 19.5814C20.7098 20.6939 19.4121 22.2752 18.6457 24.1253C17.8794 25.9754 17.6789 28.0112 18.0696 29.9753C18.4602 31.9393 19.4245 33.7435 20.8405 35.1595C22.2566 36.5755 24.0607 37.5398 26.0247 37.9305C27.9888 38.3211 30.0246 38.1206 31.8747 37.3543C33.7248 36.5879 35.3061 35.2902 36.4186 33.6251C37.5312 31.9601 38.125 30.0025 38.125 28C38.122 25.3156 37.0543 22.742 35.1562 20.8438C33.258 18.9457 30.6844 17.878 28 17.875ZM28 35.875C26.4425 35.875 24.9199 35.4131 23.6249 34.5478C22.3299 33.6825 21.3205 32.4526 20.7245 31.0136C20.1284 29.5747 19.9725 27.9913 20.2763 26.4637C20.5802 24.9361 21.3302 23.5329 22.4315 22.4315C23.5329 21.3302 24.9361 20.5802 26.4637 20.2763C27.9913 19.9725 29.5747 20.1284 31.0136 20.7244C32.4526 21.3205 33.6825 22.3298 34.5478 23.6249C35.4131 24.9199 35.875 26.4425 35.875 28C35.8728 30.0879 35.0424 32.0896 33.566 33.566C32.0896 35.0424 30.0879 35.8728 28 35.875ZM26.875 28.375V23.5C26.875 23.2016 26.9935 22.9155 27.2045 22.7045C27.4155 22.4935 27.7016 22.375 28 22.375C28.2984 22.375 28.5845 22.4935 28.7955 22.7045C29.0065 22.9155 29.125 23.2016 29.125 23.5V28.375C29.125 28.6734 29.0065 28.9595 28.7955 29.1705C28.5845 29.3815 28.2984 29.5 28 29.5C27.7016 29.5 27.4155 29.3815 27.2045 29.1705C26.9935 28.9595 26.875 28.6734 26.875 28.375ZM29.5 32.125C29.5 32.4217 29.412 32.7117 29.2472 32.9584C29.0824 33.205 28.8481 33.3973 28.574 33.5108C28.2999 33.6244 27.9983 33.6541 27.7074 33.5962C27.4164 33.5383 27.1491 33.3954 26.9393 33.1857C26.7296 32.9759 26.5867 32.7086 26.5288 32.4176C26.4709 32.1267 26.5007 31.8251 26.6142 31.551C26.7277 31.2769 26.92 31.0426 27.1666 30.8778C27.4133 30.713 27.7033 30.625 28 30.625C28.3978 30.625 28.7794 30.783 29.0607 31.0643C29.342 31.3456 29.5 31.7272 29.5 32.125Z" fill="#D63024" />
                </svg>

                <div className="text-center text-lg text-black font-semibold mt-2">Konfirmasi Hapus Penanda</div>
                <p className="text-sm text-gray px-2 py-2 text-center text-gray-500"> Apakah Anda yakin ingin menghapus penanda ini? Penanda yang sudah dihapus tidak bisa dikembalikan.</p>
                <div className="flex justify-between space-x-3 mt-2">
                    <button className="flex-1 border border-gray-300  text-base font-semibold p-2 rounded"
                        onClick={handleCancelDelete}
                    >Tidak</button>
                    <button className="flex-1 bg-red-600 text-white  text-base font-semibold p-2 rounded"
                        onClick={handleConfirmDelete}
                    >Ya, Hapus</button>
                </div>

            </Modal>

            <Modal
                open={isLeaderboardOpen}
                zIndex={9999999}
                footer={false}
                closable={true}
                onCancel={() => {
                    setIsLeaderboardOpen(false)
                }}
                closeIcon={false}
                className="modal-margin"
                centered
            >
                <div className="">
                    <div className="text-sm text-gray-500 mb-5">Update terakhir: 13 Jun 2025 13:28</div>
                    <div className="grid grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-green-800 rounded-full flex items-center justify-center mx-auto mb-1">
                                <img src="/paddy.png" className="w-6 h-6" alt="Padi" />
                            </div>
                            <div className="text-lg font-semibold">156</div>
                            <div className="text-xs text-gray-500">Padi</div>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-yellow-700 rounded-full flex items-center justify-center mx-auto mb-1">
                                <img src="/corn.png" className="w-6 h-6" alt="Jagung" />
                            </div>
                            <div className="text-lg font-semibold">118</div>
                            <div className="text-xs text-gray-500">Jagung</div>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-teal-700 rounded-full flex items-center justify-center mx-auto mb-1">
                                <img src="/cane.png" className="w-6 h-6" alt="Tebu" />
                            </div>
                            <div className="text-lg font-semibold">95</div>
                            <div className="text-xs text-gray-500">Tebu</div>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-1 white">
                                <img src="/others.png" className="w-6 h-6" alt="Lainnya" />
                            </div>
                            <div className="text-lg font-semibold">43</div>
                            <div className="text-xs text-gray-500">Lainnya</div>
                        </div>
                    </div>

                    <div className="mt-4 overflow-hidden rounded-lg border">
                        <table className="min-w-full ">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="text-left p-2 text-xs font-medium text-black">No</th>
                                    <th className="text-left p-2 text-xs font-medium text-black">Nama</th>
                                    <th className="text-right p-2 text-xs font-medium text-black">Jumlah Poin</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaderboards.map((item) => {
                                    return (
                                        <tr key={item.no} className="border-b border-gray-100 py-1">
                                            <td className="p-2 text-sm text-gray-500">{item.no}</td>
                                            <td className="p-2 text-sm">{item.nama}</td>
                                            <td className="p-2 text-sm text-blue font-medium text-right">{item.point}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>

                    <button className="w-full bg-blue text-white font-medium py-2 rounded-lg mt-4">
                        Lihat Semua
                    </button>
                </div>
            </Modal>
        </main >
    )
}