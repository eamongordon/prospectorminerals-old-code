import wixUsers from 'wix-users';
import wixData from 'wix-data';
import wixLocation from 'wix-location';
import { currentMember, authentication } from 'wix-members';
import { local } from 'wix-storage';
import { formFactor } from 'wix-window';

/*
async function getData() {
  const results = await currentMember.getMember();
  if (wixWindow.rendering.env == "backend") {
    wixWindow.warmupData.set("NameData", results.contactDetails.firstName);
    //wixWindow.warmupData.set("UserId", results._id);
  }  
  return results.contactDetails.firstName;
}
*/

//-------------Page Setup-------------//

$w.onReady(async function () {
    //const dataResults = wixWindow.warmupData.get("NameData") || await getData();
    //$w("#firstnameText").text = dataResults;
    loadMemberCard();
    loadfavfilterrepeater();
});

async function loadfavfilterrepeater() {
    await wixData.queryReferenced("FavoriteItems", wixUsers.currentUser.id, "photo")
        .then((results) => {
            $w('#loadingBox').hide('fade', { duration: 100 });
            $w('#loadingBox').collapse();
            if (results.items.length > 0) {
                results.items.length = 6;
                let options = [];
                options.push(...results.items.map(ite => {
                    return { 'type': "image", 'src': ite.image, 'title': ite.specimenName, 'description': ite.locality, 'link': ite['link-photos-title'] };
                }));
                $w('#favphotorepeater').items = options;
                /*
        $w("#favphotorepeater").expand();
        console.log(results.items);
		let opt = [];
        opt.push(...results.items.map(ite => {
           	return {
                "type": ite.image, 
				"src": ite.image,
				"description": ite.locality,
				"title": ite.specimenName,
				"link": ite['link-photos-title']
            };
        }));
        $w('#favphotorepeater').items = opt;
        */
            } else {
                $w('#favphotoBox').collapse();
                $w('#recPhotosBox').expand();
            }
        })
        .catch((err) => {
            let errorMsg = err;
        });
}

export function logoutButton_click(event) {
    //Locate Back to Home
    wixLocation.to(`/home`);
    //Log Out
    authentication.logout()
}

function logoutAndRedirect(event) {
    Promise.all([wixLocation.to('/'), authentication.logout()]);
}

async function loadMemberCardBeta() {
    const profileImg = await fetchmemberData('profileImg');
    const nickname = await fetchmemberData('nickname');
    const firstname = await fetchmemberData('firstname');
    if (profileImg) {
        $w('#profileImg, #hoverProfileImg').src = profileImg;
    }
    if (nickname) {
        $w('#nameTxt').text = nickname;
    } else {
        $w('#nameTxt').text = firstname;
    }
}

async function fetchmemberData(datatype) {
    const memberProfile = await currentMember.getMember();
    let [storedProfileImg, storedNickname, storedFirstName] = [local.getItem('storedProfileImg'), local.getItem('storedNickname'), local.getItem('storedFirstName')];
    switch (datatype) {
    case 'profileImg':
        if (storedProfileImg) {
            return storedProfileImg;
        } else {
            storedProfileImg = memberProfile.profile.profilePhoto.url;
            local.setItem("storedProfileImg", storedProfileImg);
            console.log(local.getItem('storedProfileImg'));
            return storedProfileImg;
        }
        break;
    case 'nickname':
        if (storedNickname) {
            return storedNickname;
        } else {
            storedNickname = memberProfile.profile.nickname;
            local.setItem("storedNickname", storedNickname);
            return storedNickname;
        }
        break;
    case 'firstname':
        if (storedFirstName) {
            return storedFirstName;
        } else {
            storedFirstName = memberProfile.contactDetails.firstName;
            local.setItem("storedFirstName", storedFirstName);
            return storedFirstName;
        }
        break;
    }
}

async function loadMemberCard() {
    const member = await currentMember.getMember();
    $w('#firstnameTxt').text = member.contactDetails.firstName;
    if (formFactor !== 'Mobile') {
        if (member.profile.nickname) {
            $w('#nameTxt').text = member.profile.nickname;
        } else {
            $w('#nameTxt').text = member.profile.slug;
        }
        if (member.profile.profilePhoto) {
            $w('#profileImg, #hoverProfileImg').src = member.profile.profilePhoto.url;
        }
        $w('#profilePicStateBox').onMouseIn((event) => {
            $w('#profilePicStateBox').changeState('Hover');
        });
        $w('#profilePicStateBox').onMouseOut((event) => {
            $w('#profilePicStateBox').changeState('Regular');
        });
        $w('#memberCardStatebox').changeState('card');
    }
}