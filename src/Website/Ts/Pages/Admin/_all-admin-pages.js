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
import { registerEditResourcePage } from "./edit-resource";
import { registerCreateIsaacResourcePage } from "./create-isaac-resource";
import { registerDeleteResourcePage } from "./delete-resource";
import { registerResourceDeletedPage } from "./resource-deleted";
import { registerSubmissionsOverviewPage } from "./submissions_overview";
import { registerEditSubmissionPage } from "./edit-submission";
import { registerEditGameplayEventPage } from "./edit-gameplay-event";
import { registerInsertGameplayEventPage } from "./insert-gameplay-event";
import { registerDeleteEventPage } from "./delete-event";
import { registerDeleteSubmissionPage } from "./delete-submission";


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
    registerEditResourcePage();
    registerCreateIsaacResourcePage();
    registerDeleteResourcePage();
    registerResourceDeletedPage();
    registerSubmissionsOverviewPage();
    registerEditSubmissionPage();
    registerEditGameplayEventPage();
    registerInsertGameplayEventPage();
    registerDeleteEventPage();
    registerDeleteSubmissionPage();
})();

