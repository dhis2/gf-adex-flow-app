export class NavigationStrip extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <div class="navigationStrip">
            <button class="tab active" onclick="showIntroduction()">Introduction</button>
            <button class="tab" onclick="showImportMetadataPackage()">Import</button>
            <button class="tab" onclick="showValidationReport()" >Validate</button>
            <button class="tab" onclick="showUpdateIndicatorsWorkflow()">Update</button>
            <button class="tab" onclick="showExportConfigWorkflow()">Export</button>
            <button class="tab" onclick="showUpdateImplType()">Implementer Type</button>
       </div>`;

        //Add a callback on each button to change the active class
        let tabs = document.getElementsByClassName("tab");
        for (let i = 0; i < tabs.length; i++) {
            tabs[i].addEventListener("click", function () {
                let current = document.getElementsByClassName("active");
                current[0].className = current[0].className.replace(" active", "");
                this.className += " active";
            });
        }
    }
}

