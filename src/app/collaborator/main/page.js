"use client"

import Link from "next/link";
import { Map, SquareMenu, CircleUserRound, Layers, Crosshair, Compass, Search, Info, ArrowLeft, X } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";

// Dynamic Import Component
const MapComponent = dynamic(() => import("@/components/map"), {
    ssr: false,
});


export default function Collaborator() {
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

    const clickedCloseSurvey = () => {
        setEvent('view')
    }

    const nextSurveiStep = () => {
        setSurveyStep(surveyStep + 1)
    }

    const prevSurveiStep = () => {
        if (surveyStep != 0) {
            setSurveyStep(surveyStep - 1)
        }
    }

    return (
        <main>
            <MapComponent
                event={event}
                screen={screen}
                callbackPressMap={callbackPressMap}
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
                        <div className="glass-effect w-screen px-5 py-4">
                            <button
                                onClick={clickedAddMarker}
                                className="w-full bg-blue text-white text-center font-semibold rounded py-3 px-2 shadow-lg"
                            >+ Tambahkan Penanda</button>
                        </div>

                        <div className="relative w-screen justify-around py-3 flex border bg-white">
                            <Link href="/jelajah" className="flex flex-col items-center text-blue font-medium">
                                <Map size={23} />
                                <span className="text-sm">Jelajah</span>
                            </Link>
                            <Link href="/data-survey" className="flex flex-col items-center text-blue">
                                <SquareMenu size={23} />
                                <span className="text-sm">Data Survey</span>
                            </Link>
                            <Link href="/akun" className="flex flex-col items-center text-blue">
                                <CircleUserRound size={23} />
                                <span className="text-sm">Akun</span>
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
                            zIndex: 9999
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
                                <div className="w-8 flex mr-3">
                                    <div className="text-xs text-white bg-blue rounded-full w-5 h-5 text-center">
                                        i
                                    </div>
                                </div>
                                <div className="flex-auto text-sm font-semibold">
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
                            <div style={{width:'70px'}} className="border border-gray-300 rounded text-center mx-2 py-3 my-3">
                                <img src="/padi.png" className="icon-commodity ml-auto mr-auto"></img>
                                <div className="font-semibold text-sm mt-1.5">
                                    Padi
                                </div>
                            </div>
                            <div style={{width:'70px'}} className="border border-gray-300 rounded text-center mx-2 py-3 my-3">
                                <img src="/jagung.png" className="icon-commodity ml-auto mr-auto"></img>
                                <div className="font-semibold text-sm mt-1.5">
                                    Jagung
                                </div>
                            </div>
                            <div style={{width:'70px'}} className="border border-gray-300 rounded text-center mx-2 py-3 my-3">
                                <img src="/tebu.png" className="icon-commodity ml-auto mr-auto"></img>
                                <div className="font-semibold text-sm mt-1.5">
                                    Tebu
                                </div>
                            </div>
                            <div style={{width:'70px'}} className="border border-gray-300 rounded text-center mx-2 py-3 my-3">
                                <img src="/other.png" className="icon-commodity ml-auto mr-auto"></img>
                                <div className="font-semibold text-sm mt-1.5">
                                    Lainnya
                                </div>
                            </div>
                        </div>

                        <div className="mb-3 font-semibold text-white bg-blue text-center text-base p-3 mx-6 rounded">
                            + Tambah Foto
                        </div>
                    </div>
                )
            }
        </main>
    )
}