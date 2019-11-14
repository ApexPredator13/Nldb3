import { AdminOverviewPage } from "./overview";
import { AddVideoPage } from "./add-video";
import { VideosSavedPage } from "./videos-saved";
import { CreateModPage } from "./create-mod";
import { ModsPage } from "./mods";
import { ModDeleted } from "./mod-deleted";
import { ResourcesPage } from "./resources";
import { ModPage } from "./mod";
import { ModLinkDeletedPage } from "./mod-link-deleted";

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
})();

