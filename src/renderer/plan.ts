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
	steps: Step[] = [
		{
			entities: [],
			notes: '',
		},
	];

	currentStepIndex: number = 0;

	constructor() {
		makeAutoObservable(this);
	}

	get currentStep() {
		return this.steps[this.currentStepIndex];
	}

	loadPlan(planData?: PlanData) {
		this.title = planData?.title ?? this.title;
		this.author = planData?.author ?? this.author;

		if (planData?.steps) {
			this.steps = planData?.steps.map((step) => ({
				...step,
				entities: deserializeEntities(step.entities),
			}));
		}

		diagram.entities = this.steps[this.currentStepIndex].entities;
		diagram.render();
	}
}

export const plan = new Plan();
