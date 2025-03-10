"use client"

import Link from "next/link";
import { Map, SquareMenu, CircleUserRound, Layers, Crosshair, Compass, Search, Info, ArrowLeft, X } from "lucide-react";
import Webcam from "react-webcam";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { message } from "antd";
import { useMessage } from "@/context/messageContext";
import { CancleIcon, ChecklistIcon, InfoIcon } from "@/components/icon";
import { markerService } from "@/services/markerService";
import { useLoading } from "@/context/loadingContext";

// Dynamic Import Component
const MapComponent = dynamic(() => import("@/components/map"), {
    ssr: false,
});


export default function Collaborator() {
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
    const [event, setEvent] = useState('view')
    const [surveyStep, setSurveyStep] = useState(0)
    const [screen, setScreen] = useState('minimize')

    const callbackPressMap = () => {
        setSurveyStep(1)
    }

    const clickedAddMarker = () => {
        setEvent('survey')
    }


    ////////////////////////////////////////////////////////////////
    //// SURVEY

    const [surveyCommodity, setSurveyCommodity] = useState("")
    const clickedCommodity = (commodityType) => {
        setSurveyCommodity(commodityType)
    }

    const clickedCloseSurvey = () => {
        setEvent('view')
        resetSurvey()
    }

    const nextSurveiStep = () => {
        setSurveyStep(surveyStep + 1)
    }

    const prevSurveiStep = () => {
        if (surveyStep != 0) {
            setSurveyStep(surveyStep - 1)
        }
    }

    const resetSurvey = () => {
        setSurveyCommodity("")
        setSurveyStep(0)
        setCapturedImage("")
    }

    const finishSurvey = async () => {
        showLoading("Mohon tunggu ...")

        const markerLocation = mapFunctions.getMarkerAddLocation()
        const marker = {
            commodity: surveyCommodity,
            location: {
                lat: markerLocation.lat,
                lon: markerLocation.lng
            }
        }

        // handle send the request
        try {
            await markerService.createMarker(marker);
            // Flagging as success
            mapFunctions.appendMarker(surveyCommodity)
            showMessage("Komoditas berhasil ditambah", <ChecklistIcon />)
        } catch (error) {
            showMessage("Gagal menambahkan komoditas", <CancleIcon />)
        }
        setEvent("survey")
        resetSurvey()
        hideLoading()
    }

    ////////////////////////////////////////////////////////////////
    //// WEBCAM

    const videoConstraints = {
        facingMode: "environment"
    };
    const webcamRef = useRef(null)
    const [capturedImage, setCapturedImage] = useState("");
    const captureWebcam = useCallback(() => {
        if (webcamRef.current) {
            const imageSrc = webcamRef.current.getScreenshot();
            setCapturedImage(imageSrc);
        }
    }, [webcamRef]);


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

    useEffect(()=>{
        if(mapFunctions){
            fetchMarker()
        }
    },[mapFunctions])


    return (
        <main>
            <MapComponent
                event={event}
                screen={screen}
                callbackPressMap={callbackPressMap}
                onMapReady={handleMapReady}
            />


            {
                event == "view" && (
                    <div
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            zIndex: 9999
                        }}
                    >
                        <div className="glass-effect w-screen px-3 py-3">
                            <button
                                onClick={clickedAddMarker}
                                className="w-full bg-blue text-white text-center font-semibold rounded py-2 px-2 shadow-lg text-sm"
                            >+ Tambahkan Penanda</button>
                        </div>

                        <div className="relative w-screen justify-around py-3 flex border bg-white">
                            <Link href="/collaborator/main" className="flex flex-col items-center text-blue font-medium">
                                <Map size={22} />
                                <span className="text-xs">Jelajah</span>
                            </Link>
                            <Link href="/collaborator/collaborate" className="flex flex-col items-center text-gray-500">
                                <SquareMenu size={22} />
                                <span className="text-xs">Data Survey</span>
                            </Link>
                            <Link href="/account" className="flex flex-col items-center text-gray-500">
                                <CircleUserRound size={22} />
                                <span className="text-xs">Akun</span>
                            </Link>
                        </div>

                    </div>
                )
            }

            {
                event == "survey" && (
                    <div
                        style={{
                            position: 'absolute',
                            top: 20,
                            left: 0,
                            zIndex: 99993
                        }}
                    >
                        <div className="bg-white ml-5 p-3 rounded-full text-blue shadow-lg"
                            onClick={clickedCloseSurvey}
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
                                    Silakan pilih titik di dalam radius area Anda untuk menetapkan komoditas yang tersedia
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
                            zIndex: 9999
                        }}
                        className="bg-white w-screen"
                    >
                        <div className="flex justify-between px-5 pt-5 pb-2 items-center">
                            <div className="flex font-semibold text-lg text-black">
                                Tandai dengan komoditas
                            </div>
                            <div className="flex text-gray">
                                <X size={24} />
                            </div>
                        </div>

                        <div className="py-1 text-center w-full flex justify-around px-5">
                            <div style={{ width: '70px' }}
                                className={`border rounded text-center mx-2 py-3 my-3 
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
                                className={`border rounded text-center mx-2 py-3 my-3 
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
                                className={`border rounded text-center mx-2 py-3 my-3 
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
                                className={`border rounded text-center mx-2 py-3 my-3 
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

                        <div
                            className={`mb-3 font-semibold text-white text-center text-sm p-3 mx-6 rounded ${surveyCommodity != "" ? 'bg-blue' : 'bg-blue-200'}`}
                            disabled={surveyCommodity != "" ? false : true}
                            onClick={nextSurveiStep}
                        >
                            + Tambah Foto
                        </div>
                    </div>
                )
            }
            {
                (event == "survey" && surveyStep == 2) && (
                    <div className="w-screen h-[100dvh] bg-black absolute top-0"
                        style={{
                            zIndex: 99992
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
                                zIndex: 99992
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
                                        className={`text-sm font-semibold text-white text-center text-sm p-3 mx-6 rounded bg-blue cursor-pointer mb-3`}
                                        onClick={finishSurvey}
                                    >
                                        Simpan Foto
                                    </div>
                                    <div
                                        className={`text-sm border border-gray-300  font-semibold text-center text-sm p-3 mx-6 rounded cursor-pointer`}
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
                                        className={`text-sm mb-3 border border-gray-300 font-semibold text-white text-center text-sm p-3 my-3 mx-6 rounded bg-blue cursor-pointer`}
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


        </main>
    )
}