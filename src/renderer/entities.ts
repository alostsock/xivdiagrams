import { makeAutoObservable, toJS } from 'mobx';
import { nanoid } from 'nanoid';
import type { RoughCanvas } from 'roughjs/bin/canvas';
import type { Options as RoughOptions } from 'roughjs/bin/core';
import { RoughGenerator } from 'roughjs/bin/generator';
import { getStroke } from 'perfect-freehand';
import {
	BOUNDS_STYLE,
	HIT_TEST_TOLERANCE,
	DEFAULT_ROUGH_OPTIONS,
	ARROWHEAD_LEN,
	ARROWHEAD_ANGLE,
	FREEHAND_POINT_PRECISION,
	FREEHAND_OPTIONS,
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
	pointInBounds,
} from 'renderer/geometry';
import {
	Control,
	CircleRadiusControl,
	CircleInnerRadiusControl,
	RectCornerControl,
	RectRotationControl,
	ConeRadiusRotationControl,
	ConeInnerRadiusControl,
	ConeAngleControl,
	LinePointControl,
	MarkSizeControl,
} from 'renderer/controls';
import { diagram } from 'renderer/diagram';
import { IconName } from 'data/icons';

interface BaseData {
	id: string;
	type: string;
}

export interface CircleData extends BaseData {
	type: 'circle';
	roughOptions: RoughOptions;
	origin: Point;
	radius: number;
	innerRadius: number;
	innerRadiusDrawingStartAngle: number;
}

export interface ConeData extends BaseData {
	type: 'cone';
	roughOptions: RoughOptions;
	origin: Point;
	radius: number;
	innerRadius: number;
	start: number;
	end: number;
}

export interface RectData extends BaseData {
	type: 'rect';
	roughOptions: RoughOptions;
	origin: Point;
	width: number;
	height: number;
	rotation: number;
}

type LineType = 'line' | 'arrow';

export interface LineData extends BaseData {
	type: LineType;
	roughOptions: RoughOptions;
	origin: Point;
	angle: number;
	length: number;
}

export type MarkType = `mark-${IconName}`;

export interface MarkData extends BaseData {
	type: MarkType;
	origin: Point;
	size: number;
}

export interface FreehandData extends BaseData {
	type: 'freehand';
	points: Points;
}

export type EntityData =
	| CircleData
	| ConeData
	| RectData
	| LineData
	| MarkData
	| FreehandData;

type ConstructorOptions<T extends BaseData> = PartialBy<T, keyof BaseData>;

type BaseEntity<T extends BaseData> = T & {
	isSelected: boolean;
	controls: Control<BaseEntity<T>>[];
	bounds: Bounds;
	hitTest: (point: Point) => boolean;
	draw: (rc: RoughCanvas, ctx: CanvasRenderingContext2D) => void;
	toJSON: () => T;
};

export type Entity = Circle | Cone | Rect | Line | Mark | Freehand;

export class Circle implements BaseEntity<CircleData> {
	id;
	type: 'circle' = 'circle';
	roughOptions: RoughOptions;

	origin: Point;
	radius: number;
	innerRadius: number;
	innerRadiusDrawingStartAngle: number;

	isSelected: boolean = false;
	controls: Control<Circle>[];

	constructor(options: ConstructorOptions<CircleData>) {
		makeAutoObservable(this);
		this.id = options.id ?? generateId();
		this.roughOptions = getRoughOptions(options.roughOptions);
		this.origin = options.origin;
		this.radius = options.radius;
		this.innerRadius = options.innerRadius;
		this.innerRadiusDrawingStartAngle = options.innerRadiusDrawingStartAngle;
		this.controls = [
			new CircleRadiusControl(this),
			new CircleInnerRadiusControl(this),
		];
	}

	toJSON(): CircleData {
		return selectProps<Circle, CircleData>(this, [
			'id',
			'type',
			'roughOptions',
			'origin',
			'radius',
			'innerRadius',
			'innerRadiusDrawingStartAngle',
		]);
	}

