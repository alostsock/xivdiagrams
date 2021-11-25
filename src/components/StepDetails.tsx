import React from 'react';
import clsx from 'clsx';
import './StepDetails.scss';
import { observer } from 'mobx-react-lite';
import { plan } from 'renderer/plan';
import { LeftSvg, RightSvg, PlusSvg, CrossSvg } from 'data/icons';
import { action } from 'mobx';

const MAX_STEPS = 35;

interface Props {
	className?: string;
	style?: React.CSSProperties;
}

const StepDetails = observer(function StepDetails({ className, style }: Props) {
	const leftEnabled = plan.currentStepIndex !== 0;
	const rightEnabled = plan.currentStepIndex < plan.steps.length - 1;

	const step = (d: -1 | 1) => {
		plan.saveStep();
		plan.loadStep(plan.currentStepIndex + d);
	};

	return (
		<div className={clsx('StepDetails', className)} style={style}>
			<button disabled={!leftEnabled} onClick={() => leftEnabled && step(-1)}>
				<LeftSvg />
			</button>
			<button disabled={!rightEnabled} onClick={() => rightEnabled && step(1)}>
				<RightSvg />
			</button>
			{plan.editable ? <InfoEditable /> : <InfoDisplay />}
		</div>
	);
});

export default StepDetails;

const InfoDisplay = observer(function StepInfo() {
	return (
		<div className="info">
			<h3>
				Step {plan.currentStepIndex + 1} / {plan.steps.length}
			</h3>
			{plan.currentStep.subtitle && <h4>{plan.currentStep.subtitle}</h4>}
		</div>
	);
});

const InfoEditable = observer(function StepInfo() {
	const addEnabled = plan.steps.length < MAX_STEPS;
	const removeEnabled = plan.steps.length > 1;

	return (
		<div className="info">
			<h3>
				Step {plan.currentStepIndex + 1} / {plan.steps.length}
			</h3>

			<button
				disabled={!addEnabled}
				onClick={() => addEnabled && plan.addStep()}
			>
				<PlusSvg />
			</button>
			<button
				disabled={!removeEnabled}
				onClick={() => removeEnabled && plan.removeStep()}
			>
				<CrossSvg />
			</button>

			<h4>
				<input
					spellCheck={false}
					placeholder="Add a subtitle..."
					value={plan.currentStep.subtitle ?? ''}
					onChange={action((e) => {
						plan.currentStep.subtitle = e.target.value.slice(0, 50);
						plan.dirty = true;
					})}
				/>
			</h4>
		</div>
	);
});
