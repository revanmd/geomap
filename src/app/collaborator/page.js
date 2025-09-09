"use client"

import { ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useState, Suspense } from "react";
import { Modal } from "antd";
import { useMessage } from "@/context/messageContext";
import { useUser } from "@/context/userContext";
import { CancleIcon, ChecklistIcon, InfoIcon } from "@/components/icon";
import { markerService } from "@/services/markerService";
import { useLoading } from "@/context/loadingContext";
import { fileService } from "@/services/fileService";
import { useGps } from "@/context/gpsContext";

// Custom hooks
import useSurveyForm from "@/hooks/useSurveyForm";

import PlantingHistoryForm from "@/components/collaborator/PlantingHistoryForm";
import MarkerDetail from "@/components/collaborator/MarkerDetail";
import SurveyDrawer from "@/components/collaborator/SurveyDrawer";
import CameraCapture from "@/components/collaborator/CameraCapture";
import BottomNav from "@/components/navigation/BottomNav";
import { useSearchParams } from "next/navigation";

// Dynamic Import Component
const MapComponent = dynamic(() => import("@/components/map"), {
    ssr: false,
});

function CollaboratorContent() {
    ////////////////////////////////
    // CONTEXT
    const { showMessage } = useMessage()
    const { showLoading, hideLoading } = useLoading();
    const { username, userType, isSurvey } = useUser();
    const { isGpsLoading } = useGps();
    const searchParams = useSearchParams()

    const surveyForm = useSurveyForm({
        userType,
        onSuccess: (data) => {
            if (mapFunctions) {
                mapFunctions.appendMarker(data.commodity, data.id);
                setEvent("view");
                setSurveyStep(0);
                resetSurvey();
            }
        },
        onError: (error) => {
            showMessage(error.message || "Gagal menambahkan komoditas", <CancleIcon />);
        }
    });

    ////////////////////////////////
    // PROPS DRILLDOWN
    const [mapFunctions, setMapFunctions] = useState(null)
    const handleMapReady = (mapRefs) => {
        setMapFunctions(mapRefs)
    }

    // FORM-FILLING, DETAIL, TAGGING
    const [event, setEvent] = useState('view')
    const [surveyStep, setSurveyStep] = useState(0)
    const [screen] = useState('minimize')
    const [isWebcamActive, setIsWebcamActive] = useState(false)

    const callbackPressMap = () => {
        resetSurvey()
        setSurveyStep(1)
    }

    const callbackClickMarker = useCallback((params) => {
        fetchMarkerDetail(params.id);
        setEvent("view");
    }, []);


    ////////////////////////////////////////////////////////////////
    //// DETAIL MARKER
    const [isDetailOpen, setIsDetailOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)

    const [markerDetail, setMarkerDetail] = useState(null)
    const [uploadedImage, setUploadedImage] = useState("")


    const fetchMarkerDetail = async (markerId) => {
        if (!markerId) {
            showMessage("ID marker tidak ditemukan", <CancleIcon />);
            return;
        }

        showLoading("Mohon tunggu ...");
        try {
            const response = await markerService.getMarkerById(markerId);
            if (!response?.data) {
                throw new Error("Data marker tidak ditemukan");
            }

            const marker = response.data;

            // Fetch the image first
            try {
                const blob = await fileService.getFile(marker.photo);
                const imageUrl = URL.createObjectURL(blob);
                setUploadedImage(imageUrl);
                // Store both the URL and the original filename
                surveyForm.setImageData(imageUrl, marker.photo);
            } catch (imageError) {
                console.error("Failed to fetch image:", imageError);
                setUploadedImage("");
                surveyForm.setImageData("", "");
            }

            // Set marker data
            setMarkerDetail(marker);
            surveyForm.setSurveyCommodity(marker.commodity || "");
            surveyForm.setSurveyHST(marker.hst?.toString() || "");
            surveyForm.handleHistoryChange(marker.planting_history || null);
            setIsDetailOpen(true);
        } catch (error) {
            console.error("Error fetching marker:", error);
            showMessage(error.message || "Gagal mengambil detail marker", <CancleIcon />);
            setIsDetailOpen(false);
            setUploadedImage("");
            surveyForm.setImageData("", "");
        } finally {
            hideLoading();
        }
    };

    const onCloseDetail = () => {
        setIsDetailOpen(false);
        surveyForm.resetForm();
    };

    const onEditDetail = () => {
        setIsDetailOpen(false);
        setIsEditOpen(true);
        setSurveyStep(1);  // Set survey step to show the drawer
        setEvent("survey"); // Set event to survey mode
    };
    const onDeleteDetail = () => {
        setIsDeleteOpen(true)
    }


    const handleFinishEdit = async () => {
        if (!markerDetail?.id) {
            showMessage("ID marker tidak ditemukan", <CancleIcon />);
            return;
        }

        showLoading("Mohon tunggu ...");
        try {
            // Prepare location data from original marker
            const location = markerDetail.location ? {
                lat: markerDetail.location.lat,
                lon: markerDetail.location.lon
            } : null;

            // Update marker with original location
            const updatedData = await surveyForm.updateMarker(markerDetail.id, location);

            // Update marker on map if we have valid data
            if (mapFunctions && updatedData?.location?.lat && updatedData?.location?.lon) {
                mapFunctions.updateMarker(
                    markerDetail.id,
                    [updatedData.location.lat, updatedData.location.lon],
                    updatedData.commodity || surveyForm.surveyCommodity
                );
            }

            // Refresh marker detail data to show updated information
            await fetchMarkerDetail(markerDetail.id);

            showMessage("Komoditas berhasil diubah", <ChecklistIcon />);
            setIsDetailOpen(false);
        } catch (error) {
            console.error("Error updating marker:", error);
            showMessage(error.message || "Gagal mengubah komoditas", <CancleIcon />);
        } finally {
            hideLoading();
        }
    };

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
                fetchSelfMarker()
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

    const [summary, setSummary] = useState(null)

    const handleBackSurvey = () => {
        if (event == "survey" && surveyStep == 0) {
            setEvent('view')
            resetSurvey()
        } else if (event == "survey" && surveyStep == 1) {
            setSurveyStep(0)
            resetSurvey()
        } else if (event == "survey" && surveyStep == 2) {
            setSurveyStep(1)
            setIsWebcamActive(false)
        }
    }

    const handleSurveyPhoto = () => {
        setIsWebcamActive(true);
        setSurveyStep(2);
    };

    const handleCapturePhoto = (imageSrc) => {
        surveyForm.setImageData(imageSrc);
    };

    const handleSavePhoto = () => {
        setIsWebcamActive(false);
        setSurveyStep(1);
    };

    const handleRetakePhoto = () => {
        surveyForm.setImageData("");
    };

    const handleCloseCamera = () => {
        setIsWebcamActive(false);
        setSurveyStep(1);
        if (!surveyForm.capturedImage && !surveyForm.uploadedImage) {
            surveyForm.setImageData("");
        }
    };

    const resetSurvey = () => {
        if (mapFunctions && event === "survey") {
            mapFunctions.removeMarkerAdd();
        }
        surveyForm.resetForm();
    }

    const finishSurvey = async () => {
        showLoading("Mohon tunggu ...")
        try {
            const markerLocation = mapFunctions.getMarkerAddLocation();
            if (!markerLocation) {
                throw new Error("Lokasi marker tidak ditemukan. Silakan pilih lokasi pada peta terlebih dahulu.");
            }

            await surveyForm.submitForm({
                lat: markerLocation.lat,
                lon: markerLocation.lng
            });

            showMessage("Komoditas berhasil ditambahkan", <ChecklistIcon />);
        } catch (error) {
            showMessage(error.message || "Gagal menambahkan komoditas", <CancleIcon />);
        } finally {
            hideLoading();
        }
    }

    const handleButtonSurvey = async () => {
        await mapFunctions.onGeolocationUpdate();
        setEvent('survey');
        setSurveyStep(0);
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


    const onOpenHistory = () => {
        surveyForm.setIsHistoryOpen(true);
    };

    const handleFinishHistory = (formattedValues) => {
        surveyForm.handleHistoryChange(formattedValues);
        if (isEditOpen) {
            setIsEditOpen(true);
        } else {
            setSurveyStep(1);
        }
    };

    useEffect(() => {
        const navState = searchParams.get("navigation");

        switch (navState) {
            case "summary":
                if (mapFunctions) {
                    fetchSelfMarker();
                }
                setEvent("summary");
                break;
            default:
                if (mapFunctions) {
                    fetchMarker();
                }
                setEvent("view");
        }
    }, [searchParams]);

    useEffect(() => {
        if (mapFunctions) {
            fetchMarker();
        }
    }, [mapFunctions])

    useEffect(() => {
        if (isGpsLoading) {
            showLoading("Mengambil lokasi GPS...");
        } else {
            hideLoading();
        }
    }, [isGpsLoading, showLoading, hideLoading]);


    useEffect(() => {
        const navigation = searchParams.get("navigation")
        if (navigation) {
            setEvent(navigation)
        }
    }, [searchParams])

    return (
        <main className="h-[100dvh] w-screen relative">
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


            <div
                style={{
                    position: 'fixed',
                    bottom: 0,
                    zIndex: 999999
                }}
            >
                {
                    event == "view" && isSurvey && (
                        <AnimatePresence>
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                transition={{ duration: 0.1, ease: "easeInOut" }}
                            >
                                <div className="glass-effect w-screen px-3 py-3">
                                    <button
                                        onClick={handleButtonSurvey}
                                        className="cursor-pointer w-full bg-blue text-white text-center font-semibold rounded py-2 px-2 shadow-lg text-sm"
                                    >
                                        + Tambahkan Penanda
                                    </button>
                                </div>
                            </motion.div>
                        </AnimatePresence>


                    )
                }
                {
                    (event == "survey" && surveyStep == 0) && (
                        <AnimatePresence>
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 30 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                            >
                                <div
                                    className="bg-white w-screen fixed bottom-0"
                                >
                                    <div className="m-3">
                                        <div className="bg-blue-100 flex p-3 items-center">
                                            <div className="w-5 flex mr-2">
                                                <InfoIcon />
                                            </div>
                                            <div className="flex-auto text-xs font-semibold">
                                                Tekan dan tahan selama 2 detik pada area di dalam radius biru untuk menentukan lokasi komoditas.
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </motion.div>
                        </AnimatePresence>

                    )
                }

                {
                    event != "survey" && (
                        <BottomNav />
                    )
                }
            </div>

            {
                event == "survey" && (
                    <div
                        style={{
                            position: 'absolute',
                            top: 10,
                            left: 0,
                            zIndex: 99990
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



            <SurveyDrawer
                isOpen={surveyStep === 1}
                mode={isEditOpen ? "edit" : "create"}
                surveyForm={surveyForm}
                onPhotoClick={handleSurveyPhoto}
                onHistoryClick={onOpenHistory}
                onFinish={isEditOpen ? handleFinishEdit : finishSurvey}
            />

            <MarkerDetail
                isOpen={isDetailOpen}
                onClose={onCloseDetail}
                onEdit={onEditDetail}
                onDelete={onDeleteDetail}
                markerDetail={markerDetail}
                uploadedImage={uploadedImage}
                isCurrentUser={markerDetail?.username === username}
                isSurvey={isSurvey}
            />

            <PlantingHistoryForm
                isOpen={surveyForm.isHistoryOpen}
                onClose={() => {
                    surveyForm.setIsHistoryOpen(false);
                    if (isEditOpen) {
                        setIsEditOpen(true);
                    } else {
                        setSurveyStep(1);
                    }
                }}
                onSave={handleFinishHistory}
                initialData={surveyForm.dataHistory}
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

            <CameraCapture
                isActive={isWebcamActive}
                capturedImage={surveyForm.capturedImage}
                onCapture={handleCapturePhoto}
                onSave={handleSavePhoto}
                onRetake={handleRetakePhoto}
                onClose={handleCloseCamera}
            />
        </main >
    )
}

export default function Collaborator() {
    return (
        <Suspense fallback={
            <div className="h-[100dvh] w-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <div className="text-sm text-gray-600">Loading...</div>
                </div>
            </div>
        }>
            <CollaboratorContent />
        </Suspense>
    )
}