import React, { useEffect, useRef, useState } from "react";
import { BrandStyle, BrandColorRole } from "../types";
import { storageService, saveCurrentStyleId, loadCurrentStyleId } from "../services/storageService";
import { TrashIcon, PencilIcon, PlusIcon } from "@heroicons/react/24/outline";

const defaultColorRoles: BrandColorRole[] = ["primary", "secondary", "accent", "other"];

// const defaultStyle: Omit<BrandStyle, "id"> = {
//   name: "ACME",
//   description: "the highest peak",
//   teaser: "ACME Inc. Wares - Wile E. Coyote",
//   colors: [],
//   logos: [],
// };

const StylePage: React.FC = () => {
  const [styles, setStyles] = useState<BrandStyle[]>([]);
  const [selectedStyleId, setSelectedStyleId] = useState<number | null>(null);
  const [editing, setEditing] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Refs for form fields
  const nameRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);
  const teaserRef = useRef<HTMLInputElement>(null);

  // For editing colors
  const [colorList, setColorList] = useState<BrandStyle["colors"]>([]);

  // Initial load
  useEffect(() => {
    storageService.getStyles().then(setStyles);
    setSelectedStyleId(loadCurrentStyleId());
  }, []);

  // When selecting a style, update colorList for form editing
  useEffect(() => {
    const style = styles.find((s) => s.id === selectedStyleId);
    setColorList(style?.colors || []);
  }, [selectedStyleId, styles]);

  // Set selectedStyle as current
  function handleSelectStyle(id: number) {
    setSelectedStyleId(id);
    saveCurrentStyleId(id);
    setEditing(false);
    setFormError(null);
  }

  // Start editing a style
  function handleEditStyle(id: number) {
    setSelectedStyleId(id);
    setEditing(true);
    setFormError(null);
  }

  // Start creating a new style
  function handleAddNew() {
    setSelectedStyleId(null);
    setEditing(true);
    setColorList([]);
    setFormError(null);
    setTimeout(() => {
      nameRef.current?.focus();
    }, 1);
  }

  // Save (add or update) style
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const name = nameRef.current?.value.trim() || "";
    if (!name) {
      setFormError("Name is required.");
      return;
    }
    const description = descRef.current?.value || "";
    const teaser = teaserRef.current?.value || "";

    // Prevent duplicate names
    if (styles.some((style) => style.name.toLowerCase() === name.toLowerCase() && style.id !== selectedStyleId)) {
      setFormError("A style with this name already exists.");
      return;
    }

    let style: BrandStyle;
    if (selectedStyleId) {
      style = {
        ...styles.find((s) => s.id === selectedStyleId)!,
        name,
        description,
        teaser,
        colors: colorList,
        // skip logos for brevity
      };
      await storageService.updateStyle(style);
      setStyles((prev) => prev.map((s) => (s.id === style.id ? style : s)));
    } else {
      const id = Date.now();
      style = {
        id,
        name,
        description,
        teaser,
        colors: colorList,
        logos: [],
      };
      await storageService.addStyle(style);
      setStyles((prev) => [...prev, style]);
      setSelectedStyleId(id);
      saveCurrentStyleId(id);
    }
    setEditing(false);
  }

  // Delete a style
  async function handleDelete(id: number) {
    if (!window.confirm("Delete this style?")) return;
    await storageService.deleteStyle(id);
    setStyles((prev) => prev.filter((s) => s.id !== id));
    if (selectedStyleId === id) setSelectedStyleId(null);
  }

  // Color palette editing
  function handleColorChange(idx: number, field: "hex" | "role" | "name", value: string) {
    setColorList((prev) => prev.map((color, i) => (i === idx ? { ...color, [field]: value } : color)));
  }
  function handleAddColor() {
    setColorList((prev) => [...prev, { hex: "#000000", role: "other", name: "" }]);
  }
  function handleRemoveColor(idx: number) {
    setColorList((prev) => prev.filter((_, i) => i !== idx));
  }

  const selectedStyle = styles.find((s) => s.id === selectedStyleId);

  // Theme-aware styling
  const fieldBase = "block w-full border border-gray-300 dark:border-gray-700 p-2 rounded bg-inherit text-inherit mb-2";
  const buttonBase = "px-3 py-2 rounded font-semibold transition focus:outline-none";

  return (
    <div className="max-w-xl mx-auto bg-white dark:bg-gray-900 text-black dark:text-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Brand Styles</h2>
      <div className="mb-6 flex items-center gap-2">
        <select className={fieldBase} value={selectedStyleId || ""} onChange={(e) => handleSelectStyle(Number(e.target.value))}>
          <option value="">Select a style…</option>
          {styles.map((style) => (
            <option key={style.id} value={style.id}>
              {style.name}
            </option>
          ))}
        </select>
        <button className={buttonBase + " bg-green-500 text-white flex items-center gap-1"} onClick={handleAddNew} title="Add new style">
          <PlusIcon className="w-5 h-5" /> New
        </button>
      </div>

      {/* Style list */}
      <div className="mb-6">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {styles.map((style) => (
            <li key={style.id} className="flex items-center justify-between py-2">
              <div>
                <span className="font-semibold">{style.name}</span>
                <span className="ml-2 text-xs text-gray-400">{style.teaser}</span>
                <div className="flex gap-1 mt-1">
                  {style.colors.map((c, idx) => (
                    <span
                      key={idx}
                      className="inline-block w-4 h-4 rounded-full border border-gray-300 dark:border-gray-700"
                      title={c.role + (c.name ? ": " + c.name : "")}
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-1">
                <button className={buttonBase + " bg-blue-500 text-white"} onClick={() => handleEditStyle(style.id)} title="Edit">
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button className={buttonBase + " bg-red-500 text-white"} onClick={() => handleDelete(style.id)} title="Delete">
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Edit/Create Form */}
      {editing && (
        <form onSubmit={handleSave} className="bg-gray-100 dark:bg-gray-800 p-4 rounded shadow">
          {formError && <div className="text-red-500 mb-2">{formError}</div>}
          <input ref={nameRef} defaultValue={selectedStyle?.name || ""} className={fieldBase} placeholder="Style Name" required />
          <textarea ref={descRef} defaultValue={selectedStyle?.description || ""} className={fieldBase} placeholder="Description" rows={2} />
          <input ref={teaserRef} defaultValue={selectedStyle?.teaser || ""} className={fieldBase} placeholder="Teaser" />

          <div className="mb-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold">Colors</label>
              <button type="button" className={buttonBase + " bg-blue-500 text-white"} onClick={handleAddColor} title="Add color">
                <PlusIcon className="w-5 h-5" />
              </button>
            </div>
            {colorList.map((color, idx) => (
              <div key={idx} className="flex gap-2 items-center mb-1">
                <input
                  type="color"
                  value={color.hex}
                  onChange={(e) => handleColorChange(idx, "hex", e.target.value)}
                  className="w-8 h-8 border rounded"
                  title="Color"
                />
                <select value={color.role} onChange={(e) => handleColorChange(idx, "role", e.target.value)} className="border rounded p-1">
                  {defaultColorRoles.map((role) => (
                    <option key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={color.name || ""}
                  onChange={(e) => handleColorChange(idx, "name", e.target.value)}
                  className="border rounded p-1"
                  placeholder="Name (optional)"
                />
                <button type="button" className="text-red-500" onClick={() => handleRemoveColor(idx)} title="Remove color">
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <button type="submit" className={buttonBase + " bg-blue-600 text-white mt-4 w-full"}>
            Save Style
          </button>
        </form>
      )}
    </div>
  );
};

export default StylePage;
