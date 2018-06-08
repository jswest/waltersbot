const fs = require('fs');

const { createCanvas, loadImage } = require('canvas');

const gm = require('gm');

class ImageManipulator {
	run(callback) {
		gm('./tmp/piece.jpg')
			.resize(500, null)
			.write('./tmp/piece.jpg', () => {
				gm('./tmp/piece.jpg').size((err, size) => {
					const width = size.width;
					const height = size.height;
					const srcCanvas = createCanvas(width, height);
					const srcCtx = srcCanvas.getContext('2d');
					const dstCanvas = createCanvas(width, height);
					const dstCtx = dstCanvas.getContext('2d');
					loadImage('./tmp/piece.jpg').then(image => {
						srcCtx.drawImage(image, 0, 0, width, height);
						let data = srcCtx.getImageData(
							0,
							0,
							srcCanvas.width,
							srcCanvas.height
						).data;
						let pixels = [];
						for (let i = 0; i < data.length; i += 4) {
							let red = data[i];
							let green = data[i + 1];
							let blue = data[i + 2];
							let alpha = data[i + 3];
							pixels.push([red, green, blue]);
						}
						const add = function(p) {
							return p[0] + p[1] + p[2];
						};
						let sorted = pixels.sort((a, b) => {
							let aIsRed =
								a[0] > a[1] && a[0] > a[2] ? true : false;
							let aIsBlue =
								a[1] > a[0] && a[1] > a[2] ? true : false;
							let aIsGreen =
								a[2] > a[0] && a[2] > a[1] ? true : false;
							let bIsRed =
								b[0] > b[1] && b[0] > b[2] ? true : false;
							let bIsBlue =
								b[1] > b[0] && b[1] > b[2] ? true : false;
							let bIsGreen =
								b[2] > b[0] && b[2] > b[1] ? true : false;
							if (
								(aIsRed && bIsRed) ||
								(aIsBlue && bIsBlue) ||
								(aIsGreen && bIsGreen) ||
								(!aIsRed &&
									!aIsBlue &&
									!aIsGreen &&
									(!bIsRed && !bIsBlue && !bIsGreen))
							) {
								return add(a) > add(b) ? 1 : -1;
							} else {
								if (aIsRed) {
									return 1;
								} else if (aIsBlue && !bIsRed) {
									return 1;
								} else {
									return -1;
								}
							}
						});
						let sortedImageData = dstCtx.createImageData(
							width,
							height
						);
						let j = 0;
						for (
							let i = 0;
							i < sortedImageData.data.length;
							i += 4
						) {
							sortedImageData.data[i + 0] = pixels[j][0];
							sortedImageData.data[i + 1] = pixels[j][1];
							sortedImageData.data[i + 2] = pixels[j][2];
							sortedImageData.data[i + 3] = 255;
							j++;
						}
						dstCtx.putImageData(sortedImageData, 0, 0);
						dstCanvas.createJPEGStream().pipe(
							fs
								.createWriteStream('./tmp/test.jpg')
								.on('finish', () => {
									callback();
								})
						);
					});
				});
			});
	}
}

module.exports = ImageManipulator;
