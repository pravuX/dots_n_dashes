const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d")

const canvas_height = canvas.clientHeight
const canvas_width = canvas.clientWidth

const square_size = 50
// no of square grids possible on each direction
const n_x = canvas_width / square_size
const n_y = canvas_height / square_size

// 0 = player 1
// 1 = player 2
let player = 0
let score = [0, 0]

let dots = []
let players = ["Red", "Blue"]

// draw the grid
// y = row
// x = column

ctx.strokeStyle = "black"

draw_grid()

let from_x = -1
let from_y = -1
let to_x = -1
let to_y = -1
let direction = ""

let draw_dash = false

canvas.addEventListener("click", (e) => {
  // dot lies within the canvas and snaps to the following
  //  coordinates
  if (
    0 <= e.offsetX &&
    e.offsetX < canvas_width &&
    0 <= e.offsetY &&
    e.offsetY < canvas_height
  ) {
    if (draw_dash == false) {
      from_x = Math.floor((e.offsetX / canvas_width) * n_x)
      from_y = Math.floor((e.offsetY / canvas_height) * n_y)
      draw_dash = true
    } else if (draw_dash == true) {
      to_x = Math.floor((e.offsetX / canvas_width) * n_x)
      to_y = Math.floor((e.offsetY / canvas_height) * n_y)
      let from = n_x * from_y + from_x
      let to = n_x * to_y + to_x
      if (
        dots[from].indexOf(to) == -1 &&
        dots[to].indexOf(from) == -1 &&
        dist(from_x, from_y, to_x, to_y) == 1
      ) {
        draw_dashes()
        dots[from].push(to)
        dots[to].push(from)
      }
      draw_dash = false
    }
  }
  update_score()
  if (check_game_over()) {
    document.getElementById("result").innerHTML =
      `${players[score.indexOf(Math.max(...score))]} won. Press Reset to Play Again!`
  }
})

document.getElementById("reload").addEventListener("click", new_game)

function new_game() {
  ctx.clearRect(0, 0, canvas_width, canvas_height)
  ctx.fillStyle = "black"
  ctx.strokeStyle = "black"
  let p1 = document.getElementById("score_1")
  let p2 = document.getElementById("score_2")
  p1.innerHTML = 0
  p2.innerHTML = 0
  document.getElementById("result").innerHTML = ""
  score = [0, 0]
  player = 0
  from_x = -1
  from_y = -1
  to_x = -1
  to_y = -1
  direction = ""
  draw_dash = false
  draw_grid()
}

function update_score() {
  let p1 = document.getElementById("score_1")
  let p2 = document.getElementById("score_2")
  p1.innerHTML = score[0]
  p2.innerHTML = score[1]
}

function check_game_over() {
  let total_sum = score.reduce(function(a, b) {
    return a + b
  }, 0)
  return total_sum == (n_x - 1) * (n_y - 1)
}

