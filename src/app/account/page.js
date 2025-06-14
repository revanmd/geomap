'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/account/Header';
import Stats from '@/components/account/Stats';
import AccountInfo from '@/components/account/AccountInfo';
import OtherOptions from '@/components/account/OtherOptions';
import BottomNav from '@/components/account/BottomNav';
import { useLoading } from '@/context/loadingContext';
import { useUser } from '@/context/userContext';
import {authService} from '@/services/authService';
import {markerService} from '@/services/markerService';

export default function AccountReward() {
    const { user: userData, refreshUser, clearUser } = useUser();
    const [summaryData, setSummaryData] = useState()

    useEffect(() => {
        // Refresh user data to ensure it's up to date
        refreshUser();

        const fetchSummary = async () => {
            const summary = await markerService.summary()
            setSummaryData(summary.data)
        }
        fetchSummary()
        
    }, [])


    const router = useRouter();
    const { showLoading, hideLoading } = useLoading();

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
            clearUser() // Clear user data from context
            router.push("/")
        } catch (error) { }
    }

    return (
        <div>
            <div className=" bg-white min-h-screen">
                <Header data={userData} />
                <div className="relative -mt-24 px-4">
                    <Stats stats={summaryData} />
                    <AccountInfo user={userData} />
                    <OtherOptions onLogout={handleLogout} />
                </div>
            </div>
            <BottomNav
                onMenuSurvey={handleMenuSurvey}
                onMenuSummary={handleMenuSummary}
            />
        </div>
    );
}
