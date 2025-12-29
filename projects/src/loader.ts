import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs.js";
import { type Projects } from "./full.js";
import {
  createFromZip,
  loadFromZip,
  type LoadFromZipOptions,
  PROJECTS_ZIP_URL,
  resetFromZip,
} from "./zipLoader.js";

/**
 * Reset all project files by loading fresh copies.
 * Tries ZIP-based loading first, falls back to legacy hardcoded files.
 * This OVERWRITES existing files.
 *
 * @param fs - The filesystem to write files to
 * @param projects - Optional list of project IDs to reset
 * @param options - Optional loading options
 */
export async function resetFiles(
  fs: FileSystem,
  projects?: (keyof typeof Projects)[],
  options?: LoadFromZipOptions,
) {
  try {
    // Try ZIP-based loading first
    await resetFromZip(fs, PROJECTS_ZIP_URL, options);
    console.log("Successfully loaded project files from ZIP");
  } catch (zipError) {
    // Fall back to legacy hardcoded files
    console.warn(
      "ZIP loading failed, falling back to legacy loader:",
      zipError,
    );
    await (await import("./full.js")).resetFiles(fs, projects);
  }
}

/**
 * Reset only test files (.tst, .cmp).
 * Falls back to legacy loader.
 */
export async function resetTests(
  fs: FileSystem,
  projects?: (keyof typeof Projects)[],
) {
  // Use legacy loader for test-only reset
  await (await import("./full.js")).resetTests(fs, projects);
}

/**
 * Create project files only if they don't exist.
 * Tries ZIP-based loading first, falls back to legacy hardcoded files.
 * This PRESERVES existing files (user edits).
 */
export async function createFiles(
  fs: FileSystem,
  options?: LoadFromZipOptions,
) {
  try {
    // Try ZIP-based loading first
    await createFromZip(fs, PROJECTS_ZIP_URL, options);
    console.log("Successfully created project files from ZIP");
  } catch (zipError) {
    // Fall back to legacy hardcoded files
    console.warn(
      "ZIP loading failed, falling back to legacy loader:",
      zipError,
    );
    await (await import("./full.js")).createFiles(fs);
  }
}

/**
 * Load sample files (ASM, Jack programs, etc.) into the filesystem.
 * Uses legacy loader for samples (not in the external ZIP).
 */
export async function loadSamples(fs: FileSystem) {
  (await import("./samples/index.js")).loadSamples(fs);
}

/**
 * Load solution files for testing.
 * Uses legacy loader for solutions (not in the external ZIP).
 */
export async function loadSolutions(fs: FileSystem) {
  (await import("./testing/index.js")).loadSolutions(fs);
}

/**
 * Re-export ZIP loader for direct access when needed.
 */
export {
  createFromZip,
  getProjectIdsFromZip,
  loadFromZip,
  loadFromZipData,
  PROJECTS_ZIP_FALLBACK_URL,
  PROJECTS_ZIP_URL,
  resetFromZip,
} from "./zipLoader.js";

export type { LoadFromZipOptions } from "./zipLoader.js";

export const loaders = {
  resetFiles,
  loadSolutions,
  loadSamples,
  createFiles,
};

export default loaders;
