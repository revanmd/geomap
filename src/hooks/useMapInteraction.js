import { useState, useCallback } from 'react';
import { markerService } from '@/services/markerService';

export default function useMapInteraction() {
    const [mapFunctions, setMapFunctions] = useState(null);

    const handleMapReady = useCallback((mapRefs) => {
        setMapFunctions(mapRefs);
    }, []);

    const fetchMarkers = useCallback(async () => {
        try {
            const markers = await markerService.getMarkers();
            if (markers.data && mapFunctions) {
                mapFunctions.initializeMarkers(markers.data);
            }
        } catch (error) {
            console.error('Error fetching markers:', error);
        }
    }, [mapFunctions]);

    const fetchSelfMarkers = useCallback(async () => {
        try {
            const markers = await markerService.getSelfMarkers();
            if (markers.data && mapFunctions) {
                mapFunctions.initializeMarkers(markers.data);
            }
        } catch (error) {
            console.error('Error fetching self markers:', error);
        }
    }, [mapFunctions]);

    const addMarker = useCallback((commodity, id) => {
        if (mapFunctions) {
            mapFunctions.appendMarker(commodity, id);
        }
    }, [mapFunctions]);

    const removeMarker = useCallback((id) => {
        if (mapFunctions) {
            mapFunctions.removeMarker(id);
        }
    }, [mapFunctions]);

    const updateMarker = useCallback((id, location, commodity) => {
        if (mapFunctions) {
            mapFunctions.updateMarker(id, location, commodity);
        }
    }, [mapFunctions]);

    const getMarkerLocation = useCallback(() => {
        if (mapFunctions) {
            return mapFunctions.getMarkerAddLocation();
        }
        return null;
    }, [mapFunctions]);

    const removeMarkerAdd = useCallback(() => {
        if (mapFunctions) {
            mapFunctions.removeMarkerAdd();
        }
    }, [mapFunctions]);

    const updateGeolocation = useCallback(() => {
        if (mapFunctions) {
            mapFunctions.onGeolocationUpdate();
        }
    }, [mapFunctions]);

    return {
        mapFunctions,
        handleMapReady,
        fetchMarkers,
        fetchSelfMarkers,
        addMarker,
        removeMarker,
        updateMarker,
        getMarkerLocation,
        removeMarkerAdd,
        updateGeolocation
    };
} 