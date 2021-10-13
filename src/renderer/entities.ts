import { nanoid } from 'nanoid';
import type { RoughCanvas } from 'roughjs/bin/canvas';
import { RoughGenerator } from 'roughjs/bin/generator';
import { ROUGH_OPTIONS, BOUNDS_MARGIN } from 'renderer/constants';
import {
	Point,
	Points,
	Bounds,
	calcRectPoints,
	calcBoundsFromPoints,
	rotatePoint,
} from 'renderer/geometry';
import {
	Control,
	CircleRadiusControl,
	RectCornerControl,
	RectRotationControl,
	ConeRadiusRotationControl,
	ConeAngleControl,
} from 'renderer/controls';

// 'data' types will be used for json serializing/deserializing

interface BaseEntityData {
	id: string;
	seed?: number;
	type: string;
	origin: Point;
	bounds: Bounds;
	isSelected: boolean;
	strokeWidth: number;
}

export interface CircleData extends BaseEntityData {
	type: 'circle';
	radius: number;
}

export interface ConeData extends BaseEntityData {
	type: 'cone';
	radius: number;
	start: number;
	end: number;
}

export interface RectData extends BaseEntityData {
	type: 'rect';
	width: number;
	height: number;
	rotation: number;
}

export type EntityData = CircleData | ConeData | RectData;

type BaseEntity<T> = T & {
	controls: Control<BaseEntity<T>>[];
	draw: (rc: RoughCanvas, ctx: CanvasRenderingContext2D) => void;
};

export type Entity = Circle | Cone | Rect;

const generateId = () => nanoid(8);

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

export class Circle implements BaseEntity<CircleData> {
	id = generateId();
	type: 'circle' = 'circle';
	seed = RoughGenerator.newSeed();
	isSelected: boolean = false;
	origin: Point;
	strokeWidth = 1;
	radius: number;

	controls: Control<Circle>[];

	constructor(options: Pick<CircleData, 'origin' | 'radius'>) {
		const { origin, radius } = options;
		this.origin = origin;
		this.radius = radius;
		this.controls = [new CircleRadiusControl(this)];
	}

	get bounds(): Bounds {
		const [x, y] = this.origin;
		return {
			left: x - this.radius - BOUNDS_MARGIN,
			right: x + this.radius + BOUNDS_MARGIN,
			top: y - this.radius - BOUNDS_MARGIN,
			bottom: y + this.radius + BOUNDS_MARGIN,
		};
	}

	draw(rc: RoughCanvas, ctx: CanvasRenderingContext2D) {
		const [x, y] = this.origin;
		rc.circle(x, y, 2 * this.radius, {
			...ROUGH_OPTIONS,
			seed: this.seed,
			strokeWidth: this.strokeWidth,
		});

		if (this.isSelected) {
			drawBounds(ctx, this.bounds);
			this.controls.forEach((c) => c.render(ctx));
		}
	}
}

export class Cone implements BaseEntity<ConeData> {
	id = generateId();
	type: 'cone' = 'cone';
	seed = RoughGenerator.newSeed();
	isSelected: boolean = false;
	origin: Point;
	strokeWidth = 1;
	radius: number;
	start: number;
	end: number;

	controls: Control<Cone>[];

	constructor(options: Pick<ConeData, 'origin' | 'radius' | 'start' | 'end'>) {
		const { origin, radius, start, end } = options;
		this.origin = origin;
		this.radius = radius;
		this.start = start;
		this.end = end;
		this.controls = [
			new ConeRadiusRotationControl(this),
			new ConeAngleControl(this),
		];
	}

	get bounds(): Bounds {
		const [x0, y0] = this.origin;
		const points: Points = [
			this.origin,
			rotatePoint(this.origin, [x0 + this.radius, y0], this.start),
			rotatePoint(this.origin, [x0 + this.radius, y0], this.end),
		];
		// horizontal and vertical tangent points
		// ... there's probably a better way to do this
		if (this.start < 0 && this.end > 0) {
			points.push([x0 + this.radius, y0]);
		}
		if (
			(this.start < Math.PI * 0.5 && this.end > Math.PI * 0.5) ||
			(this.start < Math.PI * -1.5 && this.end > Math.PI * -1.5)
		) {
			points.push([x0, y0 + this.radius]);
		}
		if (
			(this.start < Math.PI && this.end > Math.PI) ||
			(this.start < -Math.PI && this.end > -Math.PI)
		) {
			points.push([x0 - this.radius, y0]);
		}
		if (
			(this.start < Math.PI * 1.5 && this.end > Math.PI * 1.5) ||
			(this.start < Math.PI * -0.5 && this.end > Math.PI * -0.5)
		) {
			points.push([x0, y0 - this.radius]);
		}

		const bounds = calcBoundsFromPoints(points);

		return {
			left: bounds.left - BOUNDS_MARGIN,
			right: bounds.right + BOUNDS_MARGIN,
			top: bounds.top - BOUNDS_MARGIN,
			bottom: bounds.bottom + BOUNDS_MARGIN,
		};
	}

	draw(rc: RoughCanvas, ctx: CanvasRenderingContext2D) {
		const [x0, y0] = this.origin;
		const size = 2 * this.radius;
		const options = {
			...ROUGH_OPTIONS,
			seed: this.seed,
			strokeWidth: this.strokeWidth,
		};

		// there is a bit of overdrawing if closed = true
		// use `preserveVertices` and draw lines manually instead
		rc.arc(x0, y0, size, size, this.start, this.end, false, {
			...options,
			preserveVertices: true,
		});

		const arcP1 = rotatePoint(this.origin, [x0 + this.radius, y0], this.start);
		const arcP2 = rotatePoint(this.origin, [x0 + this.radius, y0], this.end);
		rc.line(x0, y0, arcP1[0], arcP1[1], options);
		rc.line(x0, y0, arcP2[0], arcP2[1], options);

		if (this.isSelected) {
			drawBounds(ctx, this.bounds);
			this.controls.forEach((c) => c.render(ctx));
		}
	}
}

export class Rect implements BaseEntity<RectData> {
	id = generateId();
	type: 'rect' = 'rect';
	seed = RoughGenerator.newSeed();
	isSelected: boolean = false;
	origin: Point;
	strokeWidth = 1;
	width: number;
	height: number;
	rotation: number;

	controls: Control<Rect>[];

	constructor(
		options: Pick<RectData, 'origin' | 'width' | 'height' | 'rotation'>
	) {
		const { origin, width, height, rotation } = options;
		this.origin = origin;
		this.width = width;
		this.height = height;
		this.rotation = rotation;
		this.controls = [0, 1, 2, 3].map((ix) => new RectCornerControl(this, ix));
		this.controls.push(new RectRotationControl(this));
	}

	get points(): Points {
		return calcRectPoints(this.origin, this.width, this.height, this.rotation);
	}

	get bounds(): Bounds {
		return calcBoundsFromPoints(
			calcRectPoints(
				this.origin,
				this.width + 2 * BOUNDS_MARGIN,
				this.height + 2 * BOUNDS_MARGIN,
				this.rotation
			)
		);
	}

	draw(rc: RoughCanvas, ctx: CanvasRenderingContext2D) {
		rc.polygon(this.points, {
			...ROUGH_OPTIONS,
			seed: this.seed,
			strokeWidth: this.strokeWidth,
		});

		if (this.isSelected) {
			drawBounds(ctx, this.bounds);
			this.controls.forEach((c) => c.render(ctx));
		}
	}
}
