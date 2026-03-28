# React + shadcn/ui + Tiptap Migration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the vanilla HTML/CSS/JS blog editor to React + Vite + Tailwind + shadcn/ui + Tiptap while preserving all existing functionality and the Supabase backend.

**Architecture:** Vite-powered React SPA using React Router for hash-based routing, a Supabase context provider for auth state, and Tiptap for rich text editing. shadcn/ui provides the component library styled with Tailwind CSS. The Supabase database schema and migrations remain untouched.

**Tech Stack:** React 18, Vite, Tailwind CSS v4, shadcn/ui, Tiptap, React Router v6, @supabase/supabase-js

---

## File Structure

```
blog/
├── index.html                  # Vite entry point (minimal)
├── package.json                # Dependencies and scripts
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # Tailwind configuration (if needed by shadcn)
├── components.json             # shadcn/ui configuration
├── postcss.config.js           # PostCSS for Tailwind
├── .gitignore                  # Updated with node_modules, dist
├── src/
│   ├── main.jsx                # React entry point, mounts <App />
│   ├── app.jsx                 # Root component with router and auth provider
│   ├── index.css               # Tailwind directives + shadcn base styles
│   ├── lib/
│   │   ├── supabase.js         # Supabase client initialization
│   │   └── utils.js            # shadcn cn() utility
│   ├── contexts/
│   │   └── auth-context.jsx    # Auth provider with session state
│   ├── hooks/
│   │   └── use-entries.js      # Entries CRUD operations
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components (auto-generated)
│   │   ├── layout.jsx          # Top bar (user email, login/logout) + nav
│   │   ├── protected-route.jsx # Redirects to /login if not authenticated
│   │   └── tiptap-editor.jsx   # Tiptap editor with toolbar
│   └── pages/
│       ├── login-page.jsx      # Login/signup form
│       ├── editor-page.jsx     # Entry editor (create + edit)
│       ├── entries-page.jsx    # Public entries list
│       └── view-page.jsx       # Single entry read-only view
├── supabase/                   # Unchanged — existing migrations and config
├── docs/                       # Plans
├── CLAUDE.md                   # Updated for new stack
├── README.md                   # Updated for new stack
└── USAGE.md                    # Unchanged (user-facing behavior is the same)
```

---

### Task 1: Initialize Vite + React Project

**Files:**
- Create: `package.json`, `vite.config.js`, `src/main.jsx`, `src/index.css`, `index.html` (overwrite)
- Remove: `app.js`, `styles.css`, `supabase-client.js` (old vanilla files)

- [ ] **Step 1: Back up old files and initialize Vite project**

From the blog directory, move old vanilla files aside and scaffold Vite:

```bash
# Move old files to a temp backup (we'll reference them, then delete)
mkdir -p .old-vanilla
mv app.js styles.css supabase-client.js .old-vanilla/

# Initialize package.json
npm init -y

# Install core dependencies
npm install react react-dom @supabase/supabase-js react-router-dom
npm install -D vite @vitejs/plugin-react tailwindcss @tailwindcss/vite postcss autoprefixer
```

- [ ] **Step 2: Create vite.config.js**

```js
// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

- [ ] **Step 3: Create src/index.css**

```css
/* src/index.css */
@import "tailwindcss";
```

- [ ] **Step 4: Create src/main.jsx**

```jsx
// src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

