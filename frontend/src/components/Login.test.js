import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import Login from "./Login";

jest.mock("axios");

describe("Login", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.REACT_APP_API_BASE_URL;
    window.alert = jest.fn();
  });

  it("uses the default backend base URL when no env override is provided", async () => {
    axios.post.mockResolvedValue({
      data: {
        token: "demo-token",
        username: "admin",
        userId: 1,
        role: "admin"
      }
    });

    render(<Login />);

    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: "admin@example.com" }
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "secret" }
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "http://localhost:5000/login",
        expect.objectContaining({
          email: "admin@example.com",
          password: "secret"
        })
      );
    });
  });
});
