import wixData from 'wix-data';
import wixLocation from 'wix-location';
import wixWindow from 'wix-window';
import { removePhrases } from 'public/minerallist.js';

let debounceTimer;
let searchquery;
let prevSelectedValue;
let wordslist;
//let noResultsCount = 0;

$w.onReady(function () {
	if (wixLocation.query.q){
		searchquery = wixLocation.query.q;
	} else if (wixLocation.path[1]){
		searchquery = decodeURIComponent(wixLocation.path[1]).replace(/-/g, ' ');
	}
	if (wixLocation.query.q && wixLocation.path[1]){
		wixLocation.to(`/search?q=${searchquery}`);
	}
	if(wixWindow.formFactor === "Mobile") {
      $w('#iTitle').placeholder = 'Enter a Topic or Keyword';
    }
	if (searchquery) {
		$w('#loadingStrip').expand();
		$w('#photoStrip, #glossaryStrip, #articleStrip, #localityStrip, #mineralStrip').collapse();
		$w('#iTitle').value = searchquery;
		$w('#mineralDataset, #localityDataset, #photosDataset, #postsDataset, #glossaryDataset').onReady( () => {
			filter(searchquery);
		});
	}
});


async function filter(input) {
	let mineralFilter = wixData.filter();
	let inputarray = input.split(" ");
	let localityFilter = wixData.filter();
	let postsFilter = wixData.filter();
	let photoFilter = wixData.filter();
	let glossaryFilter = wixData.filter();
	inputarray.length = 3; 
	let cleanedinputArray = await removePhrases(inputarray);
	cleanedinputArray.forEach((element) => {
	mineralFilter = mineralFilter.contains('title', element)
		.or(mineralFilter.contains("varieties", element))
    	.or(mineralFilter.contains("varietiesArray", element))
		//.or(mineralFilter.contains("description", element))
		//.or(mineralFilter.contains("mineralClass", element))
	localityFilter = localityFilter.contains('title', element)
        //.or(localityFilter.contains("description", element))
        .or(localityFilter.contains("locality", element))
        .or(localityFilter.contains("mineralsArraySearch", element))
	postsFilter = postsFilter.contains('title', element)
		//.or(postsFilter.contains("excerpt", element))
		//.or(postsFilter.contains("plainContent", element))
	photoFilter = photoFilter.contains('title', element)
		.or(photoFilter.contains("locality", element))
        //.or(photoFilter.contains("description", element))
    glossaryFilter = glossaryFilter.contains('title', element)
		//.or(glossaryFilter.contains('definition', element))
	});
	Promise.all([filterMinerals(mineralFilter), filterLocalities(localityFilter), filterArticles(postsFilter), filterPhotos(photoFilter), filterGlossary(glossaryFilter)]).then((values) => {
		//$w('#loadingStrip').collapse();
  		const initialValue = 0;
		const noResultsCount = values.reduce((previousValue, currentValue) => previousValue + currentValue, initialValue);
		console.log(values);
		if (noResultsCount > 4) {
			console.log(noResultsCount);
			fixSpelling(input)
			.then( (result) => {
				if (result){
					filter(result);
					console.log(result);
				} else {
					$w('#noResultsStrip').expand();
					$w('#mineralStrip, #photoStrip, #glossaryStrip, #articleStrip, #localityStrip').collapse();					
				}
			});
		}
	});
}

async function filterMinerals(mineralFilter) {
	return $w('#mineralDataset').setFilter(mineralFilter)
	.then( () => {
		$w('#loadingStrip').collapse();
		$w('#mineralStrip').expand();
		let count = $w('#mineralDataset').getTotalCount();
		if (count === 0) {
			$w('#mineralStrip').collapse();
			return 1;
		} else if (count > 3) {
			$w('#mineralStrip').expand();
			$w('#mineralResultsButton').show();
			$w('#noResultsStrip').collapse();
			return 0;
			//$w('#mineralRepeater').expand();
		} else {   
			$w('#mineralStrip').expand();
			$w('#mineralResultsButton').hide();
			$w('#noResultsStrip').collapse();
			return 0;
			//$w('#mineralRepeater').expand();
		}
	});
}

