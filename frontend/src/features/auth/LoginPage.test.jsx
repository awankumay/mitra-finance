import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { LoginPage } from "./LoginPage";

vi.mock("../../services/api", () => ({
  api: {
    post: vi.fn(),
  },
}));

vi.mock("../../hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

import { api } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";

const postMock = api.post;
const setTokenMock = vi.fn();

describe("LoginPage", () => {
  beforeEach(() => {
    postMock.mockReset();
    setTokenMock.mockReset();
    useAuth.mockReturnValue({ setToken: setTokenMock });
  });

  it("submits credentials and stores token on success", async () => {
    postMock.mockResolvedValue({ data: { token: "jwt-test-token" } });

    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "admin@mitrafinance.local" },
    });

    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "Admin1234" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(postMock).toHaveBeenCalledWith("/auth/login", {
        email: "admin@mitrafinance.local",
        password: "Admin1234",
      });
    });

    expect(setTokenMock).toHaveBeenCalledWith("jwt-test-token");
  });

  it("shows backend error message on failed login", async () => {
    postMock.mockRejectedValue({
      response: { data: { message: "Invalid credentials" } },
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "admin@mitrafinance.local" },
    });

    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "wrongpass" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });

    expect(setTokenMock).not.toHaveBeenCalled();
  });
});
