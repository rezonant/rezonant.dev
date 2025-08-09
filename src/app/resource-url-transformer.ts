export function resourceUrlTransformer(getPath: () => string): (url: string) => string {
    return url => {
        if (url.startsWith('https:'))
            return url;

        let currentPath = '/' + getPath().split('/').slice(0, -1).join('/').replace(/^\/*/, '');

        if (url.startsWith(`/public/resources/`)) {
            currentPath = '';
            url = url.replace(/\/public\/resources\//, '');
        }

        console.log(`start: ${currentPath}`);
        if (url.endsWith('.md')) {
            url = url.replace(/\.md$/, '');

            while (url.startsWith('../')) {
                currentPath = currentPath.split('/').slice(0, -1).join('/');
                url = url.slice(3);
                console.log(`PARENT: ${currentPath}`);
            }

            console.log(`FINAL: ${currentPath}`);
            console.log(` PLUS: ${url}`);

            if (url.startsWith('./')) {
                url = url.slice(2);
            }

            url = `${currentPath}/${url}`.replace(/\/+/g, '/');
        }

        url = `/resources/${url}`.replace(/\/+/g, '/');
        console.log(`RESULT: ${url}`);
        return url;
    };
}
