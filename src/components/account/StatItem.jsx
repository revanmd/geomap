export default function StatItem({ icon, value, total, label, bgColor }) {
    return (
        <div className="flex flex-col items-center">
            <div className={`${bgColor} w-11 h-11 rounded-full flex items-center justify-center`}>
                <div className="text-white w-5 h-5">
                    {icon}
                </div>
            </div>
            <div className="text-center">
                <div className="flex items-baseline justify-center gap-1">
                    <span className="text-lg font-semibold">{value}</span>
                    <span className="text-xs text-gray-500">/{total}</span>
                </div>
                <div className="text-xs text-gray-600">{label}</div>
            </div>
        </div>
    );
}