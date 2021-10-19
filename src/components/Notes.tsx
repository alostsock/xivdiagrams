import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import { plan } from 'renderer/plan';

interface Props {
	className?: string;
	style?: React.CSSProperties;
}

const Notes = observer(function Notes({ className, style }: Props) {
	return (
		<div className={clsx('Notes', className)} style={style}>
			Notes
			<p>{plan.currentStep.notes}</p>
		</div>
	);
});

export default Notes;
