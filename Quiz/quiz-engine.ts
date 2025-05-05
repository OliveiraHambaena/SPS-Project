interface Question {
    id: number;
    text: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
    hint?: string;
    image?: string;
}

interface QuizData {
    topic: string;
    subtopic: string;
    description: string;
    questions: Question[];
    totalMarks: number;
}

class QuizEngine {
    private quizData: QuizData;
    private currentQuestionIndex: number = 0;
    private userAnswers: (number | null)[] = [];
    private score: number = 0;
    private hintsUsed: boolean[] = [];
    private startTime: number = 0;
    private endTime: number = 0;
    private questionContainer: HTMLElement;
    private optionsContainer: HTMLElement;
    private feedbackContainer: HTMLElement;
    private progressBar: HTMLElement;
    private scoreDisplay: HTMLElement;
    private nextButton: HTMLElement;
    private prevButton: HTMLElement;
    private hintButton: HTMLElement;
    private questionNumberDisplay: HTMLElement;
    private timerDisplay: HTMLElement;
    private timerInterval: number | null = null;

    constructor(quizData: QuizData) {
        this.quizData = quizData;
        this.userAnswers = new Array(quizData.questions.length).fill(null);
        this.hintsUsed = new Array(quizData.questions.length).fill(false);
        
        // Initialize DOM elements
        this.questionContainer = document.getElementById('question-text') as HTMLElement;
        this.optionsContainer = document.getElementById('options-container') as HTMLElement;
        this.feedbackContainer = document.getElementById('feedback') as HTMLElement;
        this.progressBar = document.getElementById('progress-bar') as HTMLElement;
        this.scoreDisplay = document.getElementById('score-display') as HTMLElement;
        this.nextButton = document.getElementById('next-btn') as HTMLElement;
        this.prevButton = document.getElementById('prev-btn') as HTMLElement;
        this.hintButton = document.getElementById('hint-btn') as HTMLElement;
        this.questionNumberDisplay = document.getElementById('question-number') as HTMLElement;
        this.timerDisplay = document.getElementById('timer') as HTMLElement;
        
        // Set up event listeners
        this.nextButton.addEventListener('click', () => this.nextQuestion());
        this.prevButton.addEventListener('click', () => this.prevQuestion());
        this.hintButton.addEventListener('click', () => this.showHint());
        
        // Initialize question navigation buttons
        const questionNav = document.getElementById('question-nav') as HTMLElement;
        for (let i = 0; i < this.quizData.questions.length; i++) {
            const btn = document.createElement('div');
            btn.className = 'question-dot';
            btn.dataset.index = i.toString();
            btn.addEventListener('click', () => this.jumpToQuestion(i));
            questionNav.appendChild(btn);
        }
        
        // Initialize quiz
        this.startQuiz();
    }
    
    private startQuiz(): void {
        this.startTime = Date.now();
        this.loadQuestion(0);
        this.updateScore();
        this.startTimer();
        
        // Update topic and subtopic display
        const topicElement = document.getElementById('quiz-topic') as HTMLElement;
        const subtopicElement = document.getElementById('quiz-subtopic') as HTMLElement;
        const descriptionElement = document.getElementById('quiz-description') as HTMLElement;
        
        if (topicElement) topicElement.textContent = this.quizData.topic;
        if (subtopicElement) subtopicElement.textContent = this.quizData.subtopic;
        if (descriptionElement) descriptionElement.textContent = this.quizData.description;
    }
    
