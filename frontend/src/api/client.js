const API_URL= import.meta.env.VITE_API_URL || "http://localhost:4242";

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("access_token");
  const headers = new Headers(options.headers || {});

  if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  const reponse = await fetch(`${API_URL}${path}`, {...options, headers,});
  let data = null;
  const cType = reponse.headers.get("content-type");

  if (cType?.includes("application/json")) {
    data = await reponse.json();
  }
  if (!reponse.ok) {
    const msg = Array.isArray(data?.message) ? data.message.join(", ") : data?.message || `Erreur HTTP ${reponse.status}`;
    throw new Error(msg);
  }
  return data;
}

