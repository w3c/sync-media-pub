const moment = require("moment");
module.exports = function(eleventyConfig) {
    let options = {
        html: true
    };
    let markdownLib = require("markdown-it")(options)
        .use(require("markdown-it-anchor"))
        .use(require("markdown-it-attrs"))
        .use(require('markdown-it-header-sections'))
        .use(require("markdown-it-table-of-contents"))
        .use(require("markdown-it-deflist"), 
            {
                "includeLevel": [2],
                "containerHeaderHtml": `<p class="toclabel">Contents:<p>`
            });
    
    eleventyConfig.setLibrary("md", markdownLib);

    eleventyConfig.addPassthroughCopy({"css": "css"});

    eleventyConfig.addFilter("readableDate", (dateObj, format) => 
        format === "calendar" ? moment(dateObj).calendar()
            .replace("Today", "today")
            .replace("Yesterday", "yesterday")
            : moment(dateObj).format(format)
    );

    eleventyConfig.addFilter('dump', obj => {
        return util.inspect(obj)
    });
    
    return {
        dir: {
            input: "pages",
            output: "../docs/new",
            includes: "../_layout"
        }
    };
  };