import {
	calcAngle,
	Point,
	pointInCircle,
	rotatePoint,
} from 'renderer/geometry';
import { Circle, Rect } from 'renderer/entities';
import { diagram } from 'renderer/diagram';

const STROKE_STYLE = '#0060DF';
const LINE_WIDTH = 2;
const FILL_STYLE = '#FFF';

export interface Control<T> {
	parent: T;
	position: Point;
	render: (ctx: CanvasRenderingContext2D) => void;
	hitTest: (point: Point) => boolean;
	handleDrag: (point: Point) => void;
}

function renderCircleControl(
	ctx: CanvasRenderingContext2D,
	[x, y]: Point,
	radius: number
) {
	ctx.save();

	ctx.strokeStyle = STROKE_STYLE;
	ctx.lineWidth = LINE_WIDTH;
	ctx.fillStyle = FILL_STYLE;

	ctx.beginPath();
	ctx.arc(x, y, radius, 0, Math.PI * 2);
	ctx.fill();
	ctx.stroke();

	ctx.restore();
}

export class CircleRadiusControl implements Control<Circle> {
	angle: number = -Math.PI / 4;

	constructor(public parent: Circle) {}

	get position(): Point {
		const [x0, y0] = this.parent.origin;
		const distFromCenter = this.parent.radius;
		const x = x0 + distFromCenter * Math.cos(this.angle);
		const y = y0 + distFromCenter * Math.sin(this.angle);
		return [x, y];
	}

	render(ctx: CanvasRenderingContext2D) {
		renderCircleControl(ctx, this.position, 7);
	}

	hitTest(point: Point) {
		return pointInCircle(point, this.position, 7);
	}

	handleDrag([x, y]: Point) {
		const [x0, y0] = this.parent.origin;
		this.angle = calcAngle([x0, y0], [x, y]);
		this.parent.radius = Math.hypot(x - x0, y - y0);
		diagram.render();
	}
}

export class RectCornerControl implements Control<Rect> {
	constructor(public parent: Rect, public pointIndex = 0 | 1 | 2 | 3) {}

	get position() {
		return this.parent.points[this.pointIndex];
	}

	render(ctx: CanvasRenderingContext2D) {
		renderCircleControl(ctx, this.position, 7);
	}

	hitTest(point: Point) {
		return pointInCircle(point, this.position, 7);
	}

	handleDrag(point: Point) {
		// first anchor point -- the dragged corner
		const [x1, y1] = point;
		// the other anchor point will always be opposite on a rectangle
		const [x2, y2] = this.parent.points[(this.pointIndex + 2) % 4];
		this.parent.origin = [(x1 + x2) / 2, (y1 + y2) / 2];
		// get width/height between anchor points on an un-rotated axis
		const [rx, ry] = rotatePoint([x2, y2], [x1, y1], -this.parent.rotation);
		this.parent.width = Math.abs(x2 - rx);
		this.parent.height = Math.abs(y2 - ry);
		diagram.render();
	}
}

export class RectRotationControl implements Control<Rect> {
	angle = Math.PI / 2; // should appear at the 'top' of a rect

	constructor(public parent: Rect) {}

	get position() {
		const distFromCenter = this.parent.height / 2 + 20;
		const [x0, y0] = this.parent.origin;
		return rotatePoint(
			[x0, y0],
			[x0 + distFromCenter, y0],
			-this.angle + this.parent.rotation
		);
	}

	render(ctx: CanvasRenderingContext2D) {
		renderCircleControl(ctx, this.position, 7);
	}

	hitTest(point: Point) {
		return pointInCircle(point, this.position, 7);
	}

	handleDrag(point: Point) {
		this.parent.rotation = this.angle + calcAngle(this.parent.origin, point);
		diagram.render();
	}
}
