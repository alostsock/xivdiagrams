import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { encode } from 'blurhash';

const srcPath = path.join(process.cwd(), './public/media/arena');
const webPath = '/media/arena';
const destPath = path.join(process.cwd(), './src/data/blurhash.json');

async function blurhash(filename: string): Promise<[string, string]> {
	const absolutePath = path.join(srcPath, filename);

	// https://github.com/woltapp/blurhash/issues/43#issuecomment-597674435
	return new Promise((resolve, reject) => {
		sharp(absolutePath)
			.raw()
			.ensureAlpha()
			.resize(200, 200, { fit: 'inside' })
			.toBuffer((err, buffer, { width, height }) => {
				if (err) reject(err);
				const blurhash = encode(
					new Uint8ClampedArray(buffer),
					width,
					height,
					3,
					3
				);
				resolve([`${webPath}/${filename}`, blurhash]);
			});
	});
}

const filenames = fs.readdirSync(srcPath);

Promise.all(filenames.map((filename) => blurhash(filename))).then((results) => {
	const hashData = results.reduce<Record<string, string>>(
		(acc, [filename, hash]) => {
			acc[filename] = hash;
			return acc;
		},
		{}
	);

	fs.writeFileSync(destPath, JSON.stringify(hashData, null, 2));
});
