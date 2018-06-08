const sqlite = require('sqlite3');

const ImageScraper = require('./lib/ImageScraper');
const ImageManipulator = require('./lib/ImageManipulator');

const db = new sqlite.Database('./db/walters.db', err => {
	db.get('SELECT COUNT(*) AS count FROM pieces', (err, row) => {
		const count = row.count;
		let index = 100;
		const imager = new ImageScraper();
		const manipular = new ImageManipulator();
		const run = () => {
			if (index <= count) {
				imager.run(index, () => {
					manipular.run(() => {
						console.log('DONE.');
					});
				});
			} else {
				console.log('FIN.');
			}
		};
		run();
	});
});
