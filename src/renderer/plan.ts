import { makeAutoObservable } from 'mobx';
import { EntityData, deserializeEntities } from 'renderer/entities';
import { diagram } from 'renderer/diagram';
import { history } from 'renderer/history';
import { imageCache } from 'renderer/image-cache';

export interface StepData {
	subtitle?: string;
	notes: string;
	encounterName?: string;
	arenaUrl?: string;
	entities: EntityData[];
}

export interface PlanData {
	title: string;
	author: string;
	steps: StepData[];
}

class Plan implements PlanData {
	title = '';
	author = '';
	steps: StepData[] = [{ entities: [], notes: '' }];

	editable = false;
	dirty = false;
	currentStepIndex = 0;

	constructor() {
		makeAutoObservable(this);
	}

	get currentStep() {
		return this.steps[this.currentStepIndex];
	}

	saveStep() {
		this.currentStep.arenaUrl = diagram.arenaUrl ?? undefined;
		this.currentStep.entities = diagram.entities.map((e) =>
			JSON.parse(JSON.stringify(e))
		);
		imageCache.purge();
	}

	loadStep(index: number) {
		if (index < 0 || index >= this.steps.length) {
			console.warn(`attempted to load out of bounds step index ${index}`);
			return;
		}

		history.clear();
		diagram.updateSelection([]);
		this.currentStepIndex = index;
		diagram.arenaUrl = this.steps[index].arenaUrl ?? null;
		diagram.entities = deserializeEntities(this.steps[index].entities);
		diagram.render();
	}

	addStep() {
		this.saveStep();
		this.steps.splice(this.currentStepIndex + 1, 0, {
			entities: this.currentStep.entities.map((e) =>
				JSON.parse(JSON.stringify(e))
			),
			notes: '',
		});
		this.loadStep(this.currentStepIndex + 1);
	}

	removeStep() {
		if (this.steps.length === 1) {
			console.warn(`attempted to remove the only remaining step`);
			return;
		}
		this.steps.splice(this.currentStepIndex, 1);
		const prevStep = this.currentStepIndex - 1;
		this.loadStep(prevStep >= 0 ? prevStep : 0);
	}

	loadPlan(planData?: PlanData) {
		if (!planData) {
			this.title = '';
			this.author = '';
			this.steps = [{ entities: [], notes: '' }];
		} else {
			this.title = planData.title.trim();
			this.author = planData.author.trim();
			this.steps = planData.steps;
		}
		this.dirty = false;

		this.loadStep(0);
	}

	toJSON(): PlanData {
		this.saveStep();
		return {
			title: this.title.trim(),
			author: this.author.trim(),
			steps: this.steps.map((step) => ({
				subtitle: step.subtitle?.trim(),
				notes: step.notes.trim(),
				encounterName: step.encounterName,
				arenaUrl: step.arenaUrl,
				entities: step.entities,
			})),
		};
	}

	setArena(encounterName: string, arenaUrl: string) {
		this.currentStep.encounterName = encounterName;
		diagram.arenaUrl = arenaUrl;
		diagram.render();
		this.dirty = true;
	}
}

export const plan = new Plan();
