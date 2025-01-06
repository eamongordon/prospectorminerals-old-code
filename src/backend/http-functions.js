import {
    ok,
    notFound,
    serverError,
    forbidden,
    response
} from 'wix-http-functions';
import wixData from 'wix-data';
const he = require('he');

//import { getAuth } from '@velo/google-sso-integration-backend';
import { getGoogleAuthLogin, getGoogleAuthSignup, getGoogleAuthEnable } from '@prospectorminerals/google-oauth-sso-backend';
//import { getAuth } from 'backend/googleauthtest.js';

export async function get_minerals(request) {
    let key = request.query.key;
    let name;
    let variety;
    let luster;
    let streak;
    let hardnessMin;
    let hardnessMax;
    let chemicalElements;
    let options = {
        "headers": {
            "Content-Type": "application/json"
        }
    };
    if (key) {
        name = request.query.name
        variety = request.query.varieties
        luster = request.query.luster
        streak = request.query.streak
        hardnessMin = request.query.hardnessMin
        hardnessMax = request.query.hardnessMax
        chemicalElements = request.query.chemicalElements
    } else {
        options.body = {
            "error": `'Invalid or No API Key. Please Check your request URL again'`
        };
        return forbidden(options);
    }
    let mineralQuery = wixData.query("Database");
    if (name) {
        mineralQuery = mineralQuery.contains("title", name)
    }
    if (variety) {
        mineralQuery = mineralQuery.contains("varieties", variety)
    }
    if (luster) {
        mineralQuery = mineralQuery.contains("luster", luster)
    }
    if (streak) {
        mineralQuery = mineralQuery.contains("streak", streak)
    }
    if (hardnessMin) {
        mineralQuery = mineralQuery.ge("hardnessMin", Number(hardnessMin))
    }
    if (hardnessMax) {
        mineralQuery = mineralQuery.le("hardnessMax", Number(hardnessMax))
    }
    if (chemicalElements) {
        mineralQuery = mineralQuery.contains("chemicalFormula", chemicalElements)
    }
    let memberarr = await wixData.query("MemberAPIUsage")
        .eq("title", key)
        .find({
            suppressAuth: true
        })
    //.then((results) => {
    if (memberarr.items.length > 0) {
        console.log('Key Found')
        let member = memberarr.items[0];
        let date = new Date(member.resetTime);
        // get the current time
        const now = new Date();
        // calculate the difference
        const queryTimeStamp = (member.resetTime).getTime();
        const nowTimeStamp = now.getTime();
        const microSecondsDiff = (queryTimeStamp - nowTimeStamp);
        console.log("msecs diff: " + microSecondsDiff);
        // Number of milliseconds in a day:
        //   24 hrs/day * 60 mins/hr * 60 secs/min * 1000 msecs/sec
        const daysDiff = Math.floor(microSecondsDiff / (1000 * 60 * 60 * 24));
        console.log("days diff: " + daysDiff);
        const minsDiff = Math.floor(microSecondsDiff / (1000 * 60));
        console.log("minutes diff: " + minsDiff);
        const roundedmonthsaway = Math.ceil(Math.abs(daysDiff / 30));
        console.log(roundedmonthsaway)
        let daysfr = roundedmonthsaway * 30
        if (microSecondsDiff <= 0) {
            console.log("Resetting Limit")
            member.requests = 1
            member.resetTime.setDate(member.resetTime.getDate() + daysfr);
            wixData.update("MemberAPIUsage", member, {
                suppressAuth: true
            });
            return mineralQuery
                .find()
                .then((results) => {
                    // matching items were found
                    if (results.items.length > 0) {
                        let opt = [];
                        opt.push(...results.items.map(ite => {
                            return {
                                "name": ite.title,
                                "mineralClass": ite.mineralClass,
                                "crystalSystem": ite.crystalSystem,
                                "chemicalFormula": ite.chemicalFormula,
                                "hardness": ite.hardness,
                                "hardnessMin": ite.hardnessMin,
                                "hardnessMax": ite.hardnessMax,
                                "luster": ite.luster,
                                "streak": ite.streak,
                                "description": he.decode(ite.description.replace(/(<([^>]+)>)/ig, "").replace(/(&rsquo;)/ig, "'").replace(/\r?\n/g, "")),
                                "varieties": ite.varietiesArray,
                                "image": ite.coverImage.imageFieldKey,
                                "link": 'https://www.prospectorminerals.com' + ite['link-database-title']
                            };
                        }));
                        console.log("Found")
                        options.body = opt;
                        return ok(options);
                    }
                    // no matching items found
                    options.body = {
                        "error": `'No Minerals for your query were found.`
                    };
                    return notFound(options);
                })
                // something went wrong
                .catch((error) => {
                    options.body = {
                        "error": error
                    };
                    return serverError(options);
                });
        } else {
            if (member.requests < member.limit) {
                console.log("Witihin Limit, Limit will Reset Later")
                member.requests = member.requests + 1
                wixData.update("MemberAPIUsage", member, {
                    suppressAuth: true
                });
                return mineralQuery
                    .find()
                    .then((results) => {
                        // matching items were found
                        if (results.items.length > 0) {
                            let opt = [];
                            opt.push(...results.items.map(ite => {
                                return {
                                    "name": ite.title,
                                    "mineralClass": ite.mineralClass,
                                    "crystalSystem": ite.crystalSystem,
                                    "chemicalFormula": ite.chemicalFormula,
                                    "hardness": ite.hardness,
                                    "hardnessMin": ite.hardnessMin,
                                    "hardnessMax": ite.hardnessMax,
                                    "luster": ite.luster,
                                    "streak": ite.streak,
                                    "description": he.decode(ite.description.replace(/(<([^>]+)>)/ig, "").replace(/(&rsquo;)/ig, "'").replace(/\r?\n/g, "")),
                                    "varieties": ite.varietiesArray,
                                    "image": ite.coverImage.imageFieldKey,
                                    "link": 'https://www.prospectorminerals.com' + ite['link-database-title']
                                };
                            }));
                            console.log("Found");
                            options.body = opt;
                            return ok(options);
                        }
                        // no matching items found
                        options.body = {
                            "error": `'No Minerals for your query were found.`
                        };
                        return notFound(options);
                    })
                    // something went wrong
                    .catch((error) => {
                        options.body = {
                            "error": error
                        };
                        return serverError(options);
                    });
            } else {
                console.log("Reached Limit, Limit Will Reset Later")
                console.log(roundedmonthsaway)
                let nextResetDate = new Date(member.resetTime);
                options.body = {
                    "error": `'You have reached your limit. Your limit will reset on ${nextResetDate}`
                };
                return forbidden(options);
            }
        }
    } else {
        "No Valid API Key Provided"
        options.body = {
            "error": `'Invalid or No API Key. Please Check your request URL again'`
        };
        return forbidden(options);
    }
    //});
}

