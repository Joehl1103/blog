const blogPosts = [
  {
    slug: "designing-for-clarity",
    title: "Designing for clarity before adding complexity",
    category: "Writing Systems",
    description:
      "A practical essay about choosing structure early so a blog can grow without feeling scattered.",
    date: "2026-03-12",
    readTime: "6 min read",
    featuredNote:
      "A good homepage does two jobs at once: it introduces your voice and helps people find the next thing to read."
  },
  {
    slug: "shipping-before-perfect",
    title: "Shipping before perfect still needs a shape",
    category: "Process",
    description:
      "Fast publishing works better when your default layout, CTA, and article anatomy are already decided.",
    date: "2026-03-02",
    readTime: "4 min read"
  },
  {
    slug: "case-study-notes",
    title: "How to turn project notes into better case studies",
    category: "Projects",
    description:
      "A simple method for capturing goals, constraints, decisions, and results while a project is still fresh.",
    date: "2026-02-18",
    readTime: "5 min read"
  }
];

/**
 * Convert an ISO date string into a friendlier editorial date.
 */
function formatPostDate(isoDate) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(new Date(`${isoDate}T12:00:00`));
}

/**
 * Build the markup for the featured post block on the homepage.
 */
function createFeaturedPostMarkup(post) {
  return `
    <div class="featured-content">
      <span class="post-badge">${post.category}</span>
      <h3><a href="./posts/${post.slug}.html">${post.title}</a></h3>
      <p class="featured-description">${post.description}</p>
      <p class="post-meta">${formatPostDate(post.date)} · ${post.readTime}</p>
      <a class="button button-primary featured-cta" href="./posts/${post.slug}.html">Read article</a>
    </div>
    <aside class="featured-side-note">
      <p class="eyebrow">Why this matters</p>
      <p>${post.featuredNote}</p>
    </aside>
  `;
}

/**
 * Build the markup for one post card in the latest-posts grid.
 */
function createPostCardMarkup(post) {
  return `
    <article class="post-card">
      <span class="post-badge">${post.category}</span>
      <h3><a href="./posts/${post.slug}.html">${post.title}</a></h3>
      <p class="post-excerpt">${post.description}</p>
      <p class="post-meta">${formatPostDate(post.date)} · ${post.readTime}</p>
      <a class="post-link" href="./posts/${post.slug}.html">Continue reading</a>
    </article>
  `;
}

/**
 * Render homepage content only when the relevant placeholders exist.
 */
function renderBlogHome() {
  const featuredPostSlot = document.querySelector("[data-featured-post]");
  const postGridSlot = document.querySelector("[data-post-grid]");

  if (!featuredPostSlot || !postGridSlot) {
    return;
  }

  const [featuredPost, ...remainingPosts] = blogPosts;

  featuredPostSlot.innerHTML = createFeaturedPostMarkup(featuredPost);
  postGridSlot.innerHTML = remainingPosts.map(createPostCardMarkup).join("");
}

/**
 * Keep the footer year current across every page.
 */
function renderCurrentYear() {
  const yearSlot = document.querySelector("[data-current-year]");

  if (!yearSlot) {
    return;
  }

  yearSlot.textContent = String(new Date().getFullYear());
}

/**
 * Start the small amount of client-side rendering used by the template.
 */
function bootSite() {
  renderBlogHome();
  renderCurrentYear();
}

bootSite();

