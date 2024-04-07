// Fetch questions from the server
fetch('/questions')
  .then(response => response.json())
  .then(questions => {
    // Initialize the quiz
    initQuiz(questions);
  });

  
// Function to initialize the quiz
function initQuiz(questions) {
  const questionList = document.getElementById('question-numbers');
  const questionText = document.getElementById('question-text');
  const options = document.querySelectorAll('.option');
  const submitBtn = document.getElementById('submit-btn');
  let currentQuestion = 0;
  const userAnswers = {};

 
  // Display the first question
  displayQuestion(questions[currentQuestion]);

  // Add event listeners to the question list and options
  questionList.addEventListener('click', (event) => {
    if (event.target.tagName === 'LI') {
      const questionIndex = parseInt(event.target.dataset.index);
      currentQuestion = questionIndex;
      displayQuestion(questions[currentQuestion]);
    }
  });

  options.forEach((option, index) => {
    option.addEventListener('click', () => {
      userAnswers[questions[currentQuestion].question_id] = questions[currentQuestion][`option_${index + 1}_id`];
      highlightOption(index);
    });
  });

  submitBtn.addEventListener('click', () => {
    currentQuestion++;
    if (currentQuestion < questions.length) {
      displayQuestion(questions[currentQuestion]);
    } else {
     
      const length = Object.keys(userAnswers).length;
      if (questions.length === length) {
      // All questions answered, show the results
      alert('You have completed the quiz!');
      console.log('User answers:', userAnswers);
      sendResultsToServer(userAnswers);
      } else {
        alert("Answer all questions")
       }

      
    }
  });

  // Function to display a question
  function displayQuestion(question) {
    questionText.textContent = question.question;
    options.forEach((option, index) => {
      option.textContent = question[`option_${index + 1}`];
      option.dataset.optionId = question[`option_${index + 1}_id`];
    });



    // Highlight the selected option, if any
    const selectedOptionId = userAnswers[question.question_id];
    if (selectedOptionId>0) {
      const selectedOptionIndex = Array.from(options).findIndex(option => option.dataset.optionId === selectedOptionId.toString());
      highlightOption(selectedOptionIndex );
    } else {
      options.forEach(option => option.classList.remove('active'));
    }



    // Highlight the current question in the list
    const questionItems = document.querySelectorAll('#question-numbers li');
    questionItems.forEach((item, index) => {
      item.classList.toggle('active', index === currentQuestion);
    });

  }

  // Function to highlight the selected option
  function highlightOption(index ) {
 

    
    options.forEach(option => {
      option.classList.remove('active');
      option.style.backgroundColor = '#4CAF50'; // Reset the button color
    });
    options[index].classList.add('active');
    options[index].style.backgroundColor = '#075e25'; // Change the color of the selected option
  }

  // Populate the question list
  questions.forEach((question, index) => {
    const listItem = document.createElement('li');
    listItem.textContent = `Question ${index + 1}`;
    listItem.dataset.index = index;
    questionList.appendChild(listItem);
  });
}


function sendResultsToServer(results) {
  fetch('/submit-quiz', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(results)
  })
  .then(response => {
    if (response.ok) {
        alert('Quiz results submitted successfully!');
        return response.json(); // Parse response body as JSON
    } else {
      alert('Error submitting quiz results. Please try again later.');
    }
  })
  .then(data => {
    if (data && data.redirectUrl) {
      window.location.href = data.redirectUrl; // Redirect to the specified URL
    }
  })
  .catch(error => {
    console.error('Error submitting quiz results:', error);
    alert('Error submitting quiz results. Please try again later.');
  });
}
