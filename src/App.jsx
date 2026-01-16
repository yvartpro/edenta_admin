import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import FileList from "./pages/Files/FileList";
import CategoryList from "./pages/Categories/CategoryList";
import ArticleList from "./pages/Articles/ArticleList";
import ArticleEditor from "./pages/Articles/ArticleEditor";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />

          <Route path="files" element={<FileList />} />
          <Route path="categories" element={<CategoryList />} />

          <Route path="articles" element={<ArticleList />} />
          <Route path="articles/new" element={<ArticleEditor />} />
          <Route path="articles/:id" element={<ArticleEditor />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;