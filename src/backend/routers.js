import { redirect, ok, notFound, sendStatus, WixRouterSitemapEntry } from "wix-router";
import { fbLoginLogin, fbLoginSignup, enableFacebookLoginRouter } from '@prospectorminerals/facebookoauth-backend';
import { enableGoogleLoginRouter } from '@prospectorminerals/google-oauth-sso-backend';
import { loginUserEmailLink } from '@prospectorminerals/nodemailer-link-login-backend';
import wixData from 'wix-data';

export async function fblogin_Router(request) {
    //if (request.env === 'browser') {
    if (request.query.v === 'login') {
        return fbLoginLogin(request);
    } else if (request.query.v === 'signup') {
        return fbLoginSignup(request);
    } else if (request.query.v === 'enable') {
        return enableFacebookLoginRouter(request).catch((error) => {
            sendStatus("500", error);
        });
    }
    //}
}

export async function to_Router(request) {
    //if (request.env === 'backend'){
    const results = await wixData.query('ShortLinks').eq('slug', request.path[0]).find()
    if (results.items.length > 0) {
        let url = results.items[0].location;
        return redirect(url);
    } else {
        return notFound();
    }
    //}
}

export async function mineral_quiz_Router(request) {
    const name = (request.path[0]).charAt(0).toUpperCase() + request.path[0].slice(1);
    const results = await wixData.query("Database")
        .eq("title", name)
        .find()
    //.then( (results) => {
    const mineralitem = results.items[0];
    if (mineralitem) {
        const seoData = {
            title: mineralitem.title,
            description: `Test your skills with a quiz on the mineral ${mineralitem.title}.`,
            noIndex: false,
            metaTags: [{
                "og:title": mineralitem.title,
                "og:image": mineralitem.coverImage,
                content: "Minerals"
            }]
        };
        console.log(results.items[0]);
        return ok("mineral-quiz-page", results.items[0], seoData);
    } else {
        return notFound();
    }
    //}).catch( (err) => {
    return err;
    //});
}

export function mineral_quiz_SiteMap(request) {
    //const name = request.path[0];
    return wixData.query("Database")
        .find()
        .then((results) => {
            let siteMapEntries = [].push(...results.items.map(ite => {
                const data = ite
                const entry = new WixRouterSitemapEntry(ite.title);
                entry.pageName = "mineral-quiz"; // The name of the page in the Wix Editor to render
                entry.url = `/mineral-quiz/${ite.title}`; // Relative URL of the page
                entry.title = data.title; // For better SEO - Help Google
                return entry;
            }));
            return siteMapEntries;
        })
}

export function to_SiteMap(request) {
    //Add your code for this event here: 
}

export function member_portal_Router(request) {
    const seoData = {
        title: "Member Portal | Prospector Minerals",
        description: `Sign In or Create a Prospector Minerals Account.`,
        noIndex: true,
    };
    if (request.user.role === 'Member' || request.user.role === 'Admin') {
        return redirect('/account/dashboard');
    } else {
        return ok("member-portal-page", null, seoData);
    }
}

export function member_portal_SiteMap(request) {
    //Add your code for this event here: 
}

export function loginwithLink_Router(request) {
    return loginUserEmailLink(request.query.token).then((res) => {
        if (res.results.sessionToken) {
            return redirect(`https://www.prospectorminerals.com/social-login?emailToken=${res.results.sessionToken}`);
        } else {
            return notFound();
        }
    }).catch(() => {
        return notFound();
    })
}

export async function enableGoogleLogin_Router(request) {
    return enableGoogleLoginRouter(request).catch((error) => {
        sendStatus("500", error);
    });
}