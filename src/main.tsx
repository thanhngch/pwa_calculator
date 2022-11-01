import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { create, all } from 'mathjs'



import Div100vh from 'react-div-100vh';

// import 'hack';
import './style.css';
import './media.css';
import { closeBracket, formatNumber } from "./utils";

export interface AppProp {

}

export interface AppState {
    input: string
    isCal: boolean
    twoFunc: boolean
    resize: boolean
    exp: boolean
}

export interface History {
    input: string,
    ans: string
}

const math = create(all, {
    epsilon: 1e-100,
    number: 'BigNumber',
    precision: 101,
    predictable: true,
    randomSeed: null
});
const parser = math.parser();

parser.evaluate('sqrt3(x) = x ^ (1/3)');
parser.evaluate('ln(x) = log2(x)');
parser.evaluate('ans = 0');
parser.evaluate('mem = 0');
parser.evaluate('add(x) = mem + x');
parser.evaluate('sub(x) = mem - x');
parser.evaluate('memclear() = 0');
parser.evaluate('memadd(x) = mem');
parser.evaluate('memsub(x) = mem');


export class App extends React.Component<AppProp, AppState> {
    refOp: React.RefObject<HTMLDivElement>;
    refCo: React.RefObject<HTMLDivElement>;
    history: History[];
    lastAns: string;
    mem: string;

    constructor(props: AppProp) {
        super(props);
        this.refOp = React.createRef();
        this.refCo = React.createRef();
        this.history = [];
        this.state = {
            input: '',
            isCal: false,
            twoFunc: false,
            resize: false,
            exp: false,
        };
        this.lastAns = '0';
        this.mem = '0';
    }

    calWidth = () => {
        if (!this.refOp.current || !this.refCo.current) {
            return;
        }
        // if (this.refOp.current.clientHeight * 2 >= this.refCo.current.clientHeight) {
        //     this.refOp.current.clientHeight = 0;
        // }
        // if (this.refOp.current.clientHeight * 2 < this.refCo.current.clientHeight) {
            let nodesRow = this.refOp.current.childNodes;
            nodesRow.forEach(nodeRow => {
                nodeRow.childNodes.forEach(nodeB => {
                    let nodeBtn = nodeB as HTMLElement;
                    const MARGING = 6;
                    let devicer = 10;
                    if (window.innerWidth < 700 && window.innerWidth > 300) {
                        devicer = 14;
                    }
                    let height = this.refCo.current!.clientHeight / devicer - MARGING;
                    let width = nodeBtn.clientWidth;
                    if (width < height) {
                        height = width;
                    }
                    nodeBtn.style.height = height + 'px';
                });
            });
        // } 
    }
    
    componentDidMount() {
        document.addEventListener("orientationchange", (e) => {  
            // location.reload();
            this.calWidth();
            this.setState({
                resize: true,
            });
        });
        window.onorientationchange = () => {
            // location.reload();
            this.calWidth();
            this.setState({
                resize: true,
            });
        }
        window.addEventListener('resize', (e) => {  
            // location.reload();
            this.calWidth();
            this.setState({
                resize: true,
            });
        });
        if (screen && screen.orientation) {
            screen.orientation.addEventListener('change', () => {
                // location.reload();
                this.calWidth();
                this.setState({
                    resize: true,
                });
            });
        }
        this.calWidth();
    }

    isExp = (input: string) => {
        input = input.trim();
        let last1char = input.substring(input.length - 1);
        let last4char = input.substring(input.length - 4);
        let last5char = input.substring(input.length - 5);
        if (last1char == '^') {
            return true;
        }
        if (last5char == '^(-1)') {
            return true;
        } 
        if (last4char == '^(2)' || last4char == '^(3)') {
            return true;
        } 
        return false;
    }

