import { action } from 'mobx';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import { plan } from 'renderer/plan';

const MAX_CHARS = 500;

interface Props {
	className?: string;
	style?: React.CSSProperties;
}

// something simple for now. might add tiptap or some RTE later
const Notes = observer(function Notes({ className, style }: Props) {
	return (
		<div className={clsx('Notes', className)} style={style}>
			<div className="title">
				<h3>Notes</h3>

				<div className="charcount">
					{plan.currentStep.notes.length}/{MAX_CHARS}
				</div>
			</div>

			<textarea
				rows={8}
				value={plan.currentStep.notes}
				onChange={action((e) => {
					plan.currentStep.notes = e.target.value.slice(0, MAX_CHARS);
				})}
			/>
		</div>
	);
});

export default Notes;
