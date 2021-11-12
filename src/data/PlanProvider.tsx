import React, {
	createContext,
	ReactNode,
	useContext,
	useEffect,
	useState,
} from 'react';
import { runInAction } from 'mobx';
import { useRoute, useLocation } from 'wouter';
import useSwr from 'swr';
import { getPlan } from 'data/api';
import type { PlanData } from 'renderer/plan';
import { plan } from 'renderer/plan';
import { diagram } from 'renderer/diagram';

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

type RouteParams = { planId: string; editKey: string };
const routePattern = '/:planId/:editKey?' as const;

export default function PlanProvider(props: { children: ReactNode }) {
	const [canvasEl, setCanvasEl] = useState<HTMLCanvasElement | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	const [, setLocation] = useLocation();
	const [match, params] = useRoute<RouteParams>(routePattern);
	const planId = params?.planId || null;
	const editKey = params?.editKey || null;

	const { data: planData, error } = useSwr<PlanData, string>(planId, getPlan);

	useEffect(() => {
		const isBlankDiagram = !match;
		const hasEditKey = !!editKey;
		runInAction(() => (plan.editable = isBlankDiagram || hasEditKey));
	}, [match, editKey]);

	useEffect(() => {
		if (planId && error) {
			// the api has 404'd, probably
			console.warn(error);
			setLocation('/');
		}
	}, [planId, error, setLocation]);

	useEffect(() => {
		const planIsLoading = planId && !planData && !error;

		if (!canvasEl || planIsLoading) return;

		setIsLoading(false);

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
