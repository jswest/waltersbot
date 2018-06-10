const fs = require('fs');

const sqlite = require('sqlite3');
const Twit = require('twit');

const config = require('./config/config.json');
const ImageScraper = require('./lib/ImageScraper');
const ImageManipulator = require('./lib/ImageManipulator');

const t = new Twit({
	consumer_key: config.twitter.consumer_key,
	consumer_secret: config.twitter.consumer_secret,
	access_token: config.twitter.access_token,
	access_token_secret: config.twitter.access_token_secret
});

const postTweet = (piece, creator, callback) => {
	t.post(
		'media/upload',
		{
			media_data: fs.readFileSync('./tmp/sorted.jpg', {
				encoding: 'base64'
			})
		},
		(err, data, response) => {
			const mediaId = data.media_id_string;
			const mediaMetaParams = {
				media_id: mediaId,
				alt_text: {
					text: piece.title
				}
			};
			t.post(
				'media/metadata/create',
				mediaMetaParams,
				(err, data, response) => {
					const params = {
						status: `${piece.title} by ${creator.name}${'\n'}${
							piece.resource_url
						}`,
						media_ids: [mediaId]
					};
					t.post('statuses/update', params, (err, data, response) => {
						console.log('Tweet posted.');
						callback();
					});
				}
			);
		}
	);
};

const db = new sqlite.Database('./db/walters.db', err => {
	db.get('SELECT COUNT(*) AS count FROM pieces', (err, row) => {
		const count = row.count;
		let index = 1;
		const imager = new ImageScraper();
		const manipular = new ImageManipulator();
		const run = () => {
			if (index <= count) {
				imager.run(index, () => {
					manipular.run(() => {
						db.get(
							`SELECT * FROM pieces WHERE id = ${index}`,
							(err, pieceRow) => {
								db.get(
									`SELECT * FROM creators WHERE id = ${
										pieceRow.creator_id
									}`,
									(err, creatorRow) => {
										postTweet(pieceRow, creatorRow, () => {
											index++;
											setTimeout(run, 14400000);
										});
									}
								);
							}
						);
					});
				});
			} else {
				t.post(
					'statuses/update',
					{ status: 'FIN.' },
					(err, data, response) => {
						console.log('Tweet posted.');
					}
				);
			}
		};
		run();
	});
});
