import { Map, SquareMenu, CircleUserRound } from "lucide-react";

export default function NavigationBar({ currentView, onNavigate }) {
    const navItems = [
        {
            id: 'view',
            icon: Map,
            label: 'Jelajah',
            action: () => onNavigate('view')
        },
        {
            id: 'summary',
            icon: SquareMenu,
            label: 'Data Survey',
            action: () => onNavigate('summary')
        },
        {
            id: 'account',
            icon: CircleUserRound,
            label: 'Akun',
            action: () => onNavigate('account')
        }
    ];

    const getActiveState = (id) => {
        if (id === 'view' && currentView === 'explore') return true;
        return currentView === id;
    };

    return (
        <div className="relative w-screen justify-around py-3 flex border bg-white">
            {navItems.map((item) => (
                <div
                    key={item.id}
                    className={`flex flex-col items-center font-medium cursor-pointer
                        ${getActiveState(item.id) ? "text-blue" : "text-gray-500"}`}
                    onClick={item.action}
                >
                    <item.icon size={22} />
                    <span className="text-xs mt-1">{item.label}</span>
                </div>
            ))}
        </div>
    );
} 