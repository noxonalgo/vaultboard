import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, useSortable, arrayMove, rectSortingStrategy, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { createClient } from "@supabase/supabase-js";
import {
  Plus,
  Link as LinkIcon,
  Image as ImageIcon,
  FolderPlus,
  Search,
  LayoutGrid,
  Sparkles,
  Briefcase,
  Trash2,
  Pencil,
  Copy,
  Check,
  ExternalLink,
  Download,
  Upload,
  Database,
  X,
  Cloud,
  CloudOff,
  LoaderCircle,
  LayoutList,
  GripVertical,
  Zap,
} from "lucide-react";

const AUTH_KEY = "vaultboard-authenticated";
const APP_PASSWORD = "07092024tw";

const QUICK_COLORS = [
  { id: "purple", bg: "#4f46e5", text: "#eef2ff" },
  { id: "teal",   bg: "#0f766e", text: "#f0fdfa" },
  { id: "coral",  bg: "#c2410c", text: "#fff7ed" },
  { id: "blue",   bg: "#1d4ed8", text: "#eff6ff" },
  { id: "amber",  bg: "#b45309", text: "#fffbeb" },
  { id: "pink",   bg: "#be185d", text: "#fdf2f8" },
  { id: "green",  bg: "#15803d", text: "#f0fdf4" },
  { id: "gray",   bg: "#475569", text: "#f8fafc" },
];

const SUPABASE_URL = "https://qdpihvqcslgciwaqylpm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_1lP2ZUZln2soojnA8pLGEw_Y9Hz9h4V";
const SUPABASE_STATE_TABLE = "vaultboard_state";
const SUPABASE_STATE_ROW_ID = "main";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const starterData = [
  {
    id: "prompty",
    name: "Prompty",
    icon: "sparkles",
    description: "Miesto pre promptové nápady, inšpirácie a vizuálne referencie.",
    items: [],
  },
  {
    id: "biznis",
    name: "Biznis",
    icon: "briefcase",
    description: "Nápady, články, zdroje a podklady pre biznis a projekty.",
    items: [],
  },
];

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function createId(prefix = "id") {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function getIcon(iconName) {
  switch (iconName) {
    case "briefcase":
      return Briefcase;
    case "sparkles":
    default:
      return Sparkles;
  }
}

function createEmptyItem() {
  return {
    title: "",
    description: "",
    content: "",
    link: "",
    image: "",
    imagePositionX: 50,
    imagePositionY: 50,
  };
}

function normalizeUrl(url) {
  const trimmed = String(url || "").trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function isValidSectionsData(value) {
  if (!Array.isArray(value)) return false;

  return value.every((section) => {
    if (!section || typeof section !== "object") return false;
    if (typeof section.id !== "string") return false;
    if (typeof section.name !== "string") return false;
    if (!Array.isArray(section.items)) return false;

    return section.items.every((item) => {
      if (!item || typeof item !== "object") return false;
      if (typeof item.id !== "string") return false;
      return true;
    });
  });
}

function AppButton({ className = "", variant = "default", type = "button", children, ...props }) {
  const variants = {
    default: "bg-white text-slate-950 hover:bg-slate-200",
    outline: "border border-white/10 bg-white/5 text-white hover:bg-white/10",
    ghost: "bg-transparent text-white hover:bg-white/10",
    danger: "border border-red-400/20 bg-red-400/10 text-red-200 hover:bg-red-400/20",
  };

  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition disabled:pointer-events-none disabled:opacity-50",
        variants[variant] || variants.default,
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function AppInput({ className = "", ...props }) {
  return (
    <input
      className={cn(
        "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-white/20 focus:ring-2 focus:ring-white/10",
        className
      )}
      {...props}
    />
  );
}

const AppTextarea = React.forwardRef(function AppTextarea({ className = "", ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-white/20 focus:ring-2 focus:ring-white/10",
        className
      )}
      {...props}
    />
  );
});

function Card({ className = "", children }) {
  return <div className={cn("rounded-[28px] border border-white/10 bg-white/5", className)}>{children}</div>;
}

function CardHeader({ className = "", children }) {
  return <div className={cn("p-6", className)}>{children}</div>;
}

function CardContent({ className = "", children }) {
  return <div className={cn("p-6", className)}>{children}</div>;
}

function CardTitle({ className = "", children }) {
  return <h3 className={cn("font-semibold", className)}>{children}</h3>;
}

function Badge({ className = "", children }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium text-slate-200", className)}>
      {children}
    </span>
  );
}

