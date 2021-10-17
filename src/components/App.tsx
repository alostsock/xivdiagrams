import { useState, useEffect } from 'react';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import { diagram } from 'renderer/diagram';
import {
	handlePointerMove,
	handlePointerDown,
	handlePointerUpLeave,
} from 'renderer/interactions';
import { Circle, Cone, Rect, Line, Arrow } from 'renderer/entities';
import Toolset from 'components/Toolset';
import './App.scss';

const App = observer(function App() {
	const [diagramEl, setDiagramEl] = useState<HTMLCanvasElement | null>(null);
	const diagramRef = (element: HTMLCanvasElement) => setDiagramEl(element);

	useEffect(() => {
		if (!diagramEl) return;

		runInAction(() => {
			diagram.attach(diagramEl);

			diagram.entities.push(new Circle({ origin: [50, 50], radius: 50 }));
			diagram.entities.push(
				new Rect({
					origin: [50, 150],
					width: 50,
					height: 80,
					rotation: Math.PI / 4,
				})
			);
			diagram.entities.push(
				new Cone({
					origin: [50, 250],
					radius: 90,
					start: 0,
					end: Math.PI * 1.5,
				})
			);
			diagram.entities.push(
				new Line({ origin: [200, 100], angle: Math.PI / 6, length: 100 })
			);
			diagram.entities.push(
				new Arrow({ origin: [200, 200], angle: Math.PI / 6, length: 100 })
			);
			diagram.render();
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
			<header className="heading">heading</header>

			<div ref={containerRef} className="diagram">
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

			<div className="properties">properties</div>

			<div className="notes">notes</div>
		</div>
	);
});

export default App;
