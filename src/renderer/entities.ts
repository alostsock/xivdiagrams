import { makeAutoObservable } from 'mobx';
import { nanoid } from 'nanoid';
import type { RoughCanvas } from 'roughjs/bin/canvas';
import type { Options as RoughOptions } from 'roughjs/bin/core';
import { RoughGenerator } from 'roughjs/bin/generator';
import { getStroke } from 'perfect-freehand';
import {
	BOUNDS_STYLE,
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
	averagePoints,
} from 'renderer/geometry';
import {
	Control,
	CircleRadiusControl,
	CircleInnerRadiusControl,
	RectAnchorPointControl,
	RectHeightControl,
	ConeRadiusRotationControl,
	ConeInnerRadiusControl,
	ConeAngleControl,
	LinePointControl,
	MarkSizeRotationControl,
} from 'renderer/controls';
import { diagram } from 'renderer/diagram';
import { imageCache } from 'renderer/image-cache';
import { MarkName, createSvgDataUrl } from 'data/marks';

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

export interface MarkData extends BaseData {
	type: 'mark';
	name: MarkName;
	colors: string[];
	origin: Point;
	size: number;
	rotation: number;
	rotatable: boolean;
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

export type ConstructorOptions<T extends BaseData> = PartialBy<
	T,
	keyof BaseData
>;

type BaseEntity<T extends BaseData> = T & {
	isSelected: boolean;
	controls: Control<BaseEntity<T>>[];
	bounds: Bounds;
	distance: (point: Point) => number;
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

	isSelected = false;
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

	distance(point: Point) {
		if (this.innerRadius === 0) {
			return distToCircle(point, this.origin, this.radius);
		} else {
			return Math.min(
				distToCircle(point, this.origin, this.radius),
				distToCircle(point, this.origin, this.innerRadius)
			);
		}
	}

	draw(rc: RoughCanvas) {
		const [x, y] = this.origin;
		const start = this.innerRadiusDrawingStartAngle;
		const end = start + Math.PI * 2 - 0.000001;
		// outer arc, clockwise
		const p1 = rotatePoint(this.origin, [x + this.radius, y], start);
		const p2 = rotatePoint([x, y], [x + this.radius, y], end);
		// inner arc, counter-clockwise
		const p3 = rotatePoint([x, y], [x + this.innerRadius, y], start);
		const p4 = rotatePoint([x, y], [x + this.innerRadius, y], end);

		let path =
			`M ${p1[0]} ${p1[1]}` +
			`A ${this.radius} ${this.radius}` +
			`  0 ${end - start > Math.PI ? 1 : 0} 1` +
			`  ${p2[0]} ${p2[1]} Z`;
		if (this.innerRadius > 0) {
			path +=
				`M ${p4[0]} ${p4[1]}` +
				`A ${this.innerRadius} ${this.innerRadius}` +
				`  0 ${end - start > Math.PI ? 1 : 0} 0` +
				`  ${p3[0]} ${p3[1]} Z`;
		}

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

	isSelected = false;
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

	distance(point: Point) {
		return distToCone(
			point,
			this.origin,
			this.radius,
			this.innerRadius,
			this.start,
			this.end
		);
	}

	draw(rc: RoughCanvas) {
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

	isSelected = false;
	controls: Control<Rect>[];

	constructor(options: ConstructorOptions<RectData>) {
		makeAutoObservable(this);
		this.id = options.id ?? generateId();
		this.roughOptions = getRoughOptions(options.roughOptions);
		this.origin = options.origin;
		this.width = options.width;
		this.height = options.height;
		this.rotation = options.rotation;
		this.controls = [
			new RectAnchorPointControl(this, false),
			new RectAnchorPointControl(this, true),
			new RectHeightControl(this, 0),
			new RectHeightControl(this, 2),
		];
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

	distance(point: Point) {
		return distToPolygon(point, this.points);
	}

	draw(rc: RoughCanvas) {
		rc.polygon(this.points, this.roughOptions);
	}
}

export class Line implements BaseEntity<LineData> {
	id;
	type: LineType;
	roughOptions: RoughOptions;

	origin: Point;
	angle: number;
	length: number;

	isSelected = false;
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
		const segments: Segments = [[this.origin, this.lineTo]];
		if (this.type === 'arrow') {
			const arrowPoints = this.arrowPoints;
			segments.push([this.lineTo, arrowPoints[0]]);
			segments.push([this.lineTo, arrowPoints[1]]);
		}
		return segments;
	}

	get bounds() {
		const points = [this.origin, this.lineTo];
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

	distance(point: Point) {
		return distToSegments(point, this.segments);
	}

	draw(rc: RoughCanvas) {
		this.segments.forEach(([[x1, y1], [x2, y2]]) => {
			rc.line(x1, y1, x2, y2, this.roughOptions);
		});
	}
}

export class Mark implements BaseEntity<MarkData> {
	id;
	type: 'mark' = 'mark';

	name: MarkName;
	colors: string[];
	origin: Point;
	size: number;
	rotation: number;
	rotatable: boolean;

	isSelected = false;
	controls: Control<Mark>[];

	image: HTMLImageElement;

	constructor(options: ConstructorOptions<MarkData>) {
		makeAutoObservable(this);
		this.id = options.id ?? generateId();
		this.name = options.name;
		this.colors = options.colors;
		this.origin = options.origin;
		this.size = options.size;
		this.rotation = options.rotation;
		this.rotatable = options.rotatable;
		this.controls = [new MarkSizeRotationControl(this)];

		const colors = this.colors.length > 0 ? this.colors : undefined;
		this.image = imageCache.get(createSvgDataUrl(this.name, colors), 'mark');
	}

	toJSON(): MarkData {
		return selectProps(this, [
			'id',
			'type',
			'name',
			'colors',
			'origin',
			'size',
			'rotation',
			'rotatable',
		]);
	}

	get points(): Points {
		return calcRectPoints(this.origin, this.size, this.size, 0);
	}

	get bounds(): Bounds {
		return calcBoundsFromPoints(this.points);
	}

	distance(point: Point) {
		return pointInBounds(point, this.bounds) ? 0 : Infinity;
	}

	draw(_rc: RoughCanvas, ctx: CanvasRenderingContext2D) {
		if (!this.image.complete) return;

		const [x, y] = this.origin;
		const dx = x - this.size / 2;
		const dy = y - this.size / 2;

		ctx.save();
		ctx.translate(x, y);
		ctx.rotate(this.rotation);
		ctx.translate(-x, -y);
		ctx.drawImage(this.image, dx, dy, this.size, this.size);
		ctx.restore();
	}
}

export class Freehand implements BaseEntity<FreehandData> {
	id;
	type: 'freehand' = 'freehand';

	points: Points;
	strokePoints: Points = [];
	path = '';

	isSelected = false;
	controls: Control<Freehand>[];

	constructor(options: ConstructorOptions<FreehandData>) {
		// explicitly untrack huge data structures.
		makeAutoObservable(this, {
			origin: false,
			points: false,
			bounds: false,
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
		this.strokePoints = getStroke(this.points, FREEHAND_OPTIONS) as Points;
		this.path = getSvgPathFromStroke(this.strokePoints);
	}

	get bounds(): Bounds {
		return calcBoundsFromPoints(this.strokePoints);
	}

	distance(point: Point) {
		const segments: Segments = [];
		for (let i = 0; i < this.strokePoints.length - 1; i++) {
			segments.push([this.strokePoints[i], this.strokePoints[i + 1]]);
		}
		return distToSegments(point, segments);
	}

	draw(_rc: RoughCanvas, ctx: CanvasRenderingContext2D) {
		ctx.fill(new Path2D(this.path));
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

export function getRoughOptions(options?: RoughOptions): RoughOptions {
	const precise = diagram.drawPrecisely;

	const precisionOptions: RoughOptions = {
		strokeWidth: precise ? 1.4 : 1,
		roughness: precise ? 0 : 1,
		bowing: precise ? 0 : 1,
		curveFitting: precise ? 1 : 0.98,
		maxRandomnessOffset: precise ? 0 : 2,
		disableMultiStroke: precise ? true : false,
		disableMultiStrokeFill: precise ? true : false,
	};

	return {
		stroke: '#1a1f26',
		hachureAngle: Math.floor(Math.random() * 90),
		...options,
		seed: options?.seed ?? RoughGenerator.newSeed(),
		...precisionOptions,
	};
}

export function drawBounds(ctx: CanvasRenderingContext2D, bounds: Bounds) {
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
	[x, y]: Point,
	seed?: number
) {
	switch (type) {
		case 'rect':
			return new Rect({
				origin: averagePoints([
					[x0, y0],
					[x, y],
				]),
				rotation: calcAngle([x0, y0], [x, y]),
				width: Math.hypot(x - x0, y - y0),
				height: 50,
				roughOptions: getRoughOptions({ seed }),
			});
		case 'circle':
			return new Circle({
				origin: [x0, y0],
				radius: Math.hypot(x - x0, y - y0),
				innerRadius: 0,
				innerRadiusDrawingStartAngle: Math.random() * Math.PI * 2,
				roughOptions: getRoughOptions({ seed }),
			});
		case 'cone': {
			const defaultAngle = Math.PI / 6;
			const angle = calcAngle([x0, y0], [x, y]);
			return new Cone({
				origin: [x0, y0],
				radius: Math.hypot(x - x0, y - y0),
				innerRadius: 0,
				start: angle - defaultAngle,
				end: angle + defaultAngle,
				roughOptions: getRoughOptions({ seed }),
			});
		}
		case 'line':
		case 'arrow':
			return new Line({
				type,
				origin: [x0, y0],
				angle: calcAngle([x0, y0], [x, y]),
				length: Math.hypot(x - x0, y - y0),
				roughOptions: getRoughOptions({ seed }),
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

export function deserializeEntities(
	entities: EntityData[],
	reuseIds = true
): Entity[] {
	return entities.map((entityData) => {
		const options: EntityData = reuseIds
			? entityData
			: { ...entityData, id: generateId() };

		switch (options.type) {
			case 'rect':
				return new Rect(options);
			case 'circle':
				return new Circle(options);
			case 'cone':
				return new Cone(options);
			case 'line':
			case 'arrow':
				return new Line(options);
			case 'freehand':
				return new Freehand(options);
			case 'mark':
				return new Mark(options);
		}
	});
}