async function filterLocalities(localityFilter) {
	return $w('#localityDataset').setFilter(localityFilter)
	.then( () => {
		$w('#localityStrip').expand();
		let count = $w('#localityDataset').getTotalCount();
		if (count === 0) {
			$w('#localityStrip').collapse();
			return 1;
		} else if (count > 4) {
			$w('#localityStrip').expand();
			$w('#localityResultsButton').show();
			$w('#localityResultsButton').expand();
			$w('#noResultsStrip').collapse();
			return 0;
			//$w('#localityRepeater').expand();
		} else {
			$w('#localityStrip').expand();
			$w('#localityResultsButton').hide();
			$w('#localityResultsButton').collapse();
			$w('#noResultsStrip').collapse();
			return 0;
			//$w('#localityRepeater').expand();
		}
	});
}

async function filterArticles(postsFilter) {
	return $w('#postsDataset').setFilter(postsFilter)
	.then( () => {
		$w('#articleStrip').expand();
		let count = $w('#postsDataset').getTotalCount();
		if (count === 0) {
			$w('#articleStrip').collapse();
			return 1;
		} else if (count > 3) {
			$w('#articleStrip').expand();
			$w('#articleResultsButton').show();
			$w('#noResultsStrip').collapse();
			return 0;
			//$w('#articleRepeater').expand();
		} else {	
			$w('#articleStrip').expand();
			$w('#articleResultsButton').hide();
			$w('#noResultsStrip').collapse();
			return 0;
			//$w('#articleRepeater').expand();
		}
	});
}

async function filterGlossary(glossaryFilter) {
	return $w('#glossaryDataset').setFilter(glossaryFilter)
	.then( () => {
		$w('#glossaryStrip').expand();
		let count = $w('#glossaryDataset').getTotalCount();
		if (count === 0) {
			$w('#glossaryStrip').collapse();
			return 1;
		} else if (count > 3) {
			$w('#glossaryStrip').expand();
			$w('#glossaryResultsButton').show();
			$w('#noResultsStrip').collapse();
			return 0;
		} else { 	
			$w('#glossaryStrip').expand();
			$w('#glossaryResultsButton').hide();
			$w('#noResultsStrip').collapse();
			return 0;
			//$w('#glossaryRepeater').expand();
		}
	});
}

async function filterPhotos(photoFilter) {
	return $w('#photosDataset').setFilter(photoFilter)
	.then( () => {
		$w('#photoStrip').expand();
		let count = $w('#photosDataset').getTotalCount();
		if (count === 0) {
			$w('#photoStrip').collapse();
			return 1;
		} else if (count > 8) {
			$w('#photoStrip').expand();
			$w('#photoResultsButton').show();
			$w('#noResultsStrip').collapse();
			return 0;
			//$w('#photoGallery').expand();
		} else {
			$w('#photoStrip').expand();
			$w('#photoResultsButton').hide();
			$w('#noResultsStrip').collapse();
			return 0;
			//$w('#photoGallery').expand();
		}
	});
}

export function iTitle_input(event) {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = undefined;
  }
  debounceTimer = setTimeout(() => {
    filter($w('#iTitle').value);
	if (wixLocation.path[1]){
		wixLocation.to(`/search?q=${$w('#iTitle').value}`);
	} else { 
		wixLocation.queryParams.add({"q": $w('#iTitle').value});
	}
  }, 500);
}

export function menuselectiontags_change(event) {
    if (!event.target.value || event.target.value.length === 0) {
        event.target.value = [prevSelectedValue];
    } else {
        event.target.value = event.target.value.filter(x => x !== prevSelectedValue);
		console.log(prevSelectedValue);
		prevSelectedValue = event.target.value[0];
    }
        const selectedvalue = $w('#menuselectiontags').value[0]
        if(selectedvalue === "All"){
            filter($w('#iTitle').value);
        } else if (selectedvalue === "Minerals"){
            $w('#localityStrip, #photoStrip, #glossaryStrip, #articleStrip').collapse();
            $w('#mineralStrip').expand();
        } else if (selectedvalue === "Photos"){
            $w('#mineralStrip, #localityStrip, #glossaryStrip, #articleStrip').collapse();
            $w('#photoStrip').expand();
        } else if (selectedvalue === "Articles"){
            $w('#mineralStrip, #localityStrip, #photoStrip, #glossaryStrip').collapse();
            $w('#articleStrip').expand();
        } else if (selectedvalue === "Localities"){
            $w('#mineralStrip, #photoStrip, #glossaryStrip, #articleStrip').collapse();
            $w('#localityStrip').expand();
        } else if (selectedvalue === "Glossary"){
			$w('#mineralStrip, #localityStrip, #photoStrip, #articleStrip').collapse();
			$w('#glossaryStrip').expand();
		}
}

