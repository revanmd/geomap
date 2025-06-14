export default function StatItem({ icon, value, total, label, bgColor }) {
    return (
        <div className="flex flex-col items-center">
            <div className={`${bgColor} w-12 h-12 rounded-full flex items-center justify-center mb-2`}>
                <div className="text-white w-6 h-6">
                    {icon}
                </div>
            </div>
            <div className="text-center">
                <div className="flex items-baseline justify-center gap-1">
                    <span className="text-lg font-semibold">{value}</span>
                    <span className="text-xs text-gray-500">/{total}</span>
                </div>
                <div className="text-xs text-gray-600 mt-1">{label}</div>
            </div>
        </div>
    );
}