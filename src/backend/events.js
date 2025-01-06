import wixData from 'wix-data';

export function wixMembers_onMemberCreated(event) {
    console.log('backend - member created' + event.entity._id);
    const memberId = event.entity._id;
    const favInsert = {
        "userId": memberId,
        "_id": memberId,
        "memberReference": memberId
    }
    /*
    const loginSettingsObj = {
        "_id": memberId,
        "memberIdReference": memberId
    };
    wixData.insert("LoginSettings", loginSettingsObj);
    */
    wixData.insert("FavoriteItems", favInsert, { suppressAuth: true })
        .then((res) => {
            return { status: true }
        })
        .catch((err) => {
            return { status: false, error: err };
        });
    var resetTime = new Date();
    resetTime.setDate(resetTime.getDate() + 30);
    const devInsert = {
        "title": memberId,
        "id": memberId,
        "_id": memberId,
        "limit": 500,
        "requests": 0,
        "resetTime": resetTime,
    }
    // add the item to the collection
    wixData.insert("MemberAPIUsage", devInsert, { suppressAuth: true })
        .then((res) => {
            return { status: true }
        })
        .catch((err) => {
            return { status: false, error: err };
        });
}

/*  Full event object:
 *  {
 *  "metadata": {
 *    "id": "b91e0e4e-1869-4705-ae8c-70b456b2ceed",
 *    "entityId": "583b58eb-708e-4eba-bb8d-af7f9914721b",
 *    "eventTime": "2021-12-10T15:00:29.236054Z",
 *    "triggeredByAnonymizeRequest": false
 *  },
 *  "entity": {
 *    "loginEmail": "john@example.com",
 *    "privacyStatus": "PUBLIC",
 *    "_id": "583b58eb-708e-4eba-bb8d-af7f9914721b",
 *    "_createdDate": "2021-12-10T10:44:37.000Z",
 *    "_updatedDate": "2021-12-10T10:44:36.939Z",
 *    "activityStatus": "ACTIVE",
 *    "profile": {
 *      "profilePhoto": {
 *        "_id": "a27d24_0dd318%7Emv2.jpg",
 *        "url": "http://static.wixstatic.com/media/a27d24_0dd318%7Emv2.jpg",
 *        "height": 0,
 *        "width": 0
 *      },
 *      "slug": "john40355",
 *      "coverPhoto": {
 *        "_id": "",
 *        "url": "https://example.com/myimage.jpg",
 *        "height": 0,
 *        "width": 0
 *      },
 *      "title": "Awesome title",
 *      "nickname": "John Doe"
 *    },
 *    "status": "APPROVED",
 *    "contactId": "583b58eb-708e-4eba-bb8d-af7f9914721b",
 *    "contactDetails": {
 *      "customFields": {
 *        "custom.pet-name": {
 *          "name": "Pet Name",
 *          "value": "Bob"
 *        }
 *      },
 *      "company": "Wix",
 *      "phones": [],
 *      "lastName": "Doe",
 *      "firstName": "John",
 *      "birthdate": "2000-01-01",
 *      "jobTitle": "Developer",
 *      "emails": [
 *        "john@example.com"
 *      ],
 *      "addresses": [
 *        {
 *          "city": "Jewell",
 *          "addressLine": "10 Cedarstone Drive",
 *          "_id": "156e50e8-8127-4617-a052-da66bb9a96a0",
 *          "country": "US",
 *          "postalCode": "43530",
 *          "subdivision": "US-OH"
 *        }
 *      ]
 *    }
 *  }
 *}
 */

/*****************
 backend/events.js
 *****************

 'backend/events.js' is a reserved Velo file that enables you to handle backend events.

 Many of the Velo backend modules, like 'wix-stores-backend' or 'wix-media-backend', include events that are triggered when 
 specific actions occur on your site. You can write code that runs when these actions occur.

 For example, you can write code that sends a custom email to a customer when they pay for a store order.

 Example: Use the function below to capture the event of a file being uploaded to the Media Manager:

   export function wixMediaManager_onFileUploaded(event) {
       console.log('The file "' + event.fileInfo.fileName + '" was uploaded to the Media Manager');
   }

 ---
 More about Velo Backend Events: 
 https://support.wix.com/en/article/velo-backend-events

*******************/