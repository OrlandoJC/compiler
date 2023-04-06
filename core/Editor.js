class Editor {
    constructor() {
        this.state = {
            openPages: [
                {
                    name: "sample.eq2",
                    date: new Date(),
                    content: "Ment# #numero$ , #aux$ , #res$ ;\nGcad# #nombre$ ;\n\n#numero$ = #aux$ + #res$ ;\n\nif22 ( #numero$ > 12322 ) {\n  #numero$ = #aux$ / #random$ ;\n} else22 {\n  #numero$ = #aux$ * #hl$ ;\n}",
                }
            ],
            pages: [
                {
                    name: "sample.eq2",
                    date: new Date(),
                    content: "Ment# #numero$ , #aux$ , #res$ ;\nGcad# #nombre$ ;\n\n#numero$ = #aux$ + #res$ ;\n\nif22 ( #numero$ > 12322 ) {\n  #numero$ = #aux$ / #random$ ;\n} else22 {\n  #numero$ = #aux$ * #h$ ;\n}",
                },
                {
                    name: "sample_empty.eq2",
                    date: new Date(),
                    content: "hola mundo",
                }
            ]
        }
    }

    createPage(name, handler) {
        const newPage = {
            name: name + ".eq2",
            date: moment().calendar(),
            content: "",
            active: false
        }

        this.state.pages = [...this.state.pages, newPage]
        handler(newPage)
    }

    openPage(pagename, handler) {
        const isActive = this.state.openPages.some(page => pagename === page.name)

        if (!isActive) {
            const page = this.state.pages.find(page => pagename === page.name)
            this.state.openPages = [...this.state.openPages, page]
            handler(page)
        } else {
            handler(null)
        }
    }

    getFile(filename) {
        return this.state.openPages.find(file => file.name == filename)
    }

    setCode(filename, source) {
        this.state.openPages = this.state.openPages.map(file => (
            filename === file.name
                ? { ...file, content: source }
                : file
        ))
    }

}

export default Editor