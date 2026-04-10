import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
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
  Move,
  ExternalLink,
  AlertCircle,
  X,
} from "lucide-react";

const STORAGE_KEY = "vaultboard-app-data";
const ACTIVE_SECTION_KEY = "vaultboard-active-section";
const AUTH_KEY = "vaultboard-authenticated";
const APP_PASSWORD = "07092024tw";

const starterData = [
  {
    id: "prompty",
    name: "Prompty",
    icon: "sparkles",
    description: "Miesto pre promptové nápady, inšpirácie a vizuálne referencie.",
    items: [
      {
        id: "p1",
        title: "Editorial fashion prompt",
        description: "Silný vizuálny prompt pre moderný fashion editoriál s dramatickým svetlom.",
        content:
          "A vibrant high-fashion editorial portrait with bold studio lighting, luxury magazine aesthetic, dramatic composition, ultra-detailed skin texture, premium studio photography.",
        link: "https://example.com/editorial-prompt",
        image:
          "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80",
        imagePositionX: 50,
        imagePositionY: 50,
      },
    ],
  },
  {
    id: "biznis",
    name: "Biznis",
    icon: "briefcase",
    description: "Nápady, články, zdroje a podklady pre biznis a projekty.",
    items: [
      {
        id: "b1",
        title: "Landing page inšpirácia",
        description: "Príklad modernej landing page s čistým UX a výrazným CTA.",
        content:
          "Pozrieť layout hero sekcie, grid benefitov, social proof a sekciu FAQ. Vhodné ako inšpirácia pre firemný web.",
        link: "https://example.com/business-inspiration",
        image:
          "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
        imagePositionX: 50,
        imagePositionY: 50,
      },
    ],
  },
];

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function AppButton({ className = "", variant = "default", type = "button", children, ...props }) {
  const variants = {
    default: "bg-white text-slate-950 hover:bg-slate-200",
    outline: "border border-white/10 bg-white/5 text-white hover:bg-white/10",
    ghost: "bg-transparent text-white hover:bg-white/10",
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
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium text-slate-200",
        className
      )}
    >
      {children}
    </span>
  );
}

function Modal({ open, onClose, title, children, maxWidth = "max-w-2xl" }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className={cn("relative max-h-[92vh] w-full overflow-y-auto rounded-[28px] border border-white/10 bg-slate-950 p-6 text-white shadow-2xl", maxWidth)}
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

function ScrollArea({ className = "", children }) {
  return <div className={cn("overflow-y-auto", className)}>{children}</div>;
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

function createId(prefix = "id") {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
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
      return typeof item.id === "string";
    });
  });
}

function loadSections() {
  if (typeof window === "undefined") return starterData;

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return starterData;
    const parsed = JSON.parse(saved);
    return isValidSectionsData(parsed) ? parsed : starterData;
  } catch {
    return starterData;
  }
}

function loadActiveSectionId(fallbackSections) {
  if (typeof window === "undefined") return fallbackSections[0]?.id || "prompty";
  return window.localStorage.getItem(ACTIVE_SECTION_KEY) || fallbackSections[0]?.id || "prompty";
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

function fallbackCopyWithTextarea(text) {
  if (typeof document === "undefined") return false;

  const textarea = document.createElement("textarea");
  textarea.value = String(text || "");
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "0";
  textarea.style.left = "0";
  textarea.style.opacity = "0";
  textarea.style.pointerEvents = "none";

  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);

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

  if (fallbackSuccess) {
    return { success: true, method: "execCommand" };
  }

  return { success: false, method: "manual" };
}

