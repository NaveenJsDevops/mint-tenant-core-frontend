import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AuthPage from "./AuthPage";
import { signInWithEmailAndPassword } from "firebase/auth";
import toast from "react-hot-toast";

jest.mock("@lottiefiles/react-lottie-player", () => ({
    Player: () => <div data-testid="mock-lottie" />,
}));


// ✅ Mock Firebase Auth
jest.mock("firebase/auth", () => {
    const actual = jest.requireActual("firebase/auth");
    return {
        ...actual,
        getAuth: jest.fn(() => ({})),
        signInWithEmailAndPassword: jest.fn(),
        createUserWithEmailAndPassword: jest.fn(),
        sendPasswordResetEmail: jest.fn(),
        signInWithPopup: jest.fn(),
        GoogleAuthProvider: jest.fn(),
    };
});

jest.mock("firebase/firestore", () => {
    const actual = jest.requireActual("firebase/firestore");
    return {
        ...actual,
        getFirestore: jest.fn(() => ({})),
        doc: jest.fn(),
        getDoc: jest.fn(),
        setDoc: jest.fn(),
    };
});

// ✅ Mock Toasts
jest.mock("react-hot-toast", () => ({
    success: jest.fn(),
    error: jest.fn(),
}));

describe("AuthPage", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test("renders login mode by default", () => {
        render(<AuthPage />);
        expect(screen.getByText(/Welcome Back/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Sign in →/i })).toBeInTheDocument();
    });

    test("can switch to register mode", () => {
        render(<AuthPage />);
        fireEvent.click(screen.getByText(/Sign Up/i));
        expect(screen.getByText(/Create Account/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Sign up →/i })).toBeInTheDocument();
    });

    test("handles successful login", async () => {
        signInWithEmailAndPassword.mockResolvedValueOnce({});
        render(<AuthPage />);
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "test@example.com" } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "test1234" } });

        fireEvent.click(screen.getByRole("button", { name: /Sign in →/i }));

        await waitFor(() => {
            expect(signInWithEmailAndPassword).toHaveBeenCalledWith(expect.anything(), "test@example.com", "test1234");
            expect(toast.success).not.toHaveBeenCalled(); // No toast on login
        });
    });

    test("shows error toast on failed login", async () => {
        signInWithEmailAndPassword.mockRejectedValueOnce(new Error("Invalid credentials"));
        render(<AuthPage />);
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "fail@test.com" } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "badpass" } });
        fireEvent.click(screen.getByRole("button", { name: /Sign in →/i }));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Invalid credentials");
        });
    });

    test("renders forgot password mode", () => {
        render(<AuthPage />);
        fireEvent.click(screen.getByText(/Forgot Password/i));
        expect(screen.getByText(/Reset Password/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Send reset link/i })).toBeInTheDocument();
    });
});
