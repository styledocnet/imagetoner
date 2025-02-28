import axios from "axios";

// const api = axios.create({
//   baseURL: "http://localhost:8080/api",
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

const API_BASE_URL = "http://localhost:8000";

const apiService = {
  applyFilter: async (
    file: File,
    filter: string,
    params: Record<string, any>,
  ) => {
    const formData = new FormData();
    formData.append("file", file);

    Object.keys(params).forEach((key) => {
      formData.append(key, params[key]);
    });

    const response = await axios.post(
      `${API_BASE_URL}/filter/${filter}/`,
      formData,
      {
        responseType: "blob",
      },
    );

    return URL.createObjectURL(response.data);
  },

  removeBackground: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(`${API_BASE_URL}/removebg/`, formData, {
      responseType: "blob",
      headers: {
        Accept: `image/png`,
      },
    });

    if (response.status !== 200) {
      throw new Error("Failed to remove background");
    }

    return URL.createObjectURL(response.data);
  },

  generatePreview: async (file: File, width: number, height: number) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("width", width.toString());
    formData.append("height", height.toString());

    const response = await axios.post(`${API_BASE_URL}/preview/`, formData, {
      responseType: "blob",
    });

    return URL.createObjectURL(response.data);
  },

  cropImage: async (
    file: File,
    left: number,
    top: number,
    right: number,
    bottom: number,
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("left", left.toString());
    formData.append("top", top.toString());
    formData.append("right", right.toString());
    formData.append("bottom", bottom.toString());

    const response = await axios.post(`${API_BASE_URL}/crop/`, formData, {
      responseType: "blob",
    });

    return URL.createObjectURL(response.data);
  },

  upscaleImage: async (file: File, scaleFactor: number) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("scale_factor", scaleFactor.toString());

    const response = await axios.post(`${API_BASE_URL}/upscale/`, formData, {
      responseType: "blob",
    });

    return URL.createObjectURL(response.data);
  },
};

export default apiService;
