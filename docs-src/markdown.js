import markdownit from 'markdown-it';
import markdownitanchor from 'markdown-it-anchor';
import markdownitattrs from 'markdown-it-attrs';
import markdownItHeaderSections from 'markdown-it-header-sections';
import markdownItTableOfContents from 'markdown-it-table-of-contents';
import markdownItDeflist from 'markdown-it-deflist';
import markdownItDiv from 'markdown-it-div';

function markdown() {
    let markdownLib = markdownit({ html: true })
        .use(markdownitanchor)
        .use(markdownitattrs)
        .use(markdownItHeaderSections)
        .use(markdownItTableOfContents, {
            "includeLevel": [2],
            "containerHeaderHtml": `<p class="toclabel">Contents:</p>`
        })
        .use(markdownItDeflist)
        .use(markdownItDiv);
    return markdownLib;
};

export default markdown;