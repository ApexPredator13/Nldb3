import { Component, FrameworkElement, Attribute } from "../Framework/renderer";
import { PageData, registerPage, initRouter } from "../Framework/router";

export class DownloadsComponent implements Component {
    E: FrameworkElement;

    constructor() {
        this.E = {
            e: ['div'],
            c: [
                { e: ['h1', 'Downloads'] },
                { e: ['hr'] },
                { e: ['h3', 'SQL dump of the Database'] },
                {
                    e: ['p', "Note: Don't download this unless you know how to operate a SQL database."],
                    a: [[Attribute.Class, 'orange']]
                },
                {
                    e: ['p'],
                    c: [
                        { e: ['span', 'This is a direct SQL-Dump of everything that is stored here (All data related to users is removed). '] },
                        { e: ['br'] },
                        { e: ['span', 'The Northernlion Database uses PostgreSQL to store data, and the dump is created with help of the pg_dump tool.'] },
                        { e: ['br'] },
                        { e: ['span', 'The dump will be recreated once an hour.'] }
                    ]
                },
                {
                    e: ['a', 'Download SQL Dump'],
                    a: [[Attribute.Href, '/Downloads/DownloadFile']]
                }
            ]
        }
    }

    static RegisterPage() {
        const page: PageData = {
            AppendTo: 'main-container',
            Component: DownloadsComponent,
            Title: 'Welcome to the Northernlion Database',
            Url: '/downloads'
        }

        registerPage('downloads', page);
    }
}


(() => {
    console.log('registering page downloads');
    DownloadsComponent.RegisterPage();
    initRouter();
})();

