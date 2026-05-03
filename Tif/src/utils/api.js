const API = "http://localhost:5000/api";

export const getToken = () => localStorage.getItem("token");

export const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: getToken(),
});

export const api = {
  // Auth
  login: (data) => fetch(`${API}/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
  register: (data) => fetch(`${API}/auth/register`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
  getProfile: () => fetch(`${API}/auth/profile`, { headers: authHeaders() }).then(r => r.json()),
  updateProfile: (data) => fetch(`${API}/auth/profile`, { method: "PUT", headers: authHeaders(), body: JSON.stringify(data) }).then(r => r.json()),
  getLeaderboard: () => fetch(`${API}/auth/leaderboard`).then(r => r.json()),
  getChefProfile: (id) => fetch(`${API}/auth/chef/${id}`).then(r => r.json()),
  verifyKitchen: (data) => fetch(`${API}/auth/verify-kitchen`, { method: "POST", headers: authHeaders(), body: JSON.stringify(data) }).then(r => r.json()),
  approveKitchen: (id) => fetch(`${API}/auth/approve-kitchen/${id}`, { method: "POST" }).then(r => r.json()),
  
  // Meals
  getMeals: (params = "") => fetch(`${API}/meals${params ? "?" + params : ""}`).then(r => r.json()),
  getMeal: (id) => fetch(`${API}/meals/${id}`).then(r => r.json()),
  postMeal: (data) => fetch(`${API}/meals`, { method: "POST", headers: authHeaders(), body: JSON.stringify(data) }).then(r => r.json()),
  claimMeal: (id) => fetch(`${API}/meals/${id}/claim`, { method: "POST", headers: authHeaders() }).then(r => r.json()),
  reviewMeal: (id, data) => fetch(`${API}/meals/${id}/review`, { method: "POST", headers: authHeaders(), body: JSON.stringify(data) }).then(r => r.json()),
  getMyPosts: () => fetch(`${API}/meals/my-posts`, { headers: authHeaders() }).then(r => r.json()),
  getMyClaims: () => fetch(`${API}/meals/my-claims`, { headers: authHeaders() }).then(r => r.json()),
  getStories: () => fetch(`${API}/meals/stories`).then(r => r.json()),
  getDemand: (location = "") => fetch(`${API}/meals/demand?location=${location}`).then(r => r.json()),
  
  // Swap
  acceptSwap: (id, data) => fetch(`${API}/meals/${id}/swap`, { method: "POST", headers: authHeaders(), body: JSON.stringify(data) }).then(r => r.json()),
  
  // Pre-order
  preOrder: (id) => fetch(`${API}/meals/${id}/preorder`, { method: "POST", headers: authHeaders() }).then(r => r.json()),
  
  // Gift
  giftMeal: (id, data) => fetch(`${API}/meals/${id}/gift`, { method: "POST", headers: authHeaders(), body: JSON.stringify(data) }).then(r => r.json()),
  redeemGift: (token) => fetch(`${API}/meals/gift/redeem/${token}`, { method: "POST", headers: authHeaders() }).then(r => r.json()),
  
  // Cook-Along
  addCookAlongUpdate: (id, data) => fetch(`${API}/meals/${id}/cookalong`, { method: "POST", headers: authHeaders(), body: JSON.stringify(data) }).then(r => r.json()),
  reactCookAlong: (id, data) => fetch(`${API}/meals/${id}/cookalong/react`, { method: "POST", headers: authHeaders(), body: JSON.stringify(data) }).then(r => r.json()),
  
  // Neighborhoods
  getNeighborhoods: () => fetch(`${API}/neighborhoods`).then(r => r.json()),
  joinNeighborhood: (data) => fetch(`${API}/neighborhoods/join`, { method: "POST", headers: authHeaders(), body: JSON.stringify(data) }).then(r => r.json()),
  getNeighborhood: (name) => fetch(`${API}/neighborhoods/${name}`).then(r => r.json()),
  sendChat: (name, data) => fetch(`${API}/neighborhoods/${name}/chat`, { method: "POST", headers: authHeaders(), body: JSON.stringify(data) }).then(r => r.json()),
  
  // Subscriptions
  subscribe: (data) => fetch(`${API}/subscriptions`, { method: "POST", headers: authHeaders(), body: JSON.stringify(data) }).then(r => r.json()),
  getMySubscriptions: () => fetch(`${API}/subscriptions/my`, { headers: authHeaders() }).then(r => r.json()),
  getMySubscribers: () => fetch(`${API}/subscriptions/subscribers`, { headers: authHeaders() }).then(r => r.json()),
  cancelSubscription: (id) => fetch(`${API}/subscriptions/${id}/cancel`, { method: "POST", headers: authHeaders() }).then(r => r.json()),
  getChefPlans: (chefId) => fetch(`${API}/subscriptions/chef/${chefId}`).then(r => r.json()),
};
