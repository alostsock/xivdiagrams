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
import { getKey } from 'data/storage';
import type { PlanData } from 'renderer/plan';
import { plan } from 'renderer/plan';
import { diagram } from 'renderer/diagram';

interface PlanState {
	planId: string | null;
	editKey: string | null;
	isBlankDiagram: boolean;
	setCanvasElement: ((el: HTMLCanvasElement) => void) | null;
	isLoading: boolean;
}

const planContext = createContext<PlanState>({
	planId: null,
	editKey: null,
	isBlankDiagram: false,
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
	const urlEditKey = params?.editKey || null;

	const editKey = useKeyCache(planId, urlEditKey);

	const { data: planData, error } = useSwr<PlanData, string>(planId, getPlan);

	const isBlankDiagram = !match;
	const hasEditKey = !!editKey;

	useEffect(() => {
		runInAction(() => (plan.editable = isBlankDiagram || hasEditKey));
	}, [isBlankDiagram, hasEditKey]);

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
		isBlankDiagram,
		setCanvasElement: setCanvasEl,
		isLoading,
	};

	return <planContext.Provider value={planState} {...props} />;
}

function useKeyCache(planId: string | null, urlEditKey: string | null) {
	const [cachedKey, setCachedKey] = useState<string | null>(null);

	// check localstorage if a key is available
	useEffect(() => {
		if (!planId) return;
		const cached = getKey(planId);
		setCachedKey(cached);
	}, [planId, urlEditKey]);

	return cachedKey || urlEditKey;
}
