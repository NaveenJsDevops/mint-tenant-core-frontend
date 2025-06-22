import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";
import toast from "react-hot-toast";
import { Player } from "@lottiefiles/react-lottie-player";
import loadingAnimation from "../assets/loading.json";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            toast.success("Signed in!");
            navigate("/dashboard", { replace: true });
        } catch (err) {
            toast.error(err.message.replace("Firebase: ", ""));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 relative">
            {loading && (
                <div className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-white/40 transition-opacity duration-300">
                    <Player autoplay loop src={loadingAnimation} style={{ height: 120, width: 120 }} />
                </div>
            )}

            <form
                onSubmit={handleLogin}
                className="relative bg-white p-8 rounded-xl shadow-lg max-w-sm w-full transition-all duration-300"
            >
                <h2 className="text-2xl font-bold mb-5 text-center text-gray-800">Login</h2>

                <input
                    type="email"
                    placeholder="Email"
                    className="block w-full mb-4 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    disabled={loading}
                />

                <input
                    type="password"
                    placeholder="Password"
                    className="block w-full mb-4 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                />

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-2 px-4 rounded font-semibold text-white transition ${
                        loading
                            ? "bg-blue-400 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700"
                    }`}
                >
                    {loading ? "Signing in..." : "Sign In"}
                </button>

                <div className="mt-4 flex justify-between text-sm text-blue-600">
                    <button
                        type="button"
                        onClick={() => navigate("/login?mode=forgot")}
                        className="hover:underline"
                        disabled={loading}
                    >
                        Forgot password?
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate("/login?mode=register")}
                        className="hover:underline"
                        disabled={loading}
                    >
                        Sign Up
                    </button>
                </div>
            </form>
        </div>
    );
}
