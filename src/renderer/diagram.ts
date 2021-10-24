import { makeAutoObservable } from 'mobx';
import { RoughCanvas } from 'roughjs/bin/canvas';
import { BASE_CANVAS_SIZE } from 'renderer/constants';
import type { Entity } from 'renderer/entities';
import type { Control } from 'renderer/controls';
import type { Point } from 'renderer/geometry';

export type Tool = 'cursor' | Entity['type'];

class Diagram {
	canvas: HTMLCanvasElement | null = null;
	roughCanvas: RoughCanvas | null = null;
	context: CanvasRenderingContext2D | null = null;
	scale: number = 1;

	// diagram state
	entities: Entity[] = [];

	// ui state
	selectedTool: Tool = 'cursor';
	cursorType: 'default' | 'crosshair' | 'move' | 'grab' = 'default';

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
		requestAnimationFrame(() => {
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
		});
	}

	updateSelection(selected: Entity[]) {
		const selectedIds = new Set(selected.map((s) => s.id));
		const unselected = this.entities.filter((e) => !selectedIds.has(e.id));
		unselected.forEach((e) => (e.isSelected = false));
		selected.forEach((e) => (e.isSelected = true));
		this.selectedEntities = selected;
		// bring selected entities up
		this.entities = [...unselected, ...selected];
		this.render();
	}
}

export const diagram = new Diagram();