	get bounds(): Bounds {
		const [x, y] = this.origin;
		return {
			left: x - this.radius,
			right: x + this.radius,
			top: y - this.radius,
			bottom: y + this.radius,
		};
	}

	hitTest(point: Point) {
		return (
			distToCircle(point, this.origin, this.radius) <= HIT_TEST_TOLERANCE ||
			distToCircle(point, this.origin, this.innerRadius) <= HIT_TEST_TOLERANCE
		);
	}

	draw(rc: RoughCanvas, ctx: CanvasRenderingContext2D) {
		const [x, y] = this.origin;
		if (this.innerRadius === 0) {
			rc.circle(x, y, 2 * this.radius, this.roughOptions);
		} else {
			const start = this.innerRadiusDrawingStartAngle;
			const end = start + Math.PI * 2 - 0.000001;
			// outer arc, clockwise
			const p1 = rotatePoint(this.origin, [x + this.radius, y], start);
			const p2 = rotatePoint([x, y], [x + this.radius, y], end);
			// inner arc, counter-clockwise
			const p3 = rotatePoint([x, y], [x + this.innerRadius, y], start);
			const p4 = rotatePoint([x, y], [x + this.innerRadius, y], end);

			const path =
				`M ${p1[0]} ${p1[1]}` +
				`A ${this.radius} ${this.radius}` +
				`  0 ${end - start > Math.PI ? 1 : 0} 1` +
				`  ${p2[0]} ${p2[1]} Z` +
				`M ${p4[0]} ${p4[1]}` +
				`A ${this.innerRadius} ${this.innerRadius}` +
				`  0 ${end - start > Math.PI ? 1 : 0} 0` +
				`  ${p3[0]} ${p3[1]} Z`;

			if (this.roughOptions.fillStyle === 'solid') {
				// workaround for a bug with the 'solid' fill style.
				// kind of related: https://github.com/rough-stuff/rough/issues/183

				// render just the fill, with a perfect circle
				rc.path(path, {
					...this.roughOptions,
					stroke: 'none',
					maxRandomnessOffset: 0,
					combineNestedSvgPaths: true,
				});
				// render just the stroke
				rc.path(path, {
					...this.roughOptions,
					fill: undefined,
					combineNestedSvgPaths: true,
				});
			} else {
				rc.path(path, {
					...this.roughOptions,
					combineNestedSvgPaths: true,
				});
			}
		}

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
	innerRadius: number;
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
		this.innerRadius = options.innerRadius;
		this.start = options.start;
		this.end = options.end;
		this.controls = [
			new ConeRadiusRotationControl(this),
			new ConeInnerRadiusControl(this),
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
			'innerRadius',
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

		return calcBoundsFromPoints(points);
	}

	hitTest(point: Point) {
		return (
			distToCone(
				point,
				this.origin,
				this.radius,
				this.innerRadius,
				this.start,
				this.end
			) <= HIT_TEST_TOLERANCE
		);
	}

	draw(rc: RoughCanvas, ctx: CanvasRenderingContext2D) {
		const [x0, y0] = this.origin;

		// use `rc.path` instead of `rc.arc`. advantages:
		// 1) it looks more similar to other shapes
		// 2) roughjs has a bug with 'solid' fills for arcs
		// 3) allows us to add donut shapes later (with an inner radius)
		const p1 = rotatePoint(this.origin, [x0 + this.radius, y0], this.start);
		const p2 = rotatePoint(this.origin, [x0 + this.radius, y0], this.end);

		if (this.innerRadius === 0) {
			const path =
				`M ${p1[0]} ${p1[1]}` +
				`A ${this.radius} ${this.radius}` +
				`  0 ${this.end - this.start > Math.PI ? 1 : 0} 1` +
				`  ${p2[0]} ${p2[1]}` +
				`L ${x0} ${y0} Z`;

			rc.path(path, this.roughOptions);
		} else {
			// inner arc, counter-clockwise

			const p3 = rotatePoint(
				this.origin,
				[x0 + this.innerRadius, y0],
				this.end
			);
			const p4 = rotatePoint(
				this.origin,
				[x0 + this.innerRadius, y0],
				this.start
			);

			const path =
				`M ${p1[0]} ${p1[1]}` +
				`A ${this.radius} ${this.radius}` +
				`  0 ${this.end - this.start > Math.PI ? 1 : 0} 1` +
				`  ${p2[0]} ${p2[1]}` +
				`L ${p3[0]} ${p3[1]}` +
				`A ${this.innerRadius} ${this.innerRadius}` +
				`  0 ${this.end - this.start > Math.PI ? 1 : 0} 0` +
				`  ${p4[0]} ${p4[1]} Z`;

			rc.path(path, { ...this.roughOptions, combineNestedSvgPaths: true });
		}

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
				this.width + 2,
				this.height + 2,
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
		const base: Point = [this.lineTo[0] + ARROWHEAD_LEN, this.lineTo[1]];
		return [
			rotatePoint(this.lineTo, base, this.angle + Math.PI + ARROWHEAD_ANGLE),
			rotatePoint(this.lineTo, base, this.angle + Math.PI - ARROWHEAD_ANGLE),
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
			left: bounds.left,
			right: bounds.right,
			top: bounds.top,
			bottom: bounds.bottom,
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

export class Mark implements BaseEntity<MarkData> {
	id;
	type: MarkType;

	origin: Point;
	size: number;

	isSelected: boolean = false;
	controls: Control<Mark>[];

	constructor(options: ConstructorOptions<MarkData> & { type: MarkType }) {
		makeAutoObservable(this);
		this.id = options.id ?? generateId();
		this.type = options.type;
		this.origin = options.origin;
		this.size = options.size;
		this.controls = [new MarkSizeControl(this)];
	}

	toJSON(): MarkData {
		return selectProps(this, ['id', 'type', 'origin', 'size']);
	}

	get points(): Points {
		return calcRectPoints(this.origin, this.size, this.size, 0);
	}

	get bounds(): Bounds {
		return calcBoundsFromPoints(this.points);
	}

	hitTest(point: Point) {
		return pointInBounds(point, this.bounds);
	}

	draw(_rc: RoughCanvas, ctx: CanvasRenderingContext2D) {
		const img = document.getElementById(this.type) as HTMLImageElement;
		ctx.drawImage(
			img,
			this.origin[0] - this.size / 2,
			this.origin[1] - this.size / 2,
			this.size,
			this.size
		);

		if (this.isSelected) {
			drawBounds(ctx, this.bounds);
			this.controls.forEach((c) => c.render(ctx));
		}
	}
}

export class Freehand implements BaseEntity<FreehandData> {
	id;
	type: 'freehand' = 'freehand';

	points: Points;
	strokePoints: Points = [];
	path: string = '';

	isSelected: boolean = false;
	controls: Control<Freehand>[];

	constructor(options: ConstructorOptions<FreehandData>) {
		// explicitly untrack huge data structures.
		makeAutoObservable(this, {
			strokePoints: false,
			path: false,
		});
		this.id = options.id ?? generateId();
		this.points = options.points;
		this.calculatePath();
		this.controls = [];
	}

	get origin() {
		return this.points[0];
	}

	set origin([x, y]) {
		const offset: Point = [x - this.points[0][0], y - this.points[0][1]];

		this.points = this.points.map(
			(p) => [p[0] + offset[0], p[1] + offset[1]] as Point
		);
		this.calculatePath();
	}

	toJSON(): FreehandData {
		return selectProps(this, ['id', 'type', 'points']);
	}

	addPoint([x, y]: Point) {
		const newPoint: Point = [
			Number(x.toPrecision(FREEHAND_POINT_PRECISION)),
			Number(y.toPrecision(FREEHAND_POINT_PRECISION)),
		];
		this.points.push(newPoint);
		this.calculatePath();
	}

	// eagerly calculate stroke points ahead of time, otherwise `draw` has to do
	// a lot of work on every diagram rerender.
	calculatePath(): void {
		this.strokePoints = getStroke(
			toJS(this.points),
			FREEHAND_OPTIONS
		) as Points;
		this.path = getSvgPathFromStroke(this.strokePoints);
	}

	get bounds(): Bounds {
		return calcBoundsFromPoints(this.strokePoints);
	}

	hitTest(point: Point) {
		const segments: Segments = [];
		for (let i = 0; i < this.strokePoints.length - 1; i++) {
			segments.push([this.strokePoints[i], this.strokePoints[i + 1]]);
		}
		return distToSegments(point, segments) <= HIT_TEST_TOLERANCE;
	}

	draw(_rc: RoughCanvas, ctx: CanvasRenderingContext2D) {
		ctx.fill(new Path2D(this.path));

		if (this.isSelected) {
			drawBounds(ctx, this.bounds);
			this.controls.forEach((c) => c.render(ctx));
		}
	}
}

export function getSvgPathFromStroke(stroke: Points) {
	if (!stroke.length) return '';

	const d = stroke.reduce(
		(acc, [x0, y0], i, arr) => {
			const [x1, y1] = arr[(i + 1) % arr.length];
			acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
			return acc;
		},
		['M', ...stroke[0], 'Q']
	);

	d.push('Z');
	return d.join(' ');
}

function generateId() {
	return nanoid(8);
}

function getRoughOptions(options?: RoughOptions): RoughOptions {
	return {
		seed: options?.seed ?? RoughGenerator.newSeed(),
		hachureAngle: Math.floor(Math.random() * 90),
		...DEFAULT_ROUGH_OPTIONS,
		...options,
	};
}

function drawBounds(ctx: CanvasRenderingContext2D, bounds: Bounds) {
	const { left, right, top, bottom } = bounds;
	ctx.save();

	ctx.strokeStyle = BOUNDS_STYLE;
	ctx.lineWidth = 1 * diagram.windowScaleFactor;

	ctx.beginPath();
	ctx.moveTo(left, top);
	ctx.lineTo(right, top);
	ctx.lineTo(right, bottom);
	ctx.lineTo(left, bottom);
	ctx.closePath();

	ctx.stroke();

	ctx.restore();
}

export function createFromAnchorPoints(
	type: Extract<Entity['type'], 'rect' | 'circle' | 'cone' | LineType>,
	[x0, y0]: Point,
	[x, y]: Point
) {
	switch (type) {
		case 'rect':
			return new Rect({
				origin: [(x0 + x) / 2, (y0 + y) / 2],
				rotation: 0,
				width: Math.abs(x - x0),
				height: Math.abs(y - y0),
				roughOptions: getRoughOptions(),
			});
		case 'circle':
			return new Circle({
				origin: [(x0 + x) / 2, (y0 + y) / 2],
				radius: Math.max(Math.abs((x - x0) / 2), Math.abs((y - y0) / 2)),
				innerRadius: 0,
				innerRadiusDrawingStartAngle: Math.random() * Math.PI * 2,
				roughOptions: getRoughOptions(),
			});
		case 'cone':
			const defaultAngle = Math.PI / 6;
			const angle = calcAngle([x0, y0], [x, y]);
			return new Cone({
				origin: [x0, y0],
				radius: Math.hypot(x - x0, y - y0),
				innerRadius: 0,
				start: angle - defaultAngle,
				end: angle + defaultAngle,
				roughOptions: getRoughOptions(),
			});
		case 'line':
		case 'arrow':
			return new Line({
				type,
				origin: [x0, y0],
				angle: calcAngle([x0, y0], [x, y]),
				length: Math.hypot(x - x0, y - y0),
				roughOptions: getRoughOptions(),
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
			case 'freehand':
				return new Freehand({ ...entityData });
			default:
				return new Mark({ ...entityData });
		}
	});
}
