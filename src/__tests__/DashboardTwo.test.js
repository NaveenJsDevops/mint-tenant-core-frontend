import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import DashboardTwo from "../component/DashboardTwo";

jest.mock("../component/useAuthenticatedUser", () => () => ({
    user: { email: "hr@test.com", role: "HR" },
    loading: false,
    error: ""
}));

const mockConfig = {
    primaryColor: "#123456",
    secondaryColor: "#abcdef",
    features: { payroll: true, hiring: false }
};

test("renders DashboardTwo with HR Tools", () => {
    render(<DashboardTwo config={mockConfig} />);
    expect(screen.getByText("HR Tools")).toBeInTheDocument();
});
