import { calcAngle, Point, pointInCircle } from 'renderer/geometry';
import { Circle } from 'renderer/entities';
import { diagram } from 'renderer/diagram';

export interface Control<T> {
	parent: T;
	position: Point;
	render: (ctx: CanvasRenderingContext2D) => void;
	hitTest: (point: Point) => boolean;
	handleDrag: (point: Point) => void;
}

export class CircleRadiusControl implements Control<Circle> {
	angle: number = -Math.PI / 4;
	radius: number = 8;

	constructor(public parent: Circle) {}

	get position(): Point {
		const [x0, y0] = this.parent.origin;
		const distFromCenter = this.parent.radius;
		const x = x0 + distFromCenter * Math.cos(this.angle);
		const y = y0 + distFromCenter * Math.sin(this.angle);
		return [x, y];
	}

	render(ctx: CanvasRenderingContext2D) {
		const [x, y] = this.position;
		ctx.save();

		ctx.strokeStyle = '#0060DF';
		ctx.lineWidth = 3;
		ctx.fillStyle = '#FFF';

		ctx.beginPath();
		ctx.arc(x, y, this.radius, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		ctx.restore();
	}

	hitTest(point: Point) {
		return pointInCircle(point, this.position, this.radius);
	}

	handleDrag([x, y]: Point) {
		const [x0, y0] = this.parent.origin;
		this.angle = calcAngle([x0, y0], [x, y]);
		this.parent.radius = Math.hypot(x - x0, y - y0);
		diagram.render();
	}
}
