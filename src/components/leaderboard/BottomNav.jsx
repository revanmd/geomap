"use client"

import { Map, SquareMenu, CircleUserRound } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function BottomNav() {
    const router = useRouter();

    const handleMenuSurvey = () => {
        router.push("/collaborator?navigation=view");
    }

    const handleMenuSummary = () => {
        router.push("/collaborator?navigation=summary");
    }

    const handleMenuAccount = () => {
        router.push("/account");
    }

    return (
        <div className="fixed bottom-0 w-screen justify-around py-3 flex border bg-white">
            <div className="flex flex-col items-center font-medium text-gray-500"
                onClick={handleMenuSurvey}
            >
                <Map size={22} />
                <span className="text-xs mt-1">Jelajah</span>
            </div>
            <div className="flex flex-col items-center font-medium text-gray-500"
                onClick={handleMenuSummary}
            >
                <SquareMenu size={22} />
                <span className="text-xs mt-1">Data Survey</span>
            </div>
            <div className="flex flex-col items-center font-medium text-gray-500"
                onClick={handleMenuAccount}
            >
                <CircleUserRound size={22} />
                <span className="text-xs mt-1">Akun</span>
            </div>
        </div>
    );
}