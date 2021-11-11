import { makeAutoObservable } from 'mobx';
import { Entity, EntityData, deserializeEntities } from 'renderer/entities';
import { diagram } from 'renderer/diagram';

export interface StepData {
	entities: EntityData[];
	notes: string;
}

export interface PlanData {
	title: string;
	author: string;
	steps: StepData[];
}

export interface Step {
	entities: Entity[];
	notes: string;
}

class Plan {
	title: string = 'untitled';
	author: string = 'anonymous';
	steps: Step[] = [{ entities: [], notes: '' }];

	editable: boolean = false;
	dirty: boolean = false;
	currentStepIndex: number = 0;

	constructor() {
		makeAutoObservable(this);
	}

	get currentStep() {
		return this.steps[this.currentStepIndex];
	}

	loadPlan(planData?: PlanData) {
		if (!planData) {
			this.title = 'untitled';
			this.author = 'anonymous';
			this.steps = [{ entities: [], notes: '' }];
		} else {
			this.title = planData.title;
			this.author = planData.author;

			if (planData.steps) {
				this.steps = planData.steps.map((step) => ({
					...step,
					entities: deserializeEntities(step.entities),
				}));
			}
		}

		diagram.entities = this.steps[this.currentStepIndex].entities;
		diagram.render();
	}

	toJSON(): PlanData {
		return {
			author: this.author,
			title: this.title,
			steps: this.steps.map((step) => ({
				...step,
				entities: diagram.entities.map((entity) => entity.toJSON()),
			})),
		};
	}
}

export const plan = new Plan();
