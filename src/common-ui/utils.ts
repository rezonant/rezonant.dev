export function wrapMethod<T extends (this: U, ...args: any) => any, U>(
    original: T,
    replacement: (original: T, ...args: Parameters<T>) => ReturnType<T>
): T {
    return <T> function(this: U, ...args: Parameters<T>) {
        return replacement(original.bind(this) as T, ...args);
    };
}

export function unindent(str : string) {
    let lastNewline = str.lastIndexOf("\n");
    let indent = str.slice(lastNewline+1).replace(/[^ ]/g, '');
    return str.split(/\n/g).map(x => x.replace(indent, '')).join("\n");
}
