import { AdminOverview } from "./overview";
import { AddVideo } from "./add-video";
import { VideosSaved } from "./videos-saved";
import { CreateMod } from "./create-mod";
import { Mods } from "./mods";
import { ModDeleted } from "../../Components/Admin/mod-deleted";
import { Resources } from "./resources";
import { ModPage } from "./mod";
import { ModLinkDeleted } from "./mod-link-deleted";

(() => {
    AdminOverview.RegisterPage();
    AddVideo.RegisterPage();
    VideosSaved.RegisterPage();
    CreateMod.RegisterPage();
    Mods.RegisterPage();
    ModDeleted.RegisterPage();
    Resources.RegisterPage();
    ModPage.RegisterPage();
    ModLinkDeleted.RegisterPage();
})();

