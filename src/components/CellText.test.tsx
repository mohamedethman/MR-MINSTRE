import React from "react";
import { render, screen } from "@testing-library/react";
import CellText from "./CellText";

describe("CellText", () => {
  it("shows a clamped plain-text preview with the full text on hover", () => {
    const long = "<p>Les réponses du <strong>Ministre</strong> lors de la conférence de presse hebdomadaire du Conseil des ministres.</p>";
    render(<CellText text={long} dir="ltr" />);
    const el = screen.getByText(/Les réponses du Ministre/);
    expect(el).toHaveClass("line-clamp-2");
    expect(el).toHaveAttribute("title", "Les réponses du Ministre lors de la conférence de presse hebdomadaire du Conseil des ministres.");
    expect(el.innerHTML).not.toContain("<strong>");
  });

  it("shows a dash when there is no text", () => {
    render(<CellText text={null} />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });
});
