db = connect("mongodb://localhost:27017/edupath_explorer");
db.platformsettings.updateOne({ key: 'global' }, { $set: { couponOwnerPercent: 70, directParentPercent: 10, platformPercent: 20 } }, { upsert: true });
printjson(db.platformsettings.findOne({ key: 'global' }));
