class Editor {
    constructor() {
        this.state = {
            openPages: [
                {
                    name: "programa1.eq2",
                    date: new Date(),
                    content: "Ment# #numero$, #aux$, #res$;\nGcad# #nombre$;\n\n#numero$ = #aux$ + #res$;\n\nif22 ( #numero$ > 12322 ) {\n  #numero$ = #aux$ / #res$;\n} else22 {\n  #numero$ = #aux$ * 3;\n}\n\n\n\n\n",
                }
            ],
            pages: [
                {
                    name: "programa1.eq2",
                    date: new Date(),
                    content: "Ment# #numero$, #aux$, #res$;\nGcad# #nombre$;\n\n#numero$ = #aux$ + #res$;\n\nif22 ( #numero$ > 12322 ) {\n  #numero$ = #aux$ / #res$;\n} else22 {\n  #numero$ = #aux$ * 3;\n}\n\n\n\n\n",
                },
                {
                    name: "programa2.eq2",
                    date: new Date(),
                    content: "hola mundo",
                }
            ]
        }
    }

    createPage(name, handler) {
        const newPage = {
            name: name,
            date: new Date(),
            content: "",
            active: false
        }

        this.state.pages = [...this.state.pages.map(page), newPage]
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

        console.timeLog(this.state.openPages)
    }
}

export default Editor