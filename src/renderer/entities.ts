import { nanoid } from 'nanoid';
import type { RoughCanvas } from 'roughjs/bin/canvas';
import { RoughGenerator } from 'roughjs/bin/generator';
import type { Options as RoughOptions } from 'roughjs/bin/core';
import {
	Point,
	Bounds,
	calcRectPoints,
	calcBoundsFromPoints,
} from 'renderer/geometry';

const PADDING = 10;
const ROUGH_OPTIONS: RoughOptions = {
	roughness: 0.7,
	bowing: 0.5,
};

interface BaseEntityData {
	id: string;
	seed: number;
	type: string;
	bounds: Bounds;
	isSelected: boolean;
	origin: Point;
}

export interface CircleData extends BaseEntityData {
	type: 'circle';
	radius: number;
}

export interface RectData extends BaseEntityData {
	type: 'rect';
	width: number;
	height: number;
	rotation: number;
}

export type EntityData = CircleData | RectData;

export type Entity<T> = T & {
	draw: (rc: RoughCanvas, ctx: CanvasRenderingContext2D) => void;
};

export type Entities = Array<Entity<EntityData>>;

export class Circle implements Entity<CircleData> {
	id = nanoid(8);
	type: 'circle' = 'circle';
	seed = RoughGenerator.newSeed();
	isSelected: boolean = false;
	origin: Point;
	radius: number;

	constructor(options: Pick<CircleData, 'origin' | 'radius'>) {
		const { origin, radius } = options;
		this.origin = origin;
		this.radius = radius;
	}

	get bounds(): Bounds {
		const [x, y] = this.origin;
		return {
			left: x - this.radius - PADDING,
			right: x + this.radius + PADDING,
			top: y - this.radius - PADDING,
			bottom: y + this.radius + PADDING,
		};
	}

	draw(rc: RoughCanvas, ctx: CanvasRenderingContext2D) {
		const [x, y] = this.origin;
		rc.circle(x, y, 2 * this.radius, { seed: this.seed, ...ROUGH_OPTIONS });

		if (this.isSelected) {
			drawBounds(ctx, this.bounds);
		}
	}
}

export class Rect implements Entity<RectData> {
	id = nanoid(8);
	type: 'rect' = 'rect';
	seed = RoughGenerator.newSeed();
	isSelected: boolean = false;
	origin: Point;
	width: number;
	height: number;
	rotation: number;

	constructor(
		options: Pick<RectData, 'origin' | 'width' | 'height' | 'rotation'>
	) {
		const { origin, width, height, rotation } = options;
		this.origin = origin;
		this.width = width;
		this.height = height;
		this.rotation = rotation;
	}

	get bounds(): Bounds {
		return calcBoundsFromPoints(
			calcRectPoints(
				this.origin,
				this.width + 2 * PADDING,
				this.height + 2 * PADDING,
				this.rotation
			)
		);
	}

	draw(rc: RoughCanvas, ctx: CanvasRenderingContext2D) {
		const points = calcRectPoints(
			this.origin,
			this.width,
			this.height,
			this.rotation
		);

		rc.polygon(points, { seed: this.seed, ...ROUGH_OPTIONS });

		if (this.isSelected) {
			drawBounds(ctx, this.bounds);
		}
	}
}

function drawBounds(ctx: CanvasRenderingContext2D, bounds: Bounds) {
	const { left, right, top, bottom } = bounds;
	ctx.save();

	ctx.strokeStyle = '#0060DF';
	ctx.lineWidth = 1;

	ctx.beginPath();
	ctx.moveTo(left, top);
	ctx.lineTo(right, top);
	ctx.lineTo(right, bottom);
	ctx.lineTo(left, bottom);
	ctx.closePath();

	ctx.stroke();

	ctx.restore();
}
