import { makeAutoObservable } from 'mobx';
import { RoughCanvas } from 'roughjs/bin/canvas';
import {
	BASE_CANVAS_SIZE,
	MIN_RADIUS,
	MIN_DIMENSION,
	MIN_LINE_LEN,
	MIN_ARROW_LEN,
} from 'renderer/constants';
import type { Entity } from 'renderer/entities';
import type { Control } from 'renderer/controls';
import type { Point } from 'renderer/geometry';

export type Tool = 'cursor' | Entity['type'];

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
	entityControlInUse: Control<any> | null = null;
	entityInCreation: Entity | null = null;

	constructor() {
		makeAutoObservable(this);
	}

	attach(el: HTMLCanvasElement) {
		if (this.canvas) {
			console.warn('canvas already attached');
			return;
		}

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
		this.context.clearRect(
			0,
			0,
			this.canvas.width / this.scale,
			this.canvas.height / this.scale
		);

		for (const entity of this.entities) {
			entity.draw(this.roughCanvas, this.context);
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
		const selectAfterAdd: Entity[] = [];

		for (const entity of entities) {
			if (this.validateEntity(entity)) {
				this.entities.push(entity);
				selectAfterAdd.push(entity);
			}
		}

		this.updateSelection(selectAfterAdd);
	}

	deleteEntities(toRemove: Entity[]) {
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
			default:
				isValid = entity.type.startsWith('mark');
		}

		return isValid;
	}
}

export const diagram = new Diagram();
