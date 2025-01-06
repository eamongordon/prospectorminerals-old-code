import wixData from 'wix-data';

export function LocalityDatabase_afterUpdate(item, context) {
    let hookContext = context;
    return wixData.queryReferenced("LocalityDatabase", item._id, "significantMinerals", {"order" : "asc"})
    .then( (res) => {
      let options = [];
	    options.push(...res.items.map(continent => {
	  		return {"name": continent.title, "link": 'https://www.prospectorminerals.com' + continent['link-database-title']};
	  	}));
      let secoptions = [];
	    secoptions.push(...res.items.map(continent => {
	  		return continent.title;
	  	}));
      item.mineralsArray = options;
      item.mineralsArraySearch = secoptions;
      return item;
    } )
}

export async function Database_afterUpdate(item, context) {
    wixData.queryReferenced("Database", item._id, "associatedMineralsRef", {"order" : "asc"})
    .then( (res) => {
      let dboptions = [];
	    dboptions.push(...res.items.map(continent => {
	  		return continent.title;
	  	}));
      item.associatedMineralsArray = dboptions;
      return item;
    } )
  const queryResults = await wixData.query('Galleries').eq('title', item.title).find();
  const photoResultsRefObjs = await wixData.queryReferenced("Database", item._id, "Photos")
  const photoResultsIdList = [];
  photoResultsIdList.push(...photoResultsRefObjs.items.map(ite => {
    return ite._id;
  }));
  if (queryResults && queryResults.items && queryResults.items.length > 0) { 
    wixData.insertReference("Galleries", "Photos", queryResults.items[0]._id, photoResultsIdList);
  } else {
  let photoslist = item['Photos'];
  let toInsert = {
    "title": item.title,
    "coverImage": item.coverImage,
    "category": "Minerals",
    "description": `Photos of ${item.title} assorted specimens from worldwide localities.`,
    "Photos": photoslist,
    "popularity": 2
  }
	wixData.insert("Galleries", toInsert);
  }
}

export function Photos_afterUpdate(item, context) {
    return wixData.queryReferenced("Photos", item._id, "mineralsInPhoto", {"order" : "asc"})
    .then( (res) => {
      let dboptions = [];
	    dboptions.push(...res.items.map(continent => {
	  		return continent.title;
	  	}));
      item.mineralsInPhotoArray = dboptions;
      return item;
    } )
}

export async function Database_afterInsert(item, context) {
  const queryResults = await wixData.query('Galleries').eq('title', item.title).find();
  const photoResultsRefObjs = await wixData.queryReferenced("Database", item._id, "Photos")
  const photoResultsIdList = [];
  photoResultsIdList.push(...photoResultsRefObjs.items.map(ite => {
    return ite._id;
  }));
  if (queryResults && queryResults.items && queryResults.items.length > 0) { 
    wixData.insertReference("Galleries", "Photos", queryResults.items[0]._id, photoResultsIdList);
  } else {
  let photoslist = item['Photos'];
  let toInsert = {
    "title": item.title,
    "coverImage": item.coverImage,
    "category": "Minerals",
    "description": `Photos of ${item.title} assorted specimens from worldwide localities.`,
    "Photos": photoslist,
    "popularity": 2
  }
	wixData.insert("Galleries", toInsert);
  }
}