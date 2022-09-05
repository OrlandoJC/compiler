import { cleanSpaces } from "./utils/arrays.js";
import { getMatches, isValid } from "./utils/strings.js";
import { TYPE_ERROR, VAR_ERROR } from "./config/error.constants.js";
import regex from './config/type.matchers.js'
import rules from "./config/rules.matchers.js";
import CompilerError from "./CompilerError.js";

const ASIGNATION_REGEX = /\#[a-z]+\$\s=\s(-?[0-9]*22.[0-9]+|(-)?[0-9]*22|\#[a-z]+\$)(\s(\+|\-|\*|\/)\s(-?[0-9]*22.[0-9]+|(-)?[0-9]*22|\#[a-z]+\$))?/;
const OPERATION_REGEX  = /\#[a-z]+\$\s=\s(-?[0-9]*22.[0-9]+|(-)?[0-9]*22|\#[a-z]+\$)(\s(\+|\*|\-|\/)\s(-?[0-9]*22.[0-9]+|(-)?[0-9]*22|\#[a-z]+\$))?/g;

class Compiler {

    constructor() {
        this.simbolTable = []
    }

    sematicAnalisys(string) {
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


    /*
        *todo
        La comprobacion de operandos es candidato a extraerse en un metodo
    */

    sematicAnalisys2(string, table) {
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
                        const toType  = table.find(token => token.token === to)?.type
                        const fOpType = table.find(token => token.token === fOp)?.type

                        // si el tipo de dato no se encuentra en la tabla de simbolos, significa que la variable no fue declarada
                        if (!toType)  { errors.push(new CompilerError(VAR_ERROR, "variable indefinida", lineNumber, to)) ; continue }
                        if (!fOpType) { errors.push(new CompilerError(VAR_ERROR, "variable indefinida", lineNumber, fOp)); continue }

                        // si la regla de operacion no se encuentra, salta la operacion
                        if (!rules[toType]) continue

                        //verifica que el operando asignado sea del tipo de tipo correcto
                        if (!rules[toType].asignation.operands.includes(fOpType)) {
                            errors.push(new CompilerError(TYPE_ERROR, "incompatibilidad de tipos", lineNumber, fOp))
                        }
                    } else { // se trata de una operacion
                        // extrae los tipos de datos de los operandos
                        const toType  = table.find(token => token.token === to)?.type
                        const fOpType = table.find(token => token.token === fOp)?.type
                        const sOpType = table.find(token => token.token === sOp)?.type

                        // si el tipo de dato no se encuentra en la tabla de simbolos, significa que la variable no fue declarada
                        if (!toType)  { errors.push(new CompilerError(VAR_ERROR, "variable indefinida", lineNumber, to)) ; continue} 
                        if (!fOpType) { errors.push(new CompilerError(VAR_ERROR, "variable indefinida", lineNumber, fOp)); continue}
                        if (!sOpType) { errors.push(new CompilerError(VAR_ERROR, "variable indefinida", lineNumber, sOp)); continue}

                        // si la regla de operacion no se encuentra, salta la operacion
                        if (!rules[toType]) continue

                        //comprueba que exista la operacion del tipo de dato actual  para el operando  : a = b* opa c
                        if (rules[toType].operation[fOpType]) {
                            //comprueba que exista la operacion del tipo de dato actual  para el operando  : a = b opa c* 
                            if (!rules[toType].operation[fOpType].next.includes(sOpType)) {
                                // si no existe, lanza un error de tipo c : error
                                errors.push(new CompilerError(TYPE_ERROR, "incompatibilidad de tipos", lineNumber, sOp))
                            }
                        } else {
                            //si no existe, lanza un error de tipo b error
                            errors.push(new CompilerError(TYPE_ERROR, "incompatibilidad de tipos", lineNumber, fOp))
                        }
                    }
                }
            }
        }

        return errors
    }

}

export default Compiler