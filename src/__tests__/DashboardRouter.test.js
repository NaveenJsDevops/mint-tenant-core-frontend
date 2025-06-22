import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import DashboardRouter from "../component/DashboardRouter";
import * as firebaseHooks from "react-firebase-hooks/auth";
import * as apiModule from "../component/api";

jest.mock("../component/DashboardOne", () => () => <div>DashboardOne Rendered</div>);
jest.mock("../component/DashboardTwo", () => () => <div>DashboardTwo Rendered</div>);

jest.mock("../component/firebase", () => ({ auth: {} }));

const mockApi = jest.spyOn(apiModule, "default");
mockApi.get = jest.fn();

const mockTenantApi = jest.spyOn(apiModule, "tenantApi");
mockTenantApi.mockReturnValue("/config");

test("renders DashboardOne for layout=side", async () => {
    jest.spyOn(firebaseHooks, "useAuthState").mockReturnValue([{}]);
    mockApi.get.mockResolvedValue({ data: { layout: "side" } });

    render(<DashboardRouter />);
    await screen.findByText(/DashboardOne Rendered/i);
});
