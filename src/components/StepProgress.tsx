import React from 'react';
import clsx from 'clsx';
import './StepProgress.scss';
import { observer } from 'mobx-react-lite';
import { plan } from 'renderer/plan';

interface Props {
	className?: string;
	style?: React.CSSProperties;
}

const StepProgress = observer(function StepProgress({
	className,
	style,
}: Props) {
	const stepTo = (index: number) => {
		plan.saveStep();
		plan.loadStep(index);
	};

	return (
		<div className={clsx('StepProgress', className)} style={style}>
			{Array(plan.steps.length)
				.fill(null)
				.map((_, index) => (
					<div
						title={`Step ${index + 1}`}
						key={index}
						className="bar"
						onClick={() => stepTo(index)}
					>
						<div
							className={clsx('fill', {
								filled: index <= plan.currentStepIndex,
							})}
						/>
					</div>
				))}
		</div>
	);
});

export default StepProgress;
