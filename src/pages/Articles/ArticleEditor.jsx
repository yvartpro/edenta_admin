import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Hand, Trash2, X, Plus } from "lucide-react"; // Replaced HandGrab with Hand
import { Card, Header, Input, Textarea, Select, IconBtn, BlockBar, ButtonLoadingSpinner, EdentaButton } from "../../components/MyUtilities";
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
    apiClient.get("/category")
      .then((response) => {
        // Handle both wrapped and unwrapped response
        const data = response.data || (Array.isArray(response) ? response : []);
        setCategories(data);
      })
      .catch((err) => {
        console.error("Failed to load categories:", err);
        setCategories([]);
      });
  }, []);

  // Load Article if Editing
  useEffect(() => {
    if (!id) return;
    getArticleById(id)
      .then((data) => {
        // Map API response which might have includes/joins to editor state
        // The API returns { ..., heroImage: {url, id}, category: {id, name}, content: { sections: [] } }
        // Sanitize content
        let content = data.content;
        if (typeof content === "string") {
          try {
            content = JSON.parse(content);
          } catch (e) {
            console.error("Failed to parse article content JSON:", e);
            content = { sections: [] };
          }
        }
        // Ensure content is an object with sections array, stripping any garbage keys
        const sections = Array.isArray(content?.sections) ? content.sections : [];

        // Hydrate image URLs from contentFiles
        const files = data.contentFiles || [];
        const hydratedSections = sections.map(section => ({
          ...section,
          blocks: (section.blocks || []).map(block => {
            if (block.type === 'image' && block.fileId && !block.value) {
              const file = files.find(f => f.id === block.fileId);
              if (file) return { ...block, value: file.url };
            }
            if (block.type === 'gallery' && Array.isArray(block.images)) {
              const hydratedImages = block.images.map(img => {
                if (img.fileId && !img.url) {
                  const file = files.find(f => f.id === img.fileId);
                  if (file) return { ...img, url: file.url };
                }
                return img;
              });
              return { ...block, images: hydratedImages };
            }
            return block;
          })
        }));

        setArticle({
          ...data,
          categoryId: data.categoryId,
          hero_url: data.heroImage?.url || null,
          heroImageId: data.heroImageId || null,
          content: { sections: hydratedSections }
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
    setCollapsedSections((prev) => ({ ...prev, [sid]: !prev[sid] }));

  /* ============ BLOCKS ============ */
  const addBlock = (sid, type) =>
    updateSections((s) =>
      s.map((sec) =>
        sec.id === sid
          ? {
            ...sec,
            blocks: [...(sec.blocks || []), {
              id: crypto.randomUUID(),
              type,
              value: "",
              // Gallery defaults
              images: [],
              layout: "grid"
            }],
          }
          : sec
      )
    );

  const updateBlock = (sid, bid, payload) =>
    updateSections((s) =>
      s.map((sec) =>
        sec.id === sid
          ? {
            ...sec,
            blocks: (sec.blocks || []).map((block) =>
              block.id === bid
                ? (typeof payload === "object" && payload !== null ? { ...block, ...payload } : { ...block, value: payload })
                : block
            )
          }
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
  const openMedia = (sectionId, blockId, typeOverride) => {
    setMediaCtx({ type: typeOverride || "block", sectionId, blockId });
    setShowMediaLibrary(true);
  };

  const handleMediaSelect = (entries) => {
    if (!mediaCtx || !entries.length) return;

    // Handle Gallery
    if (mediaCtx.type === "gallery") {
      const images = entries.map(f => ({ fileId: f.id, url: f.url }));
      updateBlock(mediaCtx.sectionId, mediaCtx.blockId, { images });
      // Keep library open for multi-select
      // setShowMediaLibrary(false); 
      // setMediaCtx(null);
      return;
    }

    // Handle Single Image / Hero
    const file = entries[0];
    const url = file.url;
    const fileId = file.id;

    if (mediaCtx.type === "hero") {
      setField("hero_url", url);
      setField("heroImageId", fileId);
    }

    if (mediaCtx.type === "block") {
      // Store both the URL (for display) and the fileId (for backend linking)
      updateBlock(mediaCtx.sectionId, mediaCtx.blockId, { value: url, fileId: fileId });
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
      // Ensure strictly content is JSON and strip image URLs (dehydration)
      content: {
        sections: (article.content?.sections || []).map(section => ({
          ...section,
          blocks: (section.blocks || []).map(block => {
            if (block.type === 'image' && block.fileId) {
              // Remove value (URL) to rely on fileId
              // eslint-disable-next-line no-unused-vars
              const { value, ...rest } = block;
              return rest;
            }
            if (block.type === 'gallery' && Array.isArray(block.images)) {
              // Dehydrate gallery images
              // eslint-disable-next-line no-unused-vars
              const dehydratedImages = block.images.map(({ url, ...imgRest }) => imgRest);
              return { ...block, images: dehydratedImages };
            }
            return block;
          })
        }))
      }
    };

    const req = id ? updateArticle(id, payload) : createArticle(payload);
    req.then(() => navigate("/articles")).catch(alert).finally(() => setSaving(false));
  };

  const [mobileTab, setMobileTab] = useState('editor'); // 'editor' | 'preview'

  if (loading) return <div className="p-10 text-center">Loading Article...</div>;

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-8rem)] lg:h-[calc(100vh-64px)] -m-4 lg:-m-8">
      {/* MOBILE TABS */}
      <div className="lg:hidden flex border-b border-gray-200 bg-white shrink-0">
        <button
          onClick={() => setMobileTab('editor')}
          className={`flex-1 py-3 text-sm font-bold border-b-2 ${mobileTab === 'editor' ? 'border-pink-600 text-pink-700' : 'border-transparent text-gray-500'}`}
        >
          Editor
        </button>
        <button
          onClick={() => setMobileTab('preview')}
          className={`flex-1 py-3 text-sm font-bold border-b-2 ${mobileTab === 'preview' ? 'border-pink-600 text-pink-700' : 'border-transparent text-gray-500'}`}
        >
          Preview
        </button>
      </div>

      {/* LEFT: EDITOR */}
      <div className={`w-full lg:w-1/2 overflow-y-auto p-4 lg:p-8 border-r border-gray-200 ${mobileTab === 'preview' ? 'hidden lg:block' : ''}`}>
        <Header
          title={id ? "Edit Article" : "Create Article"}
          action={saving ? <>Saving... <ButtonLoadingSpinner /></> : "Save Article"}
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
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm p-2.5 border"
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
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm p-2.5 border"
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
              <EdentaButton
                variant="secondary"
                onClick={openHeroMedia}
              >
                Select Media
              </EdentaButton>
            </div>
            {article.hero_url && <img src={article.hero_url} alt="Hero" className="mt-2 h-24 rounded object-cover border" />}
          </div>
        </Card>

        {/* SECTIONS */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">Content Sections</h3>
          <EdentaButton onClick={addSection} variant="ghost" className="text-pink-600 hover:text-pink-700 hover:bg-pink-50">+ Add Section</EdentaButton>
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
                  <Card className="mb-4 border-l-4 border-l-pink-500">
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
                      <button onClick={() => collapseSection(section.id)} className="text-xs text-pink-600 font-medium">
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

                            {block.type === "image" ? (
                              <div className="bg-gray-50 p-3 rounded border border-gray-200">
                                <div className="flex gap-2 items-center">
                                  <input
                                    className="flex-1 text-xs bg-white border border-gray-300 rounded p-1"
                                    value={block.value}
                                    onChange={(e) => updateBlock(section.id, block.id, e.target.value)}
                                    placeholder="Media URL"
                                  />
                                  <EdentaButton variant="secondary" onClick={() => openMedia(section.id, block.id)} className="text-xs px-2 py-1">Browse</EdentaButton>
                                </div>
                                {block.value && <img src={block.value} className="mt-2 max-h-32 rounded border" />}
                              </div>
                            ) : block.type === "gallery" ? (
                              <div className="bg-gray-50 p-3 rounded border border-gray-200">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-sm font-bold text-gray-700">Gallery</span>
                                  <div className="flex gap-2">
                                    <select
                                      className="text-xs p-1 rounded border"
                                      value={block.layout || "grid"}
                                      onChange={(e) => updateBlock(section.id, block.id, { layout: e.target.value })}
                                    >
                                      <option value="grid">Grid</option>
                                      <option value="masonry">Masonry</option>
                                    </select>
                                    <EdentaButton variant="secondary" onClick={() => openMedia(section.id, block.id, "gallery")} className="text-xs px-2 py-1">
                                      Select Images
                                    </EdentaButton>
                                  </div>
                                </div>
                                <div className="grid grid-cols-4 gap-2">
                                  {(block.images || []).map((img, idx) => (
                                    <img key={idx} src={img.url} className="w-full aspect-square object-cover rounded border bg-white" />
                                  ))}
                                </div>
                                {(block.images || []).length === 0 && <div className="text-xs text-gray-400 italic p-2 text-center">No images selected</div>}
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
      <div className={`w-full lg:w-1/2 bg-gray-100 overflow-y-auto p-4 lg:p-12 ${mobileTab === 'editor' ? 'hidden lg:block' : ''}`}>
        <div className="bg-white shadow-xl min-h-screen rounded-xl p-6 lg:p-10">
          <div className="lg:hidden mb-4 text-center text-xs text-gray-500 uppercase tracking-widest font-bold">
            Mobile Verification Preview
          </div>
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
              <MediaGrid
                onSelect={handleMediaSelect}
                multiSelect={mediaCtx?.type === "gallery"}
                initialSelectedIds={
                  mediaCtx?.type === "gallery"
                    ? (article.content?.sections?.find(s => s.id === mediaCtx?.sectionId)?.blocks?.find(b => b.id === mediaCtx?.blockId)?.images || []).map(i => i.fileId)
                    : []
                }
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
