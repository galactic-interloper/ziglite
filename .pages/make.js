import fs from 'fs';
import path from 'path';
import child_process from 'child_process'
import { fileURLToPath } from 'url';
import { marked } from 'marked';
import {baseUrl} from "marked-base-url";

const relative_path = (p) => path.join(path.dirname(fileURLToPath(import.meta.url)), p ?? '');

const current_branch = child_process.execSync('git branch --show-current', { encoding: 'utf8'});
const template = fs.readFileSync(relative_path('index.template.html'), 'utf8');
const readme = fs.readFileSync(relative_path('../README.md'), 'utf8');

const renderer = {
    heading(text, level) {
        const anchor = text.toLowerCase()
            .replace(/[!?]+/g, '')
            .trim()
            .replace(/[^\w]+/g, '-')
        return `<h${level} id="${anchor}">${text}</h${level}>`;
    },

    link(href, title, text) {
        const target = href.startsWith('#') ? '' : 'target="_blank"';

        return `<a href="${href}" ${target}>${text}</a>`;
    },
};

marked.use(
    {
        gfm: true,
        renderer: renderer,
    },
    baseUrl(`https://github.com/spatian-dev/ziglite/blob/${current_branch}/`)
);

const compiled = marked.parse(readme).replace(/^<h1.+>.*<\/h1>/, '');

fs.writeFileSync(relative_path('index.html'), template.replace('%%content%%', compiled));
