import { useState, useEffect } from "react";
import { Card } from "../components/MyUtilities";
import apiClient from "../apiClient";
import { Eye, FileText, Folder, HardDrive, TrendingUp } from "lucide-react";

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiClient.get("/stats")
            .then(res => setStats(res.data))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading statistics...</div>;
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
                <p className="text-gray-500">Welcome back! Here's what's happening with your content.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-l-4 border-blue-500 flex items-center p-6 space-x-4">
                    <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                        <Eye size={24} />
                    </div>
                    <div>
                        <div className="text-sm font-medium text-gray-500">Total Views</div>
                        <div className="text-2xl font-bold text-gray-900">{stats?.totals?.views || 0}</div>
                    </div>
                </Card>

                <Card className="border-l-4 border-pink-500 flex items-center p-6 space-x-4">
                    <div className="p-3 bg-pink-50 rounded-lg text-pink-600">
                        <FileText size={24} />
                    </div>
                    <div>
                        <div className="text-sm font-medium text-gray-500">Articles</div>
                        <div className="text-2xl font-bold text-gray-900">{stats?.totals?.articles || 0}</div>
                    </div>
                </Card>

                <Card className="border-l-4 border-emerald-500 flex items-center p-6 space-x-4">
                    <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
                        <Folder size={24} />
                    </div>
                    <div>
                        <div className="text-sm font-medium text-gray-500">Categories</div>
                        <div className="text-2xl font-bold text-gray-900">{stats?.totals?.categories || 0}</div>
                    </div>
                </Card>

                <Card className="border-l-4 border-amber-500 flex items-center p-6 space-x-4">
                    <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
                        <HardDrive size={24} />
                    </div>
                    <div>
                        <div className="text-sm font-medium text-gray-500">Files</div>
                        <div className="text-2xl font-bold text-gray-900">{stats?.totals?.files || 0}</div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 p-6">
                    <div className="flex items-center space-x-2 mb-6">
                        <TrendingUp size={20} className="text-blue-600" />
                        <h2 className="text-lg font-bold text-gray-900">Most Read Articles</h2>
                    </div>
                    <div className="space-y-4">
                        {stats?.topArticles?.length > 0 ? (
                            stats.topArticles.map((article, index) => (
                                <div key={article.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex-shrink-0 w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 line-clamp-1">{article.title}</h3>
                                            <p className="text-xs text-gray-500">slug: {article.slug}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-gray-900">{article.view_count}</div>
                                        <div className="text-[10px] text-gray-500 uppercase tracking-wider">Views</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500 py-8">No articles found yet.</p>
                        )}
                    </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-indigo-600 to-blue-700 text-white border-0">
                    <h2 className="text-lg font-bold mb-4">Quick Insights</h2>
                    <p className="text-blue-100 text-sm mb-6 leading-relaxed">
                        Your content is reaching people! Keep publishing high-quality articles to grow your audience.
                    </p>
                    <div className="space-y-4">
                        <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                            <div className="text-xs text-blue-200 uppercase mb-1">Avg. Views per Article</div>
                            <div className="text-xl font-bold">
                                {stats?.totals?.articles > 0
                                    ? Math.round((stats.totals.views / stats.totals.articles) * 10) / 10
                                    : 0}
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
