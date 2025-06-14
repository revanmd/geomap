import { Camera } from "lucide-react";
import { Input } from "antd";
import CommoditySelector from "./CommoditySelector";
import { ConvertCommodityTypeToIndonesianCommodity, ConvertDateMonthToIndonesianMonth } from "@/utility/utils";

export default function SurveyDrawer({
    surveyStep,
    surveyCommodity,
    surveyHST,
    capturedImage,
    uploadedImage,
    dataHistory,
    userType,
    onCommoditySelect,
    onHSTChange,
    onPhotoClick,
    onHistoryClick,
    onFinish,
    handleKeyPress,
    isHistoryOpen
}) {
    if (surveyStep !== 1 || isHistoryOpen) return null;

    return (
        <div
            style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                zIndex: 9999,
                transform: 'translateY(0)',
                transition: 'transform 0.2s ease-out'
            }}
            className="bg-white w-screen animate-slide-up"
        >
            <div className="flex justify-between items-center px-4 pt-4">
                <h1 className="text-base font-semibold text-black">Tandai dengan komoditas</h1>
            </div>

            <h2 className="text-sm mt-4 px-4 font-medium">
                <span className="font-semibold text-red-600">*</span> Pilih Komoditas
            </h2>
            
            <CommoditySelector 
                selectedCommodity={surveyCommodity}
                onSelect={onCommoditySelect}
            />

            <h2 className="text-sm mt-4 px-4 font-medium">
                Hari setelah tanam
                {userType !== "agronomist" && <span className="font-light text-gray-500"> (Opsional)</span>}
                {userType === "agronomist" && <span className="font-semibold text-red-600"> *</span>}
            </h2>
            <div className="mx-4 mt-2">
                <Input 
                    className="input-custom" 
                    placeholder="Masukkan HST"
                    value={surveyHST}
                    onChange={onHSTChange}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    type="tel"
                    onKeyPress={handleKeyPress}
                    required={userType === "agronomist"}
                />
            </div>

            <h2 className="text-sm mt-4 px-4 font-medium">
                <span className="font-semibold text-red-600">*</span> Foto komoditas
            </h2>
            <div className="px-4 mt-2">
                <div 
                    className="image-commodity-container-empty border border-gray-300 rounded"
                    onClick={onPhotoClick}
                >
                    {capturedImage && (
                        <>
                            <img src={uploadedImage} className="image-commodity-container rounded" alt="Preview" />
                            <div className="absolute inset-0 bg-black opacity-50"></div>
                        </>
                    )}

                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 text-sm">
                        <div className={capturedImage ? "text-white" : "text-gray-500"}>
                            <Camera className="block w-full" size={16} />
                            <div className="mt-1 text-center">
                                {capturedImage ? "Ganti Foto" : "Tambah foto komoditas"}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {dataHistory && (
                <div className="px-4 text-sm">
                    <h2 className="mt-4 font-medium">History Tanam</h2>
                    {[1, 2, 3].map((period) => {
                        const commodity = dataHistory[`commodity_mt_${period}`];
                        const tanam = dataHistory[`tanam_mt_${period}`];
                        const panen = dataHistory[`panen_mt_${period}`];

                        if (!commodity) return null;

                        return (
                            <div key={period} className="flex justify-between mt-2">
                                <span>{ConvertCommodityTypeToIndonesianCommodity(commodity)}</span>
                                <span className="font-semibold">
                                    {ConvertDateMonthToIndonesianMonth(tanam)}
                                    &nbsp;-&nbsp;
                                    {ConvertDateMonthToIndonesianMonth(panen)}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="mx-4">
                <button
                    className={`mt-4 font-semibold text-white text-center text-sm p-2 rounded w-full ${
                        (surveyCommodity !== "" && capturedImage) ? 'bg-blue' : 'bg-blue-200'
                    }`}
                    disabled={!(surveyCommodity !== "" && capturedImage)}
                    onClick={onFinish}
                >
                    Simpan Komoditas
                </button>
                <button
                    className="mb-4 mt-2 font-semibold text-black text-center text-sm p-2 rounded border border-gray-400 w-full"
                    onClick={onHistoryClick}
                >
                    + Tambah Histori Tanam
                </button>
            </div>
        </div>
    );
} 