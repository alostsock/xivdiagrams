const arenas = (abbreviation: string, count: number): string[] =>
	Array(count)
		.fill(null)
		.map((_, i) => `/media/arena/${abbreviation}-${i + 1}.jpg`);

export const encounters = {
	tiers: [
		{
			name: "Eden's Promise",
			floors: [
				{
					name: 'Umbra',
					arenas: arenas('e9', 3),
				},
				{
					name: 'Litany',
					arenas: arenas('e10', 6),
				},
				{
					name: 'Anamorphosis',
					arenas: arenas('e11', 1),
				},
				{
					name: 'Eternity',
					arenas: arenas('e12', 2),
				},
			],
		},
	],
	// ultimates: [
	// 	{
	// 		name: 'The Epic of Alexander',
	// 		arenas: [],
	// 	},
	// 	{
	// 		name: "The Minstrel's Ballad: The Weapon's Refrain",
	// 		arenas: [],
	// 	},
	// 	{
	// 		name: 'The Unending Coil of Bahamut',
	// 		arenas: [],
	// 	},
	// ],
} as const;
