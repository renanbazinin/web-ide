/**
 * Project Manifest - Structure metadata without content.
 * Used for UI rendering and project discovery before ZIP is loaded.
 */

export type ProjectID = "01" | "02" | "03" | "04" | "05" | "06" | "07" | "08";

export const ProjectIDs: ProjectID[] = [
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "07",
  "08",
];

/** Chip projects (HDL-based) */
export const ChipProjectIDs: ProjectID[] = ["01", "02", "03", "05"];

/** VM projects */
export const VmProjectIDs: ProjectID[] = ["07", "08"];

/** Assembly project */
export const AsmProjectIDs: ProjectID[] = ["04", "06"];

/**
 * Project file manifest - lists expected files per project.
 * Keys are filenames, values indicate the file type.
 */
export const ProjectManifest: Record<ProjectID, Record<string, string[]>> = {
  "01": {
    chips: [
      "Nand",
      "Not",
      "And",
      "Or",
      "Xor",
      "Mux",
      "DMux",
      "Not16",
      "And16",
      "Or16",
      "Mux16",
      "Mux4Way16",
      "Mux8Way16",
      "DMux4Way",
      "DMux8Way",
      "Or8Way",
    ],
  },
  "02": {
    chips: ["HalfAdder", "FullAdder", "Add16", "Inc16", "ALU"],
  },
  "03": {
    chips: [
      "Bit",
      "Register",
      "PC",
      "RAM8",
      "RAM64",
      "RAM512",
      "RAM4K",
      "RAM16K",
    ],
  },
  "04": {
    programs: ["Mult", "Fill"],
  },
  "05": {
    chips: ["Memory", "CPU", "Computer"],
  },
  "06": {
    programs: ["Add", "Max", "MaxL", "Rect", "RectL", "Pong", "PongL"],
  },
  "07": {
    folders: [
      "SimpleAdd",
      "StackTest",
      "BasicTest",
      "PointerTest",
      "StaticTest",
    ],
  },
  "08": {
    folders: [
      "BasicLoop",
      "FibonacciSeries",
      "SimpleFunction",
      "NestedCall",
      "FibonacciElement",
      "StaticsTest",
    ],
  },
};

/**
 * Built-in chips that are provided by the simulator (not user-implemented).
 */
export const BuiltinChips: Record<ProjectID, string[]> = {
  "01": ["Nand"],
  "02": [],
  "03": ["DFF"],
  "04": [],
  "05": ["Screen", "Keyboard", "DRegister", "ARegister", "ROM32K", "RAM16K"],
  "06": [],
  "07": [],
  "08": [],
};

/**
 * Get the expected files for a chip in a project.
 */
export function getChipFiles(chipName: string): string[] {
  return [`${chipName}.hdl`, `${chipName}.tst`, `${chipName}.cmp`];
}

/**
 * Get the base path for a project.
 */
export function getProjectPath(projectId: ProjectID): string {
  return `/projects/${projectId}`;
}
