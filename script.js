// --- pegando os elementos do html ---
const nomepokemon = document.getElementById('poke-nome');
const imgpokemon = document.getElementById('poke-img');
const codnum = document.getElementById('poke-cod-num');
const inputpokemon = document.getElementById('poke-input');
const btnpokemon = document.getElementById('poke-btn');
const typescontainer = document.getElementById('poke-types');
const pokecontent = document.getElementById('poke-content');
const errormsg = document.getElementById('error-msg');

const audiobtn = document.getElementById('audio-btn');
const audioelement = document.getElementById('poke-audio');
const btnprev = document.querySelector('.nav-btn.prev');
const btnnext = document.querySelector('.nav-btn.next');

const hpval = document.getElementById('hp-val');
const atkval = document.getElementById('atk-val');
const defval = document.getElementById('def-val');


// variaveis de controle do carrossel (evolucao) 
let currentspriteindex = 0;
let spriteslist = []; // guarda as imagens da familia toda
let nameslist = []; // guarda os nomes da familia pra atualizar o titulo


// ao clicar em buscar, roda a funcao principal
btnpokemon.addEventListener('click', buscarpokemon);

// se der enter na caixa de texto, busca tambem
inputpokemon.addEventListener('keypress', (e) => { if (e.key === 'Enter') buscarpokemon(); });

// ao clicar no botao de som, toca o grito do bicho
audiobtn.addEventListener('click', () => {
    // so toca se ja tiver carregado algum audio
    if (audioelement.src) audioelement.play();
});

// botoes de navegar entre as evolucoes
btnnext.addEventListener('click', shownextsprite);
btnprev.addEventListener('click', showprevsprite);

function updatesprite() {
    // deixa meio transparente pra dar efeito de troca
    imgpokemon.style.opacity = 0.5;

    // espera um pouquinho (200ms) pra trocar a foto e o texto
    setTimeout(() => {
        // troca a imagem pela que ta na lista no indice atual
        imgpokemon.src = spriteslist[currentspriteindex];

        // troca o nome la em cima tambem (ex: mudou de charmander pra charmeleon)
        nomepokemon.innerHTML = nameslist[currentspriteindex];

        // volta a opacidade pro normal (visivel)
        imgpokemon.style.opacity = 1;
    }, 200);
}

function shownextsprite() {
    // aumenta o numero do indice pra ir pro proximo
    currentspriteindex++;

    // se passou do ultimo, volta pro primeiro (loop infinito)
    if (currentspriteindex >= spriteslist.length) currentspriteindex = 0;

    // chama a funcao que atualiza a tela
    updatesprite();
}

function showprevsprite() {
    // diminui o numero do indice pra voltar
    currentspriteindex--;

    // se for menor que zero, vai pro ultimo da lista (loop infinito reverso)
    if (currentspriteindex < 0) currentspriteindex = spriteslist.length - 1;

    // chama a funcao que atualiza a tela
    updatesprite();
}


// --- funcao principal ---

