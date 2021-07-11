let currentToken = null;
let currentAttritbute = null;

let stack = [{type: "document", children:[]}];
let currentTextNode = null;

function emit(token) {
    let top = stack[stack.length - 1];

    if(token.type === "startTag") {
        let element = {
            type: "element",
            children: [],
            attributes: []
        };

        element.tagName = token.tagName;

        for(let p in token) {
            if(p != "type" || p != "tagName") {
                element.attributes.push({
                    name: p,
                    value: token[p]
                });
            }
        }

        top.children.push(element);

        if(!token.isSelfClosing) {
            stack.push(element);
        }

        currentTextNode = null;
    } else if(token.type == "endTag") {
        if (top.tagName != token.tagName) {
            throw new Error("Tag start end doesn't match!")
        } else {
            stack.pop();
        }
        currentTextNode = null;
    } else if(token.type == "text") {
        if(currentTextNode == null) {
            currentTextNode = {
                type: "text",
                content: ""
            }
            top.children.push(currentTextNode);
        }
        currentTextNode.content += token.content;
    }
}

const EOF = Symbol("EOF");

function data(c) {
    if (c == "<") {
        return tagOpen;
    } else if(c == EOF) {
        emit({
            type: "EOF"
        });
        return;
    } else {
        emit({
            type: "text",
            content: c
        });
        return data;
    }
}

function tagOpen(c) {
    if(c == '/') {
        return endTagOpen;
    } else if(c.match(/^[a-zA-Z]$/)) {
        currentToken = {
            type: "startTag",
            tagName: ""
        };
        return tagName(c);
    } else {
        emit({
            type: "text",
            content: c
        });
        return;
    }
}

function tagName(c) {
    if(c.match(/^[\t\n\f ]$/)) {
        return beforeAttributeName;
    } else if(c == '/') {
        return isSelfClosingStartTag;
    } else if(c.match(/^[A-Z]$/)) {
        currentToken.tagName += c;
        return tagName;
    } else if(c == '>') {
        emit(currentToken);
        return data;
    } else {
        currentToken.tagName += c;
        return tagName;
    }
}

function beforeAttributeName(c) {
    if(c.match(/^[\t\n\f ]$/)) {
        return beforeAttributeName;
    } else if(c == '/' || c == '>' || c == EOF) {
        return afterAttrituteName(c);
    } else if(c == '=') {

    } else {
        currentAttribute = {
            name: "",
            value: ""
        };
        return beforeAttributeName(c);
    }
}

function attributeName(c) {
    if(c.match(/^[\t\n\f ]$/) || c == '/' || c == '>' || c === EOF) {
        return afterAttrituteName(c);
    } else if (c == "=") {
        return beforeAttributeValue;
    } else if(c == "\u0000") {

    } else if(c == '\"' || c == "'" || c == "<") {

    } else {
        currentAttribute.name += c;
        return attributeName;
    }
}

function beforeAttributeValue(c) {
    if(c.match(/^[\t\n\f ]$/) || c == '/' || c == '>' || c == EOF) {
        return beforeAttributeValue;
    } else if (c == "\"") {
        return doubleQuotedAttributeValue;
    } else if (c == "\'") {
        return singleQuotedAttributeValue;
    } else if(c == ">") {

    } else {
        return UnquotedAttributeValue(c);
    }
}

function doubleQuotedAttributeValue(c) {
    if(c == "\'") {
        currentToken[currentAttritbute.name] = currentAttritbute.value;
        return afterQuotedAttributeValue;
    } else if(c == "\u0000") {

    } else if(c == EOF) {
        currentAttritbute.value += c;
        return doubleQuotedAttributeValue;
    }
}

function singleQuotedAttributeValue(c) {
    if(c == "\'") {
        currentToken[currentAttritbute.name] = currentAttritbute.value;
        return afterQuotedAttributeValue;
    } else if(c == "\u0000") {

    } else if (c == EOF) {

    } else {
        currentAttritbute.value += c;
        return doubleQuotedAttributeValue;
    }
}

function afterQuotedAttributeValue (c) {
    if(c.match(/^[\t\n\f ]$/)) {
        return beforeAttributeName;
    } else if(c == "/") {
        return isSelfClosingStartTag;
    } else if(c == ">") {
        currentToken[currentAttribute.name] = currentAttritbute.value;
        emit(currentToken);
        return data;
    } else if(c == EOF) {

    } else {
        currentAttribute.value += c;
        return doubleQuotedAttributeValue;
    }
}