function draw_dashes() {
  ctx.lineWidth = 2
  if (player == 0) {
    ctx.strokeStyle = "red"
    ctx.fillStyle = `rgba(255, 0, 0, 0.35)`
  } else {
    ctx.strokeStyle = "blue"
    ctx.fillStyle = `rgba(0, 0, 255, 0.35)`
  }
  let x2 = to_x * square_size + square_size / 2
  let y2 = to_y * square_size + square_size / 2

  if (from_x != -1 && from_y != -1) {
    let x1 = from_x * square_size + square_size / 2
    let y1 = from_y * square_size + square_size / 2
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
  }

  let score_change = false
  // logic for checking a completed region
  /*
    from_x, from_y
    to_x, to_y

  direction: from_x - to_x == 0 => vertical
                  &&
            from_y - to_y != 0
  direction: from_y - to_y == 0 => horizontal

  vertical: similarly
    */

  if (from_x - to_x == 0) {
    direction = "vertical"
  } else if (from_y - to_y == 0) {
    direction = "horizontal"
  }
  //dots[n_x * y + x] = [] // a list of neighboring dots to which dashes have been drawn
  let min_x = 0
  let min_y = 0

  if (direction == "vertical") {
    let from_left = n_x * from_y + (from_x - 1)
    let to_left = n_x * to_y + (to_x - 1)
    let from_right = n_x * from_y + (from_x + 1)
    let to_right = n_x * to_y + (to_x + 1)
    let from = n_x * from_y + from_x
    let to = n_x * to_y + to_x
    // check if they are adjacent to from and to
    if (
      dots[from].indexOf(from_left) != -1 &&
      dots[to].indexOf(to_left) != -1 &&
      (dots[from_left].indexOf(to_left) != -1 ||
        dots[to_left].indexOf(from_left) != -1)
    ) {
      // they are all adjacent and form a cycle
      min_x = Math.min(from_x - 1, to_x - 1)
      min_y = Math.min(from_y, to_y)
      ctx.fillRect(
        min_x * square_size + square_size / 2,
        min_y * square_size + square_size / 2,
        square_size,
        square_size,
      )

      score[player]++
      score_change = true
    }
    if (
      dots[from].indexOf(from_right) != -1 &&
      dots[to].indexOf(to_right) != -1 &&
      (dots[from_right].indexOf(to_right) != -1 ||
        dots[to_right].indexOf(from_right) != -1)
    ) {
      // they are all adjacent and form a cycle
      min_x = Math.min(from_x, to_x)
      min_y = Math.min(from_y, to_y)
      ctx.fillRect(
        min_x * square_size + square_size / 2,
        min_y * square_size + square_size / 2,
        square_size,
        square_size,
      )
      score[player]++
      score_change = true
    }
  } else if (direction == "horizontal") {
    let from_up = n_x * (from_y - 1) + from_x
    let to_up = n_x * (to_y - 1) + to_x
    let from_down = n_x * (from_y + 1) + from_x
    let to_down = n_x * (to_y + 1) + to_x
    let from = n_x * from_y + from_x
    let to = n_x * to_y + to_x
    // check if they are adjacent to from and to
    if (
      dots[from].indexOf(from_up) != -1 &&
      dots[to].indexOf(to_up) != -1 &&
      (dots[from_up].indexOf(to_up) != -1 || dots[to_up].indexOf(from_up) != -1)
    ) {
      // they are all adjacent and form a cycle
      min_x = Math.min(from_x, to_x)
      min_y = Math.min(from_y - 1, to_y - 1)
      ctx.fillRect(
        min_x * square_size + square_size / 2,
        min_y * square_size + square_size / 2,
        square_size,
        square_size,
      )
      score[player]++
      score_change = true
    }
    if (
      dots[from].indexOf(from_down) != -1 &&
      dots[to].indexOf(to_down) != -1 &&
      (dots[from_down].indexOf(to_down) != -1 ||
        dots[to_down].indexOf(from_down) != -1)
    ) {
      // they are all adjacent and form a cycle
      min_x = Math.min(from_x, to_x)
      min_y = Math.min(from_y, to_y)
      ctx.fillRect(
        min_x * square_size + square_size / 2,
        min_y * square_size + square_size / 2,
        square_size,
        square_size,
      )
      score[player]++
      score_change = true
    }
  }
  if (score_change == false) {
    player = 1 - player
  }
}

function draw_grid() {
  for (let y = 0; y < n_y; y++) {
    for (let x = 0; x < n_x; x++) {
      dots[n_x * y + x] = [] // a list of neighboring dots to which dashes have been drawn

      let dot_x = x * square_size + square_size / 2
      let dot_y = y * square_size + square_size / 2
      // draw a dot at x, y
      ctx.beginPath()
      ctx.arc(dot_x, dot_y, 5, 0, 360)
      ctx.fill()

      //ctx.strokeRect(x * square_size, y * square_size, square_size, square_size)
    }
  }
}

function dist(x1, y1, x2, y2) {
  return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2))
}
