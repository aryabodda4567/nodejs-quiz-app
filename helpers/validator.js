const {  resultResponse } = require('./questions');


//This function create a json with question details and alomg with the choosed option and correct option
function validateAnswers(answers) {
    let responseArray = [];//array to send response back to the user;
    let score = 0;//variable to store score
    for (let i = 0; i < resultResponse.length; i++){
        //assigning json array which contains correct option field to response ;
        responseArray[i] = resultResponse[i];
        //adding option choosed by the user to the response array
        responseArray[i].choosed_option = answers[resultResponse[i].question_id];
        //check user answers with actual answers
        if (answers[resultResponse[i].question_id] === responseArray[i].correct_answer) {
            score++;
        }
    }
 
    responseArray.score = score;
    return responseArray;
   
}

module.exports = { validateAnswers };