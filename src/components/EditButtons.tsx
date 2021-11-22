import React, { useState } from 'react';
import clsx from 'clsx';
import './EditButtons.scss';
import { action, runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import { useLocation } from 'wouter';
import { plan } from 'renderer/plan';
import { diagram } from 'renderer/diagram';
import { usePlanContext } from 'data/PlanProvider';
import { createPlan, editPlan } from 'data/api';
import { storeKey, removeKey } from 'data/storage';
import { useOnPointerDownOutside } from 'hooks';

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
			storeKey(planId, editKey);
			setLocation(`/${planId}`);
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
				storeKey(planId, editKey);
			} catch (err) {
				removeKey(planId);
				console.error(err);
			} finally {
				setLocation(`/${planId}`, { replace: true });
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

	const handleClear = () => {
		if (window.confirm('Are you sure you want to clear the diagram?')) {
			plan.loadPlan();
		}
	};

	const saveable = !inProgress && plan.editable && plan.dirty;

	return (
		<div className={clsx('EditButtons', className)} style={style}>
			{plan.editable && (
				<button disabled={!saveable} onClick={() => saveable && handleSave()}>
					Save
				</button>
			)}

			<ShareButton />

			{plan.editable && (
				<button onClick={action(() => (plan.editable = false))}>View</button>
			)}

			{!plan.editable && !!editKey && (
				<button onClick={action(() => (plan.editable = true))}>Edit</button>
			)}

			<button
				disabled={inProgress}
				onClick={() => !inProgress && handleClone()}
			>
				Clone
			</button>

			<span style={{ width: '100%' }} />

			{plan.editable && <button onClick={handleClear}>Clear</button>}
		</div>
	);
});

export default EditButtons;

const ShareButton = observer(function ShareButton() {
	const { planId, editKey } = usePlanContext();
	const [isSelected, setIsSelected] = useState(false);
	const [copied, setCopied] = useState(false);
	const [editCopied, setEditCopied] = useState(false);

	const addRef = useOnPointerDownOutside(() => setIsSelected(false));

	const handleCopy = async (edit: boolean) => {
		let link = `${window.location.origin}/${planId}`;
		if (edit) link += `/${editKey}`;
		try {
			await navigator.clipboard.writeText(link);
			edit ? setEditCopied(true) : setCopied(true);
			setTimeout(() => (edit ? setEditCopied(false) : setCopied(false)), 1500);
		} catch (err) {
			console.error(err);
		}
	};

	return (
		<div className="share">
			<button
				ref={addRef}
				className={clsx({ selected: isSelected })}
				onClick={() => setIsSelected(!isSelected)}
			>
				Share
			</button>
			<div ref={addRef} className="popup">
				<button onClick={() => !copied && handleCopy(false)}>
					{copied ? 'Copied!' : 'Copy link'}
				</button>
				{plan.editable && (
					<button onClick={() => !editCopied && handleCopy(true)}>
						{editCopied ? 'Copied!' : 'Copy edit link'}
					</button>
				)}
			</div>
		</div>
	);
});
