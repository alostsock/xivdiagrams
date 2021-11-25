import React, { useState, useEffect } from 'react';
import './App.scss';
import { observer } from 'mobx-react-lite';
import { usePlanContext } from 'data/PlanProvider';
import { diagram } from 'renderer/diagram';
import {
	handlePointerMove,
	handlePointerDown,
	handlePointerUpLeave,
	handleKeyDown,
} from 'renderer/interactions';
import Heading from 'components/Heading';
import EditButtons from 'components/EditButtons';
import Preferences from 'components/Preferences';
import Stepper from 'components/Stepper';
import Notes from 'components/Notes';
import Toolset from 'components/Toolset';
import Properties from 'components/Properties';
import Marks, { handleMarkDragEnterOver, handleMarkDrop } from './Marks';

const App = observer(function App() {
	const { setCanvasElement } = usePlanContext();

	const [containerEl, setContainerEl] = useState<HTMLElement | null>(null);
	const containerRef = (element: HTMLElement | null) => setContainerEl(element);
	useEffect(() => {
		if (!containerEl) return;

		const resizeObserver = new ResizeObserver(() => diagram.resize());

		resizeObserver.observe(containerEl);
		return () => resizeObserver.disconnect();
	}, [containerEl]);

	return (
		<div className="App">
			<Heading className="heading" />

			<EditButtons className="editbuttons" />

			<Preferences className="preferences" />

			<div ref={containerRef} className="diagram">
				<div className="canvas-container">
					<div className="overlay">
						<Toolset />
						<Marks />
						<Properties />
					</div>

					<canvas
						ref={setCanvasElement}
						style={{ cursor: diagram.cursorType }}
						onPointerMove={handlePointerMove}
						onPointerDown={handlePointerDown}
						onPointerUp={handlePointerUpLeave}
						onPointerLeave={handlePointerUpLeave}
						onDragEnter={handleMarkDragEnterOver}
						onDragOver={handleMarkDragEnterOver}
						onDrop={handleMarkDrop}
						onKeyDown={handleKeyDown}
						tabIndex={0}
					></canvas>
				</div>
			</div>

			<Stepper className="stepper" />

			<Notes className="notes" />

			<footer>
				<p>
					All art, text, and images from FFXIV are registered trademarks of
					Square Enix Holdings Co., Ltd.
				</p>
				<p>© SQUARE ENIX CO., LTD. All Rights Reserved.</p>
			</footer>
		</div>
	);
});

export default App;
