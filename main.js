const letters = document.querySelectorAll('.scoreboard-letter');
const loadingDiv = document.querySelector('.info-bar');
const ANSWER_LENGTH = 5; // doesnt change, sreaming letter
const ROUNDS = 6;

async function init(){
    let currentGuess = ''; // index of letter in our word (right now)
    let currentRow = 0;
    let isLoading = true;

    const res = await fetch('https://words.dev-apis.com/word-of-the-day?random=1'); // getting api from server
    const resObj = await res.json();  // transform to json formula
    const word = resObj.word.toUpperCase(); 
    const wordParts = word.split('');
    let done = false;
    setLoading(false);
    isLoading = false;

    function addLetter(letter){
        if(currentGuess.length < ANSWER_LENGTH){
            currentGuess += letter; // add letter to the end
        }else{
            currentGuess = currentGuess.substring(0, currentGuess.length-1) + letter;
        } // replace last letter 

        letters[ANSWER_LENGTH * currentRow + currentGuess.length - 1].innerText = letter;
    }

    async function commit(){
        if(currentGuess.length !== ANSWER_LENGTH){
            //do nothing
            return;
        }
        
        isLoading = true;
        setLoading(true);
        const res = await fetch("https://words.dev-apis.com/validate-word", {  // check if word is valid in api   // idk WHAT AND HOW 
            method: "POST",
            body: JSON.stringify({word: currentGuess})
        });

        const resObj = await res.json(); 
        const validWord = resObj.validWord;
        // const { validWord } = resObj;

        isLoading = false;
        setLoading(false);

        if (!validWord){
            markInvalidWord();
            return;
        }

        const guessParts = currentGuess.split(""); //POOLS is doing array["P", "O", "O","L","S"]
        const map = makeMap(wordParts);
        console.log(map);

    

        for(let i = 0; i < ANSWER_LENGTH; i++){
            //mark as correct
            if(guessParts[i] === wordParts[i]){
                letters[currentRow*ANSWER_LENGTH + i].classList.add("correct");
                map[guessParts[i]]--;
            }
        }

        for(let i = 0; i < ANSWER_LENGTH; i++){
            if(guessParts[i] === wordParts[i]){
                //do nothing, its done
            }else if(wordParts.includes(guessParts[i]) && map[guessParts[i]] > 0){
                //mark as close
                letters[currentRow*ANSWER_LENGTH + i].classList.add("close");
                map[guessParts[i]]--;
            }else{
                letters[currentRow*ANSWER_LENGTH + i].classList.add("wrong");
            }
        }

        currentRow++;

        if(currentGuess === word){ // win conditions
            alert('you win!');
            document.querySelector('.brand').classList.add('winner');
            done = true;
            return;
        }else if(currentRow === ROUNDS){ // lose conditions
            alert(`you lose, the word was ${word}`);
            done = true;
        }
        currentGuess = '';
    }

    function backspace(){
        currentGuess = currentGuess.substring(0, currentGuess.length-1);
        letters[ANSWER_LENGTH * currentRow + currentGuess.length].innerText = "";
    }

    function markInvalidWord(){ // show animation when is not valid
        for(let i = 0; i < ANSWER_LENGTH; i++){ // put an animation when is not valid for 10 ms 
            letters[currentRow*ANSWER_LENGTH + i].classList.remove("invalid");
            setTimeout(function(){
                letters[currentRow*ANSWER_LENGTH + i].classList.add("invalid");
            }, 10);
        }
    }

    document.addEventListener('keydown', function handleKeyPress (event){
        if(done || isLoading){
            //do nothing
            return;
        }

        const action = event.key;

        if(action === 'Enter'){
            commit();
        }else if(action === 'Backspace'){
            backspace();
        }else if(isLetter(action)){
            addLetter(action.toUpperCase());
        }else{
            // do nothing ( +-.,.;')
        }

    });
}

function isLetter(letter) {
    return /^[a-zA-Z]$/.test(letter);
}

function setLoading(isLoading){
    loadingDiv.classList.toggle('show', isLoading); 
}

function makeMap(array){
    const obj = {};
    for(let i = 0; i < array.length; i++){
        const letter = array[i];
        if(obj[letter]){
            obj[letter]++;
        }else{
            obj[letter] = 1;
        }
    }
    return obj;
}

init();