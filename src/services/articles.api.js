import apiClient from "../apiClient";

export const getArticles = async (params = {}) => {
    return apiClient.get("/article", { params });
};

export const getArticleById = async (id) => {
    return apiClient.get(`/article/${id}`);
};

export const createArticle = async (data) => {
    return apiClient.post("/article", data);
};

export const updateArticle = async (id, data) => {
    return apiClient.put(`/article/${id}`, data);
};

export const deleteArticle = async (id) => {
    return apiClient.delete(`/article/${id}`);
};
