import { HomeComponent } from "./home";
import { DownloadsComponent } from "./downloads";

(() => {
    document.addEventListener('DOMContentLoaded', () => {
        HomeComponent.RegisterPage();
        DownloadsComponent.RegisterPage();
    });
})();
