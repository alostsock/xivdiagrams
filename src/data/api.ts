import type { PlanData } from 'renderer/plan';

const apiUrl = `${import.meta.env.VITE_API_URL}/plan`;

type PlanGetSuccess = PlanData;
type PlanCreateSuccess = { id: string; editKey: string };
type PlanEditSuccess = { message: string };
type ErrorResponse = { message: string };

export async function getPlan(planId: string): Promise<PlanGetSuccess> {
	const response = await fetch(`${apiUrl}/${planId}`);
	const data = await response.json();

	if (response.status === 200) {
		return data as PlanGetSuccess;
	} else {
		const { message } = data as ErrorResponse;
		throw Error(message);
	}
}

export async function createPlan(
	planData: PlanData
): Promise<PlanCreateSuccess> {
	const response = await fetch(apiUrl, {
		method: 'POST',
		body: JSON.stringify({ plan: planData }),
	});
	const data = await response.json();

	if (response.status === 201) {
		return data as PlanCreateSuccess;
	} else {
		const { message } = data as ErrorResponse;
		throw Error(message);
	}
}

export async function editPlan(
	planId: string,
	editKey: string,
	planData: PlanData
): Promise<string> {
	const response = await fetch(`${apiUrl}/${planId}`, {
		method: 'POST',
		body: JSON.stringify({ editKey, plan: planData }),
	});
	const data = await response.json();

	if (response.status === 200) {
		const { message } = data as PlanEditSuccess;
		return message;
	} else {
		const { message } = data as ErrorResponse;
		throw Error(message);
	}
}
