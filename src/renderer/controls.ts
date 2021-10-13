import { CONTROL_RADIUS, CONTROL_OFFSET } from 'renderer/constants';
import {
	calcAngle,
	Point,
	pointInCircle,
	rotatePoint,
} from 'renderer/geometry';
import { Circle, Cone, Rect } from 'renderer/entities';
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

function renderCircleControl(ctx: CanvasRenderingContext2D, [x, y]: Point) {
	ctx.save();

	ctx.strokeStyle = STROKE_STYLE;
	ctx.lineWidth = LINE_WIDTH;
	ctx.fillStyle = FILL_STYLE;

	ctx.beginPath();
	ctx.arc(x, y, CONTROL_RADIUS, 0, Math.PI * 2);
	ctx.fill();
	ctx.stroke();

	ctx.restore();
}

function hitTestCircleControl(point: Point, controlPosition: Point) {
	return pointInCircle(point, controlPosition, CONTROL_RADIUS);
}

export class CircleRadiusControl implements Control<Circle> {
	angle: number = -Math.PI / 4;

	constructor(public parent: Circle) {}

	get position(): Point {
		const [x0, y0] = this.parent.origin;
		return [
			x0 + this.parent.radius * Math.cos(this.angle),
			y0 + this.parent.radius * Math.sin(this.angle),
		];
	}

	render(ctx: CanvasRenderingContext2D) {
		renderCircleControl(ctx, this.position);
	}

	hitTest(point: Point) {
		return hitTestCircleControl(point, this.position);
	}

	handleDrag([x, y]: Point) {
		const [x0, y0] = this.parent.origin;
		this.angle = calcAngle([x0, y0], [x, y]);
		this.parent.radius = Math.hypot(x - x0, y - y0);
		diagram.render();
	}
}

export class ConeRadiusRotationControl implements Control<Cone> {
	constructor(public parent: Cone) {}

	get position(): Point {
		const midAngle = (this.parent.start + this.parent.end) / 2;
		const [x0, y0] = this.parent.origin;
		return [
			x0 + this.parent.radius * Math.cos(midAngle),
			y0 + this.parent.radius * Math.sin(midAngle),
		];
	}

	render(ctx: CanvasRenderingContext2D) {
		renderCircleControl(ctx, this.position);
	}

	hitTest(point: Point) {
		return hitTestCircleControl(point, this.position);
	}

	handleDrag([x, y]: Point) {
		const [x0, y0] = this.parent.origin;
		this.parent.radius = Math.hypot(x - x0, y - y0);

		const angleWidth = this.parent.end - this.parent.start;
		const midAngle = calcAngle(this.parent.origin, [x, y]);
		this.parent.start = midAngle - angleWidth / 2;
		this.parent.end = midAngle + angleWidth / 2;
		diagram.render();
	}
}

export class ConeAngleControl implements Control<Cone> {
	constructor(public parent: Cone) {}

	get position(): Point {
		const [x0, y0] = this.parent.origin;
		return [
			x0 + this.parent.radius * 0.5 * Math.cos(this.parent.end),
			y0 + this.parent.radius * 0.5 * Math.sin(this.parent.end),
		];
	}

	render(ctx: CanvasRenderingContext2D) {
		renderCircleControl(ctx, this.position);
	}

	hitTest(point: Point) {
		return hitTestCircleControl(point, this.position);
	}

	handleDrag(point: Point) {
		const pi2 = Math.PI * 2;
		let start = this.parent.start;
		// returns an angle from [-pi, pi]
		let end = calcAngle(this.parent.origin, point);
		if (end < start) end += pi2;
		// spooky stuff happens if the end angle is too close
		if ((end - start) % pi2 > pi2 - 0.1) {
			end = start + pi2 - 0.1;
		} else if (end - start < 0.1) {
			end = start + 0.1;
		}
		// wrap around if the arc overlaps
		if (end - start >= pi2) {
			start += pi2;
		}
		// keep values in range
		// while (start < -Math.PI && end < -Math.PI || start < -pi2 || end < -pi2) {
		while (start < -pi2 || end < -pi2) {
			start += pi2;
			end += pi2;
		}
		while (start > pi2 || end > pi2) {
			start -= pi2;
			end -= pi2;
		}
		this.parent.start = start;
		this.parent.end = end;
		diagram.render();
	}
}

export class RectCornerControl implements Control<Rect> {
	constructor(public parent: Rect, public pointIndex = 0 | 1 | 2 | 3) {}

	get position() {
		return this.parent.points[this.pointIndex];
	}

	render(ctx: CanvasRenderingContext2D) {
		renderCircleControl(ctx, this.position);
	}

	hitTest(point: Point) {
		return hitTestCircleControl(point, this.position);
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
		const distFromCenter = this.parent.height / 2 + CONTROL_OFFSET;
		const [x0, y0] = this.parent.origin;
		return rotatePoint(
			[x0, y0],
			[x0 + distFromCenter, y0],
			-this.angle + this.parent.rotation
		);
	}

	render(ctx: CanvasRenderingContext2D) {
		renderCircleControl(ctx, this.position);
	}

	hitTest(point: Point) {
		return hitTestCircleControl(point, this.position);
	}

	handleDrag(point: Point) {
		this.parent.rotation = this.angle + calcAngle(this.parent.origin, point);
		diagram.render();
	}
}
