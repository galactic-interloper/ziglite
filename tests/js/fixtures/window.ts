export const location = (
    scheme: string|undefined, host: string|undefined, port: number|undefined,
    path: string|undefined, query: string|undefined, hash: string|undefined
) => ({
    location: {
        hash: `${hash !== undefined ? `#${hash}` : ''}`,
        host: (host ?? '') + (port !== undefined ? `:${port}` : ''),
        hostname: host ?? '',
        href:
            `${scheme ?? 'https:'}//${host ?? ''}${(port !== undefined ? `:${port}` : '')}` +
            `/${path ?? ''}?${query}${hash !== undefined ? `#${hash}` : ''}`,
        origin: `${scheme ?? 'https:'}//${host ?? ''}${(port !== undefined ? `:${port}` : '')}`,
        pathname: "/" + (path ?? ''),
        port: port,
        protocol: scheme ?? 'https:',
        search: query !== undefined ? `?${query}` : '',
    }
});
