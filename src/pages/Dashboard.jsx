import { useState, useEffect } from "react";
import { Card } from "../components/MyUtilities";
import apiClient from "../apiClient";
import { Eye, FileText, Folder, HardDrive, TrendingUp } from "lucide-react";

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiClient.get("/stats")
            .then(res => setStats(res))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading statistics...</div>;
    }

    return (
        <div className="space-y-6 md:space-y-8">
            <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">Dashboard Overview</h1>
                <p className="text-sm text-gray-500">Welcome back! Here's your content summary.</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                <Card className="border-l-4 border-blue-500 flex flex-col sm:flex-row items-center sm:items-start p-3 md:p-6 sm:space-x-4 mb-0">
                    <div className="p-2 md:p-3 bg-blue-50 rounded-lg text-blue-600 mb-2 sm:mb-0">
                        <Eye size={20} className="md:w-6 md:h-6" />
                    </div>
                    <div className="text-center sm:text-left">
                        <div className="text-[10px] md:text-sm font-medium text-gray-500 uppercase md:normal-case tracking-wider md:tracking-normal">Total Views</div>
                        <div className="text-lg md:text-2xl font-bold text-gray-900">{stats?.totals?.views || 0}</div>
                    </div>
                </Card>

                <Card className="border-l-4 border-pink-500 flex flex-col sm:flex-row items-center sm:items-start p-3 md:p-6 sm:space-x-4 mb-0">
                    <div className="p-2 md:p-3 bg-pink-50 rounded-lg text-pink-600 mb-2 sm:mb-0">
                        <FileText size={20} className="md:w-6 md:h-6" />
                    </div>
                    <div className="text-center sm:text-left">
                        <div className="text-[10px] md:text-sm font-medium text-gray-500 uppercase md:normal-case tracking-wider md:tracking-normal">Articles</div>
                        <div className="text-lg md:text-2xl font-bold text-gray-900">{stats?.totals?.articles || 0}</div>
                    </div>
                </Card>

                <Card className="border-l-4 border-emerald-500 flex flex-col sm:flex-row items-center sm:items-start p-3 md:p-6 sm:space-x-4 mb-0">
                    <div className="p-2 md:p-3 bg-emerald-50 rounded-lg text-emerald-600 mb-2 sm:mb-0">
                        <Folder size={20} className="md:w-6 md:h-6" />
                    </div>
                    <div className="text-center sm:text-left">
                        <div className="text-[10px] md:text-sm font-medium text-gray-500 uppercase md:normal-case tracking-wider md:tracking-normal">Categories</div>
                        <div className="text-lg md:text-2xl font-bold text-gray-900">{stats?.totals?.categories || 0}</div>
                    </div>
                </Card>

                <Card className="border-l-4 border-amber-500 flex flex-col sm:flex-row items-center sm:items-start p-3 md:p-6 sm:space-x-4 mb-0">
                    <div className="p-2 md:p-3 bg-amber-50 rounded-lg text-amber-600 mb-2 sm:mb-0">
                        <HardDrive size={20} className="md:w-6 md:h-6" />
                    </div>
                    <div className="text-center sm:text-left">
                        <div className="text-[10px] md:text-sm font-medium text-gray-500 uppercase md:normal-case tracking-wider md:tracking-normal">Files</div>
                        <div className="text-lg md:text-2xl font-bold text-gray-900">{stats?.totals?.files || 0}</div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                <Card className="lg:col-span-2 p-4 md:p-6 mb-0">
                    <div className="flex items-center space-x-2 mb-4 md:mb-6">
                        <TrendingUp size={20} className="text-blue-600" />
                        <h2 className="text-base md:text-lg font-bold text-gray-900">Most Read Articles</h2>
                    </div>
                    <div className="space-y-3 md:space-y-4">
                        {stats?.topArticles?.length > 0 ? (
                            stats.topArticles.map((article, index) => (
                                <div key={article.id} className="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center space-x-3 md:space-x-4 min-w-0">
                                        <div className="flex-shrink-0 w-6 h-6 md:w-8 md:h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center font-bold text-[10px] md:text-sm text-gray-500">
                                            {index + 1}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="text-sm md:text-base font-semibold text-gray-900 truncate">{article.title}</h3>
                                            <p className="text-[10px] md:text-xs text-gray-500 truncate">{article.view_count} total views</p>
                                        </div>
                                    </div>
                                    <div className="ml-4 flex-shrink-0">
                                        <div className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-[10px] font-bold uppercase tracking-wider">
                                            Top {index + 1}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500 py-6 md:py-8 text-sm">No articles found yet.</p>
                        )}
                    </div>
                </Card>

                <Card className="p-5 md:p-6 bg-gradient-to-br from-indigo-600 to-blue-700 text-white border-0 mb-0">
                    <h2 className="text-base md:text-lg font-bold mb-3 md:mb-4">Quick Insights</h2>
                    <p className="text-blue-100 text-xs md:text-sm mb-5 md:mb-6 leading-relaxed">
                        Your content is reaching people! Keep publishing high-quality articles to grow your audience.
                    </p>
                    <div className="space-y-3 md:space-y-4">
                        <div className="bg-white/10 p-3 md:p-4 rounded-xl backdrop-blur-sm border border-white/10">
                            <div className="text-[10px] text-blue-200 uppercase mb-1 font-semibold tracking-wider">Avg. Views per Article</div>
                            <div className="text-lg md:text-xl font-bold">
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
