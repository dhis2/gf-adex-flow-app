export class UpgradeStatus extends HTMLElement {
    connectedCallback() {
        this.innerHTML = "<div id=\"upgradeStatus\"></div>";
    }
}