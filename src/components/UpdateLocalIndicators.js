export class UpdateLocalIndicators extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `<h2 class=data-i18n="update-local.title"></h2>
        <p data-i18n="update-local.content"></p>
        <button id="update-gf-metadata-btn" onclick="upgradeIndicators()" data-i18n="update-metadata-btn"></button>
        <div id="upgradeStatus"></div>
        `;
    }
}