function Modal({ open, onClose, title, children, maxWidth = "max-w-2xl" }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className={cn(
          "relative max-h-[92vh] w-full overflow-y-auto rounded-[28px] border border-white/10 bg-slate-950 p-6 text-white shadow-2xl",
          maxWidth
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
            aria-label="Zavrieť"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function fallbackCopyWithTextarea(text) {
  if (typeof document === "undefined") return false;

  const textarea = document.createElement("textarea");
  textarea.value = String(text || "");
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "0";
  textarea.style.left = "0";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  let success = false;
  try {
    success = typeof document.execCommand === "function" ? document.execCommand("copy") : false;
  } catch {
    success = false;
  }

  document.body.removeChild(textarea);
  return success;
}

async function copyTextToClipboard(text) {
  const value = String(text || "");
  const fallbackSuccess = fallbackCopyWithTextarea(value);
  if (fallbackSuccess) return { success: true };
  return { success: false };
}

async function fetchRemoteState() {
  const { data, error } = await supabase
    .from(SUPABASE_STATE_TABLE)
    .select("id, sections, quick_copy")
    .eq("id", SUPABASE_STATE_ROW_ID)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function saveRemoteState(sections, attempt = 0) {
  const payload = {
    id: SUPABASE_STATE_ROW_ID,
    sections,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from(SUPABASE_STATE_TABLE).upsert(payload, { onConflict: "id" });
  if (error) {
    if (attempt < 3) {
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise((r) => setTimeout(r, delay));
      return saveRemoteState(sections, attempt + 1);
    }
    throw error;
  }
}

async function saveQuickCopy(buttons, attempt = 0) {
  const { error } = await supabase
    .from(SUPABASE_STATE_TABLE)
    .upsert({ id: SUPABASE_STATE_ROW_ID, quick_copy: buttons, updated_at: new Date().toISOString() }, { onConflict: "id" });
  if (error) {
    if (attempt < 3) {
      await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 1000));
      return saveQuickCopy(buttons, attempt + 1);
    }
    throw error;
  }
}

function SyncStatusBadge({ status, message }) {
  const map = {
    idle: { icon: Cloud, text: "Cloud aktívny", className: "text-emerald-300 border-emerald-400/20 bg-emerald-400/10" },
    loading: { icon: LoaderCircle, text: "Načítavam cloud", className: "text-sky-300 border-sky-400/20 bg-sky-400/10" },
    saving: { icon: LoaderCircle, text: "Ukladám do cloudu", className: "text-amber-300 border-amber-400/20 bg-amber-400/10" },
    error: { icon: CloudOff, text: message || "Chyba synchronizácie", className: "text-red-300 border-red-400/20 bg-red-400/10" },
  };

  const config = map[status] || map.idle;
  const Icon = config.icon;

  return (
    <span className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium", config.className)}>
      <Icon className={cn("h-3.5 w-3.5", status === "loading" || status === "saving" ? "animate-spin" : "")} />
      {config.text}
    </span>
  );
}

async function compressImage(file, maxSizeKB = 480, maxWidth = 1600) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      const tryCompress = (quality) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) { reject(new Error("Kompressia zlyhala")); return; }
            if (blob.size > maxSizeKB * 1024 && quality > 0.25) {
              tryCompress(Math.round((quality - 0.1) * 10) / 10);
            } else {
              resolve(blob);
            }
          },
          "image/webp",
          quality
        );
      };
      tryCompress(0.85);
    };
    img.onerror = () => reject(new Error("Nepodarilo sa načítať obrázok"));
    img.src = url;
  });
}