    input = (btn : string, event: React.MouseEventHandler<HTMLElement>) => {
        this.setState((prevState) => {
            let isEqualBtn = btn.trim() == "=";
            if (btn == 'AC') {
                return {
                    resize: false,
                    input: '',
                    isCal: false,
                    exp: false,
                }
            }
            if (btn == 'memadd') {
                let input = prevState.input
                if (prevState.isCal) {
                    input = this.lastAns.replace(/ /g, '');
                }
                input = input || '0';
                let evaluation = this.getEvalutionBeforeParse(input);
                try {
                    let ans = parser.evaluate('mem = add(' + evaluation + ')');
                    let ansStr = this.getAnsFromEvalutionResult(ans);
                    this.mem = ansStr;
                } catch (e) {
                    this.mem = '0';
                    return {
                        resize: false,
                        input: 'Parse error',
                        isCal: true,
                        exp: false,
                    }
                }
                return {
                    resize: false,
                    input: 'memadd(' + input + ')',
                    isCal: true,
                    exp: false,
                }
            }
            if (btn == 'memsub') {
                // let newInput = this.lastAns.replace(/ /g, '');
                let input = prevState.input;
                if (prevState.isCal) {
                    input = this.lastAns.replace(/ /g, '');
                }
                input = input || '0';
                let evaluation = this.getEvalutionBeforeParse(input);
                try {
                    let ans = parser.evaluate('mem = sub(' + evaluation + ')');
                    let ansStr = this.getAnsFromEvalutionResult(ans);
                    this.mem = ansStr;
                } catch (e) {
                    this.mem = '0';
                    return {
                        resize: false,
                        input: 'Parse error',
                        isCal: true,
                        exp: false,
                    }
                }
                return {
                    resize: false,
                    input: 'memsub(' + input + ')',
                    isCal: true,
                    exp: false,
                }
            }
            
            if (btn == 'memclear') {
                parser.evaluate('mem = 0');
                this.mem = '0';
                return {
                    resize: false,
                    input: 'memclear()',
                    isCal: true,
                    exp: false,
                }
            }
            if (btn == 'DEL') {
                console.log('input = \'' + prevState.input + '\'')
                let removeChar = 1;
                if (prevState.input[prevState.input.length - 1] == ' ') {
                    removeChar = 2;
                }
                let last3char = prevState.input.substring(prevState.input.length - 3);
                let last4char = prevState.input.substring(prevState.input.length - 4);
                let last5char = prevState.input.substring(prevState.input.length - 5);
                let last6char = prevState.input.substring(prevState.input.length - 6);
                if (last4char =='sin(' || last4char == 'cos(' || last4char == 'tan(') {
                    removeChar = 4;
                }
                if (last5char == 'sinh(' || last5char == 'cosh(' || last5char == 'tanh(' || 
                    last5char == 'asin(' || last5char == 'acos(' || last5char == 'atan(') {
                    removeChar = 5;
                }
                if (last6char =='asinh(' || last6char == 'acosh(' || last6char == 'atanh(') {
                    removeChar = 6;
                }
                if (last3char == 'ln(') {
                    removeChar = 3;
                } 
                if (last5char == 'log2(') {
                    removeChar = 5;
                } 
                if (last6char == 'log10(') {
                    removeChar = 6;
                }
                if (last5char == '^(-1)') {
                    removeChar = 5;
                } 
                if (last4char == '^(2)' || last4char == '^(3)') {
                    removeChar = 4;
                } 
                let newInput = prevState.input.substring(0, prevState.input.length - removeChar);
                newInput = newInput.trim();
                return {
                    resize: false,
                    input: newInput,
                    isCal: false,
                    exp: this.isExp(newInput),
                }
            }
            if (isEqualBtn && prevState.input.search('ans') != -1) {
                return {
                    resize: false,
                    input: prevState.input,
                    isCal: isEqualBtn,
                    exp: this.isExp(prevState.input),
                }
            }
            
            if (isEqualBtn && prevState.isCal) {
                return {};
            }

            if (this.isFuncBtn(btn) && (prevState.isCal || prevState.input == '')) {
                btn = this.lastAns.replace(/ /g, '') + btn;
            }

            let newInput = prevState.input;
            if (prevState.isCal) {
                newInput = btn;
            } else {
                newInput += btn;
            }
            return {
                resize: false,
                input: newInput,
                isCal: isEqualBtn,
                exp: this.isExp(newInput),
            };
        });
        let target = event.target as HTMLElement;
        target.classList.add('click');
    }

    inputUp = (event: React.MouseEventHandler<HTMLElement>) => {
        let target = event.target as HTMLElement;
        target.classList.remove('click');
    }

    isFuncBtn = (btn: string) => {
        btn = btn.trim();
        if (btn == '×' || btn == '+' || btn == '÷'
        || btn == '%' || btn == '^' || btn == '^(2)' || btn == '^(3)' 
        ||  btn == '^(-1)' || btn == '^ (1/' || btn == '!' || btn == '/') {
            return true;
        }
        return false;
    }

