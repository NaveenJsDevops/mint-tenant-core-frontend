import React, { useState } from "react";
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    signInWithPopup,
} from "firebase/auth";
import { db, auth, googleProvider } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";
import { Player } from "@lottiefiles/react-lottie-player";
import { FiEye, FiEyeOff } from "react-icons/fi";
import loadingAnimation from "../../assets/loading.json";

const TENANT_OPTIONS = process.env.REACT_APP_TENANTS?.split(",") || [];
const BACKGROUND_IMAGE = process.env.REACT_APP_AUTH_BG_IMAGE;
const BRAND_COLOR = process.env.REACT_APP_BRAND_COLOR || "#3d93a3";

const getSubdomain = () => {
    const hostname = window.location.hostname;
    return hostname.split(".")[0] || "default";
};

export default function AuthPage({ mode = "login" }) {
    const [currentMode, setCurrentMode] = useState(mode);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("Employee");
    const [tenant, setTenant] = useState(TENANT_OPTIONS[0] || "");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleGoogle = async () => {
        setIsLoading(true);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            const userRef = doc(db, "users", user.uid);
            const snap = await getDoc(userRef);

            if (!snap.exists()) {
                await setDoc(userRef, {
                    email: user.email,
                    role: "Employee",
                    tenant: getSubdomain(),
                });
            }

            toast.success("Signed in with Google!");
            window.location.href = "/dashboard";
        } catch (err) {
            toast.error(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (currentMode === "login") {
                await signInWithEmailAndPassword(auth, email, password);
                setTimeout(() => (window.location.href = "/dashboard"), 500);
            } else if (currentMode === "register") {
                const userCred = await createUserWithEmailAndPassword(auth, email, password);
                await setDoc(doc(db, "users", userCred.user.uid), {
                    role: role || "Employee",
                    tenant: tenant || getSubdomain(),
                });
                toast.success("Account created!");
                setTimeout(() => (window.location.href = "/dashboard"), 1000);
            } else if (currentMode === "forgot") {
                await sendPasswordResetEmail(auth, email);
                toast.success("Reset link sent!");
            }
        } catch (err) {
            toast.error(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen bg-cover bg-center flex items-center justify-center p-4 dark:bg-gray-900 relative"
            style={{ backgroundImage: `url('${BACKGROUND_IMAGE}')` }}
        >
            {isLoading && (
                <div className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-white/30 dark:bg-black/30">
                    <Player autoplay loop src={loadingAnimation} style={{ height: 120, width: 120 }} />
                </div>
            )}

            <div className="backdrop-blur-md bg-white/20 dark:bg-black/30 shadow-xl rounded-xl p-8 w-full max-w-md text-black dark:text-white relative z-10">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold mb-1">
                        {currentMode === "login"
                            ? "Welcome Back"
                            : currentMode === "register"
                                ? "Create Account"
                                : "Reset Password"}
                    </h2>
                    <p className="text-sm text-gray-800 dark:text-gray-200">
                        {currentMode === "login"
                            ? "Nice to see you again!"
                            : currentMode === "register"
                                ? "Join us in a few clicks!"
                                : "We'll email you a reset link."}
                    </p>
                </div>

                {currentMode !== "forgot" && (
                    <div className="flex flex-col gap-3 mb-6">
                        <button
                            onClick={handleGoogle}
                            className="flex items-center justify-center gap-4 bg-white border px-4 py-2 rounded-md shadow hover:shadow-md transition text-black"
                            disabled={isLoading}
                        >
                            <FcGoogle size={25} /> Continue with Google
                        </button>
                        <div className="text-center text-white-1000 text-sm">------ or ------</div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-1 text-white">Email</label>
                        <input
                            id="email"
                            type="email"
                            className="w-full px-4 py-2 rounded border bg-white/40 dark:bg-black/5 backdrop-blur focus:outline-none"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                            required
                        />
                    </div>

                    {currentMode !== "forgot" && (
                        <div className="relative">
                            <label htmlFor="password" className="block text-sm font-medium mb-1 text-white">Password</label>
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                className="w-full px-4 py-2 pr-10 rounded border bg-white/60 dark:bg-black/5 backdrop-blur focus:outline-none"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                                required
                            />
                            <div
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-4 top-6 flex items-center cursor-pointer text-gray-600 dark:text-gray-300"
                            >
                                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                            </div>
                        </div>
                    )}

                    {currentMode === "register" && (
                        <div className="flex gap-4">
                            <div className="w-1/2">
                                <label htmlFor="role" className="block text-sm font-medium mb-1 text-white">Role</label>
                                <select
                                    id="role"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    disabled={isLoading}
                                    className="w-full px-4 py-2 pr-10 rounded border text-black dark:text-white bg-white dark:bg-black/30 backdrop-blur appearance-none focus:outline-none"
                                >
                                    <option value="Employee">Employee</option>
                                    <option value="HR">HR</option>
                                    <option value="Admin">Admin</option>
                                </select>
                            </div>

                            <div className="w-1/2">
                                <label htmlFor="tenant" className="block text-sm font-medium mb-1 text-white">Tenant</label>
                                <select
                                    id="tenant"
                                    value={tenant}
                                    onChange={(e) => setTenant(e.target.value)}
                                    disabled={isLoading}
                                    className="w-full px-4 py-2 pr-10 rounded border text-black dark:text-white bg-white dark:bg-black/30 backdrop-blur appearance-none focus:outline-none"
                                >
                                    {TENANT_OPTIONS.map((t) => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        style={{ backgroundColor: BRAND_COLOR }}
                        className={`w-full text-white py-2 rounded font-semibold hover:opacity-90 ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                        disabled={isLoading}
                    >
                        {currentMode === "login"
                            ? "Sign in →"
                            : currentMode === "register"
                                ? "Sign up →"
                                : "Send reset link"}
                    </button>
                </form>

                <div className="mt-5 text-center text-sm text-gray-700 dark:text-gray-300">
                    {currentMode === "login" ? (
                        <>
                            <button
                                onClick={() => setCurrentMode("forgot")}
                                style={{ color: BRAND_COLOR }}
                                className="hover:underline block my-5"
                            >
                                Forgot Password?
                            </button>
                            <span>
                                New to MintTenant?{" "}
                                <button
                                    onClick={() => setCurrentMode("register")}
                                    style={{ color: BRAND_COLOR }}
                                    className="hover:underline"
                                >
                                    Sign Up
                                </button>
                            </span>
                        </>
                    ) : currentMode === "register" ? (
                        <>
                            Already have an account?{" "}
                            <button
                                onClick={() => setCurrentMode("login")}
                                className="hover:underline"
                                style={{ color: BRAND_COLOR }}
                            >
                                Sign In
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setCurrentMode("login")}
                            style={{ color: BRAND_COLOR }}
                            className="hover:underline"
                        >
                            ← Back to login
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
