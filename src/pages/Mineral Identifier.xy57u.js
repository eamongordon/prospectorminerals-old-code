import wixData from "wix-data";
import wixLocation from 'wix-location';
import {list} from 'public/minerallist.js';

let lastFilterTitle;
let lastFilterClass;
let lastFilterSystem;
let lastFilterHardnessMin;
let lastFilterHardnessMax;
let lastFilterLuster;
let lastFilterChemical;
let lastFilterStreak;
let lastFilterAssociates;
let debounceTimer;
let filterclickcount = 0;
let prevSelectedValue = null;
let hardnessMinPrevValue = 0;
let hardnessMaxPrevValue = 10;
let mineralResult;
let filteredchemsparam;
let crystalSystemArray;
let streakArray;
let mineralClassArray;
let filteredassociatesparam;

$w.onReady( function() {
  /*
  $w("#box1").onClick( (event, $w) => {
    let targetUrl = $w("#dynamicDataset").getCurrentItem()['link-database-title'];
    wixLocation.to(targetUrl)
  } );
  */
  if (wixLocation.query) {
    readParams();
  }
} );

export function iTitle_input(event) {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = undefined;
  }
  debounceTimer = setTimeout(() => {
    filter(event.target.value, lastFilterClass, lastFilterSystem, lastFilterHardnessMin, lastFilterHardnessMax, lastFilterLuster, lastFilterChemical, lastFilterStreak, lastFilterAssociates);  
  }, 500);
}

export function iMineralClass_change(event) {
  if (event.target.value[0]) {
    filter(lastFilterTitle, $w('#iMineralClass').value, lastFilterSystem, lastFilterHardnessMin, lastFilterHardnessMax, lastFilterLuster, lastFilterChemical, lastFilterStreak, lastFilterAssociates);
  } else { 
    filter(lastFilterTitle, null, lastFilterSystem, lastFilterHardnessMin, lastFilterHardnessMax, lastFilterLuster, lastFilterChemical, lastFilterStreak, lastFilterAssociates);
  }
}

export function iCrystalSystem_change(event) {
  if (event.target.value[0]) {
    filter(lastFilterTitle, lastFilterClass, $w('#iCrystalSystem').value, lastFilterHardnessMin, lastFilterHardnessMax, lastFilterLuster, lastFilterChemical, lastFilterStreak, lastFilterAssociates);
  } else {        
    filter(lastFilterTitle, lastFilterClass, null, lastFilterHardnessMin, lastFilterHardnessMax, lastFilterLuster, lastFilterChemical, lastFilterStreak, lastFilterAssociates);
  }
}

export function iStreak_change(event) {
  if (event.target.value[0]) {
    filter(lastFilterTitle, lastFilterClass, lastFilterSystem, lastFilterHardnessMin, lastFilterHardnessMax, lastFilterLuster, lastFilterChemical, event.target.value, lastFilterAssociates);
  } else {        
    filter(lastFilterTitle, lastFilterClass, lastFilterSystem, lastFilterHardnessMin, lastFilterHardnessMax, lastFilterLuster, lastFilterChemical, null, lastFilterAssociates);
  }
}

export function hardnessMinInput_change(event) {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = undefined;
  }
  debounceTimer = setTimeout(() => {
	if (event.target.value > $w('#hardnessMaxInput').value) {
		event.target.value = hardnessMinPrevValue;
	} else {
    hardnessMinPrevValue = event.target.value;
		filter(lastFilterTitle, lastFilterClass, lastFilterSystem, $w('#hardnessMinInput').value, lastFilterHardnessMax, lastFilterLuster, lastFilterChemical, lastFilterStreak, lastFilterAssociates);
	}
  }, 500);
}

export function hardnessMaxInput_change(event) {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = undefined;
  }
  debounceTimer = setTimeout(() => {
  if (event.target.value < $w('#hardnessMinInput').value) {
    event.target.value = hardnessMaxPrevValue;
  } else {
    hardnessMaxPrevValue = event.target.value; 
    filter(lastFilterTitle, lastFilterClass, lastFilterSystem, lastFilterHardnessMin,  $w('#hardnessMaxInput').value, lastFilterLuster, lastFilterChemical, lastFilterStreak, lastFilterAssociates);
  }
  }, 500);
}

