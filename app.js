/* ---- DOM refs ---- */
const authForm = document.querySelector("#auth-form");
const authEmail = document.querySelector("#auth-email");
const authPassword = document.querySelector("#auth-password");
const authError = document.querySelector("#auth-error");
const authTitle = document.querySelector("#auth-title");
const authSubmit = document.querySelector("#auth-submit");
const authToggleText = document.querySelector("#auth-toggle-text");
const authToggleLink = document.querySelector("#auth-toggle-link");

const userEmailEl = document.querySelector("#user-email");
const loginBtn = document.querySelector("#login-btn");
const logoutBtn = document.querySelector("#logout-btn");
const navEditor = document.querySelector("#nav-editor");

const editor = document.querySelector("#editor");
const titleInput = document.querySelector("#title-input");
const submitBtn = document.querySelector("#submit-entry");
const formatButtons = document.querySelectorAll(".format-toolbar button");
const navLinks = document.querySelectorAll(".nav a");
const routes = document.querySelectorAll(".route");
const entriesContainer = document.querySelector("#entries-container");
const viewContainer = document.querySelector("#view-container");

/* ---- State ---- */
let editingId = null;
let isSignUp = false;
let currentUser = null;

/* ---- Auth UI ---- */

function setAuthMode(signUp) {
  isSignUp = signUp;
  authTitle.textContent = signUp ? "Sign up" : "Log in";
  authSubmit.textContent = signUp ? "Sign up" : "Log in";
  authToggleText.textContent = signUp ? "Already have an account?" : "Don't have an account?";
  authToggleLink.textContent = signUp ? "Log in" : "Sign up";
  hideAuthError();
}

function showAuthError(message) {
  authError.textContent = message;
  authError.classList.add("is-visible");
}

function hideAuthError() {
  authError.textContent = "";
  authError.classList.remove("is-visible");
}

authToggleLink.addEventListener("click", () => setAuthMode(!isSignUp));

authForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  hideAuthError();

  const email = authEmail.value.trim();
  const password = authPassword.value;

  const { error } = isSignUp
    ? await db.auth.signUp({ email, password })
    : await db.auth.signInWithPassword({ email, password });

  if (error) {
    showAuthError(error.message);
    return;
  }

  if (isSignUp) {
    showAuthError("Check your email to confirm your account.");
  }
});

/* Navigate to login screen */
loginBtn.addEventListener("click", () => {
  location.hash = "#/login";
});

logoutBtn.addEventListener("click", async () => {
  await db.auth.signOut();
});

/* ---- Auth state listener ---- */

/* Update UI based on whether user is logged in */
function handleAuthChange(session) {
  currentUser = session ? session.user : null;

  if (currentUser) {
    userEmailEl.textContent = currentUser.email;
    loginBtn.hidden = true;
    logoutBtn.hidden = false;
    navEditor.hidden = false;

    /* If on the login screen, redirect to entries */
    if (parseHash().route === "login") {
      location.hash = "#/entries";
    }
  } else {
    userEmailEl.textContent = "";
    loginBtn.hidden = false;
    logoutBtn.hidden = true;
    navEditor.hidden = true;

    /* If on a protected route, redirect to entries */
    if (parseHash().route === "editor") {
      location.hash = "#/entries";
    }
  }

  navigate();
}

db.auth.onAuthStateChange((_event, session) => {
  handleAuthChange(session);
});

db.auth.getSession().then(({ data: { session } }) => {
  handleAuthChange(session);
});

/* ---- Router ---- */

function parseHash() {
  const parts = location.hash.replace("#/", "").split("/");
  return { route: parts[0] || "entries", param: parts[1] };
}

function navigate() {
  const { route, param } = parseHash();

  /* Redirect away from protected routes if not logged in */
  if (route === "editor" && !currentUser) {
    location.hash = "#/login";
    return;
  }

  routes.forEach((r) => {
    r.classList.toggle("is-active", r.id === `route-${route}`);
  });

  navLinks.forEach((link) => {
    link.classList.toggle("is-active", link.dataset.route === route);
  });

  if (route === "entries") {
    renderEntries();
  }

  if (route === "view" && param) {
    renderView(param);
  }

  if (route === "editor" && param) {
    loadEntryForEdit(param);
  } else if (route === "editor") {
    editingId = null;
    titleInput.value = "";
    editor.innerHTML = "";
    submitBtn.textContent = "Publish";
  }
}

window.addEventListener("hashchange", navigate);

/* ---- Entries list ---- */

async function renderEntries() {
  const { data: entries, error } = await db
    .from("entries")
    .select("id, title, published_at, user_id")
    .order("created_at", { ascending: false });

  if (error) {
    entriesContainer.innerHTML = '<p class="empty-state">Error loading entries.</p>';
    return;
  }

  if (entries.length === 0) {
    entriesContainer.innerHTML = '<p class="empty-state">No entries yet.</p>';
    return;
  }

  const items = entries
    .map((entry) => {
      const title = entry.title || "Untitled";

      /* Only show Edit button if the logged-in user owns this entry */
      const isOwner = currentUser && currentUser.id === entry.user_id;
      const editBtn = isOwner
        ? `<button type="button" data-edit="${entry.id}">Edit</button>`
        : "";

      return `<li class="entry-item">
        <span class="entry-date">${entry.published_at}</span>
        <span class="entry-preview">${title}</span>
        <span class="entry-actions">
          ${editBtn}
          <button type="button" data-view="${entry.id}">View</button>
        </span>
      </li>`;
    })
    .join("");

  entriesContainer.innerHTML = `<ul class="entries-list">${items}</ul>`;
}

entriesContainer.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  if (btn.dataset.edit) {
    location.hash = `#/editor/${btn.dataset.edit}`;
  }
  if (btn.dataset.view) {
    location.hash = `#/view/${btn.dataset.view}`;
  }
});

/* ---- Single entry view ---- */

async function renderView(id) {
  const { data: entry, error } = await db
    .from("entries")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !entry) {
    viewContainer.innerHTML = '<p class="empty-state">Entry not found.</p>';
    return;
  }

  viewContainer.innerHTML = `
    <div class="entry-view">
      <h2 class="entry-view-title">${entry.title || "Untitled"}</h2>
      <p class="entry-view-date">${entry.published_at}</p>
      <div>${entry.content}</div>
    </div>`;
}

/* ---- Edit existing entry ---- */

async function loadEntryForEdit(id) {
  const { data: entry, error } = await db
    .from("entries")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !entry) return;

  editingId = id;
  titleInput.value = entry.title || "";
  editor.innerHTML = entry.content;
  submitBtn.textContent = "Update";
}

/* ---- Format toolbar ---- */

formatButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const { command, value } = button.dataset;

    editor.focus();
    document.execCommand(command, false, value || null);
  });
});

/* ---- Publish / Update ---- */

submitBtn.addEventListener("click", async () => {
  const title = titleInput.value.trim();
  const content = editor.innerHTML.trim();

  if (!content) return;

  if (editingId) {
    const { error } = await db
      .from("entries")
      .update({ title, content })
      .eq("id", editingId);

    if (error) {
      console.error("Update failed:", error.message);
      return;
    }
  } else {
    const { error } = await db
      .from("entries")
      .insert({ title, content });

    if (error) {
      console.error("Insert failed:", error.message);
      return;
    }
  }

  editingId = null;
  titleInput.value = "";
  editor.innerHTML = "";
  submitBtn.textContent = "Publish";
  location.hash = "#/entries";
});

/* Boot — navigate to current hash (defaults to entries) */
navigate();
