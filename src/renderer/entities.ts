import { makeAutoObservable } from 'mobx';
import { nanoid } from 'nanoid';
import type { RoughCanvas } from 'roughjs/bin/canvas';
import type { Options as RoughOptions } from 'roughjs/bin/core';
import { RoughGenerator } from 'roughjs/bin/generator';
import {
	BOUNDS_MARGIN,
	HIT_TEST_TOLERANCE,
	DEFAULT_ROUGH_OPTIONS,
} from 'renderer/constants';
import {
	Point,
	Points,
	Segments,
	Bounds,
	calcRectPoints,
	calcBoundsFromPoints,
	calcAngle,
	rotatePoint,
	distToCircle,
	distToCone,
	distToPolygon,
	distToSegments,
} from 'renderer/geometry';
import {
	Control,
	CircleRadiusControl,
	RectCornerControl,
	RectRotationControl,
	ConeRadiusRotationControl,
	ConeAngleControl,
	LinePointControl,
} from 'renderer/controls';

interface BaseData {
	id: string;
	type: string;
	roughOptions?: RoughOptions;
}

export interface CircleData extends BaseData {
	type: 'circle';
	origin: Point;
	radius: number;
}

export interface ConeData extends BaseData {
	type: 'cone';
	origin: Point;
	radius: number;
	start: number;
	end: number;
}

export interface RectData extends BaseData {
	type: 'rect';
	origin: Point;
	width: number;
	height: number;
	rotation: number;
}

type LineType = 'line' | 'arrow';

export interface LineData extends BaseData {
	type: LineType;
	origin: Point;
	angle: number;
	length: number;
}

export type EntityData = CircleData | ConeData | RectData | LineData;

type ConstructorOptions<T extends BaseData> = PartialBy<T, keyof BaseData>;

type BaseEntity<T extends BaseData> = T & {
	isSelected: boolean;
	controls: Control<BaseEntity<T>>[];
	bounds: Bounds;
	hitTest: (point: Point) => boolean;
	draw: (rc: RoughCanvas, ctx: CanvasRenderingContext2D) => void;
	toJSON: () => T;
};

export type Entity = Circle | Cone | Rect | Line;

export class Circle implements BaseEntity<CircleData> {
	id;
	type: 'circle' = 'circle';
	roughOptions: RoughOptions;

	origin: Point;
	radius: number;

	isSelected: boolean = false;
	controls: Control<Circle>[];

	constructor(options: ConstructorOptions<CircleData>) {
		makeAutoObservable(this);
		this.id = options.id ?? generateId();
		this.roughOptions = getRoughOptions(options.roughOptions);
		this.origin = options.origin;
		this.radius = options.radius;
		this.controls = [new CircleRadiusControl(this)];
	}

	toJSON(): CircleData {
		return selectProps<Circle, CircleData>(this, [
			'id',
			'type',
			'roughOptions',
			'origin',
			'radius',
		]);
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

	hitTest(point: Point) {
		return distToCircle(point, this.origin, this.radius) <= HIT_TEST_TOLERANCE;
	}

	draw(rc: RoughCanvas, ctx: CanvasRenderingContext2D) {
		const [x, y] = this.origin;
		rc.circle(x, y, 2 * this.radius, this.roughOptions);

		if (this.isSelected) {
			drawBounds(ctx, this.bounds);
			this.controls.forEach((c) => c.render(ctx));
		}
	}
}

export class Cone implements BaseEntity<ConeData> {
	id;
	type: 'cone' = 'cone';
	roughOptions: RoughOptions;

	origin: Point;
	radius: number;
	start: number;
	end: number;

	isSelected: boolean = false;
	controls: Control<Cone>[];

	constructor(options: ConstructorOptions<ConeData>) {
		makeAutoObservable(this);
		this.id = options.id ?? generateId();
		this.roughOptions = getRoughOptions(options.roughOptions);
		this.origin = options.origin;
		this.radius = options.radius;
		this.start = options.start;
		this.end = options.end;
		this.controls = [
			new ConeRadiusRotationControl(this),
			new ConeAngleControl(this),
		];
	}

