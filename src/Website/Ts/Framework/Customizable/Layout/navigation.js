import { Render, Nav, cl, id, div, p, P, t, h3, strong, br, do_nothing } from "../../renderer";
import { navSection } from "../../../Components/Navigation/nav-section";
import { Link, RO_ITEMS, RO_BOSSES, RO_CHARACTERS, RO_ITEMSOURCES, RO_FLOORS, RO_TRANS, RO_REROLL, RO_CURSES, RO_PILLS, RO_RUNES, RO_TAROT, RO_TRINKET, RO_OC } from "../../../Pages/_link-creator";
import { getUser, signin, isAdmin, loadAdminPages } from "../authentication";
import { navigate } from "../../router";

const authContainerId = 'nav-auth-container'
const navSectionClass = 'nav-section';

export function Navigation() {

    Promise.resolve(() => {
        // render basic navigation
        new Render(nav(), 'body');
    }).then(() => {
        // after that, try to load the logged in user
        getUser().then(user => {
            if (!user) {
                new Render(userNotLoggedIn(), authContainerId);
            } else {
                new Render(userLoggedIn(user), authContainerId);
            }
            return user;
        }).then(user => {
            // if user was loaded, check if he is admin
            if (isAdmin(user)) {
                loadAdminPages().then(() => {
                    removeClassIfExists(document.getElementById('admin-link'), 'display-none');
                });
            }
        });
    });
}

function userNotLoggedIn() {
    return P(
        a(
            t('Login / Register'),
            href('/Account/Login'),
            event(e => { e.preventDefault(); signin(); })
        )
    );
}

function userLoggedIn(user) {
    const isAdmin = isAdmin(user);

    return P(
        t('Logged in as: '),
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
        !isAdmin ? do_nothing : (
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
        cl('w20'), id('nav'),
        div(
            cl(navSectionClass), id(authContainerId),
            p(
                t('Checking login state...')
            )
        ),
        div(
            cl(navSectionClass),
            navSection(770, link.Home(), 'Front Page')
        ),
        div(
            cl(navSectionClass),

            h3(
                cl('l'),
                t('Learn more about...')
            ),
            navSection(630, link.Episodes(), 'Episodes'),
            navSection(70, link.ResourceOverview(RO_ITEMS), 'Collected Items'),
            navSection(140, link.ResourceOverview(RO_BOSSES), 'Bossfights'),
            navSection(455, link.ResourceOverview(RO_CHARACTERS), 'Played Characters'),
            navSection(420, link.ResourceOverview(RO_ITEMSOURCES), 'Item Sources'),
            navSection(490, link.Quotes(), 'Quotes'),
            navSection(105, link.ResourceOverview(RO_FLOORS), 'Floors'),
            navSection(525, link.ResourceOverview(RO_TRANS), 'Transformations'),
            navSection(385, link.ResourceOverview(RO_REROLL), 'Character Rerolls'),
            navSection(560, link.ResourceOverview(RO_CURSES), 'Curses'),
            navSection(175, link.ResourceOverview(RO_PILLS), 'Swallowed Pills'),
            navSection(245, link.ResourceOverview(RO_RUNES), 'Used Runes'),
            navSection(210, link.ResourceOverview(RO_TAROT), 'Tarot Cards'),
            navSection(280, link.ResourceOverview(RO_TRINKET), 'Collected Trinkets'),
            navSection(315, link.ResourceOverview(RO_OC), 'Other Consumables')
        ),
        div(
            cl(navSectionClass),
            navSection(805, link.Downloads(), 'Downloads')
        )
    );
}