    inputToEval = (input: string) => {
        input = input.trim();
        let evaluation = '';
        for (let i = 0 ; i < input.length; i++) {
            let char = input[i];
            if (char == '×') {
                evaluation += ' * ';
            } else if (char == '÷') {
                evaluation += ' / ';
            } else if (char == '√') {
                evaluation += 'sqrt( ';
            } else if (char == '∛') {
                evaluation += 'sqrt3( ';
            } else if (char == '°') {
                evaluation += ' deg ';
            } else if (char == 'π') {
                evaluation += ' pi ';
            } else if (char == '=') {
                evaluation += '';
            } else {
                evaluation += char;
            }
        }
        
        return evaluation;
    }
    
    getEvalutionBeforeParse = (input: string) => {
        if (input[input.length - 1] == '=') {
            input = input.substring(0, input.length - 1);
        }
        let evalution = closeBracket(this.inputToEval(input));
        return evalution;
    }

    getAnsFromEvalutionResult = (ans: any) => {
        let ansStr = math.format(ans, {
            precision: 10,
            upperExp: 10,
        });
        if (ansStr == 'undefined') {
            return '0';
        }
        return ansStr;
    }

    getAnsStr = (input: string) => {
        if (this.state.resize) {
            return this.lastAns;
        }
        
        try {
            let evalution = closeBracket(this.inputToEval(input));
            console.log('evalution', evalution);
            let ans = parser.evaluate(evalution);
            let ansStr = this.getAnsFromEvalutionResult(ans);
            console.log('ans11', ansStr);
            parser.evaluate('ans = ' + ansStr);
            ansStr = formatNumber(ansStr);
            this.lastAns = ansStr;
            return ansStr;
        } catch(e) {
            console.error(e);
            this.lastAns = '0';
            return 'Parse error';
        }
        
    }

    toggleTwofunc = () => {
        this.setState((prevState) => {
            return {
                twoFunc: !prevState.twoFunc,
            }
        })
    }

