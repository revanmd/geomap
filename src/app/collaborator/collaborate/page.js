"use client"

import Link from "next/link";
import { Map, SquareMenu, CircleUserRound, Layers, Crosshair, Compass, Search, Info, ArrowLeft, X } from "lucide-react";
import Webcam from "react-webcam";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { message } from "antd";
import { useMessage } from "@/context/messageContext";
import { CancleIcon, ChecklistIcon, InfoIcon } from "@/components/icon";

// Dynamic Import Component
const MapComponent = dynamic(() => import("@/components/map"), {
    ssr: false,
});


export default function Collaborator() {
    const [event, setEvent] = useState('view')
    const [screen, setScreen] = useState('minimize')

    return (
        <main>
            <MapComponent
                event={event}
                screen={screen}
                gps={false}
                expandedBar={true}
            />

            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    zIndex: 999,

                }}
                className="bg-white pt-20 w-full pb-3 overflow-hidden"
            >
                <div className="flex justify-around">
                    <div className="w-20 text-blue text-center">
                        <div className="text-xl font-semibold">27</div>
                        <div className="text-xs leading-[1]">Semua</div>
                    </div>
                    <div className="w-20 text-gray-500 text-center">
                        <div className="text-xl font-semibold">27</div>
                        <div className="text-xs leading-[1]">Padi</div>
                    </div>
                    <div className="w-20 text-gray-500 text-center">
                        <div className="text-xl font-semibold">27</div>
                        <div className="text-xs leading-[1]">Jagung</div>
                    </div>
                    <div className="w-20 text-gray-500 text-center">
                        <div className="text-xl font-semibold">27</div>
                        <div className="text-xs leading-[1]">Tebu</div>
                    </div>
                    <div className="w-20 text-gray-500 text-center">
                        <div className="text-xl font-semibold">27</div>
                        <div className="text-xs leading-[1]">Lainnya</div>
                    </div>
                </div>
            </ div>

            <div
                style={{
                    position: 'absolute',
                    bottom: 0,
                    zIndex: 9999
                }}
            >

                <div className="relative w-screen justify-around py-3 flex border bg-white">
                    <Link href="/collaborator/main" className="flex flex-col items-center text-gray-500 font-medium">
                        <Map size={22} />
                        <span className="text-xs">Jelajah</span>
                    </Link>
                    <Link href="/collaborator/collaborate" className="flex flex-col items-center text-blue">
                        <SquareMenu size={22} />
                        <span className="text-xs">Data Survey</span>
                    </Link>
                    <Link href="/account" className="flex flex-col items-center text-gray-500">
                        <CircleUserRound size={22} />
                        <span className="text-xs">Akun</span>
                    </Link>
                </div>

            </div>


        </main>
    )
}