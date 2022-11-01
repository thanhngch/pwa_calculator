export function closeBracket(input: string) {
    let openBracket = 0;
    let closeBracket = 0;
    for (let i = 0; i < input.length; i++) {
        let c = input[i];
        if (c == '(') {
            openBracket++;
        } else if (c == ')') {
            closeBracket++;
        }
    }
    let restCloseBracket = openBracket - closeBracket;
    if (restCloseBracket > 0) {
        input += ')'.repeat(restCloseBracket);
    }
    console.log('input', input);
    return input;
}
