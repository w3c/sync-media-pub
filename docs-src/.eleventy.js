import { AllHtmlEntities } from 'html-entities'; 
import prettier from "prettier";
import path from "path";
import { default as markdown } from './markdown.js';

function init(eleventyConfig) {
    eleventyConfig.setLibrary("md", markdown());
    eleventyConfig.addPassthroughCopy({"css": "css"});
    eleventyConfig.addPassthroughCopy({"demos/raven": "demos/raven"});
    eleventyConfig.addPassthroughCopy({"convert-smil": "convert-smil"});

    eleventyConfig.addFilter('dump', obj => {
        return util.inspect(obj)
    });
    eleventyConfig.addFilter('json', value => {
        const jsonString = JSON.stringify(value, null, 4).replace(/</g, '\\u003c')
        return jsonString;
    });

    eleventyConfig.addPairedShortcode("example", (content, title) => {
        const entities = new AllHtmlEntities();
        return `<pre class="example" title="${title}">${entities.encode(content)}</pre>`;
    });

    eleventyConfig.addTransform("prettier", function (content, outputPath) {
        const extname = path.extname(outputPath);
        switch (extname) {
          case ".html":
          case ".json":
            // Strip leading period from extension and use as the Prettier parser.
            const parser = extname.replace(/^./, "");
            return prettier.format(content, { parser, tabWidth: 4 });
    
          default:
            return content;
        }
    });
    if (process.env.HTTPS) {
        eleventyConfig.setServerOptions({
            https: {
                key: "./localhost.key",
                cert: "./localhost.cert",
            },
            showVersion: true,
        });
    }


    return {
        dir: {
            input: "pages",
            output: "../docs",
            includes: "../_layout"
        }
    };
  };

  export default init;