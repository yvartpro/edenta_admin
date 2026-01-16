import { useState, useEffect } from "react";
import apiClient from "../apiClient";
import { Image as ImageIcon, Film, Check } from "lucide-react";
import { clsx } from "clsx";

export default function MediaGrid({ onSelect, multiSelect = false }) {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState(new Set());

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

    const toggleSelection = (file) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(file.id)) {
            newSet.delete(file.id);
        } else {
            if (!multiSelect) newSet.clear();
            newSet.add(file.id);
        }
        setSelectedIds(newSet);

        // Map IDs back to file objects
        const selectedFiles = files.filter(f => newSet.has(f.id));
        onSelect(selectedFiles);
    };

    return (
        <div>
            {loading ? (
                <div className="text-center py-10">Loading media...</div>
            ) : (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                    {files.map((file) => {
                        const isSelected = selectedIds.has(file.id);
                        return (
                            <div
                                key={file.id}
                                onClick={() => toggleSelection(file)}
                                className={clsx(
                                    "cursor-pointer group relative border rounded-lg overflow-hidden aspect-square hover:shadow-md transition-all",
                                    isSelected ? "ring-2 ring-indigo-500 border-transparent" : "border-gray-200"
                                )}
                            >
                                {file.type === "image" ? (
                                    <img src={file.url} alt={file.alt} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center w-full h-full bg-gray-100">
                                        <Film className="text-gray-400" />
                                    </div>
                                )}

                                {isSelected && (
                                    <div className="absolute top-2 right-2 bg-indigo-600 text-white p-1 rounded-full shadow-sm">
                                        <Check size={12} />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
