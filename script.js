
let play = document.getElementById('play');
let playing = false;

play.addEventListener('click', function(event) {
    play.style.display = 'none';
    playGame()
});

// play.style.display = 'inline-flex';

function playGame() {
    const bird = document.querySelector('.bird')
    const gameDisplay = document.querySelector('.game-container')
    const ground = document.querySelector('.ground-moving')
    const score = document.querySelector('.score')
    const bestScore = document.querySelector('.best')
    

    let birdLeft = 220
    let birdBottom = 100
    let gravity = 3    
    let isGameOver = false
    let gap = 480

    // // звуки
    let fly = new Audio();
    let score_audio = new Audio();
    let gameOver_audio = new Audio();
    let gameWin_audio = new Audio();

    fly.src = "./assets/audio/fly.mp3";
    score_audio.src = "./assets/audio/score.mp3";
    gameOver_audio.src = "./assets/audio/gameOver.mp3"
    gameWin_audio.src = "./assets/audio/win.mp3"

    // Функция падения птицы
    function startGame() {
        birdBottom -= gravity //от нижней позиции птицы вычетается 3 пикселя каждые 20 миллисекунд, ниже интервал установлен
        bird.style.bottom = birdBottom + 'px'
        bird.style.left = birdLeft + 'px'
    }
    let gameTimerId = setInterval(startGame, 20) //запуск падения птицы каждые 20 миллисекунд

    // Кнопки для управления пробел и стрелка вверх
    function control(e) {
        if (e.keyCode === 38 || e.keyCode === 32) {
            jump()
            fly.pause()
            fly.currentTime = 0
            fly.play()
        }
    }

    //Функция прыжка по нажатию кнопки (слушаем момент отпускания кнопки)
    function jump() {
        if (birdBottom < 500) birdBottom += 50 // условие чтобы птица не прыгала выше "потолка"
        bird.style.bottom = birdBottom + 'px'
    }
    document.addEventListener('keyup', control)

    // Функция создания препятствий
    function generateObstacle() {
        let obstacleLeft = 500 // поле шириной 500 пикселей, поэтому сдвигаем препятствие слева на право на 500 чтобы оно было за кадром
        let randomHeight = Math.random() * 60 // получится случайная высота от 0 до 60
        let obstacleBottom = randomHeight
        const obstacle = document.createElement('div')
        const topObstacle = document.createElement('div')
        if (!isGameOver) {
            obstacle.classList.add('obstacle')
            topObstacle.classList.add('topObstacle')
        }

        gameDisplay.appendChild(obstacle)
        gameDisplay.appendChild(topObstacle)
        obstacle.style.left = obstacleLeft + 'px'
        topObstacle.style.left = obstacleLeft + 'px'
        obstacle.style.bottom = obstacleBottom + 'px'
        topObstacle.style.bottom = obstacleBottom + gap + 'px'

        // Функция перемещения препятствия по таймеру
        function moveObstacle() {
            obstacleLeft -=2 // отнимаем по 2 пикселя и сдвигаем вправо
            obstacle.style.left = obstacleLeft + 'px' //полученное после вычитание число устанавлияем в стили 
            topObstacle.style.left = obstacleLeft + 'px'


            // Если препятствие находится на 60 пикселей от левово края то мы удаляем интервал который вызывает функцию движения этого препятствия
            if (obstacleLeft === -60) {
                clearInterval(timerId)
                gameDisplay.removeChild(obstacle) //удаляем элемент из поля
                gameDisplay.removeChild(topObstacle)//удаляем элемент из поля
                score_audio.play();
            }

            let count = score.innerHTML;
            let best = bestScore.innerHTML;

            if (obstacleLeft === 220) {
                count++;
                score.innerHTML = count;   
                score_audio.play();
            } 

            let counts = window.localStorage.getItem('counts');

            //Остановим игру если прошли 5 препятствий
            if (count === 5) {
                win();
                clearInterval(gameTimerId) //остановка падения птицы
                clearInterval(timerId);//остановка движения препятствий
                clearInterval(generateId);

                
                if (counts == null) {
                    window.localStorage.setItem('counts', count)
                } else {
                    let countsarr = counts.split(',');
                    if (countsarr.length >= 10) {
                        countsarr.shift();
                    }
                    countsarr.push(count);
                    best = Math.max.apply(null, countsarr);
                    bestScore.innerHTML = best;
                }
            }

            //Остановим игру если птица коснулась дна или препятствия
            if (
                (obstacleLeft > 220 && obstacleLeft < 280 && birdLeft === 220 &&
                (birdBottom < obstacleBottom + 153 || birdBottom > obstacleBottom + gap -200)||
                birdBottom === 0) && bird.style.display != "none"
                ) {
                gameOver();
                clearInterval(gameTimerId)//остановка падения птицы
                clearInterval(timerId) //остановка движения препятствий
                clearInterval(generateId);

                if (counts == null) {
                    window.localStorage.setItem('counts', count)
                } else {
                    let countsarr = counts.split(',');
                    if (countsarr.length >= 10) {
                        countsarr.shift();
                    }
                    countsarr.push(count);
                    best = Math.max.apply(null, countsarr);
                    bestScore.innerHTML = best;
                }
            }

        }
        let timerId = setInterval(moveObstacle, 20) // вызываем функцию движения препятствия каждые 20 миллисекунд
        let generateId = setTimeout(generateObstacle, 3000) //вызываем функцию генерации новых препятствий каждые 3 секунды
        // if (!isGameOver) setTimeout(generateObstacle, 3000) //вызываем функцию генерации новых препятствий каждые 3 секунды

    }
    generateObstacle()


    function gameOver() {
        bird.style.display = "none"
        let textOver = document.createElement('div');
        textOver.classList.add("textOver");
        textOver.textContent = 'game over';
        ground.appendChild(textOver);

        console.log('game over')
        isGameOver = true
        document.removeEventListener('keyup', control)
        ground.classList.add('ground')
        ground.classList.remove('ground-moving')

        gameOver_audio.pause()
        gameOver_audio.currentTime = 0
        gameOver_audio.play()
    }

    function win() {
        bird.style.display = "none"
        let textWin = document.createElement('div');
        textWin.classList.add("textWin");
        textWin.textContent = 'You win!';
        ground.appendChild(textWin);

        console.log('you win')
        isGameOver = true
        document.removeEventListener('keyup', control)
        ground.classList.add('ground')
        ground.classList.remove('ground-moving')

        gameWin_audio.pause()
        gameWin_audio.currentTime = 0
        gameWin_audio.play();
    }
}


