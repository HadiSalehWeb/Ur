const canvas = document.getElementById('canvas')
const width = document.body.clientWidth
const height = Math.max(document.body.clientHeight, window.innerHeight)
canvas.width = width
canvas.height = height

const ctx = canvas.getContext('2d')

const ur = new Ur()

const boardPortion = .8
const piecePosition = .4

const centerX = Math.round(width / 2)
const centerY = Math.round(height / 2)
const squareSize = Math.round(height * boardPortion / 8)
const topPadding = Math.round(height * (1 - boardPortion) / 2)
const pieceRadius = Math.round(squareSize / 3)
const pieceSpace = Math.round(height * boardPortion / 7)
const piecePadding = Math.round((width - centerX) * piecePosition)
const indexToSquarePosition = [
    [0, 0],
    [1, 0],
    [2, 0],
    [0, 1],
    [1, 1],
    [2, 1],
    [0, 2],
    [1, 2],
    [2, 2],
    [0, 3],
    [1, 3],
    [2, 3],
    [1, 4],
    [1, 5],
    [0, 6],
    [1, 6],
    [2, 6],
    [0, 7],
    [1, 7],
    [2, 7]
]

const update = function () {
    clearBoard()
    drawBoard()
    drawPieces()
    drawRoll()
    drawSelection()
    console.log(Ur.boardIndices)
    console.log(ur.toString())
}

const clearBoard = function () {
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
}

const drawBoard = function () {
    for (let i = 0; i < 3; i++)
        for (let j = 0; j < 8; j++)
            if ((i !== 0 && i !== 2) || (j !== 4 && j !== 5))
                ctx.strokeRect(centerX - squareSize * 1.5 + i * squareSize, topPadding + squareSize * j, squareSize, squareSize)
}

const drawPieces = function () {
    for (let i = 1; i < 3; i++) {
        if (i === 1) ctx.fillStyle = 'red'
        if (i === 2) ctx.fillStyle = 'blue'

        for (let j = 0; j < ur.players[i].length; j++) {
            ctx.beginPath()

            if (ur.players[i][j] === -1)
                ctx.arc(i === 1 ? piecePadding : width - piecePadding, topPadding + pieceSpace * j + pieceSpace / 2, pieceRadius, 0, Math.PI * 2)
            else if (ur.players[i][j] === 20)
                ctx.arc(centerX - squareSize + 2 * squareSize * (i === 1 ? 0 : 1), topPadding + squareSize * 5.5 - squareSize * j / 7, pieceRadius, 0, Math.PI * 2)
            else
                ctx.arc(centerX - squareSize * 1 + indexToSquarePosition[ur.players[i][j]][0] * squareSize, topPadding + squareSize * 0.5 + squareSize * indexToSquarePosition[ur.players[i][j]][1], pieceRadius, 0, Math.PI * 2)

            ctx.fill()
            ctx.stroke()
        }
    }
}

const drawRoll = function () {
    ctx.font = '34px Arial, Helvetica, sans-serif'
    ctx.fillStyle = 'black'
    ctx.fillText('Roll: ' + ur.roll, 10, 43)
}

const drawSelection = function () {
}

update()

let enemyPlaying = false;

const play = function (index) {
    if (enemyPlaying) return;
    ur.play(index)
    update()
    // console.clear()
    console.log(ur.playing)
    if (ur.playing === 2)
        playAi()
}

const playAi = function () {
    enemyPlaying = true;
    setTimeout(() => {
        console.log('Enemy rolled: ' + ur.roll)
        ur.play(Math.floor(Math.random() * ur.legalMoves.length))
        update()
        if (ur.playing === 2) playAi()
        else enemyPlaying = false
    }, 1000)
}

let time = 500

function play2() {
    ur.play(Math.floor(Math.random() * ur.legalMoves.length))
    update()
    setTimeout(() => { play2() }, time)
}