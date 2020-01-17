import { Html, Nav, cl, id, div, p, P, t, h3, strong, br, do_nothing, a, href, event, span } from "../../renderer";
import { navSection } from "../../../Components/Navigation/nav-section";
import { Link, RO_ITEMS, RO_BOSSES, RO_CHARACTERS, RO_ITEMSOURCES, RO_FLOORS, RO_TRANS, RO_REROLL, RO_CURSES, RO_PILLS, RO_RUNES, RO_TAROT, RO_TRINKET, RO_OC } from "../../../Pages/_link-creator";
import { getUser, signin, isAdmin, tryloadAdminPages } from "../authentication";
import { navigate } from "../../router";
import { removeClassIfExists } from "../../browser";

const authContainerId = 'nav-auth-container'
const navSectionClass = 'nav-section';

export function renderNavigation() {
    new Promise(resolve => {
        const n = nav();
        new Html([n], 'body', true, false);
        resolve();
    }).then(() => {
        // after that, try to load the logged in user
        getUser(true).then(user => {
            if (!user) {
                new Html([userNotLoggedIn()], authContainerId);
            } else {
                new Html([userLoggedIn(user)], authContainerId);
            }
            return user;
        }).then(user => {
            // if user was loaded, check if he is admin
            if (isAdmin(user)) {
                removeClassIfExists(document.getElementById('admin-link'), 'display-none');
            }
        });
    });
}

function userNotLoggedIn() {
    return P(
        cl('l'),
        a(
            t('Login / Register'),
            href('/Account/Login'),
            event('click', e => { e.preventDefault(); signin(); })
        )
    );
}

function userLoggedIn(user) {
    const userIsAdmin = isAdmin(user);

    return P(
        cl('l'),
        t('Logged in as: '),
        br(),
        span(
            cl('orange'),
            strong(t(user.profile.name))
        ),
        br(),
        a(
            t('Logout'),
            href('/Account/Logout')
        ),
        span(
            t(' | ')
        ),
        a(
            t('Account Settings'),
            href('/MyAccount')
        ),
        !userIsAdmin ? do_nothing : span(
            br(),
            a(
                t('Admin Area'),
                href('/Admin/Overview'),
                id('admin-link'),
                cl('display-none'),
                event('click', e => navigate('/Admin/Overview', e))
            )
        )
    )
}

function nav() {
    const link = new Link();

    return Nav(
        cl('w20'),
        id('nav'),
        div(
            cl(navSectionClass),
            id(authContainerId),

            p(
                cl('l'),
                t('Checking login state...')
            )
        ),
        div(
            cl(navSectionClass),
            navSection(770, link.home(), 'Front Page')
        ),
        div(
            cl(navSectionClass),

            h3(
                cl('l'),
                t('Learn more about...')
            ),
            navSection(630, link.episodes(), 'Episodes'),
            navSection(70, link.resourceOverview(RO_ITEMS), 'Collected Items'),
            navSection(140, link.resourceOverview(RO_BOSSES), 'Bossfights'),
            navSection(455, link.resourceOverview(RO_CHARACTERS), 'Played Characters'),
            navSection(420, link.resourceOverview(RO_ITEMSOURCES), 'Item Sources'),
            navSection(490, link.quotes(), 'Quotes'),
            navSection(105, link.resourceOverview(RO_FLOORS), 'Floors'),
            navSection(525, link.resourceOverview(RO_TRANS), 'Transformations'),
            navSection(385, link.resourceOverview(RO_REROLL), 'Character Rerolls'),
            navSection(560, link.resourceOverview(RO_CURSES), 'Curses'),
            navSection(175, link.resourceOverview(RO_PILLS), 'Swallowed Pills'),
            navSection(245, link.resourceOverview(RO_RUNES), 'Used Runes'),
            navSection(210, link.resourceOverview(RO_TAROT), 'Tarot Cards'),
            navSection(280, link.resourceOverview(RO_TRINKET), 'Collected Trinkets'),
            navSection(315, link.resourceOverview(RO_OC), 'Other Consumables')
        ),
        div(
            cl(navSectionClass),
            navSection(805, link.downloads(), 'Downloads')
        )
    );
}