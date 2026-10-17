import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { Modal } from "../modal";

function NestedDialogs() {
  const [editing, setEditing] = useState(true);
  const [preview, setPreview] = useState(false);
  return <Modal isOpen={editing} onClose={() => setEditing(false)} title="Edit company">
    <button onClick={() => setPreview(true)}>Preview</button>
    <Modal isOpen={preview} onClose={() => setPreview(false)} title="Public preview">Preview content</Modal>
  </Modal>;
}

it("Escape closes only the preview and preserves the edit dialog scroll lock", () => {
  const before = document.body.style.overflow;
  render(<NestedDialogs />);
  screen.getByRole("button", { name: "Preview" }).focus();
  fireEvent.click(screen.getByRole("button", { name: "Preview" }));
  expect(screen.getAllByRole("dialog")).toHaveLength(2);
  fireEvent.keyDown(window, { key: "Escape" });
  expect(screen.queryByRole("dialog", { name: "Public preview" })).not.toBeInTheDocument();
  expect(screen.getByRole("dialog", { name: "Edit company" })).toBeInTheDocument();
  expect(document.body.style.overflow).toBe("hidden");
  expect(screen.getByRole("button", { name: "Preview" })).toHaveFocus();
  fireEvent.keyDown(window, { key: "Escape" });
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(document.body.style.overflow).toBe(before);
});