	toJSON(): ConeData {
		return selectProps<Cone, ConeData>(this, [
			'id',
			'type',
			'roughOptions',
			'origin',
			'radius',
			'start',
			'end',
		]);
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

	hitTest(point: Point) {
		return (
			distToCone(point, this.origin, this.radius, this.start, this.end) <=
			HIT_TEST_TOLERANCE
		);
	}

	draw(rc: RoughCanvas, ctx: CanvasRenderingContext2D) {
		const [x0, y0] = this.origin;
		const size = 2 * this.radius;

		// roughjs has a bit of overdrawing for arcs
		// use lower roughness to mitigate this
		rc.arc(x0, y0, size, size, this.start, this.end, false, {
			...this.roughOptions,
			roughness: (this.roughOptions.roughness ?? 1) / 3,
		});

		const arcP1 = rotatePoint(this.origin, [x0 + this.radius, y0], this.start);
		const arcP2 = rotatePoint(this.origin, [x0 + this.radius, y0], this.end);
		rc.line(x0, y0, arcP1[0], arcP1[1], this.roughOptions);
		rc.line(x0, y0, arcP2[0], arcP2[1], this.roughOptions);

		if (this.isSelected) {
			drawBounds(ctx, this.bounds);
			this.controls.forEach((c) => c.render(ctx));
		}
	}
}

export class Rect implements BaseEntity<RectData> {
	id;
	type: 'rect' = 'rect';
	roughOptions: RoughOptions;

	origin: Point;
	width: number;
	height: number;
	rotation: number;

	isSelected: boolean = false;
	controls: Control<Rect>[];

	constructor(options: ConstructorOptions<RectData>) {
		makeAutoObservable(this);
		this.id = options.id ?? generateId();
		this.roughOptions = getRoughOptions(options.roughOptions);
		this.origin = options.origin;
		this.width = options.width;
		this.height = options.height;
		this.rotation = options.rotation;
		this.controls = [0, 1, 2, 3].map((ix) => new RectCornerControl(this, ix));
		this.controls.push(new RectRotationControl(this));
	}

	toJSON(): RectData {
		return selectProps(this, [
			'id',
			'type',
			'roughOptions',
			'origin',
			'width',
			'height',
			'rotation',
		]);
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

	hitTest(point: Point) {
		return distToPolygon(point, this.points) <= HIT_TEST_TOLERANCE;
	}

	draw(rc: RoughCanvas, ctx: CanvasRenderingContext2D) {
		rc.polygon(this.points, this.roughOptions);

		if (this.isSelected) {
			drawBounds(ctx, this.bounds);
			this.controls.forEach((c) => c.render(ctx));
		}
	}
}

export class Line implements BaseEntity<LineData> {
	id;
	type: LineType;
	roughOptions: RoughOptions;

	origin: Point;
	angle: number;
	length: number;

	isSelected: boolean = false;
	controls: Control<Line>[];

	constructor(options: ConstructorOptions<LineData>) {
		makeAutoObservable(this);
		this.id = options.id ?? generateId();
		this.type = options.type ?? 'line';
		this.roughOptions = getRoughOptions(options.roughOptions);
		this.origin = options.origin;
		this.angle = options.angle;
		this.length = options.length;
		this.controls = [
			new LinePointControl(this, true),
			new LinePointControl(this, false),
		];
	}

	toJSON(): LineData {
		return selectProps(this, [
			'id',
			'type',
			'roughOptions',
			'origin',
			'angle',
			'length',
		]);
	}

	get lineTo(): Point {
		return [
			this.origin[0] + this.length * Math.cos(this.angle),
			this.origin[1] + this.length * Math.sin(this.angle),
		];
	}

