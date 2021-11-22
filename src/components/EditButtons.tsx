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
import { SaveSvg, EditSvg, ViewSvg, LinkSvg } from 'data/icons';
import { storeKey, removeKey } from 'data/storage';
import { useOnPointerDownOutside } from 'hooks';

interface Props {
	className?: string;
	style?: React.CSSProperties;
}

const EditButtons = observer(function EditButtons({ className, style }: Props) {
	const { planId, editKey, isBlankDiagram } = usePlanContext();
	const [, setLocation] = useLocation();
	const [inProgress, setInProgress] = useState(false);
	const saveable = !inProgress && plan.editable && plan.dirty;

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

	const toggleEditable = action(() => {
		diagram.updateSelection([]);
		plan.editable = !plan.editable;
	});

	const [copied, setCopied] = useState(false);
	const [editCopied, setEditCopied] = useState(false);

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

	const handleClone = async () => {
		setInProgress(true);
		await create();
		setInProgress(false);
	};

	const handleClear = () => {
		if (window.confirm('Are you sure you want to reset the diagram?')) {
			plan.loadPlan();
			plan.dirty = true;
		}
	};
	return (
		<div className={clsx('EditButtons', className)} style={style}>
			{plan.editable && (
				<button
					title="Save"
					className="save"
					disabled={!saveable}
					onClick={() => saveable && handleSave()}
				>
					<SaveSvg /> Save
				</button>
			)}

			{plan.editable && (
				<button title="View" onClick={toggleEditable}>
					<ViewSvg />
				</button>
			)}

			{!plan.editable && (isBlankDiagram || !!editKey) && (
				<button title="Edit" onClick={toggleEditable}>
					<EditSvg />
				</button>
			)}

			<Popup title="Share" label={<LinkSvg />}>
				<button
					title="Copy link for viewing"
					onClick={() => !copied && handleCopy(false)}
				>
					{copied ? 'Copied!' : 'Copy link'}
				</button>
				{plan.editable && (
					<button
						title="Copy link for editing"
						onClick={() => !editCopied && handleCopy(true)}
					>
						{editCopied ? 'Copied!' : 'Copy edit link'}
					</button>
				)}
			</Popup>

			<Popup title="More actions" label="•••">
				<button
					title="Make a copy of this diagram"
					disabled={inProgress}
					onClick={() => !inProgress && handleClone()}
				>
					Clone
				</button>

				{plan.editable && (
					<button title="Reset the diagram" onClick={handleClear}>
						Reset
					</button>
				)}
			</Popup>
		</div>
	);
});

export default EditButtons;

const Popup = (props: {
	title: string;
	label: React.ReactNode;
	children: React.ReactNode;
}) => {
	const [isSelected, setIsSelected] = useState(false);
	const addRef = useOnPointerDownOutside(() => setIsSelected(false));

	return (
		<div className="popup-wrapper">
			<button
				ref={addRef}
				title={props.title}
				className={clsx({ selected: isSelected })}
				onClick={() => setIsSelected(!isSelected)}
			>
				{props.label}
			</button>
			<div ref={addRef} className="popup">
				{props.children}
			</div>
		</div>
	);
};
