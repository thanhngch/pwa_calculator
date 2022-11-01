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

export function formatNumber(input: string) {
    let inputs = input.split('.');
    if (inputs[0]) {
        let number = inputs[0];
        number = new Intl.NumberFormat('en-EN').format(Number(number));
        number = number.replace(/,/g, ' ');

        if (inputs.length == 2) {
            return number + '.' + inputs[1];
        } else {
            return number;
        }
    }
    return inputs.join('.');
}
