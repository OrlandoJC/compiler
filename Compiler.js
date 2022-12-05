import { cleanSpaces } from "./utils/arrays.js";
import { getMatches, isValid, stringLines } from "./utils/strings.js";
import { TYPE_ERROR, VAR_ERROR } from "./config/error.constants.js";
import regex from './config/type.matchers.js'
import rules from "./config/rules.matchers.js";
import CompilerError from "./CompilerError.js";
import ASTGenerator from "./ASTGenerator.js";
import ObjectCode from "./ObjectCode.js";
const ASIGNATION_REGEX = /\#[a-z]+\$\s=\s(-?[0-9]*22.[0-9]+|(-)?[0-9]*22|\#[a-z]+\$)(\s(\+|\-|\*|\/)\s(-?[0-9]*22.[0-9]+|(-)?[0-9]*22|\#[a-z]+\$))?/;
const OPERATION_REGEX = /\#[a-z]+\$\s=\s(-?[0-9]*22.[0-9]+|(-)?[0-9]*22|\#[a-z]+\$)(\s(\+|\*|\-|\/)\s(-?[0-9]*22.[0-9]+|(-)?[0-9]*22|\#[a-z]+\$))?/g;
const ASIGNATION_NORULE_REGEX = /(\#[a-z]+\$|[a-zA-Z0-9\#\$])*\s=\s(-?[0-9]*22.[0-9]+|(-)?[0-9]*22|(\#[a-z]+\$|[a-zA-Z0-9\#\$])*)(\s(\+|\-|\*|\/)\s(-?[0-9]*22.[0-9]+|(-)?[0-9]*22|(\#[a-z]+\$|[a-zA-Z0-9\#\$])*))?/
const RELATIONAL_REGEX = /(\#[a-z]+\$|[a-zA-Z0-9\#\$])*\s(==|<=|<|>|!=|>=|==|!=)\s(\#[a-z]+\$|[a-zA-Z0-9\#\$]*)/g
const LOGICAL_REGEX = /(\#[a-z]+\$|[a-zA-Z0-9\#\$])*\s(==|<=|<|>|!=|>=|==|!=)\s(\#[a-z]+\$|[a-zA-Z0-9\#\$]*)\s(\|\||\&\&)\s(\#[a-z]+\$|[a-zA-Z0-9\#\$])*\s(==|<=|<|>|!=|>=|==|!=)\s(\#[a-z]+\$|[a-zA-Z0-9\#\$]*)/g

const CONSTANT_KEYWORD_IF = "if22"
const CONSTANT_KEYWORD_ELSE = "else22"
const CONSTANT_OPERATOR_AND = "&&"
const CONSTANT_OPERATOR_OR = "||"
const CONSTANT_CHARACTER_RIGHT_BRACKET = "}"

class Compiler {
    constructor() {
        this.simbolTable = []
    }

    tokenTable(string) {
        let table = [];
        let lines = cleanSpaces(string.split("\n"))

        //recorre cada linea del editor de codigo
        for (let line of lines) {
            const isVariable = isValid(/^(Ment|Gcad|Ocar)#/, line) // verifica si es una declaracion de variables
            const tokens = cleanSpaces(line.split(" ")) //borra espacios vacios
            let typeid = null; //tendra un valor del tipo de datos si es un declaracion

            // verificacion especial en caso de que los tokens de la linea esten dentro de una declaracion de tipo
            if (isVariable) {
                let type = tokens[0];
                //asigna el typeid dependiendo de la variable declada
                if (type === "Ment#") typeid = "Ment#"
                if (type === "Gcad#") typeid = "Gcad#"
                if (type === "Ocar#") typeid = "Ocar#"
            }

            // itera sobre todos los tokens de la linea
            for (let token in tokens) {
                let match = regex.find(matchers => isValid(matchers.regex, tokens[token])) // encuentra la expresion regular que hace match con el token
                let exists = table.some(tokenTable => tokenTable.token == tokens[token]) // verifica si el token existe en la tabla

                // si el token no existe en la tabla y hay un nuevo match, se añade a la tabla
                if (match && !exists) {
                    table.push({ //añade el elemento al resultado
                        ...match,
                        token: tokens[token],
                        type: (match.id == "identificator"
                            && isVariable
                            ? typeid
                            : match.type || "")
                    })
                }
            }
        }

        return table
    }


    semanticAnalisis(string, table) {
        let lines = string.split("\n")
        let lineNumber = 0;
        let errors = []

        //recorre cada linea del editor
        for (let line of lines) {
            const isAsignation = isValid(ASIGNATION_REGEX, line)

            //incremente en uno el contador de lineas; util en el caso de que se requiera saber la posicion del error.
            lineNumber += 1;

            // solo se hacen comprobaciones en lineas que no esten en blanco
            if (line.length > 0) {
                // se ejecuta en caso de sea una asignacion
                if (isAsignation) {
                    const operationMatch = getMatches(OPERATION_REGEX, line) // obtiene todas las ocurrencias de las formaciones validas de expresion ( a = b o a = b op c)
                    const operationLine = operationMatch[0][0]

                    //extrae todos los elementos de la expresion : to = variable asignada, fOp = primer, operando, opa = operador, sOp = segundo operador
                    const [to, , fOp, opa, sOp] = operationLine.split(" ")

                    // si no existe un operador, entonces es una asignacion
                    if (!opa) {
                        // extrae los tipos de datos de los operandos
                        const toType = table.find(token => token.token === to)?.type
                        const fOpType = table.find(token => token.token === fOp)?.type

                        // si el tipo de dato no se encuentra en la tabla de simbolos, significa que la variable no fue declarada
                        if (!toType) { errors.push(new CompilerError(VAR_ERROR, "variable indefinida", lineNumber, to)); continue }
                        if (!fOpType) { errors.push(new CompilerError(VAR_ERROR, "variable indefinida", lineNumber, fOp)); continue }

                        // si la regla de operacion no se encuentra, salta la operacion
                        if (!rules[toType]) continue

                        //verifica que el operando asignado sea del tipo de tipo correcto
                        if (!rules[toType].asignation.operands.includes(fOpType)) {
                            errors.push(new CompilerError(TYPE_ERROR, "incompatibilidad de tipos", lineNumber, fOp, toType))
                        }
                    } else { // se trata de una operacion
                        // extrae los tipos de datos de los operandos
                        const toType = table.find(token => token.token === to)?.type
                        const fOpType = table.find(token => token.token === fOp)?.type
                        const sOpType = table.find(token => token.token === sOp)?.type

                        // si el tipo de dato no se encuentra en la tabla de simbolos, significa que la variable no fue declarada
                        if (!toType) { errors.push(new CompilerError(VAR_ERROR, "variable indefinida", lineNumber, to)); continue }
                        if (!fOpType) { errors.push(new CompilerError(VAR_ERROR, "variable indefinida", lineNumber, fOp)); continue }
                        if (!sOpType) { errors.push(new CompilerError(VAR_ERROR, "variable indefinida", lineNumber, sOp)); continue }

                        // si la regla de operacion no se encuentra, salta la operacion
                        if (!rules[toType]) continue

                        //comprueba que exista la operacion del tipo de dato actual  para el operando  : a = b* opa c
                        if (rules[toType].operation[fOpType]) {
                            //comprueba que exista la operacion del tipo de dato actual  para el operando  : a = b opa c* 
                            if (!rules[toType].operation[fOpType].next.includes(sOpType)) {
                                // si no existe, lanza un error de tipo c : error
                                errors.push(new CompilerError(TYPE_ERROR, "incompatibilidad de tipos", lineNumber, sOp, toType))
                            }
                        } else {
                            //si no existe, lanza un error de tipo b error
                            errors.push(new CompilerError(TYPE_ERROR, "incompatibilidad de tipos", lineNumber, fOp, toType))
                        }
                    }
                }
            }
        }

        return errors
    }


    tablaTriplo(string) {
        let isInsideIf = false
        let isInsideElse = false
        let lineCounter = 1
        let triploTable = []

        let lines = cleanSpaces(string.split("\n"))

        //recorre cada linea del editor de codigo
        for (let line of lines) {
            //comprueba que la linea tenga una asignacion valida
            if (isValid(ASIGNATION_NORULE_REGEX, line)) {
                //separa los elementos de la linea con base en los espacios
                let tokens = cleanSpaces(line.split(" "))

                // recorre cada par de elementos sobrantes de la asignacion omitiendo el primero(que sera la asignacion final)
                for (let i = 1; i < tokens.length; i++) {
                    //verifica que el operador utilizado sea valido
                    if (["=", "-", "/", "+", "*"].includes(tokens[i])) {
                        //añade la linea del triplo a la tabla
                        triploTable.push({ pos: lineCounter++, dato_obj: "T1", dato_fuente: tokens[i + 1], operador: tokens[i] })
                    }
                }
                //añade la ultima linea(asignacion)
                triploTable.push({ pos: lineCounter++, dato_obj: tokens[0], dato_fuente: "T1", operador: "=" })
            }

            //verifica que la linea inicie con la palabra clave de la condicional "if22"
            if (line.startsWith(CONSTANT_KEYWORD_IF)) {
                //verifica los dos casos, logico o solo relacional
                const isLogicalAndRelational = line.match(LOGICAL_REGEX)
                const isRelational = line.match(RELATIONAL_REGEX)

                isInsideIf = true // establece que se el codigo se encuentra actualmente dentro de un if

                //verifica si la expression es logica y cuenta con dos operandos
                if (isLogicalAndRelational) {
                    const logicalMatches = getMatches(RELATIONAL_REGEX, line).map(match => match[0])
                    let [firstMatch, secondMatch] = logicalMatches //exrae ambos operandos

                    //verifica que sea un operador OR
                    if (line.includes(CONSTANT_OPERATOR_OR)) {
                        triploTable.push({ pos: lineCounter++, dato_obj: "T1", dato_fuente: firstMatch.split(" ")[0], operador: "=" })
                        triploTable.push({ pos: lineCounter++, dato_obj: "T1", dato_fuente: firstMatch.split(" ")[2], operador: firstMatch.split(" ")[1] })
                        triploTable.push({ pos: lineCounter++, dato_obj: "TR1", dato_fuente: "TRUE", operador: lineCounter + 5 })
                        triploTable.push({ pos: lineCounter++, dato_obj: "TR1", dato_fuente: "FALSE", operador: lineCounter })

                        triploTable.push({ pos: lineCounter++, dato_obj: "T1", dato_fuente: secondMatch.split(" ")[0], operador: "=" })
                        triploTable.push({ pos: lineCounter++, dato_obj: "T1", dato_fuente: secondMatch.split(" ")[2], operador: secondMatch.split(" ")[1] })
                        triploTable.push({ pos: lineCounter++, dato_obj: "TR1", dato_fuente: "TRUE", operador: lineCounter + 1 })
                        triploTable.push({ pos: lineCounter++, dato_obj: "TR1", dato_fuente: "FALSE", operador: " " })
                    }

                    if (line.includes(CONSTANT_OPERATOR_AND)) {
                        triploTable.push({ pos: lineCounter++, dato_obj: "T1", dato_fuente: firstMatch.split(" ")[0], operador: "=" })
                        triploTable.push({ pos: lineCounter++, dato_obj: "T1", dato_fuente: firstMatch.split(" ")[2], operador: firstMatch.split(" ")[1] })
                        triploTable.push({ pos: lineCounter++, dato_obj: "TR1", dato_fuente: "TRUE", operador: lineCounter + 1 })
                        triploTable.push({ pos: lineCounter++, dato_obj: "TR1", dato_fuente: "FALSE", operador: " " })

                        triploTable.push({ pos: lineCounter++, dato_obj: "T1", dato_fuente: secondMatch.split(" ")[0], operador: "=" })
                        triploTable.push({ pos: lineCounter++, dato_obj: "T1", dato_fuente: secondMatch.split(" ")[2], operador: secondMatch.split(" ")[1] })
                        triploTable.push({ pos: lineCounter++, dato_obj: "TR1", dato_fuente: "TRUE", operador: lineCounter + 1 })
                        triploTable.push({ pos: lineCounter++, dato_obj: "TR1", dato_fuente: "FALSE", operador: " " })
                    }
                } else {
                    if (isRelational) {
                        const relacionalMatches = getMatches(RELATIONAL_REGEX, line).map(match => match[0])
                        let [firstMatch] = relacionalMatches

                        triploTable.push({ pos: lineCounter++, dato_obj: "T1", dato_fuente: firstMatch.split(" ")[0], operador: "=" })
                        triploTable.push({ pos: lineCounter++, dato_obj: "T1", dato_fuente: firstMatch.split(" ")[2], operador: firstMatch.split(" ")[1] })
                        triploTable.push({ pos: lineCounter++, dato_obj: "TR1", dato_fuente: "TRUE", operador: lineCounter + 1 })
                        triploTable.push({ pos: lineCounter++, dato_obj: "TR1", dato_fuente: "FALSE", operador: " " })
                    }
                }
            }

            if (line.includes(CONSTANT_KEYWORD_ELSE) && isInsideIf) {
                isInsideIf = false
                isInsideElse = true;

                triploTable.push({ pos: lineCounter++, dato_obj: "", dato_fuente: " ", operador: "JMP" })

                for (let triplo of triploTable) {
                    if (triplo.operador == " ") {
                        triplo.operador = lineCounter
                    }
                }
            }

            if (line == CONSTANT_CHARACTER_RIGHT_BRACKET && isInsideElse) {
                isInsideElse = false

                for (let triplo of triploTable) {
                    if (triplo.dato_fuente === " ") {
                        triplo.dato_fuente = triploTable[triploTable.length - 1].pos + 1
                    }
                }
            }

            if (line == CONSTANT_CHARACTER_RIGHT_BRACKET && isInsideIf) {
                isInsideElse = false
                for (let triplo of triploTable) {
                    if (triplo.operador == " ") {
                        triplo.operador = lineCounter
                    }
                }
            }
        }

        return triploTable
    }

    // b = 10
    // b = 5 + c
    optimize(source) {
        let lines = source.split("\n")
        let codigo_optimizado = []
        let lineNumber = 0
        let unused_lines = []

        for (let line of lines) {
            const isAsignation = isValid(ASIGNATION_NORULE_REGEX, line)

            if (line.length > 0) {
                if (isAsignation) {
                    const operationMatch = getMatches(new RegExp(ASIGNATION_NORULE_REGEX, "g"), line)
                    const operationLine = operationMatch[0][0]

                    const to = operationLine.split(" ")[0]

                    console.log(operationLine)

                    let rest = lines.slice(lineNumber, lines.length)
                    let reutilizado = false;

                    for (let lr of rest) {
                        const isAsignation = isValid(ASIGNATION_NORULE_REGEX, lr)

                        if (isAsignation) {
                            const restLine = lr.split(" ")
                            if (cleanSpaces(lr.split(" ")).splice(1).includes(to)) {
                                reutilizado = true;
                                break
                            }
                        }

                        if (lr.startsWith(CONSTANT_KEYWORD_IF)) {
                            const isLogicalAndRelational = lr.match(LOGICAL_REGEX)
                            const isRelational = lr.match(RELATIONAL_REGEX)

                            if (isLogicalAndRelational) {
                                const logicalMatches = getMatches(RELATIONAL_REGEX, lr).map(match => match[0])
                                let [firstMatch, secondMatch] = logicalMatches

                                if (firstMatch.includes(to) || secondMatch.includes(to)) {
                                    reutilizado = true;
                                    break
                                }
                            } else {
                                if (isRelational) {
                                    const relacionalMatches = getMatches(RELATIONAL_REGEX, lr).map(match => match[0])
                                    let [firstMatch] = relacionalMatches

                                    if (firstMatch.includes(to)) {
                                        reutilizado = true;
                                        break
                                    }
                                }
                            }
                        }
                    }

                    if (!reutilizado) unused_lines.push(lineNumber)
                }
            }

            lineNumber += 1
        }

        codigo_optimizado = lines.filter(
            (el, idx) => (
                !unused_lines.includes(idx)
            )
        )

        return codigo_optimizado.join("\n")
    }

    generateAssembly(sourcecode) {
        const astGenerator = new ASTGenerator(sourcecode);
        const ast = astGenerator.generate();
        const assembly = ObjectCode.getMainProgram(ast.body)
        return assembly
    }
}





export default Compiler