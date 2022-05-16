import { createContext, useContext } from "react";

const LanguageContext = createContext(null);

export default function useLang(lang) {

    const ctx = useContext(LanguageContext);

    if(!ctx) {
        throw new Error('useLang must be used within a LanguageProvider');
    }

    const context = ctx.context
    const language = lang ? lang : ctx.lang

    if(!context[language]) return createLang(language, context);
    return context[language];
}

export function LanguageProvider({children, context={}, lang='en'}) {
    return (
        <LanguageContext.Provider value={{'context': createProxy(context), lang}}>
            {children}
        </LanguageContext.Provider>
    )
}

function createLang(content, lang) {
    return new Proxy(content, {
        get: function(target, prop) {
            if(!target[prop]) {
                console.warn(`\x1b[33mMissing translation for '${prop}' in '${lang}'\x1b[0m`);
                if(lang !== 'en') {
                    const en = useLang('en')
                    return en[prop] || prop;
                }
                else return prop;
            }else return target[prop];
        },
        set: function(target, prop, value) {
            target[prop] = value;
            return true;
        }
    })
}

function createProxy(content) {
    const result = {}
    Object.keys(content).forEach(key => {
        result[key] = createLang(content[key], key);
    })
    return result;
}