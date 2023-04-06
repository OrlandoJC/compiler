class CompilerError  {
    constructor(token, message, line, lexema, type) {
        this.message = message
        this.token = token
        this.line = line
        this.lexema = lexema
        this.type = type
    }
}

export default CompilerError