// document.addEventListener('DOMContentLoaded' , () => {
//     const bird = document.querySelector('.bird')
//     const gameDisplay = document.querySelector('.game-container')
//     const ground = document.querySelector('.ground-moving')
//     const score = document.querySelector('.score')
//     const bestScore = document.querySelector('.best')

//     let birdLeft = 220
//     let birdBottom = 100
//     let gravity = 3    
//     let isGameOver = false
//     let gap = 480

//     // // звуки
//     let fly = new Audio();
//     let score_audio = new Audio();
//     let gameOver_audio = new Audio();
//     let gameWin_audio = new Audio();

//     fly.src = "./assets/audio/fly.mp3";
//     score_audio.src = "./assets/audio/score.mp3";
//     gameOver_audio.src = "./assets/audio/gameOver.mp3"
//     gameWin_audio.src = "./assets/audio/win.mp3"

//     // Функция падения птицы
//     function startGame() {
//         birdBottom -= gravity //от нижней позиции птицы вычетается 3 пикселя каждые 20 миллисекунд, ниже интервал установлен
//         bird.style.bottom = birdBottom + 'px'
//         bird.style.left = birdLeft + 'px'
//     }
//     let gameTimerId = setInterval(startGame, 20) //запуск падения птицы каждые 20 миллисекунд
//     let timerId = 0;

//     // Кнопки для управления пробел и стрелка вверх
//     function control(e) {
//         if (e.keyCode === 38 || e.keyCode === 32) {
//             jump()
//             fly.pause()
//             fly.currentTime = 0
//             fly.play()
//         }
//     }

//     //Функция прыжка по нажатию кнопки (слушаем момент отпускания кнопки)
//     function jump() {
//         if (birdBottom < 500) birdBottom += 50 // условие чтобы птица не прыгала выше "потолка"
//         bird.style.bottom = birdBottom + 'px'
//     }
//     document.addEventListener('keyup', control)

//     // Функция создания препятствий
//     function generateObstacle() {
//         let obstacleLeft = 500 // поле шириной 500 пикселей, поэтому сдвигаем препятствие слева на право на 500 чтобы оно было за кадром
//         let randomHeight = Math.random() * 60 // получится случайная высота от 0 до 60
//         let obstacleBottom = randomHeight
//         const obstacle = document.createElement('div')
//         const topObstacle = document.createElement('div')
//         if (!isGameOver) {
//             obstacle.classList.add('obstacle')
//             topObstacle.classList.add('topObstacle')
//         }

