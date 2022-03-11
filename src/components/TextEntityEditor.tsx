import React from 'react';
import './TextEntityEditor.scss';
import { action } from 'mobx';
import { observer } from 'mobx-react-lite';
import { diagram } from 'renderer/diagram';
import { measureText } from 'renderer/geometry';

const TextEntityEditor = observer(function TextEntityEditor() {
	if (diagram.entityInCreation?.type !== 'text') return null;

	const [x, y] = diagram.entityInCreation.origin;
	// convert from canvas pixels to normal pixels
	const scaleFactor = diagram.scale / window.devicePixelRatio;

	const fontSize = diagram.entityInCreation.size * scaleFactor;
	const font = `${fontSize}px Patrick Hand`;
	const { height } = measureText(' ', fontSize);
	const left = x * scaleFactor;
	const top = y * scaleFactor - height / 2; // center text vertically on cursor

	const inputRef = (el: HTMLTextAreaElement | null) => {
		if (!el) return;
		el.focus();
	};

	const handleChange = action((e: React.ChangeEvent<HTMLTextAreaElement>) => {
		if (diagram.entityInCreation?.type !== 'text') return;
		diagram.entityInCreation.text = e.target.value;
		console.log(e.target.value);
		diagram.render();
	});

	const updateEntity = (e: React.FocusEvent<HTMLTextAreaElement>) => {
		console.log('blur', e.target.value);
		console.log(diagram.entityInCreation);
	};

	return (
		<textarea
			ref={inputRef}
			className="TextEntityEditor"
			style={{ left, top, font }}
			placeholder=" "
			value={diagram.entityInCreation.text}
			onChange={handleChange}
			onBlur={updateEntity}
		/>
	);
});

export default TextEntityEditor;
