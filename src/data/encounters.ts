const arena = (name: string) => `/media/arena/${name}.jpg`;

export const encounters = {
	tiers: [
		{
			tierName: "Eden's Promise",
			floors: [
				{
					floorName: 'Umbra',
					encounterName: "Eden's Promise: Umbra",
					arenas: [arena('e9-1'), arena('e9-2'), arena('e9-3')],
				},
				{
					floorName: 'Litany',
					encounterName: "Eden's Promise: Litany",
					arenas: [
						arena('e10-1'),
						arena('e10-2'),
						arena('e10-3'),
						arena('e10-4'),
						arena('e10-5'),
						arena('e10-6'),
					],
				},
				{
					floorName: 'Anamorphosis',
					encounterName: "Eden's Promise: Anamorphosis",
					arenas: [arena('e11-1')],
				},
				{
					floorName: 'Eternity',
					encounterName: "Eden's Promise: Eternity",
					arenas: [arena('e12-1'), arena('e12-2')],
				},
			],
		},
	],
	// ultimates: [
	// 	{
	// 		encounterName: 'The Epic of Alexander',
	// 		arenas: [],
	// 	},
	// 	{
	// 		encounterName: "The Minstrel's Ballad: The Weapon's Refrain",
	// 		arenas: [],
	// 	},
	// 	{
	// 		encounterName: 'The Unending Coil of Bahamut',
	// 		arenas: [],
	// 	},
	// ],
} as const;
