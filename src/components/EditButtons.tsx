import React, { useState } from 'react';
import clsx from 'clsx';
import './EditButtons.scss';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import { useLocation } from 'wouter';
import { plan } from 'renderer/plan';
import { diagram } from 'renderer/diagram';
import { usePlanContext } from 'data/PlanProvider';
import { createPlan, editPlan } from 'data/api';

interface Props {
	className?: string;
	style?: React.CSSProperties;
}

const EditButtons = observer(function EditButtons({ className, style }: Props) {
	const { planId, editKey } = usePlanContext();
	const [, setLocation] = useLocation();
	const [inProgress, setInProgress] = useState(false);

	const create = async () => {
		try {
			const { id: planId, editKey } = await createPlan(plan.toJSON());
			setLocation(`/${planId}/${editKey}`);
			runInAction(() => (plan.dirty = false));
		} catch (err) {
			console.error(err);
		}
	};

	const handleSave = async () => {
		setInProgress(true);
		diagram.updateSelection([]);
		if (planId && editKey) {
			try {
				await editPlan(planId, editKey, plan.toJSON());
			} catch (err) {
				setLocation(`/${planId}`);
				console.error(err);
			} finally {
				runInAction(() => (plan.dirty = false));
			}
		} else {
			await create();
		}
		setInProgress(false);
	};

	const handleClone = async () => {
		setInProgress(true);
		await create();
		setInProgress(false);
	};

	const saveable = !inProgress && plan.editable && plan.dirty;

	return (
		<div className={clsx('EditButtons', className)} style={style}>
			{plan.editable && (
				<button disabled={!saveable} onClick={() => saveable && handleSave()}>
					Save
				</button>
			)}
			<button
				disabled={inProgress}
				onClick={() => !inProgress && handleClone()}
			>
				Clone
			</button>
		</div>
	);
});

export default EditButtons;
