const languages = [
    {
        id: "type",
        regex: /^(Ment|GCad|Ocar)#$/
    },
    {
        id: "float",
        regex: /-?[0-9]*22.[0-9]+/
    },
    {
        id: "integer",
        regex: /^(-)?[0-9]*22$/
    },
    {
        id: "condition",
        regex: /^(if|then|else)22$/
    },
    {
        id: "identificator",
        regex: /^#[a-z]+\$$/
    }
]

export default languages