export const isValid   = (regex, string) => regex.test(string)
export const getMatches = (regex, line) => [...line.matchAll(regex)]; 
export const stringLines = (string) => string.split("\n")