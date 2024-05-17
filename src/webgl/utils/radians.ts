export function degToRad(d: number) {
  return (d * Math.PI) / 180;
}

export function radToDeg(r: number) {
  const res = (r * 180) / Math.PI;
  return res
}