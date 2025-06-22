import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import DashboardOne from "../component/DashboardOne";

jest.mock("../component/useAuthenticatedUser", () => () => ({
    user: { email: "admin@test.com", role: "Admin" },
    loading: false,
    error: ""
}));

const mockConfig = {
    primaryColor: "#000",
    secondaryColor: "#fff",
    logo: "logo.png",
    brandName: "Test Brand",
    features: { billing: true, payroll: false }
};

test("renders DashboardOne and opens modal", () => {
    render(<DashboardOne config={mockConfig} />);
    expect(screen.getByText("Test")).toBeInTheDocument();
    expect(screen.getByText("Brand")).toBeInTheDocument();
    expect(screen.getByText(/billing/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Update Features/i));
    expect(screen.getByText(/Manage Features/i)).toBeInTheDocument();
});


