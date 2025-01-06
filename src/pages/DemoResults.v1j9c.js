import wixSearch from 'wix-search';

$w.onReady(function () {

    // Write your Javascript code here using the Velo framework API

    // Print hello world:
    // console.log("Hello world!");

    // Call functions on page elements, e.g.:
    // $w("#button1").label = "Click me!";

    // Click "Run", or Preview your site, to execute your code

});

export async function runSearch_click(event) {
    let result = await wixSearch.search().documentType("Site/Pages").find();
	let allResults = result.documents;
    while (result.hasNext()) {
        result = await result.next();
        allResults = allResults.concat(result.documents);
    }
    console.log(allResults);
	console.log(result.totalCount);
}