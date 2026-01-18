import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import FileList from "./pages/Files/FileList";
import CategoryList from "./pages/Categories/CategoryList";
import ArticleList from "./pages/Articles/ArticleList";
import ArticleEditor from "./pages/Articles/ArticleEditor";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename="/edenta/api">
        <Routes>
          <Route path="/auth" element={<Auth />} />

          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />

            <Route path="files" element={<FileList />} />
            <Route path="categories" element={<CategoryList />} />

            <Route path="articles" element={<ArticleList />} />
            <Route path="articles/new" element={<ArticleEditor />} />
            <Route path="articles/:id" element={<ArticleEditor />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;