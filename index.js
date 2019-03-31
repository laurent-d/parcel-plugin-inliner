const fs = require("fs");
const postHTML = require("posthtml");
const posthtmlInlineAssets = require("posthtml-inline-assets");

module.exports = bundler => {
  bundler.on("bundled", (bundle) => {
    const bundles = Array.from(bundle.childBundles).concat([bundle]);
    return Promise.all(bundles.map(async bundle => {
      if (!bundle.entryAsset || bundle.entryAsset.type !== "html") return;
    
      const cwd = bundle.entryAsset.options.outDir;
      const data = fs.readFileSync(bundle.name);
      const result = await postHTML([posthtmlInlineAssets({
        transforms: {
          script: {
            resolve(node) {
              // transform <script src="file.js"> but not <script src="file.js" type>
              return node.tag === 'script' && node.attrs && !node.attrs.type && node.attrs.src;
            }
          }
        }
        cwd,
        errors: 'ignore',
      })]).process(data);
      fs.writeFileSync(bundle.name, result.html);
    }));
  });
};
