import downloadTable from "../downloadPDF.js";
import coloring from "../utils/coloring.js";
import makeFileFromText, { downloadFile } from "../utils/filedownload.js";
import { timerMessage } from "../utils/timers.js";

export const onFileTabClick = function (element, handle) {
    element.addEventListener("click", (event) => {
        const target      = event.target;
        const tabOpen     = target.closest('.breadcumb')
        const activeTab   = document.querySelector(".breadcumb--active")
        const codeEditor  = document.getElementById("codeeditor")
        const lineNumbers = document.querySelector('.line-numbers')

        if (target.nodeName == "ION-ICON") return
        if (!tabOpen) return

        activeTab.classList.remove("breadcumb--active")

        if (tabOpen) {
            tabOpen.classList.add("breadcumb--active")
            handle(tabOpen.dataset.filename)
            const numberOfLines = codeEditor.value.split('\n').length
            lineNumbers.innerHTML = Array(numberOfLines)
                .fill('<p></p>')
                .join('')
        }
    })
}

export const onFilePanelClick = function (element, handle) {
    const codeEditor = document.getElementById("codeeditor")
    const lineNumbers = document.querySelector('.line-numbers')

    element.addEventListener("click", (event) => {
        const target = event.target;
        let file = target.closest(".file")

        if (file) {
            
            codeEditor.disabled = false;
            handle(file.dataset.filename)
            //add line numbers
            const numberOfLines = codeEditor.value.split('\n').length
            lineNumbers.innerHTML = Array(numberOfLines)
                .fill('<p></p>')
                .join('')
        }
    })
}

export const onChangeCode = function (element, handle) {
    const notifier = document.getElementById("notifier")
    const lineNumbers = document.querySelector('.line-numbers')
    let customArea = document.querySelector(".custom-area");
    let backdrop   = document.querySelector(".backdrop");

    function debounce(func, timeout = 300) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => { func.apply(this, args); }, timeout);
        };
    }

    element.addEventListener("keydown", debounce(() => {
        const activeTab  = document.querySelector(".breadcumb--active")
        const codeEditor = document.getElementById("codeeditor")

        if (!activeTab) return

        const filename = activeTab.dataset.filename

        handle(filename, codeEditor.value)

        timerMessage(notifier, "cambios guardados ✅", 500)
    }, 1000))

    element.addEventListener("keyup", (event) => {       
        const numberOfLines = event.target.value.split('\n').length

        lineNumbers.innerHTML = Array(numberOfLines)
          .fill('<p></p>')
          .join('')
    })


    element.addEventListener("input", function () {
        customArea.innerHTML = coloring(element.value);
    });

    element.addEventListener("scroll", function () {
        backdrop.scrollTop = element.scrollTop;
    });
}

export const onCloseTab = (element, handler, flush) => {
    element.addEventListener("click", (e) => {
        const target = e.target;
        const lineNumbers = document.querySelector('.line-numbers')
        const codeEditor = document.getElementById("codeeditor")

        if (target.nodeName == "ION-ICON" && target.classList.contains("delete")) {
            const tabSelected = target.closest(".breadcumb")

            if (tabSelected.classList.contains("breadcumb--active")) {
                element.removeChild(tabSelected)

                const openTabs = document.querySelectorAll(".breadcumb");

                if (openTabs.length >= 1) {
                    openTabs[openTabs.length - 1].classList.add("breadcumb--active")
                    handler(openTabs[openTabs.length - 1].dataset.filename)
                    const numberOfLines = codeEditor.value.split('\n').length
                    lineNumbers.innerHTML = Array(numberOfLines)
                        .fill('<p></p>')
                        .join('')
                }
            } else {
                element.removeChild(tabSelected)
            }

            const openTabs = document.querySelectorAll(".breadcumb");

            if (openTabs.length === 0) {
                document.getElementById("codeeditor").disabled = true;
                document.getElementById("codeeditor").value = "";     
                lineNumbers.innerHTML = ""           
                flush("")
            }
        }
    })
}

export const onClickAnalyzer = (element, handler, analyzer, semantic, triplo, optimize, toAssembly) => {
    element.addEventListener("click", () => {
        const code = document.getElementById("codeeditor")
        const cust = document.getElementById("custom-area")

        const result = analyzer(code.value)
        const errors = semantic(code.value, result)
        const tripTb = triplo(code.value)
        const optimized = optimize(code.value) 
        const triploOpt = triplo(optimized)
        const assemblytransformed = toAssembly(code.value)
        console.log(optimized)
        console.log(assemblytransformed)

        handler(result, errors, tripTb, triploOpt)

        const triploTable = document.getElementById(`generated_table_triplo`)
        const triploTableOpt = document.getElementById(`generated_optimized_triplo`)
        const btnGenerate = document.getElementById(`button-pdf`)
        const btnGenerateOpt = document.getElementById(`button-pdfoptimizado`)
        const btnGenerateAssembly = document.getElementById(`button-assembly`)


        btnGenerate.addEventListener("click", () => {
            downloadTable(triploTable)
        })

        btnGenerateOpt.addEventListener("click", () => {
            downloadTable(triploTableOpt)
        })

        btnGenerateAssembly.addEventListener("click", () => {
            const fileUrl = makeFileFromText(assemblytransformed.replace(/^ {14}/gm, ''))
            downloadFile(fileUrl, "codigo.asm")
        })
    })
}

export const onAddFile = (element, handler) => {
    let items = document.getElementById("tabs-container")
    let editor = document.getElementById("codeeditor")

    let sortable = Sortable.create(items, {
        animation: 150,
        easing: "cubic-bezier(1, 0, 0, 1)"
    })

    // element.addEventListener("click", () => {
    //     let filename = prompt("Ingresa el nombre del archivo");

    //     if (filename != null) {
    //         handler(filename)
    //         editor.disabled = false;
    //         setTimeout(() => {
    //             const tabsContainer = document.getElementById("tabs-container")
    //             tabsContainer.scrollTo({
    //                 left: tabsContainer.scrollWidth,
    //                 top: 0,
    //                 behavior: 'smooth'
    //             })
    //         }, 0)
    //     }
    // })

}

export const onDowloadCode = (element, handler) => {
    element.addEventListener("click", (e) => {
        const editor    = document.getElementById("codeeditor")
        const activeTab = document.querySelector(".breadcumb--active");
        
        if(editor.value == 0) return

        const fileUrl = makeFileFromText(editor.value)

        downloadFile(fileUrl, activeTab.dataset.filename)
    })
}


export const onHighLightLineErrors = () => {
    const codeeditor = document.getElementById("coeeditor");
}

