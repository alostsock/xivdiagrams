import { makeAutoObservable } from 'mobx';
import { RoughCanvas } from 'roughjs/bin/canvas';
import {
	BASE_CANVAS_SIZE,
	MIN_RADIUS,
	MIN_DIMENSION,
	MIN_LINE_LEN,
	MIN_ARROW_LEN,
	MIN_MARK_SIZE,
} from 'renderer/constants';
import type { Entity, EntityData, Mark } from 'renderer/entities';
import { drawBounds } from 'renderer/entities';
import type { Control } from 'renderer/controls';
import { Point, calcBoundsFromPoints } from 'renderer/geometry';
import { history } from 'renderer/history';
import type { Tool } from 'components/Toolset';

type CursorType = 'default' | 'crosshair' | 'move' | 'grab' | 'grabbing';

class Diagram {
	canvas: HTMLCanvasElement | null = null;
	roughCanvas: RoughCanvas | null = null;
	context: CanvasRenderingContext2D | null = null;
	scale: number = 1;

	// diagram state
	entities: Entity[] = [];

	// ui state
	selectedTool: Tool = 'cursor';
	cursorType: CursorType = 'default';

	// interaction state
	selectedEntities: Entity[] = [];
	dragAnchor: Point | null = null;
	isDraggingEntities: boolean = false;
	selectionPoints: [Point, Point] | null = null;
	entityControlInUse: Control<any> | null = null;
	entityInCreation: Exclude<Entity, Mark> | null = null;
	lastCursorPosition: Point = [0, 0];
	copyData: { entityData: EntityData[]; origin: Point } | null = null;

	constructor() {
		makeAutoObservable(this);
	}

	get windowScaleFactor() {
		return window.devicePixelRatio / this.scale;
	}

	attach(el: HTMLCanvasElement) {
		if (this.canvas) return;

		this.canvas = el;
		this.roughCanvas = new RoughCanvas(el);
		this.context = el.getContext('2d');
		this.context!.imageSmoothingEnabled = false;
		this.resize();
	}

	resize(): void {
		if (!this.canvas || !this.context) return;
		const parent = this.canvas.parentElement;
		if (!parent) return;

		// keep canvas a square
		const size = Math.min(parent.clientWidth, parent.clientHeight);
		this.canvas.style.width = `${size}px`;
		this.canvas.style.height = `${size}px`;

		this.canvas.width = size * window.devicePixelRatio;
		this.canvas.height = size * window.devicePixelRatio;

		this.scale = (size * window.devicePixelRatio) / BASE_CANVAS_SIZE;
		this.context.scale(this.scale, this.scale);

		diagram.render();
	}

	render(): void {
		if (!this.canvas || !this.roughCanvas || !this.context) return;
		const width = this.canvas.width / this.scale;
		const height = this.canvas.height / this.scale;
		this.context.clearRect(0, 0, width, height);

		this.context.save();
		this.context.fillStyle = '#fffefc';
		this.context.fillRect(0, 0, width, height);
		this.context.restore();

		if (this.selectionPoints) {
			const { left, right, top, bottom } = calcBoundsFromPoints(
				this.selectionPoints
			);
			this.context.save();
			this.context.beginPath();
			this.context.fillStyle = 'rgba(24, 133, 231, 0.15)';
			this.context.rect(left, top, right - left, bottom - top);
			this.context.fill();
			this.context.strokeStyle = 'rgba(24, 133, 231, 0.75)';
			this.context.lineWidth = 1;
			this.context.stroke();
			this.context.restore();
		}

		for (const entity of this.entities) {
			this.context.save();
			entity.draw(this.roughCanvas, this.context);

			if (entity.isSelected) {
				drawBounds(this.context, entity.bounds);

				if (this.selectedEntities.length === 1) {
					entity.controls.forEach((c) => c.render(this.context!));
				}
			}
			this.context.restore();
		}

		if (this.entityInCreation) {
			this.entityInCreation.draw(this.roughCanvas, this.context);
		}
	}

	updateSelection(selected: Entity[]) {
		const selectedIds = new Set(selected.map((e) => e.id));
		this.entities.forEach((e) => (e.isSelected = selectedIds.has(e.id)));
		this.sortEntities();
		this.selectedEntities = this.entities.filter((e) => e.isSelected);
		this.render();
	}

	private sortEntities() {
		this.entities.sort((a, b) => {
			if (a.isSelected === b.isSelected) {
				// marks should be rendered on top
				// maybe add z-index/layer properties to `Entity` classes later
				const aIsMark = a.type.startsWith('mark');
				const bIsMark = b.type.startsWith('mark');
				if (aIsMark === bIsMark) {
					return 0;
				} else {
					return aIsMark ? 1 : -1;
				}
			} else {
				return a.isSelected ? 1 : -1;
			}
		});
	}

	addEntities(entities: Entity[]) {
		if (entities.length === 0) return;

		history.save();

		const selectAfterAdd: Entity[] = [];

		for (const entity of entities) {
			if (this.validateEntity(entity)) {
				this.entities.push(entity);
				if (entity.type !== 'freehand') {
					selectAfterAdd.push(entity);
				}
			}
		}

		this.updateSelection(selectAfterAdd);
	}

	deleteEntities(toRemove: Entity[]) {
		if (toRemove.length === 0) return;

		history.save();

		const idsToRemove = new Set(toRemove.map((e) => e.id));
		this.entities = this.entities.filter((e) => !idsToRemove.has(e.id));
		this.updateSelection([]);
	}

	validateEntity(entity: Entity): boolean {
		let isValid = false;

		switch (entity.type) {
			case 'circle':
				isValid = entity.radius > MIN_RADIUS;
				break;
			case 'cone':
				isValid = entity.radius > MIN_RADIUS * 2;
				break;
			case 'rect':
				isValid = entity.width > MIN_DIMENSION || entity.height > MIN_DIMENSION;
				break;
			case 'line':
				isValid = entity.length > MIN_LINE_LEN;
				break;
			case 'arrow':
				isValid = entity.length > MIN_ARROW_LEN;
				break;
			case 'freehand':
				isValid = entity.points.length > 0;
				break;
			case 'mark':
				isValid = entity.size > MIN_MARK_SIZE;
				break;
		}

		return isValid;
	}
}

export const diagram = new Diagram();
