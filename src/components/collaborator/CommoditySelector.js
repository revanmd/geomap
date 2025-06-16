export default function CommoditySelector({ selectedCommodity, onSelect, disabled = false }) {
    const commodities = [
        { id: "padi", name: "Padi", icon: "/padi.png" },
        { id: "jagung", name: "Jagung", icon: "/jagung.png" },
        { id: "tebu", name: "Tebu", icon: "/tebu.png" },
        { id: "other", name: "Lainnya", icon: "/other.png" },
    ];

    return (
        <div className="text-center w-full flex justify-around px-3 mt-2">
            {commodities.map((commodity) => (
                <div
                    key={commodity.id}
                    style={{ width: '70px' }}
                    className={`border rounded text-center mx-2 py-3 transition-colors
                        ${selectedCommodity === commodity.id ? "border-blue" : "border-gray-300"}
                        ${disabled 
                            ? "opacity-50 cursor-not-allowed" 
                            : "cursor-pointer hover:border-blue-400"
                        }`}
                    onClick={disabled ? () => {} : () => onSelect(commodity.id)}
                >
                    <img 
                        src={commodity.icon} 
                        className="icon-commodity ml-auto mr-auto"
                        alt={commodity.name}
                    />
                    <div className="font-semibold text-xs mt-1.5">
                        {commodity.name}
                    </div>
                </div>
            ))}
        </div>
    );
} 