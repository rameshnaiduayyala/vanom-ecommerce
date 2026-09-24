import React, { useState, useRef, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import { TextStyle, Color } from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import { Table, TableRow, TableHeader, TableCell } from "@tiptap/extension-table";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Unlink,
  Undo,
  Redo,
  Code,
  Minus,
  Highlighter,
  Palette,
  ChevronDown,
  Table as TableIcon,
  Plus,
  Trash2,
  Columns,
  Rows,
} from "lucide-react";

const TEXT_COLORS = [
  { label: "Default (Dark Slate)", value: "#0f172a" },
  { label: "Brand Green", value: "#00875A" },
  { label: "Forest Dark", value: "#003D2B" },
  { label: "Emerald Fresh", value: "#059669" },
  { label: "Warm Gold / Amber", value: "#D97706" },
  { label: "Rose / Crimson", value: "#E11D48" },
  { label: "Royal Blue", value: "#2563EB" },
  { label: "Indigo Purple", value: "#7C3AED" },
  { label: "Muted Gray", value: "#64748b" },
];

const HIGHLIGHT_COLORS = [
  { label: "None (Clear)", value: "" },
  { label: "Bright Yellow", value: "#fef08a" },
  { label: "Soft Emerald", value: "#a7f3d0" },
  { label: "Warm Gold", value: "#fed7aa" },
  { label: "Sky Blue", value: "#bae6fd" },
  { label: "Soft Pink", value: "#fbcfe8" },
  { label: "Lavender", value: "#e9d5ff" },
];

/**
 * Reusable Rich Text Editor powered by Tiptap with table, text color & highlight support.
 */
