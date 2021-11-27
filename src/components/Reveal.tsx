import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import './Reveal.scss';
import { decode } from 'blurhash';
import hashData from 'data/blurhash.json';

interface Props {
	className?: string;
	style?: React.CSSProperties;
	title: string;
	alt: string;
	src: string;
	onClick: () => void;
}

export default function Blur({
	className,
	style,
	title,
	alt,
	src,
	onClick,
}: Props) {
	const hash = (hashData as Record<string, string>)[src] as string | undefined;
	const [loaded, setLoaded] = useState(!hash);
	const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);

	useEffect(() => {
		if (!hash || !canvas) return;
		const width = 32;
		const height = 32;
		canvas.width = width;
		canvas.height = height;
		// `decode` is kind of expensive,
		// spread things out a bit when many images are shown at once
		requestAnimationFrame(() => {
			const pixels = decode(hash, width, height);
			console.log(pixels);
			const context = canvas.getContext('2d');
			if (!context) return;
			const imageData = context.createImageData(width, height);
			imageData.data.set(pixels);
			context.putImageData(imageData, 0, 0);
		});
	}, [hash, canvas, src]);

	return (
		<div
			className={clsx('Reveal', className, { revealed: loaded })}
			style={style}
		>
			<canvas ref={(el) => setCanvas(el)} />
			<img
				title={title}
				alt={alt}
				src={src}
				loading="lazy"
				onLoad={() => setLoaded(true)}
				onClick={onClick}
			/>
		</div>
	);
}
