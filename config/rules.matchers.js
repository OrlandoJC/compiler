/*

 matcher : /\#[a-z]+\$\s=\s(-?[0-9]*22.[0-9]+|(-)?[0-9]*22|\#[a-z]+\$)(\s(\+|\-|\*)\s(-?[0-9]*22.[0-9]+|(-)?[0-9]*22|\#[a-z]+\$))?/g

*/

const rules = {
    "Gcad#": {
        asignation: {
            operands: ["Gcad#"]
        },
        operation: {
            "Gcad#": {
                next: ["Gcad#"]
            }
        }
    },
    "Ocar#": {
        asignation: {
            operands: ["Ocar#", "Ment#"]
        },
        operation: {
            "Ocar#": {
                next: ["Ocar#", "Ment#"]
            },
            "Ment#": {
                next: ["Ment#", "Ocar#"]
            }
        }
    },
    "Ment#": {
        asignation: {
            operands: ["Ment#"]
        },
        operation: {
            "Ment#": {
                next: ["Ment#"]
            }
        }
    }
}


export default rules
