import type { RgbaColor } from 'svelte-awesome-color-picker';
import { clamp, lerp } from '../utils';
import { Vector3 } from 'three';

export class GradientColor {
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
		return clamp(this.position, 0, 1);
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
			const position = color.clampedPosition;

			if (position <= t) {
				colorLeft = color;
			} else if (position >= t) {
				colorRight = color;
				break;
			}
		}

		if (colorLeft && colorRight) {
			const position = colorLeft.clampedPosition;
			const nextPosition = colorRight.clampedPosition;
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

	getCssString(applyAngle = true) {
		const gradientColors = [];
		for (const color of this.colors) {
			gradientColors.push(`${color.cssColor} ${color.clampedPosition * 100}%`);
		}

		return `linear-gradient(${applyAngle ? this.angle : 90}deg, ${gradientColors.join(',')})`;
	}
}
