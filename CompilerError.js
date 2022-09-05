class CompilerError  {
    constructor(token, message, line, lexema) {
        this.message = message
        this.token = token
        this.line = line
        this.lexema = lexema
    }
}

export default CompilerError