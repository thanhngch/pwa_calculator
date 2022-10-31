import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { create, all } from 'mathjs'



import Div100vh from 'react-div-100vh';

// import 'hack';
import './style.css';
import { closeBracket } from "./utils";

export interface AppProp {

}

export interface AppState {
    input: string
    eval: string
    isCal: boolean
    twoFunc: boolean
}

export interface History {
    input: string,
    ans: string
}

const math = create(all, {
    epsilon: 1e-12,
    number: 'number',
    precision: 64,
    predictable: false,
    randomSeed: null
});
const parser = math.parser();

parser.evaluate('sqrt3(x) = x ^ (1/3)');
parser.evaluate('ln(x) = log(x) / log(e)');
parser.evaluate('log2(x) = log(x) / log(e)');

export class App extends React.Component<AppProp, AppState> {
    refOp: React.RefObject<HTMLDivElement>;
    refCo: React.RefObject<HTMLDivElement>;
    history: History[];

    constructor(props: AppProp) {
        super(props);
        this.refOp = React.createRef();
        this.refCo = React.createRef();
        this.history = [];
        this.state = {
            input: '',
            eval: '',
            isCal: false,
            twoFunc: false,
        };
    }

    calWidth = () => {
        if (!this.refOp.current || !this.refCo.current) {
            return;
        }
        if (this.refOp.current.clientHeight * 2 < this.refCo.current.clientHeight) {
            let nodesRow = this.refOp.current.childNodes;
            nodesRow.forEach(nodeRow => {
                nodeRow.childNodes.forEach(nodeB => {
                    let nodeBtn = nodeB as HTMLElement;
                    const MARGING = 6;
                    let height = this.refCo.current!.clientHeight / 10 - MARGING;
                    let width = nodeBtn.clientWidth;
                    if (width < height) {
                        height = width;
                    }
                    if (height > 80) {
                        height = 80;
                    }
                    nodeBtn.style.height = height + 'px';
                });
            });
        } else {

        }
    }
    
    componentDidMount() {
        document.addEventListener("orientationchange", (e) => {  
            this.calWidth();
        });
        window.onorientationchange = () => {
            this.calWidth();
        }
        window.addEventListener('resize', (e) => {  
            this.calWidth();
        });
        this.calWidth();
    }

    inputToEval = (input: string) => {
        input = input.trim();
        if (input == '×') {
            return ' * ';
        }
        if (input == '÷') {
            return ' / ';
        }
        if (input == '√(') {
            return 'sqrt( ';
        }
        if (input == '∛(') {
            return 'sqrt3( ';
        }
        if (input == '°') {
            return ' deg ';
        }
        if (input == 'π') {
            return ' pi ';
        }
        if (input == '=') {
            return '';
        }
        return input;
    }

    input = (btn : string, event: React.MouseEventHandler<HTMLButtonElement>) => {
        this.setState((prevState) => {
            if (btn == 'AC') {
                return {
                    input: '',
                    isCal: false,
                    eval: '',
                }
            }
            if (btn == 'DEL') {
                let removeChar = 1;
                if (prevState.input[prevState.input.length - 1] == ' ') {
                    removeChar = 2;
                }
                let newInput = prevState.input.substring(0, prevState.input.length - removeChar);
                newInput = newInput.trim();
                return {
                    input: newInput,
                    isCal: false,
                    eval: '',
                }
            }
            let newInput = prevState.input;
            let newEval = prevState.eval;
            if (prevState.isCal) {
                newInput = btn;
                newEval = this.inputToEval(btn);
            } else {
                newInput += btn;
                newEval += this.inputToEval(btn);
            }
            return {
                input: newInput,
                isCal: (btn == ' ='),
                eval: newEval,
            };
        })
    }
    
