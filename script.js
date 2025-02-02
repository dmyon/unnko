
document.getElementById('start-game').addEventListener('click', function() {
    const selectedPlayers = Array.from(document.querySelectorAll('#players input:checked'))
        .map(input => input.value);
    
    if (selectedPlayers.length === 0) {
        alert('少なくとも1人のプレイヤーを選択してください');
        return;
    }

    localStorage.setItem('players', JSON.stringify(selectedPlayers));
    localStorage.setItem('scores', JSON.stringify(selectedPlayers.reduce((acc, player) => {
        acc[player] = 0;
        return acc;
    }, {})));
    localStorage.setItem('gameCount', '1');

    document.getElementById('player-selection').style.display = 'none';
    document.getElementById('score-board').style.display = 'block';
    loadScoreBoard();
});

function loadScoreBoard() {
    const players = JSON.parse(localStorage.getItem('players')) || [];
    const scores = JSON.parse(localStorage.getItem('scores')) || {};
    const gameCount = localStorage.getItem('gameCount') || '1';
    
    document.getElementById('game-count').textContent = gameCount;
    const scoresTable = document.querySelector("#scores tbody");
    scoresTable.innerHTML = '';

    players.forEach(player => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${player}</td>
            <td id="total-${player}">${scores[player]}</td>
            <td id="score-${player}">0</td>
            <td>
                <button onclick="updateScore('${player}', -100)">-100</button>
                <button onclick="updateScore('${player}', 100)">+100</button>
            </td>
        `;
        scoresTable.appendChild(row);
    });
}

function updateScore(player, amount) {
    let scores = JSON.parse(localStorage.getItem('scores'));
    let currentScore = document.getElementById(`score-${player}`);
    currentScore.textContent = parseInt(currentScore.textContent) + amount;
}

document.getElementById('save-score').addEventListener('click', function() {
    let scores = JSON.parse(localStorage.getItem('scores'));
    let totalScore = 0;
    const players = JSON.parse(localStorage.getItem('players')) || [];

    players.forEach(player => {
        let currentScore = parseInt(document.getElementById(`score-${player}`).textContent);
        scores[player] += currentScore;
        totalScore += scores[player];
        document.getElementById(`total-${player}`).textContent = scores[player];
    });

    if (totalScore !== 0) {
        document.getElementById('error-message').textContent = 'スコアの合計が0ではありません！';
        return;
    }

    let gameCount = parseInt(localStorage.getItem('gameCount')) + 1;
    localStorage.setItem('gameCount', gameCount);
    localStorage.setItem('scores', JSON.stringify(scores));

    document.getElementById('game-count').textContent = gameCount;
    document.getElementById('error-message').textContent = '';

    // 今回のスコアをリセット
    players.forEach(player => {
        document.getElementById(`score-${player}`).textContent = '0';
    });
});
