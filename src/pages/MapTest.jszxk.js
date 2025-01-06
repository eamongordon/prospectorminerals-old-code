import wixData from 'wix-data';

$w.onReady(function () {
    setTimeout(function () {
        getTrailMarkers().then((oTrails) => {
            $w("#htmlOverview").postMessage(oTrails);
            $w("#htmlOverview").show();
        });
    }, 1000);
    // Capture marker click
    $w("#htmlOverview").onMessage((event) => {
        console.log(event.data)
    });
});

export function getTrailMarkers() {
    return wixData.query("LocalityDatabase")
        .find()
        .then((res) => {
            let arrTrails = res.items.map((obj) => {
                const formattedUrl = "https://static.wixstatic.com/media/" + obj.image.replace('image://v1/', '').replace('wix:', '').substr(0, obj.image.replace('image://v1/', '').replace('wix:', '').lastIndexOf('/'));
                console.log(formattedUrl);
                return {
                    "_id": obj,
                    "marker_code": obj._id,
                    "marker_lat": obj.latitude,
                    "marker_long": obj.longitude,
                    "marker_title": obj.title,
                    "marker_type_icon": obj.type,
                    "marker_image": formattedUrl
                }
            });
            console.log(arrTrails);
            return arrTrails;
        });
}