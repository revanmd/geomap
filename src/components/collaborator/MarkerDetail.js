import { X } from "lucide-react";
import { Drawer, Modal } from "antd";
import { CapitalizeFirstLetter, ConvertIsoToIndonesianDate, ConvertCommodityTypeToIndonesianCommodity, ConvertDateMonthToIndonesianMonth } from "@/utility/utils";
import { useState } from "react";

export default function MarkerDetail({
    isOpen,
    onClose,
    onEdit,
    onDelete,
    markerDetail,
    uploadedImage,
    isCurrentUser,
    isSurvey
}) {
    const [isPreviewVisible, setIsPreviewVisible] = useState(false);

    if (!markerDetail) return null;

    const handleImageClick = () => {
        if (uploadedImage) {
            setIsPreviewVisible(true);
        }
    };

    return (
        <>
            <Drawer
                open={isOpen}
                placement="bottom"
                zIndex={999999}
                height={600}
                className="drawer-body-modified rounded-xl"
                closeIcon={false}
            >
                <div>
                    <div className="flex justify-between items-center pt-3 px-4">
                        <div>
                            <h1 className="text-base font-semibold text-black">
                                {CapitalizeFirstLetter(markerDetail.commodity)}
                            </h1>
                            <h2 className="text-xs text-gray-500">
                                Ditambahkan {ConvertIsoToIndonesianDate(markerDetail.updated_at)}
                            </h2>
                        </div>
                        <button className="text-lg font-semibold text-black" onClick={onClose}>
                            <X />
                        </button>
                    </div>

                    <div className="mt-4 px-4">
                        {uploadedImage && (
                            <div 
                                className="relative w-full h-[200px] aspect-square rounded cursor-pointer"
                                onClick={handleImageClick}
                            >
                                <img 
                                    src={uploadedImage} 
                                    className="absolute w-full h-full object-cover"
                                    alt="Commodity"
                                />
                            </div>
                        )}
                    </div>

                    <h2 className="text-sm mt-4 px-4 font-medium">Hari setelah tanam</h2>
                    <div className="mx-4 mt-2">
                        <h2 className="text-base">{markerDetail.hst}</h2>
                    </div>

                    {markerDetail.planting_history && (
                        <div className="px-4 text-sm">
                            <h2 className="mt-4 font-medium">History Tanam</h2>
                            {[1, 2, 3].map((period) => {
                                const commodity = markerDetail.planting_history[`commodity_mt_${period}`];
                                const tanam = markerDetail.planting_history[`tanam_mt_${period}`];
                                const panen = markerDetail.planting_history[`panen_mt_${period}`];

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

                    {isCurrentUser == true && isSurvey && (
                        <div className="fixed bottom-0 left-0 w-full bg-white p-5">
                            <div className="flex space-x-3 text-sm">
                                <button
                                    className="flex-1 border border-red-500 text-red-500 p-2 rounded font-semibold"
                                    onClick={onDelete}
                                >
                                    Hapus
                                </button>
                                <button
                                    className="flex-1 bg-blue text-white p-2 rounded font-semibold"
                                    onClick={onEdit}
                                >
                                    Ubah
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </Drawer>

            <Modal
                open={isPreviewVisible}
                footer={null}
                onCancel={() => setIsPreviewVisible(false)}
                width="100%"
                style={{ 
                    top: 0, 
                    maxWidth: '100vw', 
                    margin: 0, 
                    padding: 0,
                    height: '100vh'
                }}
                className="image-preview-modal"
                closable={true}
                zIndex={9999999}
                closeIcon={
                    <button className="absolute top-4 right-4 z-50 bg-black bg-opacity-50 rounded-full p-2">
                        <X className="text-white" size={24} />
                    </button>
                }
            >
                <div className="flex items-center justify-center h-screen bg-black">
                    {uploadedImage && (
                        <img
                            src={uploadedImage}
                            alt="Commodity Preview"
                            className="max-h-full max-w-full object-contain"
                        />
                    )}
                </div>
            </Modal>
        </>
    );
} 