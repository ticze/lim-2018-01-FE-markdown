const fs = require('fs');
const linkCheck = require('link-check');
const markdownLinkExtractor = require('markdown-link-extractor');

const extracLinks = (ruta) => {
  return new Promise((resolve, reject) => {
    const markdown = fs.readFileSync(ruta).toString(); 
    const links = markdownLinkExtractor(markdown);
    resolve(links)
  })
}
const checkLinks = (link) => {
  return new Promise((resolve, reject) => {
    linkCheck(link, function (err, result) {
      if (err) {
        reject(err);
      }
      resolve({ link: result.link, status: result.statusCode });
    });
  })
}
const onlyLinks = (link) => {
  return [...new Set(link)];
}
const valiStats = (ruta) =>{
  return new Promise((resolve,reject)=>{
    resolve(extracLinks(ruta)
    .then(arrLink =>{
      const arrNewLinks = arrLink.map(uniqueLink =>{
        return uniqueLink.href
      })
      let arrPromise = [];
      arrNewLinks.forEach(link => {
        arrPromise.push(checkLinks(link))
      })
      Promise.all(arrPromise)
        .then(valLink =>{
          let broken = 0;
          if (valLink.status !== 200){
            broken++
          }
          console.log(`Total: ${arrNewLinks.length}\nUnique: ${onlyLinks(arrNewLinks).length}\nBorken:${broken}`)
        })
    }))
  })
}
const stat = (ruta) =>{
  return new Promise((resolve,reject)=>{
    resolve(extracLinks(ruta)
      .then(arrLink => {
        const arrNewLinks = arrLink.map(uniqueLink =>{
          return uniqueLink.href
        })
        console.log(`Total: ${arrNewLinks.length}\nUnique: ${onlyLinks(arrNewLinks).length}`)
      })
    )
  })
}
const validate = (ruta) =>{
  return new Promise((resolve,reject)=>{
      resolve(extracLinks(ruta)
        .then(links => {
          let arrPromise = [];
          links.forEach((link) => {
            arrPromise.push(checkLinks(link.href))
          })
          Promise.all(arrPromise)
            .then(console.log)
      })) 
  })  
}

const mdLinks = (path,options) => {
  return new Promise((resolve, reject) => {
    fs.stat(path, (err, stats) => {
      if (stats.isFile()) {
        if (!options.validate && !options.stats) {
          extracLinks(path).then(console.log)
        } else if(options.validate && !options.stats){
          validate(path);
        } else if(!options.validate && options.stats){
          stat(path);
        }else if(options.validate && options.stats){
          valiStats(path);
        }
      }else if(stats.isDirectory()){
        console.log('hiiiiiiiiiiiiiiiii')
      }
    })
  })
}
module.exports = mdLinks;