function App() {
  return <h1 className="text-2xl font-bold p-8">Blog Editor</h1>;
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

- [ ] **Step 5: Overwrite index.html for Vite**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Blog Editor</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 6: Update .gitignore**

Append to existing `.gitignore`:

```
node_modules/
dist/
.old-vanilla/
```

- [ ] **Step 7: Verify dev server starts**

```bash
npx vite
```

Expected: Dev server starts, browser shows "Blog Editor" heading with Tailwind styling applied.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: initialize Vite + React + Tailwind project"
```

---

### Task 2: Install and Configure shadcn/ui

**Files:**
- Create: `components.json`, `src/lib/utils.js`, `src/components/ui/` (auto-generated)
- Modify: `src/index.css`

- [ ] **Step 1: Initialize shadcn**

```bash
npx shadcn@latest init
```

When prompted, select:
- Style: New York
- Base color: Neutral
- CSS variables: Yes

This creates `components.json` and updates CSS with shadcn theme variables.

- [ ] **Step 2: Install the shadcn components we need**

```bash
npx shadcn@latest add button input card form label separator
```

- [ ] **Step 3: Verify utils.js was created**

Check that `src/lib/utils.js` exists with the `cn()` utility:

```js
// src/lib/utils.js — should contain something like:
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 4: Verify by importing a Button**

Update `src/main.jsx` temporarily:

```jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Button } from "@/components/ui/button";
import "./index.css";

function App() {
  return (
    <div className="p-8">
      <Button>Test Button</Button>
    </div>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

Expected: Styled shadcn button renders correctly.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: configure shadcn/ui with button, input, card, form, label components"
```

---

### Task 3: Supabase Client + Auth Context

**Files:**
- Create: `src/lib/supabase.js`, `src/contexts/auth-context.jsx`

- [ ] **Step 1: Create Supabase client module**

```js
// src/lib/supabase.js
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://zmplxklzsjkuipttflnd.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_FQ4zyYzEFnEc51EtTx_S2w_k2iKIOlY";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

- [ ] **Step 2: Create auth context provider**

```jsx
// src/contexts/auth-context.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    /* Check for existing session on mount */
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    /* Listen for auth state changes */
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email, password) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
```

- [ ] **Step 3: Verify context loads without errors**

Update `src/main.jsx`:

```jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import "./index.css";

function Status() {
  const { user, loading } = useAuth();
  if (loading) return <p className="p-8">Loading...</p>;
  return <p className="p-8">{user ? `Logged in as ${user.email}` : "Not logged in"}</p>;
}

