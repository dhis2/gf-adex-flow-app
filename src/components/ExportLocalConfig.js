export class ExportLocalConfig extends HTMLElement {
    connectedCallback() {
        this.innerHTML = ` <h2 data-i18n="export-local-config.title"></h2>
        <p data-i18n="export-local-config.content"></p>
        <button data-i18n="export-local-config.export-btn" onclick="exportLocalConfig()" id="btn-export-local-config"></button>`
        ;
    }
}
