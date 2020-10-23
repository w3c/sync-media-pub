const Entities = require('html-entities').AllHtmlEntities;

module.exports = function(eleventyConfig) {
    let options = {
        html: true
    };
    let markdownLib = require("markdown-it")(options)
        .use(require("markdown-it-anchor"))
        .use(require("markdown-it-attrs"))
        .use(require('markdown-it-header-sections'))
        .use(require("markdown-it-table-of-contents"), 
            {
                "includeLevel": [2],
                "containerHeaderHtml": `<p class="toclabel">Contents:<p>`
            }
        )
        .use(require("markdown-it-deflist"))
        .use(require("markdown-it-div"));
    
    eleventyConfig.setLibrary("md", markdownLib);

    eleventyConfig.addPassthroughCopy({"css": "css"});

    eleventyConfig.addFilter('dump', obj => {
        return util.inspect(obj)
    });

    eleventyConfig.addPairedShortcode("example", (content, title) => {
        const entities = new Entities();
        return `<pre class="example" title="${title}">${entities.encode(content)}</pre>`;
    });
    
    return {
        dir: {
            input: "pages",
            output: "../docs/new",
            includes: "../_layout"
        }
    };
  };