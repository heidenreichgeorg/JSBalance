const content = {}

export default function useLang(lang='en') {
    if(!content[lang]) return createLang(lang);
    return content[lang];
}

export function createLang(lang,content={}) {
    content[lang] = new Proxy(content, {
        get: function(target, prop) {
            if(!target[prop]) {
                console.warn(`\x1b[33mMissing translation for '${prop}' in '${lang}'\x1b[0m`);
                if(lang !== 'en') return content['en'][prop];
            }else return target[prop];
        },
        set: function(target, prop, value) {
            target[prop] = value;
            return true;
        }
    });
    return content[lang];
}