import { useState } from 'react';
import { fileService } from "@/services/fileService";
import { markerService } from "@/services/markerService";

export default function useSurveyForm({ onSuccess, onError }) {
    const [surveyCommodity, setSurveyCommodity] = useState("");
    const [surveyHST, setSurveyHST] = useState("");
    const [capturedImage, setCapturedImage] = useState("");
    const [uploadedImage, setUploadedImage] = useState("");
    const [imageFilename, setImageFilename] = useState("");
    const [dataHistory, setDataHistory] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    const resetForm = () => {
        setSurveyCommodity("");
        setSurveyHST("");
        setCapturedImage("");
        setUploadedImage("");
        setImageFilename("");
        setDataHistory(null);
        setIsSubmitting(false);
        setIsHistoryOpen(false);
    };

    const handleHSTChange = (event) => {
        const value = event.target.value.replace(/[^0-9]/g, '');
        setSurveyHST(value);
    };

    const handleKeyPress = (e) => {
        if (!/[0-9]/.test(e.key)) {
            e.preventDefault();
        }
    };

    const handleHistoryChange = (history) => {
        setDataHistory(history);
        setIsHistoryOpen(false);
    };

    const setImageData = (imageData, filename = "") => {
        if (imageData.startsWith('data:image')) {
            setCapturedImage(imageData);
            setUploadedImage(""); // Clear uploaded image when capturing new one
            setImageFilename(""); // Clear filename when capturing new one
        } else if (imageData.startsWith('blob:')) {
            setUploadedImage(imageData);
            setCapturedImage(""); // Clear captured image when setting uploaded one
            setImageFilename(filename); // Store the original filename
        } else {
            setUploadedImage("");
            setCapturedImage("");
            setImageFilename("");
        }
    };

    const uploadFile = async (imageData, filename) => {
        try {
            // Handle blob URLs
            if (typeof imageData === 'string' && imageData.startsWith('blob:')) {
                const response = await fetch(imageData);
                const blob = await response.blob();
                imageData = blob;
            }
            // Handle base64 strings
            else if (typeof imageData === 'string' && imageData.startsWith('data:image')) {
                // Already in correct format for upload
            }
            // Handle if the image is already a blob
            else if (imageData instanceof Blob) {
                // Already in correct format for upload
            }
            else {
                throw new Error("Format gambar tidak valid");
            }

            const response = await fileService.uploadFile(imageData, filename);
            return response?.data?.filename;
        } catch (error) {
            console.error("Failed to upload file:", error);
            throw new Error("Gagal mengupload foto");
        }
    };

    const submitForm = async (location) => {
        setIsSubmitting(true);
        try {
            let photoFilename;
            if (capturedImage) {
                photoFilename = await uploadFile(capturedImage, `${surveyCommodity}_${Date.now()}.png`);
            }

            const markerData = {
                photo: photoFilename,
                commodity: surveyCommodity,
                location: location,
                hst: surveyHST ? parseInt(surveyHST) : 0,
                planting_history: dataHistory
            };

            const response = await markerService.createMarker(markerData);
            onSuccess?.(response?.data);
            resetForm();
        } catch (error) {
            onError?.(error);
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    };

    const updateMarker = async (markerId, location) => {
        if (!markerId) {
            throw new Error("ID marker tidak ditemukan");
        }

        setIsSubmitting(true);
        try {
            // Handle image upload if we have a new captured image
            let photoFilename;
            if (capturedImage) {
                photoFilename = await uploadFile(capturedImage, `${surveyCommodity}_${Date.now()}.png`);
            }

            // Always include all required fields in the update
            const markerData = {
                commodity: surveyCommodity,
                hst: surveyHST !== "" ? parseInt(surveyHST) || 0 : 0,
                // Use new photo if uploaded, otherwise keep existing filename
                photo: photoFilename || imageFilename,
                // Always include location if provided
                ...(location && {
                    location: {
                        lat: location.lat,
                        lon: location.lon
                    }
                }),
                // Include planting history if exists
                ...(dataHistory && { planting_history: dataHistory })
            };

            const response = await markerService.updateMarker(markerId, markerData);
            onSuccess?.(response?.data);
            return response?.data;
        } catch (error) {
            onError?.(error);
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        // State
        surveyCommodity,
        surveyHST,
        capturedImage,
        uploadedImage,
        imageFilename,
        dataHistory,
        isSubmitting,
        isHistoryOpen,
        
        // Setters
        setSurveyCommodity,
        setSurveyHST,
        setCapturedImage,
        setUploadedImage,
        setIsHistoryOpen,
        setImageData,
        
        // Handlers
        handleHSTChange,
        handleKeyPress,
        handleHistoryChange,
        resetForm,
        submitForm,
        updateMarker
    };
} 