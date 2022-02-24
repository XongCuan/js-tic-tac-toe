import { CELL_VALUE, GAME_STATUS, TURN } from "./constants.js";
import {
  getCellElementList,
  getCurrentTurnElement,
  getGameStatusElement,
  getCellElementAtIdx,
  getReplayButtonElement,
  getCellListElement,
} from "./selectors.js";
import { checkGameStatus } from "./utils.js";

// console.log(checkGameStatus(['X', 'X', 'O', 'X', '0', 'O', 'O', 'O', 'X']))

/**
 * Global variables
 */

let currentTurn = TURN.CROSS;
let gameStatus = GAME_STATUS.PLAYING;
let cellValues = new Array(9).fill("");

function toggleTurn() {
  currentTurn = currentTurn === TURN.CIRCLE ? TURN.CROSS : TURN.CIRCLE;

  // update turn on DOM element
  const currentTurnElement = getCurrentTurnElement();
  if (currentTurnElement) {
    currentTurnElement.classList.remove(TURN.CIRCLE, TURN.CROSS);
    currentTurnElement.classList.add(currentTurn);
  }
}

function updateGameStatus(newGameStatus) {
  gameStatus = newGameStatus;

  const gameStatusElement = getGameStatusElement();
  if (gameStatusElement) gameStatusElement.textContent = newGameStatus;
}

function showReplayButton() {
  const replayButton = getReplayButtonElement();
  if (replayButton) replayButton.classList.add("show");
}

function hideReplayButton() {
  const replayButton = getReplayButtonElement();
  if (replayButton) replayButton.classList.remove("show");
}

function highlightWinCells(winPositions) {
  if (!Array.isArray(winPositions) || winPositions.length !== 3) {
    throw new Error("Invalid win positions");
  }

  for (const position of winPositions) {
    const cell = getCellElementAtIdx(position);
    // muốn lấy giá trị của nó tại vị trí. vd là vị trí 1 có giá trị là 3
    if (cell) cell.classList.add("win");
  }
}

function handleCellClick(cell, index) {
  const isClicked =
    cell.classList.contains(TURN.CIRCLE) || cell.classList.contains(TURN.CROSS);
  const isEndGame = gameStatus !== GAME_STATUS.PLAYING;
  if (isClicked || isEndGame) return;

  // set selected cell
  cell.classList.add(currentTurn);

  // UPDATE cellValues
  cellValues[index] =
    currentTurn === TURN.CIRCLE ? CELL_VALUE.CIRCLE : CELL_VALUE.CROSS;

  // toggle turn
  toggleTurn();

  // CHECK game status
  const game = checkGameStatus(cellValues);
  switch (game.status) {
    case GAME_STATUS.ENDED: {
      //update game status
      updateGameStatus(game.status);
      //show replay button
      showReplayButton();
      break;
    }

    case GAME_STATUS.X_WIN:
    case GAME_STATUS.O_WIN: {
      updateGameStatus(game.status);
      showReplayButton();
      highlightWinCells(game.winPositions);
      //show replay button
      //highlight win cells
      break;
    }
    default:
    // case GAME_STATUS.PLAYING:
  }

  // console.log("click", cell, index);
}

function initCellElementList() {
  // set index for each li element
  const liList = getCellElementList();

  liList.forEach((cell, index) => {
    // cell.addEventListener("click", () => handleCellClick(cell, index));
    cell.dataset.idx = index;
  });

  const ulElement = getCellListElement();
  if (ulElement) {
    ulElement.addEventListener("click", (event) => {
      if (event.target.tagName !== "LI") return;

      const index = Number.parseInt(event.target.dataset.idx);
      handleCellClick(event.target, index);
      // event.target chính là thẻ li nào được click
    });
  }
}

function resetGame() {
  console.log("Click button replay");

  // reset temp global  vars
  currentTurn = TURN.CROSS;
  gameStatus = GAME_STATUS.PLAYING;
  cellValues = cellValues.map(() => "");

  // reset dom elements

  // reset game status
  updateGameStatus(GAME_STATUS.PLAYING);

  // reset current turn
  const currentTurnElement = getCurrentTurnElement();
  if (currentTurnElement) {
    currentTurnElement.classList.remove(TURN.CIRCLE, TURN.CROSS);
    currentTurnElement.classList.add(TURN.CROSS);
  }

  // reset game broad
  const cellElementList = getCellElementList();
  for (const cellElement of cellElementList) {
    cellElement.className = "";
  }

  // hide reply button
  hideReplayButton();
}

function initReplayButton() {
  const replayButton = getReplayButtonElement();
  if (replayButton) {
    replayButton.addEventListener("click", resetGame);
  }
}

/**
 * TODOs
 *
 * 1. Bind click event for all cells
 * 2. On cell click, do the following:
 *    - Toggle current turn
 *    - Mark current turn to the selected cell
 *    - Check game state: win, ended or playing
 *    - If game is win, highlight win cells
 *    - Not allow to re-click the cell having value.
 *
 * 3. If game is win or ended --> show replay button.
 * 4. On replay button click --> reset game to play again.
 *
 */

(() => {
  // bind click event for all li element
  initCellElementList();

  // bind click event for replay button
  initReplayButton();
})();
