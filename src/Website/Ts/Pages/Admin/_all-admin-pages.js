import { registerAdminOverviewPage } from "./overview";
import { registerAddVideoPage } from "./add-video";
import { registerVideosSavedPage } from "./videos-saved";
import { registerCreateModPage } from "./create-mod";
import { registerModsPage } from "./mods";
import { registerDeleteModPage } from "./delete-mod";
import { registerResourcePage } from "../resource";
import { registerDeleteModLinkPage } from "./delete-mod-link";
import { registerModPage } from "./mod";
import { registerCreateModLinkPage } from "./create-mod-link";


(() => {
    registerAdminOverviewPage();
    registerAddVideoPage();
    registerVideosSavedPage();
    registerCreateModPage();
    registerModsPage();
    registerDeleteModPage();
    registerResourcePage();
    registerDeleteModLinkPage();
    registerModPage();
    registerCreateModLinkPage();

    //EditResource.RegisterPage();
    //Redirect.RegisterPage();
    //RedirectNextResource.RegisterPage();
    //CreateIsaacResource.RegisterPage();
    //DeleteResource.RegisterPage();
    //ResourceDeleted.RegisterPage();
    //SubmissionsOverview.RegisterPage();
    //EditSubmission.RegisterPage();
    //EditGameplayEvent.RegisterPage();
    //InsertGameplayEvent.RegisterPage();
    //DeleteEvent.RegisterPage();
    //DeleteSubmission.RegisterPage();
})();

