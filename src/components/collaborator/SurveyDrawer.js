import { Camera } from "lucide-react";
import { Input } from "antd";
import CommoditySelector from "./CommoditySelector";
import { ConvertCommodityTypeToIndonesianCommodity, ConvertDateMonthToIndonesianMonth } from "@/utility/utils";

export default function SurveyDrawer({
    isOpen,
    mode = "create", // "create" or "edit"
    surveyForm,
    onPhotoClick,
    onHistoryClick,
    onFinish,
}) {
    const {
        surveyCommodity,
        surveyHST,
        capturedImage,
        uploadedImage,
        dataHistory,
        isSubmitting,
        isHistoryOpen,
        setSurveyCommodity,
        handleHSTChange,
        handleKeyPress,
    } = surveyForm;

    if (!isOpen || isHistoryOpen) return null;
 
    return (
        <div
            style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                zIndex: 9999999,
                transform: 'translateY(0)',
                transition: 'transform 0.2s ease-out'
            }}
            className="bg-white w-screen animate-slide-up"
        >
            <div className="flex justify-between items-center px-4 pt-4">
                <h1 className="text-base font-semibold text-black">
                    {mode === "create" ? "Tandai dengan komoditas" : "Edit komoditas"}
                </h1>
            </div>

            <h2 className="text-sm mt-4 px-4 font-medium">
                <span className="font-semibold text-red-600">*</span> Pilih Komoditas
            </h2>
            
            <CommoditySelector 
                selectedCommodity={surveyCommodity}
                onSelect={isSubmitting ? () => {} : setSurveyCommodity}
                disabled={isSubmitting}
            />

            <h2 className="text-sm mt-4 px-4 font-medium">
                Hari setelah tanam
                <span className="font-light text-gray-500"> (Opsional)</span>
            </h2>
            <div className="mx-4 mt-2">
                <Input 
                    className="input-custom" 
                    placeholder="Masukkan HST"
                    value={surveyHST}
                    onChange={handleHSTChange}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    type="tel"
                    onKeyPress={handleKeyPress}
                    disabled={isSubmitting}
                />
            </div>

            <h2 className="text-sm mt-4 px-4 font-medium">
                <span className="font-semibold text-red-600">*</span> Foto komoditas
            </h2>
            <div className="px-4 mt-2">
                <div 
                    className={`image-commodity-container-empty border rounded ${
                        isSubmitting 
                            ? 'border-gray-200 cursor-not-allowed' 
                            : 'border-gray-300 cursor-pointer hover:border-blue-400'
                    }`}
                    onClick={isSubmitting ? () => {} : onPhotoClick}
                >
                    {(capturedImage || uploadedImage) && (
                        <>
                            <img 
                                src={capturedImage || uploadedImage} 
                                className="image-commodity-container rounded" 
                                alt="Preview" 
                            />
                            <div className="absolute inset-0 bg-black opacity-50"></div>
                        </>
                    )}

                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 text-sm">
                        <div className={(capturedImage || uploadedImage) ? "text-white" : "text-gray-500"}>
                            <Camera className="block w-full" size={16} />
                            <div className="mt-1 text-center">
                                {(capturedImage || uploadedImage) ? "Ganti Foto" : "Tambah foto komoditas"}
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
                        (surveyCommodity !== "" && (capturedImage || uploadedImage) && !isSubmitting) ? 'bg-blue' : 'bg-blue-200'
                    }`}
                    disabled={!(surveyCommodity !== "" && (capturedImage || uploadedImage)) || isSubmitting}
                    onClick={onFinish}
                >
                    {isSubmitting ? "Menyimpan..." : mode === "create" ? "Simpan Komoditas" : "Simpan Perubahan"}
                </button>
                <button
                    className={`mb-4 mt-2 font-semibold text-center text-sm p-2 rounded border w-full ${
                        isSubmitting 
                            ? 'text-gray-400 border-gray-200 cursor-not-allowed' 
                            : 'text-black border-gray-400 hover:bg-gray-50'
                    }`}
                    onClick={onHistoryClick}
                    disabled={isSubmitting}
                >
                    + Tambah Histori Tanam
                </button>
            </div>
        </div>
    );
} 