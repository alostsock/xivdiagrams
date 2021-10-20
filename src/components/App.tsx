import { useState, useEffect } from 'react';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import { plan } from 'renderer/plan';
import { diagram } from 'renderer/diagram';
import {
	handlePointerMove,
	handlePointerDown,
	handlePointerUpLeave,
} from 'renderer/interactions';
import Heading from 'components/Heading';
import Properties from 'components/Properties';
import Notes from 'components/Notes';
import Toolset from 'components/Toolset';

import testPlan from './testplan';

const App = observer(function App() {
	const [diagramEl, setDiagramEl] = useState<HTMLCanvasElement | null>(null);
	const diagramRef = (element: HTMLCanvasElement) => setDiagramEl(element);

	useEffect(() => {
		if (!diagramEl) return;

		runInAction(() => {
			diagram.attach(diagramEl);
			plan.loadPlan(testPlan);
		});
	}, [diagramEl]);

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

			<div ref={containerRef} className="diagram">
				<div className="canvas-container">
					<Toolset className="toolset" />

					<canvas
						ref={diagramRef}
						style={{ cursor: diagram.cursorType }}
						onPointerMove={handlePointerMove}
						onPointerDown={handlePointerDown}
						onPointerUp={handlePointerUpLeave}
						onPointerLeave={handlePointerUpLeave}
					></canvas>
				</div>
			</div>

			<Properties className="properties" />

			<Notes className="notes" />
		</div>
	);
});

export default App;
