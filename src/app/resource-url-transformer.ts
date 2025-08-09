export function resourceUrlTransformer(getPath: () => string): (url: string) => string {
    return url => {
        if (url.startsWith('https:'))
            return url;

        let currentPath = '/' + getPath().split('/').slice(0, -1).join('/').replace(/^\/*/, '');

        if (url.startsWith(`/public/resources/`)) {
            currentPath = '';
            url = url.replace(/\/public\/resources\//, '');
        }

        if (url.endsWith('.md')) {
            url = url.replace(/\.md$/, '');

            while (url.startsWith('../')) {
                currentPath = currentPath.split('/').slice(0, -1).join('/');
                url = url.slice(3);
            }

            if (url.startsWith('./')) {
                url = url.slice(2);
            }

            url = `${currentPath}/${url}`.replace(/\/+/g, '/');
        }

        url = `/resources/${url}`.replace(/\/+/g, '/');
        return url;
    };
}
