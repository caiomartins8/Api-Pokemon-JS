let nomepokemon = document.getElementById('poke-nome');
let imgpokemon = document.getElementById('poke-img'); // corrigi o ID aqui que vc tinha arrumado no HTML
//variavel puxando nome e img do html
let inputpokemon = document.getElementById('poke-input');
let btnpokemon = document.getElementById('poke-btn');

btnpokemon.addEventListener('click', buscarPokemon);
//adiciona evento de click no botao para chamar a funcao buscarPokemon

async function buscarPokemon() {
    //funcao assincrona para buscar o pokemon na api
    const resposta = await fetch(`https://pokeapi.co/api/v2/pokemon/${inputpokemon.value.toLowerCase()}`);
    //fetch busca o pokemon na api usando o valor do input , tolowercase converte o valor pra minusculo
    


    if (resposta.ok) {
        const dados = await resposta.json();
        //converte a resposta para json
        
        nomepokemon.innerHTML = dados.name;
        //coloca o nome do pokemon no html
        imgpokemon.src = dados.sprites.front_default;
        // o sprites serve para acessar as imagens do pokemon e
        //  o front_default e a imagem padrao do pokemon
        
        //se a resposta for ok , coloca o nome e a imagem do pokemon no html
    } else {
        nomepokemon.innerHTML = "Pokemon nao encontrado";
        imgpokemon.src = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png";
        //se a resposta nao for ok , mostra a mensagem de erro e uma imagem padrao
    }
}
