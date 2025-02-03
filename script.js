document.getElementById('start-game').addEventListener('click', function () {
  const selectedPlayers = Array.from(
    document.querySelectorAll('#players input:checked')
  ).map((input) => input.value);

  if (selectedPlayers.length === 0) {
    alert('少なくとも1人のプレイヤーを選択してください');
    return;
  }

  localStorage.setItem('players', JSON.stringify(selectedPlayers));
  localStorage.setItem(
    'scores',
    JSON.stringify(
      selectedPlayers.reduce((acc, player) => {
        acc[player] = 0;
        return acc;
      }, {})
    )
  );
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
  const scoresTable = document.querySelector('#scores tbody');
  scoresTable.innerHTML = '';

  players.forEach((player) => {
    const row = document.createElement('tr');
    row.innerHTML = `
            <td>${player}</td>
            <td id="total-${player}">${scores[player]}</td>
            <td id="score-${player}">0</td>
            <td style =display: contents;>
                <button onclick="updateScore('${player}', -100)">-100</button>
                <button onclick="updateScore('${player}', 100)">+100</button>
            </td>
        `;
    scoresTable.appendChild(row);
  });
}

function updateScore(player, amount) {
  let scoreElement = document.getElementById(`score-${player}`);
  let totalElement = document.getElementById(`total-${player}`);

  let newScore = parseInt(scoreElement.textContent) + amount;
  scoreElement.textContent = newScore;

  // 負の数なら赤文字、それ以外なら通常表示
  if (newScore < 0) {
    scoreElement.classList.add('negative');
  } else {
    scoreElement.classList.remove('negative');
  }
  // 10000を超えたら虹文字、それ以外なら通常表示
  if (newScore > 9900) {
    scoreElement.classList.add('legendary');
  } else {
    scoreElement.classList.remove('legendary');
  }
}

// 合計スコア更新時も適用
document.getElementById('save-score').addEventListener('click', function () {
  let scores = JSON.parse(localStorage.getItem('scores'));
  let totalScore = 0;
  const players = JSON.parse(localStorage.getItem('players')) || [];

  players.forEach((player) => {
    let currentScore = parseInt(
      document.getElementById(`score-${player}`).textContent
    );
    scores[player] += currentScore;
    totalScore += scores[player];

    let totalElement = document.getElementById(`total-${player}`);
    totalElement.textContent = scores[player];

    // 負のスコアなら赤色
    if (totalScore == 0) {
      if (scores[player] < 0) {
        totalElement.classList.add('negative');
      } else {
        totalElement.classList.remove('negative');
      }
      // 10000超えのスコアなら虹色
      if (scores[player] > 9900) {
        totalElement.classList.add('legendary');
      } else {
        totalElement.classList.remove('legendary');
      }
    }
  });

  if (totalScore !== 0) {
    document.getElementById('error-message').textContent =
      'スコアの合計が0ではありません！';
    return;
  }

  let gameCount = parseInt(localStorage.getItem('gameCount')) + 1;
  localStorage.setItem('gameCount', gameCount);
  localStorage.setItem('scores', JSON.stringify(scores));

  document.getElementById('game-count').textContent = gameCount;
  document.getElementById('error-message').textContent = '';

  players.forEach((player) => {
    document.getElementById(`score-${player}`).textContent = '0';
    document.getElementById(`score-${player}`).classList.remove('negative'); // クリア時に赤文字解除
    document.getElementById(`score-${player}`).classList.remove('legendary'); // クリア時に虹文字解除
  });
});

document.getElementById('restart-game').addEventListener('click', function () {
  localStorage.clear();
  location.reload();
});

document.getElementById('reset-scores').addEventListener('click', function () {
  if (confirm('本当にスコアをリセットしますか？')) {
    const players = JSON.parse(localStorage.getItem('players')) || {};
    let scores = JSON.parse(localStorage.getItem('scores')) || {};

    // 各プレイヤーのスコアをリセット
    // スコアリセット時に赤文字をリセット
    players.forEach((player) => {
      scores[player] = 0;
      document.getElementById(`score-${player}`).textContent = '0';
      document.getElementById(`score-${player}`).classList.remove('negative');
      document.getElementById(`score-${player}`).classList.remove('legendary');
      document.getElementById(`total-${player}`).textContent = '0';
      document.getElementById(`total-${player}`).classList.remove('negative');
      document.getElementById(`total-${player}`).classList.remove('legendary');
    });
    // ゲーム数をリセット
    localStorage.setItem('gameCount', '1');
    document.getElementById('game-count').textContent = '1';
    // ローカルストレージを更新
    localStorage.setItem('scores', JSON.stringify(scores));
  }
});

document.getElementById('end-game').addEventListener('click', function () {
  if (confirm('セーブしましたか？')) {
    const scores = JSON.parse(localStorage.getItem('scores')) || {};
    const sortedPlayers = Object.entries(scores).sort((a, b) => b[1] - a[1]);

    const resultList = document.getElementById('result-list');
    resultList.innerHTML = '';

    sortedPlayers.forEach(([player, score], index) => {
      const li = document.createElement('li');
      li.textContent = `${index + 1}位: ${player} ： ${score}点`;
      // マイナスなら赤文字クラスを適用
      if (score < 0) {
        li.classList.add('negative');
      } else if (score > 9900) {
        // 10000を超えると虹文字クラスを適用
        li.classList.add('legendary');
      }
      resultList.appendChild(li);
    });

    document.getElementById('score-board').style.display = 'none';
    document.getElementById('result-screen').style.display = 'block';
  }
});
