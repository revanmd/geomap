'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/account/Header';
import Stats from '@/components/account/Stats';
import AccountInfo from '@/components/account/AccountInfo';
import OtherOptions from '@/components/account/OtherOptions';
import BottomNav from '@/components/navigation/BottomNav';
import { useUser } from '@/context/userContext';
import { authService } from '@/services/authService';
import { markerService } from '@/services/markerService';

export default function AccountReward() {
    const { user: userData, refreshUser, clearUser } = useUser();
    const [summaryData, setSummaryData] = useState()

    useEffect(() => {
        refreshUser();

        const fetchSummary = async () => {
            const summary = await markerService.summary()
            setSummaryData(summary.data)
        }
        fetchSummary()

    }, [])


    const router = useRouter();
    const handleLogout = async () => {
        try {
            await authService.logout()
            clearUser()
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


                <div className="fixed bottom-0 w-screen">
                    <BottomNav />
                </div>
            </div>
        </div>
    );
}
