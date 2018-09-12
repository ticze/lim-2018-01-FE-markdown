const mdLinks = require('../index');
// jest.setTimeout(10000); 
const options = {
  validate: false,
  stats: false
}

test('mdLinks deberia ser Promise', () => {
	return expect(mdLinks('test/src/index.md', options)).toBeInstanceOf(Promise);
});

test('resolver mdLinks(test/src/index.md, options) -> options.stats = true && options.validate = false', () => {
	const options ={
		validate : false,
		stats : true
	}
 return expect(Promise.resolve(mdLinks('test/src/index.md', options))).resolves.toMatchSnapshot();
});

test('resolver mdLinks(test/src/index.md, options) -> options.stats = false && options.validate = true', () => {
	const options ={
		validate : true,
		stats : false
	}
 return expect(Promise.resolve(mdLinks('test/src/index.md', options))).resolves.toEqual([ { link: 'https://github.com/AnaSalazar/curricula-js/blob/04-social-network/04-social-network/02-jquery/08-code-challenges/foodmap/2.jpg?raw=true',
 status: 200 },
{ link: 'https://AnaSalazar/curricula-js/blob/04-social-network/04-social-network/02-jquery/08-code-challenges/foodmap/splash.jpg?raw=true',
 status: 0 } ]);
});

test('resolver mdLinks(test/src/index.md, options) -> options.stats = true && options.validate = true', () => {
	const options ={
		validate : true,
		stats : true
	}
 return expect(Promise.resolve(mdLinks('test/src/index.md', options))).resolves.toMatchSnapshot();
});