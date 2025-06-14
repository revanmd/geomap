"use client"

import { useRouter } from 'next/navigation';

export default function Header() {
    const router = useRouter();

    return (
        <div className="flex p-3 border-b relative bg-white items-center">
            <button
                onClick={() => router.back()}
                className="absolute left-3"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 18l-6-6 6-6" />
                </svg>
            </button>
            <h1 className="text-center text-lg font-medium flex-1">Leaderboard</h1>
        </div>
    );
}