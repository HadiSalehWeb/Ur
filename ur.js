'strict mode'

// off board pieces are in position -1
//  | 0  | 1  | 2  |
//  | 3  | 4  | 5  |
//  | 6  | 7  | 8  |
//  | 9  | 10 | 11 |
//       | 12 |
//       | 13 |
//  | 14 | 15 | 16 |
//  | 17 | 18 | 19 |
// finished pieces are in position 20
// positions 0, 2, 10, 14 and 16 give you a second roll
// position 10 is safe


const Ur = (function () {
    class Path {
        constructor(from, to, player) {
            this.from = from
            this.to = to
            this.player = player
        }
        legalFor(player) {
            return this.player === player || this.player === undefined
        }
    }

    const paths = [
        // [from position, to position, player restriction]
        new Path(-1, 9, 1),
        new Path(-1, 11, 2),
        new Path(9, 6),
        new Path(6, 3),
        new Path(3, 0),
        new Path(0, 1),
        new Path(11, 8),
        new Path(8, 5),
        new Path(5, 2),
        new Path(2, 1),
        new Path(1, 4),
        new Path(4, 7),
        new Path(7, 10),
        new Path(10, 12),
        new Path(12, 13),
        new Path(13, 15),
        new Path(15, 18),
        new Path(18, 17, 1),
        new Path(17, 14),
        new Path(14, 20),
        new Path(18, 19, 2),
        new Path(19, 16),
        new Path(16, 20)
    ]

    const roll = function () {
        let sum = 0
        for (let i = 0; i < 4; i++)
            if (Math.random() >= .5)
                sum++
        return sum
    }

    class Ur {
        constructor() {
            this.players = {
                1: Array(7).fill(-1),
                2: Array(7).fill(-1)
            }
            this.playing = 1
            this.turn = 0
            this.winner = null
            this.update()
        }

        notPlaying() {
            return this.playing === 1 ? 2 : 1
        }

        update() {
            this.roll = roll()
            this.legalMoves = this.getLegalMoves()
        }

        play(legalMoveIndex) {
            if (this.winner !== null) return
            
            if (this.legalMoves.length > 0) {
                let [from, to] = this.legalMoves[legalMoveIndex]

                this.players[this.playing][this.players[this.playing].indexOf(from)] = to

                if (this.players[this.notPlaying()].indexOf(to) !== -1 && to !== 20)
                    this.players[this.notPlaying()][this.players[this.notPlaying()].indexOf(to)] = -1

                if (to === 20)
                    if (this.players[this.playing].every(a => a === 20)) {
                        this.winner = this.playing
                        return
                    }

                if ([0, 2, 10, 14].indexOf(to) === -1)
                    this.playing = this.notPlaying()
            } else {
                this.playing = this.notPlaying()
            }


            this.turn++
            this.update()
        }

        findLegalMoveIndex(from, to) {
            const ret = this.legalMoves.find(x => x[0] === from && x[1] === to)
            if (ret === undefined)
                throw new Error('Move not found.')
            return ret
        }

        slot(index) {
            if (this.players[1].indexOf(index) !== -1)
                return Ur.SlotState.player1
            if (this.players[2].indexOf(index) !== -1)
                return Ur.SlotState.player2
            return Ur.SlotState.free
        }

        legalState(from, to, player) {
            if (to === 10 && this.slot(10) !== 0)
                return false
            if (this.slot(to) === player && to !== 20)
                return false
            if (this.players[player].indexOf(from) === -1)
                return false

            return true
        }

        getLegalMoves() {
            if (this.roll == 0)
                return []

            let pos = Array.from(new Set(this.players[this.playing])).map(p => [p, p])

            for (let i = 0; i < this.roll; i++)
                pos = pos.reduce((a, c) =>
                    a.concat(paths.filter(path =>
                        path.from === c[1] &&
                        path.legalFor(this.playing)
                    ).map(path => [c[0], path.to])), [])

            return pos.filter(p => this.legalState(p[0], p[1], this.playing))
        }

        static SlotState = {
            free: 0,
            player1: 1,
            player2: 2
        }

        toJSON() {
            return {
                playing: this.playing,
                turn: this.turn,
                roll: this.roll,
                legalMoves: this.legalMoves,
                players: this.players
            }
        }

        static FromJSON({ playing, turn, roll, legalMoves, players }) {
            let instance = new Ur()
            instance.playing = playing
            instance.turn = turn
            instance.roll = roll
            instance.legalMoves = legalMoves
            instance.players = players
            return instance
        }

        toString() {
            return `Player ${this.playing} is playing turn ${this.turn}. Their roll is ${this.roll}, and ` +
                (this.legalMoves.length === 0 ? 'they have no legal moves.' : 'their legal moves are:\n' +
                    this.legalMoves.map((m, i) => `\t${i}. From ${m[0]} to ${m[1]}.`).join('\n')) + '\n' +
                `The board: \n` +
                `\t| ${this.slot(0) || ' '} | ${this.slot(1) || ' '} | ${this.slot(2) || ' '} |\n` +
                `\t| ${this.slot(3) || ' '} | ${this.slot(4) || ' '} | ${this.slot(5) || ' '} |\n` +
                `\t| ${this.slot(6) || ' '} | ${this.slot(7) || ' '} | ${this.slot(8) || ' '} |\n` +
                `\t| ${this.slot(9) || ' '} | ${this.slot(10) || ' '} | ${this.slot(11) || ' '} |\n` +
                `\t    | ${this.slot(12) || ' '} |\n` +
                `\t    | ${this.slot(12) || ' '} |\n` +
                `\t| ${this.slot(14) || ' '} | ${this.slot(15) || ' '} | ${this.slot(16) || ' '} |\n` +
                `\t| ${this.slot(17) || ' '} | ${this.slot(18) || ' '} | ${this.slot(19) || ' '} |\n` +
                `Player 1 has ${this.players[1].filter(x => x === -1).length} free pieces, ${this.players[1].filter(x => x === 20).length} finished pieces and ${this.players[1].filter(x => x !== -1 && x !== 20).length} pieces on the board.\n` +
                `Player 2 has ${this.players[2].filter(x => x === -1).length} free pieces, ${this.players[2].filter(x => x === 20).length} finished pieces and ${this.players[2].filter(x => x !== -1 && x !== 20).length} pieces on the board.` +
                (this.players[1].every(x => x === 20) ? '\nPlayer 1 has won.' : this.players[2].every(x => x === 20) ? '\nPlayer 2 has won.' : '')
        }

        static boardIndices = `` +
            "| 0  | 1  | 2  |\n" +
            "| 3  | 4  | 5  |\n" +
            "| 6  | 7  | 8  |\n" +
            "| 9  | 10 | 11 |\n" +
            "     | 12 |\n" +
            "     | 13 |\n" +
            "| 14 | 15 | 16 |\n" +
            "| 17 | 18 | 19 |\n" +
            "positions 0, 2, 10, 14 and 16 give you a second roll.\n" +
            "position 10 is safe."
    }

    return Ur
})()