export function lusterselectiontags_change(event) {
  if (event.target.value[0]) {
    filter(lastFilterTitle, lastFilterClass, lastFilterSystem, lastFilterHardnessMin,  lastFilterHardnessMax, $w('#lusterselectiontags').value, lastFilterChemical, lastFilterStreak), lastFilterAssociates;  
  } else {
    filter(lastFilterTitle, lastFilterClass, lastFilterSystem, lastFilterHardnessMin,  lastFilterHardnessMax, null, lastFilterChemical, lastFilterStreak, lastFilterAssociates);
  }
}

export function iChemicalFormula_input(event) {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = undefined;
  }
  debounceTimer = setTimeout(() => {
    let chemistry = event.target.value.split(',');
    let filteredchems = chemistry.filter(el => {
      return el != null && el != '';
    });
    let options = [];
    options.push(...filteredchems.map(region =>{
      return {'value' : region, 'label': region};
    }));
    $w('#chemicaltags').options = options;
    /*
    if (filteredchems[0]){
      $w('#chemicaltags').options = options;
    } else { 
      $w('#chemicaltags').options = [{"value" : 'null', 'label' : 'Type in a Value Above'}]; 
    }
    */
    filter(lastFilterTitle, lastFilterClass, lastFilterSystem, lastFilterHardnessMin, lastFilterHardnessMax, lastFilterLuster, filteredchems, lastFilterStreak, lastFilterAssociates);  
  }, 500);
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
    /*
    let options = [];
    options.push(...filteredassociates.map(region =>{
      return {'value' : region, 'label': region};
    }));
    $w('#associatesTag').options = options;
    */
    /*
    if (filteredchems[0]){
      $w('#chemicaltags').options = options;
    } else { 
      $w('#chemicaltags').options = [{"value" : 'null', 'label' : 'Type in a Value Above'}]; 
    }
    */
    filter(lastFilterTitle, lastFilterClass, lastFilterSystem, lastFilterHardnessMin, lastFilterHardnessMax, lastFilterLuster, lastFilterChemical, lastFilterStreak, filteredassociates);  
  }, 500);
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

function filter(title, mineralClass, crystalSystem, minHardness, maxHardness, lusters, chemistry, streak, associates) {
  if (lastFilterTitle !== title || lastFilterClass !== mineralClass || lastFilterSystem !== crystalSystem || lastFilterHardnessMin !== minHardness || lastFilterHardnessMax !== maxHardness || lastFilterLuster !== lusters || lastFilterChemical !== chemistry || lastFilterStreak !== streak || lastFilterAssociates !==associates) {
    let newFilter = wixData.filter();
    if (title)
      newFilter = newFilter.contains('title', title)
      .or(newFilter.contains("varieties", title))
      .or(newFilter.contains("varietiesArray", title));
      console.log('title');
      console.log(title);
    if (mineralClass)
      newFilter = newFilter.hasSome('mineralClass', mineralClass);
      console.log('mineralClass');
      console.log(mineralClass);
    if (crystalSystem)
      newFilter = newFilter.hasSome('crystalSystem', crystalSystem);
      console.log('crystal')
      console.log(crystalSystem)
    if (minHardness) {  
      newFilter = newFilter.ge("hardnessMin", minHardness)
      console.log(minHardness);
    }
    if (maxHardness) 
	    newFilter = newFilter.le("hardnessMax", maxHardness)   
    if (lusters)
      newFilter = newFilter.hasSome("lusters", lusters)
      console.log(lusters)
    if (streak)
    /*
      streak.forEach((field) => {
        newFilter = newFilter.or(newFilter.contains("streak", field))
        console.log(field);
      })
      */
      newFilter = newFilter.hasSome("streak", streak)
    if (chemistry) {
      /*
      if (chemistry[1]) {
        chemicalone = chemistry[1]
      } else {  
        chemicalone = chemistry[0]
      }
      if (chemistry[2]) {
        chemicaltwo = chemistry[2]
      } else {  
        chemicaltwo = chemistry[0]
      }
      if (chemistry[3]) {
        chemicalthree = chemistry[3]
      } else {  
        chemicalthree = chemistry[0]
      }
      if (chemistry[4]) {
        chemicalfour = chemistry[4]
      } else {  
        chemicalfour = chemistry[0]
      }
      newFilter = newFilter.contains("chemicalFormula", chemistry[0])
      .contains("chemicalFormula", chemicalone)
      .contains("chemicalFormula", chemicaltwo)
      .contains("chemicalFormula", chemicalthree)
      .contains("chemicalFormula", chemicalfour)
      console.log(chemistry)
      */
      chemistry.forEach((field) => {
        newFilter = newFilter.contains("chemicalFormula", field);
      })
    }
    if (associates) {
      associates.forEach((field) => {
        newFilter = newFilter.contains("associatedMinerals", field);
      })
    }
    $w('#dynamicDataset').setFilter(newFilter);
    lastFilterTitle = title; 
    lastFilterClass = mineralClass;
    lastFilterSystem = crystalSystem;
    lastFilterHardnessMin = minHardness;
    lastFilterHardnessMax = maxHardness; 
    lastFilterLuster = lusters;
    lastFilterChemical = chemistry;
    lastFilterStreak = streak;
    lastFilterAssociates = associates;
  }
}

