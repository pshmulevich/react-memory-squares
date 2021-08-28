import React, { useCallback, useReducer } from "react";
import ReactDOM from "react-dom";
import "./styles.css";

// Pure React Component
const SquareClicked = React.memo(({ squareClickedId }) => {
  return <div className="instruction">Square clicked: {squareClickedId}</div>;
});

const Selection1 = React.memo(({ squareMatchId1 }) => {
  return <div className="instruction">Square 1 clicked: {squareMatchId1}</div>;
});

const Selection2 = React.memo(({ squareMatchId2 }) => {
  return <div className="instruction">Square 2 clicked: {squareMatchId2}</div>;
});

const SelectionMatch = React.memo(({ squareMatchId1, squareMatchId2 }) => {
  return (
    <div className="instruction">
      Match: {squareMatchId1} {squareMatchId2}
    </div>
  );
});

const Reset = React.memo(({ onClick }) => (
  <button className="button" onClick={onClick}>
    Reset
  </button>
));

const Square = React.memo(
  ({
    squareInfo,
    squareId,
    onClick,
    onSquareDoubleClicked,
    startTimer,
    onMismatchReset
  }) => {
    const squareCallback = useCallback(() => {
      if (startTimer && !squareInfo.isVisible) {
        setTimeout(() => {
          console.log("Timer executed");
          onMismatchReset();
        }, 1000);
      }
      return onClick(squareId);
    }, [squareId, onClick, startTimer, onMismatchReset, squareInfo.isVisible]);
    return (
      <div
        onDoubleClick={onSquareDoubleClicked}
        className="square"
        onClick={squareCallback}
      >
        {squareInfo.isVisible && squareInfo.squareValue}
      </div>
    );
  }
);

const Board = ({
  gameBoard,
  onSquareClick,
  onReset,
  onMismatchReset,
  squareMatchId1,
  squareMatchId2,
  startTimer
}) => (
  <div className="container">
    {/* <Selection1 squareMatchId1={squareMatchId1} />
    <Selection2 squareMatchId2={squareMatchId2} />
    <SelectionMatch
      squareMatchId1={squareMatchId1}
      squareMatchId2={squareMatchId2}
    /> */}
    <Reset onClick={onReset} />
    <div className="board">
      {gameBoard.map((squareInfo, idx) => {
        const isVisible = squareInfo.isVisible;
        const squareValue = squareInfo.squareValue;

        return (
          <Square
            key={idx}
            squareId={idx}
            squareInfo={{ isVisible, squareValue }}
            onClick={onSquareClick}
            onMismatchReset={onMismatchReset}
            startTimer={startTimer}
          />
        );
      })}
    </div>
  </div>
);

// shuffler function
const shuffleArr = (array) => {
  console.log("before", array[0], array[array.length - 1]);
  for (let i = 0; i < array.length * 50; i++) {
    const rand1 = Math.floor(Math.random() * array.length);
    const rand2 = Math.floor(Math.random() * array.length);

    const tmp = array[rand1];
    array[rand1] = array[rand2];
    array[rand2] = tmp;
  }
  console.log("after", array[0], array[array.length - 1]);
  return array;
};

const generateBoardValues = () => {
  const makeARandomNumber = () => {
    return Math.floor(Math.random() * 9); // generates 8 random numbers
  };
  const randoms = Array(8).fill(0).map(makeARandomNumber);
  const secondRandoms = [...randoms];
  const fullSet = randoms.concat(secondRandoms); // doubles the array of 8 random numbers

  //added a shuffler to fullSet
  const numbers = shuffleArr(fullSet);

  const squareInfos = numbers.map((randomNumber) => {
    return {
      squareValue: randomNumber,
      isVisible: false
    };
  });
  return squareInfos;
};

