import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs.js";
import { type Projects } from "./full.js";
import {
  createFromZip,
  type LoadFromZipOptions,
  loadFromZip,
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
  console.log("Initializing: resetting browser memory (projects)...");
  try {
    // Try ZIP-based loading first
    const source = await resetFromZip(fs, PROJECTS_ZIP_URL, options);
    if (source === "release") {
      console.log("Reset completed: loaded project files from release ZIP");
    } else {
      console.log(
        "Reset completed: loaded project files from local projects.zip",
      );
    }
  } catch (zipError) {
    // Fall back to legacy hardcoded files
    console.warn(
      "ZIP loading failed, falling back to legacy loader:",
      zipError,
    );
    await (await import("./full.js")).resetFiles(fs, projects);
    console.log("Reset completed: legacy built-in project files loaded");
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
  console.log("Initializing: creating browser memory files (projects)...");
  try {
    const source = await createFromZip(fs, PROJECTS_ZIP_URL, options);
    if (source === "release") {
      console.log("Create completed: created project files from release ZIP");
    } else {
      console.log(
        "Create completed: created project files from local projects.zip",
      );
    }
  } catch (zipError) {
    console.warn(
      "ZIP loading failed, falling back to legacy loader:",
      zipError,
    );
    await (await import("./full.js")).createFiles(fs);
    console.log("Create completed: legacy built-in project files loaded");
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

export type { LoadFromZipOptions } from "./zipLoader.js";
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

export const loaders = {
  resetFiles,
  loadSolutions,
  loadSamples,
  createFiles,
};

export default loaders;
