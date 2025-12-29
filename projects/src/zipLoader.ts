/**
 * ZIP-based project file loader.
 * Fetches project files from a ZIP archive and writes them to the filesystem.
 *
 * Primary source: GitHub releases (nand2tetris/projects)
 * Fallback: Local projects.zip served from web/public
 */

import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs.js";
import JSZip from "jszip";

/**
 * URL to the latest projects.zip from GitHub releases.
 * This URL always points to the latest release.
 */
export const PROJECTS_ZIP_URL =
  "https://renanbazinin.github.io/projects/projects.zip";

/**
 * Get the fallback URL for projects.zip served locally.
 * Computes the base URL from the current page location to work with any deployment path.
 */
export function getProjectsZipFallbackUrl(): string {
  if (typeof window === "undefined") {
    // Node.js environment - return a path that can be overridden
    return "./projects.zip";
  }

  // Browser environment - compute base URL from current location
  const { origin, pathname } = window.location;

  // Known app base paths in production and development
  // Production: /web-ide/ on nand2tetris.github.io
  // Development: /web-ide/ on localhost
  const knownBasePaths = ["/web-ide/", "/web-ide"];

  // Check if pathname starts with a known base path
  for (const basePath of knownBasePaths) {
    if (pathname.startsWith(basePath)) {
      const normalizedBase = basePath.endsWith("/") ? basePath : basePath + "/";
      return `${origin}${normalizedBase}projects.zip`;
    }
  }

  // Fallback: Find the app base path by looking for route segments
  // Common route segments in this app: /chip, /cpu, /asm, /vm, /bitmap, /about
  const routePatterns = [
    "/chip",
    "/cpu",
    "/asm",
    "/vm",
    "/bitmap",
    "/about",
    "/guide",
  ];

  let basePath = pathname;
  for (const route of routePatterns) {
    const idx = pathname.indexOf(route);
    if (idx !== -1) {
      basePath = pathname.substring(0, idx);
      break;
    }
  }

  // If no route pattern found, assume root or try to extract base from pathname
  if (basePath === pathname) {
    // If pathname ends with /, use it as base
    // Otherwise, use the directory portion
    if (!pathname.endsWith("/")) {
      const lastSlash = pathname.lastIndexOf("/");
      basePath = lastSlash > 0 ? pathname.substring(0, lastSlash + 1) : "/";
    }
  }

  // Ensure basePath ends with /
  if (!basePath.endsWith("/")) {
    basePath += "/";
  }

  return `${origin}${basePath}projects.zip`;
}

/** @deprecated Use getProjectsZipFallbackUrl() instead */
export const PROJECTS_ZIP_FALLBACK_URL = "./projects.zip";

export interface LoadFromZipOptions {
  /**
   * If true, skip files that already exist in the filesystem.
   * Default: true (preserves user edits)
   */
  skipExisting?: boolean;

  /**
   * Base path where files will be written.
   * Default: "/projects"
   */
  basePath?: string;

  /**
   * If true, use local fallback URL when primary fetch fails.
   * Default: true
   */
  useFallback?: boolean;

  /**
   * Callback for progress updates during loading.
   */
  onProgress?: (loaded: number, total: number) => void;
}

/**
 * Check if a file exists in the filesystem.
 */
async function fileExists(fs: FileSystem, path: string): Promise<boolean> {
  try {
    await fs.stat(path);
    return true;
  } catch {
    return false;
  }
}

/**
 * Ensure a directory exists, creating parent directories if needed.
 */
async function ensureDir(fs: FileSystem, dirPath: string): Promise<void> {
  const parts = dirPath.split("/").filter(Boolean);
  let currentPath = "";
  for (const part of parts) {
    currentPath += "/" + part;
    try {
      await fs.stat(currentPath);
    } catch {
      await fs.mkdir(currentPath);
    }
  }
}

/**
 * Fetch a ZIP file with fallback support.
 * Tries the primary URL first, falls back to local URL on failure.
 */
