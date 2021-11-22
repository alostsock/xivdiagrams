import React from 'react';
import clsx from 'clsx';
import './Notes.scss';
import { action } from 'mobx';
import { observer } from 'mobx-react-lite';
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
			{!plan.editable ? <NotesDisplay /> : <NotesEditable />}
		</div>
	);
});

export default Notes;

const NotesDisplay = observer(function NotesDisplay() {
	return !plan.currentStep.notes ? null : (
		<>
			<div className="title">
				<h3>Notes</h3>
			</div>
			<div className="content">{plan.currentStep.notes}</div>
		</>
	);
});

const NotesEditable = observer(function NotesEditable() {
	return (
		<>
			<div className="title">
				<h3>Notes</h3>

				<div className="charcount">
					{plan.currentStep.notes.length}/{MAX_CHARS}
				</div>
			</div>
			<textarea
				rows={8}
				placeholder="Write something here! (as if people actually read this stuff...)"
				value={plan.currentStep.notes}
				onChange={action((e) => {
					plan.currentStep.notes = e.target.value.slice(0, MAX_CHARS);
					plan.dirty = true;
				})}
			/>
		</>
	);
});
