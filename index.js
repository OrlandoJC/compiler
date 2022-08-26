
// console.log(
//     languages[4].regex.test("#pepe$")
// )

import AppCompiler from './AppCompiler.js';
import colorMap from './config/colors.config.js'

let textArea = document.getElementById("codeeditor");
let customArea = document.querySelector(".custom-area");
let backdrop = document.querySelector(".backdrop");

// Event listeners.

textArea.addEventListener("input", function() {
    customArea.innerHTML = applyColors(textArea.value);  
});

textArea.addEventListener("scroll", function(){
    backdrop.scrollTop = textArea.scrollTop;
});


function applyColors(text)
{
    let re = new RegExp(Object.keys(colorMap).join("|"), "gi");

    // console.log(  text.replace(re, function(m)
    // {
    //     let c = colorMap[m];
      
    //     if(!c) {
    //         let integers = new RegExp("-?[0-9]*22", 'gi')
    //         let floats = new RegExp("-?[0-9]*22.[0-9]*", 'gi')
    //         let identifiers = new RegExp("\#[a-z]*\$", 'gi')
            
    //         console.log(m)
    //         if(integers.test(m)) {
    //             return `<span style="color:#e4b580">${m}</span>`;
    //         }

    //         if(floats.test(m)) {
    //             return `<span style="color:#e4b580}">${m}</span>`;
    //         }

    //         if(identifiers.test(m)) {
    //             console.log("id")
    //             return `<span style="color:#e4b580">${m}</span>`;
    //         }
    //     }

    //     return `<span style="color:${c}">${m}</span>`;
    // }))


    return text.replace(re, function(m)
    {
        let c = colorMap[m];

        if(!c) {
            let integers = new RegExp("-?[0-9]*22 ")
            let identifiers = new RegExp("\#[a-z]*[$]")
            let floats = new RegExp("-?[0-9]*22[\.][0-9]* ")
            
            if(integers.test(m)) {
                return `<span style="color:#e56674">${m}</span>`;
            }

            if(floats.test(m)) {
                return `<span style="color:#e4b580">${m}</span>`;
            }


            if(identifiers.test(m)) {
                return `<span style="color:#e4b580">${m}</span>`;
            }
        }

        return `<span style="color:${c}">${m}</span>`;
    });

}


const app = new AppCompiler();

console.log(app)