async function fetchZipWithFallback(
  primaryUrl: string,
  useFallback: boolean,
): Promise<{ data: ArrayBuffer; source: "release" | "local" }> {
  try {
    const response = await fetch(primaryUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.arrayBuffer();
    return { data, source: "release" };
  } catch (primaryError) {
    if (!useFallback) {
      throw primaryError;
    }

    const fallbackUrl = getProjectsZipFallbackUrl();
    console.warn(
      `Failed to fetch from primary URL (${primaryUrl}):`,
      primaryError,
    );
    console.log(`Falling back to local URL: ${fallbackUrl}`);

    try {
      const fallbackResponse = await fetch(fallbackUrl);
      if (!fallbackResponse.ok) {
        throw new Error(
          `HTTP ${fallbackResponse.status}: ${fallbackResponse.statusText}`,
        );
      }
      const data = await fallbackResponse.arrayBuffer();
      return { data, source: "local" };
    } catch (fallbackError) {
      throw new Error(
        `Failed to fetch ZIP from both primary (${primaryUrl}) and fallback (${fallbackUrl}): ${fallbackError}`,
      );
    }
  }
}

/**
 * Load project files from a ZIP archive.
 *
 * @param fs - The filesystem to write files to
 * @param zipUrl - URL to fetch the ZIP from (defaults to GitHub releases)
 * @param options - Loading options
 */
export async function loadFromZip(
  fs: FileSystem,
  zipUrl: string = PROJECTS_ZIP_URL,
  options: LoadFromZipOptions = {},
): Promise<"release" | "local"> {
  const {
    skipExisting = true,
    basePath = "/projects",
    useFallback = true,
    onProgress,
  } = options;

  // Fetch the ZIP file with fallback support
  const fetched = await fetchZipWithFallback(zipUrl, useFallback);
  const zip = await JSZip.loadAsync(fetched.data);

  // Count total files for progress
  const files = Object.entries(zip.files).filter(([, f]) => !f.dir);
  const totalFiles = files.length;
  let loadedFiles = 0;

  // Process each file in the ZIP
  for (const [relativePath, file] of files) {
    // The ZIP structure is: projects/<project_id>/<file>
    // We want to map this to: /projects/<project_id>/<file>
    // Remove the leading "projects/" prefix if present
    const normalizedPath = relativePath.replace(/^projects\//, "");

    // Skip README files at root level
    if (normalizedPath === "README.md" || !normalizedPath.includes("/")) {
      loadedFiles++;
      continue;
    }

    const targetPath = `${basePath}/${normalizedPath}`;

    // Skip if file exists and skipExisting is true
    if (skipExisting && (await fileExists(fs, targetPath))) {
      loadedFiles++;
      onProgress?.(loadedFiles, totalFiles);
      continue;
    }

    // Ensure the directory exists
    const dirPath = targetPath.substring(0, targetPath.lastIndexOf("/"));
    await ensureDir(fs, dirPath);

    // Read file content and write to filesystem
    const content = await file.async("string");
    await fs.writeFile(targetPath, content);

    loadedFiles++;
    onProgress?.(loadedFiles, totalFiles);
  }

  return fetched.source;
}

/**
 * Reset all project files by loading fresh copies from the ZIP.
 * This OVERWRITES existing files.
 */
export async function resetFromZip(
  fs: FileSystem,
  zipUrl: string = PROJECTS_ZIP_URL,
  options: Omit<LoadFromZipOptions, "skipExisting"> = {},
): Promise<"release" | "local"> {
  return await loadFromZip(fs, zipUrl, { ...options, skipExisting: false });
}

/**
 * Create project files only if they don't exist.
 * This PRESERVES existing files (user edits).
 */
export async function createFromZip(
  fs: FileSystem,
  zipUrl: string = PROJECTS_ZIP_URL,
  options: Omit<LoadFromZipOptions, "skipExisting"> = {},
): Promise<"release" | "local"> {
  return await loadFromZip(fs, zipUrl, { ...options, skipExisting: true });
}

/**
 * Load project files from pre-fetched ZIP data (ArrayBuffer or Blob).
 * Useful for tests or when ZIP data is already available.
 */
export async function loadFromZipData(
  fs: FileSystem,
  zipData: ArrayBuffer | Blob,
  options: Omit<LoadFromZipOptions, "useFallback"> = {},
): Promise<void> {
  const { skipExisting = true, basePath = "/projects", onProgress } = options;

  const zip = await JSZip.loadAsync(zipData);

  // Count total files for progress
  const files = Object.entries(zip.files).filter(([, f]) => !f.dir);
  const totalFiles = files.length;
  let loadedFiles = 0;

  // Process each file in the ZIP
  for (const [relativePath, file] of files) {
    const normalizedPath = relativePath.replace(/^projects\//, "");

    // Skip README files at root level
    if (normalizedPath === "README.md" || !normalizedPath.includes("/")) {
      loadedFiles++;
      continue;
    }

    const targetPath = `${basePath}/${normalizedPath}`;

    // Skip if file exists and skipExisting is true
    if (skipExisting && (await fileExists(fs, targetPath))) {
      loadedFiles++;
      onProgress?.(loadedFiles, totalFiles);
      continue;
    }

    // Ensure the directory exists
    const dirPath = targetPath.substring(0, targetPath.lastIndexOf("/"));
    await ensureDir(fs, dirPath);

    // Read file content and write to filesystem
    const content = await file.async("string");
    await fs.writeFile(targetPath, content);

    loadedFiles++;
    onProgress?.(loadedFiles, totalFiles);
  }
}

/**
 * Get a list of all project IDs from a ZIP archive.
 * Useful for discovery before loading all files.
 */
export async function getProjectIdsFromZip(
  zipUrl: string = PROJECTS_ZIP_URL,
): Promise<string[]> {
  const fetched = await fetchZipWithFallback(zipUrl, true);
  const zip = await JSZip.loadAsync(fetched.data);

  const projectIds = new Set<string>();
  for (const relativePath of Object.keys(zip.files)) {
    // Match paths like "projects/01/..." or "01/..."
    const match = relativePath.match(/^(?:projects\/)?(\d{2})\//);
    if (match) {
      projectIds.add(match[1]);
    }
  }

  return Array.from(projectIds).sort();
}
