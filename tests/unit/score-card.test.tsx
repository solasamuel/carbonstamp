// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import ScoreCard from "@popup/components/ScoreCard";

const defaultProps = {
  grade: "B" as const,
  co2Grams: 0.25,
  transferKb: 512,
  energyKwh: 0.0015,
  greenHost: false,
  percentileText: "heavier than 45% of 200 pages analysed",
};

describe("ScoreCard component", () => {
  // T-033: Popup displays current page score
  it("displays the letter grade (T-033)", () => {
    render(<ScoreCard {...defaultProps} />);
    expect(screen.getByText("B")).toBeInTheDocument();
  });

  it("displays CO2 in grams", () => {
    render(<ScoreCard {...defaultProps} />);
    expect(screen.getByText(/0\.25/)).toBeInTheDocument();
    expect(screen.getByText(/gCO₂/i)).toBeInTheDocument();
  });

  it("displays transfer size in KB", () => {
    render(<ScoreCard {...defaultProps} />);
    expect(screen.getByText(/512/)).toBeInTheDocument();
  });

  it("displays transfer size in MB when >= 1024 KB", () => {
    render(<ScoreCard {...defaultProps} transferKb={2048} />);
    expect(screen.getByText(/2\.00\s*MB/i)).toBeInTheDocument();
  });

  it("displays estimated energy in kWh", () => {
    render(<ScoreCard {...defaultProps} />);
    expect(screen.getByText(/0\.0015/)).toBeInTheDocument();
  });

  it("shows green hosting status as 'conventional' when not green", () => {
    render(<ScoreCard {...defaultProps} greenHost={false} />);
    expect(screen.getByText(/conventional/i)).toBeInTheDocument();
  });

  it("shows green hosting status as 'green' when green hosted", () => {
    render(<ScoreCard {...defaultProps} greenHost={true} />);
    expect(screen.getByText(/green host/i)).toBeInTheDocument();
  });

  it("displays percentile comparison text", () => {
    render(<ScoreCard {...defaultProps} />);
    expect(
      screen.getByText("heavier than 45% of 200 pages analysed")
    ).toBeInTheDocument();
  });

  it("applies colour-coded class based on grade", () => {
    const { container } = render(<ScoreCard {...defaultProps} grade="A+" />);
    const badge = container.querySelector("[data-grade]");
    expect(badge).toHaveAttribute("data-grade", "A+");
  });

  it("renders all sections for A+ grade", () => {
    render(
      <ScoreCard
        grade="A+"
        co2Grams={0.05}
        transferKb={128}
        energyKwh={0.0001}
        greenHost={true}
        percentileText="heavier than 2% of 500 pages analysed"
      />
    );
    expect(screen.getByText("A+")).toBeInTheDocument();
    expect(screen.getByText(/0\.05/)).toBeInTheDocument();
    expect(screen.getByText(/green host/i)).toBeInTheDocument();
  });

  it("renders all sections for F grade", () => {
    render(
      <ScoreCard
        grade="F"
        co2Grams={1.5}
        transferKb={5120}
        energyKwh={0.01}
        greenHost={false}
        percentileText="heavier than 98% of 500 pages analysed"
      />
    );
    expect(screen.getByText("F")).toBeInTheDocument();
    expect(screen.getByText(/1\.50*\s*/)).toBeInTheDocument();
    expect(screen.getByText(/conventional/i)).toBeInTheDocument();
  });
});
