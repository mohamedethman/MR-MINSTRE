import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { ConfirmProvider, useConfirm } from "./ConfirmDialog";
import { LanguageProvider } from "../context/LanguageContext";

const Harness: React.FC<{ onResult: (v: boolean) => void }> = ({ onResult }) => {
  const confirm = useConfirm();
  return <button onClick={async () => onResult(await confirm("Voulez-vous vraiment supprimer cette annonce ?"))}>delete</button>;
};

const setup = () => {
  localStorage.setItem("language", "fr");
  const onResult = jest.fn();
  render(
    <LanguageProvider>
      <ConfirmProvider>
        <Harness onResult={onResult} />
      </ConfirmProvider>
    </LanguageProvider>
  );
  fireEvent.click(screen.getByText("delete"));
  return onResult;
};

describe("ConfirmDialog", () => {
  it("shows a translated dialog and resolves true on Supprimer", async () => {
    const onResult = setup();
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    expect(screen.getByText("Confirmer la suppression")).toBeInTheDocument();
    expect(screen.getByText("Voulez-vous vraiment supprimer cette annonce ?")).toBeInTheDocument();
    expect(screen.getByText("Annuler")).toHaveFocus(); // safe default
    await act(async () => fireEvent.click(screen.getByText("Supprimer")));
    expect(onResult).toHaveBeenCalledWith(true);
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("resolves false on Annuler, Escape or a click outside", async () => {
    let onResult = setup();
    await act(async () => fireEvent.click(screen.getByText("Annuler")));
    expect(onResult).toHaveBeenLastCalledWith(false);

    fireEvent.click(screen.getByText("delete"));
    await act(async () => fireEvent.keyDown(document, { key: "Escape" }));
    expect(onResult).toHaveBeenLastCalledWith(false);

    fireEvent.click(screen.getByText("delete"));
    const backdrop = screen.getByRole("alertdialog").parentElement!;
    await act(async () => fireEvent.mouseDown(backdrop));
    expect(onResult).toHaveBeenLastCalledWith(false);
    expect(onResult).toHaveBeenCalledTimes(3);
  });
});
