// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import OptionsPage from "@popup/components/OptionsPage";

const storageData: Record<string, unknown> = {};
const mockChrome = {
  storage: {
    local: {
      get: vi.fn((keys: string[]) =>
        Promise.resolve(
          Object.fromEntries(
            keys.filter((k) => k in storageData).map((k) => [k, storageData[k]])
          )
        )
      ),
      set: vi.fn((items: Record<string, unknown>) => {
        Object.assign(storageData, items);
        return Promise.resolve();
      }),
    },
  },
};

vi.stubGlobal("chrome", mockChrome);

beforeEach(() => {
  vi.clearAllMocks();
  Object.keys(storageData).forEach((k) => delete storageData[k]);
});

describe("OptionsPage component", () => {
  it("renders input fields for both API keys", () => {
    render(<OptionsPage />);

    expect(screen.getByLabelText(/ip2location/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/electricity maps/i)).toBeInTheDocument();
  });

  it("renders a save button", () => {
    render(<OptionsPage />);

    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
  });

  it("saves keys to chrome.storage.local on submit", async () => {
    render(<OptionsPage />);

    const ip2Input = screen.getByLabelText(/ip2location/i);
    const emInput = screen.getByLabelText(/electricity maps/i);
    const saveBtn = screen.getByRole("button", { name: /save/i });

    fireEvent.change(ip2Input, { target: { value: "my-ip2-key" } });
    fireEvent.change(emInput, { target: { value: "my-em-key" } });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(mockChrome.storage.local.set).toHaveBeenCalledWith({
        apiKeys: {
          ip2locationKey: "my-ip2-key",
          electricityMapsKey: "my-em-key",
        },
      });
    });
  });

  it("shows saved confirmation after saving", async () => {
    render(<OptionsPage />);

    fireEvent.change(screen.getByLabelText(/ip2location/i), {
      target: { value: "key1" },
    });
    fireEvent.change(screen.getByLabelText(/electricity maps/i), {
      target: { value: "key2" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText(/saved/i)).toBeInTheDocument();
    });
  });

  it("loads existing keys from storage on mount", async () => {
    storageData["apiKeys"] = {
      ip2locationKey: "existing-ip2",
      electricityMapsKey: "existing-em",
    };

    render(<OptionsPage />);

    await waitFor(() => {
      expect(screen.getByLabelText(/ip2location/i)).toHaveValue("existing-ip2");
      expect(screen.getByLabelText(/electricity maps/i)).toHaveValue("existing-em");
    });
  });

  it("shows links to API key signup pages", () => {
    const { container } = render(<OptionsPage />);

    const links = container.querySelectorAll("a[href]");
    const hrefs = Array.from(links).map((a) => a.getAttribute("href"));
    expect(hrefs).toContain("https://www.ip2location.io/");
    expect(hrefs).toContain("https://api.electricitymap.org/");
  });

  it("shows that Green Web Foundation needs no key", () => {
    render(<OptionsPage />);

    expect(screen.getByText(/no key required/i)).toBeInTheDocument();
  });
});
