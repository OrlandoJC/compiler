const regex = [
    {
        id: "type",
        regex: /^(Ment|Gcad|Ocar)#$/,
    },
    {
        id: "integer",
        regex: /^(-)?[0-9]*22$/,
        type : "Ment#"
    },
    {
        id: "float",
        regex: /-?[0-9]*22.[0-9]+/,
        type : "Gcad#"
    },
    
    {
        id: "condition",
        regex: /^(if|then|else)22$/
    },
    {
        id: "identificator",
        regex: /\#[a-z]+\$/
    },
    {
        id: "operator_relational",
        regex: /==|<=|<|>|!=|>=|==|!=/
    },
    {
        id: "operator_asignation",
        regex: /=/
    },
    {
        id: "separator",
        regex: /\(|\)|\{|\}|\,|\;/
    }, 
    {
        id : "operator_logical",
        regex: /&&|\|\|/
    },
    {
        id : "operator_arimetical", 
        regex : /\+|\-|\*|\/|%/
    }
]

export default regex