function App() {
  return (
    <AuthProvider>
      <Status />
    </AuthProvider>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

Expected: Shows "Not logged in" (or the user email if a session exists).

- [ ] **Step 4: Commit**

```bash
git add src/lib/supabase.js src/contexts/auth-context.jsx src/main.jsx
git commit -m "feat: add Supabase client and auth context provider"
```

---

### Task 4: Entries CRUD Hook

**Files:**
- Create: `src/hooks/use-entries.js`

- [ ] **Step 1: Create the entries hook**

```js
// src/hooks/use-entries.js
import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

/* Fetch all entries (public — no auth required) */
export function useEntries() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("entries")
      .select("id, title, published_at, user_id")
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setEntries(data);
    }

    setLoading(false);
  }, []);

  return { entries, loading, error, fetchEntries };
}

/* Fetch a single entry by ID */
export async function fetchEntry(id) {
  const { data, error } = await supabase
    .from("entries")
    .select("*")
    .eq("id", id)
    .single();

  return { entry: data, error };
}

/* Create a new entry */
export async function createEntry({ title, content }) {
  const { error } = await supabase
    .from("entries")
    .insert({ title, content });

  return { error };
}

/* Update an existing entry */
export async function updateEntry(id, { title, content }) {
  const { error } = await supabase
    .from("entries")
    .update({ title, content })
    .eq("id", id);

  return { error };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/use-entries.js
git commit -m "feat: add entries CRUD hook and helper functions"
```

---

### Task 5: Router + Layout Component

**Files:**
- Create: `src/app.jsx`, `src/components/layout.jsx`, `src/components/protected-route.jsx`
- Modify: `src/main.jsx`

- [ ] **Step 1: Create the layout component**

```jsx
// src/components/layout.jsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

export function Layout({ children }) {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await signOut();
    navigate("/entries");
  };

  return (
    <main className="mx-auto w-full max-w-[960px] px-6 py-6">
      {/* User bar */}
      <div className="mb-2 flex items-center justify-end gap-3 text-sm text-muted-foreground">
        {user ? (
          <>
            <span>{user.email}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Log out
            </Button>
          </>
        ) : (
          <Button variant="outline" size="sm" onClick={() => navigate("/login")}>
            Log in
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="mb-4 flex gap-2">
        <Link to="/entries">
          <Button
            variant={isActive("/entries") ? "default" : "outline"}
            size="sm"
          >
            Entries
          </Button>
        </Link>
        {user && (
          <Link to="/editor">
            <Button
              variant={isActive("/editor") ? "default" : "outline"}
              size="sm"
            >
              Editor
            </Button>
          </Link>
        )}
      </nav>

      {children}
    </main>
  );
}
```

- [ ] **Step 2: Create the protected route component**

```jsx
// src/components/protected-route.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  return children;
}
```

- [ ] **Step 3: Create the app component with routes**

```jsx
// src/app.jsx
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/auth-context";
import { Layout } from "@/components/layout";
import { ProtectedRoute } from "@/components/protected-route";
import { LoginPage } from "@/pages/login-page";
import { EntriesPage } from "@/pages/entries-page";
import { EditorPage } from "@/pages/editor-page";
import { ViewPage } from "@/pages/view-page";

export function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/entries" replace />} />
            <Route path="/entries" element={<EntriesPage />} />
            <Route path="/view/:id" element={<ViewPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/editor"
              element={
                <ProtectedRoute>
                  <EditorPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/editor/:id"
              element={
                <ProtectedRoute>
                  <EditorPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Layout>
      </HashRouter>
    </AuthProvider>
  );
}
```

- [ ] **Step 4: Update main.jsx to use App**

```jsx
// src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@/app";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

- [ ] **Step 5: Create placeholder page components**

Create all four page files with placeholder content so the router doesn't error:

```jsx
// src/pages/login-page.jsx
export function LoginPage() {
  return <div className="p-8 text-center text-muted-foreground">Login page</div>;
}
```

```jsx
// src/pages/entries-page.jsx
export function EntriesPage() {
  return <div className="p-8 text-center text-muted-foreground">Entries page</div>;
}
```

```jsx
// src/pages/editor-page.jsx
export function EditorPage() {
  return <div className="p-8 text-center text-muted-foreground">Editor page</div>;
}
```

```jsx
// src/pages/view-page.jsx
export function ViewPage() {
  return <div className="p-8 text-center text-muted-foreground">View page</div>;
}
```

- [ ] **Step 6: Verify routing works**

```bash
npx vite
```

Expected: Default route redirects to `/entries`. Nav links work. Editor link only shows when logged in. Login/Logout buttons render correctly.

- [ ] **Step 7: Commit**

```bash
git add src/app.jsx src/main.jsx src/components/layout.jsx src/components/protected-route.jsx src/pages/
git commit -m "feat: add React Router with layout, protected routes, and placeholder pages"
```

---

### Task 6: Login Page

**Files:**
- Modify: `src/pages/login-page.jsx`

- [ ] **Step 1: Build the login page**

```jsx
// src/pages/login-page.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";

export function LoginPage() {
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  /* Redirect if already logged in */
  if (user) {
    navigate("/entries", { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const { error: authError } = isSignUp
      ? await signUp(email, password)
      : await signIn(email, password);

    if (authError) {
      setError(authError.message);
      return;
    }

    if (isSignUp) {
      setError("Check your email to confirm your account.");
      return;
    }

    navigate("/entries");
  };

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle>{isSignUp ? "Sign up" : "Log in"}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* TODO: Remove before deploy — temporary dev credentials */}
        <div className="mb-4 rounded-md border border-yellow-300 bg-yellow-50 p-3 text-sm text-muted-foreground">
          <strong>Demo login:</strong>
          <br />
          Email: jkhloomis@icloud.com
          <br />
          Password: ABCD1234
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              minLength={6}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" className="w-full">
            {isSignUp ? "Sign up" : "Log in"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              className="underline hover:text-foreground"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError("");
              }}
            >
              {isSignUp ? "Log in" : "Sign up"}
            </button>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Verify login works**

```bash
npx vite
```

Navigate to `#/login`. Test:
1. Login form renders with shadcn styling
2. Demo credentials box shows
3. Logging in with valid credentials redirects to entries
4. Invalid credentials show error message
5. Toggle between login/signup modes

- [ ] **Step 3: Commit**

```bash
git add src/pages/login-page.jsx
git commit -m "feat: implement login page with shadcn/ui components"
```

---

### Task 7: Entries Page

**Files:**
- Modify: `src/pages/entries-page.jsx`

- [ ] **Step 1: Build the entries list page**

```jsx
// src/pages/entries-page.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/auth-context";
import { useEntries } from "@/hooks/use-entries";

export function EntriesPage() {
  const { user } = useAuth();
  const { entries, loading, error, fetchEntries } = useEntries();
  const navigate = useNavigate();

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Entries</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {loading && (
          <p className="p-6 text-center text-sm text-muted-foreground">
            Loading...
          </p>
        )}

        {error && (
          <p className="p-6 text-center text-sm text-destructive">
            Error loading entries.
          </p>
        )}

        {!loading && !error && entries.length === 0 && (
          <p className="p-6 text-center text-sm text-muted-foreground">
            No entries yet.
          </p>
        )}

        {!loading && !error && entries.length > 0 && (
          <ul>
            {entries.map((entry, index) => (
              <li key={entry.id}>
                {index > 0 && <Separator />}
                <div className="flex items-center justify-between gap-3 px-6 py-3">
                  <span className="whitespace-nowrap text-sm text-muted-foreground">
                    {entry.published_at}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm">
                    {entry.title || "Untitled"}
                  </span>
                  <div className="flex shrink-0 gap-2">
                    {user && user.id === entry.user_id && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/editor/${entry.id}`)}
                      >
                        Edit
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/view/${entry.id}`)}
                    >
                      View
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Verify entries load**

Expected: Entries list renders with shadcn Card styling. Edit button only shows for the owner. View button always shows. Empty state works.

- [ ] **Step 3: Commit**

```bash
git add src/pages/entries-page.jsx
git commit -m "feat: implement entries list page with public read access"
```

---

### Task 8: View Page

**Files:**
- Modify: `src/pages/view-page.jsx`

- [ ] **Step 1: Build the entry view page**

```jsx
// src/pages/view-page.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchEntry } from "@/hooks/use-entries";

export function ViewPage() {
  const { id } = useParams();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchEntry(id).then(({ entry: data, error: fetchError }) => {
      if (fetchError) {
        setError(fetchError.message);
      } else {
        setEntry(data);
      }
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-sm text-muted-foreground">
          Loading...
        </CardContent>
      </Card>
    );
  }

  if (error || !entry) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-sm text-muted-foreground">
          Entry not found.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">
          {entry.title || "Untitled"}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{entry.published_at}</p>
      </CardHeader>
      <CardContent>
        <div
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: entry.content }}
        />
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Verify entry view works**

