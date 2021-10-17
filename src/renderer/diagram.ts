import { autorun, makeAutoObservable } from 'mobx';
import { RoughCanvas } from 'roughjs/bin/canvas';
import type { Entity } from 'renderer/entities';
import type { Control } from 'renderer/controls';
import type { Point } from 'renderer/geometry';

export type Tool = 'cursor' | Entity['type'];

class Diagram {
	canvas: HTMLCanvasElement | null = null;
	roughCanvas: RoughCanvas | null = null;
	context: CanvasRenderingContext2D | null = null;
	ready = false;

	entities: Entity[] = [];
	selectedEntities: Entity[] = [];

	// ui state
	selectedTool: Tool = 'cursor';
	cursorType: 'default' | 'crosshair' | 'move' | 'grab' = 'default';

	// interaction state
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
		this.ready = true;
	}

	resize(): void {
		if (!this.canvas) return;
		const parent = this.canvas.parentElement;
		if (!parent) return;

		this.canvas.style.width = `${parent.clientWidth}px`;
		this.canvas.style.height = `${parent.clientHeight}px`;

		this.canvas.width = parent.clientWidth * window.devicePixelRatio;
		this.canvas.height = parent.clientHeight * window.devicePixelRatio;
	}

	render(): void {
		if (!this.canvas || !this.roughCanvas || !this.context) return;

		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

		for (const entity of this.entities) {
			entity.draw(this.roughCanvas, this.context);
		}

		if (this.entityInCreation) {
			this.entityInCreation.draw(this.roughCanvas, this.context);
		}
	}

	setSelection(selected: Entity[]) {
		const selectedIds = new Set(selected.map((s) => s.id));
		const unselected = this.entities.filter((e) => !selectedIds.has(e.id));
		unselected.forEach((e) => (e.isSelected = false));
		selected.forEach((e) => (e.isSelected = true));
		this.selectedEntities = selected;
		// bring selected entities up
		this.entities = [...unselected, ...selected];
	}
}

export const diagram = new Diagram();
