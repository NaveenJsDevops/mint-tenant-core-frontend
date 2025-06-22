import { useEffect, useState } from "react";
import api from "./api";

export default function useAuthenticatedUser(endpoint = "/auth/me") {
    const [user, setUser] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const { data } = await api.get(endpoint);
                setUser(data);
            } catch (err) {
                setError(err.response?.data?.detail || "Failed to load user.");
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [endpoint]);

    return { user, error, loading };
}
