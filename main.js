import "core-js/stable";
import "regenerator-runtime/runtime";
let quizArr = [];
let state = {
  resultScore: 10,
  attemptedQuestion: 0,
  results: [],
};
class Quiz {
  #mainContainer = document.querySelector(".container");
  #quizContainer = document.querySelector(".quiz-con");
  #currQuiz;
  #currQuizNo = 1;
  #elementBtn;
  #endBtn;
  constructor() {
    this.getQuiz();
  }
  async getQuiz() {
    try {
      localStorage.removeItem("quizResult");
      this.#mainContainer.innerHTML = `<span class="loader"></span>`;
      let fetchQuize = await fetch(
        "https://opentdb.com/api.php?amount=10&category=18&difficulty=medium&type=multiple"
        // 'https://opentdb.com/api.php?amount=10'
      );
      let quizData = await fetchQuize.json();
      let { results } = quizData;
      results.forEach((qui, index) => {
        quizArr.push({
          id: this.generateRandomId(),
          IndexNo: ++index,
          question: qui.question,
          correct_answer: qui.correct_answer,
          options: [qui.correct_answer, ...qui.incorrect_answers],
        });
      });
      this.renderQuizBtn();
    } catch (err) {
      throw err;
    }
  }
  renderQuizBtn() {
    this.#mainContainer.innerHTML = ``;
    quizArr.forEach((e, ind) => {
      this.#mainContainer.insertAdjacentHTML(
        "beforeend",
        `<button class="quiz-btn" data-id="${e.id}" data-IndexNo="${
          e.IndexNo
        }">${++ind}</button>`
      );
    });
    this.addEventHandler();
  }
  addEventHandler() {
    this.#mainContainer.addEventListener("click", (e) => {
      document
        .querySelectorAll(".quiz-btn")
        .forEach((e) => e.classList.remove("active-quiz"));
      this.#elementBtn = e.target.closest(".quiz-btn");
      this.#currQuizNo = this.#elementBtn.dataset.indexno;
      this.#elementBtn.classList.add("active-quiz");
      if (!this.#elementBtn) return;
      this.renderQuiz(null, this.#elementBtn.dataset.id);
    });
  }
  renderQuiz(quizNo, quizId) {
    if (quizNo) {
      this.#elementBtn.classList.add("active-quiz");
      this.#currQuiz = quizArr.find((e) => e.IndexNo === quizNo);
    }
    if (quizId) {
      this.#elementBtn.classList.add("active-quiz");
      this.#currQuiz = quizArr.find((e) => e.id === quizId);
      // this.#currQuizNo = this.#currQuiz.IndexNo;
    }
    this.#quizContainer.innerHTML = `<h2>Question ${
      this.#currQuiz.IndexNo >= 10
        ? (this.#currQuiz.IndexNo = 1)
        : this.#currQuiz.IndexNo
    }: ${this.#currQuiz.question}</h2>
       <form>
       
        ${this.shuffleArray(this.#currQuiz.options)
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
    this.#endBtn.addEventListener("click", this.displayResult.bind(this));
  }
  submitForm(e) {
    e.preventDefault();
    this.#elementBtn.classList.remove("active-quiz");
    this.#elementBtn = document.querySelector(
      `[data-IndexNo="${
        this.#currQuizNo < 10 ? ++this.#currQuizNo : (this.#currQuizNo = 1)
      }"]`
    );
    document.querySelectorAll('[type="radio"]:checked').forEach((e) => {
      state.results.push({
        question: this.#currQuiz.question,
        options: this.#currQuiz.options,
        selected: e.value,
        correct: this.#currQuiz.correct_answer,
      });
    });
    if (!state.results) {
      alert("Select any Option : ");
      this.#currQuizNo--;
      return;
    }
    state.attemptedQuestion++;
    this.renderQuiz(this.#currQuizNo, null);
  }
  generateRandomId() {
    let idCounter = Math.floor(Math.random() * 10);
    const timestamp = new Date().getTime().toString(36);
    const randomNumber = Math.random().toString(36).slice(2, 5);
    const uniqueId = `${timestamp}-${randomNumber}-${++idCounter}`;
    return uniqueId;
  }
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
  displayResult() {
    let confirmEnd = confirm("Do you want to end the quiz ?");
    if (!confirmEnd) {
      this.#currQuizNo--;
      return;
    }
    window.location.href = "http://localhost:1234/result.html";
    let rdata;
    if (!state.attemptedQuestion == 10) {
      rdata = state.resultScore - state.attemptedQuestion;
      state.resultScore -= rdata;
    }
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
  }
}
let btn = document.querySelector(".getQuiz");
btn.addEventListener("click", async () => {
  let quiz = new Quiz();
});
