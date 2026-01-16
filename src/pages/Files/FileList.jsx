import { useState, useEffect } from "react";
import { Upload, Trash2, Image as ImageIcon, Film } from "lucide-react";
import apiClient from "../../apiClient";
import { Card, Header, IconBtn, LoadingSpinner, EdentaButton } from "../../components/MyUtilities";

export default function FileList() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const data = await apiClient.get("/file");
      setFiles(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      await apiClient.post("/file", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      fetchFiles();
    } catch (err) {
      alert("Upload failed: " + (err.response?.data?.error || err.message));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;
    try {
      await apiClient.delete(`/file/${id}`);
      setFiles(files.filter((f) => f.id !== id));
    } catch (error) {
      console.error(error);
      alert("Delete failed");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Files Library</h2>
        <div className="relative">
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleUpload}
            accept="image/*,video/*"
          />
          <EdentaButton
            as="label"
            htmlFor="file-upload"
            loading={uploading}
            icon={Upload}
            className={`cursor-pointer ${uploading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            Upload New File
          </EdentaButton>
        </div>
      </div>

      {loading ? (<LoadingSpinner txt="files" />) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {files.map((file) => (
            <div key={file.id} className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                {file.type === "image" ? (
                  <img src={file.url} alt={file.alt} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center text-gray-400">
                    <Film size={40} />
                    <span className="text-xs mt-2 uppercase">{file.type}</span>
                  </div>
                )}
              </div>
              <div className="p-2 flex justify-between items-center bg-white border-t border-gray-100">
                <span className="text-xs text-gray-500 truncate flex-1" title={file.alt || "No Name"}>
                  {file.alt || "Unnamed File"}
                </span>
                <button
                  onClick={() => handleDelete(file.id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && files.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-300" htmlFor="file-upload" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No files uploaded</h3>
          <p className="mt-1 text-sm text-gray-500">Upload an image or video to get started.</p>
        </div>
      )}
    </div>
  );
}