    displayInput = (input: string) => {
        input = input || '0';
        if (input.trim() == '=') {
            return '';
        }
        input = input.replace(/log10/g, 'log');
        input = input.replace(/log2/g, 'log<sub>2</sub>');
        input = input.replace(/\^\(-1\)/g, '<sup>-1</sup>');
        input = input.replace(/\^\(2\)/g, '<sup>2</sup>');
        input = input.replace(/\^\(3\)/g, '<sup>3</sup>');

        input = input.replace(/asin\(/g, 'sin<sup>-1</sup>(');
        input = input.replace(/acos\(/g, 'cos<sup>-1</sup>(');
        input = input.replace(/atan\(/g, 'tan<sup>-1</sup>(');

        input = input.replace(/asinh\(/g, 'sinh<sup>-1</sup>(');
        input = input.replace(/acosh\(/g, 'cosh<sup>-1</sup>(');
        input = input.replace(/atanh\(/g, 'tanh<sup>-1</sup>(');
        return input;
    }

    render() {
        let disabledExp = {};
        if (this.state.exp) {
            disabledExp = {
                disabled: 'disabled'
            }
        }
        return <Div100vh>
            <div className="wrap-container" ref={this.refCo}>
                <div className="wrap-input">
                    <div className="item">
                        { this.state.isCal && <>
                                <div className="input"
                                    dangerouslySetInnerHTML={{ __html: this.displayInput(this.state.input) }}></div>
                                <div className="answer">{this.getAnsStr(this.state.input)}</div>
                            </>
                        }
                        {!this.state.isCal && <div className="answer" 
                            dangerouslySetInnerHTML={{ __html: this.displayInput(this.state.input) }}></div>
                        }
                        { this.mem != '0' && 
                            <div className="mem">mem = {formatNumber(this.mem)}</div>
                        }
                    </div>
                </div>
                <div className="wrap-operator noselect" ref={this.refOp}>
                    <div className="row">
                        { !this.state.twoFunc && <>
                            <button onMouseUp={this.inputUp.bind(this)} onMouseDown={this.input.bind(this, 'sin(')} className="btn func func2 sm-font">sin</button>
                            <button onMouseUp={this.inputUp.bind(this)} onMouseDown={this.input.bind(this, 'cos(')} className="btn func func2 sm-font">cos</button>
                            <button onMouseUp={this.inputUp.bind(this)} onMouseDown={this.input.bind(this, 'tan(')} className="btn func func2 sm-font">tan</button>
                        </> }
                        { this.state.twoFunc && <>
                            <button onMouseUp={this.inputUp.bind(this)} onMouseDown={this.input.bind(this, 'asin(')} className="btn func func2 sm-font">sin<sup>-1</sup></button>
                            <button onMouseUp={this.inputUp.bind(this)} onMouseDown={this.input.bind(this, 'acos(')} className="btn func func2 sm-font">cos<sup>-1</sup></button>
                            <button onMouseUp={this.inputUp.bind(this)} onMouseDown={this.input.bind(this, 'atan(')} className="btn func func2 sm-font">tan<sup>-1</sup></button>
                        </>}
                        <button onMouseUp={this.inputUp.bind(this)} onMouseDown={this.input.bind(this, '°')} className="btn func func2">°</button>
                        <button {...disabledExp} onMouseUp={this.inputUp.bind(this)} onMouseDown={this.input.bind(this, '^(-1)')} className="btn func func2 sm-font">x<sup>-1</sup></button>
                    </div>
                    <div className="row">
                        { !this.state.twoFunc && <>
                            <button onMouseUp={this.inputUp.bind(this)} onMouseDown={this.input.bind(this, 'log10(')} className="btn func func2 sm-font">log<sub>10</sub></button>
                            <button onMouseUp={this.inputUp.bind(this)} onMouseDown={this.input.bind(this, 'ln(')} className="btn func func2 sm-font">ln</button>
                        </> }
                        { this.state.twoFunc && <>
                            <button onMouseUp={this.inputUp.bind(this)} onMouseDown={this.input.bind(this, '10^')} className="btn func func2 sm-font">10<sup>x</sup></button>
                            <button onMouseUp={this.inputUp.bind(this)} onMouseDown={this.input.bind(this, 'e^')} className="btn func func2 sm-font">e<sup>x</sup></button>
                        </>}
                        <button onMouseUp={this.inputUp.bind(this)} onMouseDown={this.input.bind(this, '(')} className="btn func func2 sm-font">(</button>
                        <button onMouseUp={this.inputUp.bind(this)} onMouseDown={this.input.bind(this, ')')} className="btn func func2 sm-font">)</button>
                        <button onMouseUp={this.inputUp.bind(this)} onMouseDown={this.toggleTwofunc} 
                            className={this.state.twoFunc ? 'btn btn-enable func func2 sm-font' : 'btn func func2 sm-font'}>inv</button>
                        
                        
                    </div>
                    <div className="row">
                        <button 
                            onMouseUp={this.inputUp.bind(this)} 
                            onMouseDown={this.input.bind(this, '(')} className="btn func"
                            >(</button>
                        <button onMouseUp={this.inputUp.bind(this)} onMouseDown={this.input.bind(this, ')')} className="btn func">)</button>
                        <button onMouseUp={this.inputUp.bind(this)} onMouseDown={this.input.bind(this, 'memclear')} className="btn func">mc</button>
                        <button onMouseUp={this.inputUp.bind(this)} onMouseDown={this.input.bind(this, 'memadd')} className="btn func">m+</button>
                        <button onMouseUp={this.inputUp.bind(this)} onMouseDown={this.input.bind(this, 'memsub')} className="btn func">m-</button>
                        <button onMouseUp={this.inputUp.bind(this)} onMouseDown={this.input.bind(this, 'mem')} className="btn func">mr</button>
                    
                        <button onMouseUp={this.inputUp.bind(this)} onMouseDown={this.input.bind(this, '! ')} className="btn func func2">!</button>

                        <button onMouseUp={this.inputUp.bind(this)} onMouseDown={this.input.bind(this, 'AC')} className="sys btn sm-font">AC</button>
                        <button onMouseUp={this.inputUp.bind(this)} onMouseDown={this.input.bind(this, 'DEL')} className="sys btn sm-font">DEL</button>
                        <button onMouseUp={this.inputUp.bind(this)} onMouseDown={this.input.bind(this, '%')} className="sys btn sm-font">%</button>
                        <button onMouseUp={this.inputUp.bind(this)} onMouseDown={this.input.bind(this, ' ÷ ')} className="ops btn">÷</button>
                    </div>
                    <div className="row">
                        <button onMouseUp={this.inputUp.bind(this)} onMouseDown={this.toggleTwofunc} 
                            className={this.state.twoFunc ? 'btn btn-enable func sm-font' : 'btn func sm-font'}>inv</button>
                        <button {...disabledExp} onMouseUp={this.inputUp.bind(this)} onMouseDown={this.input.bind(this, '^(2)')} className="btn func">x<sup>2</sup></button>
                        <button {...disabledExp} onMouseUp={this.inputUp.bind(this)} onMouseDown={this.input.bind(this, '^(3)')} className="btn func">x<sup>3</sup></button>
                        <button {...disabledExp} onMouseUp={this.inputUp.bind(this)} onMouseDown={this.input.bind(this, ' ^ ')} className="btn func">x<sup>y</sup></button>
                        <button onMouseUp={this.inputUp.bind(this)} onMouseDown={this.input.bind(this, 'e^')} className="btn func">e<sup>x</sup></button>
                        { !this.state.twoFunc && 
                            <button onMouseUp={this.inputUp.bind(this)} onMouseDown={this.input.bind(this, '10^')} className="btn func">10<sup>x</sup></button>
                        }
                        { this.state.twoFunc && 
                            <button onMouseUp={this.inputUp.bind(this)} onMouseDown={this.input.bind(this, '2^')} className="btn func">2<sup>x</sup></button>
                        }

                        <button {...disabledExp} onMouseUp={this.inputUp.bind(this)} onMouseDown={this.input.bind(this, ' ^ ')} className="btn func func2">^</button>

                        <button onMouseUp={this.inputUp.bind(this)} onMouseDown={this.input.bind(this, '7')} className="btn">7</button>
                        <button onMouseUp={this.inputUp.bind(this)} onMouseDown={this.input.bind(this, '8')} className="btn">8</button>
                        <button onMouseUp={this.inputUp.bind(this)} onMouseDown={this.input.bind(this, '9')} className="btn">9</button>
                        <button onMouseUp={this.inputUp.bind(this)} onMouseDown={this.input.bind(this, ' × ')} className="btn ops">×</button>
                    </div>
                    <div className="row">
                        <button {...disabledExp} onMouseUp={this.inputUp.bind(this)} onMouseDown={this.input.bind(this, '^(-1)')} className="btn func">x<sup>-1</sup></button>
                        <button onMouseUp={this.inputUp.bind(this)} onMouseDown={this.input.bind(this, '√(')} className="btn func">√</button>
                        <button onMouseUp={this.inputUp.bind(this)} onMouseDown={this.input.bind(this, '∛(')} className="btn func">∛</button>
                        <button {...disabledExp} onMouseUp={this.inputUp.bind(this)} onMouseDown={this.input.bind(this, ' ^ (1/')} className="btn func">y√x</button>
                        <button onMouseUp={this.inputUp.bind(this)} onMouseDown={this.input.bind(this, 'ln(')} className="btn func">ln</button>
                        { !this.state.twoFunc && 
                            <button onMouseUp={this.inputUp.bind(this)} onMouseDown={this.input.bind(this, 'log10(')} className="btn func sm-font">log<sub>10</sub></button>
                        }
                        { this.state.twoFunc && 
                            <button onMouseUp={this.inputUp.bind(this)} onMouseDown={this.input.bind(this, 'log2(')} className="btn func sm-font">log<sub>2</sub></button>
                        }

                        { !this.state.twoFunc && 
                            <button onMouseUp={this.inputUp.bind(this)} onMouseDown={this.input.bind(this, '√(')} className="btn func func2">√</button>
                        }
                        { this.state.twoFunc && 
                            <button {...disabledExp} onMouseUp={this.inputUp.bind(this)} onMouseDown={this.input.bind(this, '^(2)')} className="btn func func2 sm-font">x<sup>2</sup></button>
                        }

                        <button onMouseUp={this.inputUp.bind(this)} onMouseDown={this.input.bind(this, '4')} className="btn">4</button>
                        <button onMouseUp={this.inputUp.bind(this)} onMouseDown={this.input.bind(this, '5')} className="btn">5</button>
                        <button onMouseUp={this.inputUp.bind(this)} onMouseDown={this.input.bind(this, '6')} className="btn">6</button>
                        <button onMouseUp={this.inputUp.bind(this)} onMouseDown={this.input.bind(this, ' - ')} className="btn ops">-</button>
                    </div>
                    <div className="row">
                        <button onMouseUp={this.inputUp.bind(this)} onMouseDown={this.input.bind(this, '!')} className="btn func">x!</button>
                        { !this.state.twoFunc && <>
                            <button onMouseUp={this.inputUp.bind(this)} onMouseDown={this.input.bind(this, 'sin(')} className="btn func sm-font">sin</button>
                            <button onMouseUp={this.inputUp.bind(this)} onMouseDown={this.input.bind(this, 'cos(')} className="btn func sm-font">cos</button>
                            <button onMouseUp={this.inputUp.bind(this)} onMouseDown={this.input.bind(this, 'tan(')} className="btn func sm-font">tan</button>
                        </> }
                        { this.state.twoFunc && <>
                            <button onMouseUp={this.inputUp.bind(this)} onMouseDown={this.input.bind(this, 'asin(')} className="btn func sm-font">sin<sup>-1</sup></button>
                            <button onMouseUp={this.inputUp.bind(this)} onMouseDown={this.input.bind(this, 'acos(')} className="btn func sm-font">cos<sup>-1</sup></button>
                            <button onMouseUp={this.inputUp.bind(this)} onMouseDown={this.input.bind(this, 'atan(')} className="btn func sm-font">tan<sup>-1</sup></button>
                        </>}
                        <button onMouseUp={this.inputUp.bind(this)} onMouseDown={this.input.bind(this, 'e')} className="btn func">e</button>
                        <button onMouseUp={this.inputUp.bind(this)} onMouseDown={this.input.bind(this, 'E')} className="btn func">E</button>

                        <button onMouseUp={this.inputUp.bind(this)} onMouseDown={this.input.bind(this, 'π')} className="btn func func2">π</button>

                        <button onMouseUp={this.inputUp.bind(this)} onMouseDown={this.input.bind(this, '1')} className="btn">1</button>
                        <button onMouseUp={this.inputUp.bind(this)} onMouseDown={this.input.bind(this, '2')} className="btn">2</button>
                        <button onMouseUp={this.inputUp.bind(this)} onMouseDown={this.input.bind(this, '3')} className="btn">3</button>
                        <button onMouseUp={this.inputUp.bind(this)} onMouseDown={this.input.bind(this, ' + ')} className="btn ops">+</button>
                    </div>
                    <div className="row">
                        <button onMouseUp={this.inputUp.bind(this)} onMouseDown={this.input.bind(this, '/')} className="btn func">/</button>
                        { !this.state.twoFunc && <>
                            <button onMouseUp={this.inputUp.bind(this)} onMouseDown={this.input.bind(this, 'sinh(')} className="btn func sm-font">sinh</button>
                            <button onMouseUp={this.inputUp.bind(this)} onMouseDown={this.input.bind(this, 'cosh(')} className="btn func sm-font">cosh</button>
                            <button onMouseUp={this.inputUp.bind(this)} onMouseDown={this.input.bind(this, 'tanh(')} className="btn func sm-font">tanh</button>
                        </>}
                        { this.state.twoFunc && <>
                            <button onMouseUp={this.inputUp.bind(this)} onMouseDown={this.input.bind(this, 'asinh(')} className="btn func sm-font">sinh<sup>-1</sup></button>
                            <button onMouseUp={this.inputUp.bind(this)} onMouseDown={this.input.bind(this, 'acosh(')} className="btn func sm-font">cosh<sup>-1</sup></button>
                            <button onMouseUp={this.inputUp.bind(this)} onMouseDown={this.input.bind(this, 'atanh(')} className="btn func sm-font">tanh<sup>-1</sup></button>
                        </>}
                        <button onMouseUp={this.inputUp.bind(this)} onMouseDown={this.input.bind(this, 'π')} className="btn func">π</button>
                        <button onMouseUp={this.inputUp.bind(this)} onMouseDown={this.input.bind(this, '°')} className="btn func">°</button>

                        <button onMouseUp={this.inputUp.bind(this)} onMouseDown={this.input.bind(this, 'e')} className="btn func func2">e</button>

                        <button onMouseUp={this.inputUp.bind(this)} onMouseDown={this.input.bind(this, '0')} className="btn">0</button>
                        <button onMouseUp={this.inputUp.bind(this)} onMouseDown={this.input.bind(this, '.')} className="btn">.</button>
                        <button onMouseUp={this.inputUp.bind(this)} onMouseDown={this.input.bind(this, 'ans')} className="btn sm-font">ans</button>
                        <button onMouseUp={this.inputUp.bind(this)} onMouseDown={this.input.bind(this, ' =')} className="btn ops">=</button>
                    </div>
                </div>
            </div>
        </Div100vh>;
    }
}

let rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement!);
root.render(
    <App />
);
