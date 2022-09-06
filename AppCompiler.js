import Editor from '/Editor.js'
import coloring from './utils/coloring.js';
import Compiler from './Compiler.js';
import { onFileTabClick, onFilePanelClick, onChangeCode, onCloseTab, onClickAnalyzer, onAddFile, onDowloadCode } from './events/index.js'

class AppCompiler {
    constructor() {
        this.editor = new Editor();
        this.compiler = new Compiler()
        this._localListeners();
        this._executeStart();
    }

    saveLocal() {
        localStorage.setItem("editor", JSON.stringify(editor.state))
    }

    tabMarkup(name, active) {
        return `
            <div class="breadcumb breadcumb--active" data-filename=${name}>
                <ion-icon name="document-outline"></ion-icon>
                    ${name}
                <ion-icon class="delete" name="close-outline"></ion-icon>
            </div>
        `
    }

    fileMarkup(file) {
        return `
            <div class="file"  data-filename=${file.name}>
                <ion-icon name="document-outline"></ion-icon>
                <p>${file.date}</p>
                <span class="subtitle">${file.name}</span>
            </div>
        `
    }

    tableMarkup(results) {
        return `
           ${results.length === 0
                ? `<div class="error">
                    <img src="./images/access.png"/>
                    <p>Al parecer, el codigo no es correcto 😥 No tengo nada para mostrar. Corrigelo</p>
                    </div>`
                : `<h3>Tabla de simbolos </h3> <br>
                <table class="GeneratedTable">
                    <thead>
                        <tr>
                            <th>Lexema</th>
                            <th>Tipo</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${results.map(result => `
                                <tr>
                                    <td>${result.token}</td>
                                    <td>${result.type}</td>
                                </tr>
                            `).join("")
                }
                    </tbody>
                </table>`
            }`;
    }

    errorTableMarkup(results) {
        return `${ results.length > 0 ? `<br>  <h3>Tabla de Errores </h3> <br>  
            <table class="GeneratedTable">
                <thead>
                    <tr>
                        <th>Token</th>
                        <th>lexema</th>
                        <th>line</th>
                        <th>description</th>

                    </tr>
                </thead>
                <tbody>
                    ${results.map(result => `
                            <tr>
                                <td>${result.token}</td>
                                <td>${result.lexema}</td>
                                <td>${result.line}</td>
                                <td>${result.message}</td>
                            </tr>
                        `).join("")
                    }
                </tbody>
            </table>` : ""}`
    }

    loadFiles() {
        const panelFiles = document.getElementById("panelfiles-container")
    }

    generateTable(results) {
        const output = document.getElementById("output-table");
        const empty = document.querySelector(".empty__container")

        empty.classList.add("hide")
        output.innerHTML = this.tableMarkup(results)
    }


    generateErrorTable(errors) {
        const output = document.getElementById("output-table");
        output.innerHTML += this.errorTableMarkup(errors)
    }

    highlightFileDirectory(pagename) {
        const fileSelected = document.querySelector(".file.selected")
        const fileTarget = document.querySelector(`.file[data-filename="${pagename}"`)

        if (fileSelected) {
            fileSelected.classList.remove("selected")
        }

        fileTarget.classList.add("selected")
    }

    insertNewPage(page) {
        const editorTabs = document.getElementById("tabs-container")
        const panelFiles = document.getElementById("panelfiles-container")
        const activeTab = document.querySelector(".breadcumb--active")

        if (activeTab)
            activeTab.classList.remove("breadcumb--active")

        editorTabs.innerHTML += this.tabMarkup(page.name)
        panelFiles.innerHTML += this.fileMarkup(page)
    }

    insertOpenPage(page) {
        const editorTabs = document.getElementById("tabs-container")
        const activeTab = document.querySelector(".breadcumb--active")
        const isActiveTab = document.querySelector(`.breadcumb[data-filename="${page.name}"]`)

        if (activeTab)
            activeTab.classList.remove("breadcumb--active")

        if (!isActiveTab) {
            editorTabs.innerHTML += this.tabMarkup(page.name, true)
        } else {
            isActiveTab.classList.add("breadcumb--active")
        }
    }

    addPage(name) {
        this.editor.createPage(name, (page) => {
            this.insertPage(page)
            this.injectCode(page.content)
        })
    }

    changePage(page) {
        this.injectCode(page.content)
    }

    openPage(filename) {
        this.editor.openPage(filename, (page) => {
            if (page !== null) {
                this.injectCode(page.content)
            }
        })
    }