	get arrowPoints() {
		const length = 30;
		const spread = Math.PI / 7;
		const base: Point = [this.lineTo[0] + length, this.lineTo[1]];
		return [
			rotatePoint(this.lineTo, base, this.angle + Math.PI + spread),
			rotatePoint(this.lineTo, base, this.angle + Math.PI - spread),
		];
	}

	get segments(): Segments {
		let segments: Segments = [[this.origin, this.lineTo]];
		if (this.type === 'arrow') {
			const arrowPoints = this.arrowPoints;
			segments.push([this.lineTo, arrowPoints[0]]);
			segments.push([this.lineTo, arrowPoints[1]]);
		}
		return segments;
	}

	get bounds() {
		let points = [this.origin, this.lineTo];
		if (this.type === 'arrow') {
			points.push(...this.arrowPoints);
		}
		const bounds = calcBoundsFromPoints(points);
		return {
			left: bounds.left - BOUNDS_MARGIN,
			right: bounds.right + BOUNDS_MARGIN,
			top: bounds.top - BOUNDS_MARGIN,
			bottom: bounds.bottom + BOUNDS_MARGIN,
		};
	}

	hitTest(point: Point) {
		return distToSegments(point, this.segments) <= HIT_TEST_TOLERANCE;
	}

	draw(rc: RoughCanvas, ctx: CanvasRenderingContext2D) {
		this.segments.forEach(([[x1, y1], [x2, y2]]) => {
			rc.line(x1, y1, x2, y2, this.roughOptions);
		});

		if (this.isSelected) {
			drawBounds(ctx, this.bounds);
			this.controls.forEach((c) => c.render(ctx));
		}
	}
}

function generateId() {
	return nanoid(8);
}

function getRoughOptions(options?: RoughOptions): RoughOptions {
	return {
		seed: options?.seed ?? RoughGenerator.newSeed(),
		roughness: options?.roughness ?? DEFAULT_ROUGH_OPTIONS.roughness,
		curveFitting: options?.curveFitting ?? DEFAULT_ROUGH_OPTIONS.curveFitting,
		strokeWidth: options?.strokeWidth ?? DEFAULT_ROUGH_OPTIONS.strokeWidth,
		...options,
	};
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

export function createEntity(
	type: Entity['type'],
	[x0, y0]: Point,
	[x, y]: Point
): Entity {
	switch (type) {
		case 'rect':
			return new Rect({
				origin: [(x0 + x) / 2, (y0 + y) / 2],
				rotation: 0,
				width: x - x0,
				height: y - y0,
			});
		case 'circle':
			return new Circle({
				origin: [(x0 + x) / 2, (y0 + y) / 2],
				radius: Math.max((x - x0) / 2, (y - y0) / 2),
			});
		case 'cone':
			const defaultAngle = Math.PI / 6;
			const angle = calcAngle([x0, y0], [x, y]);
			return new Cone({
				origin: [x0, y0],
				radius: Math.hypot(x - x0, y - y0),
				start: angle - defaultAngle,
				end: angle + defaultAngle,
			});
		case 'line':
		case 'arrow':
			return new Line({
				type,
				origin: [x0, y0],
				angle: calcAngle([x0, y0], [x, y]),
				length: Math.hypot(x - x0, y - y0),
			});
	}
}

function selectProps<T extends U, U>(obj: T, keys: Array<keyof U>): U {
	const partial = {} as U;
	return keys.reduce((acc, key) => {
		acc[key] = obj[key];
		return acc;
	}, partial);
}

export function deserializeEntities(entities: EntityData[]): Entity[] {
	// eslint-disable-next-line array-callback-return
	return entities.map((entityData) => {
		switch (entityData.type) {
			case 'rect':
				return new Rect({ ...entityData });
			case 'circle':
				return new Circle({ ...entityData });
			case 'cone':
				return new Cone({ ...entityData });
			case 'line':
			case 'arrow':
				return new Line({ ...entityData });
		}
	});
}
