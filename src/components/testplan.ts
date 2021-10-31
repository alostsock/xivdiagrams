import type { PlanData } from 'renderer/plan';

const testPlan: PlanData = {
	title: 'just a test',
	author: 'cowpog',
	steps: [
		{
			entities: [
				{
					id: 'VSCFtJXG',
					type: 'circle',
					roughOptions: {
						seed: 337247443,
						roughness: 1,
						curveFitting: 0.97,
						strokeWidth: 1,
					},
					origin: [50, 50],
					radius: 50,
					innerRadius: 25,
					innerRadiusDrawingStartAngle: Math.random() * Math.PI * 2,
				},
				{
					id: 'di5FfiBt',
					type: 'rect',
					roughOptions: {
						seed: 671732269,
						roughness: 1,
						curveFitting: 0.97,
						strokeWidth: 1,
					},
					origin: [50, 150],
					width: 50,
					height: 80,
					rotation: 0.7853981633974483,
				},
				{
					id: 'ies_iV8Y',
					type: 'cone',
					roughOptions: {
						seed: 462144498,
						roughness: 1,
						curveFitting: 0.97,
						strokeWidth: 1,
					},
					origin: [50, 250],
					radius: 90,
					innerRadius: 40,
					start: 0,
					end: 4.71238898038469,
				},
				{
					id: 'IMqgogcO',
					type: 'line',
					roughOptions: {
						seed: 643861523,
						roughness: 1,
						curveFitting: 0.97,
						strokeWidth: 1,
					},
					origin: [200, 100],
					angle: 0.5235987755982988,
					length: 100,
				},
				{
					id: 'KNvol081',
					type: 'arrow',
					roughOptions: {
						seed: 1036878533,
						roughness: 1,
						curveFitting: 0.97,
						strokeWidth: 1,
					},
					origin: [200, 200],
					angle: 0.5235987755982988,
					length: 100,
				},
			],
			notes: 'some notes',
		},
	],
};

export default testPlan;
