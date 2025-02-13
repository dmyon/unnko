// 「ゲーム開始」ボタンをクリックした際の処理
document.getElementById('start-game').addEventListener('click', function () {
  var selectedPlayers = Array.from(
    document.querySelectorAll('#players input:checked')
  ).map(function (input) {
    return input.value; // 選択されたプレイヤーの値（名前）を取得
  });

  if (selectedPlayers.length < 2) {
    alert('少なくとも2人のプレイヤーを選択してください');
    return;
  }

  // ローカルストレージにプレイヤー情報とスコアを保存
  localStorage.setItem('players', JSON.stringify(selectedPlayers));
  var scores = {};
  selectedPlayers.forEach(function (player) {
    scores[player] = 0; // 各プレイヤーのスコアを0に初期化
  });
  localStorage.setItem('scores', JSON.stringify(scores));
  localStorage.setItem('gameCount', '1'); // ゲーム数を1に設定

  // 画面表示の切り替え
  document.getElementById('player-selection').style.display = 'none';
  document.getElementById('score-board').style.display = 'block';
  loadScoreBoard(); // スコアボードを読み込む
});

// スコアのスタイルを適用する関数（負のスコアを赤色、1万点超えを虹色にする）
function applyScoreStyles(player, element) {
  var score = parseInt(element.textContent);
  element.classList.toggle('negative', score < 0);
  element.classList.toggle('legendary', score > 9900);
}

// スコアボードをロードする処理を更新
function loadScoreBoard() {
  var players = JSON.parse(localStorage.getItem('players')) || [];
  var scores = JSON.parse(localStorage.getItem('scores')) || {};
  document.getElementById('game-count').textContent =
    localStorage.getItem('gameCount') || '1';
  var scoresTable = document.querySelector('#scores tbody');
  scoresTable.innerHTML = '';

  players.forEach(function (player) {
    var row = document.createElement('tr');
    row.innerHTML = `
      <td>${player}</td>
      <td id="total-${player}">${scores[player]}</td>
      <td id="score-${player}">0</td>
      <td>
        <div class="score-buttons">
          <input 
            type="number" 
            id="input-${player}" 
            value="100" 
            min="0" 
            max="999900" 
            step="100"
            class="score-input"
          >
          <button onclick="updateScore('${player}', true)">+</button>
          <button onclick="updateScore('${player}', false)">-</button>
        </div>
      </td>
    `;
    scoresTable.appendChild(row);

    // 入力フィールドのイベントリスナーを追加
    const input = document.getElementById(`input-${player}`);

    // 上下キーでの100ずつの増減を確実にする
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        const currentValue = parseInt(this.value) || 0;
        if (e.key === 'ArrowUp') {
          this.value = currentValue + 100;
        } else {
          this.value = Math.max(0, currentValue - 100);
        }
        e.preventDefault();
      }
    });

    // 入力値が100の倍数になるように調整
    input.addEventListener('change', function () {
      let value = parseInt(this.value) || 0;
      value = Math.round(value / 100) * 100;
      value = Math.max(0, Math.min(999900, value));
      this.value = value;
    });
  });
}

// スコアを更新する処理は同じ
function updateScore(player, isAdd) {
  var scoreElement = document.getElementById(`score-${player}`);
  var inputElement = document.getElementById(`input-${player}`);
  var amount = parseInt(inputElement.value) || 0;

  // 不正な値のチェック
  if (amount < 0) {
    alert('正の数を入力してください');
    inputElement.value = 100;
    return;
  }

  // プラスかマイナスかを判定して計算
  var newScore =
    parseInt(scoreElement.textContent) + (isAdd ? amount : -amount);
  scoreElement.textContent = newScore;
  applyScoreStyles(player, scoreElement);
}

// 「スコア保存」ボタンをクリックした際の処理
document.getElementById('save-score').addEventListener('click', function () {
  var scores = JSON.parse(localStorage.getItem('scores'));
  var totalScore = 0;

  // 各プレイヤーのスコア合計を計算
  for (var player in scores) {
    totalScore += parseInt(
      document.getElementById(`score-${player}`).textContent
    );
  }

  // スコア合計が0でなければエラーメッセージを表示
  if (totalScore !== 0) {
    document.getElementById('error-message').textContent =
      'スコアの合計が0ではありません！';
    return;
  }

  var players = JSON.parse(localStorage.getItem('players')) || [];
  players.forEach(function (player) {
    var currentScore = parseInt(
      document.getElementById(`score-${player}`).textContent
    );
    scores[player] += currentScore;
    document.getElementById(`total-${player}`).textContent = scores[player];
    applyScoreStyles(player, document.getElementById(`total-${player}`));

    // 今回のスコアを0にリセットし、赤文字を解除
    var scoreElement = document.getElementById(`score-${player}`);
    scoreElement.textContent = '0';
    scoreElement.classList.remove('negative', 'legendary');

    // score-inputの値を100にリセット
    var inputElement = document.getElementById(`input-${player}`);
    if (inputElement) {
      inputElement.value = 100;
    }
  });

  // 更新されたスコアとゲーム回数を保存
  localStorage.setItem('scores', JSON.stringify(scores));
  localStorage.setItem(
    'gameCount',
    parseInt(localStorage.getItem('gameCount')) + 1
  );
  document.getElementById('game-count').textContent =
    localStorage.getItem('gameCount');
  document.getElementById('error-message').textContent = '';
});

// 「ゲームリスタート」ボタンをクリックした際の処理
document.getElementById('restart-game').addEventListener('click', function () {
  ['players', 'scores', 'gameCount'].forEach(function (key) {
    localStorage.removeItem(key);
  });
  location.reload();
});

// 「ゲーム終了」ボタンをクリックした際の処理
document.getElementById('end-game').addEventListener('click', function () {
  if (confirm('セーブしましたか？')) {
    var scores = JSON.parse(localStorage.getItem('scores')) || {};
    var sortedPlayers = Object.entries(scores).sort(function (a, b) {
      return b[1] - a[1];
    });

    var resultList = document.getElementById('result-list');
    resultList.innerHTML = '';

    sortedPlayers.forEach(function (entry, index) {
      var li = document.createElement('li');
      li.textContent = index + 1 + '位: ' + entry[0] + ' ： ' + entry[1] + '点';
      if (entry[1] < 0) {
        li.classList.add('negative');
      } else if (entry[1] > 9900) {
        li.classList.add('legendary');
      }
      resultList.appendChild(li);
    });

    document.getElementById('score-board').style.display = 'none';
    document.getElementById('result-screen').style.display = 'block';
  }
});

// 「スコアリセット」ボタンをクリックした際の処理
document.getElementById('reset-scores').addEventListener('click', function () {
  if (confirm('本当にスコアをリセットしますか？')) {
    var players = JSON.parse(localStorage.getItem('players')) || [];
    var scores = {};

    players.forEach(function (player) {
      scores[player] = 0;
      var scoreElement = document.getElementById(`score-${player}`);
      var totalElement = document.getElementById(`total-${player}`);
      scoreElement.textContent = '0';
      totalElement.textContent = '0';
      scoreElement.classList.remove('negative', 'legendary');
      totalElement.classList.remove('negative', 'legendary');
    });

    // スコアとゲーム回数をリセット
    localStorage.setItem('scores', JSON.stringify(scores));
    localStorage.setItem('gameCount', '1');
    document.getElementById('game-count').textContent = '1';
  }
});
