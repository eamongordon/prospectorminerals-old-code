import wixLocation from 'wix-location';
import wixData from 'wix-data';

$w.onReady(() => {
});

export function msearchButton_click(event) {
  mineralSearchResults();
}

export function msInput_keyPress(event) {
  if(event.key === 'Enter'){
    msearchButton_click();
  }
}

function mineralSearchResults(){
  let targetInput = $w('#msInput').value.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
  wixData.query("LocalityDatabase")
    .eq("title", targetInput)
    .find()
    .then( (results) => {
      if(results.items.length > 0) {
        let resultMineral = results.items[0];
        wixLocation.to(resultMineral['link-locality-database-title'])
      }
      else {
        if($w('#resDropdown').value === ''){
          wixLocation.to(`/locality-database/?locality=${$w('#msInput').value}&region=${$w('#iRegion').value}`);
        } else {
          wixLocation.to(`/locality-${$w('#resDropdown').value}/?locality=${$w('#msInput').value}&region=${$w('#iRegion').value}`);
        }
      }
    })
};    