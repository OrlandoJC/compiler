import Editor from '/Editor.js'
import coloring from './utils/coloring.js';
import Compiler from './Compiler.js';
import { onFileTabClick, onFilePanelClick, onChangeCode, onCloseTab, onClickAnalyzer } from './events/index.js'

class AppCompiler {
    constructor() {
        this.editor = new Editor();
        this.compiler = new Compiler()
        this._localListeners()
    }

    tabMarkup(name, active) {
        return `
            <div class="breadcumb breadcumb--active" data-filename=${name}>
                <i class="fa fa-file-o" aria-hidden="true"></i>
                    ${name}
                 <i class="fa fa-times" aria-hidden="true"></i>
            </div>
        `
    }

    fileMarkup(file) {
        return `
            <div class="file"  data-filename=${file.name}>
                <i class="fa fa-file-o" aria-hidden="true"></i>
                <p>random date</p>
                <span class="subtitle">${file.name}</span>
            </div>
        `
    }

    tableMarkup(results) {
        return `
           ${
            results.length === 0
                ? `<div class="error">
                    <img src="./images/access.png"/>
                    <p>Al parecer, el codigo no es correcto 😥 No tengon nada para mostrar. Corrigelo</p>
                    </div>`
                : `<table class="GeneratedTable">
                    <thead>
                        <tr>
                            <th>Lexema</th>
                            <th>Tipo</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${
                            results.map(result => `
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

    generateTable(results) {
        const output = document.getElementById("output-table");
        const empty = document.querySelector(".empty__container")

        empty.classList.add("hide")
        output.innerHTML = this.tableMarkup(results)
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

        // editorBody.textContent = source

        textArea.value = (source)
        editorBody.innerHTML = coloring(textArea.value);

        backdrop.scrollTop = textArea.scrollTop;
    }

    _localListeners() {
        const editorTabs = document.getElementById("tabs-container")
        const panelFiles = document.getElementById("panelfiles-container")
        const codeEditor = document.getElementById("codeeditor")
        const buttonCheck = document.getElementById("button-checker")

        onFileTabClick(editorTabs, this.handleFileTabClick.bind(this))
        onFilePanelClick(panelFiles, this.handleFilePanelClick.bind(this))
        onChangeCode(codeEditor, this.handleChangeCode.bind(this))
        onCloseTab(editorTabs, this.handleCloseTab.bind(this), this.injectCode)
        onClickAnalyzer(buttonCheck, this.handleClickAnalyze.bind(this), this.compiler.sematicAnalisys)
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

    handleClickAnalyze(results) {
        console.log(results)
        this.generateTable(results)
    }
}

export default AppCompiler