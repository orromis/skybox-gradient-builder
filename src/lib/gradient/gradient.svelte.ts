import type { RgbaColor } from 'svelte-awesome-color-picker';
import { clamp, lerp } from '../utils';
import { Vector3 } from 'three';

let counter = 0;

export class GradientColor {
	rgb: RgbaColor;
	position: number;
	id = counter++;

	constructor(color: RgbaColor, position: number) {
		this.rgb = $state(color);
		this.position = $state(position);
	}

	get cssColor() {
		return `rgba(${this.rgb.r},${this.rgb.g},${this.rgb.b},${this.rgb.a})`;
	}

	get hexColor() {
		const r = this.rgb.r.toString(16).padStart(2, '0');
		const g = this.rgb.g.toString(16).padStart(2, '0');
		const b = this.rgb.b.toString(16).padStart(2, '0');
		const a =
			this.rgb.a < 1
				? Math.round(this.rgb.a * 255)
						.toString(16)
						.padStart(2, '0')
				: null;
		return `#${r}${g}${b}${a ?? ''}`;
	}

	set hexColor(color: string) {
		const parsedColor = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(color);
		if (parsedColor) {
			this.rgb.r = parseInt(parsedColor[1], 16);
			this.rgb.g = parseInt(parsedColor[2], 16);
			this.rgb.b = parseInt(parsedColor[3], 16);

			if (parsedColor[4]) {
				this.rgb.a = parseInt(parsedColor[4], 16) / 255;
			}
		}
	}

	get positionPercent() {
		return Math.round(this.position * 100);
	}

	set positionPercent(value: number) {
		this.position = value / 100;
	}
}

export class Gradient {
	colors: GradientColor[];
	angle: number;

	constructor(colors: GradientColor[], angle: number = 180) {
		this.colors = $state(colors);
		this.angle = $state(angle);
	}

	get direction() {
		const angleRad = (Math.PI / 180) * this.angle;
		return new Vector3(0, 1, 0).applyAxisAngle({ x: 0, y: 0, z: 1 }, angleRad);
	}

	sample(samplePosition: number) {
		let colorLeft: GradientColor | null = null;
		let colorRight: GradientColor | null = null;
		const t = clamp(samplePosition, 0, 1);

		// find the gradient colors that are closest to the sampled position
		for (let i = 0; i < this.colors.length; i++) {
			const color = this.colors[i];
			const position = color.position;

			if (position <= t) {
				colorLeft = color;
			} else if (position >= t) {
				colorRight = color;
				break;
			}
		}

		if (colorLeft && colorRight) {
			const position = colorLeft.position;
			const nextPosition = colorRight.position;
			const localT = (t - position) / (nextPosition - position);
			const r = lerp(colorLeft.rgb.r, colorRight.rgb.r, localT);
			const g = lerp(colorLeft.rgb.g, colorRight.rgb.g, localT);
			const b = lerp(colorLeft.rgb.b, colorRight.rgb.b, localT);
			const a = lerp(colorLeft.rgb.a, colorRight.rgb.a, localT);

			return { r, g, b, a } as RgbaColor;
		} else if (colorLeft) {
			return colorLeft.rgb;
		} else if (colorRight) {
			return colorRight.rgb;
		}
	}

	getCssString(angleOverride = this.angle) {
		const gradientColors = [];
		for (const color of this.colors) {
			gradientColors.push(`${color.cssColor} ${color.position * 100}%`);
		}

		return `linear-gradient(${angleOverride}deg, ${gradientColors.join(',')})`;
	}

	addColor() {
		const r = Math.floor(Math.random() * 255);
		const g = Math.floor(Math.random() * 255);
		const b = Math.floor(Math.random() * 255);

		this.colors.push(new GradientColor({ r, g, b, a: 1 }, Math.random()));
		this.sortColors();
	}

	removeColor(color: GradientColor) {
		const index = this.colors.indexOf(color);
		if (index !== -1) {
			this.colors.splice(index, 1);
			return index;
		}

		return false;
	}

	sortColors() {
		this.colors.sort((a, b) => a.position - b.position);
	}
}