    injectCode(source) {
        const backdrop = document.querySelector(".backdrop");
        const editorBody = document.getElementById("custom-area")
        const textArea = document.getElementById("codeeditor")

        textArea.value = (source)
        editorBody.innerHTML = coloring(textArea.value);

        backdrop.scrollTop = textArea.scrollTop;
    }

    _executeStart() {

        if (localStorage.getItem("notShowAgain")) return

        const tour = new Shepherd.Tour({
            useModalOverlay: true,
            defaultStepOptions: {
                classes: 'shadow-md bg-purple-dark',
                scrollTo: true
            }
        });

        tour.addStep({
            id: 'example-step',
            text: 'Añade archivos en el directorio',
            attachTo: {
                element: '.panel__directory',
                on: 'right'
            },
            classes: 'example-step-extra-class',
            buttons: [
                {
                    text: 'Siguiente',
                    action: tour.next
                }
            ]
        });

        tour.addStep({
            id: 'example-step',
            text: 'Aqui se verá el codigo',
            attachTo: {
                element: '.editor',
                on: 'right'
            },
            classes: 'example-step-extra-class',
            buttons: [
                {
                    text: 'Siguiente',
                    action: tour.next
                }
            ]
        });

        tour.addStep({
            id: 'example-step',
            text: 'Oprime el boton verificar para hacer el analisis del codigo',
            attachTo: {
                element: '.button--save',
                on: 'top'
            },
            classes: 'example-step-extra-class',
            buttons: [
                {
                    text: 'Siguiente',
                    action: tour.next
                }
            ]
        });

        tour.addStep({
            id: 'example-step',
            text: 'En esta ventana se mostraran los resultados de la evaluacion',
            attachTo: {
                element: '.panel__output',
                on: 'left'
            },
            classes: 'example-step-extra-class',
            buttons: [
                {
                    text: 'Empezar 😁',
                    action: tour.next
                },
                {
                    text: "Empezar y no volver a mostrar ✅",
                    action: (a) => {
                        localStorage.setItem("notShowAgain", "true")
                        tour.complete()
                    }
                }

            ]
        });

        tour.start()
    }

    _loadLocalData() {
        if (localStorage.getItem("editor")) {
            const localData = JSON.parse(localStorage.getItem("editor"))
        }
    }

    _localListeners() {
        const editorTabs  = document.getElementById("tabs-container")
        const panelFiles  = document.getElementById("panelfiles-container")
        const codeEditor  = document.getElementById("codeeditor")
        const buttonNew   = document.getElementById("button__new")
        const buttonCheck = document.getElementById("button-checker")
        const saveButton  = document.getElementById("save-button")

        onFileTabClick(editorTabs, this.handleFileTabClick.bind(this))
        onFilePanelClick(panelFiles, this.handleFilePanelClick.bind(this))
        onChangeCode(codeEditor, this.handleChangeCode.bind(this))
        onCloseTab(editorTabs, this.handleCloseTab.bind(this), this.injectCode)
        onClickAnalyzer(buttonCheck, this.handleClickAnalyze.bind(this), this.compiler.sematicAnalisys, this.compiler.sematicAnalisys2)
        onAddFile(buttonNew, this.handleAddFile.bind(this))
        onDowloadCode(saveButton, this.handleDownloadCode.bind(this))
    }

    handleFileTabClick(pagename) {
        this.changePage(this.editor.getFile(pagename))
        this.highlightFileDirectory(this.editor.getFile(pagename).name)
    }

    handleFilePanelClick(pagename) {
        this.openPage(pagename)
        this.insertOpenPage(this.editor.getFile(pagename))
        this.injectCode(this.editor.getFile(pagename).content)
        this.highlightFileDirectory(pagename)
    }

    handleChangeCode(pagename, source) {
        this.editor.setCode(pagename, source)
    }

    handleCloseTab(pagename) {
        this.changePage(this.editor.getFile(pagename))
        this.highlightFileDirectory(this.editor.getFile(pagename).name)
    }

    handleClickAnalyze(results, grammar) {
        this.generateTable(results)
        this.generateErrorTable(grammar)
    }

    handleAddFile(filename) {
        this.editor.createPage(filename, (file) => {
            this.insertNewPage(file)
            this.highlightFileDirectory(file.name)
            this.injectCode(file.content)
        })
    }

    handleDownloadCode()  {

    }
}

export default AppCompiler