//         gameDisplay.appendChild(obstacle)
//         gameDisplay.appendChild(topObstacle)
//         obstacle.style.left = obstacleLeft + 'px'
//         topObstacle.style.left = obstacleLeft + 'px'
//         obstacle.style.bottom = obstacleBottom + 'px'
//         topObstacle.style.bottom = obstacleBottom + gap + 'px'

//         // Функция перемещения препятствия по таймеру
//         function moveObstacle() {
//             obstacleLeft -=2 // отнимаем по 2 пикселя и сдвигаем вправо
//             obstacle.style.left = obstacleLeft + 'px' //полученное после вычитание число устанавлияем в стили 
//             topObstacle.style.left = obstacleLeft + 'px'


//             // Если препятствие находится на 60 пикселей от левово края то мы удаляем интервал который вызывает функцию движения этого препятствия
//             if (obstacleLeft === -60) {
//                 clearInterval(timerId)
//                 gameDisplay.removeChild(obstacle) //удаляем элемент из поля
//                 gameDisplay.removeChild(topObstacle)//удаляем элемент из поля
//                 score_audio.play();
//             }

//             let count = score.innerHTML;
//             let best = bestScore.innerHTML;

//             if (obstacleLeft === 220) {
//                 count++;
//                 score.innerHTML = count;   
//                 score_audio.play();
//             } 

//             let counts = window.localStorage.getItem('counts');

//             //Остановим игру если прошли 5 препятствий
//             if (count === 5) {
//                 win();
//                 clearInterval(gameTimerId) //остановка падения птицы
//                 clearInterval(timerId);//остановка движения препятствий
//                 clearInterval(generateId);

                
//                 if (counts == null) {
//                     window.localStorage.setItem('counts', count)
//                 } else {
//                     let countsarr = counts.split(',');
//                     if (countsarr.length >= 10) {
//                         countsarr.shift();
//                     }
//                     countsarr.push(count);
//                     best = Math.max.apply(null, countsarr);
//                     bestScore.innerHTML = best;
//                 }
//             }

//             //Остановим игру если птица коснулась дна или препятствия
//             if (
//                 (obstacleLeft > 220 && obstacleLeft < 280 && birdLeft === 220 &&
//                 (birdBottom < obstacleBottom + 153 || birdBottom > obstacleBottom + gap -200)||
//                 birdBottom === 0) && bird.style.display != "none"
//                 ) {
//                 gameOver();
//                 clearInterval(gameTimerId)//остановка падения птицы
//                 clearInterval(timerId) //остановка движения препятствий
//                 clearInterval(generateId);

//                 if (counts == null) {
//                     window.localStorage.setItem('counts', count)
//                 } else {
//                     let countsarr = counts.split(',');
//                     if (countsarr.length >= 10) {
//                         countsarr.shift();
//                     }
//                     countsarr.push(count);
//                     best = Math.max.apply(null, countsarr);
//                     bestScore.innerHTML = best;
//                 }
//             }

//         }
//         let timerId = setInterval(moveObstacle, 20) // вызываем функцию движения препятствия каждые 20 миллисекунд
//         let generateId = setTimeout(generateObstacle, 3000) //вызываем функцию генерации новых препятствий каждые 3 секунды
//         // if (!isGameOver) setTimeout(generateObstacle, 3000) //вызываем функцию генерации новых препятствий каждые 3 секунды

//     }
//     generateObstacle()


//     function gameOver() {
//         bird.style.display = "none"
//         let textOver = document.createElement('div');
//         textOver.classList.add("textOver");
//         textOver.textContent = 'game over';
//         ground.appendChild(textOver);

//         console.log('game over')
//         isGameOver = true
//         document.removeEventListener('keyup', control)
//         ground.classList.add('ground')
//         ground.classList.remove('ground-moving')

//         gameOver_audio.pause()
//         gameOver_audio.currentTime = 0
//         gameOver_audio.play()
//     }

//     function win() {
//         bird.style.display = "none"
//         let textWin = document.createElement('div');
//         textWin.classList.add("textWin");
//         textWin.textContent = 'You win!';
//         ground.appendChild(textWin);

//         console.log('you win')
//         isGameOver = true
//         document.removeEventListener('keyup', control)
//         ground.classList.add('ground')
//         ground.classList.remove('ground-moving')

//         gameWin_audio.pause()
//         gameWin_audio.currentTime = 0
//         gameWin_audio.play();
//     }

// })
