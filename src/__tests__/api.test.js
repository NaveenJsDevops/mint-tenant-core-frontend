import { tenantApi } from "../component/api";

beforeAll(() => {
    delete window.location;
    window.location = { hostname: "tenant1.example.com" };
});

test("tenantApi builds correct URL", () => {
    expect(tenantApi("/config")).toBe("/api/tenant/tenant1/config");
});
