import { cleanSpaces } from "./utils/arrays.js";
import { isValid } from "./utils/strings.js";
import regex from './config/type.matchers.js'

class Compiler {
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
                if (type === "Ment#") typeid = "int"
                if (type === "Gcad#") typeid = "string"
                if (type === "Ocar#") typeid = "chars"
            }

            // itera sobre todos los tokens de la linea
            for (let token in tokens) {
                let match  = regex.find(matchers => isValid(matchers.regex, tokens[token])) // encuentra la expresion regular que hace match con el token
                let exists = table.some(tokenTable => tokenTable.token == tokens[token]) // verifica si el token existe en la tabla

                // si el token no existe en la tabla y hay un nuevo match, se añade a la tabla
                if (match && !exists) {
                    table.push({ //añade el elemento al resultado
                        ...match,
                        token: tokens[token],
                        type: (match.id == "identificator" && isVariable ? typeid : "")
                    })
                }
            }
        }

        return table
    }
}

export default Compiler