export async function get_localities(request) {
    let key = request.query.key
    let name;
    let description;
    let minerals;
    let type;
    let latitude;
    let longitude;
    let options = {
        "headers": {
            "Content-Type": "application/json"
        }
    };
    if (key) {
        name = request.query.name
        description = request.query.description
        minerals = request.query.minerals
        type = request.query.type
        latitude = request.query.latitude
        longitude = request.query.longitude
    } else {
        options.body = {
            "error": `'Invalid or No API Key. Please Check your request URL again'`
        };
        return forbidden(options);
    }
    let mineralQuery = wixData.query("LocalityDatabase");
    if (name) {
        mineralQuery = mineralQuery.contains("title", name)
    }
    if (description) {
        mineralQuery = mineralQuery.contains("description", description)
    }
    if (type) {
        mineralQuery = mineralQuery.contains("type", type)
    }
    if (latitude) {
        mineralQuery = mineralQuery.contains("latitude", latitude)
    }
    if (longitude) {
        mineralQuery = mineralQuery.contains("longitude", longitude)
    }
    let memberarr = await wixData.query("MemberAPIUsage")
        .eq("title", key)
        .find({
            suppressAuth: true
        })
    //.then((results) => {
    if (memberarr.items.length > 0) {
        console.log('Key Found')
        let member = memberarr.items[0];
        let date = new Date(member.resetTime);
        // get the current time
        const now = new Date();
        // calculate the difference
        const queryTimeStamp = (member.resetTime).getTime();
        const nowTimeStamp = now.getTime();
        const microSecondsDiff = (queryTimeStamp - nowTimeStamp);
        console.log("msecs diff: " + microSecondsDiff);
        // Number of milliseconds in a day:
        //   24 hrs/day * 60 mins/hr * 60 secs/min * 1000 msecs/sec
        const daysDiff = Math.floor(microSecondsDiff / (1000 * 60 * 60 * 24));
        console.log("days diff: " + daysDiff);
        const minsDiff = Math.floor(microSecondsDiff / (1000 * 60));
        console.log("minutes diff: " + minsDiff);
        const roundedmonthsaway = Math.ceil(Math.abs(daysDiff / 30));
        console.log(roundedmonthsaway)
        let daysfr = roundedmonthsaway * 30
        if (microSecondsDiff <= 0) {
            console.log("Resetting Limit")
            member.requests = 1
            member.resetTime.setDate(member.resetTime.getDate() + daysfr);
            wixData.update("MemberAPIUsage", member, {
                suppressAuth: true
            });
            return mineralQuery
                .find()
                .then((results) => {
                    // matching items were found
                    if (results.items.length > 0) {
                        let opt = [];
                        opt.push(...results.items.map(ite => {
                            return {
                                "name": ite.title,
                                "type": ite.type,
                                "id": ite._id,
                                "latitude": ite.latitude,
                                "longitude": ite.longitude,
                                "nearestMunicipality": ite.nearestMunicipality,
                                "minerals": ite.mineralsArray,
                                "description": he.decode(ite.description.replace(/(<([^>]+)>)/ig, "").replace(/(&rsquo;)/ig, "'").replace(/\r?\n/g, "")),
                                "link": "https://www.prospectorminerals.com" + ite['link-locality-database-title']
                            };
                        }));
                        console.log("Found")
                        options.body = {
                            "items": opt
                        };
                        return ok(options);
                    }
                    // no matching items found
                    options.body = {
                        "error": `'No Localities for your parameters were found.'`
                    };
                    return notFound(options);
                })
                // something went wrong
                .catch((error) => {
                    options.body = {
                        "error": error
                    };
                    return serverError(options);
                });
        } else {
            if (member.requests < member.limit) {
                console.log("Witihin Limit, Limit will Reset Later")
                member.requests = member.requests + 1
                wixData.update("MemberAPIUsage", member, {
                    suppressAuth: true
                });
                return mineralQuery
                    .find()
                    .then((results) => {
                        // matching items were found
                        if (results.items.length > 0) {
                            let opt = [];
                            opt.push(...results.items.map(ite => {
                                /*
                      wixData.queryReferenced("LocalityDatabase", ite._id, "significantMinerals", {"order" : "asc"})
	                    .then(resref => {
                        let optmin = [];
	  	                  optmin.push(...resref.items.map(rref => {
	  		                  return rref.title;
	  	                  }));
                        console.log(optmin)
                    */
                                return {
                                    "name": ite.title,
                                    "type": ite.type,
                                    "id": ite._id,
                                    "latitude": ite.latitude,
                                    "longitude": ite.longitude,
                                    "nearestMunicipality": ite.nearestMunicipality,
                                    "minerals": ite.mineralsArray,
                                    "description": he.decode(ite.description.replace(/(<([^>]+)>)/ig, "").replace(/(&rsquo;)/ig, "'").replace(/\r?\n/g, "")),
                                    "link": "https://www.prospectorminerals.com" + ite['link-locality-database-title']
                                };
                                //});
                            }));
                            console.log("Found");
                            options.body = {
                                "items": opt
                            };
                            return ok(options);
                        }
                        // no matching items found
                        options.body = {
                            "error": `'No Localities for your parameters were found.'`
                        };
                        return notFound(options);
                    })
                    // something went wrong
                    .catch((error) => {
                        options.body = {
                            "error": error
                        };
                        return serverError(options);
                    });
            } else {
                console.log("Reached Limit, Limit Will Reset Later")
                console.log(roundedmonthsaway)
                let nextResetDate = new Date(member.resetTime);
                options.body = {
                    "error": `'You have reached your limit. Your limit will reset on ${nextResetDate}`
                };
                return forbidden(options);
            }
        }
    } else {
        "No Valid API Key Provided"
        options.body = {
            "error": `'Invalid or No API Key. Please Check your request URL again'`
        };
        return forbidden(options);
    }
    //});
}

export function get_getAuth(request) {
    let errorOptions = {
        body: {
            "error": "internal server error",
        },
        headers: {
            "Content-Type": "application/json"
        }
    }
    if (request.query.v === 'login') {
        return getGoogleAuthLogin(request)
            .catch((error) => {
                errorOptions.body.error = error.toString();
                return serverError(errorOptions);
            });
    } else if (request.query.v === 'signup') {
        return getGoogleAuthSignup(request)
            .catch((error) => {
                errorOptions.body.error = error.toString();
                return serverError(errorOptions);
            });
    } else if (request.query.v === 'enable') {
        return getGoogleAuthEnable(request)
            .catch((error) => {
                errorOptions.body.error = error.toString();
                return serverError(errorOptions);
            });        
    }
}