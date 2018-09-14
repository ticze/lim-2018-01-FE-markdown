const fs = require('fs');
const path = require('path')
const linkCheck = require('link-check');
const markdownLinkExtractor = require('markdown-link-extractor');


const recDirect = (ruta, options, result) => {
  if (fs.statSync(ruta).isFile()) {
    if (path.extname(ruta) === '.md') {
      recFile(ruta, options, result)
    }
  } else {
    const data = fs.readdirSync(ruta)
    data.forEach(file => {
      const fileRec = ruta + '/' + file
      recDirect(fileRec, options, result)
    })
  }
}


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
        return reject(err);
      }
      resolve({ Link: result.link, Status: result.statusCode });
    });
  })
}
const onlyLinks = (link) => {
  return [...new Set(link)];
}
const valiStats = (ruta) => {
  return new Promise((resolve, reject) => {
    extracLinks(ruta)
      .then(arrLink => {
        const arrNewLinks = arrLink.map(uniqueLink => {
          return uniqueLink.href
        })
        let arrPromise = [];
        arrNewLinks.forEach(link => {
          arrPromise.push(checkLinks(link))
        })
        return Promise.all(arrPromise)
          .then(valLink => {
            let broken = 0;
            valLink.forEach(linkStatus => {
              if (linkStatus.Status !== 200) {
                // console.log(linkStatus.Status)
                return broken++;
              }
            })
            resolve({
              Total: arrNewLinks.length,
               Unique: onlyLinks(arrNewLinks).length, 
               Borken : broken
            })
          })
      })
  })
}
const stat = (ruta) => {
  return new Promise((resolve, reject) => {
    extracLinks(ruta)
      .then(arrLink => {
        const arrNewLinks = arrLink.map(uniqueLink => {
          return uniqueLink.href
        })
        resolve({
          Total: arrNewLinks.length, 
          Unique: onlyLinks(arrNewLinks).length
        })
      })
  })
}
const validate = (ruta) => {
  return new Promise((resolve, reject) => {
    resolve(extracLinks(ruta)
      .then(links => {
        let arrPromise = [];
        links.forEach((link) => {
          arrPromise.push(checkLinks(link.href))
        })
        return Promise.all(arrPromise)
      })
    )
  })
}

const recFile = (ruta, options, result) => {
  let toReturn;
  if (!options.validate && !options.stats) {
    toReturn = extracLinks(ruta)
  } else if (options.validate && !options.stats) {
    toReturn = validate(ruta);
  } else if (!options.validate && options.stats) {
    toReturn = stat(ruta);
  } else if (options.validate && options.stats) {
    toReturn = valiStats(ruta);
  }
  result.push(toReturn)
}

const mdLinks = (path, options) => {
  return new Promise((resolve, reject) => {
    const result = []
    recDirect(path, options, result)
    Promise.all(result).then(resolve)
  })
}
module.exports = mdLinks;