    private startTimer(): void {
        const startTime = Date.now();
        this.timerInterval = window.setInterval(() => {
            const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
            const minutes = Math.floor(elapsedSeconds / 60);
            const seconds = elapsedSeconds % 60;
            this.timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }
    
    private stopTimer(): void {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        this.endTime = Date.now();
    }
    
    private loadQuestion(index: number): void {
        if (index < 0 || index >= this.quizData.questions.length) return;
        
        this.currentQuestionIndex = index;
        const question = this.quizData.questions[index];
        
        // Update question text and image if available
        this.questionContainer.textContent = question.text;
        
        const imageContainer = document.getElementById('question-image-container') as HTMLElement;
        if (imageContainer) {
            if (question.image) {
                imageContainer.innerHTML = `<img src="${question.image}" alt="Question image" class="question-image">`;
                imageContainer.style.display = 'block';
            } else {
                imageContainer.style.display = 'none';
            }
        }
        
        // Clear previous options
        this.optionsContainer.innerHTML = '';
        
        // Add new options
        question.options.forEach((option, optionIndex) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option';
            
            // If this option was previously selected, add selected class
            if (this.userAnswers[index] === optionIndex) {
                optionElement.classList.add('selected');
                
                // If we've already answered, show if it was correct or incorrect
                if (optionIndex === question.correctAnswer) {
                    optionElement.classList.add('correct');
                } else {
                    optionElement.classList.add('incorrect');
                }
            }
            
            optionElement.textContent = option;
            optionElement.addEventListener('click', () => this.selectOption(optionIndex));
            this.optionsContainer.appendChild(optionElement);
        });
        
        // Update question number display
        this.questionNumberDisplay.textContent = `Question ${index + 1} of ${this.quizData.questions.length}`;
        
        // Update progress bar
        const progress = ((index + 1) / this.quizData.questions.length) * 100;
        this.progressBar.style.width = `${progress}%`;
        
        // Update navigation buttons
        this.prevButton.disabled = index === 0;
        this.nextButton.disabled = index === this.quizData.questions.length - 1 && this.userAnswers[index] === null;
        
        // Update hint button
        this.hintButton.disabled = this.hintsUsed[index] || !question.hint;
        
        // Clear feedback
        this.feedbackContainer.textContent = '';
        this.feedbackContainer.className = 'feedback';
        
        // Update question dots
        document.querySelectorAll('.question-dot').forEach((dot, i) => {
            dot.classList.remove('current', 'answered', 'correct', 'incorrect');
            
            if (i === index) {
                dot.classList.add('current');
            }
            
            if (this.userAnswers[i] !== null) {
                dot.classList.add('answered');
                
                if (this.userAnswers[i] === this.quizData.questions[i].correctAnswer) {
                    dot.classList.add('correct');
                } else {
                    dot.classList.add('incorrect');
                }
            }
        });
    }
    
    private selectOption(optionIndex: number): void {
        const currentQuestion = this.quizData.questions[this.currentQuestionIndex];
        const isCorrect = optionIndex === currentQuestion.correctAnswer;
        
        // If already answered, do nothing
        if (this.userAnswers[this.currentQuestionIndex] !== null) return;
        
        // Record user's answer
        this.userAnswers[this.currentQuestionIndex] = optionIndex;
        
        // Update score
        if (isCorrect) {
            this.score += 1;
        } else {
            // Penalty for wrong answer (optional)
            this.score = Math.max(0, this.score - 0.25);
        }
        
        this.updateScore();
        
        // Update option styling
        const options = this.optionsContainer.querySelectorAll('.option');
        options.forEach((option, i) => {
            option.classList.remove('selected', 'correct', 'incorrect');
            
            if (i === optionIndex) {
                option.classList.add('selected');
                
                if (isCorrect) {
                    option.classList.add('correct');
                } else {
                    option.classList.add('incorrect');
                }
            }
            
            // Show correct answer if user got it wrong
            if (!isCorrect && i === currentQuestion.correctAnswer) {
                option.classList.add('correct');
            }
        });
        
        // Show feedback
        if (isCorrect) {
            this.feedbackContainer.textContent = 'Correct! ' + currentQuestion.explanation;
            this.feedbackContainer.className = 'feedback success';
        } else {
            this.feedbackContainer.textContent = 'Incorrect. ' + currentQuestion.explanation;
            this.feedbackContainer.className = 'feedback error';
        }
        
        // Enable next button
        this.nextButton.disabled = this.currentQuestionIndex === this.quizData.questions.length - 1;
        
        // Update question dot
        const currentDot = document.querySelector(`.question-dot[data-index="${this.currentQuestionIndex}"]`);
        if (currentDot) {
            currentDot.classList.add('answered');
            if (isCorrect) {
                currentDot.classList.add('correct');
            } else {
                currentDot.classList.add('incorrect');
            }
        }
        
        // Check if quiz is complete
        this.checkQuizCompletion();
    }
    
    private showHint(): void {
        const currentQuestion = this.quizData.questions[this.currentQuestionIndex];
        
        if (!currentQuestion.hint || this.hintsUsed[this.currentQuestionIndex]) return;
        
        // Mark hint as used
        this.hintsUsed[this.currentQuestionIndex] = true;
        
        // Show hint
        this.feedbackContainer.textContent = `Hint: ${currentQuestion.hint}`;
        this.feedbackContainer.className = 'feedback hint';
        
        // Disable hint button
        this.hintButton.disabled = true;
    }
    
    private nextQuestion(): void {
        if (this.currentQuestionIndex < this.quizData.questions.length - 1) {
            this.loadQuestion(this.currentQuestionIndex + 1);
        } else {
            this.finishQuiz();
        }
    }
    
    private prevQuestion(): void {
        if (this.currentQuestionIndex > 0) {
            this.loadQuestion(this.currentQuestionIndex - 1);
        }
    }
    
    private jumpToQuestion(index: number): void {
        this.loadQuestion(index);
    }
    
    private updateScore(): void {
        const percentage = Math.round((this.score / this.quizData.questions.length) * 100);
        this.scoreDisplay.textContent = `Score: ${this.score}/${this.quizData.questions.length} (${percentage}%)`;
    }
    
    private checkQuizCompletion(): void {
        const allAnswered = this.userAnswers.every(answer => answer !== null);
        
        if (allAnswered) {
            // Show completion button
            const completeBtn = document.getElementById('complete-btn');
            if (completeBtn) {
                completeBtn.style.display = 'block';
                completeBtn.addEventListener('click', () => this.finishQuiz());
            }
        }
    }
    
    private finishQuiz(): void {
        this.stopTimer();
        
        // Calculate final score
        const correctAnswers = this.userAnswers.filter((answer, index) => 
            answer === this.quizData.questions[index].correctAnswer
        ).length;
        
        const percentage = Math.round((correctAnswers / this.quizData.questions.length) * 100);
        const timeSpent = Math.floor((this.endTime - this.startTime) / 1000);
        const minutes = Math.floor(timeSpent / 60);
        const seconds = timeSpent % 60;
        
        // Hide quiz container
        const quizContainer = document.getElementById('quiz-container');
        if (quizContainer) quizContainer.style.display = 'none';
        
        // Show results container
        const resultsContainer = document.getElementById('results-container');
        if (resultsContainer) {
            resultsContainer.style.display = 'block';
            
            // Update results
            const scoreElement = document.getElementById('final-score');
            const timeElement = document.getElementById('completion-time');
            const messageElement = document.getElementById('completion-message');
            
            if (scoreElement) scoreElement.textContent = `${correctAnswers}/${this.quizData.questions.length} (${percentage}%)`;
            if (timeElement) timeElement.textContent = `${minutes}m ${seconds}s`;
            
            if (messageElement) {
                if (percentage >= 90) {
                    messageElement.textContent = 'Excellent! You have mastered this topic!';
                    messageElement.className = 'excellent';
                } else if (percentage >= 70) {
                    messageElement.textContent = 'Great job! You have a good understanding of this topic.';
                    messageElement.className = 'great';
                } else if (percentage >= 50) {
                    messageElement.textContent = 'Good effort! You're on the right track.';
                    messageElement.className = 'good';
                } else {
                    messageElement.textContent = 'Keep practicing! You'll improve with more study.';
                    messageElement.className = 'needs-improvement';
                }
            }
            
            // Generate review section
            const reviewContainer = document.getElementById('review-container');
            if (reviewContainer) {
                this.quizData.questions.forEach((question, index) => {
                    const userAnswer = this.userAnswers[index];
                    const isCorrect = userAnswer === question.correctAnswer;
                    
                    const questionReview = document.createElement('div');
                    questionReview.className = `question-review ${isCorrect ? 'correct' : 'incorrect'}`;
                    
                    questionReview.innerHTML = `
                        <div class="review-question">${index + 1}. ${question.text}</div>
                        <div class="review-answer">
                            Your answer: ${userAnswer !== null ? question.options[userAnswer] : 'Not answered'}
                            ${isCorrect ? 
                                '<span class="correct-mark">✓</span>' : 
                                `<span class="incorrect-mark">✗</span> Correct answer: ${question.options[question.correctAnswer]}`
                            }
                        </div>
                        <div class="review-explanation">${question.explanation}</div>
                    `;
                    
                    reviewContainer.appendChild(questionReview);
                });
            }
            
            // Save results to localStorage
            this.saveResults(correctAnswers, percentage, timeSpent);
        }
    }
    
    private saveResults(correctAnswers: number, percentage: number, timeSpent: number): void {
        const results = {
            topic: this.quizData.topic,
            subtopic: this.quizData.subtopic,
            correctAnswers,
            totalQuestions: this.quizData.questions.length,
            percentage,
            timeSpent,
            date: new Date().toISOString(),
            hintsUsed: this.hintsUsed.filter(Boolean).length
        };
        
        // Get existing results or initialize empty array
        const existingResults = JSON.parse(localStorage.getItem('quizResults') || '[]');
        existingResults.push(results);
        
        // Save back to localStorage
        localStorage.setItem('quizResults', JSON.stringify(existingResults));
        
        // Update achievements
        this.updateAchievements(percentage, timeSpent);
    }
    
    private updateAchievements(percentage: number, timeSpent: number): void {
        const achievements = JSON.parse(localStorage.getItem('achievements') || '{}');
        
        // First completion achievement
        achievements.firstCompletion = true;
        
        // Perfect score achievement
        if (percentage === 100) {
            achievements.perfectScore = true;
        }
        
        // Speed demon achievement (complete in under 2 minutes)
        if (timeSpent < 120) {
            achievements.speedDemon = true;
        }
        
        // Topic mastery achievements
        const results = JSON.parse(localStorage.getItem('quizResults') || '[]');
        const topicResults = results.filter(r => r.topic === this.quizData.topic);
        const uniqueSubtopics = new Set(topicResults.map(r => r.subtopic));
        
        // Check if all subtopics for this topic