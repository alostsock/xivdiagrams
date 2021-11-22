import React from 'react';
import clsx from 'clsx';
import './Heading.scss';
import { action } from 'mobx';
import { observer } from 'mobx-react-lite';
import { plan } from 'renderer/plan';

interface Props {
	className?: string;
	style?: React.CSSProperties;
}

const Heading = observer(function Heading({ className, style }: Props) {
	return (
		<header className={clsx('Heading', className)} style={style}>
			{!plan.editable ? <HeadingDisplay /> : <HeadingEditable />}
		</header>
	);
});

export default Heading;

const HeadingDisplay = observer(function HeadingDisplay() {
	return (
		<>
			<h1>{plan.title || 'untitled'}</h1>
			<h2>by {plan.author || 'anonymous'}</h2>
		</>
	);
});

const HeadingEditable = observer(function HeadingEditable() {
	return (
		<>
			<h1>
				<input
					className="title"
					spellCheck={false}
					placeholder="untitled"
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
					placeholder="anonymous"
					value={plan.author}
					onChange={action((e) => {
						plan.author = e.target.value;
						plan.dirty = true;
					})}
				/>
			</h2>
		</>
	);
});
