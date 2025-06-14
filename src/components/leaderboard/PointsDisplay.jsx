"use client"

export default function PointsDisplay({ userRank }) {
    return (
        <div className="flex flex-col items-center pt-4 bg-white">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-2">
                <img src="/rewards-icon.png"></img>
            </div>
            <div>
                <span className='px-3 py-1 font-semibold rounded-xl bg-gray-100 text-indigo-600 text-sm'> #{userRank?.rank}</span>
                <span className='ml-2 text-2xl font-semibold text-gray-600'>{userRank?.point} Poin</span>
            </div>
            <div className="text-gray-500 text-xs mt-2">Update terakhir {userRank?.last_updated_at}</div>
        </div>
    );
}