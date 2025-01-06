//-------------Imports-------------//

// Import the wix-data module for working with queries.
import wixData from 'wix-data';
import wixWindow from 'wix-window';
import wixUsers from 'wix-users';

//-------------Global Variables-------------//

// Current product.
let article;
// Current user.
let user;

//-------------Page Setup-------------//

$w.onReady(async function () {
    // Get the currently displayed product.
    user = await wixUsers.currentUser
    article = await $w('#post1').getPost();
    console.log(article._id)
	if (wixUsers.currentUser.loggedIn) {
        checkFavoriteArticles();
    } else {    
        $w('#notInfavarticles').show();
    }
});

export function infavarticles_click(event, $w) {
    if (user.loggedIn) {
        removeFromfavarticles();
    }
}

export function notInfavarticles_click(event, $w) {
    if (user.loggedIn) {
        addTofavarticles();

    } else {
        wixUsers.promptLogin({"mode": "login"});
    } 
}

//-------------Wishlist Functionality-------------//

async function addTofavarticles() {
    $w('#notInfavarticles').hide('fade', {duration: 100});
    $w('#infavarticles').show('fade', {duration: 100});
    await wixData.insertReference("FavoriteItems", "article", user.id, article)
  		.then( () => {
    console.log("Reference inserted");
  	} )
  	.catch( (error) => {
    	console.log(error);
  	} );
}

async function checkFavoriteArticles() {
    if (wixUsers.currentUser.loggedIn) {
    wixData.isReferenced("FavoriteItems", "article", user.id, article)
      .then( (result) => {
    let isReferenced = result;  // true
    if (isReferenced) {
        $w('#infavarticles').show('fade', {duration: 100});
        $w('#notInfavarticles').hide('fade', {duration: 100});
    } else {  
        $w('#notInfavarticles').show('fade', {duration: 100});
        $w('#infavarticles').hide('fade', {duration: 100});
    }
    } )
    .catch( (err) => {
    let errorMsg = err;
    } );
    } else {
        $w('#notInfavarticles').show('fade', {duration: 100});
        $w('#infavarticles').hide('fade', {duration: 100})
    }
}

async function removeFromfavarticles() {
		$w('#infavarticles').hide();
		$w('#notInfavarticles').show();
        await wixData.removeReference("FavoriteItems", "article", user.id, article)
  		.then( () => {
    	console.log("Reference removed");
  		} )
  		.catch( (error) => {
    	console.log(error);
  		} );
}



export function copybutton_click(event) {
    wixWindow.copyToClipboard($w('#citationtext').text)
  .then( () => {
	  $w('#copybutton').label = 'Copy Again';
  } )
  .catch( (err) => {
    
  } );
}


const options = {
    day: "numeric",
    month: "short",
    year: "numeric"
};

export function citationButton_click(event) {
	$w('#citationbox').show();
    let now = new Date();
    $w('#citationtext').html = `<p><span style="margin-left: 40px"><cite>${article.title}</cite></span>, Prospector Minerals, ${article.publishedDate.toLocaleDateString("en-US", options)}, <a href="https://www.prospectorminerals.com${article.postPageUrl}" target="_blank">https://www.prospectorminerals.com${article.postPageUrl}</a>, Accessed ${now.toLocaleDateString("en-US", options)}</p>`
}


export function citationbox_mouseOut(event) {
	$w('#citationbox').hide();
}

export function button1_click(event) {
	$w('#citationbox').hide();
}