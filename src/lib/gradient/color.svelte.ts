import type { RgbaColor } from 'svelte-awesome-color-picker';

class GradientColor {
	rgb: RgbaColor;
	position: number;

	constructor(color: RgbaColor, position: number) {
		this.rgb = $state(color);
		this.position = $state(position);
	}

	get cssColor() {
		return `rgba(${this.rgb.r},${this.rgb.g},${this.rgb.b},${this.rgb.a})`;
	}

	get clampedPosition() {
		return Math.min(Math.max(this.position, 0), 1);
	}
}

export class Gradient {
	colors: GradientColor[] = $state([
		new GradientColor({ r: 0, g: 221, b: 255, a: 1 }, 0),
		new GradientColor({ r: 0, g: 255, b: 81, a: 1 }, 1)
	]);

	get gradientString() {
		let gradientColors = [];
		for (let color of this.colors) {
			gradientColors.push(`${color.cssColor} ${color.clampedPosition * 100}%`);
		}

		return `linear-gradient(90deg, ${gradientColors.join(',')})`;
	}
}
