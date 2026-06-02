import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, fireEvent, render, screen } from "src/utils/test-utils";
import { createTheme } from "@mui/material/styles";
import UploadLimitNotification from "../RateLimitModal";

const mocks = vi.hoisted(() => ({
  socket: new EventTarget(),
  navigate: vi.fn(),
}));

vi.mock("src/hooks/use-socket", () => ({
  useSocket: () => ({ socket: mocks.socket }),
}));

vi.mock("react-router", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mocks.navigate,
  };
});

const theme = createTheme({
  palette: {
    red: {
      500: "#f04438",
    },
  },
});

describe("UploadLimitNotification", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mocks.socket = new EventTarget();
    mocks.navigate.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("routes upgrade CTA to the current pricing page", async () => {
    render(<UploadLimitNotification />, { theme });

    act(() => {
      mocks.socket.dispatchEvent(
        new MessageEvent("message", {
          data: JSON.stringify({
            type: "rate_limit_notification",
            alert_title: "Minutely Turing large evaluator limit reached.",
            alert_description:
              "You have reached the minutely turing large evaluator limit.",
          }),
        }),
      );
      vi.advanceTimersByTime(500);
    });

    const upgradeLink = await screen.findByText("Upgrade now");

    fireEvent.click(upgradeLink);

    expect(mocks.navigate).toHaveBeenCalledWith("/dashboard/settings/pricing");
  });
});