Navigate to an entry via the entries list View button. Expected: Title, date, and HTML content render correctly inside a shadcn Card.

- [ ] **Step 3: Commit**

```bash
git add src/pages/view-page.jsx
git commit -m "feat: implement single entry view page"
```

---

### Task 9: Tiptap Editor Component

**Files:**
- Create: `src/components/tiptap-editor.jsx`

- [ ] **Step 1: Install Tiptap dependencies**

```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-underline @tiptap/pm
```

- [ ] **Step 2: Create the Tiptap editor component**

```jsx
// src/components/tiptap-editor.jsx
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

/* Single toolbar button — highlights when the associated mark/node is active */
function ToolbarButton({ editor, action, isActive, label }) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={cn("h-8 px-2 text-xs", isActive && "bg-accent")}
      onClick={action}
    >
      {label}
    </Button>
  );
}

/* Format toolbar for the Tiptap editor */
function Toolbar({ editor }) {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap gap-1 border-b bg-muted/50 p-2">
      <ToolbarButton
        editor={editor}
        label={<span className="font-bold">B</span>}
        isActive={editor.isActive("bold")}
        action={() => editor.chain().focus().toggleBold().run()}
      />
      <ToolbarButton
        editor={editor}
        label={<span className="italic">I</span>}
        isActive={editor.isActive("italic")}
        action={() => editor.chain().focus().toggleItalic().run()}
      />
      <ToolbarButton
        editor={editor}
        label={<span className="underline">U</span>}
        isActive={editor.isActive("underline")}
        action={() => editor.chain().focus().toggleUnderline().run()}
      />
      <Separator orientation="vertical" className="mx-1 h-8" />
      <ToolbarButton
        editor={editor}
        label="Heading"
        isActive={editor.isActive("heading", { level: 2 })}
        action={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      />
      <ToolbarButton
        editor={editor}
        label="Paragraph"
        isActive={editor.isActive("paragraph") && !editor.isActive("heading")}
        action={() => editor.chain().focus().setParagraph().run()}
      />
      <ToolbarButton
        editor={editor}
        label="Bullet List"
        isActive={editor.isActive("bulletList")}
        action={() => editor.chain().focus().toggleBulletList().run()}
      />
    </div>
  );
}

export function TiptapEditor({ content, onUpdate }) {
  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: content || "",
    onUpdate: ({ editor: e }) => {
      onUpdate(e.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[520px] p-4 focus:outline-none",
      },
    },
  });

  return (
    <div className="overflow-hidden rounded-b-lg border-t-0">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
```

- [ ] **Step 3: Verify editor renders**

Temporarily render `<TiptapEditor content="<p>Hello</p>" onUpdate={console.log} />` in any page. Expected: Editor renders with toolbar, typing updates content, toolbar buttons toggle formatting.

