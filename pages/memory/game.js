const grid = document.querySelector('.grid');
const timer = document.querySelector('.timer');
const matchSound = document.getElementById('match-sound');
const gameSound = document.getElementById('game-sound');
const nameDiv = document.querySelector('.name');

let firstcard = null;
let secondcard = null;
let loop = null;

matchSound.volume = 0.5;
gameSound.volume = 0.45;

const characters = [
    'carro', 
    'aviao',
    'caminhao',
    'energia',
    'moto',
    'navio',
    'onibus',
    'planeta',
    'bike',
    'foguete',
    'trem',
    'helicoptero'
];

const params = new URLSearchParams(window.location.search);
const playerName = params.get('name') || "Jogador";
const nivel = params.get('nivel') || "medio"; // padrão médio

nameDiv.textContent = `Jogador: ${playerName}`;

// Nova configuração de níveis
const config = {
    facil: { pairs: 6, time: 90 },
    medio: { pairs: 9, time: 75 },
    dificil: { pairs: 12, time: 30}
};

function playGameSound() {
    gameSound.play();
}

function playMatchSound() {
    matchSound.play();
}

const createElement = (tag, className) => {
    const element = document.createElement(tag);
    element.className = className;
    return element;
}

const checkEndGame = () => {
    const disabledCards = document.querySelectorAll('.disabled-card');
    if (disabledCards.length === config[nivel].pairs * 2) {
        clearInterval(loop);
        const timeElapsed = config[nivel].time - parseInt(timer.innerHTML);
         salvarPontuacao(playerName, nivel);
        alert(`Parabéns ${playerName}! Você ganhou um brinde!`);
        saveTime(timeElapsed);
        updateRanking();
    }
}

const checkCards = () => {
    const firstObject = firstcard.getAttribute('data-object');
    const secondObject = secondcard.getAttribute('data-object');
    if (firstObject === secondObject) {
        firstcard.classList.add('disabled-card');
        secondcard.classList.add('disabled-card');
        firstcard = null;
        secondcard = null;
        checkEndGame();
        playMatchSound();
    } else {
        setTimeout(() => {
            firstcard.classList.remove('reveal-card');
            secondcard.classList.remove('reveal-card');
            firstcard = null;
            secondcard = null;
        }, 1000);
    }
}

const revealCard = ({target}) => {
    if (target.parentNode.classList.contains('reveal-card')) return;

    if (!firstcard) {
        target.parentNode.classList.add('reveal-card');
        firstcard = target.parentNode;
    } else if (!secondcard) {
        target.parentNode.classList.add('reveal-card');
        secondcard = target.parentNode;
        checkCards();
    }
}

const createCard = (character) => {
    const card = createElement('div', 'card');
    const front = createElement('div', 'face front');
    const back = createElement('div', 'face back');

    front.style.backgroundImage = `url('images/${character}.png')`;

    card.appendChild(front);
    card.appendChild(back);
    card.setAttribute('data-object', character);
    card.addEventListener('click', revealCard);

    return card;
}

const loadGame = () => {
    const { pairs } = config[nivel];

    // Seleciona personagens
    const selectedCharacters = characters.slice(0, pairs);

    // Duplica e embaralha
    const duplicateCharacters = [...selectedCharacters, ...selectedCharacters];
    const shuffledArray = duplicateCharacters.sort(() => Math.random() - 0.5);

    // Limpa grid antes de carregar
    grid.innerHTML = "";

    // Ajusta grid dinâmica
    if (pairs <= 6) {
        grid.style.gridTemplateColumns = "repeat(4, 1fr)";
    } else if (pairs <= 9) {
        grid.style.gridTemplateColumns = "repeat(6, 1fr)";
    } else {
        grid.style.gridTemplateColumns = "repeat(6, 1fr)";
    }

    shuffledArray.forEach((character) => {
        const card = createCard(character);
        grid.appendChild(card);
    });

    showAllCards();
    playGameSound();
}

const showAllCards = () => {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => card.classList.add('reveal-card'));
    setTimeout(hideAllCards, 3000);
}

const hideAllCards = () => {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => card.classList.remove('reveal-card'));
}

function reiniciarPagina(condicao) {
    if (condicao) {
        window.location.reload();
    }
}

const startTimer = () => {
    timer.innerHTML = config[nivel].time;
    loop = setInterval(() => {
        const currentTime = parseInt(timer.innerHTML);
        if (currentTime > 0) {
            timer.innerHTML = currentTime - 1;
        } else {
            reiniciarPagina(true);
        }
    }, 1000);
}

const saveTime = (time) => {
    let ranking = JSON.parse(localStorage.getItem('ranking')) || [];
    ranking.push(time);
    ranking.sort((a, b) => a - b);
    if (ranking.length > 10) ranking.pop();
    localStorage.setItem('ranking', JSON.stringify(ranking));
}

const getRanking = () => {
    return JSON.parse(localStorage.getItem('ranking')) || [];
}

const updateRanking = () => {
    const ranking = getRanking();
    let rankingTable = `<table>
        <tr>
            <th>Posição</th>
            <th>Tempo</th>
        </tr>`;
    ranking.forEach((time, index) => {
        rankingTable += `<tr>
            <td>${index + 1}</td>
            <td>${time.toFixed(2)}</td>
        </tr>`;
    });
    rankingTable += `</table>`;
    document.getElementById('ranking').innerHTML = rankingTable;
}

const resetRanking = () => {
    localStorage.removeItem('ranking');
    updateRanking();
    alert('Ranking resetado com sucesso!');
}
function salvarPontuacao(nome, nivel) {
    let pontos = 0;

    // Define a pontuação por nível
    if (nivel === "facil") {
        pontos = 10;
    } else if (nivel === "medio") {
        pontos = 20;
    } else if (nivel === "dificil") {
        pontos = 30;
    }

    let ranking = JSON.parse(localStorage.getItem("pontuacaoRanking")) || [];

    // Verifica se jogador já existe no ranking
    let jogador = ranking.find(j => j.nome === nome);

    if (jogador) {
        jogador.pontos += pontos; // soma pontos
    } else {
        ranking.push({ nome, pontos });
    }

    // Ordena ranking por pontos (decrescente)
    ranking.sort((a, b) => b.pontos - a.pontos);

    localStorage.setItem("pontuacaoRanking", JSON.stringify(ranking));
}

window.onload = () => {
    startTimer();
    loadGame();  
    updateRanking();
    const resetButton = document.getElementById('reset-button');
    resetButton.addEventListener('click', resetRanking);
}

