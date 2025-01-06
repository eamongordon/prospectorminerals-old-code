import wixData from "wix-data";
import wixLocation from 'wix-location';
import { list, equals } from 'public/minerallist.js';

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
let prevSelectedValue = "Hardness";
let hardnessMinPrevValue = 0;
let hardnessMaxPrevValue = 10;
let mineralResult;
let filteredchemsparam;
let crystalSystemArray;
let streakArray;
let mineralClassArray;
let filteredassociatesparam;
let currIndex = -1;
let listSize;

$w.onReady(function () {
    /*
    $w("#box1").onClick( (event, $w) => {
      let targetUrl = $w("#dynamicDataset").getCurrentItem()['link-database-title'];
      wixLocation.to(targetUrl)
    } );
    */
    if (wixLocation.query) {
        readParams();
    }
    $w('#filterselectiontags').value = [prevSelectedValue];
});

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
            filter(lastFilterTitle, lastFilterClass, lastFilterSystem, lastFilterHardnessMin, $w('#hardnessMaxInput').value, lastFilterLuster, lastFilterChemical, lastFilterStreak, lastFilterAssociates);
        }
    }, 500);
}

export function lusterselectiontags_change(event) {
    if (event.target.value[0]) {
        filter(lastFilterTitle, lastFilterClass, lastFilterSystem, lastFilterHardnessMin, lastFilterHardnessMax, $w('#lusterselectiontags').value, lastFilterChemical, lastFilterStreak, lastFilterAssociates);
    } else {
        filter(lastFilterTitle, lastFilterClass, lastFilterSystem, lastFilterHardnessMin, lastFilterHardnessMax, null, lastFilterChemical, lastFilterStreak, lastFilterAssociates);
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
        options.push(...filteredchems.map(region => {
            return { 'value': region, 'label': region };
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
        if ($w('#associatesInput').value === '' || !$w('#associatesInput').valid) {
            $w('#associatesRepeater').collapse();
        } else {
            let possiblerepeaterdata = list($w('#associatesInput').value).filter((x) => x).map(item => { return { '_id': item, 'label': item } });
            possiblerepeaterdata.push({ '_id': $w('#associatesInput').value, 'label': `"${$w('#associatesInput').value}"` });
            if (possiblerepeaterdata.length > 0) {
                $w('#associatesRepeater').expand();
                $w('#associatesRepeater').data = possiblerepeaterdata;
                updateAssociatesRepeater();
            } else {
                $w('#associatesRepeater').collapse();
            }
        }
    }, 500);
}

function updateAssociatesRepeater() {
    $w('#associatesRepeater').forEachItem(($item, itemData, index) => {
        const associatesTagMappedArr = $w('#associatesTags').options.map((obj) => obj.value)
        if (associatesTagMappedArr.includes(itemData._id)) {
            $item('#associatesButton').disable();
            $item('#associatesButton').label = "Selected";
        } else {
            $item('#associatesButton').enable();
            $item('#associatesButton').label = "Select";
        }
    });
}

export function associatesTags_change(event) {
    const filteredArray = $w('#associatesTags').options.filter(obj => obj.value !== event.target.value[0]);
    $w('#associatesTags').options = filteredArray;
    let associatesArray = $w('#associatesTags').options.map(obj => (obj.value));
    if ($w('#associatesTags').options.length === 0) {
        $w('#associatesGroup').collapse();
        let associatesTagUnshift = $w('#associatesTags').options;
        associatesTagUnshift.unshift({ "value": null, "label": "placeholder" });
        $w('#associatesTags').options = associatesTagUnshift;
        $w('#associatesInput').label = 'Enter a Mineral Species';
    }
    updateAssociatesRepeater();
    filter(lastFilterTitle, lastFilterClass, lastFilterSystem, lastFilterHardnessMin, lastFilterHardnessMax, lastFilterLuster, lastFilterChemical, lastFilterStreak, associatesArray);
}

export function associatesRepeater_itemReady($item, itemData, index) {
    $item('#associatesMineralName').text = itemData.label;
    $item("#associatesButton").onClick((event) => {
        if (!$w('#associatesTags').options[0].value) {
            let splicedArray = $w('#associatesTags').options;
            splicedArray.splice(0, 1);
            $w('#associatesTags').options = splicedArray;
        }
        addAssociate(itemData._id, itemData._id);
        let associatesArray = $w('#associatesTags').options.map(obj => (obj.value));
        filter(lastFilterTitle, lastFilterClass, lastFilterSystem, lastFilterHardnessMin, lastFilterHardnessMax, lastFilterLuster, lastFilterChemical, lastFilterStreak, associatesArray);
        $w('#associatesInput').label = 'Enter another mineral species';
    });
}

function addAssociate(itemId, itemName) {
    const newRecipent = {
        "label": `${itemName} ⓧ`,
        "value": itemId
    }
    let recipientTagsArray;
    if ($w('#associatesTags').options.length > 0 && $w('#associatesTags').options[0].value === 'delete') {
        recipientTagsArray = [];
    } else {
        recipientTagsArray = $w('#associatesTags').options;
    }
    recipientTagsArray.push(newRecipent);
    $w('#associatesTags').options = recipientTagsArray;
    $w('#associatesRepeater').collapse();
    $w('#associatesGroup').expand();
    $w('#associatesRepeater').data = list('').filter((x) => x).map(item => { return { '_id': item, 'label': item } });
    $w('#associatesInput').value = null;
}

export function associatesInput_keyPress(event) {
    listSize = $w('#associatesRepeater').data.length;
    switch (event.key) {
    case 'Enter':
        if (currIndex === -1) {
            if ($w('#associatesInput').value) {
                addAssociate($w('#associatesInput').value, $w('#associatesInput').value);
            }
            let associatesArray = $w('#associatesTags').options.map(obj => (obj.value));
            filter(lastFilterTitle, lastFilterClass, lastFilterSystem, lastFilterHardnessMin, lastFilterHardnessMax, lastFilterLuster, lastFilterChemical, lastFilterStreak, associatesArray);
            $w('#associatesInput').label = 'Enter another mineral species.';
        } else {
            addAssociate($w('#associatesRepeater').data[currIndex]._id, $w('#associatesRepeater').data[currIndex]._id);
            let associatesArray = $w('#associatesTags').options.map(obj => (obj.value));
            filter(lastFilterTitle, lastFilterClass, lastFilterSystem, lastFilterHardnessMin, lastFilterHardnessMax, lastFilterLuster, lastFilterChemical, lastFilterStreak, associatesArray);
            currIndex = -1;
            $w('#associatesInput').label = 'Enter another mineral species';
        }
        break;
    case 'ArrowUp':
        if (currIndex > 0) {
            currIndex = currIndex - 1;
            refreshItemsColors();
            $w('#associatesInput').value = $w('#associatesRepeater').data[currIndex].label;
        } else {
            currIndex = currIndex - 1;
            $w('#associatesInput').focus();
            $w('#associatesContainer').background.src = 'https://static.wixstatic.com/media/2dcc6c_676da724a30e41dfb04c3f7e6af723b9~mv2.png';
        }
        break;
    case 'ArrowDown':
        if (currIndex < listSize - 1) {
            currIndex = currIndex + 1;
            refreshItemsColors();
            $w('#associatesInput').value = $w('#associatesRepeater').data[currIndex].label;
        }
        console.log(currIndex);
        break;
    case 'Escape':
        $w('#associatesInput').value = '';
        currIndex = -1;
        $w('#associatesRepeater').collapse();
        break;
    }
}

function refreshItemsColors() {
    $w('#associatesRepeater').forEachItem(($item, itemData, index) => {
        if (index === currIndex) {
            $item('#associatesContainer').background.src = 'https://static.wixstatic.com/media/2dcc6c_0f1b39f0614e4502aadb8bfdb46a9614~mv2.png';
        } else {
            $item('#associatesContainer').background.src = 'https://static.wixstatic.com/media/2dcc6c_676da724a30e41dfb04c3f7e6af723b9~mv2.png';
        }
    });
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
    if (lastFilterTitle !== title || lastFilterClass !== mineralClass || lastFilterSystem !== crystalSystem || lastFilterHardnessMin !== minHardness || lastFilterHardnessMax !== maxHardness || lastFilterLuster !== lusters || lastFilterChemical !== chemistry || lastFilterStreak !== streak || lastFilterAssociates !== associates) {
        let newFilter = wixData.filter();
        if (title)
            newFilter = newFilter.contains('title', title)
            .or(newFilter.contains("varieties", title))
            .or(newFilter.contains("varietiesArray", title));
        if (mineralClass)
            newFilter = newFilter.hasSome('mineralClass', mineralClass);
        if (crystalSystem)
            newFilter = newFilter.hasSome('crystalSystem', crystalSystem);
        if (minHardness) {
            newFilter = newFilter.ge("hardnessMin", minHardness)
        }
        if (maxHardness)
            newFilter = newFilter.le("hardnessMax", maxHardness)
        if (lusters)
            newFilter = newFilter.hasSome("lusters", lusters);
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
        $w('#dynamicDataset').setFilter(newFilter)
            .then(() => {
                noResultsCheck();
            });
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
        options.push(...filteredchemsparam.map(region => {
            return { 'value': region, 'label': region };
        }));
        $w('#chemicaltags').options = options;
    } else {
        $w('#chemicaltags').options = [];
    }
    if (query.associates) {
        filteredassociatesparam = query.associates.split(",");
        filteredassociatesparam.forEach((item) => {
            addAssociate(item, item);
        })
        filter(query.mineral, mineralClassArray, crystalSystemArray, minHard, maxhard, lusterarray, filteredchemsparam, streakArray, filteredassociatesparam);
    }
}

export function sortDropdown_change(event) {
    sortDataset();
}

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
    $w('#noresultsTxt').hide();
    $w('TextInput').value = null;
    $w('#lusterselectiontags, #iStreak, #iMineralClass, #iCrystalSystem').value = null;
    $w('#chemicaltags').options = [];
    //$w('#associatesTag').options = [];
    $w('#hardnessMaxInput').value = 10;
    $w('#hardnessMinInput').value = 1;
    filter(null, null, null, null, null, null, null, null);
}

async function noResultsCheck() {
    let count = await $w('#dynamicDataset').getTotalCount();
    if (count > 0) {
        $w('#noresultsTxt').hide();
    } else {
        $w('#noresultsTxt').show();
    }
}

export function noresultsTxt_click(event) {
    clearFilters_click();
}