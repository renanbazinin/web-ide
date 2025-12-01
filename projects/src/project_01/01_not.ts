export const cmp = `|in |out|
| 0 | 1 |
| 1 | 0 |
`;
export const hdl = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
/**
 * Not gate:
 * if (in) out = 0, else out = 1
 */
CHIP Not {
    IN in;
    OUT out;

    PARTS:
    //// Replace this comment with your code.
}
`;
export const tst = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.

load Not.hdl,
output-file Not.out,
compare-to Not.cmp,
output-list in out;

set in 0,
eval,
output;

set in 1,
eval,
output;
`;
