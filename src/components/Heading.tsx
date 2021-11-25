import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import './Heading.scss';
import { action, autorun } from 'mobx';
import { observer } from 'mobx-react-lite';
import { plan } from 'renderer/plan';
import { InfoSvg, CrossSvg, GithubSvg } from 'data/icons';
import { Dialog } from '@reach/dialog';

interface Props {
	className?: string;
	style?: React.CSSProperties;
}

const Heading = observer(function Heading({ className, style }: Props) {
	useEffect(() => {
		autorun(() => {
			document.title = `${plan.title || 'untitled'} - XIV Diagrams`;
		});
	}, []);

	return (
		<header className={clsx('Heading', className)} style={style}>
			<div className="title">
				{!plan.editable ? <HeadingDisplay /> : <HeadingEditable />}
			</div>

			<div className="buttons">
				<AboutButton />
				<a
					className="button icon"
					target="_blank"
					rel="noreferrer"
					href="https://github.com/alostsock/xivdiagrams"
				>
					<GithubSvg />
				</a>
			</div>
		</header>
	);
});

export default Heading;

const HeadingDisplay = observer(function HeadingDisplay() {
	return (
		<React.Fragment>
			<h1>{plan.title || 'untitled'}</h1>
			<h2>by {plan.author || 'anonymous'}</h2>
		</React.Fragment>
	);
});

const HeadingEditable = observer(function HeadingEditable() {
	return (
		<React.Fragment>
			<h1>
				<input
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
					spellCheck={false}
					placeholder="anonymous"
					value={plan.author}
					onChange={action((e) => {
						plan.author = e.target.value;
						plan.dirty = true;
					})}
				/>
			</h2>
		</React.Fragment>
	);
});

const AboutButton = () => {
	const [isOpen, setIsOpen] = useState(false);
	const open = () => setIsOpen(true);
	const close = () => setIsOpen(false);

	const issuesUrl = 'https://github.com/alostsock/xivdiagrams/issues';

	const Kbd = ({ cmd }: { cmd: string }) => <span className="kbd">{cmd}</span>;

	return (
		<React.Fragment>
			<button title="About" className="icon about" onClick={open}>
				<InfoSvg />
			</button>

			<Dialog aria-label="about" isOpen={isOpen} onDismiss={close}>
				<header>
					<h1>About</h1>
					<button className="icon" onClick={close}>
						<CrossSvg />
					</button>
				</header>

				<p>
					<b>XIV Diagrams</b> is a tool for quickly creating and sharing raid
					diagrams and strategies.
				</p>

				<p>Keyboard shortcuts:</p>

				<ul>
					<li>
						Select all <Kbd cmd="ctrl + A" />
					</li>
					<li>
						Delete <Kbd cmd="delete" />, <Kbd cmd="backspace" />
					</li>
					<li>
						Copy <Kbd cmd="ctrl + C" />, Paste <Kbd cmd="ctrl + V" />
					</li>
					<li>
						Undo <Kbd cmd="ctrl + Z" />, Redo <Kbd cmd="ctrl + Y" />
					</li>
				</ul>

				<p>
					Currently, basic features like common player/object/mechanic markers,
					and multi-step diagrams have been implemented – I plan on adding more
					features as I get the time. If you have suggestions, or {"you've"} run
					into a bug, you can create an <a href={issuesUrl}>issue on Github</a>{' '}
					or find me on Discord (<b>para#1968</b>).
				</p>

				<p>– 🧦</p>
			</Dialog>
		</React.Fragment>
	);
};
