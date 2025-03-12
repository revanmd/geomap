"use client"

import { Modal } from "antd"
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react"

export default function Layout({ children }) {
    const router = useRouter();
    const [isBack, setIsBack] = useState(false)

    const handleConfirmBack = () => {
        setIsBack(false)
        router.push("/")
    }

    const handleCancelBack = () => {
        setIsBack(false)
    }

    useEffect(() => {
        const handleBackButton = (event) => {
            event.preventDefault();
            setIsBack(true);
        };

        if (typeof window !== "undefined") {
            window.history.replaceState(null, "", window.location.href); // Ensure the current page is the initial state
            window.addEventListener("popstate", handleBackButton);

            return () => {
                window.removeEventListener("popstate", handleBackButton);
            };
        }
    }, []);

    return (
        <main>
            <Modal
                open={isBack}
                zIndex={999999999}
                footer={false}
                closable={false}
                closeIcon={false}
                className="modal-margin"
                centered
            >
                <div className="text-center text-base text-black font-semibold">Keluar</div>
                <p className="text-xs text-gray p-3"> Apakah anda yakin untuk keluar dari platform survey ?</p>
                <div className="flex justify-between space-x-3 text-xs mt-2">
                    <button className="flex-1 border border-red-500 text-red-500 font-semibold p-2 rounded"
                        onClick={handleCancelBack}
                    >Tidak</button>
                    <button className="flex-1 bg-blue text-white font-semibold p-2 rounded"
                        onClick={handleConfirmBack}
                    >Ya, Keluar</button>
                </div>
            </Modal>
            {children}
        </main>
    )
}