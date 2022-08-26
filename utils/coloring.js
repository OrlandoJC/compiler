import colorMap from "../config/colors.config.js";

function coloring(text) {
    let re = new RegExp(Object.keys(colorMap).join("|"), "gi");

    return text.replace(re, function (m) {
        let c = colorMap[m];

        if (!c) {
            let integers = new RegExp("-?[0-9]*22 ")
            let identifiers = new RegExp("\#[a-z]*[$]")
            let floats = new RegExp("-?[0-9]*22[\.][0-9]* ")

            if (integers.test(m)) {
                return `<span style="color:#e56674">${m}</span>`;
            }

            if (floats.test(m)) {
                return `<span style="color:#e4b580">${m}</span>`;
            }

            if (identifiers.test(m)) {
                return `<span style="color:#e4b580">${m}</span>`;
            }
        }

        return `<span style="color:${c}">${m}</span>`;
    });

}

export default coloring