async function buscarpokemon() {
    // limpa erro antigo se tiver
    errormsg.innerText = "";

    // avisa no botao que ta trabalhando
    btnpokemon.innerText = "buscando...";

    // deixa a imagem atual transparente
    imgpokemon.style.opacity = 0.5;

    try {
        // pega o texto e deixa minusculo pra api aceitar
        const valorinput = inputpokemon.value.toLowerCase();

        // se nao digitou nada, para tudo
        if (!valorinput) throw new Error("digite um nome!");

        //  busca o pokemon principal na api
        const resposta = await fetch(`https://pokeapi.co/api/v2/pokemon/${valorinput}`);

        // se a resposta foi sucesso (200 ok)
        if (resposta.ok) {
            // transforma a resposta em objeto javascript
            const dados = await resposta.json();

            // mostra a div de conteudo que tava escondida
            pokecontent.classList.remove('hidden');

            // pega o primeiro tipo (ex: fire, water)
            const maintype = dados.types[0].type.name;

            // reseta as classes do body
            document.body.className = '';

            // aplica a cor do tipo no fundo
            document.body.classList.add(maintype);

            // formata o numero do id com 3 digitos (ex: #001)
            codnum.innerHTML = `#${dados.id.toString().padStart(3, '0')}`;

            // audio - pega o grito mais recente
            audioelement.src = dados.cries.latest;
            // deixa o volume na metade pra nao assustar
            audioelement.volume = 0.5;

            // tipos - limpa os antigos
            typescontainer.innerHTML = '';

            // cria as etiquetas dos tipos
            dados.types.forEach(t => {
                const badge = document.createElement('span');
                badge.className = 'type-badge';
                badge.innerText = t.type.name;
                typescontainer.appendChild(badge);
            });

            // status - preenche os numeros de batalha
            hpval.innerText = dados.stats[0].base_stat;
            atkval.innerText = dados.stats[1].base_stat;
            defval.innerText = dados.stats[2].base_stat;

            // avisa que ta carregando as evolucoes
            nomepokemon.innerHTML = "carregando familia...";

            // pega a especie pra achar a arvore genealogica
            const resSpecies = await fetch(dados.species.url);
            const speciesData = await resSpecies.json();

            //  pega a arvore de evolucao usando o link que veio na especie
            const resEvo = await fetch(speciesData.evolution_chain.url);
            const evoData = await resEvo.json();

            //  cria uma lista com os nomes de todas as evolucoes
            // chamei uma funcao auxiliar la embaixo pra desenrolar a arvore
            const evoNames = getEvoChainNames(evoData.chain);

            // passo d: busca a imagem de cada um deles
            // isso aqui faz varias buscas ao mesmo tempo (promise.all) pra ser rapido
            const promises = evoNames.map(async (name) => {
                const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
                const d = await res.json();
                // retorna a imagem 3d bonita, se nao tiver usa a padrao
                return d.sprites.other.home.front_default || d.sprites.front_default;
            });

            // espera todas as imagens chegarem do servidor
            spriteslist = await Promise.all(promises);
            // guarda os nomes tambem numa lista global
            nameslist = evoNames;

            // descobre onde o pokemon pesquisado ta na lista (pra comecar nele)
            // se pesquisou charmeleon, o index vai ser 1
            const indexDoAtual = nameslist.indexOf(dados.name);

            // garante que o indice e valido
            currentspriteindex = indexDoAtual >= 0 ? indexDoAtual : 0;

            // mostra na tela a imagem e o nome correto
            nomepokemon.innerHTML = nameslist[currentspriteindex];
            imgpokemon.src = spriteslist[currentspriteindex];
            imgpokemon.style.opacity = 1;

        } else {
            // se nao achou o pokemon na api
            throw new Error("pokemon nao encontrado.");
        }
    } catch (erro) {
        // se der qualquer erro, reseta o fundo
        document.body.className = '';
        // esconde o conteudo
        pokecontent.classList.add('hidden');
        // mostra a mensagem de erro
        errormsg.innerText = erro.message;
    } finally {
        // volta o texto do botao ao normal
        btnpokemon.innerText = "buscar";
    }
}
// essa funcao e recursiva (ela chama ela mesma) pra descer na arvore
function getEvoChainNames(chain) {
    let evos = [];
    // adiciona o nome atual (ex: bulbasaur) na lista temporaria
    evos.push(chain.species.name);

    // se tiver evolucao, entra nela e repete o processo
    if (chain.evolves_to.length > 0) {
        // usa um loop porque alguns tem varias evolucoes (tipo eevee)
        for (let i = 0; i < chain.evolves_to.length; i++) {
            // junta o que achou com a lista principal
            // aqui que a magica acontece chamando a funcao de novo
            evos = evos.concat(getEvoChainNames(chain.evolves_to[i]));
        }
    }
    // devolve a lista completa
    return evos;
}