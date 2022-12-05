class ObjectCode {
    static getAsigment(asigmentStatement) {
        return `
                    MOV AX, ${asigmentStatement.value}
                    MOV ${asigmentStatement.variable}, AX
            `
    }

    static getAsigmentExpression(asigmentExpressionStatement) {
        let instruction = ''

        switch(asigmentExpressionStatement.value.operator) {
            case '+' : 
                instruction = `
                    MOV AX, ${asigmentExpressionStatement.value.left}
                    ADD AX, ${asigmentExpressionStatement.value.right}
                    MOV ${asigmentExpressionStatement.variable}, AX
                `
                break;
            case '-':
                instruction = `
                    MOV AX, ${asigmentExpressionStatement.value.left}
                    SUB AX, ${asigmentExpressionStatement.value.right}
                    MOV ${asigmentExpressionStatement.variable}, AX
                `
                break;
            case '*':
                instruction = `
                    MOV AL, ${asigmentExpressionStatement.value.left}
                    MOV BL, ${asigmentExpressionStatement.value.right}
                    MUL BL
                    MOV ${asigmentExpressionStatement.variable}, AX
                `
                break;
            case '/':
                instruction = `
                    MOV AX, ${asigmentExpressionStatement.value.left}
                    MOV BL, ${asigmentExpressionStatement.value.right}
                    DIV BL
                    MOV ${asigmentExpressionStatement.variable}, AL
                `
                break;
            case '%':
                instruction = `
                    MOV AX, ${asigmentExpressionStatement.value.left}
                    MOV BL, ${asigmentExpressionStatement.value.right}
                    DIV BL
                    MOV ${asigmentExpressionStatement.variable}, AH
                `
        }
        return instruction
    }

    static getIfStatement(IfStatement, id) {
        const operand = {
            "=="  : "EQ",
            "<"  : "LT",
            ">"  : "GT",
            ">=" : "GE",
            "<=" : "LE",
            "!=" : "NE"
        }

        let result = ''

        if (IfStatement.condition.type == 'RelationalExpression') 
            result += `
                    MOV AX, ${IfStatement.condition.left.name}
                    CMP AX, ${IfStatement.condition.right.name}
                    ${operand[IfStatement.condition.operator]}, IFTRUE
                    JMP IFELSE
            `

        if (IfStatement.condition.type == 'LogicalExpression') {
           if (IfStatement.condition.operator == '&&') {
                result += `
                    MOV AX, ${IfStatement.condition.left.left.name}
                    CMP AX, ${IfStatement.condition.left.right.name}
                    ${operand[IfStatement.condition.left.operator]}, IFTRUE
                    JMP IFELSE
                
                IFTRUE:
                    MOV AX, ${IfStatement.condition.right.left.name}
                    CMP AX, ${IfStatement.condition.right.right.name}
                    ${operand[IfStatement.condition.right.operator]}, IFTRUE2
                    JMP IFELSE
                `
           }

           if (IfStatement.condition.operator == '||') {
                result += `
                    MOV AX, ${IfStatement.condition.left.left.name}
                    CMP AX, ${IfStatement.condition.left.right.name}
                    ${operand[IfStatement.condition.left.operator]}, IFTRUE2
                    JMP IFTRUE  

                IFTRUE:
                    MOV AX, ${IfStatement.condition.right.left.name}
                    CMP AX, ${IfStatement.condition.right.right.name}
                    ${operand[IfStatement.condition.right.operator]}, IFTRUE2
                    JMP IFELSE
                `
            }
        }
        
        if ( IfStatement.body.length > 0 ) {
            result += `
                IFTRUE${IfStatement.condition.type === 'LogicalExpression' ? "2" : ""}:`
            for (let line of IfStatement.body) {
                if (line.type == 'ExpressionAssignment') 
                    result += this.getAsigmentExpression(line)
                if (line.type == 'SimpleAssignment') 
                    result += this.getAsigment(line)
            }
            result += `
                    JMP SALIR
            `
        }

        if ( IfStatement.consecuent.length > 0 ) {
            result += `
                IFELSE:`
            for (let line of IfStatement.consecuent) {
                if (line.type == 'ExpressionAssignment') 
                    result += this.getAsigmentExpression(line)
                if (line.type == 'SimpleAssignment') 
                    result += this.getAsigment(line)
            }
        }

        if( IfStatement.body.length == 0) 
            result += `
                    IFTRUE${IfStatement.condition.type === 'LogicalExpression' ? "2" : ""}:`
        if ( IfStatement.consecuent.length == 0) 
            result += `
                    IFELSE:`

        result += `
                SALIR:`
        return result
    }

    static getMainProgram(programStatements) {
        let assemblyCode = ''

        for (let statement of programStatements) {
            if (statement.type === 'SimpleAssignment') {
                assemblyCode += this.getAsigment(statement)
            }

            if (statement.type === 'ExpressionAssignment') {
                assemblyCode += this.getAsigmentExpression(statement)
            }

            if (statement.type === 'IfStatement') {
                assemblyCode += this.getIfStatement(statement)
            }
        }

        return assemblyCode
    }
}

export default ObjectCode