import { Card } from "../components/MyUtilities";

export default function Dashboard() {
    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-l-4 border-pink-500">
                    <div className="text-sm font-medium text-gray-500 mb-1">Total Articles</div>
                    <div className="text-3xl font-bold text-gray-900">12</div>
                </Card>
                <Card className="border-l-4 border-emerald-500">
                    <div className="text-sm font-medium text-gray-500 mb-1">Categories</div>
                    <div className="text-3xl font-bold text-gray-900">4</div>
                </Card>
                <Card className="border-l-4 border-blue-500">
                    <div className="text-sm font-medium text-gray-500 mb-1">Files Uploaded</div>
                    <div className="text-3xl font-bold text-gray-900">128</div>
                </Card>
            </div>
        </div>
    );
}
