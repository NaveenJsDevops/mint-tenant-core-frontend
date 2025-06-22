import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { onIdTokenChanged } from "firebase/auth";
import { auth, db } from "./component/firebase";
import { Player } from "@lottiefiles/react-lottie-player";
import loadingAnimation from "./assets/loading.json";
import AuthPage from "./component/auth/AuthPage";
import DashboardOne from "./component/DashboardOne";
import DashboardTwo from "./component/DashboardTwo";
import toast, { Toaster } from "react-hot-toast";
import { doc, getDoc } from "firebase/firestore";
import api from "./component/api";
import { tenantApi } from "./component/api";

function App() {
    const [user, loadingAuth] = useAuthState(auth);
    const [showLoading, setShowLoading] = useState(true);
    const [hasMetadata, setHasMetadata] = useState(null);
    const [config, setConfig] = useState(null);

    useEffect(() => {
        const timer = setTimeout(() => setShowLoading(false), 200);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const unsubscribe = onIdTokenChanged(auth, async (user) => {
            if (user) {
                try {
                    await user.getIdToken(true);
                } catch (err) {
                    console.warn("Token refresh failed", err);
                }
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!user) return;
        const checkMetadata = async () => {
            try {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                const data = userDoc.data();
                if (userDoc.exists() && data?.role && data?.tenant) {
                    setHasMetadata(true);
                } else {
                    setHasMetadata(false);
                }
            } catch (err) {
                console.error("Metadata check failed", err);
                setHasMetadata(false);
            }
        };
        checkMetadata();
    }, [user]);

    useEffect(() => {
        if (user && hasMetadata) {
            api.get(tenantApi("/config"))
                .then((res) => {
                    setConfig(res.data);
                    document.documentElement.style.setProperty("--primary", res.data.primaryColor);
                })
                .catch((err) => {
                    console.error("Config fetch failed", err);
                    toast.error("Failed to load tenant config");
                });
        }
    }, [user, hasMetadata]);

    useEffect(() => {
        if (user && hasMetadata === false) {
            toast.error("Account is incomplete. Please contact your admin.");
        }
    }, [user, hasMetadata]);

    const splash = loadingAuth || showLoading || (user && hasMetadata === null) || (user && hasMetadata && !config);

    if (splash) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-white dark:bg-black">
                <Player autoplay loop src={loadingAnimation} style={{ height: "420px", width: "420px" }} />
            </div>
        );
    }

    return (
        <>
            <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
            <BrowserRouter>
                <Routes>
                    <Route
                        path="/login"
                        element={
                            !user ? (
                                <AuthPage />
                            ) : hasMetadata ? (
                                <Navigate to="/dashboard" replace />
                            ) : (
                                <AuthPage mode="register" />
                            )
                        }
                    />
                    <Route
                        path="/dashboard/*"
                        element={
                            user && hasMetadata ? (
                                config.layout === "side" ? (
                                    <DashboardOne config={config} />
                                ) : (
                                    <DashboardTwo config={config} />
                                )
                            ) : (
                                <Navigate to="/login" replace />
                            )
                        }
                    />
                    <Route
                        path="*"
                        element={
                            <Navigate to={user ? (hasMetadata ? "/dashboard" : "/login") : "/login"} replace />
                        }
                    />
                </Routes>
            </BrowserRouter>
        </>
    );
}

export default App;
