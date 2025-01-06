import wixData from "wix-data";
import wixLocation from 'wix-location';
import { formFactor } from 'wix-window';
import {list} from 'public/minerallist.js';

const { locality, region, sort } = wixLocation.query;
let lastFilterTitle;
let lastFilterRegion;
let lastFilterType;
let lastFilterMineral;
let debounceTimer;
let prevSelectedValue = "Minerals";
let filterclickcount = 0;

$w.onReady(() => {
  //loadRegions();
  if (wixLocation.query) {
  readParams();
  }
  $w('#filterselectiontags').value = [prevSelectedValue];
  if (formFactor === 'Mobile') {
    $w('#mobileRepeaterImage').show();
    $w('#image').hide();
  }
  //loadPrevSearch();
});
 
export function filterminerals_click(event) {
	if (filterclickcount === 0) {
    filterclickcount++;
    $w('#filterBox').expand();
    $w('#indictext').text = '-'
  } else { 
    filterclickcount = 0;
    $w('#filterBox').collapse();
    $w('#indictext').text = '+'
  }
}

async function noResultsCheck(){
  let count = await $w('#dynamicDataset').getTotalCount();
  if (count > 0){
    $w('#noresultsTxt').hide();
  } else {
    $w('#noresultsTxt').show();
  }
}

export function filterselectiontags_change(event) {
	// Prevent deselecting the only selected tag. Radio buttons do not allow it so tags shouldn't either.
	if (!event.target.value || event.target.value.length === 0) {
		// Re-apply the previously selected tag. Annoyingly, this results in a flicker that we can do nothing about.
		event.target.value = [prevSelectedValue];
	// Replace the previously selected tag with the newly selected one.
	} else {
		// Note: Array.filter() was added in ES7. Only works in some browsers.
		event.target.value = event.target.value.filter(x => x !== prevSelectedValue);
		prevSelectedValue = event.target.value[0];
	}
  const selectedvalue = $w('#filterselectiontags').value[0];
  $w('#filterstateBox').changeState(selectedvalue);
}

export function associatesTag_change(event) {
	$w('#associatesInput').value = $w('#associatesTag').value.join(",");
 filter(lastFilterTitle, lastFilterRegion, lastFilterType, $w('#associatesInput').value);
}

export function iTitle_input(event) {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = undefined;
  }
  debounceTimer = setTimeout(() => {
    filter(event.target.value, lastFilterRegion, lastFilterType, lastFilterMineral);
  }, 500);
}

export function regionselectiontags_change(event) {
  if (event.target.value[0]) {
    filter(lastFilterTitle, event.target.value, lastFilterType, lastFilterMineral);  
  } else {
   filter(lastFilterTitle, null, lastFilterType, lastFilterMineral);
  }
}  

export function typeselectionTags_change(event) {
  if (event.target.value[0]) {
    filter(lastFilterTitle, lastFilterRegion, event.target.value, lastFilterMineral);  
  } else {
   filter(lastFilterTitle, lastFilterRegion, null, lastFilterMineral);
  }
}

export function clearFilters_click(event) {
	$w('TextInput').value = null;
  $w('#noresultsTxt').hide();
  $w('#lusterselectiontags, #iStreak, #iMineralClass, #iCrystalSystem').value = null;
  $w('#associatesTag').options = [];
  filter(null, null, null, null);
}

function sortDataset() {
  let sort = wixData.sort();
  let sortValue = $w('#sortDropdown').value;
    switch (sortValue) {
    case 'newestFirst':
        // Sort the products by their name: A - Z
        sort = sort.descending('_createdDate');
        break;
    
    case 'lastUpdatedFirst':
        // Sort the products by their name: A - Z
        sort = sort.descending('_updatedDate');
        break;
      
    case 'a-z':
        // Sort the products by their name: A - Z
        sort = sort.ascending('title');
        break;

    case 'z-a':
        // Sort the products by their name: Z - A
        sort = sort.descending('title');
        break;

    case 'mostViewed':
        sort = sort.descending('views')
        break;
    }

  $w('#dynamicDataset').setSort(sort);

}

function loadassociatefiltertags(input) {
    const cleanmineralData = list(input).filter(x => x !== undefined);
    let options = [];
    options.push(...cleanmineralData.map(region =>{
      return {'value' : region, 'label': region};
    }));
    console.log(options)
    $w('#associatesTag').options = options;
}

export function associatesInput_input(event) {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = undefined;
  }
  debounceTimer = setTimeout(() => {
    let associates = event.target.value.split(',');
    let filteredassociates = associates.filter(el => {
      return el != null && el != '';
    });
    loadassociatefiltertags($w('#associatesInput').value);    
    filter(lastFilterTitle, lastFilterRegion, lastFilterType, filteredassociates);
  }, 500);
}

function filter(title, region, type, minerals) {
  if (lastFilterTitle !== title || lastFilterRegion !== region || lastFilterType !== type || lastFilterMineral !== minerals) {
    let newFilter = wixData.filter();
    if (title)
      newFilter = newFilter.contains('title', title)
      .or(newFilter.contains("description", title))
      .or(newFilter.contains("mineralsArraySearch", title));
    if (region)
      newFilter = newFilter.hasSome('region', region);
    if (type)
      newFilter = newFilter.hasSome('typeText', type);
    if (minerals)
      minerals.forEach((field) => {
        newFilter = newFilter.contains("mineralsArraySearch", field);
      })
      //newFilter = newFilter.hasSome('mineralsArraySearch', minerals);
    $w('#dynamicDataset').setFilter(newFilter)
    .then( () => {
      noResultsCheck();	
    });
    lastFilterTitle = title; 
    lastFilterRegion = region;
    lastFilterType = type;
    lastFilterMineral = minerals;
  }
}

function readParams() {
  if (region === 'All Regions') {
    filter(locality, '');
  } else {
    filter(locality, region);
  }
  $w('#iTitle').value = locality;
  $w('#sortDropdown').value = sort
}

function countResults() {
	let total = $w('#dynamicDataset').getTotalCount();
	if (total > 1) {
		$w('#textResults').text = `${total} results were found.`;
		$w('#textResults').show();

	}

	if (total === 1) {
		$w('#textResults').text = `${total} result was found.`;
		$w('#textResults').show();
	}

	if (total === 0) {
		$w('#textResults').text = "No results found!";
	  $w('#textResults').show();
	}
}

function noResults() {
	//let total = $w('#dynamicDataset').getTotalCount();
  //let total = $w("#repeater1").data.length
	/*
  if (total > 1) {
		$w('#textResults').text = `${total} results were found.`;
		$w('#textResults').show();

	}

	if (total === 1) {
		$w('#textResults').text = `${total} result was found.`;
		$w('#textResults').show();
	}
  */
	if (total === 0) {
		$w('#textResults').text = "No results found!";
	  $w('#textResults').show();
	}
}


export function sortDropdown_change(event) {
  sortDataset();
}

export function noresultsTxt_click(event) {
	clearFilters_click();
}

export function localityRepeater_itemReady($item, itemData, index) {
  $item('#speciesText').text = itemData.mineralsArraySearch.length + ' Species';
  console.log(itemData.mineralsArraySearch.length);
  $item("#container1").onClick( () => {
    let targetUrl = itemData['link-locality-database-title'];
    wixLocation.to(targetUrl);
  } );
}