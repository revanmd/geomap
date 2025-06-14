export default function SummaryStats({ summary }) {
    const stats = [
        { label: 'Semua', count: summary?.count_total || 0 },
        { label: 'Padi', count: summary?.count_padi || 0 },
        { label: 'Jagung', count: summary?.count_jagung || 0 },
        { label: 'Tebu', count: summary?.count_tebu || 0 },
        { label: 'Lainnya', count: summary?.count_other || 0 }
    ];

    return (
        <div
            style={{
                position: 'absolute',
                top: 0,
                zIndex: 999,
            }}
            className="bg-white pt-16 w-full pb-3 overflow-hidden"
        >
            <div className="flex justify-around">
                {stats.map((stat) => (
                    <div key={stat.label} className="w-20 text-gray-500 text-center cursor-pointer">
                        <div className="text-xl font-semibold">{stat.count}</div>
                        <div className="text-xs leading-[1]">{stat.label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
} 