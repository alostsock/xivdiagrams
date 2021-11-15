import React, { useState } from 'react';
import clsx from 'clsx';
import './Heading.scss';
import { action, runInAction } from 'mobx';
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

const Heading = observer(function Heading({ className, style }: Props) {
	return (
		<header className={clsx('Heading', className)} style={style}>
			{plan.editable ? <HeadingEditable /> : <HeadingDisplay />}
		</header>
	);
});

export default Heading;

const HeadingEditable = observer(function HeadingEditable() {
	return (
		<>
			<h1>
				<input
					className="title"
					spellCheck={false}
					value={plan.title}
					onChange={action((e) => {
						plan.title = e.target.value;
						plan.dirty = true;
					})}
				/>
			</h1>
			<h2>
				<span>by </span>
				<input
					className="author"
					spellCheck={false}
					value={plan.author}
					onChange={action((e) => {
						plan.author = e.target.value;
						plan.dirty = true;
					})}
				/>
			</h2>
			<ButtonList />
		</>
	);
});

const HeadingDisplay = observer(function HeadingDisplay() {
	return (
		<>
			<h1>{plan.title}</h1>
			<h2>by {plan.author}</h2>
			<ButtonList />
		</>
	);
});

const ButtonList = observer(function ButtonList() {
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
		<div className="buttons">
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
