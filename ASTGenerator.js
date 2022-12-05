const isValid = (regex, string) => regex.test(string)
const ces = (arr) => arr.filter(element => element != "")
const getMatches = (regex, line) => [...line.matchAll(regex)]; 

const ASIGNATION_NORULE_REGEX = /(\#[a-z]+\$|[a-zA-Z0-9\#\$])*\s=\s(-?[0-9]*22.[0-9]+|(-)?[0-9]*22|(\#[a-z]+\$|[a-zA-Z0-9\#\$])*)(\s(\+|\-|\*|\/|%)\s(-?[0-9]*22.[0-9]+|(-)?[0-9]*22|(\#[a-z]+\$|[a-zA-Z0-9\#\$])*))?/ //copiar este en la clase compiler
const RELATIONAL_REGEX = /(\#[a-z]+\$|[a-zA-Z0-9\#\$])*\s(==|<=|<|>|!=|>=|==|!=)\s(\#[a-z]+\$|[a-zA-Z0-9\#\$]*)/g
const LOGICAL_REGEX = /(\#[a-z]+\$|[a-zA-Z0-9\#\$])*\s(==|<=|<|>|!=|>=|==|!=)\s(\#[a-z]+\$|[a-zA-Z0-9\#\$]*)\s(\|\||\&\&)\s(\#[a-z]+\$|[a-zA-Z0-9\#\$])*\s(==|<=|<|>|!=|>=|==|!=)\s(\#[a-z]+\$|[a-zA-Z0-9\#\$]*)/g


const CONSTANT_KEYWORD_IF = "if22"
const CONSTANT_KEYWORD_ELSE = "else22"
const CONSTANT_OPERATOR_AND = "&&"
const CONSTANT_OPERATOR_OR = "||"
const CONSTANT_CHARACTER_RIGHT_BRACKET = "}"


class ASTGenerator {
    constructor(code) {
        this.code = code;
    }

    generate() {
        const ast = {
            type: 'Program',
            body: this.parseStatements(),
        };
        return ast;
    }

    parseStatements() {
        const lines = this.code.split("\n")
        
        const statements = [];

        let isInsideIf = false
        let isInsideElse = false

        let currentIfBody   = null
        let currenElseBody  = null
        let currentNodeStmt = null

        for (let line of lines) {
            const isAsignation = isValid(ASIGNATION_NORULE_REGEX, line)

            if (isAsignation) {
                const operationMatch = getMatches(new RegExp(ASIGNATION_NORULE_REGEX, "g"), line)
                const operationLine = operationMatch[0][0]
                const [asignedVariable, , first_Operand, operator, second_Operand] = operationLine.split(" ")
                let statement = null

                // es una asignacion simple
                if (second_Operand == undefined) {
                    statement = {
                        type: 'SimpleAssignment',
                        variable: asignedVariable,
                        value: first_Operand
                    }
                } else {
                    statement = {
                        type: 'ExpressionAssignment',
                        variable: asignedVariable,
                        value: {
                            type: 'BinaryExpression',
                            operator: operator,
                            left: first_Operand,
                            right: second_Operand,
                        }
                    }
                }
                //si existe un bloque if activo
                if (currentNodeStmt != null) {
                    if(isInsideIf) {
                        currentNodeStmt.body.push(statement)
                    } else {
                        if(isInsideElse) {
                            currentNodeStmt.consecuent.push(statement)
                        }
                    }
                } else {
                    statements.push(statement)
                }
            }

            if (line.startsWith(CONSTANT_KEYWORD_IF)) {
                const isLogicalAndRelational = line.match(LOGICAL_REGEX)
                const isRelational = line.match(RELATIONAL_REGEX)

                isInsideIf = true // establece que se el codigo se encuentra actualmente dentro de un if

                currentNodeStmt = {
                    type : "IfStatement",
                    condition : {},
                    body : [],
                    consecuent: []
                }

                if (isLogicalAndRelational) {
                    const logicalMatches = getMatches(RELATIONAL_REGEX, line).map(match => match[0])
                    const [ first_Relation, second_Relation ] = logicalMatches 

                    const [ fFirst_Operand, fRelational_Operand, fSecond_Operand] = first_Relation.split(/\s/)
                    const [ sFirst_Operand, sRelational_Operand, sSecond_Operand] = second_Relation.split(/\s/)

                    currentNodeStmt.condition = {
                        type : "LogicalExpression",
                        operator : /(\|\||&&)/.exec(line)[0],
                        left : {
                            type: 'RelationalExpression',
                            left: {
                                name: fFirst_Operand,
                            },
                            right: {
                                name: fSecond_Operand,
                            },
                            operator: fRelational_Operand,
                        },
                        right :  {
                            type: 'RelationalExpression',
                            left: {
                                name: sFirst_Operand,
                            },
                            right: {
                                name: sSecond_Operand,
                            },
                            operator: sRelational_Operand,
                        }
                    }
                    
                } else {
                    if (isRelational) {
                        const relacionalMatches = getMatches(RELATIONAL_REGEX, line).map(match => match[0])
                        const [ relational_Match ] = relacionalMatches
                        const [ first_Operand, relational_Operator, second_Operand] = relational_Match.split(/\s/)

                        currentNodeStmt.condition = {
                            type : "RelationalExpression",
                            operator : relational_Operator,
                            left : {
                                name : first_Operand
                            },
                            right : {
                                name : second_Operand
                            }
                        }
                    }
                }
            }

            //detecta cuando termina un if 
            if ( line.includes(CONSTANT_CHARACTER_RIGHT_BRACKET) && isInsideIf ) {
                isInsideIf = false
                //revisa si hay un else
                if (line.includes(CONSTANT_KEYWORD_ELSE)) {
                    isInsideElse = true
                    console.log("termino el bloque if pero inicia el else")
                } else  { 
                    console.log("termino el bloque if pero ya no hay un else")
                    isInsideElse = false
                    statements.push(currentNodeStmt)
                    currentNodeStmt = null
                }
            }

            if (line == CONSTANT_CHARACTER_RIGHT_BRACKET && isInsideElse) {
                isInsideElse = false; 
                statements.push(currentNodeStmt)
                currentNodeStmt = null
                console.log("termino el bloque if else")
            }
        }

        console.log(statements)
        return statements
    }
}




export default ASTGenerator