    getAnsStr = () => {
        try {
            let evalution = closeBracket(this.state.eval);
            let ans = parser.evaluate(evalution);
            let ansStr = math.format(ans, {
                precision: 11,
                upperExp: 10,
            });
            return ansStr;
        } catch(e) {
            console.error(e);
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

    render() {
        
        return <Div100vh>
            <div className="wrap-container" ref={this.refCo}>
                <div className="wrap-input">
                    <div className="item">
                        { this.state.isCal && <>
                                <div className="input">{this.state.input}</div>
                                <div className="answer">{this.getAnsStr()}</div>
                            </>
                        }
                        {!this.state.isCal && <div className="answer">{this.state.input}</div>}
                    </div>
                </div>
                <div className="wrap-operator noselect" ref={this.refOp}>
                    <div className="row">
                        <button onMouseDown={this.input.bind(this, '(')} className="btn func">(</button>
                        <button onMouseDown={this.input.bind(this, ')')} className="btn func">)</button>
                        <button className="btn func">mc</button>
                        <button className="btn func">m+</button>
                        <button className="btn func">m-</button>
                        <button className="btn func">mr</button>
                    
                        <button onMouseDown={this.input.bind(this, 'AC')} className="sys btn sm-font">AC</button>
                        <button onMouseDown={this.input.bind(this, 'DEL')} className="sys btn sm-font">DEL</button>
                        <button onMouseDown={this.input.bind(this, '%')} className="sys btn">%</button>
                        <button onMouseDown={this.input.bind(this, ' ÷ ')} className="ops btn">÷</button>
                    </div>
                    <div className="row">
                        <button onMouseDown={this.toggleTwofunc} 
                            className={this.state.twoFunc ? 'btn btn-enable' : 'btn func'}>2nd</button>
                        <button onMouseDown={this.input.bind(this, ' ^ 2')} className="btn func">x<sup>2</sup></button>
                        <button onMouseDown={this.input.bind(this, ' ^ 3')} className="btn func">x<sup>3</sup></button>
                        <button onMouseDown={this.input.bind(this, ' ^ ')} className="btn func">x<sup>y</sup></button>
                        <button onMouseDown={this.input.bind(this, 'e ^ ')} className="btn func">e<sup>x</sup></button>
                        { !this.state.twoFunc && 
                            <button onMouseDown={this.input.bind(this, '10 ^ ')} className="btn func">10<sup>x</sup></button>
                        }
                        { this.state.twoFunc && 
                            <button onMouseDown={this.input.bind(this, '2 ^ ')} className="btn func">2<sup>x</sup></button>
                        }

                        <button onMouseDown={this.input.bind(this, '7')} className="btn">7</button>
                        <button onMouseDown={this.input.bind(this, '8')} className="btn">8</button>
                        <button onMouseDown={this.input.bind(this, '9')} className="btn">9</button>
                        <button onMouseDown={this.input.bind(this, ' × ')} className="btn ops">×</button>
                    </div>
                    <div className="row">
                        <button onMouseDown={this.input.bind(this, ' ^ -1')} className="btn func">x<sup>-1</sup></button>
                        <button onMouseDown={this.input.bind(this, ' √( ')} className="btn func">√</button>
                        <button onMouseDown={this.input.bind(this, ' ∛( ')} className="btn func">∛</button>
                        <button onMouseDown={this.input.bind(this, ' ^ (1/')} className="btn func">y√x</button>
                        <button onMouseDown={this.input.bind(this, ' ln(')} className="btn func">ln</button>
                        { !this.state.twoFunc && 
                            <button onMouseDown={this.input.bind(this, ' log(')} className="btn func">log<sub>10</sub></button>
                        }
                        { this.state.twoFunc && 
                            <button onMouseDown={this.input.bind(this, ' log2(')} className="btn func">log<sub>2</sub></button>
                        }

                        <button onMouseDown={this.input.bind(this, '4')} className="btn">4</button>
                        <button onMouseDown={this.input.bind(this, '5')} className="btn">5</button>
                        <button onMouseDown={this.input.bind(this, '6')} className="btn">6</button>
                        <button onMouseDown={this.input.bind(this, ' - ')} className="btn ops">-</button>
                    </div>
                    <div className="row">
                        <button onMouseDown={this.input.bind(this, '!')} className="btn func">x!</button>
                        { !this.state.twoFunc && <>
                            <button onMouseDown={this.input.bind(this, 'sin(')} className="btn func">sin</button>
                            <button onMouseDown={this.input.bind(this, 'cos(')} className="btn func">cos</button>
                            <button onMouseDown={this.input.bind(this, 'tan(')} className="btn func">tan</button>
                        </> }
                        { this.state.twoFunc && <>
                            <button onMouseDown={this.input.bind(this, 'asin(')} className="btn func">sin<sup>-1</sup></button>
                            <button onMouseDown={this.input.bind(this, 'acos(')} className="btn func">cos<sup>-1</sup></button>
                            <button onMouseDown={this.input.bind(this, 'atan(')} className="btn func">tan<sup>-1</sup></button>
                        </>}
                        <button onMouseDown={this.input.bind(this, 'e')} className="btn func">e</button>
                        <button onMouseDown={this.input.bind(this, 'E')} className="btn func">E</button>

                        <button onMouseDown={this.input.bind(this, '1')} className="btn">1</button>
                        <button onMouseDown={this.input.bind(this, '2')} className="btn">2</button>
                        <button onMouseDown={this.input.bind(this, '3')} className="btn">3</button>
                        <button onMouseDown={this.input.bind(this, ' + ')} className="btn ops">+</button>
                    </div>
                    <div className="row">
                        <button onMouseDown={this.input.bind(this, '/')} className="btn func">/</button>
                        { !this.state.twoFunc && <>
                            <button onMouseDown={this.input.bind(this, 'sinh(')} className="btn func">sinh</button>
                            <button onMouseDown={this.input.bind(this, 'cosh(')} className="btn func">cosh</button>
                            <button onMouseDown={this.input.bind(this, 'tanh(')} className="btn func">tanh</button>
                        </>}
                        { this.state.twoFunc && <>
                            <button onMouseDown={this.input.bind(this, 'asinh(')} className="btn func">sinh<sup>-1</sup></button>
                            <button onMouseDown={this.input.bind(this, 'acosh(')} className="btn func">cosh<sup>-1</sup></button>
                            <button onMouseDown={this.input.bind(this, 'atanh(')} className="btn func">tanh<sup>-1</sup></button>
                        </>}
                        <button onMouseDown={this.input.bind(this, 'π')} className="btn func">π</button>
                        <button onMouseDown={this.input.bind(this, '°')} className="btn func">°</button>

                        <button onMouseDown={this.input.bind(this, '0')} className="btn">0</button>
                        <button onMouseDown={this.input.bind(this, '.')} className="btn">.</button>
                        <button className="btn sm-font">ans</button>
                        <button onMouseDown={this.input.bind(this, ' =')} className="btn ops">=</button>
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
