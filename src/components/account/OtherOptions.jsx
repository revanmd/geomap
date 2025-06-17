import { HelpCircle, LogOut } from "lucide-react";

export default function OtherOptions({ onLogout }) {
    return (
        <div>
            <h2 className="font-semibold text-medium mb-3 mt-5">Lainnya</h2>

            <div href="/help" className="flex items-center py-1">
                <HelpCircle size={18} className="text-gray-600 mr-2" />
                <span className='text-sm font-regular text-black'>Pusat Bantuan</span>
            </div>

            <div className="mt-5 mb-20">
                <button className="w-full border border-gray-300 rounded-md py-3 flex justify-center items-center text-gray-600"
                    onClick={onLogout}
                >
                    <LogOut size={18} className='mr-3' />
                    <span className='text-base font-semibold'>Keluar</span>
                </button>
            </div>
        </div>
    )
}