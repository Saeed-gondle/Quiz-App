import "core-js/stable";
import "regenerator-runtime/runtime";
const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};

let quizArr = [];
let state = {
  resultScore: 10,
  attemptedQuestion: 0,
  results: [],
};
class Quiz {
  #mainContainer = document.querySelector(".fetch-container");
  #quizContainer = document.querySelector(".quiz-con");
  #currQuiz;
  #currQuizNo = 1;
  #elementBtn;
  #endBtn;
  #url =
    "https://opentdb.com/api.php?amount=10&category=18&difficulty=medium&type=multiple";
  constructor() {
    this.getQuiz();
  }
  async getQuiz() {
    try {
      localStorage.removeItem("quizResult");
      this._loadSpinner(this.#mainContainer);
      let fetchQuiz = await Promise.race([fetch(this.#url), timeout(10)]);
      let quizData = await fetchQuiz.json();
      let { results } = quizData;
      results.forEach((qui, index) => {
        quizArr.push({
          id: this._generateRandomId(),
          IndexNo: ++index,
          question: qui.question,
          correct_answer: qui.correct_answer,
          options: [qui.correct_answer, ...qui.incorrect_answers],
        });
      });
      this.#mainContainer.classList.add('container')
      this.__renderQuizBtn();
    } catch (err) {
      throw err;
    }
  }
  _loadSpinner(element) {
    element.innerHTML = `<span class="loader"></span>`;
  }
  __renderQuizBtn() {
    this.#mainContainer.innerHTML = ``;
    quizArr.forEach((e, ind) => {
      this.#mainContainer.insertAdjacentHTML(
        "beforeend",
        `<button class="quiz-btn" data-id="${e.id}" data-IndexNo="${
          e.IndexNo
        }">${++ind}</button>`
      );
    });
    this._addEventHandler();
  }
  _addEventHandler() {
    this.#mainContainer.addEventListener("click", (e) => {
      document
        .querySelectorAll(".quiz-btn")
        .forEach((e) => e.classList.remove("active-quiz"));
      this.#elementBtn = e.target.closest(".quiz-btn");
      this.#currQuizNo = this.#elementBtn.dataset.indexno;
      this.#elementBtn.classList.add("active-quiz");
      if (!this.#elementBtn) return;
      this._renderQuiz(null, this.#elementBtn.dataset.id);
    });
  }
  _renderQuiz(quizNo, quizId) {
    if (quizNo) {
      this.#elementBtn.classList.add("active-quiz");
      this.#currQuiz = quizArr.find((e) => e.IndexNo === quizNo);
    }
    if (quizId) {
      this.#elementBtn.classList.add("active-quiz");
      this.#currQuiz = quizArr.find((e) => e.id === quizId);
    }
    this.#quizContainer.innerHTML = `<h2>Question ${this.#currQuiz.IndexNo}: ${
      this.#currQuiz.question
    }</h2>
       <form>
       
        ${this._shuffleArray(this.#currQuiz.options)
          .map((e, ind) => {
            return `
            <div class="input-con">
            <input type="radio" id="option-${
              ind + 1
            }" name="answer" value="${e}">
            <label for="option-${ind + 1}">${e}</label>
            </div>
            `;
          })
          .join("")}
            <input type="submit" id="submit" value="submit">
            <button class="end">End Quiz</button>
       </form>`;
    let form = document.querySelector("form");
    form.addEventListener("submit", this.submitForm.bind(this));
    this.#endBtn = document.querySelector(".end");
    this.#endBtn.addEventListener("click", this._displayResult.bind(this));
  }
  _getIndex(e) {
    if (this.#currQuizNo > 10) {
      this.#currQuizNo = 10;
      return this.#currQuizNo;
    }
    return ++this.#currQuizNo;
  }
  submitForm(e) {
    e.preventDefault();
    // if (this.#currQuizNo > 10) {
    //   this.#elementBtn.remove();
    // }
    this.#elementBtn.classList.remove("active-quiz");
    this.#elementBtn = document.querySelector(
      `[data-IndexNo="${this._getIndex(e)}"]`
    );
    // this.#currQuizNo < 10 ? ++this.#currQuizNo : (this.#currQuizNo = 1)
    let checkedBtn = document.querySelector('[type="radio"]:checked');
    if (!checkedBtn) {
      alert("Select any Option : ");
      this.#currQuizNo--;
      return;
    }
    state.results.push({
      question: this.#currQuiz.question,
      options: this.#currQuiz.options,
      selected: checkedBtn.value,
      correct: this.#currQuiz.correct_answer,
    });
    state.attemptedQuestion++;
    console.log("attempted ", state.attemptedQuestion);
    this._renderQuiz(this.#currQuizNo, null);
  }
  _generateRandomId() {
    let idCounter = Math.floor(Math.random() * 10);
    const timestamp = new Date().getTime().toString(36);
    const randomNumber = Math.random().toString(36).slice(2, 5);
    const uniqueId = `${timestamp}-${randomNumber}-${++idCounter}`;
    return uniqueId;
  }
  _shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
  _displayResult() {
    state.resultScore = state.attemptedQuestion;
    console.log(state.results, "score", state.resultScore);
    // state.resultScore -= ++state.results.length;
    state.results.forEach((e) => {
      if (e.selected !== e.correct) {
        state.resultScore--;
      }
    });
    localStorage.setItem(
      "quizResult",
      JSON.stringify({
        result: state.resultScore,
        quiz: quizArr,
      })
    );
    console.log(state.resultScore, state.attemptedQuestion);
    let confirmEnd = confirm("Do you want to end the quiz?");
    if (!confirmEnd) {
      this.#elementBtn.classList.add("active-quiz");
      this.#currQuizNo--;
      return;
    }
    window.location.href = `${window.location.origin}/result.html`;
  }
}
let btn = document.querySelector(".getQuiz");
btn.addEventListener("click", async () => {
  let quiz = new Quiz();
});
