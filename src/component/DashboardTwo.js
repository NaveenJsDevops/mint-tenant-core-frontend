import React, { useEffect, useRef, useState } from "react";
import api from "./api";
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

export default function DashboardTwo({ config }) {
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

    const toggleFeature = (key) => {
        setFeatureState((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const updateFeatures = async () => {
        try {
            await api.put("/features", { features: featureState });
            toast.success("Features updated!");
            setShowModal(false);
            window.location.reload();
        } catch (err) {
            toast.error("Failed to update features.");
            console.error(err);
        }
    };

    const handleLogout = () => {
        signOut(auth);
        window.location.href = "/login";
    };

    const tabs = [
        { name: "Dashboard", icon: <FiGrid /> },
        { name: "Reports", icon: <FiBarChart2 /> },
        { name: "Team", icon: <FiUsers /> },
        { name: "Billing", icon: <FiCreditCard /> },
    ];

    if (error) return <div className="text-red-500 p-8">{error}</div>;
    if (!user) return null;

    const primary = config.primaryColor || "#41aaa8";
    const secondary = config.secondaryColor || "#dfdfdf";
    const enabledFeatures = Object.entries(config.features || {}).filter(([, enabled]) => enabled);

    return (
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: secondary }}>
            <header
                className="px-6 py-4 shadow-md text-white"
                style={{
                    background: `linear-gradient(to bottom, ${primary}, #7dd3fc)`,
                }}
            >
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                        {config.logo && (
                            <img src={config.logo} alt="Tenant Logo" className="h-12" />
                        )}
                        <div className="text-2xl font-extrabold tracking-tight">
                            Mint <span className="text-white">Core</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 relative" ref={dropdownRef}>
                        <div className="text-right hidden sm:block">
                            <div className="font-semibold">{user.email}</div>
                            <div className="text-xs text-white/80">{user.role}</div>
                        </div>
                        <div
                            className="flex items-center gap-1 bg-white/20 px-3 py-2 rounded-full cursor-pointer hover:bg-white/30 transition"
                            onClick={() => setShowDropdown((prev) => !prev)}
                            tabIndex={0}
                            onKeyDown={(e) => e.key === "Enter" && setShowDropdown((prev) => !prev)}
                        >
                            <FiUser className="text-white w-5 h-5" />
                            <FiChevronDown className="text-white" />
                        </div>
                        {showDropdown && (
                            <div className="absolute right-0 top-14 w-44 bg-white border rounded shadow-md z-10 text-gray-800">
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
                </div>

                <nav className="flex gap-2 flex-wrap">
                    {tabs.map((tab) => (
                        <button
                            key={tab.name}
                            onClick={() => setActiveTab(tab.name)}
                            className={`relative flex items-center gap-2 px-4 py-2 font-medium transition rounded-full ${
                                activeTab === tab.name
                                    ? "bg-white text-[color:var(--primary)] shadow ring-2 ring-white"
                                    : "text-white hover:bg-white/20"
                            }`}
                        >
                            {tab.icon}
                            {tab.name}
                        </button>
                    ))}
                </nav>
            </header>

            <main className="p-6 flex-1 w-full max-w-6xl mx-auto">
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {enabledFeatures.map(([feature]) => (
                        <motion.div
                            key={feature}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            whileHover={{ scale: 1.03 }}
                            className="bg-white/70 backdrop-blur-md border rounded-xl p-6 shadow-xl transition cursor-pointer hover:shadow-2xl"
                            style={{ borderColor: primary }}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-semibold capitalize text-gray-800">{feature}</h3>
                                <FiZap className="text-yellow-500" />
                            </div>
                            <p className="text-gray-500 text-sm mb-2">
                                A powerful module for {feature.toLowerCase()} operations.
                            </p>
                        </motion.div>
                    ))}
                </section>

                {["Admin", "HR"].includes(user.role) && (
                    <section
                        className="mt-12 p-6 rounded-xl shadow border bg-white relative overflow-hidden"
                        style={{ borderColor: primary }}
                    >
                        <h3 className="text-xl font-bold mb-2 text-[color:var(--primary)]">HR Tools</h3>
                        <p className="mb-4 text-sm text-gray-700">
                            Manage feature access and configurations for your team efficiently.
                        </p>
                        <button
                            onClick={openFeatureModal}
                            className="px-6 py-2 rounded-md bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-semibold shadow hover:opacity-90 transition"
                        >
                            Update Features
                        </button>

                        {/* Modal */}
                        <Modal
                            isOpen={showModal}
                            onRequestClose={() => setShowModal(false)}
                            contentLabel="Update Features"
                            className="w-full max-w-md mx-auto mt-24 bg-white p-10 rounded-xl shadow-xl outline-none"
                            overlayClassName="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-start z-50"
                        >
                            <h2 className="text-2xl font-bold mb-4 text-[color:var(--primary)] text-center">Manage Features</h2>
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
                                    className="px-5 py-2 rounded-lg bg-[color:var(--primary)] text-white font-semibold hover:opacity-90 shadow"
                                >
                                    Update
                                </button>
                            </div>
                        </Modal>
                    </section>
                )}
            </main>
        </div>
    );
}
