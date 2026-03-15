import axios from "axios";

const API_UPDATE = `${process.env.REACT_APP_API_URL}/api/live-tracking/update`;
const API_LATEST = `${process.env.REACT_APP_API_URL}/api/live-tracking/latest`;

// ✅ store watchIds per trip
const watchIds = {};

const LiveTrackingService = {

    startTracking: (tripId) => {
        if (!tripId) return;

        // prevent duplicate tracking for same trip
        if (watchIds[tripId]) return;

        watchIds[tripId] = navigator.geolocation.watchPosition(
            async (position) => {

                const payload = {
                    tripId,
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,

                };

                try {
                    await axios.post(API_UPDATE, payload);
                    console.log("📡 GPS sent for trip", tripId);
                } catch (err) {
                    console.error("GPS send failed:", err.message);
                }
            },
            (err) => console.error("GPS error:", err.message),
            { enableHighAccuracy: true }
        );

        console.log("🚀 GPS Started for trip", tripId);
    },

    stopTracking: (tripId) => {
        if (!tripId) return;

        if (watchIds[tripId]) {
            navigator.geolocation.clearWatch(watchIds[tripId]);
            delete watchIds[tripId];
            console.log("🛑 GPS Stopped for trip", tripId);
        }
    },

    fetchLatest: async (tripId) => {
        try {
            const res = await axios.get(`${API_LATEST}/${tripId}`);
            return res.data;
        } catch {
            return null;
        }
    }
};

export default LiveTrackingService;