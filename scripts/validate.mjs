import { access, readFile } from "node:fs/promises";
import path from "node:path";

const projectRoot = process.cwd();

const requiredFiles = [
  "index.html",
  "styles.css",
  "app.js",
  "posts/designing-for-clarity.html",
  "posts/shipping-before-perfect.html",
  "posts/case-study-notes.html",
  "README.md",
  "CLAUDE.md",
  "AGENTS.md"
];

/**
 * Confirm that a required file exists before deeper validation runs.
 */
async function assertFileExists(relativePath) {
  const absolutePath = path.join(projectRoot, relativePath);
  await access(absolutePath);
}

/**
 * Read a UTF-8 text file from the project root.
 */
async function readProjectFile(relativePath) {
  const absolutePath = path.join(projectRoot, relativePath);
  return readFile(absolutePath, "utf8");
}

/**
 * Validate the key expectations for the homepage structure.
 */
async function validateHomePage() {
  const indexHtml = await readProjectFile("index.html");

  const requiredMarkers = [
    'data-featured-post',
    'data-post-grid',
    'id="latest-posts"',
    'id="topics"',
    'id="newsletter"'
  ];

  requiredMarkers.forEach((marker) => {
    if (!indexHtml.includes(marker)) {
      throw new Error(`Homepage is missing expected marker: ${marker}`);
    }
  });
}

/**
 * Validate that the sample post pages link back to the homepage.
 */
async function validatePostPages() {
  const postFiles = [
    "posts/designing-for-clarity.html",
    "posts/shipping-before-perfect.html",
    "posts/case-study-notes.html"
  ];

  for (const postFile of postFiles) {
    const content = await readProjectFile(postFile);

    if (!content.includes("../index.html")) {
      throw new Error(`${postFile} does not link back to the homepage.`);
    }
  }
}

/**
 * Validate that the client-side script includes the expected rendering hooks.
 */
async function validateAppScript() {
  const appScript = await readProjectFile("app.js");

  if (!appScript.includes("const blogPosts = [")) {
    throw new Error("app.js is missing the blog post data array.");
  }

  if (!appScript.includes("function renderBlogHome()")) {
    throw new Error("app.js is missing the homepage rendering function.");
  }
}

/**
 * Run all project validations and report a friendly success message.
 */
async function main() {
  for (const requiredFile of requiredFiles) {
    await assertFileExists(requiredFile);
  }

  await validateHomePage();
  await validatePostPages();
  await validateAppScript();

  console.log("Validation passed: blog template files and structure look good.");
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});

