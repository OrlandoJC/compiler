export const onFileTabClick = function (element, handle) {
    element.addEventListener("click", (event) => {
        const target = event.target;
        const tabOpen = target.closest('.breadcumb')
        const activeTab = document.querySelector(".breadcumb--active")

        if (target.nodeName == "I") return
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
}

export const onCloseTab = (element, handler, flush) => {
    element.addEventListener("click", (e) => {
        const target = e.target;

        if (target.nodeName == "I" && target.classList.contains("fa-times")) {
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