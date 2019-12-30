import { Html, Div, h1, t, span, hr, h3, a, href, cl, p, br } from "../Framework/renderer";
import { registerPage, initRouter } from "../Framework/router";

/**
 * The Downloads page.
 * @constructor
 */
function DownloadsPage() { }

DownloadsPage.prototype = {

    /** renders the page */
    renderPage: function () {
        new Html([
            Div(
                h1(
                    t('Downloads')
                ),
                hr(),
                h3(
                    t('SQL dump of the Database')
                ),
                p(
                    t("Note: Don't download this unless you know how to operate a SQL database."),
                    cl('orange')
                ),
                p(
                    span(
                        t('This is a direct SQL-Dump of everything that is stored here (All data related to users is removed). ')
                    ),
                    br(),
                    span(
                        t('The Northernlion Database uses PostgreSQL to store data, and the dump is created with help of the pg_dump tool.')
                    ),
                    br(),
                    span(
                        t('The dump will be recreated once an hour.')
                    )
                ),
                a(
                    t('Download SQL Dump'),
                    href('/Downloads/DownloadFile')
                )
            )
        ]);
    }
}


function registerDownloadsPage() {
    registerPage(DownloadsPage, 'Downloads', ['Downloads']);
}

export {
    DownloadsPage,
    registerDownloadsPage
}

(() => {
    registerDownloadsPage();
    initRouter();
})();