export default function PromptOrganizerApp() {
  const initialSections = loadSections();

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(AUTH_KEY) === "true";
  });
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [sections, setSections] = useState(initialSections);
  const [activeSectionId, setActiveSectionId] = useState(() => loadActiveSectionId(initialSections));
  const [search, setSearch] = useState("");
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [copiedItemId, setCopiedItemId] = useState(null);
  const [manualCopyValue, setManualCopyValue] = useState("");
  const [manualCopyOpen, setManualCopyOpen] = useState(false);
  const [newSection, setNewSection] = useState({ name: "", description: "" });
  const [newItem, setNewItem] = useState(createEmptyItem);
  const manualCopyTextareaRef = useRef(null);

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
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sections));
  }, [sections]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(AUTH_KEY, isAuthenticated ? "true" : "false");
  }, [isAuthenticated]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (activeSectionId) {
      window.localStorage.setItem(ACTIVE_SECTION_KEY, activeSectionId);
    }
  }, [activeSectionId]);

  useEffect(() => {
    if (!sections.length) return;
    const sectionExists = sections.some((section) => section.id === activeSectionId);
    if (!sectionExists) {
      setActiveSectionId(sections[0].id);
    }
  }, [sections, activeSectionId]);

  useEffect(() => {
    if (!manualCopyOpen || !manualCopyTextareaRef.current) return;
    manualCopyTextareaRef.current.focus();
    manualCopyTextareaRef.current.select();
  }, [manualCopyOpen]);

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

  function resetItemForm() {
    setNewItem(createEmptyItem());
    setEditingItem(null);
  }

  function handleImageUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setNewItem((prev) => ({ ...prev, image: String(reader.result) }));
    };
    reader.readAsDataURL(file);
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

  function handleResetAllData() {
    setSections(starterData);
    setActiveSectionId(starterData[0]?.id || "prompty");
    setSearch("");
    resetItemForm();

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem(ACTIVE_SECTION_KEY);
    }
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
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.18),transparent_22%),radial-gradient(circle_at_top_left,rgba(16,185,129,0.10),transparent_20%),linear-gradient(to_bottom,rgba(255,255,255,0.02),transparent)]" />

      <Modal open={manualCopyOpen} onClose={() => setManualCopyOpen(false)} title="Skopíruj prompt manuálne" maxWidth="max-w-xl">
        <div className="space-y-4 pt-2">
          <div className="flex items-start gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Toto preview blokuje automatické kopírovanie. Text je označený nižšie — stačí ho skopírovať ručne cez <strong>Ctrl+C</strong>.
            </p>
          </div>

          <AppTextarea ref={manualCopyTextareaRef} value={manualCopyValue} readOnly className="min-h-[220px]" />

          <div className="flex justify-end gap-3">
            <AppButton variant="outline" onClick={() => setManualCopyOpen(false)}>
              Zavrieť
            </AppButton>
          </div>
        </div>
      </Modal>

      <Modal open={sectionDialogOpen} onClose={() => setSectionDialogOpen(false)} title="Vytvoriť novú sekciu" maxWidth="max-w-lg">
        <div className="space-y-4 pt-2">
          <div>
            <label className="mb-2 block text-sm text-slate-300">Názov sekcie</label>
            <AppInput
              value={newSection.name}
              onChange={(e) => setNewSection((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Napr. Biznis, Inšpirácie, Weby..."
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-slate-300">Krátky popis</label>
            <AppTextarea
              value={newSection.description}
              onChange={(e) => setNewSection((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="O čom bude táto sekcia?"
              className="min-h-[110px]"
            />
          </div>
          <AppButton onClick={handleCreateSection} className="w-full rounded-xl">
            Vytvoriť sekciu
          </AppButton>
        </div>
      </Modal>

      <Modal
        open={itemDialogOpen}
        onClose={() => {
          setItemDialogOpen(false);
          resetItemForm();
        }}
        title={editingItem ? "Upraviť položku" : "Pridať novú položku"}
        maxWidth="max-w-2xl"
      >
        <div className="grid gap-4 pt-2">
          <div>
            <label className="mb-2 block text-sm text-slate-300">Názov</label>
            <AppInput
              value={newItem.title}
              onChange={(e) => setNewItem((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Napr. Prompt pre banner, článok, biznis nápad..."
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">Krátky popis</label>
            <AppTextarea
              value={newItem.description}
              onChange={(e) => setNewItem((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Stručné vysvetlenie, na čo sa položka hodí"
              className="min-h-[90px]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">Obsah / prompt / poznámka</label>
            <AppTextarea
              value={newItem.content}
              onChange={(e) => setNewItem((prev) => ({ ...prev, content: e.target.value }))}
              placeholder="Sem vlož prompt, text, poznámku alebo dôležitý obsah"
              className="min-h-[160px]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">Link</label>
            <AppInput
              value={newItem.link}
              onChange={(e) => setNewItem((prev) => ({ ...prev, link: e.target.value }))}
              placeholder="https://..."
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-slate-300">Obrázok cez URL</label>
              <AppInput
                value={newItem.image.startsWith("data:") ? "" : newItem.image}
                onChange={(e) => setNewItem((prev) => ({ ...prev, image: e.target.value }))}
                placeholder="https://obrazok.jpg"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-300">Alebo nahraj obrázok</label>
              <AppInput
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="file:mr-3 file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-1.5 file:text-slate-950"
              />
            </div>
          </div>

          {newItem.image ? (
            <div className="space-y-3">
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                <div className="relative h-52 w-full overflow-hidden bg-slate-900">
                  <img
                    src={newItem.image}
                    alt="Preview"
                    className="h-full w-full object-cover"
                    style={{ objectPosition: `${newItem.imagePositionX}% ${newItem.imagePositionY}%` }}
                  />
                  <div className="pointer-events-none absolute inset-0 border border-dashed border-white/30" />
                  <div className="pointer-events-none absolute inset-1 rounded-[14px] border border-dashed border-white/20" />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="mb-2 flex items-center gap-2 text-sm text-slate-300">
                    <Move className="h-4 w-4" />
                    Horizontálne zarovnanie
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={newItem.imagePositionX}
                    onChange={(e) => setNewItem((prev) => ({ ...prev, imagePositionX: Number(e.target.value) }))}
                    className="w-full"
                  />
                  <div className="mt-1 text-xs text-slate-500">{newItem.imagePositionX}%</div>
                </div>

                <div>
                  <div className="mb-2 flex items-center gap-2 text-sm text-slate-300">
                    <Move className="h-4 w-4" />
                    Vertikálne zarovnanie
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={newItem.imagePositionY}
                    onChange={(e) => setNewItem((prev) => ({ ...prev, imagePositionY: Number(e.target.value) }))}
                    className="w-full"
                  />
                  <div className="mt-1 text-xs text-slate-500">{newItem.imagePositionY}%</div>
                </div>
              </div>
            </div>
          ) : null}

          <AppButton onClick={handleSaveItem} className="mt-2 w-full rounded-2xl">
            {editingItem ? "Uložiť zmeny" : "Pridať položku"}
          </AppButton>
        </div>
      </Modal>

      <div className="relative grid min-h-screen lg:grid-cols-[290px_1fr]">
        <aside className="border-r border-white/10 bg-white/5 backdrop-blur-xl">
          <div className="p-5">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
                <LayoutGrid className="h-6 w-6" />
              </div>
              <div>
                <div className="text-lg font-semibold tracking-tight">VaultBoard</div>
                <div className="text-sm text-slate-400">Moderný organizér nápadov</div>
              </div>
            </div>

            <Card className="text-white shadow-2xl shadow-black/20">
              <CardContent className="p-4">
                <div className="text-sm text-slate-400">Spolu položiek</div>
                <div className="mt-1 text-3xl font-semibold">{totalItems}</div>
                <div className="mt-3 text-xs text-slate-400">Ukladaj prompty, linky, obrázky a vlastné sekcie na jednom mieste.</div>
              </CardContent>
            </Card>

            <div className="mt-6 flex items-center justify-between">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Sekcie</div>
              <AppButton onClick={() => setSectionDialogOpen(true)} className="rounded-xl px-3 py-2 text-sm">
                <FolderPlus className="h-4 w-4" />
                Nová
              </AppButton>
            </div>

            <ScrollArea className="mt-4 h-[calc(100vh-280px)] pr-1">
              <div className="space-y-2">
                {sections.map((section) => {
                  const Icon = getIcon(section.icon);
                  const active = section.id === activeSectionId;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSectionId(section.id)}
                      className={cn(
                        "w-full rounded-2xl border p-3 text-left transition",
                        active
                          ? "border-white/20 bg-white text-slate-950 shadow-xl"
                          : "border-white/10 bg-white/5 text-white hover:bg-white/10"
                      )}
                      type="button"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={cn("rounded-xl p-2", active ? "bg-slate-100" : "bg-white/10")}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-medium">{section.name}</div>
                            <div className={cn("text-xs", active ? "text-slate-600" : "text-slate-400")}>
                              {section.items.length} položiek
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </aside>

        <main className="p-4 md:p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mx-auto max-w-7xl"
          >
            <div className="mb-6 flex flex-col gap-4 rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/10">
                  <ActiveIcon className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{activeSection?.name}</h1>
                    <Badge>{activeSection?.items.length || 0} položiek</Badge>
                  </div>
                  <p className="mt-2 max-w-2xl text-sm text-slate-400 md:text-base">
                    {activeSection?.description || "Vybuduj si vlastnú knižnicu promptov, odkazov, obrázkov a poznámok v elegantnom rozhraní."}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative min-w-[240px]">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <AppInput
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Hľadať v sekcii..."
                    className="h-11 pl-10"
                  />
                </div>

                <AppButton onClick={() => setItemDialogOpen(true)} className="h-11 rounded-2xl">
                  <Plus className="h-4 w-4" />
                  Pridať položku
                </AppButton>

                <AppButton variant="outline" onClick={handleResetAllData} className="h-11 rounded-2xl">
                  Reset dát
                </AppButton>

                <AppButton variant="outline" onClick={handleLogout} className="h-11 rounded-2xl">
                  Odhlásiť
                </AppButton>
              </div>
            </div>

            {filteredItems.length === 0 ? (
              <Card className="text-white backdrop-blur-xl">
                <CardContent className="flex min-h-[320px] flex-col items-center justify-center p-10 text-center">
                  <div className="rounded-2xl bg-white/10 p-4">
                    <ImageIcon className="h-8 w-8 text-slate-300" />
                  </div>
                  <h2 className="mt-5 text-2xl font-semibold">Zatiaľ tu nič nie je</h2>
                  <p className="mt-2 max-w-md text-slate-400">Pridaj prvý prompt, link, obrázok alebo poznámku a vytvor si prehľadnú vizuálnu knižnicu.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {filteredItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: index * 0.03 }}
                  >
                    <Card className="group h-full overflow-hidden text-white backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.07]">
                      <div className="relative h-52 overflow-hidden border-b border-white/10 bg-slate-900">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                            style={{
                              objectPosition: `${typeof item.imagePositionX === "number" ? item.imagePositionX : 50}% ${typeof item.imagePositionY === "number" ? item.imagePositionY : 50}%`,
                            }}
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))]">
                            <div className="rounded-2xl bg-white/10 p-4">
                              <ImageIcon className="h-8 w-8 text-slate-400" />
                            </div>
                          </div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/70 to-transparent" />
                      </div>

                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-3">
                          <CardTitle className="line-clamp-2 text-xl tracking-tight">{item.title}</CardTitle>
                          <div className="flex items-center gap-1 opacity-70 transition group-hover:opacity-100">
                            <button
                              onClick={() => startEdit(item)}
                              className="rounded-xl border border-white/10 bg-white/5 p-2 hover:bg-white/10"
                              aria-label="Upraviť"
                              type="button"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="rounded-xl border border-white/10 bg-white/5 p-2 hover:bg-white/10"
                              aria-label="Vymazať"
                              type="button"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        {item.description ? <p className="line-clamp-2 text-sm text-slate-400">{item.description}</p> : null}
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                          <p className="line-clamp-6 whitespace-pre-wrap text-sm leading-6 text-slate-200">{item.content || "Bez obsahu"}</p>
                          <div className="mt-3 flex items-center gap-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyPrompt(item.id, item.content || "");
                              }}
                              className={cn(
                                "inline-flex h-10 w-10 items-center justify-center rounded-xl transition",
                                copiedItemId === item.id ? "bg-emerald-500 text-white" : "bg-white text-slate-950 hover:bg-slate-200"
                              )}
                              aria-label="Kopírovať prompt"
                              type="button"
                            >
                              {copiedItemId === item.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </button>
                            {copiedItemId === item.id ? <span className="text-xs text-emerald-400">Skopírované</span> : null}
                          </div>
                        </div>

                        {item.link ? (
                          <a
                            href={normalizeUrl(item.link)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex w-full items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-slate-200 transition hover:bg-white/10 cursor-pointer"
                            aria-label={`Otvoriť link ${item.link}`}
                          >
                            <LinkIcon className="h-4 w-4 shrink-0" />
                            <span className="line-clamp-1 underline">{normalizeUrl(item.link)}</span>
                            <ExternalLink className="ml-auto h-4 w-4 shrink-0 opacity-70" />
                          </a>
                        ) : null}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

export const __testables__ = {
  STORAGE_KEY,
  ACTIVE_SECTION_KEY,
  AUTH_KEY,
  APP_PASSWORD,
  starterData,
  isValidSectionsData,
  loadSections,
  loadActiveSectionId,
  createId,
  createEmptyItem,
  getIcon,
  normalizeUrl,
  fallbackCopyWithTextarea,
  copyTextToClipboard,
  cn,
};
