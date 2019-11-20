import { AdminOverviewPage } from "./overview";
import { AddVideoPage } from "./add-video";
import { VideosSavedPage } from "./videos-saved";
import { CreateModPage } from "./create-mod";
import { ModsPage } from "./mods";
import { ModDeleted } from "./mod-deleted";
import { ResourcesPage } from "./resources";
import { ModPage } from "./mod";
import { ModLinkDeletedPage } from "./mod-link-deleted";
import { CreateModLinkPage } from "./create-mod-link";
import { EditResource } from "./edit-resource";
import { Redirect } from "../redirect";
import { RedirectNextResource } from "./redirect-next-resource";
import { CreateIsaacResource } from "./create-isaac-resource";
import { DeleteResource } from "./delete-resource";
import { ResourceDeleted } from "./resource-deleted";

(() => {
    AdminOverviewPage.RegisterPage();
    AddVideoPage.RegisterPage();
    VideosSavedPage.RegisterPage();
    CreateModPage.RegisterPage();
    ModsPage.RegisterPage();
    ModDeleted.RegisterPage();
    ResourcesPage.RegisterPage();
    ModPage.RegisterPage();
    ModLinkDeletedPage.RegisterPage();
    CreateModLinkPage.RegisterPage();
    EditResource.RegisterPage();
    Redirect.RegisterPage();
    RedirectNextResource.RegisterPage();
    CreateIsaacResource.RegisterPage();
    DeleteResource.RegisterPage();
    ResourceDeleted.RegisterPage();
})();

