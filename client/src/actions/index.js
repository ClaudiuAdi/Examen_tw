import { SERVER } from "../config/global";

export const getArticles = (
  filterString,
  page,
  pageSize,
  sortField,
  sortOrder
) => {
  return {
    type: "GET_ARTICLES",
    payload: async () => {
      const response = await fetch(
        `${SERVER}/articles?${filterString}&sortField=${
          sortField || ""
        }&sortOrder=${sortOrder || ""}&page=${page || ""}&limit=${
          pageSize || ""
        }`
      );
      const data = await response.json();
      return data;
    },
  };
};

export const getReferences = (articleId) => {
  return {
    type: "GET_REFERENCES",
    payload: async () => {
      const response = await fetch(
        `${SERVER}/articles/${articleId}/references`
      );
      const data = await response.json();
      return data;
    },
  };
};

export const addArticle = (
  article,
  filterString,
  page,
  pageSize,
  sortField,
  sortOrder
) => {
  return {
    type: "ADD_ARTICLE",
    payload: async () => {
      let response = await fetch(`${SERVER}/articles`, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(article),
      });
      response = await fetch(
        `${SERVER}/articles?${filterString}&sortField=${
          sortField || ""
        }&sortOrder=${sortOrder || ""}&page=${page || ""}&limit=${
          pageSize || ""
        }`
      );
      const data = await response.json();
      return data;
    },
  };
};

export const addReference = (articleId, reference) => {
  return {
    type: "ADD_REFERENCE",
    payload: async () => {
      let response = await fetch(`${SERVER}/articles/${articleId}/references`, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reference),
      });
      response = await fetch(`${SERVER}/articles/${articleId}/references`);
      const data = await response.json();
      return data;
    },
  };
};

export const saveArticle = (
  id,
  article,
  filterString,
  page,
  pageSize,
  sortField,
  sortOrder
) => {
  return {
    type: "SAVE_ARTICLE",
    payload: async () => {
      let response = await fetch(`${SERVER}/articles/${id}`, {
        method: "put",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(article),
      });
      response = await fetch(
        `${SERVER}/articles?${filterString}&sortField=${
          sortField || ""
        }&sortOrder=${sortOrder || ""}&page=${page || ""}&limit=${
          pageSize || ""
        }`
      );
      const data = await response.json();
      return data;
    },
  };
};

export const saveReference = (articleId, referenceId, reference) => {
  return {
    type: "SAVE_REFERENCE",
    payload: async () => {
      let response = await fetch(
        `${SERVER}/articles/${articleId}/references/${referenceId}`,
        {
          method: "put",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(reference),
        }
      );
      response = await fetch(`${SERVER}/articles/${articleId}/references`);
      const data = await response.json();
      return data;
    },
  };
};

export const deleteArticle = (articleId) => {
  return {
    type: "DELETE_ARTICLE",
    payload: async () => {
      let response = await fetch(`${SERVER}/articles/${articleId}`, {
        method: "delete",
      });
      response = await fetch(`${SERVER}/articles`);
      const data = await response.json();
      return data;
    },
  };
};

export const deleteReference = (articleId, referenceId) => {
  return {
    type: "DELETE_REFERENCE",
    payload: async () => {
      let response = await fetch(
        `${SERVER}/articles/${articleId}/references/${referenceId}`,
        {
          method: "delete",
        }
      );
      response = await fetch(`${SERVER}/articles/${articleId}/references`);
      const data = await response.json();
      return data;
    },
  };
};
