const mdLinks = require('../index');
const options = {
  validate: false,
  stats: false
}

test('mdLinks deberia ser Promise', () => {
	return expect(mdLinks('test/src/index.md', options)).toBeInstanceOf(Promise);
});

test('Deberia retornar [{Total : 2, Unique: 2}]', () => {
	const options ={
		validate : false,
		stats : true
	}
 return expect(Promise.resolve(mdLinks('test', options))).resolves.toMatchSnapshot();
});

test('Deberia retornar [[{Link : https//..., Status : 200 || !200 }]]', () => {
	const options ={
		validate : true,
		stats : false
	}
 return expect(Promise.resolve(mdLinks('test', options))).resolves.toEqual([[ { Link: 'https://github.com/AnaSalazar/curricula-js/blob/04-social-network/04-social-network/02-jquery/08-code-challenges/foodmap/2.jpg?raw=true',
 Status: 200 },
{ Link: 'https://AnaSalazar/curricula-js/blob/04-social-network/04-social-network/02-jquery/08-code-challenges/foodmap/splash.jpg?raw=true',
 Status: 0 } ]]);
});

test('Deberia retornar [{Total : 2, Unique : 2, Borken : 1}]', () => {
	const options ={
		validate : true,
		stats : true
	}
 return expect(Promise.resolve(mdLinks('test', options))).resolves.toMatchSnapshot();
});