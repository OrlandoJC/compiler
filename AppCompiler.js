import Editor from './core/Editor.js'
import coloring from './utils/coloring.js';
import Compiler from './core/Compiler.js';
import { onFileTabClick, onFilePanelClick, onChangeCode, onCloseTab, onClickAnalyzer, onAddFile, onDowloadCode, onHighLightLineErrors } from './events/index.js'

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
                : `<h4 class="simbol-table">Tabla de simbolos <i class="fa fa-file-pdf-o" aria-hidden="true"></i></h4> <br>
                <div><table class="GeneratedTable">
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
                                    <td> <p ${result.type && 'style="background: #5b1cab; display:inline-block; padding:5px; border-radius:5px"'} >${result.type}</p> </td>
                                </tr>
                            `).join("")
                }
                    </tbody>
                </table>

                </div>`
            }`;
    }

    errorTableMarkup(results) {
        console.log(results)
        return `${results.length > 0 ? `<br>  <h4 class="error-table">Tabla de Errores <i class="fa fa-bug" aria-hidden="true"></i>
        </h4> <br>  
            <div><table class="GeneratedTable">
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
                                <td>${result.message} ${result.type || ""}
                                <i class="fa fa-info-circle" aria-hidden="true"></i> </td>
                            </tr>
                        `).join("")
            }
                </tbody>
            </table>
            </div>` : ""}`
    }


    //  {pos: 1, dato_obj: 'T1', dato_fuente: '#aux$', operador: '='}
    triploTableMarkup(results, title = "") {
        return `${results.length > 0 ? `<br>  
            <h4 class="triplo-table">
                tabla de triplo ${title} <i class="fa fa-list-ol" aria-hidden="true"></i>
            </h4> <br>  
            <div>
            <div id="${title == "" 
                    ? "generated_table_triplo"
                    : "generated_optimized_triplo"}"><table class="GeneratedTable">
                <thead>
                    <tr>
                        <th></th>
                        <th>Dato objeto</th>
                        <th>Dato fuente</th>
                        <th>operador</th>
                    </tr>
                </thead>
                <tbody>
                    ${results.map(result => `
                            <tr>
                                <td>${result.pos}</td>
                                <td>${result.dato_obj}</td>
                                <td>${result.dato_fuente}</td>
                                <td>${result.operador}  
                            </tr>
                        `).join("")
            }
                </tbody>
            </table>
            <div>
                <span class="button-pdf" id=button-pdf${title}>
                <ion-icon class="icon" name="download-outline"></ion-icon>
                    <span class="text">exportar como pdf</span>
                </ion-item>
            </div>
            </div>` : ""}`
    }

    generateButtonMarkup() {
        return `
            <div class="button_container">
                <span class="button-pdf button-action" id=button-assembly>
                <ion-icon class="icon" name="download-outline"></ion-icon>
                    <span class="text">descargar codigo ensamblador</span>
                </ion-item>
            </div> 
        `
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

    generateTriploTable(results, title) {
        const output = document.getElementById("output-table");
        output.innerHTML += this.triploTableMarkup(results, title)
        //attach evento to the table
    }

    generateButton() {
        const output = document.getElementById("output-table");
        output.innerHTML += this.generateButtonMarkup()
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
        tippy('.action.save', {
            content: 'descargar codigo en txt 🤖',
            animation: "fade"
        });

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
            text: 'pulsa el boton de guardar para generar un archivo txt del codigo que estas editando',
            attachTo: {
                element: '.action.save',
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


        console.log("red")


    }

    _loadLocalData() {
        if (localStorage.getItem("editor")) {
            const localData = JSON.parse(localStorage.getItem("editor"))
        }
    }

    _localListeners() {
        const editorTabs = document.getElementById("tabs-container")
        const panelFiles = document.getElementById("panelfiles-container")
        const codeEditor = document.getElementById("codeeditor")
        const buttonNew = document.getElementById("button__new")
        const buttonCheck = document.getElementById("button-checker")
        const saveButton = document.getElementById("save-button")

        onFileTabClick(editorTabs, this.handleFileTabClick.bind(this))
        onFilePanelClick(panelFiles, this.handleFilePanelClick.bind(this))
        onChangeCode(codeEditor, this.handleChangeCode.bind(this))
        onCloseTab(editorTabs, this.handleCloseTab.bind(this), this.injectCode),
        onClickAnalyzer(buttonCheck, this.handleClickAnalyze.bind(this), this.compiler.tokenTable, this.compiler.semanticAnalisis, this.compiler.tablaTriplo, this.compiler.optimize, this.compiler.generateAssembly)
        onAddFile(buttonNew, this.handleAddFile.bind(this))
        onDowloadCode(saveButton, this.handleDownloadCode.bind(this))
        onHighLightLineErrors(codeEditor, this.handleHighlighLineErrors.bind(this))
    }

    handleHighlighLineErrors() {

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

    handleClickAnalyze(results, grammar, triploTable, optimizedTriplo) {
        this.generateTable(results)
        this.generateErrorTable(grammar)
        this.generateTriploTable(triploTable, "")
        this.generateTriploTable(optimizedTriplo, "optimizado")
        this.generateButton()
    }

    handleAddFile(filename) {
        this.editor.createPage(filename, (file) => {
            this.insertNewPage(file)
            this.highlightFileDirectory(file.name)
            this.injectCode(file.content)
        })
    }

    handleDownloadCode() {

    }
}

export default AppCompiler