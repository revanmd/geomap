import { CircleUserRound, Map, SquareMenu } from "lucide-react";

export default function BottomNav({ onMenuSurvey, onMenuSummary }) {
    return (
        <div className="fixed bottom-0 w-screen justify-around py-3 flex border bg-white">
            <div className={`flex flex-col items-center font-medium text-gray-500`}
                onClick={onMenuSurvey}
            >
                <Map size={22} />
                <span className="text-xs mt-1">Jelajah</span>
            </div>
            <div className={`flex flex-col items-center font-medium text-gray-500`}
                onClick={onMenuSummary}
            >
                <SquareMenu size={22} />
                <span className="text-xs mt-1">Data Survey</span>
            </div>
            <div className={`flex flex-col items-center font-medium text-blue`}>
                <CircleUserRound size={22} />
                <span className="text-xs mt-1">Akun</span>
            </div>
        </div>
    )
}