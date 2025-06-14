"use client"

export default function LeaderboardTable({ data, userRank }) {

    return (
        <div className='bg-white px-5 text-sm'>
            <div className="bg-white">
                <div className="px-4 py-2 bg-gray-100 border-x border-t border-gray-200 rounded-t-lg">
                    <div className="grid grid-cols-12 font-semibold">
                        <div className="col-span-2 ml-2">Rank</div>
                        <div className="col-span-6">Nama</div>
                        <div className="col-span-4 text-right mr-2">Point</div>
                    </div>
                </div>
                <div className='border border-gray-200 rounded-b-lg'>
                    {data.map((item) => {
                        const isCurrentUser = item?.rank === userRank?.rank;
                        return (
                            <div 
                                key={item?.rank} 
                                className={`px-4 py-2 ${
                                    isCurrentUser ? "bg-blue-100 rounded-xl text-lg font-semibold" : ""
                                }`}
                            >
                                <div className="grid grid-cols-12">
                                    <div className="col-span-2 ml-2">{item?.rank}</div>
                                    <div className="col-span-6 truncate w-52">{item?.name}</div>
                                    <div className="col-span-4 text-right text-blue-600 font-semibold mr-2">
                                        {item?.point?.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}