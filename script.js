const wrapper = document.querySelector('.wrapper');
const forms = document.querySelectorAll('.form');
const messageArea = forms[0].querySelector('.messages');
const errorArea = document.querySelector('.error-area');
const levelModal = document.querySelector('.level-modal');
const rulesModal = document.querySelector('.rules-modal');

const valuesContainer = document.querySelector('.value-areas');
const values = document.querySelectorAll('.value-area');
const hintBtn = document.querySelector('.hint-btn');
const rulesBtn = document.querySelector('.rules-btn');
const playBtn = document.querySelector('.play-again-btn');
const score = document.querySelector('.game-info');
const closeBtn = document.querySelector('.close');

const levels = {
    'easy': 4,
    'medium': 7,
    'hard': 10
}

const numOfOutput = 4;
let moveCount = 0;
let secretNum;
let ramIndexes;
let sheepIndexes;
let level;
let maxVal;

hintBtn.addEventListener('mousedown', () => showHints(ramIndexes, sheepIndexes, values));
hintBtn.addEventListener('mouseup', () => clearHints(values));
rulesBtn.addEventListener('click', () => rulesModal.style.display = 'block');
closeBtn.addEventListener('click', () => rulesModal.style.display = 'none');
playBtn.addEventListener('click', () => document.location.reload());
values.forEach(val => val.addEventListener('click', () => changeValues(val, maxVal)));

valuesContainer.hidden = true;
rulesModal.hidden = true;

submitForms();
showLevelModal();

// =================================================

function showGameScore() {
    score.lastElementChild.innerText = moveCount;
}

function showLevelModal() {
    levelModal.style.display = 'block';
    levelModal.addEventListener('click', chooseLevel);
}

function chooseLevel(e) {
    if (e.target.dataset.name) {
        level = e.target.dataset.name;
        generateNum(levels[level]);
        levelModal.style.display = 'none';
        score.firstElementChild.innerText = level;
    }
}

function generateNum(difficulty) {
    let n = '' + Math.floor(Math.random() * (difficulty - 1) + 1);

    for (let i = 0; i < 3; i++) {
        n += Math.floor(Math.random() * difficulty);
    }

    if (new Set(n).size < 4) {
        generateNum(difficulty);
    } else {
        secretNum = n;
    }
    maxVal = difficulty;
}

function compareNums(userNum) {
    const message = document.createElement('li');
    ramIndexes = '';
    sheepIndexes = '';

    for (let i = 0; i < secretNum.length; i++) {
        if (secretNum.includes(userNum[i])) {
            if (userNum[i] === secretNum[i]) {
                ramIndexes += i;
            } else {
                sheepIndexes += i;
            }
        }
    }

    console.log('Secret number is ' + secretNum + ' and you are cheater!'); // =========================

    if (!isWinner(ramIndexes.length)) {
        showMessage(message, ramIndexes.length, sheepIndexes.length);
    }
}

function showMessage(container, rams, sheeps) {
    container.innerText = `You have: ${rams} ram(s) and ${sheeps} sheep(s)`;
    messageArea.prepend(container);
    errorArea.style.visibility = 'hidden';

    markCurrentMessage();
}

function markCurrentMessage() {
    const arr = [...messageArea.children];
    arr.map((item, i) => {
        return !i ? item.style.opacity = 1 : item.style.opacity = 0.3;
    });

    deleteExtraMessage(arr);
}

function deleteExtraMessage(array) {
    if (array.length > numOfOutput) array[numOfOutput].remove();
}

function isWinner(match) {
    if (match === 4) {
        messageArea.parentElement.classList.remove('active-form');
        messageArea.parentElement.nextElementSibling.classList.add('active-form');
        hintBtn.style.display = 'none';
        score.style.display = 'none';
        rulesBtn.style.display = 'none';
        rulesBtn.parentNode.style.justifyContent = 'center';
        playBtn.innerText = 'RESET GAME';
    }
}

function showHints(rams, sheeps, target) {
    if (rams || sheeps && target) {
        clearHints(target);
        [...rams].map(item => target[item].style.backgroundColor = '#009432');
        [...sheeps].map(item => target[item].style.backgroundColor = '#F79F1F');
        moveCount++;
        showGameScore();
    }
}

function clearHints(target) {
    target.forEach(item => item.style.backgroundColor = '');
}

function submitForms() {
    forms.forEach(form => {
        form.classList.remove('active-form');
        forms[0].classList.add('active-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            if (form.classList.contains('num')) {
                guessHandler();
            } else {
                saveData();
            }
        });
    });
}

function guessHandler() {
    let num = document.querySelector('.input-num').value;

    if (forms[0].firstElementChild.lastElementChild.classList.contains('shrink-input')) {
        num = '';
        values.forEach((val) => {
            num += val.innerText;
        });
    }

    if ((num[0] !== '0') && (num.length === 4)
        && (new Set(num).size === 4)) {
        moveCount++;
        compareNums(num);
        replaceInputs(num);
        showGameScore();
    } else {
        errorArea.innerText = `Invalid number. Number must contain four 
                               different digits and can not start with 0.
        `;
        errorArea.style.visibility = 'visible';
    }
}

function replaceInputs(value) {
    values.forEach((val, i) => {
        val.innerText = value[i];
    });

    if (!forms[0].firstElementChild.lastElementChild.classList.contains('shrink-input')) {
        forms[0].firstElementChild.lastElementChild.value = '';
        forms[0].firstElementChild.lastElementChild.classList.add('shrink-input');

        setTimeout(() => {
            valuesContainer.hidden = false;
            forms[0].firstElementChild.lastElementChild.style.visibility = 'hidden';
        }, 700);
    }
}

function saveData() {
    let username = forms[1].querySelector('.input-name').value;

    if (username && username !== ' ') {
        const obj = {
            name: username,
            moveCount,
            level,
            secretNum
        }

        localStorage.setItem(`${username}`, JSON.stringify(obj));
        username = '';

        createResultModal();
    }
}

function createResultModal() {
    const resultModal = document.createElement('div');
    const resultHeader = document.createElement('h3');
    const resultList = document.createElement('table');

    resultList.insertAdjacentHTML('afterbegin', `
                                                <thead>
                                                    <tr>
                                                        <th>Username</th>
                                                        <th>Move(s)</th>
                                                        <th>Level</th>
                                                        <th>Number</th>
                                                    </tr>
                                                </thead>
                                                `);

    resultModal.prepend(resultHeader);
    resultHeader.innerText = 'RESULT LIST';
    resultModal.append(resultList);

    resultModal.classList.add('modal');
    wrapper.innerHTML = '';
    wrapper.append(resultModal);
    playBtn.innerText = 'PLAY AGAIN';

    putData(resultList);
}

function putData(container) {
    const keys = Object.keys(localStorage);
    for (let key of keys) {
        let { name, moveCount, level, secretNum } = JSON.parse(localStorage.getItem(key));
        const listItem = document.createElement('tr');
        listItem.innerHTML = `<tr>
                                <td>${name}</td>
                                <td>${moveCount}</td>
                                <td>${level}</td>
                                <td>${secretNum}</td>
                            </tr>
                            `;
        container.prepend(listItem);
    }
}

function changeValues(item, max) {
    item.innerText++;
    if (item.innerText > (max - 1)) item.innerText = 0;
}