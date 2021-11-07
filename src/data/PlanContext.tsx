import {
	createContext,
	ReactNode,
	useContext,
	useEffect,
	useState,
} from 'react';
import { useRoute } from 'wouter';
import useSwr from 'swr';
import type { PlanData } from 'renderer/plan';
import { plan } from 'renderer/plan';
import { diagram } from 'renderer/diagram';

const envApiUrl = process.env.REACT_APP_API_URL;
const apiUrl = envApiUrl ? `${envApiUrl}/plan` : '/plan';

type PlanGetSuccess = PlanData;
type ErrorResponse = { message: string };

async function getPlan(planId: string) {
	if (!planId) throw Error('No plan');

	const response = await fetch(`${apiUrl}/${planId}`);
	const data = await response.json();

	if (response.status === 200) {
		return data as PlanGetSuccess;
	} else {
		const { message } = data as ErrorResponse;
		throw Error(message);
	}
}

function usePlanRoute(): [planId: string | null, editKey: string | null] {
	const pattern = '/:planId/:editKey?' as const;

	type PlanRouteParams = { planId: string; editKey: string };

	const [match, params] = useRoute<PlanRouteParams, typeof pattern>(pattern);

	if (match && params) {
		const { planId, editKey } = params;
		// TODO: store editKey in local storage
		return [planId.trim() || null, editKey?.trim() || null];
	} else {
		return [null, null];
	}
}

interface PlanState {
	planId: string | null;
	editKey: string | null;
	setCanvasElement: ((el: HTMLCanvasElement) => void) | null;
	isLoading: boolean;
}

const planContext = createContext<PlanState>({
	planId: null,
	editKey: null,
	setCanvasElement: null,
	isLoading: true,
});

export const usePlanContext = () => useContext(planContext);

export function PlanProvider(props: { children: ReactNode }) {
	const [canvasEl, setCanvasEl] = useState<HTMLCanvasElement | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	const [planId, editKey] = usePlanRoute();

	const { data: planData, error } = useSwr<PlanData, string>(planId, getPlan);

	useEffect(() => {
		const planIsLoading = planId && !planData && !error;

		if (!canvasEl || planIsLoading) return;

		setIsLoading(false);

		if (error) console.warn(error);

		diagram.attach(canvasEl);
		plan.loadPlan(planData);

		return () => setIsLoading(true);
	}, [canvasEl, planId, planData, error]);

	const planState: PlanState = {
		planId,
		editKey,
		setCanvasElement: setCanvasEl,
		isLoading,
	};

	return <planContext.Provider value={planState} {...props} />;
}
