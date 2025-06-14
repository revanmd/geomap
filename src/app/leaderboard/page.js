"use client"

import React, { useEffect, useState } from 'react';
import Header from '@/components/leaderboard/Header';
import BottomNav from '@/components/leaderboard/BottomNav';
import LeaderboardTable from '@/components/leaderboard/LeaderboardTable';
import PointsDisplay from '@/components/leaderboard/PointsDisplay';
import Description from '@/components/leaderboard/Description';
import { analyticService } from '@/services/analyticService';
import { useUser } from '@/context/userContext';

export default function Progress() {
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [userRank, setUserRank] = useState(null);
    const { user } = useUser();

    const fetchLeaderboard = async () => {
        const response = await analyticService.getLeaderboard();
        console.log(user)
        const data = response.data;
        if(data){
            const userLeaderboard = data.filter(item => item.username === user?.username);
            setLeaderboardData(data);
            setUserRank(userLeaderboard[0]);
        }
    }

    useEffect(() => {
        fetchLeaderboard();
    }, [user]);
    

    return (
        <div className="h-screen w-screen bg-white">
            <Header />

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
                <PointsDisplay userRank={userRank} />
                <Description />
                <LeaderboardTable data={leaderboardData} userRank={userRank} />
            </div>

            <BottomNav />
        </div>
    )
}