const fs = require('fs');

const request = require('request');
const sqlite = require('sqlite3');

class ImageScraper {
	run(id, callback) {
		const db = new sqlite.Database('./db/walters.db', err => {
			if (err) {
				console.log(err.message);
			} else {
				db.get(
					`SELECT * FROM pieces AS p WHERE p.id = ${id}`,
					(err, row) => {
						if (err) {
							console.log(err);
						} else if (row) {
							request.get(row.primary_image_url_raw).pipe(
								fs
									.createWriteStream(`./tmp/piece.jpg`)
									.on('close', () => {
										db.close(callback);
									})
							);
						}
					}
				);
			}
		});
	}
}

module.exports = ImageScraper;
