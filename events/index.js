import coloring from "../utils/coloring.js";

export const onFileTabClick = function (element, handle) {
    element.addEventListener("click", (event) => {
        const target = event.target;
        const tabOpen = target.closest('.breadcumb')
        const activeTab = document.querySelector(".breadcumb--active")

        if (target.nodeName == "ION-ICON") return
        if (!tabOpen) return

        activeTab.classList.remove("breadcumb--active")

        if (tabOpen) {
            tabOpen.classList.add("breadcumb--active")
            handle(tabOpen.dataset.filename)
        }
    })
}

export const onFilePanelClick = function (element, handle) {
    const codeEditor = document.getElementById("codeeditor")

    element.addEventListener("click", (event) => {
        const target = event.target;
        let a = target.closest(".file")

        if (a) {
            codeEditor.disabled = false;
            handle(a.dataset.filename)
        }
    })
}

export const onChangeCode = function (element, handle) {
    const notifier = document.getElementById("notifier")
    let customArea = document.querySelector(".custom-area");
    let backdrop = document.querySelector(".backdrop");

    function debounce(func, timeout = 300) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => { func.apply(this, args); }, timeout);
        };
    }

    element.addEventListener("keyup", debounce(() => {
        const activeTab = document.querySelector(".breadcumb--active")
        const codeEditor = document.getElementById("codeeditor")

        if (!activeTab) return

        const filename = activeTab.dataset.filename

        handle(filename, codeEditor.value)

        notifier.textContent = "Cambios guardados 😁";

        setTimeout(() => {
            notifier.textContent = "";
        }, 500)
    }, 500))


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
        console.log(target.nodeName)
        if (target.nodeName == "ION-ICON" && target.classList.contains("delete")) {
            const tabSelected = target.closest(".breadcumb")

            if (tabSelected.classList.contains("breadcumb--active")) {
                element.removeChild(tabSelected)

                const openTabs = document.querySelectorAll(".breadcumb");

                if (openTabs.length >= 1) {
                    openTabs[openTabs.length - 1].classList.add("breadcumb--active")
                    handler(openTabs[openTabs.length - 1].dataset.filename)
                }
            } else {
                element.removeChild(tabSelected)
            }

            const openTabs = document.querySelectorAll(".breadcumb");

            if (openTabs.length === 0) {
                document.getElementById("codeeditor").disabled = true;
                flush("")
            }
        }
    })
}

export const onClickAnalyzer = (element, handler, analyzer) => {

    element.addEventListener("click", () => {
        const code = document.getElementById("codeeditor")

        const result = analyzer(code.value)

        handler(result)
    })
}


export const onAddFile = (element, handler) => {

    let items = document.getElementById("tabs-container")
    let editor = document.getElementById("codeeditor")

    let sortable = Sortable.create(items, {
        animation: 150,
        easing: "cubic-bezier(1, 0, 0, 1)"
    })

    element.addEventListener("click", () => {
        let filename = prompt("Ingresa el nombre del archivo");

        if (filename != null) {
            handler(filename)
            editor.disabled = false;
            setTimeout(() => {
                const tabsContainer = document.getElementById("tabs-container")
                tabsContainer.scrollTo({
                    left: tabsContainer.scrollWidth,
                    top: 0,
                    behavior: 'smooth'
                })
            }, 0)
        }
    })

}
