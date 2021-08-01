class XRegExp {
    constructor(source, flag, root = "root") {
        this.table = new Map();
        this.regexp = new RegExp(
            this.compileRegExp(source, root, 0).source,
            flag
        );
    }

    compileRegExp(source, root, start) {
        if (source[root] instanceof RegExp) {
            return {
                source: source[root].source,
                length: 0,
            };
        }

        let length = 0;

        let regexp = source[root].replace(/\<([^>]+)\>/g, (str, $1) => {
            this.table.set(start + length, $1);
            // this.table.set($1, start + length);

            ++length;

            let r = this.compileRegExp(source, $1, start + length);

            length += r.length;

            return "(" + r.source + ")";
        });

        return {
            source: regexp,
            length: length,
        };
    }

    exec(string) {
        let r = this.regexp.exec(string);
        for (let i = 1; i < r.length; i++) {
            if (r[i] !== void 0) {
                r[this.table.get(i - 1)] = r[i];
            }
        }
        return r;
    }

    get lastIndex() {
        return this.regexp.lastIndex;
    }

    set lastIndex(val) {
        return (this.regexp.lastIndex = val);
    }
}

export function* scan(str) {
    let xregexp = {
        InputElements: "<WhiteSpace>|<LineTerminator>|<Comments>/|<Token>",
        WhiteSpace: / /,
        LineTerminator: /\n/,
        Comments: "<SingleLineComment>|<MultiLineComment>",
        SingleLineComment: /\/\/[^\n]*/,
        MultiLineComment: /\/\*(?:[^*]|\*[^\/])*\*\//,
        Token: "<Literal>|<Keywords>|<Identifer>|<Punctuator>",
        Literal:
            "<NumericLiteral>|<BooleanLiteral>|<StringLiteral>|<NullLiteral>",
        NumericLiteral: /(?:[1-9][0-9]*|0)(?:\.[0-9]*)?|\.[0-9]*/,
        BooleanLiteral: /true|false/,
        StringLiteral: /\"(?:[^"\n]|\\[\s\S])*\"|\'(?:[^'\n]|\\[\s\S])*\'/,
        NullLiteral: /null/,
        Identifer: /[a-zA-Z_$][a-zA-Z0-9_$]*/,
        Keywords: /if|else|for|function|let|var/,
        Punctuator: /\+|\-|\*|\.|\(|=|\+\+|\)|\[|\]|;|<|==|\?|\{|\}|\:|\,|=>/,
    };

    let regexp = new XRegExp(xregexp, "g", "InputElements");

    while (regexp.lastIndex < str.length) {
        let r = regexp.exec(str);

        if (r.WhiteSpace) {
        } else if (r.LineTerminator) {
        } else if (r.Comments) {
        } else if (r.SingleLineComment) {
        } else if (r.MultiLineComment) {
        } else if (r.NumericLiteral) {
            yield {
                type: "NumericLiteral",
                value: r[0],
            };
        } else if (r.BooleanLiteral) {
            yield {
                type: "BooleanLiteral",
                value: r[0],
            };
        } else if (r.StringLiteral) {
            yield {
                type: "StringLiteral",
                value: r[0],
            };
        } else if (r.NullLiteral) {
            yield {
                type: "NullLiteral",
                value: null,
            };
        } else if (r.Identifer) {
            yield {
                type: "Identifer",
                name: r[0],
            };
        } else if (r.Keywords) {
            yield {
                type: r[0],
            };
        } else if (r.Punctuator) {
            yield {
                type: r[0],
            };
        } else {
            throw new Error("Unexpected token " + r[0]);
        }

        if (!r[0].length) {
            break;
        }
    }
    yield {
        type: "EOF",
    };
}
