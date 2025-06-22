import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";
import api, { tenantApi } from "./api";
import DashboardOne from "./DashboardOne";
import DashboardTwo from "./DashboardTwo";

export default function DashboardRouter() {
    const [user] = useAuthState(auth);
    const [config, setConfig] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchConfig = async () => {
            try {
                console.log("tenant", tenantApi)
                const { data } = await api.get(tenantApi("/config"));
                setConfig(data);

                if (data?.primaryColor) {
                    document.documentElement.style.setProperty("--primary", data.primaryColor);
                }
            } catch (err) {
                const msg = err.response?.data?.detail || "Failed to load tenant configuration.";
                setError(msg);
            } finally {
                setLoading(false);
            }
        };

        fetchConfig();
    }, [user]);

    if (!user) return <div className="p-8 text-red-600">Access denied. Please log in again.</div>;
    if (loading) return <div className="p-8 text-gray-500">Loading dashboard configuration...</div>;
    if (error) return <div className="p-8 text-red-600">{error}</div>;
    if (!config) return <div className="p-8 text-yellow-600">No configuration found.</div>;

    switch (config.layout) {
        case "side":
            return <DashboardOne config={config} />;
        case "top":
            return <DashboardTwo config={config} />;
        default:
            return (
                <div className="p-8 text-yellow-600">
                    Unknown layout: {config.layout}. Please contact support.
                </div>
            );
    }
}
