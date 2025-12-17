import api from "./api";

export async function loginUser(username: string, password: string) {
  try {
    const response = await api.post("/api/auth/login", {
      username,
      password,
    });
    return { data: response.data };
  } catch (error: any) {
    return {
      error: error.response?.data || { message: "Login failed" },
    };
  }
}
