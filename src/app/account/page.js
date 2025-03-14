"use client"

// components/AccountPage.jsx
import React, { useEffect, useState } from 'react';
import { ChevronLeft, Edit, Shield, HelpCircle, LogOut, Pencil, LockKeyhole, Map, SquareMenu, CircleUserRound } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { message } from 'antd';
import { userService } from '@/services/userService';
import { useLoading } from '@/context/loadingContext';

export default function AccountPage() {
    const router = useRouter()
    const { showLoading, hideLoading } = useLoading();

    const [user, setUser] = useState()

    ////////////////////////////////
    /// NAVIGATION

    const handleMenuSurvey = () => {
        showLoading("Mohon tunggu..")
        setTimeout(() => {
            router.push("/collaborator?navigation=view")
            hideLoading()
        }, 700)


    }
    const handleMenuSummary = () => {
        showLoading("Mohon tunggu..")
        setTimeout(() => {
            router.push("/collaborator?navigation=summary")
            hideLoading()
        }, 700)

    }

    const handleLogout = async () => {
        try {
            await authService.logout()
            router.push("/")
        } catch (error) {}
    }

    const fetchUser = async () => {
        try {
            const current = await userService.current()
            if(current){
                setUser(current.data)
            }
        } catch (error) {}

    }

    useEffect(()=>{
        fetchUser()
    },[])

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Header */}
            <div className="flex items-center p-4 border-b relative">
                <h1 className="text-lg font-medium mx-auto">Akun</h1>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
                {/* Account Info Section */}
                <div className="p-4 border-b">
                    <h2 className="text-sm text-gray-500 mb-4 font-semibold">Info Akun</h2>

                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <p className="text-xs text-gray-500 font-regular">Username</p>
                            <p className="text-sm font-medium text-black">{user?.name}</p>
                        </div>
                    </div>

                    <div className="">
                        <div>
                            <p className="text-xs text-gray-500 font-regular">NIK PI SMART</p>
                            <p className="text-sm font-medium text-black">{user?.username}</p>
                        </div>
                    </div>
                </div>

                {/* Other Options Section */}
                <div className="p-4">
                    <h2 className="text-sm text-gray-500 mb-4 font-semibold">Lainnya</h2>

                    <div className="flex items-center py-2">
                        <LockKeyhole size={18} className='text-gray-600 mr-2' />
                        <span className='text-sm font-regular text-black'>Kebijakan Privasi</span>
                    </div>

                    <div href="/help" className="flex items-center py-2">
                        <HelpCircle size={18} className="text-gray-600 mr-2" />
                        <span className='text-sm font-regular text-black'>Pusat Bantuan</span>
                    </div>
                </div>

                {/* Logout Button */}
                <div className="p-4">
                    <button className="w-full border border-gray-300 rounded-md py-3 flex justify-center items-center text-gray-600"
                        onClick={handleLogout}
                    >
                        <LogOut size={18} className='mr-3' />
                        <span className='text-base font-semibold'>Keluar</span>
                    </button>
                </div>

                {/* Version */}
                <div className="text-center text-xs text-gray-400 mt-4">
                    Versi 0.0.1(1)
                </div>
            </div>

            {/* Bottom Navigation */}
            <div className="relative w-screen justify-around py-3 flex border bg-white">
                <div className={`flex flex-col items-center font-medium text-gray-500`}
                    onClick={handleMenuSurvey}
                >
                    <Map size={22} />
                    <span className="text-xs mt-1">Jelajah</span>
                </div>
                <div className={`flex flex-col items-center font-medium text-gray-500`}
                    onClick={handleMenuSummary}
                >
                    <SquareMenu size={22} />
                    <span className="text-xs mt-1">Data Survey</span>
                </div>
                <div className={`flex flex-col items-center font-medium text-blue`}>
                    <CircleUserRound size={22} />
                    <span className="text-xs mt-1">Akun</span>
                </div>
            </div>
        </div>
    );
}