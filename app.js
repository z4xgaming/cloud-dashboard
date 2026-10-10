// ========== API URL (yahan apna tunnel URL daalo) ==========
const API = "https://acc-clock-coal-jaguar.trycloudflare.com";

const $ = (id) => document.getElementById(id);
let token = localStorage.getItem("token");

if (token) showApp();

function showApp() {
  $("auth-box").classList.add("hidden");
  $("app-box").classList.remove("hidden");
  fetch(`${API}/auth/me`, { headers: authHeaders() })
    .then(r => r.json())
    .then(u => $("who").textContent = `👤 ${u.username}`)
    .catch(logout);
  loadNotes();
}

function authHeaders() {
  return { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" };
}

async function register() {
  const body = {
    username: $("username").value,
    email: $("email").value,
    password: $("password").value,
  };
  const r = await fetch(`${API}/auth/register`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const d = await r.json();
  if (!r.ok) return $("auth-msg").textContent = d.detail || "Error";
  token = d.token; localStorage.setItem("token", token); showApp();
}

async function login() {
  const body = { username: $("username").value, password: $("password").value };
  const r = await fetch(`${API}/auth/login`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const d = await r.json();
  if (!r.ok) return $("auth-msg").textContent = d.detail || "Error";
  token = d.token; localStorage.setItem("token", token); showApp();
}

function logout() {
  localStorage.removeItem("token");
  location.reload();
}

async function loadNotes() {
  const r = await fetch(`${API}/api/notes`, { headers: authHeaders() });
  if (!r.ok) return logout();
  const notes = await r.json();
  $("notes").innerHTML = notes.map(n => `
    <li>
      <div><strong>${escapeHtml(n.title)}</strong><br>${escapeHtml(n.content)}</div>
      <button onclick="delNote(${n.id})">x</button>
    </li>`).join("");
}

async function addNote() {
  const body = {
    title: $("note-title").value || "Untitled",
    content: $("note-content").value,
  };
  await fetch(`${API}/api/notes`, {
    method: "POST", headers: authHeaders(), body: JSON.stringify(body),
  });
  $("note-title").value = ""; $("note-content").value = "";
  loadNotes();
}

async function delNote(id) {
  await fetch(`${API}/api/notes/${id}`, { method: "DELETE", headers: authHeaders() });
  loadNotes();
}

function escapeHtml(s) {
  return (s || "").replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
