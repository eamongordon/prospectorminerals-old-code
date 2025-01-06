// Filename: public/minerallist.js

// Code written in public files is shared by your site's
// Backend, page code, and site code environments.

// Use public files to hold utility functions that can
// be called from multiple locations in your site's code.
let minerals = ['Adamite', 'Apophyllite', 'Aragonite', 'Aurichalcite', 'Azurite',
'Barite', 'Beryl', 'Calcite', 'Cerussite', 'Chalcanthite', 'Chrysocolla', 'Conichalcite',
'Corundum', 'Crocoite', 'Cuprite', 'Dioptase', 'Feldspar', 'Fluorite', 'Galena', 'Garnet', 'Gypsum',
'Hemimorphite', 'Hubnerite', 'Kinoite', 'Krohnkite', 'Kutnohorite', 'Linarite', 'Malachite', 'Mica',
'Pyrite', 'Pyromorphite', 'Quartz', 'Rhodochrosite', 'Roselite', 'Salammoniac', 'Smithsonite', 
'Spodumene', 'Sulfur', 'Tourmaline', 'Tremolite', 'Vanadinite', 'Wulfenite'];

export function list(input) {
    const filteredmineralData = minerals.filter((str) => str.toLowerCase().includes(input.toLowerCase()));
    filteredmineralData.length = 3;
	return filteredmineralData;
}

export function equals(input) {
    const filteredmineralData = minerals.filter((str) => str.toLowerCase() === input.toLowerCase());
    filteredmineralData.length = 3;
	return filteredmineralData;
}

let removalPhrases = ['from', 'photos', 'mineral', 'locality', 'localities', 'and', 'glossary'];

export function removePhrases(input) {
    const lowercaseInput = input.map(element => {
        return element.toLowerCase();
    });
    let cleanedArray = lowercaseInput.filter(item => !removalPhrases.includes(item));
    return cleanedArray;
}

// The following code demonstrates how to call the add
// function from your site's page code or site code.
/*
import {add} from 'public/minerallist.js'
$w.onReady(function () {
    let sum = add(6,7);
    console.log(sum);
});
*/

//The following code demonstrates how to call the add
//function in one of your site's backend files.
/*
import {add} from 'public/minerallist.js'
export function usingFunctionFromPublic(a, b) {
	return add(a,b);
}
*/