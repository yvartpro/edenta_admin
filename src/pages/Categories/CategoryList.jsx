import { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Trash2, Save, X } from "lucide-react";
import apiClient from "../../apiClient";
import { getCachedData, setCachedData, clearCache } from "../../services/helper";
import { Card, IconBtn, LoadingSpinner, EdentaButton, ConfirmModal, SearchInput, Pagination } from "../../components/MyUtilities";

export default function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [savingNew, setSavingNew] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editName, setEditName] = useState("");
  const [newName, setNewName] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // Pagination & Search
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [totalCount, setTotalCount] = useState(0);

  const fetchCategories = useCallback(async () => {
    const params = { page, search, limit: 15 };
    const cached = getCachedData('categories', params);

    if (cached) {
      setCategories(cached.data);
      setTotalPages(cached.totalPages);
      setTotalCount(cached.total);
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.get("/category", { params });
      if (response && response.data) {
        setCategories(response.data);
        setTotalPages(response.totalPages);
        setTotalCount(response.total);
        setCachedData('categories', params, response);
      } else if (Array.isArray(response)) {
        setCategories(response);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSearch = (val) => {
    setSearch(val);
    setPage(1);
  };

  const handleCreate = () => {
    if (!newName.trim()) return;
    setSavingNew(true);
    apiClient.post("/category", { name: newName })
      .then(() => {
        setNewName("");
        clearCache('categories');
        fetchCategories();
      })
      .catch(error => {
        console.error(error);
        alert("Error creating category");
      })
      .finally(() => {
        setSavingNew(false);
      });
  };

  const startEdit = (cat) => {
    setEditingId(cat.id);
    setEditName(cat.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  const saveEdit = (id) => {
    setSavingEdit(true);
    apiClient.put(`/category/${id}`, { name: editName })
      .then(() => {
        setEditingId(null);
        clearCache('categories');
        fetchCategories();
      })
      .catch(error => {
        console.error(error);
        alert("Error updating category");
      })
      .finally(() => {
        setSavingEdit(false);
      });
  };

  const initiateDelete = (cat) => {
    setCategoryToDelete(cat);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (!categoryToDelete) return;
    setDeleting(true);
    apiClient.delete(`/category/${categoryToDelete.id}`)
      .then(() => {
        setCategories(categories.filter(c => c.id !== categoryToDelete.id));
        clearCache('categories');
        setDeleteModalOpen(false);
        setCategoryToDelete(null);
      })
      .catch(error => {
        console.error(error);
        alert("Error deleting category");
      })
      .finally(() => {
        setDeleting(false);
      });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-sm text-gray-500">{totalCount} total categories</p>
        </div>
        <SearchInput
          value={search}
          onChange={handleSearch}
          className="w-full md:w-64"
        />
      </div>

      {/* CREATE NEW */}
      <Card className="mb-8 bg-pink-50 border-pink-100">
        <label className="block text-sm font-semibold text-pink-900 mb-2">Add New Category</label>
        <div className="flex gap-3">
          <input
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm p-2.5 border"
            placeholder="Category Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          <EdentaButton
            onClick={handleCreate}
            disabled={!newName.trim()}
            loading={savingNew}
            icon={Plus}
          >
            Create
          </EdentaButton>
        </div>
      </Card>

      {/* LIST */}
      <div className="space-y-3">
        {loading ? (<LoadingSpinner txt="articles" />) : categories.length === 0 ? (
          <div className="text-center text-gray-400 py-8">No categories found.</div>
        ) : (
          categories.map((cat) => (
            <div key={cat.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between group">
              {editingId === cat.id ? (
                <div className="flex-1 flex items-center gap-3 mr-4">
                  <input
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm p-2 border"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    autoFocus
                  />
                  <EdentaButton
                    onClick={() => saveEdit(cat.id)}
                    disabled={!editName.trim()}
                    loading={savingEdit}
                    icon={Save}
                    mobileIconOnly
                  >
                    Save
                  </EdentaButton>
                  <EdentaButton
                    onClick={cancelEdit}
                    icon={X}
                    mobileIconOnly
                  >
                    Cancel
                  </EdentaButton>
                </div>
              ) : (
                <>
                  <div>
                    <h3 className="font-semibold text-gray-800 break-words line-clamp-3">{cat.name}</h3>
                    <p className="text-xs text-gray-400 font-mono">slug: {cat.slug}</p>
                  </div>
                  <div className="flex items-center gap-2 transition-opacity">
                    <EdentaButton
                      onClick={() => startEdit(cat)}
                      icon={Edit2}
                      mobileIconOnly
                      variant="ghost"
                    >
                      Edit
                    </EdentaButton>
                    <EdentaButton
                      onClick={() => initiateDelete(cat)}
                      icon={Trash2}
                      disabled={deleting}
                      mobileIconOnly
                      variant="ghost"
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      Delete
                    </EdentaButton>
                  </div>
                </>
              )}
            </div>
          ))
        )}

        {/* PAGINATION */}
        <div className="flex justify-center mt-4">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Category"
        message={`Are you sure you want to delete "${categoryToDelete?.name}"? This action cannot be undone.`}
        loading={deleting}
      />
    </div>
  );
}
