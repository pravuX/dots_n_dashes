const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d")
// draw new pixels behind existing pixels
ctx.globalCompositeOperation = "destination-over"

const canvas_height = canvas.clientHeight
const canvas_width = canvas.clientWidth

const square_size = 200
// no of square grids possible on each direction
const n_x = canvas_width / square_size
const n_y = canvas_height / square_size

const dot_radius = 15
const dash_width = dot_radius
ctx.lineWidth = dash_width

let p1 = document.getElementById("score_1")
let p2 = document.getElementById("score_2")

// 0 = player 1
// 1 = player 2
let player = 0
let score = [0, 0]
let players = ["Red", "Blue"]

// dots adjacency list
let dots = []

// draw the grid
draw_grid()

let from_x = -1
let from_y = -1
let to_x = -1
let to_y = -1
let direction = ""

let start_drawing_dash = false

canvas.addEventListener("click", (e) => {
  // dot lies within the canvas and snaps to the following
  //  cells in the grid
  if (
    0 <= e.offsetX &&
    e.offsetX < canvas_width &&
    0 <= e.offsetY &&
    e.offsetY < canvas_height
  ) {
    if (start_drawing_dash == false) {
      // top left of starting cell
      from_x = Math.floor((e.offsetX / canvas_width) * n_x)
      from_y = Math.floor((e.offsetY / canvas_height) * n_y)
      ctx.globalCompositeOperation = "source-over"
      draw_dot(
        from_x * square_size + square_size / 2,
        from_y * square_size + square_size / 2,
        dot_radius - dot_radius / 3,
        "#ffffff",
      )
      start_drawing_dash = true
    } else if (start_drawing_dash == true) {
      draw_dot(
        from_x * square_size + square_size / 2,
        from_y * square_size + square_size / 2,
        dot_radius,
        "#414868",
      )
      ctx.globalCompositeOperation = "destination-over"
      // top left of ending cell
      to_x = Math.floor((e.offsetX / canvas_width) * n_x)
      to_y = Math.floor((e.offsetY / canvas_height) * n_y)

      let from = n_x * from_y + from_x
      let to = n_x * to_y + to_x
      if (
        dots[from].indexOf(to) == -1 &&
        dist(from_x, from_y, to_x, to_y) == 1 // lies in the N4 neighborhood
      ) {
        draw_dashes()
        // populate both adjacency list because current 'to' may become
        //  'from' next time and vice versa
        dots[from].push(to)
        dots[to].push(from)
      }
      start_drawing_dash = false
    }
  }
  update_score()
  if (check_game_over()) {
    if (score[0] == score[1]) {
      result = "It's a tie!"
    } else {
      let winner = players[score.indexOf(Math.max(...score))]
      result = `${winner} won.`
    }
    result += " Press Reset to Play Again!"
    document.getElementById("result").innerHTML = result
    canvas.style.pointerEvents = "none"
  }
})

document.getElementById("reload").addEventListener("click", new_game)

function new_game() {
  canvas.style.pointerEvents = "auto"
  ctx.clearRect(0, 0, canvas_width, canvas_height)
  p1.innerHTML = 0
  p2.innerHTML = 0
  document.getElementById("result").innerHTML = ""
  score = [0, 0]
  player = 0
  draw_grid()
}

function update_score() {
  p1.innerHTML = score[0]
  p2.innerHTML = score[1]
}

function check_game_over() {
  // game is over when the sum of scores of both players
  //   reaches the maximum possible score
  let total_score = score.reduce(function(a, b) {
    return a + b
  }, 0)
  return total_score == (n_x - 1) * (n_y - 1)
}

function draw_dashes() {
  if (player == 0) {
    ctx.strokeStyle = "#f7768e"
    ctx.fillStyle = `rgba(247, 118, 142, 0.35)`
  } else {
    ctx.strokeStyle = "#7aa2f7"
    ctx.fillStyle = `rgba(122, 167, 247, 0.35)`
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

  // logic for checking a completed region (square)
  let score_change = false
  /*
  direction: from_x - to_x == 0 => vertical
  direction: from_y - to_y == 0 => horizontal
  */

  if (from_x - to_x == 0) {
    direction = "vertical"
  } else if (from_y - to_y == 0) {
    direction = "horizontal"
  }
  //dots[n_x * y + x] = [] // a list of neighboring dots to which dashes have been drawn
  let min_x = 0
  let min_y = 0
  let from = n_x * from_y + from_x
  let to = n_x * to_y + to_x

  switch (direction) {
    case "vertical":
      let from_left = n_x * from_y + (from_x - 1)
      let to_left = n_x * to_y + (to_x - 1)
      let from_right = n_x * from_y + (from_x + 1)
      let to_right = n_x * to_y + (to_x + 1)
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
        draw_square(min_x, min_y)

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
        draw_square(min_x, min_y)

        score[player]++
        score_change = true
      }
      break
    case "horizontal":
      let from_up = n_x * (from_y - 1) + from_x
      let to_up = n_x * (to_y - 1) + to_x
      let from_down = n_x * (from_y + 1) + from_x
      let to_down = n_x * (to_y + 1) + to_x
      // check if they are adjacent to from and to
      if (
        dots[from].indexOf(from_up) != -1 &&
        dots[to].indexOf(to_up) != -1 &&
        (dots[from_up].indexOf(to_up) != -1 ||
          dots[to_up].indexOf(from_up) != -1)
      ) {
        // they are all adjacent and form a cycle
        min_x = Math.min(from_x, to_x)
        min_y = Math.min(from_y - 1, to_y - 1)
        draw_square(min_x, min_y)
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
        draw_square(min_x, min_y)
        score[player]++
        score_change = true
      }
      break
  }

  if (score_change == false) {
    player = 1 - player
  }
}

function draw_grid() {
  // y = row
  // x = column
  for (let y = 0; y < n_y; y++) {
    for (let x = 0; x < n_x; x++) {
      // initialze an empty adjacency list
      //  which is a list of neighboring dots to which dashes
      //  have been drawn
      dots[n_x * y + x] = []

      // draw a dot at x, y
      let dot_x = x * square_size + square_size / 2
      let dot_y = y * square_size + square_size / 2
      draw_dot(dot_x, dot_y, dot_radius, "#414868")

      // for grid lines
      //ctx.strokeRect(x * square_size, y * square_size, square_size, square_size)
    }
  }
}

function dist(x1, y1, x2, y2) {
  return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2))
}

function draw_square(x, y) {
  ctx.fillRect(
    x * square_size + square_size / 2,
    y * square_size + square_size / 2,
    square_size,
    square_size,
  )
}

function draw_dot(x, y, r, color) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(x, y, r, 0, 360)
  ctx.fill()
}
