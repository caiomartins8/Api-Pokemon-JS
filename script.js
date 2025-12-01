
const nomepokemon = document.getElementById('poke-nome');
const imgpokemon = document.getElementById('poke-img');
const inputpokemon = document.getElementById('poke-input');
const btnpokemon = document.getElementById('poke-btn');
const typescontainer = document.getElementById('poke-types');
const pokecontent = document.getElementById('poke-content'); 
const errormsg = document.getElementById('error-msg');

// pegando os elementos dos status (hp, ataque, defesa) +
const hpval = document.getElementById('hp-val');
const atkval = document.getElementById('atk-val');
const defval = document.getElementById('def-val');

// quando clicar no botao, chama a funcao buscarpokemon
btnpokemon.addEventListener('click', buscarpokemon);

// se a pessoa apertar 'enter' dentro da caixinha, tambem busca
inputpokemon.addEventListener('keypress', function(e) { 
    if(e.key === 'Enter') {
        buscarpokemon();
    }
});


async function buscarpokemon() {
    
    // limpando mensagens de erro antigas
    errormsg.innerText = "";
    
    // avisando no botao que o computador esta pensando
    btnpokemon.innerText = "buscando...";
    
    // deixando a imagem meio transparente enquanto carrega
    imgpokemon.style.opacity = 0.5; 

    try {
        // pega o que a pessoa digitou e transforma tudo pra minusculo
        // porque a api so entende letras minusculas
        const valorinput = inputpokemon.value.toLowerCase();

        // se a pessoa nao digitou nada, para tudo e avisa
        if(!valorinput) {
            throw new Error("digite um nome!");
        }
        
        // o fetch vai la no site da pokeapi buscar os dados
        // o await diz: "espera a resposta chegar antes de continuar"
        const resposta = await fetch(`https://pokeapi.co/api/v2/pokemon/${valorinput}`);

        // se a resposta for positiva (o pokemon existe)
        if (resposta.ok) {
            // transforma os dados que chegaram em algo que o js entende (json)
            const dados = await resposta.json();

            // mostra a caixa de conteudo que estava escondida
            pokecontent.classList.remove('hidden');
            
            // descobre qual e o primeiro tipo do pokemon (ex: fire)
            const maintype = dados.types[0].type.name; 
            
            // limpa qualquer classe de cor que estava antes no corpo do site
            document.body.className = ''; 
            
            // adiciona a classe nova (ex: body class="fire")
            // isso vai ativar aquele css colorido que a gente fez
            document.body.classList.add(maintype);
            
            // coloca o nome do pokemon na tela
            nomepokemon.innerHTML = dados.name;
            
            // pega a imagem 3d bonitona (other -> home) e coloca na tela
            imgpokemon.src = dados.sprites.other.home.front_default;
            
            // deixa a imagem totalmente visivel agora que carregou
            imgpokemon.style.opacity = 1;
            
            // limpa os tipos do pokemon anterior
            typescontainer.innerHTML = ''; 
            
            // para cada tipo que esse pokemon tiver...
            dados.types.forEach(t => {
                // cria uma etiqueta nova (span)
                const badge = document.createElement('span');
                
                // coloca a classe de estilo nela
                badge.className = 'type-badge';
                
                // escreve o nome do tipo dentro dela
                badge.innerText = t.type.name;
                
                // coloca essa etiqueta dentro da div de tipos
                typescontainer.appendChild(badge);
            });

            // o stats[0] e sempre o hp
            hpval.innerText = dados.stats[0].base_stat;
            
            // o stats[1] e sempre o ataque
            atkval.innerText = dados.stats[1].base_stat;
            
            // o stats[2] e sempre a defesa
            defval.innerText = dados.stats[2].base_stat;

        } else {
            // se a resposta nao for ok, cria um erro pra cair la embaixo no catch
            throw new Error("pokemon nao encontrado.");
        }
        
    } catch (erro) {
        
        // tira as cores do fundo e volta pro cinza padrao
        document.body.className = ''; 
        
        // esconde a caixa de conteudo de novo
        pokecontent.classList.add('hidden');
        
        // escreve qual foi o erro na tela pro usuario ver
        errormsg.innerText = erro.message;
        
    } finally {
        
        // volta o texto do botao pro normal
        btnpokemon.innerText = "buscar";
    }
}