- [ ] **Step 4: Commit**

```bash
git add src/components/tiptap-editor.jsx
git commit -m "feat: add Tiptap rich text editor component with toolbar"
```

---

### Task 10: Editor Page

**Files:**
- Modify: `src/pages/editor-page.jsx`

- [ ] **Step 1: Build the editor page**

```jsx
// src/pages/editor-page.jsx
import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TiptapEditor } from "@/components/tiptap-editor";
import { fetchEntry, createEntry, updateEntry } from "@/hooks/use-entries";

export function EditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [initialContent, setInitialContent] = useState("");
  const [loading, setLoading] = useState(!!id);
  const isEditing = !!id;

  /* Load existing entry when editing */
  useEffect(() => {
    if (!id) return;

    setLoading(true);
    fetchEntry(id).then(({ entry, error }) => {
      if (error || !entry) {
        navigate("/entries", { replace: true });
        return;
      }
      setTitle(entry.title || "");
      setContent(entry.content || "");
      setInitialContent(entry.content || "");
      setLoading(false);
    });
  }, [id, navigate]);

  const handleSubmit = async () => {
    if (!content.trim()) return;

    const payload = { title: title.trim(), content };

    const { error } = isEditing
      ? await updateEntry(id, payload)
      : await createEntry(payload);

    if (error) {
      console.error("Save failed:", error.message);
      return;
    }

    navigate("/entries");
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-sm text-muted-foreground">
          Loading...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Entry" : "New Entry"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-0 p-0">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Entry title..."
          className="rounded-none border-x-0 border-t-0 text-lg font-semibold shadow-none focus-visible:ring-0"
        />
        <TiptapEditor
          content={isEditing ? initialContent : ""}
          onUpdate={setContent}
        />
        <div className="flex justify-end border-t bg-muted/50 p-3">
          <Button onClick={handleSubmit}>
            {isEditing ? "Update" : "Publish"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Verify editor page works end-to-end**

Test:
1. Navigate to `/editor` — empty editor with "Publish" button
2. Enter a title and content, click Publish — redirects to entries, new entry appears
3. Click Edit on an entry — editor loads with existing content, button says "Update"
4. Update and save — changes persist

- [ ] **Step 3: Commit**

```bash
git add src/pages/editor-page.jsx
git commit -m "feat: implement editor page with Tiptap and create/update support"
```

---

### Task 11: Clean Up Old Files + Update Docs

**Files:**
- Remove: `.old-vanilla/` directory
- Modify: `CLAUDE.md`, `README.md`

- [ ] **Step 1: Remove old vanilla backup**

```bash
rm -rf .old-vanilla
```

- [ ] **Step 2: Update CLAUDE.md**

Replace the Key Files and Project Overview sections to reflect the new React stack. Keep the Documentation Policy and Supabase sections unchanged.

Key changes:
- Project overview: React + Vite + Tailwind + shadcn/ui + Tiptap
- Key files: `src/` directory structure
- Add note about `npm run dev` for development

- [ ] **Step 3: Update README.md**

Update:
- Tech Stack: React 18, Vite, Tailwind CSS, shadcn/ui, Tiptap, Supabase
- Architecture: component-based with file structure
- Setup: now includes `npm install` and `npm run dev`
- Remove "no build step" language
- Database section stays the same

- [ ] **Step 4: Final verification**

```bash
npm run dev
```

Walk through all routes:
1. `/entries` — public list loads
2. `/view/:id` — entry renders
3. `/login` — form works, login succeeds
4. `/editor` — protected, editor renders with Tiptap
5. `/editor/:id` — loads existing entry
6. Publish and Update both work
7. Logout returns to entries, editor nav link hides

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: clean up old vanilla files and update documentation for React stack"
```

---

## Summary

| Task | Description | Dependencies |
|------|-------------|-------------|
| 1 | Vite + React + Tailwind init | None |
| 2 | shadcn/ui setup | Task 1 |
| 3 | Supabase client + Auth context | Task 1 |
| 4 | Entries CRUD hook | Task 3 |
| 5 | Router + Layout | Tasks 2, 3 |
| 6 | Login page | Task 5 |
| 7 | Entries page | Tasks 4, 5 |
| 8 | View page | Tasks 4, 5 |
| 9 | Tiptap editor component | Task 2 |
| 10 | Editor page | Tasks 4, 5, 9 |
| 11 | Cleanup + docs | Task 10 |
