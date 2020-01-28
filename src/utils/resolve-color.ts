export function resolveColor(color: string): string {
  let c = color[0] === '#' ? color.substr(1) : color;
  c = c.toUpperCase();
  if (c.length === 3) {
    return `FF${c[0] + c[0] + c[1] + c[1] + c[2] + c[2]}`;
  } else if (c.length === 6) {
    return `FF${c}`;
  } else if (c.length === 8) {
    return c.substring(6, 8) + c.substring(0, 6);
  } else {
    throw new Error(`Invalid color provided: ${color}`);
  }
}
