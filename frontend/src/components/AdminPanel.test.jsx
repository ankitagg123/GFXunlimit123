import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import AdminPanel from "./AdminPanel";
import { useLocation } from "react-router-dom";
import axios from "axios";

jest.mock("react-router-dom", () => ({
  useLocation: jest.fn()
}), { virtual: true });

jest.mock("axios");

jest.mock("./Pagination", () => () => <div data-testid="pagination" />);

describe("AdminPanel collection controls", () => {
  beforeEach(() => {
    useLocation.mockReturnValue({ search: "?tab=controls" });
    axios.get.mockImplementation((url) => {
      if (url.includes("/admin/categories")) {
        return Promise.resolve({ data: [{ id: 1, name: "Images" }] });
      }
      if (url.includes("/admin/collections")) {
        return Promise.resolve({ data: [{ id: 1, name: "Nature" }] });
      }
      return Promise.resolve({ data: [{ id: 1, title: "Live asset", status: "approved", filename: "asset.jpg", category: "Images", keywords: "", description: "", type: "image" }] });
    });
    axios.post.mockResolvedValue({ data: { id: 2, name: "Travel" } });
    axios.delete.mockResolvedValue({ data: { id: 1, name: "Nature" } });
  });

  it("renders collection controls without approval or rejection actions", async () => {
    render(<AdminPanel />);

    expect(await screen.findByText(/active collections/i)).toBeInTheDocument();
    expect(screen.queryByText(/^approve$/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/^reject$/i)).not.toBeInTheDocument();
    expect(screen.getByText(/manage categories/i)).toBeInTheDocument();
  });

  it("shows category management controls in the controls tab", async () => {
    render(<AdminPanel />);

    expect(await screen.findByText(/manage categories/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/new category name/i)).toBeInTheDocument();
  });

  it("renders a live assets tab for approved assets", async () => {
    useLocation.mockReturnValue({ search: "?tab=live-assets" });

    render(<AdminPanel />);

    expect(await screen.findAllByText(/live assets/i)).not.toHaveLength(0);
    expect(screen.getAllByText(/live asset/i).length).toBeGreaterThan(0);
  });

  it("shows upload-style editing fields and sends collection updates", async () => {
    useLocation.mockReturnValue({ search: "?tab=live-assets" });
    axios.put.mockResolvedValue({ data: { id: 1, title: "Live asset", status: "approved", filename: "asset.jpg", category: "Images", collection: "Nature", keywords: "", description: "", type: "image" } });
    const dispatchSpy = jest.spyOn(window, "dispatchEvent");

    render(<AdminPanel />);

    fireEvent.click(await screen.findByRole("button", { name: /edit/i }));

    expect(screen.getByRole("combobox", { name: /select primary category/i })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: /select optional category/i })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: /collection/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /nature/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        expect.stringContaining("/images/1"),
        expect.objectContaining({ collection: expect.any(String) }),
        expect.anything()
      );
    });

    await waitFor(() => {
      expect(dispatchSpy).toHaveBeenCalledWith(expect.objectContaining({ type: "asset-collections-updated" }));
    });

    await waitFor(() => {
      expect(screen.queryByText(/title \(max 5 words\)/i)).not.toBeInTheDocument();
    });

    dispatchSpy.mockRestore();
  });

  it("dispatches refresh events after saving a collection rename", async () => {
    useLocation.mockReturnValue({ search: "?tab=controls" });
    const dispatchSpy = jest.spyOn(window, "dispatchEvent");
    axios.put.mockImplementation((url) => {
      if (url.includes("/admin/collections/")) {
        return Promise.resolve({ data: { id: 1, name: "Forest" } });
      }
      return Promise.resolve({ data: { id: 1, title: "Live asset", status: "approved", filename: "asset.jpg", category: "Images", collection: "Nature", keywords: "", description: "", type: "image" } });
    });

    render(<AdminPanel />);

    await screen.findByText(/active collections/i);
    fireEvent.click(screen.getAllByRole("button", { name: /modify/i })[1]);
    fireEvent.change(screen.getByDisplayValue(/nature/i), { target: { value: "Forest" } });
    fireEvent.click(screen.getByRole("button", { name: /^save$/i }));

    await waitFor(() => {
      expect(dispatchSpy).toHaveBeenCalledWith(expect.objectContaining({ type: "asset-refresh" }));
    });

    dispatchSpy.mockRestore();
  });

  it("renders a users tab for admin user management", async () => {
    useLocation.mockReturnValue({ search: "?tab=users" });
    axios.get.mockImplementation((url) => {
      if (url.includes("/admin/users")) {
        return Promise.resolve({ data: [
          { id: 1, full_name: "Test User", username: "tester", email: "tester@example.com", role: "contributor", identity_number: "123", credits: 5, status: "pending" },
          { id: 2, full_name: "Inactive User", username: "inactive", email: "inactive@example.com", role: "contributor", identity_number: "456", credits: 0, status: "inactive" },
          { id: 3, full_name: "Blocked User", username: "blocked", email: "blocked@example.com", role: "contributor", identity_number: "789", credits: 0, status: "blocked" }
        ] });
      }
      if (url.includes("/admin/categories")) {
        return Promise.resolve({ data: [{ id: 1, name: "Images" }] });
      }
      if (url.includes("/admin/collections")) {
        return Promise.resolve({ data: [{ id: 1, name: "Nature" }] });
      }
      return Promise.resolve({ data: [{ id: 1, title: "Live asset", status: "approved", filename: "asset.jpg", category: "Images", keywords: "", description: "", type: "image" }] });
    });

    render(<AdminPanel />);

    expect(await screen.findByText(/user management/i)).toBeInTheDocument();
    expect(screen.getByText(/test user/i)).toBeInTheDocument();
    expect(screen.getByText(/inactive user/i)).toBeInTheDocument();
    expect(screen.getByText(/blocked user/i)).toBeInTheDocument();
  });

  it("creates a new customer account when Add New is used", async () => {
    useLocation.mockReturnValue({ search: "?tab=users" });
    axios.get.mockImplementation((url) => {
      if (url.includes("/admin/users")) {
        return Promise.resolve({ data: [] });
      }
      if (url.includes("/admin/categories")) {
        return Promise.resolve({ data: [{ id: 1, name: "Images" }] });
      }
      if (url.includes("/admin/collections")) {
        return Promise.resolve({ data: [{ id: 1, name: "Nature" }] });
      }
      return Promise.resolve({ data: [{ id: 1, title: "Live asset", status: "approved", filename: "asset.jpg", category: "Images", keywords: "", description: "", type: "image" }] });
    });

    axios.post.mockImplementation((url, payload) => {
      if (url.includes("/admin/users")) {
        return Promise.resolve({ data: { id: 4, ...payload } });
      }
      return Promise.resolve({ data: { id: 2, name: "Travel" } });
    });

    render(<AdminPanel />);

    fireEvent.click(await screen.findByRole("button", { name: /add new/i }));

    fireEvent.change(screen.getByPlaceholderText(/full name/i), { target: { value: "Dummy Customer" } });
    fireEvent.change(screen.getByPlaceholderText(/username/i), { target: { value: "dummycust" } });
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: "dummy@customer.test" } });
    fireEvent.change(screen.getByPlaceholderText(/id #/i), { target: { value: "DUMMY001" } });
    fireEvent.change(screen.getByPlaceholderText(/credits/i), { target: { value: "10" } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: "password123" } });
    fireEvent.change(screen.getByRole("combobox", { name: /role/i }), { target: { value: "customer" } });
    fireEvent.change(screen.getByRole("combobox", { name: /status/i }), { target: { value: "active" } });

    fireEvent.click(screen.getByRole("button", { name: /^save$/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining("/admin/users"),
        expect.objectContaining({
          full_name: "Dummy Customer",
          username: "dummycust",
          email: "dummy@customer.test",
          role: "customer",
          identity_number: "DUMMY001",
          credits: 10,
          status: "active",
          password: "password123"
        }),
        expect.anything()
      );
    });

    await waitFor(() => {
      expect(screen.queryByText(/update user details and save changes/i)).not.toBeInTheDocument();
    });

    expect(screen.getByText(/dummy customer/i)).toBeInTheDocument();
  });

  it("renders activate, deactivate, modify, and delete controls for users", async () => {
    useLocation.mockReturnValue({ search: "?tab=users" });
    axios.get.mockImplementation((url) => {
      if (url.includes("/admin/users")) {
        return Promise.resolve({ data: [
          { id: 1, full_name: "Test User", username: "tester", email: "tester@example.com", role: "contributor", identity_number: "123", credits: 5, status: "pending" }
        ] });
      }
      if (url.includes("/admin/categories")) {
        return Promise.resolve({ data: [{ id: 1, name: "Images" }] });
      }
      if (url.includes("/admin/collections")) {
        return Promise.resolve({ data: [{ id: 1, name: "Nature" }] });
      }
      return Promise.resolve({ data: [{ id: 1, title: "Live asset", status: "approved", filename: "asset.jpg", category: "Images", keywords: "", description: "", type: "image" }] });
    });
    axios.put.mockResolvedValue({ data: { id: 1, full_name: "Test User", username: "tester", email: "tester@example.com", role: "contributor", identity_number: "123", credits: 5, status: "active" } });

    render(<AdminPanel />);

    expect(await screen.findByText(/^Activate$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Block$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Modify$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Delete$/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/^Modify$/i));
    expect(screen.getByPlaceholderText(/full name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^save$/i })).toBeInTheDocument();
  });

});
