import wixLocation from 'wix-location';

$w.onReady(() => {
  $w("#container5").onClick( (event, $w) => {
    let targetUrl = $w("#dataset1").getCurrentItem().link;
    wixLocation.to(targetUrl)
  } );
});