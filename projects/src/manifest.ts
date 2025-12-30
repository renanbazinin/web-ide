/**
 * Project Manifest - Minimal metadata for built-in chips.
 *
 * The project structure and files are dynamically loaded from the ZIP.
 * This manifest only contains metadata that can't be derived from the ZIP,
 * such as which chips are built-in (provided by the simulator).
 */

/**
 * Built-in chips that are provided by the simulator (not user-implemented).
 * These chips have BUILTIN implementations in the simulator and should not
 * be editable by users. The key is the project ID, the value is a list of
 * chip names that are built-in for that project.
 */
export const BuiltinChips: Record<string, string[]> = {
  "01": ["Nand"],
  "03": ["DFF"],
  "05": ["Screen", "Keyboard", "DRegister", "ARegister", "ROM32K", "RAM16K"],
};

/**
 * Check if a chip is built-in (provided by the simulator).
 */
export function isBuiltinChip(chipName: string): boolean {
  for (const chips of Object.values(BuiltinChips)) {
    if (chips.includes(chipName)) {
      return true;
    }
  }
  return false;
}

/**
 * Get the list of built-in chips for a project.
 */
export function getBuiltinChipsForProject(projectId: string): string[] {
  return BuiltinChips[projectId] ?? [];
}

/**
 * Get the base path for a project.
 */
export function getProjectPath(projectId: string): string {
  return `/projects/${projectId}`;
}

/**
 * Get the expected files for a chip in a project.
 * Returns: [chipName.hdl, chipName.tst, chipName.cmp]
 */
export function getChipFiles(chipName: string): string[] {
  return [`${chipName}.hdl`, `${chipName}.tst`, `${chipName}.cmp`];
}
