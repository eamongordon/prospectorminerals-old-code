import wixData from 'wix-data';
import wixLocation from 'wix-location';
import wixUsers from 'wix-users';
import { openLightbox, getCurrentGeolocation } from 'wix-window';
import { list, equals } from 'public/minerallist.js';

let { locality, region } = wixLocation.query;
if (region === 'All Regions') {
    region = ''
}
let currentCoordinates;
let currIndex = -1;
let listSize;
let lastFilterTitle;
let lastFilterRegion;
let lastFilterType;
let lastFilterMineral;
let debounceTimer;
let filterclickcount = 0;

$w.onReady(async function () {
    $w("#dynamicDataset").onReady(() => {
        if (locality || region) {
            readParams();
        } else {
            seLocations();
        }
        $w("#htmlMap").onMessage((event) => {
            if (event.data === 'ShowLegend') {
                legendButton_click();
            } else {
                console.log(event.data);
                $w('#placeholderText').collapse();
                let locprompt = event.data;
                getselectedLocalityData(locprompt);
                $w('#txtLocationClicked').text = locprompt;
            }
        });
        setTimeout(() => {
            $w('#loqadingmapgif').hide();
        }, 1);
        $w('#CoordinatesRadiusNumber, #AddressRadiusNumber, #CurrentLocationRadiusNumber').onInput(RadiusInput)
        $w('#latitudeInput, #longitudeInput').onInput(coordinateInputChange)
    });
});

function coordinateInputChange() {
    if (debounceTimer) {
        clearTimeout(debounceTimer);
        debounceTimer = undefined;
    }
    debounceTimer = setTimeout(() => {
        if ($w('#latitudeInput').valid && $w('#longitudeInput').valid) {
            currentCoordinates = { latitude: $w('#latitudeInput').value, longitude: $w('#longitudeInput').value };
            const radius = checkRadius();
            seLocations(currentCoordinates, radius);
        }
    }, 500);
}

function RadiusInput() {
    const radius = checkRadius();
    if ($w(`#${$w('#locationStatebox').currentState.id}RadiusNumber`).valid) {
        switch ($w('#locationStatebox').currentState.id) {
        case 'Coordinates':
            currentCoordinates = { latitude: $w('#latitudeInput').value, longitude: $w('#longitudeInput').value };
            seLocations(currentCoordinates, radius);
            break;
        case 'Address':
            currentCoordinates = $w('#addressInput').value.location;
            seLocations(currentCoordinates, radius);
            break;
        case 'CurrentLocation':
            seLocations(currentCoordinates, radius);
            break;
        }
        $w('#CoordinatesRadiusNumber, #AddressRadiusNumber, #CurrentLocationRadiusNumber').value = $w(`#${$w('#locationStatebox').currentState.id}RadiusNumber`).value;
    }
}

export function getLocations() {
    return $w("#dynamicDataset").getItems(0, 100)
        .then((results) => {
            return results.items; // items is an array of locations from the collection
        })
        .catch((err) => {
            let errorMsg = err;
            console.log(errorMsg);
        });
}

function seLocations(coordinates, radius) {
    getLocations().then((locations) => {
        let markers = [];
        for (let i = 0; i < locations.length; i++) {
            let loc = locations[i];
            const formattedUrl = "https://static.wixstatic.com/media/" + loc.image.replace('image://v1/', '').replace('wix:', '').substr(0, loc.image.replace('image://v1/', '').replace('wix:', '').lastIndexOf('/'));
            markers.push({
                "_id": loc,
                "marker_code": loc._id,
                "marker_lat": loc.latitude,
                "marker_long": loc.longitude,
                "marker_title": loc.title,
                "marker_type_icon": loc.type,
                "marker_image": formattedUrl,
                "marker_link": 'https://www.prospectorminerals.com' + loc['link-locality-database-title']
                //markers.push({title: loc.title, position: {lat: loc.latitude, lng: loc.longitude}, typetxt: loc.type});
            });
        }
        if (coordinates) {
            $w('#htmlMap').postMessage({ type: 'markers', markers: markers, coordinates: coordinates, radius: radius });
        } else {
            $w('#htmlMap').postMessage({ type: 'markers', markers: markers });
        }
    });
}

