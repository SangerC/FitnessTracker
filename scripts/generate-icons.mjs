// Generates simple placeholder PWA icons (solid background + dumbbell glyph) as raw PNGs,
// avoiding any external image dependency.
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';

const CRC_TABLE = (() => {
	const table = new Uint32Array(256);
	for (let n = 0; n < 256; n++) {
		let c = n;
		for (let k = 0; k < 8; k++) {
			c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
		}
		table[n] = c >>> 0;
	}
	return table;
})();

function crc32(buf) {
	let c = 0xffffffff;
	for (let i = 0; i < buf.length; i++) {
		c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
	}
	return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
	const typeBuf = Buffer.from(type, 'ascii');
	const lenBuf = Buffer.alloc(4);
	lenBuf.writeUInt32BE(data.length, 0);
	const crcBuf = Buffer.alloc(4);
	crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
	return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function encodePng(width, height, rgba) {
	const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
	const ihdr = Buffer.alloc(13);
	ihdr.writeUInt32BE(width, 0);
	ihdr.writeUInt32BE(height, 4);
	ihdr[8] = 8; // bit depth
	ihdr[9] = 6; // color type RGBA
	ihdr[10] = 0;
	ihdr[11] = 0;
	ihdr[12] = 0;

	const stride = width * 4;
	const raw = Buffer.alloc((stride + 1) * height);
	for (let y = 0; y < height; y++) {
		raw[y * (stride + 1)] = 0; // no filter
		rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
	}
	const idat = deflateSync(raw);

	return Buffer.concat([signature, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

function drawIcon(size, { padding = 0, maskable = false } = {}) {
	const rgba = Buffer.alloc(size * size * 4);
	const bg = [15, 23, 42]; // slate-900
	const fg = [56, 189, 248]; // sky-400

	const set = (x, y, color, alpha = 255) => {
		if (x < 0 || y < 0 || x >= size || y >= size) return;
		const i = (y * size + x) * 4;
		rgba[i] = color[0];
		rgba[i + 1] = color[1];
		rgba[i + 2] = color[2];
		rgba[i + 3] = alpha;
	};

	for (let y = 0; y < size; y++) {
		for (let x = 0; x < size; x++) {
			set(x, y, bg);
		}
	}

	// Dumbbell glyph: bar + two weight plates, centered, scaled to size.
	const margin = maskable ? size * 0.28 : size * 0.18 + padding;
	const cx = size / 2;
	const cy = size / 2;
	const barHalfHeight = size * 0.04;
	const barLeft = margin + size * 0.14;
	const barRight = size - margin - size * 0.14;
	const plateWidth = size * 0.1;
	const plateHalfHeight = size * 0.16;

	for (let y = 0; y < size; y++) {
		for (let x = 0; x < size; x++) {
			const inBar = Math.abs(y - cy) <= barHalfHeight && x >= barLeft && x <= barRight;
			const inLeftPlate =
				x >= margin && x <= margin + plateWidth && Math.abs(y - cy) <= plateHalfHeight;
			const inRightPlate =
				x <= size - margin && x >= size - margin - plateWidth && Math.abs(y - cy) <= plateHalfHeight;
			if (inBar || inLeftPlate || inRightPlate) {
				set(x, y, fg);
			}
		}
	}

	return rgba;
}

mkdirSync('static/icons', { recursive: true });

const targets = [
	{ file: 'static/icons/icon-192.png', size: 192 },
	{ file: 'static/icons/icon-512.png', size: 512 },
	{ file: 'static/icons/icon-512-maskable.png', size: 512, maskable: true }
];

for (const t of targets) {
	const rgba = drawIcon(t.size, { maskable: t.maskable });
	writeFileSync(t.file, encodePng(t.size, t.size, rgba));
	console.log('wrote', t.file);
}