function sortDataset() {
  let sort = wixData.sort();
  let articlesort = wixData.sort();
  let sortValue = $w('#sortDropdown').value;
    switch (sortValue) {
    case 'newestFirst':
        sort = sort.descending('_createdDate');
		articlesort = articlesort.descending('publishedDate');
        break;
    
    case 'lastUpdatedFirst':
        sort = sort.descending('_updatedDate');
		articlesort = articlesort.descending('lastPublishedDate');
        break;
      
    case 'a-z':
        sort = sort.ascending('title');
		articlesort = articlesort.ascending('title');
        break;

    case 'z-a':
        sort = sort.descending('title');
		articlesort = articlesort.descending('title');
        break;
    
    case 'mostViewed':
        sort = sort.descending('views');
		articlesort = articlesort.descending('viewCount');
        break;
    }

  $w('#mineralDataset, #photoDataset, #localityDataset, #glossaryDataset').setSort(sort);
  $w('#postsDataset').setSort(articlesort);
}

async function fixSpelling(term){
	const MicroSpellingCorrecter = require('micro-spelling-correcter');
	const wordquery = await wixData.query("SearchTerms").limit(1000).find();
	if (!wordslist){
		wordslist = wordquery.items.map(ite =>{
      		return ite.title;
    	});
	}
	let correcter = new MicroSpellingCorrecter(wordslist, 2);
	if (correcter.correct(term)){
		console.log(correcter.correct);
		return correcter.correct(term);
	} else {
		return null;
	}
}

export function sortDropdown_change(event) {
	sortDataset();
}

export function articleRepeater_itemReady($item, itemData, index) {
	$item('#articleContainer').onClick( (event, $w) => {
    	wixLocation.to(itemData.postPageUrl);
	} );
}

export function localityRepeater_itemReady($item, itemData, index) {
	$item('#localityContainer').onClick( (event, $w) => {
    	wixLocation.to(itemData['link-locality-database-title']);
	} );
}

export function glossaryRepeater_itemReady($item, itemData, index) {
	$item('#glossaryContainer').onClick( (event, $w) => {
    	wixLocation.to(itemData['link-glossary-1-title']);
	} );
}

export function mineralResultsButton_click(event) {
 	prevSelectedValue = 'Minerals';
	$w('#menuselectiontags').value = ['Minerals'];
	$w('#localityStrip, #photoStrip, #glossaryStrip, #articleStrip').collapse();
}

export function photoResultsButton_click(event) {
	prevSelectedValue = 'Photos';
	$w('#menuselectiontags').value = ['Photos'];
    $w('#mineralStrip, #localityStrip, #glossaryStrip, #articleStrip').collapse();           
}

export function glossaryResultsButton_click(event) {
	prevSelectedValue = 'Glossary';
	$w('#menuselectiontags').value = ['Glossary'];
	$w('#mineralStrip, #localityStrip, #photoStrip, #articleStrip').collapse();  
}

export function articleResultsButton_click(event) {
	prevSelectedValue = 'Articles';
	$w('#menuselectiontags').value = ['Articles'];
	$w('#mineralStrip, #localityStrip, #photoStrip, #glossaryStrip').collapse();  
}

export function localityResultsButton_click(event) {
	prevSelectedValue = 'Localities';
	$w('#menuselectiontags').value = ['Localities'];
	$w('#mineralStrip, #photoStrip, #glossaryStrip, #articleStrip').collapse();
}

export function tryagainTxt_click(event) {
	$w('#iTitle').value = null;
	$w('#iTitle').focus();
	filter($w('#iTitle').value);
}