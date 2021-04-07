const glob = require("glob");
const fs = require("fs");

/**
 * auto generate urls from current build, on pakage.json 
 * "scripts": { 
 *    "build": "react-scripts build && node sw-cache-generator", 
 * }
 * 
 */

function getDirectories(src, callback) {
  glob(src + '/**/*.!(json)*', callback);
};

function makeHash(length) {
  var result = [];
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result.push(characters.charAt(Math.floor(Math.random() *
      charactersLength)));
  }
  return result.join('');
}

getDirectories('build', async function (err, res) {

  const version = 'my-frete-' + makeHash(5);
  const swScript = fs.readFileSync('./public/service-worker.js').toString();
  const cacheArray = res.map(e => e.replace('build/', '/'));

  console.log(`generated ${cacheArray.length} files to cache in ${version}`);

  var modSwScript = swScript
    .replace("['/','/styles/styles.css','/script/webpack-bundle.js']", JSON.stringify(cacheArray, null, 4))
    .replace('@cacheName', version)
    .toString();



  await fs.writeFileSync('./build/service-worker.js', modSwScript)

});
