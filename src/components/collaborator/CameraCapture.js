import { Camera, Minus } from "lucide-react";
import Webcam from "react-webcam";
import { useCallback, useRef } from "react";

const videoConstraints = {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    facingMode: "environment"
};

export default function CameraCapture({ isActive, capturedImage, onCapture, onSave, onRetake, onClose }) {
    const webcamRef = useRef(null);

    const captureWebcam = useCallback(() => {
        if (webcamRef.current) {
            const imageSrc = webcamRef.current.getScreenshot();
            onCapture(imageSrc);
        }
    }, [webcamRef, onCapture]);

    if (!isActive) return null;

    return (
        <div className="w-screen h-[100dvh] bg-black absolute top-0" style={{ zIndex: 9999999 }}>
            <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                style={{
                    height: "100dvh",
                    width: "100vw",
                    objectFit: "cover",
                    zIndex: 9999999
                }}
            />

            {capturedImage && (
                <img src={capturedImage} alt="Captured" className="absolute top-0 h-[100dvh] w-screen" />
            )}

            {capturedImage ? (
                <div className="absolute bottom-0 left-0 w-screen bg-white py-3">
                    <div
                        className="text-sm font-semibold text-white text-center p-2 mx-6 rounded bg-blue cursor-pointer mb-3"
                        onClick={onSave}
                    >
                        Simpan Foto
                    </div>
                    <div
                        className="text-sm border border-gray-300 font-semibold text-center p-2 mx-6 rounded cursor-pointer"
                        onClick={onRetake}
                    >
                        Ambil ulang foto
                    </div>
                </div>
            ) : (
                <div className="absolute bottom-0 left-0 w-screen bg-white">
                    <div
                        className="text-sm mb-3 border border-gray-300 font-semibold text-white text-center p-2 my-3 mx-6 rounded bg-blue cursor-pointer"
                        onClick={captureWebcam}
                    >
                        Ambil Foto
                    </div>
                </div>
            )}
        </div>
    );
} 