import React, { useState, useRef } from 'react';
import clsx from 'clsx';
import './EditButtons.scss';
import { action, runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import { useLocation } from 'wouter';
import { plan } from 'renderer/plan';
import { diagram } from 'renderer/diagram';
import { usePlanContext } from 'data/PlanProvider';
import { createPlan, editPlan } from 'data/api';
import { SaveSvg, EditSvg, ViewSvg, LinkSvg, MoreSvg } from 'data/icons';
import { storeKey, removeKey } from 'data/storage';
import { useOnPointerDownOutside } from 'hooks';
import { useRect } from '@reach/rect';

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

	const handleClear = action(() => {
		const msg = 'Are you sure you want to reset the diagram and all its steps?';
		if (window.confirm(msg)) {
			plan.loadPlan();
			plan.dirty = true;
		}
	});

	const ref = useRef(null);
	const rect = useRect(ref, { observe: true });
	const IconLabel = (props: { icon: React.ReactNode; label: string }) => {
		const isWide = rect && rect.width > 400;
		const iconStyle = isWide ? { marginRight: '0.25rem' } : undefined;

		return (
			<React.Fragment>
				<span style={iconStyle}>{props.icon}</span>
				{isWide && props.label}
			</React.Fragment>
		);
	};

	return (
		<div ref={ref} className={clsx('EditButtons', className)} style={style}>
			{plan.editable && (
				<button
					title="Save"
					className="save"
					disabled={!saveable}
					onClick={() => saveable && handleSave()}
				>
					<IconLabel icon={<SaveSvg />} label="Save" />
				</button>
			)}

			<Menu
				title="Share"
				label={<IconLabel icon={<LinkSvg />} label="Share" />}
				disabled={isBlankDiagram}
			>
				{() => (
					<React.Fragment>
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
					</React.Fragment>
				)}
			</Menu>

			{plan.editable && (
				<button title="Preview" onClick={toggleEditable}>
					<IconLabel icon={<ViewSvg />} label="View" />
				</button>
			)}

			{!plan.editable && (isBlankDiagram || !!editKey) && (
				<button title="Edit" onClick={toggleEditable}>
					<IconLabel icon={<EditSvg />} label="Edit" />
				</button>
			)}

			<Menu
				title="More actions"
				label={<IconLabel icon={<MoreSvg />} label="More" />}
				disabled={false}
			>
				{(setIsSelected) => (
					<React.Fragment>
						<button
							title="Make a copy of this diagram"
							disabled={inProgress}
							onClick={() => {
								if (!inProgress) {
									handleClone();
									setIsSelected(false);
								}
							}}
						>
							Clone
						</button>

						{plan.editable && (
							<button
								title="Reset the diagram"
								onClick={() => {
									handleClear();
									setIsSelected(false);
								}}
							>
								Reset
							</button>
						)}
					</React.Fragment>
				)}
			</Menu>
		</div>
	);
});

export default EditButtons;

const Menu = (props: {
	title: string;
	label: React.ReactNode;
	disabled: boolean;
	children: (setIsSelected: (isSelected: boolean) => void) => React.ReactNode;
}) => {
	const [isSelected, setIsSelected] = useState(false);
	const addRef = useOnPointerDownOutside(() => setIsSelected(false));

	return (
		<div className="menu">
			<button
				ref={addRef}
				title={props.title}
				className={clsx({ selected: isSelected })}
				disabled={props.disabled}
				onClick={() => !props.disabled && setIsSelected(!isSelected)}
			>
				{props.label}
			</button>
			<div ref={addRef} className="popup">
				{props.children(setIsSelected)}
			</div>
		</div>
	);
};
