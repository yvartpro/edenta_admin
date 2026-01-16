import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Edit2, Trash2, FileText, CheckCircle, Circle } from "lucide-react";
import { getArticles, deleteArticle } from "../../services/articles.api";
import { clsx } from "clsx";
import { LoadingSpinner, EdentaButton, ConfirmModal } from "../../components/MyUtilities";

export default function ArticleList() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getArticles();
      if (Array.isArray(data)) {
        setArticles(data);
      } else {
        setArticles([]);
      }
    } catch (err) {
      console.error(err);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const initiateDelete = (article) => {
    setArticleToDelete(article);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!articleToDelete) return;
    setDeleting(true);
    try {
      await deleteArticle(articleToDelete.id);
      setArticles(prev => prev.filter(a => a.id !== articleToDelete.id));
      setDeleteModalOpen(false);
      setArticleToDelete(null);
    } catch (error) {
      console.error(error);
      alert("Failed to delete article");
    } finally {
      setDeleting(false);
    }
  };

  const StatusBadge = ({ status }) => {
    const isPublished = status === "published";
    return (
      <span className={clsx(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium",
        isPublished ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
      )}>
        {isPublished ? <CheckCircle size={12} /> : <Circle size={12} />}
        {status?.toUpperCase() || "DRAFT"}
      </span>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Articles</h1>
        <Link to="/articles/new">
          <EdentaButton icon={Plus} mobileIconOnly>Create Article</EdentaButton>
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (<LoadingSpinner txt="articles" />) : articles.length === 0 ? (
          <div className="p-12 text-center">
            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="text-gray-400" size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No articles yet</h3>
            <p className="text-gray-500 mt-1 mb-6">Create your first article to get started.</p>
            <Link
              to="/articles/new"
              className="text-pink-600 hover:text-pink-800 font-medium"
            >
              Create New Article &rarr;
            </Link>
          </div>
        ) : (
          <>
            {/* MOBILE CARD VIEW */}
            <div className="grid grid-cols-1 gap-4 p-4 lg:hidden">
              {articles.map((article) => (
                <div key={article.id} className="bg-white border rounded-lg p-4 shadow-sm flex gap-4 items-start">
                  <div className="h-20 w-20 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                    {article.heroImage?.url ? (
                      <img src={article.heroImage.url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-gray-300">
                        <FileText size={20} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-900 break-words line-clamp-3 pr-2">{article.title}</h4>
                        <p className="text-xs text-gray-500 mb-2">{new Date(article.createdAt).toLocaleDateString()}</p>
                      </div>
                      <StatusBadge status={article.status} />
                    </div>

                    <div className="flex justify-between items-end mt-2">
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-600">
                        {article.category?.name || "Uncategorized"}
                      </span>
                      <div className="flex gap-3">
                        <Link to={`/articles/${article.id}`} className="text-pink-600 p-1">
                          <Edit2 size={18} />
                        </Link>
                        <button onClick={() => initiateDelete(article)} className="text-red-400 p-1">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* DESKTOP TABLE VIEW */}
            <div className="hidden lg:block">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Article</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {articles.map((article) => (
                    <tr key={article.id} className="hover:bg-gray-50 group">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                            {article.heroImage?.url ? (
                              <img src={article.heroImage.url} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-gray-300">
                                <FileText size={20} />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{article.title}</div>
                            <div className="text-sm text-gray-500 text-xs truncate max-w-xs">{article.subtitle || "No subtitle"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {article.category?.name || <span className="text-gray-300 italic">Uncategorized</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={article.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(article.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link to={`/articles/${article.id}`} className="text-pink-600 hover:text-pink-900">
                            <Edit2 size={18} />
                          </Link>
                          <button
                            onClick={() => initiateDelete(article)}
                            className="text-red-400 hover:text-red-600"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Article"
        message={`Are you sure you want to delete "${articleToDelete?.title}"? This action cannot be undone.`}
        loading={deleting}
      />
    </div>
  );
}
