export function lerp(start: number, end: number, t: number) {
	return (1 - t) * start + t * end;
}

export function clamp(value: number, min: number, max: number) {
	return Math.min(Math.max(value, min), max);
}
