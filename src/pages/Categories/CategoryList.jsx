import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Save, X } from "lucide-react";
import apiClient from "../../apiClient";
import { Card, IconBtn, LoadingSpinner, ButtonLoadingSpinner } from "../../components/MyUtilities";

export default function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [savingNew, setSavingNew] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editName, setEditName] = useState("");
  const [newName, setNewName] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await apiClient.get("/category");
      setCategories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    if (!newName.trim()) return;
    setSavingNew(true);
    apiClient.post("/category", { name: newName })
      .then(() => {
        setNewName("");
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

  const handleDelete = (id) => {
    setDeleting(true);
    if (!window.confirm("Delete this category?")) return;
    apiClient.delete(`/category/${id}`)
      .then(() => {
        setCategories(categories.filter(c => c.id !== id));
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
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Categories</h1>

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
          <button
            onClick={handleCreate}
            disabled={!newName.trim()}
            className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 disabled:opacity-50 transition-colors font-medium flex items-center gap-2"
          >
            {savingNew ? <><ButtonLoadingSpinner /> Saving</> : <><Plus size={18} /> Create</>}

          </button>
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
                  <IconBtn onClick={() => saveEdit(cat.id)} className="text-green-600 bg-green-50 hover:bg-green-100">
                    {savingEdit ? <ButtonLoadingSpinner /> : <Save size={16} />}
                  </IconBtn>
                  <IconBtn onClick={cancelEdit} className="text-gray-500 hover:text-gray-700">
                    <X size={16} />
                  </IconBtn>
                </div>
              ) : (
                <>
                  <div>
                    <h3 className="font-semibold text-gray-800">{cat.name}</h3>
                    <p className="text-xs text-gray-400 font-mono">slug: {cat.slug}</p>
                  </div>
                  <div className="flex items-center gap-2 transition-opacity">
                    <IconBtn onClick={() => startEdit(cat)} className="hover:text-pink-600 text-gray-400">
                      <Edit2 size={16} />
                    </IconBtn>
                    <IconBtn onClick={() => handleDelete(cat.id)} className="hover:text-red-600 text-gray-400">
                      {deleting ? <ButtonLoadingSpinner /> : <Trash2 size={16} />}
                    </IconBtn>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