async function uploadImageToStorage(file) {
  const compressed = await compressImage(file);
  const fileName = `${Math.random().toString(36).slice(2, 11)}-${Date.now()}.webp`;
  const { error } = await supabase.storage
    .from("vaultboard-images")
    .upload(fileName, compressed, { contentType: "image/webp", upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from("vaultboard-images").getPublicUrl(fileName);
  return data.publicUrl;
}

function SortableCard({ id, layoutMode, children }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 20 : "auto",
    position: "relative",
  };
  return (
    <div ref={setNodeRef} style={style} className={cn("group", layoutMode === "list" ? "w-full" : "")}>
      <button
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 z-20 opacity-0 group-hover:opacity-100 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-black/40 text-slate-400 hover:text-white cursor-grab active:cursor-grabbing transition"
        title="Presunúť"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      {children}
    </div>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(AUTH_KEY) === "true";
  });
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [sections, setSections] = useState(starterData);
  const [activeSectionId, setActiveSectionId] = useState(() => {
    if (typeof window === "undefined") return starterData[0]?.id || "prompty";
    return window.localStorage.getItem("vaultboard-active-section") || starterData[0]?.id || "prompty";
  });
  const [search, setSearch] = useState("");
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [copiedItemId, setCopiedItemId] = useState(null);
  const [manualCopyValue, setManualCopyValue] = useState("");
  const [manualCopyOpen, setManualCopyOpen] = useState(false);
  const [importExportOpen, setImportExportOpen] = useState(false);
  const [importError, setImportError] = useState("");
  const [importSuccess, setImportSuccess] = useState("");
  const [layoutMode, setLayoutMode] = useState("grid");
  const [imageUploading, setImageUploading] = useState(false);
  const [appMode, setAppMode] = useState("vault");
  const [quickButtons, setQuickButtons] = useState([]);
  const [quickDialogOpen, setQuickDialogOpen] = useState(false);
  const [editingQuickBtn, setEditingQuickBtn] = useState(null);
  const [newQuickBtn, setNewQuickBtn] = useState({ label: "", content: "", color: "purple", group: "" });
  const [activeQuickGroup, setActiveQuickGroup] = useState("all");
  const [copiedQuickId, setCopiedQuickId] = useState(null);
  const quickSaveTimeoutRef = useRef(null);
  const lastSavedQuickRef = useRef("");
  const [newSection, setNewSection] = useState({ name: "", description: "" });
  const [newItem, setNewItem] = useState(createEmptyItem());
  const [syncStatus, setSyncStatus] = useState("idle");
  const [syncMessage, setSyncMessage] = useState("");
  const [remoteReady, setRemoteReady] = useState(false);
  const manualCopyTextareaRef = useRef(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const importFileRef = useRef(null);
  const lastSavedStateRef = useRef("");
  const saveTimeoutRef = useRef(null);

  const activeSection = useMemo(
    () => sections.find((section) => section.id === activeSectionId) || sections[0] || null,
    [sections, activeSectionId]
  );

  const filteredItems = useMemo(() => {
    if (!activeSection) return [];
    const q = search.trim().toLowerCase();
    if (!q) return activeSection.items;

    return activeSection.items.filter((item) =>
      [item.title, item.description, item.content, item.link]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q))
    );
  }, [activeSection, search]);

  const totalItems = useMemo(() => sections.reduce((sum, section) => sum + section.items.length, 0), [sections]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(AUTH_KEY, isAuthenticated ? "true" : "false");
  }, [isAuthenticated]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("vaultboard-active-section", activeSectionId);
  }, [activeSectionId]);

  useEffect(() => {
    if (!sections.length) return;
    if (!sections.some((section) => section.id === activeSectionId)) {
      setActiveSectionId(sections[0].id);
    }
  }, [sections, activeSectionId]);

  useEffect(() => {
    if (!manualCopyOpen || !manualCopyTextareaRef.current) return;
    manualCopyTextareaRef.current.focus();
    manualCopyTextareaRef.current.select();
  }, [manualCopyOpen]);

  useEffect(() => {
    if (!isAuthenticated) return;
    let isCancelled = false;

    async function loadFromSupabase() {
      setSyncStatus("loading");
      setSyncMessage("");

      try {
        const remote = await fetchRemoteState();
        if (isCancelled) return;

        if (!remote) {
          await saveRemoteState(starterData);
          if (isCancelled) return;
          setSections(starterData);
          setActiveSectionId(starterData[0]?.id || "prompty");
          lastSavedStateRef.current = JSON.stringify(starterData);
          setRemoteReady(true);
          setSyncStatus("idle");
          return;
        }

        const remoteSections = isValidSectionsData(remote.sections) ? remote.sections : starterData;
        const savedActive = typeof window !== "undefined" ? window.localStorage.getItem("vaultboard-active-section") : null;
        const remoteActiveSectionId = remoteSections.some((s) => s.id === savedActive)
          ? savedActive
          : remoteSections[0]?.id || "prompty";

        setSections(remoteSections);
        setActiveSectionId(remoteActiveSectionId);
        lastSavedStateRef.current = JSON.stringify(remoteSections);

        const remoteQuick = Array.isArray(remote.quick_copy) ? remote.quick_copy : [];
        setQuickButtons(remoteQuick);
        lastSavedQuickRef.current = JSON.stringify(remoteQuick);
        setRemoteReady(true);
        setSyncStatus("idle");
      } catch (error) {
        if (isCancelled) return;
        setSyncStatus("error");
        setSyncMessage(error?.message || "Nepodarilo sa načítať dáta zo Supabase.");
      }
    }

    loadFromSupabase();
    return () => {
      isCancelled = true;
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !remoteReady) return;

    const nextSerializedState = JSON.stringify(sections);
    if (lastSavedStateRef.current === nextSerializedState) return;

    if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);

    setSyncStatus("saving");
    setSyncMessage("");

    saveTimeoutRef.current = window.setTimeout(async () => {
      try {
        await saveRemoteState(sections);
        lastSavedStateRef.current = nextSerializedState;
        setSyncStatus("idle");
      } catch (error) {
        setSyncStatus("error");
        setSyncMessage(error?.message || "Nepodarilo sa uložiť dáta do Supabase.");
      }
    }, 2500);

    return () => {
      if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);
    };
  }, [sections, isAuthenticated, remoteReady]);

  useEffect(() => {
    if (!isAuthenticated || !remoteReady) return;
    const next = JSON.stringify(quickButtons);
    if (lastSavedQuickRef.current === next) return;
    if (quickSaveTimeoutRef.current) window.clearTimeout(quickSaveTimeoutRef.current);
    quickSaveTimeoutRef.current = window.setTimeout(async () => {
      try {
        await saveQuickCopy(quickButtons);
        lastSavedQuickRef.current = next;
      } catch (_) {}
    }, 1500);
    return () => { if (quickSaveTimeoutRef.current) window.clearTimeout(quickSaveTimeoutRef.current); };
  }, [quickButtons, isAuthenticated, remoteReady]);

  function handleLogin(event) {
    event?.preventDefault?.();
    if (passwordInput === APP_PASSWORD) {
      setIsAuthenticated(true);
      setLoginError("");
      setPasswordInput("");
      return;
    }
    setLoginError("Nesprávne heslo.");
  }

  function handleLogout() {
    setIsAuthenticated(false);
    setPasswordInput("");
    setLoginError("");
    setRemoteReady(false);
    setSyncStatus("idle");
    setSyncMessage("");
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(AUTH_KEY);
    }
  }

  function handleCreateSection() {
    if (!newSection.name.trim()) return;

    const section = {
      id: createId("section"),
      name: newSection.name.trim(),
      description: newSection.description.trim(),
      icon: "sparkles",
      items: [],
    };

    setSections((prev) => [...prev, section]);
    setActiveSectionId(section.id);
    setNewSection({ name: "", description: "" });
    setSectionDialogOpen(false);
  }

  function handleDeleteSection(sectionId) {
    setSections((prev) => {
      const updated = prev.filter((s) => s.id !== sectionId);
      if (activeSectionId === sectionId && updated.length > 0) {
        setActiveSectionId(updated[0].id);
      }
      return updated;
    });
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setSections((prev) =>
      prev.map((section) => {
        if (section.id !== activeSectionId) return section;
        const oldIndex = section.items.findIndex((item) => item.id === active.id);
        const newIndex = section.items.findIndex((item) => item.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return section;
        return { ...section, items: arrayMove(section.items, oldIndex, newIndex) };
      })
    );
  }

  function handleSaveQuickBtn() {
    if (!newQuickBtn.label.trim()) return;
    if (editingQuickBtn) {
      setQuickButtons((prev) => prev.map((b) => b.id === editingQuickBtn.id ? { ...b, ...newQuickBtn, label: newQuickBtn.label.trim(), content: newQuickBtn.content } : b));
    } else {
      setQuickButtons((prev) => [...prev, { id: createId("qb"), ...newQuickBtn, label: newQuickBtn.label.trim() }]);
    }
    setQuickDialogOpen(false);
    setEditingQuickBtn(null);
    setNewQuickBtn({ label: "", content: "", color: "purple", group: "" });
  }

  function handleDeleteQuickBtn(id) {
    setQuickButtons((prev) => prev.filter((b) => b.id !== id));
  }

  function startEditQuickBtn(btn) {
    setEditingQuickBtn(btn);
    setNewQuickBtn({ label: btn.label, content: btn.content, color: btn.color, group: btn.group || "" });
    setQuickDialogOpen(true);
  }

  async function handleCopyQuickBtn(id, text) {
    const result = await copyTextToClipboard(text || "");
    if (!result.success) { setManualCopyValue(text || ""); setManualCopyOpen(true); return; }
    setCopiedQuickId(id);
    window.setTimeout(() => setCopiedQuickId((c) => (c === id ? null : c)), 1600);
  }

  function resetItemForm() {
    setEditingItem(null);
    setNewItem(createEmptyItem());
  }

  async function handleImageUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (event.target) event.target.value = "";

    setImageUploading(true);
    try {
      const url = await uploadImageToStorage(file);
      setNewItem((prev) => ({ ...prev, image: url }));
    } catch (err) {
      alert("Upload zlyhal: " + (err?.message || "Neznáma chyba"));
    } finally {
      setImageUploading(false);
    }
  }

  function handleSaveItem() {
    if (!activeSection || !newItem.title.trim()) return;

    if (editingItem) {
      setSections((prev) =>
        prev.map((section) =>
          section.id === activeSection.id
            ? {
                ...section,
                items: section.items.map((item) =>
                  item.id === editingItem.id
                    ? {
                        ...item,
                        ...newItem,
                        title: newItem.title.trim(),
                        description: newItem.description.trim(),
                        content: newItem.content.trim(),
                        link: newItem.link.trim(),
                      }
                    : item
                ),
              }
            : section
        )
      );
    } else {
      const item = {
        id: createId("item"),
        title: newItem.title.trim(),
        description: newItem.description.trim(),
        content: newItem.content.trim(),
        link: newItem.link.trim(),
        image: newItem.image,
        imagePositionX: newItem.imagePositionX,
        imagePositionY: newItem.imagePositionY,
      };

      setSections((prev) =>
        prev.map((section) =>
          section.id === activeSection.id ? { ...section, items: [item, ...section.items] } : section
        )
      );
    }

    resetItemForm();
    setItemDialogOpen(false);
  }

  function handleDeleteItem(itemId) {
    if (!activeSection) return;
    setSections((prev) =>
      prev.map((section) =>
        section.id === activeSection.id
          ? { ...section, items: section.items.filter((item) => item.id !== itemId) }
          : section
      )
    );
  }

  function startEdit(item) {
    setEditingItem(item);
    setNewItem({
      title: item.title || "",
      description: item.description || "",
      content: item.content || "",
      link: item.link || "",
      image: item.image || "",
      imagePositionX: typeof item.imagePositionX === "number" ? item.imagePositionX : 50,
      imagePositionY: typeof item.imagePositionY === "number" ? item.imagePositionY : 50,
    });
    setItemDialogOpen(true);
  }

  async function handleCopyPrompt(itemId, text) {
    const result = await copyTextToClipboard(text || "");

    if (!result.success) {
      setCopiedItemId(null);
      setManualCopyValue(String(text || ""));
      setManualCopyOpen(true);
      return;
    }

    setManualCopyOpen(false);
    setCopiedItemId(itemId);
    window.setTimeout(() => {
      setCopiedItemId((current) => (current === itemId ? null : current));
    }, 1600);
  }

  function handleExportData() {
    if (typeof window === "undefined" || typeof document === "undefined") return;

    const payload = {
      exportedAt: new Date().toISOString(),
      app: "VaultBoard",
      version: 1,
      activeSectionId,
      sections,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    const date = new Date().toISOString().slice(0, 10);
    anchor.href = url;
    anchor.download = `vaultboard-backup-${date}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    window.URL.revokeObjectURL(url);

    setImportSuccess("Dáta boli exportované do JSON súboru.");
    setImportError("");
    setImportExportOpen(true);
  }

  function handleOpenImportPicker() {
    setImportError("");
    setImportSuccess("");
    importFileRef.current?.click();
  }

  function handleImportFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const raw = String(reader.result || "");
        const parsed = JSON.parse(raw);
        const importedSections = parsed?.sections;
        const importedActiveSectionId = parsed?.activeSectionId;

        if (!isValidSectionsData(importedSections)) {
          throw new Error("Neplatný formát zálohy.");
        }

        setSections(importedSections);
        setActiveSectionId(
          importedSections.some((section) => section.id === importedActiveSectionId)
            ? importedActiveSectionId
            : importedSections[0]?.id || "prompty"
        );
        setImportSuccess("Import prebehol úspešne.");
        setImportError("");
        setImportExportOpen(true);
      } catch {
        setImportError("Tento súbor sa nepodarilo importovať. Skontroluj, či ide o VaultBoard JSON zálohu.");
        setImportSuccess("");
        setImportExportOpen(true);
      } finally {
        if (event.target) event.target.value = "";
      }
    };

    reader.readAsText(file);
  }

  function handleResetAllData() {
    setSections(starterData);
    setActiveSectionId(starterData[0]?.id || "prompty");
    setSearch("");
    resetItemForm();
  }

  const ActiveIcon = getIcon(activeSection?.icon);

  if (!isAuthenticated) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.22),transparent_22%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.12),transparent_20%),linear-gradient(to_bottom,rgba(255,255,255,0.02),transparent)]" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="relative w-full max-w-md rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl"
        >
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
              <LayoutGrid className="h-7 w-7" />
            </div>
            <div>
              <div className="text-2xl font-semibold tracking-tight">VaultBoard</div>
              <div className="text-sm text-slate-400">Súkromný vstup do tvojej databázy</div>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm text-slate-300">Vstupné heslo</label>
              <AppInput
                type="password"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  if (loginError) setLoginError("");
                }}
                placeholder="Zadaj heslo"
                className="h-12"
              />
            </div>

            {loginError ? (
              <div className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
                {loginError}
              </div>
            ) : null}

            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-slate-400">
              Po prihlásení sa aplikácia automaticky napojí na Supabase a načíta tvoju databázu z cloudu.
            </div>

            <AppButton type="submit" className="h-12 w-full rounded-2xl">
              Vstúpiť do aplikácie
            </AppButton>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.16),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.14),transparent_25%)]" />

      <Modal open={manualCopyOpen} onClose={() => setManualCopyOpen(false)} title="Skopíruj prompt manuálne" maxWidth="max-w-xl">
        <div className="space-y-4">
          <p className="text-sm text-slate-300">Automatické kopírovanie zlyhalo. Označ text a skopíruj ho ručne.</p>
          <AppTextarea ref={manualCopyTextareaRef} value={manualCopyValue} readOnly rows={8} />
        </div>
      </Modal>

      <Modal open={importExportOpen} onClose={() => setImportExportOpen(false)} title="Export / Import dát" maxWidth="max-w-xl">
        <div className="space-y-4 pt-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
            Tu si vieš stiahnuť zálohu celej databázy do JSON a neskôr ju znova nahrať.
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <AppButton onClick={handleExportData} className="w-full rounded-2xl">
              <Download className="h-4 w-4" />
              Export JSON
            </AppButton>
            <AppButton variant="outline" onClick={handleOpenImportPicker} className="w-full rounded-2xl">
              <Upload className="h-4 w-4" />
              Import JSON
            </AppButton>
          </div>

          <input ref={importFileRef} type="file" accept="application/json" onChange={handleImportFile} className="hidden" />

          {importSuccess ? <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">{importSuccess}</div> : null}
          {importError ? <div className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">{importError}</div> : null}
        </div>
      </Modal>

      <Modal open={quickDialogOpen} onClose={() => { setQuickDialogOpen(false); setEditingQuickBtn(null); setNewQuickBtn({ label: "", content: "", color: "purple", group: "" }); }} title={editingQuickBtn ? "Upraviť tlačidlo" : "Nové QuickCopy tlačidlo"} maxWidth="max-w-lg">
        <div className="space-y-4">
          <AppInput placeholder="Názov tlačidla (napr. Zalomenie)" value={newQuickBtn.label} onChange={(e) => setNewQuickBtn((p) => ({ ...p, label: e.target.value }))} />
          <AppTextarea placeholder="Obsah — text, kód, prompt..." rows={5} value={newQuickBtn.content} onChange={(e) => setNewQuickBtn((p) => ({ ...p, content: e.target.value }))} />
          <AppInput placeholder="Skupina (napr. Elementor, AI Prompty)" value={newQuickBtn.group} onChange={(e) => setNewQuickBtn((p) => ({ ...p, group: e.target.value }))} />
          <div>
            <div className="mb-2 text-sm text-slate-300">Farba</div>
            <div className="flex flex-wrap gap-2">
              {QUICK_COLORS.map((c) => (
                <button key={c.id} type="button" onClick={() => setNewQuickBtn((p) => ({ ...p, color: c.id }))}
                  className={cn("h-8 w-8 rounded-xl transition", newQuickBtn.color === c.id ? "ring-2 ring-white ring-offset-2 ring-offset-slate-950" : "")}
                  style={{ backgroundColor: c.bg }} />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <AppButton variant="ghost" onClick={() => { setQuickDialogOpen(false); setEditingQuickBtn(null); setNewQuickBtn({ label: "", content: "", color: "purple", group: "" }); }}>Zrušiť</AppButton>
            <AppButton onClick={handleSaveQuickBtn}>{editingQuickBtn ? "Uložiť" : "Vytvoriť"}</AppButton>
          </div>
        </div>
      </Modal>

      <Modal open={sectionDialogOpen} onClose={() => setSectionDialogOpen(false)} title="Vytvoriť novú sekciu" maxWidth="max-w-lg">
        <div className="space-y-4">
          <AppInput placeholder="Názov sekcie" value={newSection.name} onChange={(e) => setNewSection((prev) => ({ ...prev, name: e.target.value }))} />
          <AppTextarea placeholder="Krátky popis sekcie" rows={4} value={newSection.description} onChange={(e) => setNewSection((prev) => ({ ...prev, description: e.target.value }))} />
          <div className="flex justify-end gap-3">
            <AppButton variant="ghost" onClick={() => setSectionDialogOpen(false)}>Zrušiť</AppButton>
            <AppButton onClick={handleCreateSection}>Vytvoriť</AppButton>
          </div>
        </div>
      </Modal>

      <Modal open={itemDialogOpen} onClose={() => { setItemDialogOpen(false); resetItemForm(); }} title={editingItem ? "Upraviť položku" : "Pridať položku"} maxWidth="max-w-3xl">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-4 md:col-span-2">
            <AppInput placeholder="Názov" value={newItem.title} onChange={(e) => setNewItem((prev) => ({ ...prev, title: e.target.value }))} />
            <AppInput placeholder="Krátky popis" value={newItem.description} onChange={(e) => setNewItem((prev) => ({ ...prev, description: e.target.value }))} />
            <AppTextarea placeholder="Obsah / prompt" rows={8} value={newItem.content} onChange={(e) => setNewItem((prev) => ({ ...prev, content: e.target.value }))} />
            <AppInput placeholder="Link" value={newItem.link} onChange={(e) => setNewItem((prev) => ({ ...prev, link: e.target.value }))} />
          </div>

          <div className="space-y-4 md:col-span-2">
            <label className={cn("flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 bg-white/5 px-4 py-6 text-sm text-slate-300 transition hover:bg-white/10", imageUploading && "opacity-60 pointer-events-none")}>
              {imageUploading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
              {imageUploading ? "Nahrávam a komprimujem..." : "Nahrať obrázok (auto-kompresia)"}
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={imageUploading} />
            </label>

            {newItem.image ? (
              <div className="space-y-4 rounded-[24px] border border-white/10 bg-white/5 p-4">
                <div className="overflow-hidden rounded-[20px] border border-white/10 bg-slate-900">
                  <div className="h-56 w-full overflow-hidden">
                    <img
                      src={newItem.image}
                      alt="Preview"
                      className="h-full w-full object-cover"
                      style={{ objectPosition: `${newItem.imagePositionX}% ${newItem.imagePositionY}%` }}
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <div className="mb-2 text-sm text-slate-300">Horizontálne zarovnanie</div>
                    <input type="range" min="0" max="100" value={newItem.imagePositionX} onChange={(e) => setNewItem((prev) => ({ ...prev, imagePositionX: Number(e.target.value) }))} className="w-full" />
                  </div>
                  <div>
                    <div className="mb-2 text-sm text-slate-300">Vertikálne zarovnanie</div>
                    <input type="range" min="0" max="100" value={newItem.imagePositionY} onChange={(e) => setNewItem((prev) => ({ ...prev, imagePositionY: Number(e.target.value) }))} className="w-full" />
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <AppButton variant="ghost" onClick={() => { setItemDialogOpen(false); resetItemForm(); }}>Zrušiť</AppButton>
          <AppButton onClick={handleSaveItem}>{editingItem ? "Uložiť zmeny" : "Pridať položku"}</AppButton>
        </div>
      </Modal>

      <div className="relative mx-auto flex min-h-screen max-w-[1600px] gap-0">
        <aside className="w-full max-w-[290px] border-r border-white/10 bg-slate-950/70 p-5 backdrop-blur-xl">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
              <LayoutGrid className="h-7 w-7" />
            </div>
            <div>
              <div className="text-2xl font-semibold tracking-tight">VaultBoard</div>
              <div className="text-sm text-slate-400">Moderný organizér nápadov</div>
            </div>
          </div>

          <div className="mb-5 flex rounded-2xl border border-white/10 bg-white/5 p-1">
            <button type="button" onClick={() => setAppMode("vault")} className={cn("flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition", appMode === "vault" ? "bg-white text-slate-950" : "text-slate-400 hover:text-white")}>
              <LayoutGrid className="h-4 w-4" /> Vault
            </button>
            <button type="button" onClick={() => setAppMode("quickcopy")} className={cn("flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition", appMode === "quickcopy" ? "bg-white text-slate-950" : "text-slate-400 hover:text-white")}>
              <Zap className="h-4 w-4" /> QuickCopy
            </button>
          </div>

          <Card className="mb-5 p-5">
            <div className="text-sm text-slate-400">Spolu položiek</div>
            <div className="mt-2 text-5xl font-semibold tracking-tight">{totalItems}</div>
            <div className="mt-3 text-xs text-slate-400">Dáta sa ukladajú iba do Supabase cloudu. Táto verzia už nepoužíva localStorage pre obsah databázy.</div>
          </Card>

          <div className="mb-4 flex items-center justify-between">
            <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Sekcie</div>
            <AppButton variant="outline" className="h-10 rounded-2xl px-3" onClick={() => setSectionDialogOpen(true)}>
              <FolderPlus className="h-4 w-4" />
              Nová
            </AppButton>
          </div>

          <div className="space-y-3">
            {sections.map((section) => {
              const SectionIcon = getIcon(section.icon);
              const isActive = section.id === activeSectionId;
              return (
                <div key={section.id} className="group relative">
                  <button
                    type="button"
                    onClick={() => setActiveSectionId(section.id)}
                    className={cn(
                      "w-full rounded-[24px] border px-4 py-4 text-left transition pr-12",
                      isActive ? "border-white/20 bg-white text-slate-950" : "border-white/10 bg-white/5 text-white hover:bg-white/10"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("flex h-11 w-11 items-center justify-center rounded-2xl", isActive ? "bg-slate-100 text-slate-900" : "bg-white/10 text-white")}>
                        <SectionIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-medium">{section.name}</div>
                        <div className={cn("text-sm", isActive ? "text-slate-600" : "text-slate-400")}>{section.items.length} položiek</div>
                      </div>
                    </div>
                  </button>
                  {sections.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleDeleteSection(section.id); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 inline-flex h-8 w-8 items-center justify-center rounded-xl border border-red-400/20 bg-red-400/10 text-red-300 hover:bg-red-400/20 transition"
                      title="Odstrániť sekciu"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        <main className="flex-1 p-6 md:p-8">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          {appMode === "quickcopy" ? (() => {
            const uniqueGroups = [...new Set(quickButtons.map((b) => b.group).filter(Boolean))];
            const filtered = activeQuickGroup === "all" ? quickButtons : quickButtons.filter((b) => b.group === activeQuickGroup);
            return (
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/10 ring-1 ring-white/15">
                      <Zap className="h-8 w-8" />
                    </div>
                    <div>
                      <h1 className="text-4xl font-semibold tracking-tight">QuickCopy</h1>
                      <p className="mt-1 text-slate-400">Klikni na tlačidlo → obsah je v schránke</p>
                    </div>
                  </div>
                  <AppButton onClick={() => { setEditingQuickBtn(null); setNewQuickBtn({ label: "", content: "", color: "purple", group: "" }); setQuickDialogOpen(true); }} className="h-12 rounded-2xl">
                    <Plus className="h-4 w-4" /> Nové tlačidlo
                  </AppButton>
                </div>
                {uniqueGroups.length > 0 && (
                  <div className="mb-6 flex flex-wrap gap-2">
                    <button type="button" onClick={() => setActiveQuickGroup("all")} className={cn("rounded-full border px-4 py-1.5 text-sm transition", activeQuickGroup === "all" ? "border-white/30 bg-white/10 text-white" : "border-white/10 text-slate-400 hover:text-white")}>Všetky ({quickButtons.length})</button>
                    {uniqueGroups.map((g) => (
                      <button key={g} type="button" onClick={() => setActiveQuickGroup(g)} className={cn("rounded-full border px-4 py-1.5 text-sm transition", activeQuickGroup === g ? "border-white/30 bg-white/10 text-white" : "border-white/10 text-slate-400 hover:text-white")}>{g} ({quickButtons.filter((b) => b.group === g).length})</button>
                    ))}
                  </div>
                )}
                {filtered.length === 0 ? (
                  <Card className="p-10 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white/10"><Zap className="h-8 w-8 text-slate-400" /></div>
                    <div className="mt-5 text-xl font-medium">Žiadne tlačidlá</div>
                    <div className="mt-2 text-sm text-slate-400">Vytvor prvé QuickCopy tlačidlo.</div>
                  </Card>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                    {filtered.map((btn) => {
                      const colorObj = QUICK_COLORS.find((c) => c.id === btn.color) || QUICK_COLORS[0];
                      const isCopied = copiedQuickId === btn.id;
                      return (
                        <motion.div key={btn.id} whileHover={{ y: -3, scale: 1.02 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="group relative">
                          <button type="button" onClick={() => handleCopyQuickBtn(btn.id, btn.content)}
                            className="w-full rounded-[24px] p-5 text-left transition"
                            style={{ backgroundColor: colorObj.bg, color: colorObj.text }}>
                            <div className="mb-3 flex items-center justify-between">
                              <span className="text-lg font-semibold">{btn.label}</span>
                              {isCopied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5 opacity-60" />}
                            </div>
                            <div className="text-sm opacity-60 line-clamp-2 break-all">{btn.content || "—"}</div>
                            {btn.group ? <div className="mt-3 inline-block rounded-full bg-black/20 px-2.5 py-0.5 text-xs">{btn.group}</div> : null}
                          </button>
                          <div className="absolute right-2 top-2 hidden gap-1 group-hover:flex">
                            <button type="button" onClick={(e) => { e.stopPropagation(); startEditQuickBtn(btn); }} className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-black/30 text-white hover:bg-black/50"><Pencil className="h-3.5 w-3.5" /></button>
                            <button type="button" onClick={(e) => { e.stopPropagation(); handleDeleteQuickBtn(btn.id); }} className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-black/30 text-white hover:bg-red-500/60"><Trash2 className="h-3.5 w-3.5" /></button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })() : (
            <>
            <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex min-w-0 flex-1 items-center gap-4 rounded-[32px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/10 ring-1 ring-white/15">
                  {activeSection ? <ActiveIcon className="h-8 w-8" /> : <Sparkles className="h-8 w-8" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="truncate text-4xl font-semibold tracking-tight">{activeSection?.name || "Sekcia"}</h1>
                    <Badge>{filteredItems.length} položiek</Badge>
                    <SyncStatusBadge status={syncStatus} message={syncMessage} />
                  </div>
                  <p className="mt-3 max-w-2xl text-lg text-slate-400">{activeSection?.description || ""}</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:flex">
                <div className="relative min-w-[280px] xl:min-w-[340px]">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <AppInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Hľadať v sekcii" className="h-12 pl-11" />
                </div>

                <AppButton onClick={() => setItemDialogOpen(true)} className="h-12 rounded-2xl">
                  <Plus className="h-4 w-4" />
                  Pridať položku
                </AppButton>

                <AppButton
                  variant="outline"
                  onClick={() => setLayoutMode((m) => m === "grid" ? "list" : "grid")}
                  className="h-12 rounded-2xl"
                  title={layoutMode === "grid" ? "Prepnúť na riadky" : "Prepnúť na mriežku"}
                >
                  {layoutMode === "grid" ? <LayoutList className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
                </AppButton>

                <AppButton
                  variant="outline"
                  onClick={() => {
                    setImportSuccess("");
                    setImportError("");
                    setImportExportOpen(true);
                  }}
                  className="h-12 rounded-2xl"
                >
                  <Database className="h-4 w-4" />
                  Záloha dát
                </AppButton>

                <AppButton variant="ghost" onClick={handleResetAllData} className="h-12 rounded-2xl">
                  Reset
                </AppButton>

                <AppButton variant="ghost" onClick={handleLogout} className="h-12 rounded-2xl">
                  Odhlásiť
                </AppButton>
              </div>
            </div>

            {filteredItems.length === 0 ? (
              <Card className="p-10 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white/10">
                  <ImageIcon className="h-8 w-8 text-slate-400" />
                </div>
                <div className="mt-5 text-xl font-medium">Zatiaľ tu nič nie je</div>
                <div className="mt-2 text-sm text-slate-400">Pridaj prvú položku a tá sa uloží rovno do Supabase cloudu.</div>
              </Card>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={filteredItems.map((i) => i.id)} strategy={layoutMode === "grid" ? rectSortingStrategy : verticalListSortingStrategy}>
                <div className={layoutMode === "grid" ? "grid gap-6 md:grid-cols-2 xl:grid-cols-3" : "flex flex-col gap-4"}>
                {filteredItems.map((item) => (
                  <SortableCard key={item.id} id={item.id} layoutMode={layoutMode}>
                  <motion.div
                    whileHover={{ y: -4, scale: 1.015 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Card className={layoutMode === "grid" ? "overflow-hidden flex flex-col h-[420px]" : "overflow-hidden flex flex-row h-[120px]"}>
                      {layoutMode === "grid" ? (
                        <>
                          {item.image ? (
                            <div className="h-36 w-full overflow-hidden bg-slate-900 flex-shrink-0">
                              <img
                                src={item.image}
                                alt={item.title}
                                className="h-full w-full object-cover"
                                style={{ objectPosition: `${item.imagePositionX}% ${item.imagePositionY}%` }}
                              />
                            </div>
                          ) : (
                            <div className="flex h-36 items-center justify-center bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0))] flex-shrink-0">
                              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-white/10">
                                <ImageIcon className="h-7 w-7 text-slate-400" />
                              </div>
                            </div>
                          )}
                          <div className="flex flex-col flex-1 overflow-hidden">
                            <CardHeader className="pb-2">
                              <div className="flex items-start justify-between gap-3">
                                <CardTitle className="text-xl line-clamp-1">{item.title}</CardTitle>
                                <div className="flex gap-2 flex-shrink-0">
                                  <button type="button" onClick={() => startEdit(item)} className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 hover:bg-white/10">
                                    <Pencil className="h-4 w-4" />
                                  </button>
                                  <button type="button" onClick={() => handleDeleteItem(item.id)} className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 hover:bg-white/10">
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                              {item.description ? <p className="mt-1 text-sm text-slate-400 line-clamp-1">{item.description}</p> : null}
                            </CardHeader>
                            <CardContent className="pt-0 flex-1 overflow-hidden flex flex-col gap-3">
                              <div className="rounded-[18px] border border-white/10 bg-black/20 p-3 text-sm text-slate-300 line-clamp-3 overflow-hidden">
                                {item.content || "Bez obsahu"}
                              </div>
                              <div className="flex flex-wrap gap-2 mt-auto">
                                <AppButton variant="outline" onClick={() => handleCopyPrompt(item.id, item.content)}>
                                  {copiedItemId === item.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                </AppButton>
                                {item.link ? (
                                  <a href={normalizeUrl(item.link)} target="_blank" rel="noreferrer">
                                    <AppButton variant="ghost">
                                      <ExternalLink className="h-4 w-4" />
                                      Link
                                    </AppButton>
                                  </a>
                                ) : null}
                              </div>
                            </CardContent>
                          </div>
                        </>
                      ) : (
                        <>
                          {item.image ? (
                            <div className="w-24 h-full overflow-hidden bg-slate-900 flex-shrink-0">
                              <img
                                src={item.image}
                                alt={item.title}
                                className="h-full w-full object-cover"
                                style={{ objectPosition: `${item.imagePositionX}% ${item.imagePositionY}%` }}
                              />
                            </div>
                          ) : (
                            <div className="flex w-24 h-full items-center justify-center bg-white/5 flex-shrink-0">
                              <ImageIcon className="h-6 w-6 text-slate-500" />
                            </div>
                          )}
                          <div className="flex flex-1 items-center gap-4 px-4 overflow-hidden">
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-base line-clamp-1">{item.title}</div>
                              <div className="text-sm text-slate-400 line-clamp-1 mt-0.5">{item.description || item.content || "Bez obsahu"}</div>
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                              <AppButton variant="outline" onClick={() => handleCopyPrompt(item.id, item.content)}>
                                {copiedItemId === item.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                              </AppButton>
                              {item.link ? (
                                <a href={normalizeUrl(item.link)} target="_blank" rel="noreferrer">
                                  <AppButton variant="ghost">
                                    <ExternalLink className="h-4 w-4" />
                                    Link
                                  </AppButton>
                                </a>
                              ) : null}
                              <button type="button" onClick={() => startEdit(item)} className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 hover:bg-white/10">
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button type="button" onClick={() => handleDeleteItem(item.id)} className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 hover:bg-white/10">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </Card>
                  </motion.div>
                  </SortableCard>
                ))}
              </div>
              </SortableContext>
              </DndContext>
            )}
            </>
          )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
