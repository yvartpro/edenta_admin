import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Hand, Trash2, X, Plus } from "lucide-react"; // Replaced HandGrab with Hand
import { Card, Header, Input, Textarea, Select, IconBtn, BlockBar } from "../../components/MyUtilities";
import {
    DndContext,
    closestCenter
} from "@dnd-kit/core";
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
    arrayMove
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import {
    createArticle,
    updateArticle,
    getArticleById,
} from "../../services/articles.api";
import apiClient from "../../apiClient"; // For fetching categories

import WysiwygInput from "../../components/WysiwygInput";
import ArticlePreview from "../../components/ArticlePreview";
import MediaGrid from "../../components/MediaGrid";
import { createSlug } from "../../services/helper";

/* ================== CONSTANT ================== */
const EMPTY_ARTICLE = {
    title: "",
    subtitle: null,
    summary: null,
    categoryId: null,
    slug: "",
    hero_url: null, // UI helper, mapped to heroImage
    heroImageId: null,
    status: "draft",
    content: { sections: [] }, // Structure matches DB
};

/* ========== SORTABLE SECTION COMPONENT ========== */
const SortableSection = ({ id, children }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className="mb-4">
            {children({ attributes, listeners })}
        </div>
    );
};

/* ================== EDITOR COMPONENT ================== */
export default function ArticleEditor() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [article, setArticle] = useState(EMPTY_ARTICLE);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showMediaLibrary, setShowMediaLibrary] = useState(false);
    const [collapsedSections, setCollapsedSections] = useState({});
    const [mediaCtx, setMediaCtx] = useState(null); // { type: 'hero' | 'block', sectionId, blockId }
    const [saving, setSaving] = useState(false);

    // Load Categories on Mount
    useEffect(() => {
        apiClient.get("/category").then(setCategories).catch(console.error);
    }, []);

    // Load Article if Editing
    useEffect(() => {
        if (!id) return;
        getArticleById(id)
            .then((data) => {
                // Map API response which might have includes/joins to editor state
                // The API returns { ..., heroImage: {url, id}, category: {id, name}, content: { sections: [] } }
                setArticle({
                    ...data,
                    categoryId: data.categoryId,
                    hero_url: data.heroImage?.url || null,
                    heroImageId: data.heroImageId || null,
                    content: data.content || { sections: [] }
                });
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [id]);

    /* ============ HELPERS ============ */
    const setField = (key, value) => setArticle((a) => ({ ...a, [key]: value }));

    // Helper to deep update sections in content.sections
    const updateSections = (fn) =>
        setArticle((a) => ({
            ...a,
            content: {
                ...a.content,
                sections: fn(a.content?.sections || [])
            }
        }));

    const openHeroMedia = () => {
        setMediaCtx({ type: "hero" });
        setShowMediaLibrary(true);
    };

    /* ============ SECTIONS ============ */
    const addSection = () =>
        updateSections((s) => [
            ...s,
            { id: crypto.randomUUID(), title: "", blocks: [] },
        ]);

    const removeSection = (sid) =>
        updateSections((s) => s.filter((x) => x.id !== sid));

    const collapseSection = (sid) =>
        setCollapsedSections(prev => ({ ...prev, [sid]: !prev[sid] }));

    /* ============ BLOCKS ============ */
    const addBlock = (sid, type) =>
        updateSections((s) =>
            s.map((sec) =>
                sec.id === sid
                    ? {
                        ...sec, blocks: [...(sec.blocks || []), { id: crypto.randomUUID(), type, value: "" }],
                    } : sec
            )
        );

    const updateBlock = (sid, bid, value) =>
        updateSections((s) =>
            s.map((sec) =>
                sec.id === sid
                    ? { ...sec, blocks: (sec.blocks || []).map((block) => block.id === bid ? { ...block, value } : block) }
                    : sec
            )
        );

    const removeBlock = (sid, bid) =>
        updateSections((sections) =>
            sections.map((section) =>
                section.id === sid
                    ? { ...section, blocks: (section.blocks || []).filter((b) => b.id !== bid) }
                    : section
            )
        );

    /* ============ MEDIA ============ */
    const openMedia = (sectionId, blockId) => {
        setMediaCtx({ type: "block", sectionId, blockId });
        setShowMediaLibrary(true);
    };

    const handleMediaSelect = (entries) => {
        if (!mediaCtx || !entries.length) return;
        const file = entries[0];
        const url = file.url;
        const fileId = file.id;

        if (mediaCtx.type === "hero") {
            setField("hero_url", url);
            setField("heroImageId", fileId);
        }

        if (mediaCtx.type === "block") {
            updateBlock(mediaCtx.sectionId, mediaCtx.blockId, url);
            // NOTE: We are storing URL directly in block value for simplicity.
            // Ideally we would store { fileId: ... } but the current render logic expects value string.
            // The backend extractor syncs content file IDs differently.
            // If we need to reference the ID in content for extraction, we might need a custom attribute.
            // But keeping it simple: just URL as value.
        }

        setShowMediaLibrary(false);
        setMediaCtx(null);
    };

    /* ============ SAVE ============ */
    const save = () => {
        if (!article.title) return alert("Title is required");
        setSaving(true);

        const payload = {
            ...article,
            slug: article.slug || createSlug(article.title),
            // Ensure strictly content is JSON
            content: article.content
        };

        const req = id ? updateArticle(id, payload) : createArticle(payload);
        req.then(() => navigate("/articles")).catch(alert).finally(() => setSaving(false));
    };

    if (loading) return <div className="p-10 text-center">Loading Article...</div>;

    return (
        <div className="flex h-[calc(100vh-64px)] -m-8">
            {/* Subtract header/padding height approx or just full screen absolute-ish */}

            {/* LEFT: EDITOR */}
            <div className="w-1/2 overflow-y-auto p-8 border-r border-gray-200">
                <Header
                    title={id ? "Edit Article" : "Create Article"}
                    action={saving ? "Saving..." : "Save Article"}
                    onAction={save}
                />

                {/* METADATA CARD */}
                <Card>
                    <Input label="Title" value={article.title} onChange={(v) => setField("title", v)} placeholder="Article Title" />
                    <Input label="Subtitle" value={article.subtitle} onChange={(v) => setField("subtitle", v || null)} placeholder="Optional Subtitle" />
                    <Textarea label="Summary" value={article.summary} onChange={(v) => setField("summary", v || null)} placeholder="Short summary..." />

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select
                            value={article.categoryId || ""}
                            onChange={(e) => setField("categoryId", e.target.value || null)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border"
                        >
                            <option value="">Select Category...</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            value={article.status}
                            onChange={(e) => setField("status", e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border"
                        >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                        </select>
                    </div>

                    <div className="mb-5">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hero Image</label>
                        <div className="flex gap-2">
                            <input
                                className="flex-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50 text-gray-500 sm:text-sm p-2 border"
                                value={article.hero_url || ""}
                                readOnly
                                placeholder="No image selected"
                            />
                            <button
                                onClick={openHeroMedia}
                                className="px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                                Select Media
                            </button>
                        </div>
                        {article.hero_url && <img src={article.hero_url} alt="Hero" className="mt-2 h-24 rounded object-cover border" />}
                    </div>
                </Card>

                {/* SECTIONS */}
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800">Content Sections</h3>
                    <button onClick={addSection} className="text-sm text-indigo-600 font-semibold hover:underline">+ Add Section</button>
                </div>

                <DndContext
                    collisionDetection={closestCenter}
                    onDragEnd={({ active, over }) => {
                        if (!over || active.id === over.id) return;
                        updateSections((sections) =>
                            arrayMove(sections, sections.findIndex(s => s.id === active.id), sections.findIndex(s => s.id === over.id))
                        );
                    }}
                >
                    <SortableContext
                        items={(article.content?.sections || []).map(s => s.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        {(article.content?.sections || []).map((section) => (
                            <SortableSection key={section.id} id={section.id}>
                                {({ attributes, listeners }) => (
                                    <Card className="mb-4 border-l-4 border-l-indigo-500">
                                        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
                                            <span {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-600">
                                                <Hand size={18} />
                                            </span>
                                            <input
                                                className="flex-1 text-lg font-semibold text-gray-900 border-none focus:ring-0 p-0"
                                                placeholder="Section Title"
                                                value={section.title}
                                                onChange={(e) => updateSections(s => s.map(x => x.id === section.id ? { ...x, title: e.target.value } : x))}
                                            />
                                            <button onClick={() => collapseSection(section.id)} className="text-xs text-indigo-600 font-medium">
                                                {collapsedSections[section.id] ? "Expand" : "Collapse"}
                                            </button>
                                            <IconBtn onClick={() => removeSection(section.id)} className="text-gray-400 hover:text-red-500">
                                                <Trash2 size={16} />
                                            </IconBtn>
                                        </div>

                                        {!collapsedSections[section.id] && (
                                            <>
                                                {(section.blocks || []).map((block) => (
                                                    <div key={block.id} className="mb-4 relative group">
                                                        <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                            <button onClick={() => removeBlock(section.id, block.id)} className="p-1 bg-red-50 text-red-500 rounded hover:bg-red-100"><Trash2 size={12} /></button>
                                                        </div>

                                                        {["image", "video"].includes(block.type) ? (
                                                            <div className="bg-gray-50 p-3 rounded border border-gray-200">
                                                                <div className="flex gap-2 items-center">
                                                                    <input
                                                                        className="flex-1 text-xs bg-white border border-gray-300 rounded p-1"
                                                                        value={block.value}
                                                                        onChange={(e) => updateBlock(section.id, block.id, e.target.value)}
                                                                        placeholder="Media URL"
                                                                    />
                                                                    <button onClick={() => openMedia(section.id, block.id)} className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">Browse</button>
                                                                </div>
                                                                {block.value && <img src={block.value} className="mt-2 max-h-32 rounded border" />}
                                                            </div>
                                                        ) : (
                                                            <WysiwygInput
                                                                value={block.value}
                                                                onChange={(v) => updateBlock(section.id, block.id, v)}
                                                            />
                                                        )}
                                                    </div>
                                                ))}
                                                <BlockBar onAdd={(t) => addBlock(section.id, t)} />
                                            </>
                                        )}
                                    </Card>
                                )}
                            </SortableSection>
                        ))}
                    </SortableContext>
                </DndContext>
            </div>

            {/* RIGHT: PREVIEW */}
            <div className="w-1/2 bg-gray-100 overflow-y-auto p-12">
                <div className="bg-white shadow-xl min-h-screen rounded-xl p-10">
                    <ArticlePreview data={article} />
                </div>
            </div>

            {/* MODAL */}
            {showMediaLibrary && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-6 z-50 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-4xl max-h-[85vh] flex flex-col p-6 rounded-xl shadow-2xl">
                        <div className="flex justify-between items-center mb-6 border-b pb-4">
                            <h3 className="font-bold text-xl text-gray-800">Media Library</h3>
                            <button
                                onClick={() => { setShowMediaLibrary(false); setMediaCtx(null); }}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto pr-2">
                            <MediaGrid onSelect={handleMediaSelect} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