function getselectedLocalityData(locprompt) {
    $w('#localityImage').src = 'https://static.wixstatic.com/media/2dcc6c_0101f9d1cd794e75abf0f61e09321d1d~mv2.gif';
    filter(locprompt)
    setTimeout(() => {
        $w("#dynamicDataset").getItems(0, 1)
            .then((results) => {
                if (results.items.length > 0) {
                    let firstItem = results.items[0]; //see item below
                    $w('#localityImage').src = firstItem.image;
                    //let longText = firstItem.description
                    //let shortenedtext = longText.slice(0, 250);
                    let targetItemUrl = firstItem['link-locality-database-title'];
                    $w('#speciesText').text = firstItem.mineralsArraySearch.length + ' Species';
                    $w('#typeText').text = firstItem.typeText;
                    //$w('#text39').text = shortenedtext + ' ...'
                    $w('#infogroup').expand();
                    $w('#localityButton').link = targetItemUrl
                    $w('#localityImage').link = targetItemUrl
                    $w('#typeText, #speciesText, #txtLocationClicked').onClick(() => {
                        wixLocation.to(targetItemUrl);
                    });
                } else {}
            })
            .catch((err) => {
                let errorMsg = err;
            });
    }, 500);
}

function filter(title, region, type, minerals, favoriteid) {
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
        if (favoriteid)
            newFilter = newFilter.hasSome('FavoriteItems', favoriteid);
        lastFilterTitle = title;
        lastFilterRegion = region;
        lastFilterType = type;
        lastFilterMineral = minerals;
        return $w('#dynamicDataset').setFilter(newFilter).then(() => {
            Promise.resolve();
        }).catch((error) => {
            console.log(error);
            Promise.resolve();
            //Promise.reject(error)
        }).finally(() => {
            //Promise.resolve();
        })
    } else {
        Promise.resolve();
    }
}

export function favoritesfilterLocations() {
    return wixData.queryReferenced("FavoriteItems", wixUsers.currentUser.id, "locality")
        .then((results) => {
            return results.items;
        })
        .catch((err) => {
            let errorMsg = err;
        });
}

function readParams() {
    $w('#iTitle').value = locality;
    if (locality === 'Favorites') {
        filter(null, null, null, null, wixUsers.currentUser.id).then(() => {
            seLocations();
        })
    } else {
        if (region && region === 'All Regions') {
            filter(locality, '').then(() => {
                seLocations();
            })
        } else {
            filter(locality, region).then(() => {
                seLocations();
            })
        }
    }
}

export function associatesInput_input(event) {
    if (debounceTimer) {
        clearTimeout(debounceTimer);
        debounceTimer = undefined;
    }
    debounceTimer = setTimeout(() => {
        if ($w('#associatesInput').value === '' || !$w('#associatesInput').valid) {
            console.log('not valid');
            $w('#associatesRepeater').collapse();
        } else {
            let possiblerepeaterdata = list($w('#associatesInput').value).filter((x) => x).map(item => { return { '_id': item, 'label': item } });
            possiblerepeaterdata.push({ '_id': $w('#associatesInput').value, 'label': `"${$w('#associatesInput').value}"` })
            $w('#associatesRepeater').data = possiblerepeaterdata;
            console.log('he' + $w('#associatesRepeater').data.length);
            console.log($w('#associatesRepeater').isVisible);
            $w('#associatesRepeater').expand();
        }
    }, 500);
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
    const radius = checkRadius();
    filter(lastFilterTitle, lastFilterRegion, lastFilterType, associatesArray).then(() => {
        seLocations(currentCoordinates, radius);
    });
}