function readParams() {
  let query = wixLocation.query
  $w('#iTitle').value = query.mineral;
  $w('#iChemicalFormula').value = query.chemistry;
  $w('#hardnessMinInput').value = Number(query.minHardness);
  $w('#hardnessMaxInput').value = Number(query.maxHardness);
  $w('#sortDropdown').value = query.sort;
  let minHard = Number(query.minHardness);
  let maxhard = Number(query.maxHardness);
  let lusterarray;
  if (query.lusters) {
    lusterarray = query.lusters.split(',');
    $w('#lusterselectiontags').value = lusterarray;
  } else {
    lusterarray = null;
  }
  if (query.crystalsystem) {
    crystalSystemArray = query.crystalsystem.split(',');
    $w('#iCrystalSystem').value = crystalSystemArray;
  } else {
    crystalSystemArray = null;
  }
  if (query.streak) {
    streakArray = query.streak.split(',');
    $w('#iStreak').value = streakArray;
  } else {
    streakArray = null;
  }
  if (query.mineralClass) {
    mineralClassArray = query.mineralClass.split(',');
    $w('#iMineralClass').value = mineralClassArray;
  } else {
    mineralClassArray = null;
  }
  if (query.chemistry) {
    let chemistry = query.chemistry.split(',');
    filteredchemsparam = chemistry.filter(el => {
      return el != null && el != '';
    });
    let options = [];
    options.push(...filteredchemsparam.map(region =>{
      return {'value' : region, 'label': region};
    }));
    $w('#chemicaltags').options = options;
  } else {
    $w('#chemicaltags').options = [];
  }
  if (query.associates) {
    let associates = query.associates.split(',');
    let filteredassociatesparam = associates.filter(el => {
      return el != null && el != '';
    });
    let options = [];
    options.push(...filteredassociatesparam.map(region =>{
      return {'value' : region, 'label': region};
    }));
    $w('#associatesTag').options = options;
    $w('#associatesInput').value = query.associates;
  } else { 
    $w('#associatesTag').options = [];
  }
  filter(query.mineral, mineralClassArray, crystalSystemArray, minHard, maxhard, lusterarray, filteredchemsparam, streakArray, filteredassociatesparam);
}

export function sortDropdown_change(event) {
	sortDataset();
}

export function filterminerals_click(event) {
	if (filterclickcount === 0) {
    filterclickcount++;
    $w('#filterBox').expand();
    //$w('#indictext').text = '-'
  } else { 
    filterclickcount = 0;
    $w('#filterBox').collapse();
    //$w('#indictext').text = '+'
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

export function clearFilters_click(event) {
	$w('TextInput').value = null;
  $w('#lusterselectiontags, #iStreak, #iMineralClass, #iCrystalSystem').value = null;
  $w('#chemicaltags').options = [];
  $w('#associatesTag').options = [];
  $w('#hardnessMaxInput').value = 10;
  $w('#hardnessMinInput').value = 1;
  filter(null, null, null, null, null, null, null, null);
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

export function associatesTag_change(event) {
	$w('#associatesInput').value = $w('#associatesTag').value.join(",");
  filter(lastFilterTitle, lastFilterClass, lastFilterSystem, lastFilterHardnessMin, lastFilterHardnessMax, lastFilterLuster, lastFilterChemical, lastFilterStreak, $w('#associatesTag').value);
}

export function beginButton_click(event) {
  $w('#questionBox').expand();
  $w('#welcomeBox').collapse(); 
}

export function findmineralButton_click(event) {
	$w('#filterBox').collapse();
  $w('#group1, #sortDropdown, #resultsRepeater, #loadMore').expand();
}