export function TiptapEditor({
  value = "",
  onChange,
  placeholder = "Write detailed product description, origin, ingredients, certification details...",
  className = "",
  minHeight = 220,
  disabled = false,
}) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showTableMenu, setShowTableMenu] = useState(false);
  const colorPickerRef = useRef(null);
  const highlightPickerRef = useRef(null);
  const tableMenuRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "tiptap-table",
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-[#00875A] underline hover:text-[#00522E] cursor-pointer",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value || "",
    editable: !disabled,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      if (onChange) {
        onChange(html === "<p></p>" ? "" : html);
      }
    },
  });

  // Keep editor content in sync when value changes externally
  useEffect(() => {
    if (editor && value !== undefined && value !== editor.getHTML()) {
      if (value === "" || value === null) {
        editor.commands.setContent("");
      } else if (editor.getHTML() !== value) {
        editor.commands.setContent(value);
      }
    }
  }, [value, editor]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target)) {
        setShowColorPicker(false);
      }
      if (highlightPickerRef.current && !highlightPickerRef.current.contains(event.target)) {
        setShowHighlightPicker(false);
      }
      if (tableMenuRef.current && !tableMenuRef.current.contains(event.target)) {
        setShowTableMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!editor) {
    return null;
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL link:", previousUrl);

    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const handleApplyColor = (colorHex) => {
    if (colorHex) {
      editor.chain().focus().setColor(colorHex).run();
    } else {
      editor.chain().focus().unsetColor().run();
    }
    setShowColorPicker(false);
  };

  const handleApplyHighlight = (colorHex) => {
    if (colorHex) {
      editor.chain().focus().toggleHighlight({ color: colorHex }).run();
    } else {
      editor.chain().focus().unsetHighlight().run();
    }
    setShowHighlightPicker(false);
  };

  const currentColor = editor.getAttributes("textStyle").color || "#0f172a";
  const currentHighlight = editor.getAttributes("highlight").color || "";
  const isInsideTable = editor.isActive("table");

  return (
    <div
      className={`border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs transition-all focus-within:border-[#00875A] focus-within:ring-2 focus-within:ring-[#00875A]/20 ${
        disabled ? "opacity-60 bg-slate-50 cursor-not-allowed pointer-events-none" : ""
      } ${className}`}
    >
      {/* ── Toolbar Header ── */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50/90 border-b border-slate-200 text-slate-700 text-xs select-none">
        {/* Headings */}
        <div className="flex items-center gap-0.5 border-r border-slate-200 pr-1.5 mr-0.5">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-1.5 rounded-lg transition-colors ${
              editor.isActive("heading", { level: 1 })
                ? "bg-[#00875A] text-white"
                : "hover:bg-slate-200/70 text-slate-700"
            }`}
            title="Heading 1"
          >
            <Heading1 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-1.5 rounded-lg transition-colors ${
              editor.isActive("heading", { level: 2 })
                ? "bg-[#00875A] text-white"
                : "hover:bg-slate-200/70 text-slate-700"
            }`}
            title="Heading 2"
          >
            <Heading2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-1.5 rounded-lg transition-colors ${
              editor.isActive("heading", { level: 3 })
                ? "bg-[#00875A] text-white"
                : "hover:bg-slate-200/70 text-slate-700"
            }`}
            title="Heading 3"
          >
            <Heading3 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Text Formatting */}
        <div className="flex items-center gap-0.5 border-r border-slate-200 pr-1.5 mr-0.5">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded-lg transition-colors ${
              editor.isActive("bold") ? "bg-[#00875A] text-white" : "hover:bg-slate-200/70 text-slate-700"
            }`}
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded-lg transition-colors ${
              editor.isActive("italic") ? "bg-[#00875A] text-white" : "hover:bg-slate-200/70 text-slate-700"
            }`}
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-1.5 rounded-lg transition-colors ${
              editor.isActive("underline") ? "bg-[#00875A] text-white" : "hover:bg-slate-200/70 text-slate-700"
            }`}
            title="Underline (Ctrl+U)"
          >
            <UnderlineIcon className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-1.5 rounded-lg transition-colors ${
              editor.isActive("strike") ? "bg-[#00875A] text-white" : "hover:bg-slate-200/70 text-slate-700"
            }`}
            title="Strikethrough"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`p-1.5 rounded-lg transition-colors ${
              editor.isActive("code") ? "bg-[#00875A] text-white" : "hover:bg-slate-200/70 text-slate-700"
            }`}
            title="Inline Code"
          >
            <Code className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Text Color Dropdown */}
        <div className="relative" ref={colorPickerRef}>
          <button
            type="button"
            onClick={() => {
              setShowColorPicker(!showColorPicker);
              setShowHighlightPicker(false);
              setShowTableMenu(false);
            }}
            className="p-1.5 rounded-lg hover:bg-slate-200/70 text-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
            title="Text Color"
          >
            <Palette className="w-3.5 h-3.5" />
            <span
              className="w-2 h-2 rounded-full border border-slate-300"
              style={{ backgroundColor: currentColor }}
            />
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showColorPicker && (
            <div className="absolute top-full left-0 mt-1 z-30 bg-white rounded-xl shadow-xl border border-slate-200 p-2.5 w-48 space-y-1 animate-in fade-in zoom-in-95 duration-150">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1">
                Text Color
              </span>
              <div className="grid grid-cols-5 gap-1 pt-1">
                {TEXT_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => handleApplyColor(c.value)}
                    className="w-6 h-6 rounded-md border border-slate-200 hover:scale-110 transition-transform cursor-pointer shadow-2xs"
                    style={{ backgroundColor: c.value }}
                    title={c.label}
                  />
                ))}
              </div>
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleApplyColor("")}
                  className="w-full text-left px-2 py-1 text-[11px] text-slate-500 hover:bg-slate-50 rounded-md font-medium cursor-pointer"
                >
                  Reset to default color
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Text Highlight Dropdown */}
        <div className="relative border-r border-slate-200 pr-1.5 mr-0.5" ref={highlightPickerRef}>
          <button
            type="button"
            onClick={() => {
              setShowHighlightPicker(!showHighlightPicker);
              setShowColorPicker(false);
              setShowTableMenu(false);
            }}
            className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
              editor.isActive("highlight")
                ? "bg-amber-100 text-amber-900"
                : "hover:bg-slate-200/70 text-slate-700"
            }`}
            title="Highlight Text"
          >
            <Highlighter className="w-3.5 h-3.5 text-amber-500" />
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showHighlightPicker && (
            <div className="absolute top-full left-0 mt-1 z-30 bg-white rounded-xl shadow-xl border border-slate-200 p-2.5 w-48 space-y-1 animate-in fade-in zoom-in-95 duration-150">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1">
                Highlight Background
              </span>
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {HIGHLIGHT_COLORS.map((h) => (
                  <button
                    key={h.label}
                    type="button"
                    onClick={() => handleApplyHighlight(h.value)}
                    className="h-6 rounded-md border border-slate-200 hover:scale-105 transition-transform text-[10px] font-bold flex items-center justify-center cursor-pointer shadow-2xs"
                    style={{ backgroundColor: h.value || "#ffffff" }}
                    title={h.label}
                  >
                    {!h.value ? "✕" : ""}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Table Management Dropdown */}
        <div className="relative border-r border-slate-200 pr-1.5 mr-0.5" ref={tableMenuRef}>
          <button
            type="button"
            onClick={() => {
              setShowTableMenu(!showTableMenu);
              setShowColorPicker(false);
              setShowHighlightPicker(false);
            }}
            className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
              isInsideTable
                ? "bg-[#00875A] text-white"
                : "hover:bg-slate-200/70 text-slate-700"
            }`}
            title="Table Tools"
          >
            <TableIcon className="w-3.5 h-3.5" />
            <ChevronDown className="w-3 h-3 opacity-70" />
          </button>

          {showTableMenu && (
            <div className="absolute top-full left-0 mt-1 z-30 bg-white rounded-xl shadow-xl border border-slate-200 p-2 w-52 space-y-1 text-slate-700 animate-in fade-in zoom-in-95 duration-150">
              {!isInsideTable ? (
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-2 py-1">
                    Insert Table
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
                      setShowTableMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-left rounded-lg hover:bg-emerald-50 hover:text-[#00875A] font-medium cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#00875A]" />
                    Insert 3 × 3 Table
                  </button>
                </div>
              ) : (
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-2 py-0.5">
                    Table Controls
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().addColumnAfter().run();
                      setShowTableMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded-lg hover:bg-slate-100 cursor-pointer"
                  >
                    <Columns className="w-3.5 h-3.5 text-slate-500" />
                    Add Column
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().deleteColumn().run();
                      setShowTableMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded-lg hover:bg-slate-100 text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Column
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().addRowAfter().run();
                      setShowTableMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded-lg hover:bg-slate-100 cursor-pointer"
                  >
                    <Rows className="w-3.5 h-3.5 text-slate-500" />
                    Add Row
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().deleteRow().run();
                      setShowTableMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded-lg hover:bg-slate-100 text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Row
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().toggleHeaderRow().run();
                      setShowTableMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded-lg hover:bg-slate-100 cursor-pointer"
                  >
                    Toggle Header Row
                  </button>
                  <div className="pt-1 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        editor.chain().focus().deleteTable().run();
                        setShowTableMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded-lg hover:bg-rose-50 text-rose-600 font-semibold cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete Entire Table
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Alignment */}
        <div className="flex items-center gap-0.5 border-r border-slate-200 pr-1.5 mr-0.5">
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            className={`p-1.5 rounded-lg transition-colors ${
              editor.isActive({ textAlign: "left" })
                ? "bg-[#00875A] text-white"
                : "hover:bg-slate-200/70 text-slate-700"
            }`}
            title="Align Left"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            className={`p-1.5 rounded-lg transition-colors ${
              editor.isActive({ textAlign: "center" })
                ? "bg-[#00875A] text-white"
                : "hover:bg-slate-200/70 text-slate-700"
            }`}
            title="Align Center"
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            className={`p-1.5 rounded-lg transition-colors ${
              editor.isActive({ textAlign: "right" })
                ? "bg-[#00875A] text-white"
                : "hover:bg-slate-200/70 text-slate-700"
            }`}
            title="Align Right"
          >
            <AlignRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Lists & Quotes */}
        <div className="flex items-center gap-0.5 border-r border-slate-200 pr-1.5 mr-0.5">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 rounded-lg transition-colors ${
              editor.isActive("bulletList") ? "bg-[#00875A] text-white" : "hover:bg-slate-200/70 text-slate-700"
            }`}
            title="Bullet List"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1.5 rounded-lg transition-colors ${
              editor.isActive("orderedList") ? "bg-[#00875A] text-white" : "hover:bg-slate-200/70 text-slate-700"
            }`}
            title="Numbered List"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-1.5 rounded-lg transition-colors ${
              editor.isActive("blockquote") ? "bg-[#00875A] text-white" : "hover:bg-slate-200/70 text-slate-700"
            }`}
            title="Blockquote"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className="p-1.5 rounded-lg hover:bg-slate-200/70 text-slate-700 transition-colors"
            title="Horizontal Divider"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Links */}
        <div className="flex items-center gap-0.5 border-r border-slate-200 pr-1.5 mr-0.5">
          <button
            type="button"
            onClick={setLink}
            className={`p-1.5 rounded-lg transition-colors ${
              editor.isActive("link") ? "bg-[#00875A] text-white" : "hover:bg-slate-200/70 text-slate-700"
            }`}
            title="Add Link"
          >
            <LinkIcon className="w-3.5 h-3.5" />
          </button>
          {editor.isActive("link") && (
            <button
              type="button"
              onClick={() => editor.chain().focus().unsetLink().run()}
              className="p-1.5 rounded-lg hover:bg-slate-200/70 text-rose-600 transition-colors"
              title="Remove Link"
            >
              <Unlink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5 ml-auto">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-1.5 rounded-lg hover:bg-slate-200/70 text-slate-600 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <Undo className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-1.5 rounded-lg hover:bg-slate-200/70 text-slate-600 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="Redo (Ctrl+Y)"
          >
            <Redo className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Editor Canvas ── */}
      <div className="p-4 flex-1 cursor-text bg-white" onClick={() => editor.chain().focus().run()}>
        <EditorContent
          editor={editor}
          style={{ minHeight: `${minHeight}px` }}
          className="tiptap-content text-slate-800 text-sm leading-relaxed outline-none prose prose-slate max-w-none focus:outline-none"
        />
      </div>
    </div>
  );
}

export default TiptapEditor;
