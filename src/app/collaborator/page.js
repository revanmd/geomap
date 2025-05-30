"use client"

import { Map, SquareMenu, CircleUserRound, ArrowLeft, X, Camera, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Webcam from "react-webcam";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { DatePicker, Drawer, Form, Input, Modal, Select } from "antd";
import { useMessage } from "@/context/messageContext";
import { CancleIcon, ChecklistIcon, InfoIcon } from "@/components/icon";
import { markerService } from "@/services/markerService";
import { useLoading } from "@/context/loadingContext";
import { fileService } from "@/services/fileService";
import { CapitalizeFirstLetter, ConvertCommodityTypeToIndonesianCommodity, ConvertDateMonthToIndonesianMonth, ConvertIsoToIndonesianDate } from "@/utility/utils";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";

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


    ////////////////////////////////
    // PROPS DRILLDOWN
    const [mapFunctions, setMapFunctions] = useState(null)
    const handleMapReady = (mapRefs) => {
        setMapFunctions(mapRefs)
    }

    // form-filling, detail, tagging
    const [event, setEvent] = useState('survey')
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
    }

    const handleEditPhoto = () => {
        setIsEditOpen(false)
        setIsWebcamActive(true)
    }

    const handleFinishEdit = async () => {
        showLoading("Mohon tunggu ...")
        // handle send the request
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
                    hst: parseInt(surveyHST),
                    planting_history: dataHistory
                }

                // Create marker
                const response = await markerService.updateMarker(markerDetail?.id, marker);

                // Flagging as success
                mapFunctions.updateMarker(response?.data?.id, [markerDetail?.location?.lat, markerDetail?.location?.lon], surveyCommodity)
                showMessage("Komoditas berhasil diubah", <ChecklistIcon />)
            } else {
                showMessage("Gagal mengupload foto", <CancleIcon />)
            }

            if (event == "summary") {
                fetchSelfMarker()
            }

            setIsEditOpen(false)


        } catch (error) {
            console.log(error)
            showMessage("Gagal menambahkan komoditas", <CancleIcon />)
        }


        resetSurvey()
        hideLoading()
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

    ////////////////////////////////////////////////////////////////
    //// SURVEY

    const [surveyCommodity, setSurveyCommodity] = useState("")
    const [surveyHST, setSurveyHST] = useState("")

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
        setSurveyHST()
        setSurveyCommodity("")
        setSurveyStep(0)
        setCapturedImage("")
    }

    const finishSurvey = async () => {
        if (userType === "agronomist" && !surveyHST) {
            showMessage("HST wajib diisi untuk Agronomist", <CancleIcon />)
            return;
        }

        showLoading("Mohon tunggu ...")
        // handle send the request
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
                    hst: parseInt(surveyHST),
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
        }
        setEvent("survey")
        resetSurvey()
        hideLoading()
    }

    const handleKeyPress = (e) => {
        // Prevent anything that's not a digit
        if (!/^\d$/.test(e.key)) {
            e.preventDefault();
        }
    };

    ////////////////////////////////////////////////////////////////
    //// WEBCAM

    const [isWebcamActive, setIsWebcamActive] = useState(false)
    const webcamRef = useRef(null)
    const [capturedImage, setCapturedImage] = useState("");
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

    const [summary, setSummary] = useState(null)

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
            if (markers.data) {
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
            if (markers.data) {
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

    ////////////////////////////////
    /// NAVIGATION

    const [username, setUsername] = useState("")
    const [userType, setUserType] = useState("")

    const handleMenuSurvey = () => {
        showLoading("Mohon tunggu..")
        setTimeout(() => {
            fetchMarker()
            setEvent("view")
            hideLoading()
        }, 3000)


    }
    const handleMenuSummary = () => {
        showLoading("Mohon tunggu..")
        setTimeout(() => {
            fetchSelfMarker()
            setEvent("summary")
            hideLoading()
        }, 3000)

    }
    const handleMenuAccount = () => {
        showLoading("Mohon tunggu..")
        setTimeout(() => {
            router.push("/account")
            hideLoading()
        }, 1000)
    }


    ////////////////////////////////////////////////////////////////
    /// HISTORY TANAM

    const [isHistoryOpen, setIsHistoryOpen] = useState(false)
    const [dataHistory, setDataHistory] = useState()
    const [FormHistory] = Form.useForm()


    const optionCommodity = [
        { label: 'Padi', value: 'padi' },
        { label: 'Jagung', value: 'jagung' },
        { label: 'Tebu', value: 'tebu' },
        { label: 'Lainnya', value: 'other' },
    ]

    const setFieldsHistory = (data) => {
        const payload = {
            ...data,
            commodity_mt_1: data?.commodity_mt_1 != "" && data?.commodity_mt_1 != undefined ? data.commodity_mt_1 : undefined,
            commodity_mt_2: data?.commodity_mt_2 != "" && data?.commodity_mt_2 != undefined ? data.commodity_mt_2 : undefined,
            commodity_mt_3: data?.commodity_mt_3 != "" && data?.commodity_mt_3 != undefined ? data.commodity_mt_3 : undefined,
            panen_mt_1: data?.panen_mt_1 ? dayjs(data?.panen_mt_1, 'YYYY-MM') : undefined,
            panen_mt_2: data?.panen_mt_2 ? dayjs(data?.panen_mt_2, 'YYYY-MM') : undefined,
            panen_mt_3: data?.panen_mt_3 ? dayjs(data?.panen_mt_3, 'YYYY-MM') : undefined,
            tanam_mt_1: data?.tanam_mt_1 ? dayjs(data?.tanam_mt_1, 'YYYY-MM') : undefined,
            tanam_mt_2: data?.tanam_mt_2 ? dayjs(data?.tanam_mt_2, 'YYYY-MM') : undefined,
            tanam_mt_3: data?.tanam_mt_3 ? dayjs(data?.tanam_mt_3, 'YYYY-MM') : undefined,
        }
        console.log(payload)
        FormHistory.setFieldsValue(payload)
    }

    const onOpenHistory = () => {
        if (event == "view") {
            setIsEditOpen(false)
        }

        if (event == "survey") {
            setSurveyStep(0)
        }

        setFieldsHistory(dataHistory)
        setIsHistoryOpen(true)
    }

    const onCloseHistory = () => {
        if (event == "view") {
            setIsEditOpen(true)
        }

        if (event == "survey") {
            setSurveyStep(1)
        }

        setIsHistoryOpen(false)
    }

    const handleFinishHistory = () => {
        const values = FormHistory.getFieldsValue()

        const body = {
            ...values,
            panen_mt_1: values.panen_mt_1?.format("YYYY-MM"),
            panen_mt_2: values.panen_mt_2?.format("YYYY-MM"),
            panen_mt_3: values.panen_mt_3?.format("YYYY-MM"),
            tanam_mt_1: values.tanam_mt_1?.format("YYYY-MM"),
            tanam_mt_2: values.tanam_mt_2?.format("YYYY-MM"),
            tanam_mt_3: values.tanam_mt_3?.format("YYYY-MM"),
        }

        setDataHistory(body)
        setIsHistoryOpen(false)
        FormHistory.resetFields()

        if (event == "view") {
            setIsEditOpen(true)
        }

        if (event == "survey") {
            setSurveyStep(1)
        }
    }


    useEffect(() => {
        if (typeof window != "undefined") {
            let username = localStorage.getItem("username")
            let userType = localStorage.getItem("user_type").toLocaleLowerCase()

            setUsername(username)
            setUserType(userType)

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




    return (
        <main>
            <MapComponent
                event={event}
                screen={screen}
                callbackPressMap={callbackPressMap}
                callbackClickMarker={callbackClickMarker}
                onMapReady={handleMapReady}
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
                            position: 'absolute',
                            bottom: 0,
                            zIndex: 9999
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
                                                onClick={clickedAddMarker}
                                                className="w-full bg-blue text-white text-center font-semibold rounded py-2 px-2 shadow-lg text-sm"
                                            >+ Tambahkan Penanda</button>
                                        </div>
                                    </motion.div>
                                </AnimatePresence>


                            )
                        }

                        <div className="relative w-screen justify-around py-3 flex border bg-white">
                            <div className={`flex flex-col items-center font-medium 
                                    ${event != "summary" ? "text-blue" : "text-gray-500"
                                }`}
                                onClick={handleMenuSurvey}
                            >
                                <Map size={22} />
                                <span className="text-xs mt-1">Jelajah</span>
                            </div>
                            <div className={`flex flex-col items-center font-medium 
                                    ${event == "summary" ? "text-blue" : "text-gray-500"
                                }`}
                                onClick={handleMenuSummary}
                            >
                                <SquareMenu size={22} />
                                <span className="text-xs mt-1">Data Survey</span>
                            </div>
                            <div className="flex flex-col items-center text-gray-500"
                                onClick={handleMenuAccount}
                            >
                                <CircleUserRound size={22} />
                                <span className="text-xs mt-1">Akun</span>
                            </div>
                        </div>

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

            {
                (event == "survey" && surveyStep == 1) && (
                    <div
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            zIndex: 9999,
                            transform: 'translateY(0)', // Start at normal position
                            transition: 'transform 0.2s ease-out' // Add smooth transition
                        }}
                        className="bg-white w-screen animate-slide-up"
                    >
                        <div className="flex justify-between items-center px-4 pt-4">
                            <h1 className="text-base font-semibold text-black">Tandai dengan komoditas</h1>
                            <h1 className="text-xs font-semibold text-black"
                                onClick={handleBackSurvey}
                            >
                                <X />
                            </h1>
                        </div>

                        <h2 className="text-sm mt-4 px-4 font-medium"><span className="font-semibold text-red-600">*</span> Pilih Komoditas</h2>
                        <div className="text-center w-full flex justify-around px-3 mt-2">
                            <div style={{ width: '70px' }}
                                className={`border rounded text-center mx-2 py-3 
                                ${surveyCommodity === "padi" ? "border-blue" : "border-gray-300"
                                    }`}
                                onClick={() => {
                                    clickedCommodity("padi")
                                }}
                            >
                                <img src="/padi.png" className="icon-commodity ml-auto mr-auto"></img>
                                <div className="font-semibold text-xs mt-1.5">
                                    Padi
                                </div>
                            </div>
                            <div style={{ width: '70px' }}
                                className={`border rounded text-center mx-2 py-3
                                ${surveyCommodity === "jagung" ? "border-blue" : "border-gray-300"
                                    }`}
                                onClick={() => {
                                    clickedCommodity("jagung")
                                }}
                            >
                                <img src="/jagung.png" className="icon-commodity ml-auto mr-auto"></img>
                                <div className="font-semibold text-xs mt-1.5">
                                    Jagung
                                </div>
                            </div>
                            <div style={{ width: '70px' }}
                                className={`border rounded text-center mx-2 py-3
                                ${surveyCommodity === "tebu" ? "border-blue" : "border-gray-300"
                                    }`}
                                onClick={() => {
                                    clickedCommodity("tebu")
                                }}
                            >
                                <img src="/tebu.png" className="icon-commodity ml-auto mr-auto"></img>
                                <div className="font-semibold text-xs mt-1.5">
                                    Tebu
                                </div>
                            </div>
                            <div style={{ width: '70px' }}
                                className={`border rounded text-center mx-2 py-3
                                ${surveyCommodity === "other" ? "border-blue" : "border-gray-300"
                                    }`}
                                onClick={() => {
                                    clickedCommodity("other")
                                }}
                            >
                                <img src="/other.png" className="icon-commodity ml-auto mr-auto"></img>
                                <div className="font-semibold text-xs mt-1.5">
                                    Lainnya
                                </div>
                            </div>
                        </div>

                        <h2 className="text-sm mt-4 px-4 font-medium">Hari setelah tanam 
                            {userType !== "agronomist" && <span className="font-light text-gray-500"> (Opsional)</span>}
                            {userType === "agronomist" && <span className="font-semibold text-red-600"> *</span>}
                        </h2>
                        <div className="mx-4 mt-2">
                            <Input className="input-custom" placeholder="Masukkan HST"
                                value={surveyHST}
                                onChange={onChangeHST}
                                inputMode="numeric"
                                pattern="[0-9]*"
                                type="tel"
                                onKeyPress={handleKeyPress}
                                required={userType === "agronomist"}
                            ></Input>
                        </div>


                        <h2 className="text-sm mt-4 px-4 font-medium"><span className="font-semibold text-red-600">*</span> Foto komoditas</h2>
                        <div className="px-4 mt-2">
                            <div className="image-commodity-container-empty border border-gray-300 rounded "
                                onClick={handleSurveyPhoto}
                            >

                                {capturedImage && (
                                    <>
                                        <img src={uploadedImage} className="image-commodity-container rounded" />
                                        {/* Overlay for darkening effect */}
                                        <div className="absolute inset-0 bg-black opacity-50"></div>
                                    </>
                                )}

                                {/* Centered content */}
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 text-sm">
                                    <div className={capturedImage ? "text-white" : "text-gray-500"}>
                                        <Camera className="block w-full" size={16} />
                                        <div className="mt-1 text-center">
                                            {capturedImage ? "Ganti Foto" : "Tambah foto komoditas"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>


                        {
                            dataHistory && (
                                <div className="px-4 text-sm ">
                                    <h2 className="mt-4 font-medium">History Tanam</h2>
                                    {
                                        dataHistory.commodity_mt_1 && (
                                            <div className="flex justify-between mt-2">
                                                <span>{ConvertCommodityTypeToIndonesianCommodity(dataHistory.commodity_mt_1)}</span>
                                                <span className="font-semibold">
                                                    {ConvertDateMonthToIndonesianMonth(dataHistory.tanam_mt_1)}
                                                    &nbsp;-&nbsp;
                                                    {ConvertDateMonthToIndonesianMonth(dataHistory.panen_mt_1)}
                                                </span>
                                            </div>
                                        )
                                    }
                                    {
                                        dataHistory.commodity_mt_2 && (
                                            <div className="flex justify-between mt-2">
                                                <span>{ConvertCommodityTypeToIndonesianCommodity(dataHistory.commodity_mt_2)}</span>
                                                <span className="font-semibold">
                                                    {ConvertDateMonthToIndonesianMonth(dataHistory.tanam_mt_2)}
                                                    &nbsp;-&nbsp;
                                                    {ConvertDateMonthToIndonesianMonth(dataHistory.panen_mt_2)}
                                                </span>
                                            </div>
                                        )
                                    }
                                    {
                                        dataHistory.commodity_mt_3 && (
                                            <div className="flex justify-between mt-2">
                                                <span>{ConvertCommodityTypeToIndonesianCommodity(dataHistory.commodity_mt_3)}</span>
                                                <span className="font-semibold">
                                                    {ConvertDateMonthToIndonesianMonth(dataHistory.tanam_mt_3)}
                                                    &nbsp;-&nbsp;
                                                    {ConvertDateMonthToIndonesianMonth(dataHistory.panen_mt_3)}
                                                </span>
                                            </div>
                                        )
                                    }
                                </div>
                            )
                        }


                        <div className="mx-4">
                            <div
                                className={`mt-4 font-semibold text-white text-center text-sm p-2 rounded ${(surveyCommodity != "") && capturedImage ? 'bg-blue' : 'bg-blue-200'}`}
                                disabled={(surveyCommodity != "") && capturedImage ? false : true}
                                onClick={finishSurvey}
                            >
                                Simpan Komoditas
                            </div>
                            <div
                                className={`mb-4 mt-2 font-semibold text-black text-center text-sm p-2 rounded border border-gray-400`}
                                disabled={surveyCommodity != "" ? false : true}
                                onClick={onOpenHistory}
                            >
                                + Tambah Histori Tanam
                            </div>
                        </div>
                    </div>
                )
            }

            {
                isHistoryOpen && (
                    <div
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            zIndex: 99999,
                            transform: 'translateY(0)', // Start at normal position
                            transition: 'transform 0.2s ease-out' // Add smooth transition
                        }}
                        className="bg-white w-screen animate-slide-up"
                    >
                        <div className="flex justify-between items-center px-4 pt-4">
                            <div>
                                <h1 className="text-base font-semibold text-black">Histori Tanam</h1>
                                <h2 className="mt-1 text-xs text-gray-500">Data ini bersifat opsional</h2>
                            </div>
                            <h1 className="text-xs font-semibold text-black"
                                onClick={onCloseHistory}
                            >
                                <X />
                            </h1>
                        </div>

                        <Form form={FormHistory} className="form-custom-margin">
                            <h2 className="text-sm mt-4 px-4 font-medium">Periode 1 <span className="font-light text-gray-500"> (Opsional)</span></h2>
                            <div className="mx-4 mt-2">
                                <Form.Item
                                    name="commodity_mt_1"
                                >
                                    <Select allowClear options={optionCommodity} className="Pilih komoditas w-full p-3-f" placeholder="Pilih komoditas"></Select>
                                </Form.Item>
                            </div>

                            <div className="mx-4 mt-2">
                                <div className="flex items-center space-x-2 w-full">
                                    <Form.Item name="tanam_mt_1" className="w-full">
                                        <DatePicker inputReadOnly className="w-full p-3-f" picker="month" placeholder="Waktu tanam" />
                                    </Form.Item>
                                    <span className="text-gray-300"><Minus /></span>
                                    <Form.Item name="panen_mt_1" className="w-full">
                                        <DatePicker inputReadOnly className="w-full p-3-f" picker="month" placeholder="Waktu panen" />
                                    </Form.Item>
                                </div>
                            </div>

                            <h2 className="text-sm mt-4 px-4 font-medium">Periode 2 <span className="font-light text-gray-500"> (Opsional)</span></h2>
                            <div className="mx-4 mt-2">
                                <Form.Item
                                    name="commodity_mt_2"
                                >
                                    <Select allowClear options={optionCommodity} className="Pilih komoditas w-full p-3-f" placeholder="Pilih komoditas"></Select>
                                </Form.Item>
                            </div>

                            <div className="mx-4 mt-2">
                                <div className="flex items-center space-x-2 w-full">
                                    <Form.Item name="tanam_mt_2" className="w-full">
                                        <DatePicker inputReadOnly className="w-full p-3-f" picker="month" placeholder="Waktu tanam" />
                                    </Form.Item>
                                    <span className="text-gray-300"><Minus /></span>
                                    <Form.Item name="panen_mt_2" className="w-full">
                                        <DatePicker inputReadOnly className="w-full p-3-f" picker="month" placeholder="Waktu panen" />
                                    </Form.Item>
                                </div>
                            </div>

                            <h2 className="text-sm mt-4 px-4 font-medium">Periode 3 <span className="font-light text-gray-500"> (Opsional)</span></h2>
                            <div className="mx-4 mt-2">
                                <Form.Item
                                    name="commodity_mt_3"
                                >
                                    <Select allowClear options={optionCommodity} className="Pilih komoditas w-full p-3-f" placeholder="Pilih komoditas"></Select>
                                </Form.Item>
                            </div>

                            <div className="mx-4 mt-2">
                                <div className="flex items-center space-x-2 w-full">
                                    <Form.Item name="tanam_mt_3" className="w-full">
                                        <DatePicker inputReadOnly className="w-full p-3-f" picker="month" placeholder="Waktu tanam" />
                                    </Form.Item>
                                    <span className="text-gray-300"><Minus /></span>
                                    <Form.Item name="panen_mt_3" className="w-full">
                                        <DatePicker inputReadOnly className="w-full p-3-f" picker="month" placeholder="Waktu panen" />
                                    </Form.Item>
                                </div>
                            </div>

                            <div className="mx-4 mt-5">
                                <button
                                    className={`w-full font-semibold text-white text-center text-sm py-2 rounded bg-blue`}
                                    onClick={handleFinishHistory}
                                >
                                    Simpan Histori Tanam
                                </button>
                                <div
                                    className={`mb-3 mt-2 font-semibold text-black text-center text-sm p-2 rounded border border-gray-400`}
                                    onClick={onCloseHistory}
                                >
                                    Kembali
                                </div>
                            </div>
                        </Form>
                    </div>
                )
            }


            {
                isWebcamActive && (
                    <div className="w-screen h-[100dvh] bg-black absolute top-0"
                        style={{
                            zIndex: 9999999
                        }}
                    >
                        <Webcam
                            ref={webcamRef}
                            audio={false}
                            screenshotFormat="image/jpeg"
                            videoConstraints={videoConstraints}
                            style={{
                                height: "100dvh",
                                width: "100vw", // Ensures it scales properly
                                objectFit: "cover", // Helps maintain aspect ratio
                                zIndex: 9999999
                            }}
                        >
                        </Webcam>

                        {
                            capturedImage && (
                                <img src={capturedImage} alt="Captured" className="absolute top-0 h-[100dvh] w-screen" />
                            )
                        }

                        {
                            capturedImage && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                    }}
                                    className="w-screen bg-white py-3"
                                >
                                    <div
                                        className={`text-sm font-semibold text-white text-center text-sm p-2 mx-6 rounded bg-blue cursor-pointer mb-3`}
                                        onClick={handleWebcamCaptured}
                                    >
                                        Simpan Foto
                                    </div>
                                    <div
                                        className={`text-sm border border-gray-300  font-semibold text-center text-sm p-2 mx-6 rounded cursor-pointer`}
                                        onClick={() => {
                                            setCapturedImage("")
                                        }}
                                    >
                                        Ambil ulang foto
                                    </div>

                                </div>
                            )
                        }



                        {
                            capturedImage == "" && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                    }}
                                    className="w-screen bg-white"
                                >
                                    <div
                                        className={`text-sm mb-3 border border-gray-300 font-semibold text-white text-center text-sm p-2 my-3 mx-6 rounded bg-blue cursor-pointer`}
                                        disabled={surveyCommodity != "" ? false : true}
                                        onClick={captureWebcam}
                                    >
                                        Ambil Foto
                                    </div>
                                </div>
                            )
                        }
                    </div>
                )
            }

            <Drawer
                open={isDetailOpen}
                placement="bottom"
                zIndex={999999}
                height={530}
                className="drawer-body-modified rounded-xl"
                closeIcon={false}
            >
                <div className="">
                    <div className="flex justify-between items-center pt-3 px-4">
                        <div>
                            <h1 className="text-base font-semibold text-black">{CapitalizeFirstLetter(markerDetail?.commodity)}</h1>
                            <h2 className="text-xs text-gray-500">Ditambahkan {ConvertIsoToIndonesianDate(markerDetail?.updated_at)}</h2>
                        </div>
                        <h1 className="text-lg font-semibold text-black"
                            onClick={onCloseDetail}
                        >
                            <X />
                        </h1>
                    </div>

                    <div className="mt-4 px-4">
                        <img src={uploadedImage} className="image-commodity rounded"></img>
                    </div>

                    <h2 className="text-sm mt-4 px-4 font-medium">Hari setelah tanam</h2>
                    <div className="mx-4 mt-2">
                        <h2 className="text-base">{markerDetail?.hst}</h2>
                    </div>


                    {
                        markerDetail?.planting_history && (
                            <div className="px-4 text-sm ">
                                <h2 className="mt-4 font-medium">History Tanam</h2>
                                {
                                    markerDetail?.planting_history?.commodity_mt_1 && (
                                        <div className="flex justify-between mt-2">
                                            <span>{ConvertCommodityTypeToIndonesianCommodity(markerDetail?.planting_history?.commodity_mt_1)}</span>
                                            <span className="font-semibold">
                                                {ConvertDateMonthToIndonesianMonth(markerDetail?.planting_history?.tanam_mt_1)}
                                                &nbsp;-&nbsp;
                                                {ConvertDateMonthToIndonesianMonth(markerDetail?.planting_history?.panen_mt_1)}
                                            </span>
                                        </div>
                                    )
                                }
                                {
                                    markerDetail?.planting_history?.commodity_mt_2 && (
                                        <div className="flex justify-between mt-2">
                                            <span>{ConvertCommodityTypeToIndonesianCommodity(markerDetail?.planting_history?.commodity_mt_2)}</span>
                                            <span className="font-semibold">
                                                {ConvertDateMonthToIndonesianMonth(markerDetail?.planting_history?.tanam_mt_2)}
                                                &nbsp;-&nbsp;
                                                {ConvertDateMonthToIndonesianMonth(markerDetail?.planting_history?.panen_mt_2)}
                                            </span>
                                        </div>
                                    )
                                }
                                {
                                    markerDetail?.planting_history?.commodity_mt_3 && (
                                        <div className="flex justify-between mt-2">
                                            <span>{ConvertCommodityTypeToIndonesianCommodity(markerDetail?.planting_history?.commodity_mt_3)}</span>
                                            <span className="font-semibold">
                                                {ConvertDateMonthToIndonesianMonth(markerDetail?.planting_history?.tanam_mt_3)}
                                                &nbsp;-&nbsp;
                                                {ConvertDateMonthToIndonesianMonth(markerDetail?.planting_history?.panen_mt_3)}
                                            </span>
                                        </div>
                                    )
                                }
                            </div>
                        )
                    }

                    {(markerDetail?.username == username) && (
                        <div className="fixed bottom-0 left-0 w-full bg-white p-5">
                            <div className="flex space-x-3 text-sm">
                                <button
                                    className="flex-1 border border-red-500 text-red-500 p-2 rounded font-semibold"
                                    onClick={onDeleteDetail}
                                >Hapus</button>
                                <button
                                    className="flex-1 bg-blue text-white p-2 rounded font-semibold"
                                    onClick={onEditDetail}
                                >Ubah</button>
                            </div>
                        </div>
                    )
                    }

                </div>
            </Drawer>

            <Drawer
                open={isEditOpen}
                placement="bottom"
                zIndex={999999}
                height={650}
                className="drawer-body-modified rounded-xl"
                closeIcon={false}
            >
                <div className="relative h-full">
                    <div className="flex justify-between items-center px-4 pt-3">
                        <h1 className="text-base font-semibold text-black">Ubah Penanda</h1>
                        <h1 className="text-xs font-semibold text-black"
                            onClick={onCloseEdit}
                        >
                            <X />
                        </h1>
                    </div>

                    <h2 className="text-sm mt-4 px-4 font-medium"><span className="font-semibold text-red-600">*</span> Pilih Komoditas</h2>
                    <div className="text-center w-full flex justify-around px-3 mt-2">
                        <div style={{ width: '70px' }}
                            className={`border rounded text-center mx-2 py-3 
                                ${surveyCommodity === "padi" ? "border-blue" : "border-gray-300"
                                }`}
                            onClick={() => {
                                clickedCommodity("padi")
                            }}
                        >
                            <img src="/padi.png" className="icon-commodity ml-auto mr-auto"></img>
                            <div className="font-semibold text-xs mt-1.5">
                                Padi
                            </div>
                        </div>
                        <div style={{ width: '70px' }}
                            className={`border rounded text-center mx-2 py-3
                                ${surveyCommodity === "jagung" ? "border-blue" : "border-gray-300"
                                }`}
                            onClick={() => {
                                clickedCommodity("jagung")
                            }}
                        >
                            <img src="/jagung.png" className="icon-commodity ml-auto mr-auto"></img>
                            <div className="font-semibold text-xs mt-1.5">
                                Jagung
                            </div>
                        </div>
                        <div style={{ width: '70px' }}
                            className={`border rounded text-center mx-2 py-3
                                ${surveyCommodity === "tebu" ? "border-blue" : "border-gray-300"
                                }`}
                            onClick={() => {
                                clickedCommodity("tebu")
                            }}
                        >
                            <img src="/tebu.png" className="icon-commodity ml-auto mr-auto"></img>
                            <div className="font-semibold text-xs mt-1.5">
                                Tebu
                            </div>
                        </div>
                        <div style={{ width: '70px' }}
                            className={`border rounded text-center mx-2 py-3
                                ${surveyCommodity === "other" ? "border-blue" : "border-gray-300"
                                }`}
                            onClick={() => {
                                clickedCommodity("other")
                            }}
                        >
                            <img src="/other.png" className="icon-commodity ml-auto mr-auto"></img>
                            <div className="font-semibold text-xs mt-1.5">
                                Lainnya
                            </div>
                        </div>
                    </div>

                    <h2 className="text-sm mt-4 px-4 font-medium">Hari setelah tanam <span className="font-light text-gray-500"> (Opsional)</span></h2>
                    <div className="mx-4 mt-2">
                        <Input className="input-custom" placeholder="Masukkan HST"
                            value={surveyHST}
                            onChange={onChangeHST}
                            inputMode="numeric"
                            pattern="[0-9]*"
                            type="tel"
                            onKeyPress={handleKeyPress}
                        ></Input>
                    </div>


                    <h2 className="text-sm mt-4 px-4 font-medium"><span className="font-semibold text-red-600">*</span> Foto komoditas</h2>
                    <div className="px-4 mt-2">
                        <div className="image-commodity-container-empty border border-gray-300 rounded "
                            onClick={handleSurveyPhoto}
                        >

                            {uploadedImage && (
                                <>
                                    <img src={uploadedImage} className="image-commodity-container rounded" />
                                    {/* Overlay for darkening effect */}
                                    <div className="absolute inset-0 bg-black opacity-50"></div>
                                </>
                            )}

                            {/* Centered content */}
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 text-sm">
                                <div className={uploadedImage ? "text-white" : "text-gray-500"}>
                                    <Camera className="block w-full" size={16} />
                                    <div className="mt-1 text-center">
                                        {uploadedImage ? "Ganti Foto" : "Tambah foto komoditas"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


                    {
                        dataHistory && (
                            <div className="px-4 text-sm ">
                                <h2 className="mt-4 font-medium">History Tanam</h2>
                                {
                                    dataHistory.commodity_mt_1 && (
                                        <div className="flex justify-between mt-2">
                                            <span>{ConvertCommodityTypeToIndonesianCommodity(dataHistory.commodity_mt_1)}</span>
                                            <span className="font-semibold">
                                                {ConvertDateMonthToIndonesianMonth(dataHistory.tanam_mt_1)}
                                                &nbsp;-&nbsp;
                                                {ConvertDateMonthToIndonesianMonth(dataHistory.panen_mt_1)}
                                            </span>
                                        </div>
                                    )
                                }
                                {
                                    dataHistory.commodity_mt_2 && (
                                        <div className="flex justify-between mt-2">
                                            <span>{ConvertCommodityTypeToIndonesianCommodity(dataHistory.commodity_mt_2)}</span>
                                            <span className="font-semibold">
                                                {ConvertDateMonthToIndonesianMonth(dataHistory.tanam_mt_2)}
                                                &nbsp;-&nbsp;
                                                {ConvertDateMonthToIndonesianMonth(dataHistory.panen_mt_2)}
                                            </span>
                                        </div>
                                    )
                                }
                                {
                                    dataHistory.commodity_mt_3 && (
                                        <div className="flex justify-between mt-2">
                                            <span>{ConvertCommodityTypeToIndonesianCommodity(dataHistory.commodity_mt_3)}</span>
                                            <span className="font-semibold">
                                                {ConvertDateMonthToIndonesianMonth(dataHistory.tanam_mt_3)}
                                                &nbsp;-&nbsp;
                                                {ConvertDateMonthToIndonesianMonth(dataHistory.panen_mt_3)}
                                            </span>
                                        </div>
                                    )
                                }
                            </div>
                        )
                    }


                    <div className="absolute bottom-0 w-full">
                        <div className="px-4 ">
                            <div
                                className={`mt-4 font-semibold text-white text-center text-sm p-2 rounded ${surveyCommodity != "" ? 'bg-blue' : 'bg-blue-200'}`}
                                disabled={surveyCommodity != "" ? false : true}
                                onClick={handleFinishEdit}
                            >
                                Simpan Perubahan
                            </div>
                            <div
                                className={`mb-4 mt-2 font-semibold text-black text-center text-sm p-2 rounded border border-gray-400`}
                                disabled={surveyCommodity != "" ? false : true}
                                onClick={onOpenHistory}
                            >
                                + Tambah Histori Tanam
                            </div>
                        </div>
                    </div>

                </div>
            </Drawer>

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




        </main >
    )
}