export function associatesRepeater_itemReady($item, itemData, index) {
    $item('#associatesMineralName').text = itemData.label;
    $item("#associatesContainer").onClick((event) => {
        if (!$w('#associatesTags').options[0].value) {
            let splicedArray = $w('#associatesTags').options;
            splicedArray.splice(0, 1);
            $w('#associatesTags').options = splicedArray;
        }
        addAssociate(itemData._id, itemData._id);
        let associatesArray = $w('#associatesTags').options.map(obj => (obj.value));
        const radius = checkRadius();
        filter(lastFilterTitle, lastFilterRegion, lastFilterType, associatesArray).then(() => {
            seLocations(currentCoordinates, radius);
        });
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
    const radius = checkRadius();
    switch (event.key) {
    case 'Enter':
        if (currIndex === -1) {
            if ($w('#associatesInput').value) {
                addAssociate($w('#associatesInput').value, $w('#associatesInput').value);
            }
            let associatesArray = $w('#associatesTags').options.map(obj => (obj.value));
            filter(lastFilterTitle, lastFilterRegion, lastFilterType, associatesArray).then(() => {
                seLocations(currentCoordinates, radius);
            });
            $w('#associatesInput').label = 'Enter another mineral species.';
        } else {
            addAssociate($w('#associatesRepeater').data[currIndex]._id, $w('#associatesRepeater').data[currIndex]._id);
            let associatesArray = $w('#associatesTags').options.map(obj => (obj.value));
            filter(lastFilterTitle, lastFilterRegion, lastFilterType, associatesArray).then(() => {
                seLocations(currentCoordinates, radius);
            })
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

export function iTitle_input(event) {
    if (debounceTimer) {
        clearTimeout(debounceTimer);
        debounceTimer = undefined;
    }
    debounceTimer = setTimeout(() => {
        const radius = checkRadius();
        filter(event.target.value, lastFilterRegion, lastFilterType, lastFilterMineral).then(() => {
            console.log(currentCoordinates);
            seLocations(currentCoordinates, radius);
        })
    }, 500);
}

export function regionselectiontags_change(event) {
    const radius = checkRadius();
    if (event.target.value[0]) {
        filter(lastFilterTitle, event.target.value, lastFilterType, lastFilterMineral).then(() => {
            seLocations(currentCoordinates, radius);
        })
    } else {
        filter(lastFilterTitle, null, lastFilterType, lastFilterMineral).then(() => {
            seLocations(currentCoordinates, radius);
        })
    }
}

export function typeselectionTags_change(event) {
    const radius = checkRadius();
    if (event.target.value[0]) {
        filter(lastFilterTitle, lastFilterRegion, event.target.value, lastFilterMineral).then(() => {
            seLocations(currentCoordinates, radius);
        })
    } else {
        filter(lastFilterTitle, lastFilterRegion, null, lastFilterMineral).then(() => {
            seLocations(currentCoordinates, radius);
        })
    }
}

export function clearFilters_click(event) {
    $w('#iTitle, #addressInput, #latitudeInput, #longitudeInput, #associatesInput').value = null;
    //$w('#noresultsTxt').hide();
    $w('#associatesTags, #typeselectionTags, #regionselectiontags').value = null;
    const radius = checkRadius();
    currentCoordinates = undefined;
    filter(null, null, null, null).then(() => {
        seLocations(currentCoordinates, radius);
    })
}

export function legendButton_click(event) {
    openLightbox("Help Lightbox", {
        "topicId": "2ffccb95-ff52-45ad-954c-a8a0c8afc820",
    });
}

export function addressInput_change(event) {
    if (debounceTimer) {
        clearTimeout(debounceTimer);
        debounceTimer = undefined;
    }
    debounceTimer = setTimeout(() => {
        console.log(event.target.value.location);
        const radius = checkRadius();
        seLocations(event.target.value.location, radius);
        //$w('#htmlMap').postMessage({ type: 'coordinates', coordinates: event.target.value.location});
    }, 500);
}

function checkRadius() {
    if ($w(`#${$w('#locationStatebox').currentState.id}RadiusDropdown`).value === 'miles') {
        return $w(`#${$w('#locationStatebox').currentState.id}RadiusNumber`).value * 1609.344;
    } else {
        return $w(`#${$w('#locationStatebox').currentState.id}RadiusNumber`).value * 1000;
    }
}

export function locationAddress_click(event) {
    $w('#locationAddress').disable();
    $w('#locationCurrrent, #locationCoordinates').enable();
    $w('#locationStatebox').changeState('Address');
}

export function locationCurrent_click(event) {
    getCurrentGeolocation()
        .then((obj) => {
            $w('#locationStatebox').changeState('CurrentLocation');
            $w('#locationCurrent').disable();
            $w('#locationAddress, #locationCoordinates').enable();
            currentCoordinates = obj.coords;
            seLocations(obj.coords);
        }).catch(() => {
            $w('#locationCurrent').enable();
            $w('#locationCurrent').label = "Location Denied by Browser";
        })
}

export function locationCoordinates_click(event) {
    $w('#locationStatebox').changeState('Coordinates');
    $w('#locationCoordinates').disable();
    $w('#locationAddress, #locationCurrent').enable();
}

export function swapCoordinates_click(event) {
    const oldLatitude = $w('#latitudeInput').value;
    const oldLongitude = $w('#longitudeInput').value;
    $w('#longitudeInput').value = oldLatitude;
    $w('#latitudeInput').value = oldLongitude;
    coordinateInputChange();
}