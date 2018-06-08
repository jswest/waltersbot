const Sequelize = require('sequelize');
const db = new Sequelize('walters', '', '', {
	dialect: 'sqlite',
	storage: './../db/walters.db'
});
const Creator = db.define(
	'creator',
	{
		name: Sequelize.STRING
	},
	{ underscored: true }
);
const Keyword = db.define(
	'keyword',
	{
		name: Sequelize.STRING
	},
	{ underscored: true }
);
const Piece = db.define(
	'piece',
	{
		original_id: Sequelize.INTEGER,
		collection_id: Sequelize.INTEGER,
		collection: Sequelize.STRING,
		date_begin_year: Sequelize.INTEGER,
		date_end_year: Sequelize.INTEGER,
		date_text: Sequelize.STRING,
		title: Sequelize.STRING,
		dimensions: Sequelize.STRING,
		medium: Sequelize.STRING,
		inscriptions: Sequelize.STRING,
		classification: Sequelize.STRING,
		description: Sequelize.TEXT,
		credit_line: Sequelize.STRING,
		resource_url: Sequelize.STRING,
		provenance: Sequelize.STRING,
		primary_image_url_tiny: Sequelize.STRING,
		primary_image_url_small: Sequelize.STRING,
		primary_image_url_medium: Sequelize.STRING,
		primary_image_url_large: Sequelize.STRING,
		primary_image_url_raw: Sequelize.STRING,
		public_access_date: Sequelize.STRING
	},
	{ underscored: true }
);

Creator.hasMany(Piece);
Keyword.belongsToMany(Piece, { through: 'keyword_piece' });
Piece.belongsToMany(Keyword, { through: 'keyword_piece' });
Piece.belongsTo(Creator);

const pieces = require('./objects.json');

db.sync().then(() => {
	index = 0;
	const makePiece = () => {
		console.log(index);
		if (index < pieces.length) {
			let o = pieces[index];
			Piece.create({
				original_id: o.ObjectId,
				collection_id: o.CollectionID,
				collection: o.Collection,
				date_begin_year: o.DateBeginYear,
				date_end_year: o.DateEndYear,
				date_text: o.DateText,
				title: o.Title,
				dimensions: o.Dimensions,
				medium: o.Medium,
				inscriptions: o.Inscriptions,
				classification: o.Classification,
				description: o.Description,
				credit_line: o.CreditLine,
				resource_url: o.ResourceURL,
				provenance: o.Keywords,
				primary_image_url_tiny: o.PrimaryImage.Tiny,
				primary_image_url_small: o.PrimaryImage.Small,
				primary_image_url_medium: o.PrimaryImage.Medium,
				primary_image_url_large: o.PrimaryImage.Large,
				primary_image_url_raw: o.PrimaryImage.Raw
			}).then(piece => {
				keywordIndex = 0;
				const createKeyword = () => {
					let keywords;
					if (o.Keywords) {
						keywords = o.Keywords.split('; ').map(word => {
							return word.trim();
						});
					} else {
						keywords = [];
					}
					if (keywordIndex < keywords.length) {
						Keyword.findOrCreate({
							where: {
								name: keywords[keywordIndex]
							}
						}).then(keyword => {
							keyword[0].addPiece(piece).then(() => {
								keywordIndex++;
								createKeyword();
							});
						});
					} else {
						index++;
						makePiece();
					}
				};
				const createCreator = () => {
					Creator.findOrCreate({
						where: {
							name: o.Creator
						}
					}).then(creator => {
						creator[0].addPiece(piece).then(createKeyword);
					});
				};
				createCreator();
			});
		} else {
			console.log('Done.');
		}
	};
	makePiece();
});
