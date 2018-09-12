const fs = require('fs');
const linkCheck = require('link-check');
const markdownLinkExtractor = require('markdown-link-extractor');


const recDirect = (ruta, options) => {
  fs.readdir(ruta, (err, data) => {
    data.forEach(file => {
      const fileRec = ruta + '/' + file
      fs.stat(fileRec, (err, stats) => {
        if (stats.isDirectory()) {
          return recDirect(fileRec)
        } else if (stats.isFile()) {
          return recFile(fileRec, options)
        }
      })
    })
  })
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
        reject(err);
      }
      resolve({ link: result.link, status: result.statusCode });
    });
  })
}
const onlyLinks = (link) => {
  return [...new Set(link)];
}
const valiStats = (ruta) => {
  return new Promise((resolve, reject) => {
    resolve(extracLinks(ruta)
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
              if (linkStatus.status !== 200) {
                return broken++;
              }
            })
            console.log(`Total: ${arrNewLinks.length}\nUnique: ${onlyLinks(arrNewLinks).length}\nBorken:${broken}`)
          })
      }))
  })
}
const stat = (ruta) => {
  return new Promise((resolve, reject) => {
    resolve(extracLinks(ruta)
      .then(arrLink => {
        const arrNewLinks = arrLink.map(uniqueLink => {
          return uniqueLink.href
        })
        console.log(`Total: ${arrNewLinks.length}\nUnique: ${onlyLinks(arrNewLinks).length}`)
      })
    )
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

const recFile = (ruta, options) => {
  if (!options.validate && !options.stats) {
    return extracLinks(ruta)
  } else if (options.validate && !options.stats) {
    return validate(ruta);
  } else if (!options.validate && options.stats) {
    return stat(ruta);
  } else if (options.validate && options.stats) {
    return valiStats(ruta);
  }
}

const mdLinks = (path, options) => {
  return new Promise((resolve, reject) => {
    fs.stat(path, (err, stats) => {
      if (stats.isFile()) {
        resolve(recFile(path, options))
      } else if (stats.isDirectory()) {
        recDirect(path, options)
      }
    })
  })
}
module.exports = mdLinks;
