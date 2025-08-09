export function wrapMethod<T extends (this: U, ...args: any) => any, U>(
    original: T,
    replacement: (original: T, ...args: Parameters<T>) => ReturnType<T>
): T {
    return <T> function(this: U, ...args: Parameters<T>) {
        return replacement(original.bind(this) as T, ...args);
    };
}
