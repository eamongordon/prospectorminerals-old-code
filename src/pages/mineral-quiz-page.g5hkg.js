import wixWindow from 'wix-window';
import {list} from 'public/minerallist.js';

let debounceTimer; 
let mineral;
let scorepoints = 0;

$w.onReady(function () {
  let data = wixWindow.getRouterData();
  $w("#mineralName").text = data.title;
  $w("#description").html = data.description.slice(0, 250) + '...';
  $w("#coverImage").src = data.coverImage;
  $w('#readMore').link = data['link-database-title'];
  mineral = data;
});

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
  }, 500);
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
  }, 500);
}

export function start_click(event) {
  $w('#responseStrip, #submit, #clearFilters').expand();
}

export function submit_click(event) {
  if ($w('TextInput, RadioButtonGroup, Slider').valid){
	tallyPoints()
  .then(pointscore => {
    scorepoints = 0;
    $w('#scoreTxt').text = pointscore.toString();
    $w('#scoreBar').value = pointscore;
    $w('#resultsStrip').expand();
  })
  } else {
    //$w('TextInput, RadioButtonGroup, Slider').updateValidityIndication();
  }
}

async function tallyPoints() {
  if ($w('#crystalSystem').value === mineral.crystalSystem ){
    scorepoints++;
  }
  if (Math.abs($w('#hardness').value) - mineral.hardnessMax <= 1 && Math.abs($w('#hardness').value) - mineral.hardnessMin <= 1){
    scorepoints++;
  }
  if(mineral.luster.includes($w('#luster').value)){
    scorepoints++;
  }
  if($w('#mineralClass').value === mineral.mineralClass){
    scorepoints++;
  }
  if(mineral.chemicalFormula.includes($w('#chemicalInput').value)){
    scorepoints++;
  }
  if(mineral.associatedMinerals.includes($w('#associatesInput').value)){
    scorepoints++;
  }
  return scorepoints;
}

export function clearFilters_click(event) {
  $w('TextInput, RadioButtonGroup, Slider').value = null;
}

export function answersShow_click(event) {
	// This function was added from the Properties & Events panel. To learn more, visit http://wix.to/UcBnC-4
	// Add your code for this event here: 
}