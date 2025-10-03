
export const Variables = async () => {
    if (typeof process === 'undefined' || !process.versions?.node) return {}

    const fs = (await import('fs/promises')) 
    const path = (await import('path'))
    const chokidar = (await import('chokidar')) 

    const PAGES_DIR = path.resolve('src/pages');
    const GEN_DIR = path.resolve('src/gen');
    const ROUTES_DIR = path.resolve('src/routes');
    const OUTPUT_FILE = path.join(GEN_DIR, 'tsrouter.gen.ts');
    const ROOT_FILE = path.join(ROUTES_DIR, '__root.ts');

    const isDev = process.env.NODE_ENV !== 'production';

    return { PAGES_DIR, GEN_DIR, ROUTES_DIR, OUTPUT_FILE, ROOT_FILE, isDev, fs, chokidar, path };
};
