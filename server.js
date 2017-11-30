const express = require('express');
const app = express();
const session = require('express-session');
const word_list = require('./views/wordlist')
app.use(session({secret: "brandon"}));
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const path = require('path');
const PORT = 8000;

app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, './node_modules')))

const server = app.listen(PORT, function(){
  console.log(`Listening to Port: ${PORT}`)
});
const io = require("socket.io").listen(server)



let word = word_list[Math.floor(Math.random()*word_list.length) + 1]
console.log(word)
let arr = []
for(var i = 0; i<word.length; i++){
  arr.push('_')
}
let letters = [];
let win_count = 0;

//Setting up socket connection and generating the word
io.sockets.on("connection", socket => {
  io.emit("word", word)
  io.emit('letters', letters)
  io.emit('arr', arr)
  if(letters.length > 4 || win_count == arr.length ){
    io.emit('game_status')
  }
  console.log(socket.id)
});


//Handle root route
app.get('/', function(request,response){
  var game_over = false;
  if(letters.length > 4 || win_count == arr.length ){
    game_over = true;
    word = word_list[Math.floor(Math.random()*word_list.length) + 1]
    arr = []
    for(var i = 0; i< word.length; i++){
      arr.push('_')
    }
    letters = [];
    win_count = 0;
  }
  context = {
    game_over:game_over,
  }
  response.render("index", context)
});


//Process form data
app.post("/process", function(request,response){
  //Check to see if guessed letter is in word
  let found = false;
  if(request.body.letter.length > 1 ){
    request.body.letter = request.body.letter[0];
  }

  for(let idx in word){
    if(request.body.letter == word[idx]){
      arr[idx] = request.body.letter;
      found = true
      win_count ++;
    }
  }
  // for (letter of letters){
  //   if (request.body.letter = letter){
  //
  // //   }
  // }
  if(found == false){
    letters.push(request.body.letter)
  }

  response.redirect('/')
});
