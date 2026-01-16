import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, File as FileIcon, Image as ImageIcon, Search, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { clsx } from "clsx";
import apiClient from "../../apiClient";
import { getCachedData, setCachedData, clearCache } from "../../services/helper";
import { Card, LoadingSpinner, EdentaButton, ConfirmModal, SearchInput, Pagination } from "../../components/MyUtilities";

export default function FileList() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadQueue, setUploadQueue] = useState([]); // { id, name, progress, status, error }
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Pagination & Search
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [totalCount, setTotalCount] = useState(0);

  const fetchFiles = useCallback(async () => {
    const params = { page, search, limit: 15 };
    const cached = getCachedData('files', params);

    if (cached) {
      setFiles(cached.data);
      setTotalPages(cached.totalPages);
      setTotalCount(cached.total);
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.get("/file", { params });
      if (response && response.data) {
        setFiles(response.data);
        setTotalPages(response.totalPages);
        setTotalCount(response.total);
        setCachedData('files', params, response);
      } else if (Array.isArray(response)) {
        setFiles(response);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleSearch = (val) => {
    setSearch(val);
    setPage(1);
  };

  const handleUpload = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    const newEntries = selectedFiles.map(file => ({
      id: crypto.randomUUID(),
      name: file.name,
      file,
      progress: 0,
      status: "pending",
      error: null
    }));

    setUploadQueue(prev => [...prev, ...newEntries]);
    e.target.value = ""; // Reset input
  };

  // Process queue sequentially
  useEffect(() => {
    const processQueue = async () => {
      const nextFile = uploadQueue.find(f => f.status === "pending");
      if (!nextFile || uploading) return;

      setUploading(true);

      // Update status to uploading
      setUploadQueue(prev => prev.map(f => f.id === nextFile.id ? { ...f, status: "uploading" } : f));

      const formData = new FormData();
      formData.append("file", nextFile.file);

      try {
        await apiClient.post("/file", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadQueue(prev => prev.map(f => f.id === nextFile.id ? { ...f, progress: percentCompleted } : f));
          }
        });

        setUploadQueue(prev => prev.map(f => f.id === nextFile.id ? { ...f, status: "success", progress: 100 } : f));
        clearCache('files');
        fetchFiles();
      } catch (err) {
        console.error("Upload failed for", nextFile.name, err);
        const errorMsg = err.response?.data?.error || err.message || "Upload failed";
        setUploadQueue(prev => prev.map(f => f.id === nextFile.id ? { ...f, status: "error", error: errorMsg } : f));
      } finally {
        setUploading(false);
      }
    };

    processQueue();
  }, [uploadQueue, uploading, fetchFiles]);

  const removeQueueItem = (id) => {
    setUploadQueue(prev => prev.filter(f => f.id !== id));
  };

  const clearFinished = () => {
    setUploadQueue(prev => prev.filter(f => f.status === "pending" || f.status === "uploading"));
  };

  const initiateDelete = (file) => {
    setFileToDelete(file);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!fileToDelete) return;
    setDeleting(true);
    try {
      await apiClient.delete(`/file/${fileToDelete.id}`);
      setFiles(files.filter((f) => f.id !== fileToDelete.id));
      clearCache('files');
      setDeleteModalOpen(false);
      setFileToDelete(null);
    } catch (error) {
      console.error(error);
      alert("Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
          <p className="text-sm text-gray-500">{totalCount} files in library</p>
        </div>
        <div className="flex w-full md:w-auto gap-3">
          <SearchInput
            value={search}
            onChange={handleSearch}
            className="flex-1 md:w-64"
          />
          <EdentaButton
            onClick={() => document.getElementById('file-upload').click()}
            loading={uploading && uploadQueue.length === 1} // Only show loading if single file upload (compatibility/visual)
            icon={Plus}
            mobileIconOnly
          >
            Upload Files
          </EdentaButton>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleUpload}
            accept="image/*,video/*"
            multiple
          />
        </div>
      </div>

      {/* UPLOAD QUEUE PANEL */}
      {uploadQueue.length > 0 && (
        <Card className="mb-8 border-pink-100 bg-pink-50/30 overflow-hidden p-0">
          <div className="flex items-center justify-between p-4 border-b border-pink-100 bg-white">
            <h3 className="font-bold text-pink-900 flex items-center gap-2">
              Upload Queue ({uploadQueue.filter(f => f.status === 'success').length}/{uploadQueue.length})
            </h3>
            <button
              onClick={clearFinished}
              className="text-xs text-pink-600 hover:text-pink-800 font-medium"
            >
              Clear Finished
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto divide-y divide-pink-50">
            {uploadQueue.map((item) => (
              <div key={item.id} className="p-3 flex items-center gap-4 bg-white/50">
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700 truncate">{item.name}</span>
                    <span className="text-xs text-gray-500">{item.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={clsx(
                        "h-full transition-all duration-300",
                        item.status === 'error' ? 'bg-red-500' : 'bg-pink-600'
                      )}
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                  {item.error && <p className="text-[10px] text-red-500 mt-1 truncate">{item.error}</p>}
                </div>
                <div className="flex items-center gap-2">
                  {item.status === 'pending' && <div className="w-5 h-5 rounded-full border-2 border-gray-200" />}
                  {item.status === 'uploading' && <Loader2 className="w-5 h-5 text-pink-500 animate-spin" />}
                  {item.status === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
                  {item.status === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}

                  {item.status !== 'uploading' && (
                    <button onClick={() => removeQueueItem(item.id)} className="text-gray-400 hover:text-gray-600 p-1">
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {loading ? (<LoadingSpinner txt="files" />) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {files.map((file) => (
            <div key={file.id} className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                {file.type === "image" ? (
                  <img src={file.url} alt={file.alt} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center text-gray-400">
                    <FileIcon size={40} />
                    <span className="text-xs mt-2 uppercase">{file.type}</span>
                  </div>
                )}
              </div>
              <div className="p-2 flex justify-between items-center bg-white border-t border-gray-100">
                <span className="text-xs text-gray-500 break-words line-clamp-3 flex-1" title={file.alt || "No Name"}>
                  {file.alt || "Unnamed File"}
                </span>
                <button
                  onClick={() => initiateDelete(file)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PAGINATION */}
      <div className="flex justify-center mt-8">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>

      {!loading && files.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-300" htmlFor="file-upload" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No files uploaded</h3>
          <p className="mt-1 text-sm text-gray-500">Upload an image or video to get started.</p>
        </div>
      )}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete File"
        message="Are you sure you want to delete this file? This action cannot be undone."
        loading={deleting}
      />
    </div>
  );
}
