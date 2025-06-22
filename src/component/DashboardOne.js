import React, { useEffect, useRef, useState } from "react";
import api, { tenantApi } from "./api"; // ✅ updated
import {
    FiUser, FiChevronDown, FiLogOut, FiHelpCircle, FiSettings,
    FiZap, FiGrid, FiBarChart2, FiUsers, FiCreditCard
} from "react-icons/fi";
import { motion } from "framer-motion";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import Modal from "react-modal";
import toast from "react-hot-toast";
import useAuthenticatedUser from "./useAuthenticatedUser";

Modal.setAppElement("#root");

export default function DashboardOne({ config }) {
    const [showDropdown, setShowDropdown] = useState(false);
    const [activeTab, setActiveTab] = useState("Dashboard");
    const [showModal, setShowModal] = useState(false);
    const [featureState, setFeatureState] = useState({});
    const dropdownRef = useRef(null);
    const { user, error, loading } = useAuthenticatedUser();

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const openFeatureModal = () => {
        setFeatureState({ ...(config.features || {}) });
        setShowModal(true);
    };

    const toggleFeature = (feature) => {
        setFeatureState(prev => ({ ...prev, [feature]: !prev[feature] }));
    };

    const updateFeatures = async () => {
        try {
            await api.put(tenantApi("/features"), { features: featureState });
            toast.success("Features updated!");
            setShowModal(false);
            window.location.reload();
        } catch (err) {
            toast.error("Update failed.");
            console.error(err);
        }
    };

    if (error) return <div className="text-red-500 p-8">{error}</div>;
    if (!user) return null;

    const primary = config.primaryColor || "#7c3aed";
    const secondary = config.secondaryColor || "#ede9fe";

    const brandWords = config.brandName?.split(" ") || ["Brand"];
    const enabledFeatures = Object.entries(config.features || {}).filter(([, val]) => val);

    const tabIcons = {
        Dashboard: <FiGrid />,
        Reports: <FiBarChart2 />,
        Team: <FiUsers />,
        Billing: <FiCreditCard />,
    };

    const handleLogout = () => {
        signOut(auth);
        window.location.href = "/login";
    };

    return (
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: secondary }}>
            <header
                className="px-6 py-4 flex justify-between items-center shadow-md text-white"
                style={{
                    background: `linear-gradient(to bottom, ${primary}, #cbbcf6)`,
                }}
            >
                <div className="flex items-center gap-3">
                    {config.logo && (
                        <img src={config.logo} alt="Tenant Logo" className="h-12" />
                    )}
                    <div className="text-2xl font-extrabold tracking-tight">
                        {brandWords[0]} <span className="text-white">{brandWords[1] || ""}</span>
                    </div>
                </div>

                <div className="flex items-center gap-4 relative" ref={dropdownRef}>
                    <div className="text-right hidden sm:block">
                        <div className="font-semibold text-gray-800">{user.email}</div>
                        <div className="text-xs text-gray-500">{user.role}</div>
                    </div>

                    <div
                        className="flex items-center gap-1 bg-gray-100 px-3 py-2 rounded-full cursor-pointer hover:shadow"
                        onClick={() => setShowDropdown((prev) => !prev)}
                        tabIndex={0}
                        onKeyDown={(e) => e.key === "Enter" && setShowDropdown((prev) => !prev)}
                    >
                        <FiUser className="text-gray-600 w-5 h-5" />
                        <FiChevronDown className="text-gray-500" />
                    </div>

                    {showDropdown && (
                        <div className="absolute right-0 top-14 w-44 bg-white border rounded shadow-md z-10 text-gray-500">
                            <ul className="text-sm py-2">
                                <li className="px-4 py-2 hover:bg-gray-100 flex items-center gap-2 cursor-pointer">
                                    <FiSettings /> Profile
                                </li>
                                <li className="px-4 py-2 hover:bg-gray-100 flex items-center gap-2 cursor-pointer">
                                    <FiHelpCircle /> Help
                                </li>
                                <li
                                    onClick={handleLogout}
                                    className="px-4 py-2 hover:bg-red-100 text-red-600 flex items-center gap-2 cursor-pointer"
                                >
                                    <FiLogOut /> Logout
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
            </header>

            <div className="flex flex-1">
                <aside className="w-60 bg-white border-r shadow-lg py-6 px-5 space-y-4">
                    {Object.keys(tabIcons).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition ${
                                activeTab === tab
                                    ? "bg-purple-600 text-white shadow-lg"
                                    : "text-gray-700 hover:bg-purple-100"
                            }`}
                        >
                            {tabIcons[tab]} {tab}
                        </button>
                    ))}
                </aside>

                <main className="p-12 flex-1 w-full max-w-7xl mx-auto">
                    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {enabledFeatures.map(([feature]) => (
                            <motion.div
                                key={feature}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                whileHover={{ scale: 1.04 }}
                                className="bg-white border border-purple-200 rounded-2xl p-6 shadow-md hover:shadow-xl transition"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold capitalize text-gray-800">{feature}</h3>
                                    <FiZap className="text-yellow-400" />
                                </div>
                                <p className="text-gray-500 text-sm mb-6">
                                    A powerful module for {feature.toLowerCase()} operations.
                                </p>
                            </motion.div>
                        ))}
                    </section>

                    {["Admin", "HR"].includes(user.role) && (
                        <section className="mt-12 bg-white rounded-2xl border border-purple-300 p-6 shadow-lg">
                            <h3 className="text-xl font-bold mb-2 text-purple-700">HR Tools</h3>
                            <p className="mb-4 text-gray-700 text-sm">
                                Manage feature access and configurations for your team efficiently.
                            </p>

                            <button
                                onClick={openFeatureModal}
                                className="px-6 py-2 rounded-lg bg-purple-600 text-white font-medium hover:brightness-110 shadow transition"
                            >
                                Update Features
                            </button>

                            <Modal
                                isOpen={showModal}
                                onRequestClose={() => setShowModal(false)}
                                contentLabel="Update Features"
                                className="w-full max-w-md mx-auto mt-24 bg-white p-10 rounded-xl shadow-xl outline-none"
                                overlayClassName="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-start z-50"
                            >
                                <h2 className="text-2xl font-bold mb-4 text-purple-700 text-center">Manage Features</h2>

                                <div className="space-y-4 max-h-76 overflow-y-auto pr-1">
                                    {Object.entries(featureState).map(([key, value]) => (
                                        <div
                                            key={key}
                                            className="flex justify-between items-center bg-gray-50 px-4 py-3 rounded-md shadow-sm hover:bg-gray-100 transition"
                                        >
                                            <span className="capitalize font-medium text-gray-800">{key}</span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={value}
                                                    onChange={() => toggleFeature(key)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-300 peer-checked:bg-green-500 rounded-full peer transition-all duration-300" />
                                                <div
                                                    className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-md transform transition-all duration-300 ${
                                                        value ? "translate-x-5" : "translate-x-0"
                                                    }`}
                                                />
                                            </label>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-8 flex justify-end gap-4">
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={updateFeatures}
                                        className="px-5 py-2 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 shadow"
                                    >
                                        Update
                                    </button>
                                </div>
                            </Modal>
                        </section>
                    )}
                </main>
            </div>
        </div>
    );
}
