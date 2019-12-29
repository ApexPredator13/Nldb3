import { div, p, a, href, t, event, hr } from "../../Framework/renderer";
import { navigate } from "../../Framework/router";
import { AdminLink } from "../../Pages/Admin/_admin-link-creator";

function backToAdminOverview() {
    const link = new AdminLink();
    return div(
        p(
            a(
                t('← Back to Overview'),
                href(link.adminOverview()),
                event('click', e => navigate(link.adminOverview(), e))
            )
        )
    );
}


function backToMods() {
    const link = new AdminLink();
    return div(
        p(
            a(
                t('← Back to Mods'),
                href(link.mods()),
                event('click', e => navigate(link.mods(), e))
            )
        )
    );
}


function backToMod(modId) {
    const link = new AdminLink();
    return div(
        p(
            a(
                t('← Back to Mod'),
                href(link.mod(modId)),
                event('click', e => navigate(link.mod(modId), e))
            )
        )
    );
}


function backToResources(resourceType) {
    const link = new AdminLink();
    return div(
        p(
            a(
                t('← Back to Mod'),
                href(link.resourceOverview(resourceType)),
                event('click', e => navigate(link.resourceOverview(resourceType), e))
            )
        )
    );
}


function nextResource(resourceType) {
    const link = new AdminLink();
    return div(
        p(
            a(
                t('Next Resource in the list →'),
                href(link.editResource(resource.id)),
                event('click', e => {
                    e.target.innerText = 'trying to find next resource...';
                    get(`/Api/Resources/?ResourceType=${resourceType.toString(10)}`).then(resources => {
                        let loadNextResource = false;
                        for (let resource of resources) {
                            if (loadNextResource) {
                                navigate(new AdminLink().editResource(resource.id), e, undefined, true, true, true);
                                break;
                            }
                            if (resource.id === nextResourceId) {
                                loadNextResource = true;
                            }
                        }
                    })
                })
            )
        ),
    )
}



export {
    backToAdminOverview,
    backToMods,
    backToMod,
    backToResources,
    nextResource
}