const initialState = {
  // this function is going to have to call generateBoardValues
  // and fill the gameboard with fullSet
  gameBoard: generateBoardValues(),
  firstOrSecond: "first",
  squareMatchId1: "",
  squareMatchId2: "",
  startTimer: false,
  timerStarted: false
};

const actionTypes = {
  squareClicked: "squareClicked",
  gameReset: "gameReset",
  mismatchReset: "mismatchReset"
};

const useActions = (dispatch, state) => ({
  squareClicked: (idx) =>
    dispatch({
      type: actionTypes.squareClicked,
      payload: idx
    }),
  gameReset: () =>
    dispatch({
      type: actionTypes.gameReset
    }),
  mismatchReset: () =>
    dispatch({
      type: actionTypes.mismatchReset
    })
});

export const gameReducer = (state, { type, payload }) => {
  switch (type) {
    case actionTypes.squareDoubleClicked:
      return state;

    case actionTypes.squareClicked:
      const idx = payload;
      // const squareClickedId = idx;
      console.log("idx", idx, "is visible:", state.gameBoard[idx].isVisible);
      const squareAlreadyPlayed = state.gameBoard[idx].isVisible;
      console.log("timerStarted", state.timerStarted);
      if (squareAlreadyPlayed || state.timerStarted) {
        return state;
      }
      // How to clone a collection of objects (because of value and visible)
      const gameBoard = state.gameBoard.map((squareInfo) => ({
        ...squareInfo
      }));
      gameBoard[idx].isVisible = true;

      // Ternary for the first or second square clicked choices
      // Compute squareMatchID based on which one was clicked. Alternates based on click
      const squareMatchId1 =
        state.firstOrSecond === "first" ? idx : state.squareMatchId1;
      const squareMatchId2 =
        state.firstOrSecond === "second" ? idx : state.squareMatchId2;

      const firstOrSecond =
        state.firstOrSecond === "first" ? "second" : "first";
      // flag to start timer, Logic for after the first click
      const startTimer = state.firstOrSecond === "first" ? true : false;
      const timerStarted = state.startTimer;

      const state2 = {
        gameBoard,
        firstOrSecond,
        squareMatchId1,
        squareMatchId2,
        startTimer,
        timerStarted
      };
      console.log("state2:", state2);
      return state2;
    case actionTypes.gameReset:
      return {
        ...initialState,
        gameBoard: generateBoardValues() // also reset gameboard
      };

    case actionTypes.mismatchReset:
      const matchingSquares =
        state.gameBoard[state.squareMatchId2].squareValue ===
        state.gameBoard[state.squareMatchId1].squareValue;

      if (!matchingSquares) {
        const gameBoard = state.gameBoard.map((squareInfo) => ({
          ...squareInfo
        }));
        gameBoard[state.squareMatchId2].isVisible = false;
        gameBoard[state.squareMatchId1].isVisible = false;
        return {
          ...state,
          gameBoard,
          squareMatchId1: "",
          squareMatchId2: "",
          timerStarted: false
        };
      } else {
        return {
          ...state,
          squareMatchId1: "",
          squareMatchId2: "",
          timerStarted: false
        };
      }

    default:
      throw new Error(`Unknown action ${type}`);
  }
};

const Game = () => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const { squareClicked, gameReset, mismatchReset } = useActions(
    dispatch,
    state
  );
  const {
    gameBoard,
    playerMark,
    squareClickedId,
    squareMatchId1,
    squareMatchId2,
    startTimer
  } = state;
  return (
    <div className="game">
      <div className="game-board">
        <Board
          gameBoard={gameBoard}
          playerMark={playerMark}
          onSquareClick={squareClicked}
          onReset={gameReset}
          onMismatchReset={mismatchReset}
          squareClickedId={squareClickedId}
          squareMatchId1={squareMatchId1}
          squareMatchId2={squareMatchId2}
          startTimer={startTimer}
        />
      </div>
    </div>
  );
};

ReactDOM.render(<Game />, document.getElementById("root"));
