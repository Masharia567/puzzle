import { initializeModels } from '../models/index.js';


// Create a new quiz with questions
export async function createQuiz(req, res, next) {
  try {
    const models = await initializeModels();
    const { Quiz, QuizQuestion, QuizQuestionOption } = models;

    const {
      title,
      description,
      category,
      difficulty,
      timeLimit,
      xpReward,
      questions
    } = req.body;
    

    // Validate required fields
    if (!title || !questions || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Title and at least one question are required'
      });
    }


    // Create quiz
    const quiz = await Quiz.create({
      TITLE: title,
      DESCRIPTION: description,
      CATEGORY: category,
      DIFFICULTY: difficulty || 'medium',
      TIME_LIMIT: timeLimit,
      XP_REWARD: xpReward || 100,
      IS_ACTIVE: true
    });

    
    


    // Get the primary key value (could be quiz_id, id, or QUIZ_ID)
    const quizId = quiz.quiz_id || quiz.QUIZ_ID || quiz.id;

    console.log('Created quiz with ID:', quizId); // Debug log

    // Create questions and options
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      console.log(`Creating question #${i + 1}:`, JSON.stringify(q, null, 2));

      
      const question = await QuizQuestion.create({
        quiz_id: quizId, // Use the correct quiz ID
        question_text: q.text,
        question_type: q.type,
        points: q.points || 10,
        correct_answer: q.correctAnswer,
        question_order: i + 1
      });
      

      // Get the question ID
      const questionId = question.question_id || question.QUESTION_ID || question.id;

      console.log('Created question with ID:', questionId); // Debug log

      // Create options for multiple choice questions
      if (q.type === 'multiple_choice' && q.options && q.options.length > 0) {
        const optionsData = q.options
          .filter(opt => opt.trim() !== '')
          .map((opt, index) => ({
            question_id: questionId, // Use the correct question ID
            option_text: opt,
            option_order: index + 1
          }));

        if (optionsData.length > 0) {
          await QuizQuestionOption.bulkCreate(optionsData);
        }
      }
    }

    // Fetch the complete quiz with questions and options
    const completeQuiz = await Quiz.findByPk(quizId, {
      include: [
        {
          model: QuizQuestion,
          as: 'questions',
          include: [
            {
              model: QuizQuestionOption,
              as: 'options'
            }
          ]
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      data: completeQuiz
    });
  } catch (error) {
    console.error('Error creating quiz:', error);
    next(error);
  }
}

// Get all quizzes
export async function getAllQuizzes(req, res, next) {
  try {
    const models = await initializeModels();
    const { Quiz, QuizQuestion } = models;

    const quizzes = await Quiz.findAll({
      where: { is_active: true },
      include: [
        {
          model: QuizQuestion,
          as: 'questions',
          attributes: ['question_id']
        }
      ],
      order: [['CREATED_AT', 'DESC']]
    });

    // Add question count
    const quizzesWithCount = quizzes.map(quiz => {
      const quizJson = quiz.toJSON();
      return {
        ...quizJson,
        questionCount: quizJson.questions?.length || 0,
        questions: undefined
      };
    });

    res.json({
      success: true,
      data: quizzesWithCount
    });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    next(error);
  }
}

// Get quiz by ID with questions
export async function getQuizById(req, res, next) {
  try {
    const models = await initializeModels();
    const { Quiz, QuizQuestion, QuizQuestionOption } = models;
    const { id } = req.params;

    const quiz = await Quiz.findByPk(id, {
      include: [
        {
          model: QuizQuestion,
          as: 'questions',
          include: [
            {
              model: QuizQuestionOption,
              as: 'options'
            }
          ],
          order: [['question_order', 'ASC']]
        }
      ]
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    res.json({
      success: true,
      data: quiz
    });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    next(error);
  }
}

// Start quiz attempt
export async function startQuizAttempt(req, res, next) {
  try {
    const models = await initializeModels();
    const { QuizAttempt, Quiz, QuizQuestion } = models;
    const { quizId, userId } = req.body;

    // Check if quiz exists
    const quiz = await Quiz.findByPk(quizId, {
      include: [
        {
          model: QuizQuestion,
          as: 'questions',
          attributes: ['question_id', 'points']
        }
      ]
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    const quizId_pk = quiz.quiz_id || quiz.QUIZ_ID || quiz.id;

    // Calculate total points
    const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);

    // Create attempt
    const attempt = await QuizAttempt.create({
      quiz_id: quizId_pk,
      user_id: userId,
      total_points: totalPoints,
      status: 'in_progress',
      started_at: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Quiz attempt started',
      data: attempt
    });
  } catch (error) {
    console.error('Error starting quiz attempt:', error);
    next(error);
  }
}

// Submit answer
export async function submitAnswer(req, res, next) {
  try {
    const models = await initializeModels();
    const { UserAnswer, QuizQuestion } = models;
    const { attemptId, questionId, userAnswer } = req.body;

    // Get question details
    const question = await QuizQuestion.findByPk(questionId);
    
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Check if answer is correct
    const isCorrect = question.correct_answer.toLowerCase().trim() === userAnswer.toLowerCase().trim();
    const pointsEarned = isCorrect ? question.points : 0;

    // Save answer
    const answer = await UserAnswer.create({
      attempt_id: attemptId,
      question_id: questionId,
      user_answer: userAnswer,
      is_correct: isCorrect,
      points_earned: pointsEarned,
      answered_at: new Date()
    });

    res.status(201).json({
      success: true,
      data: {
        ...answer.toJSON(),
        isCorrect,
        pointsEarned
      }
    });
  } catch (error) {
    console.error('Error submitting answer:', error);
    next(error);
  }
}

// Complete quiz attempt
export async function completeQuizAttempt(req, res, next) {
  try {
    const models = await initializeModels();
    const { QuizAttempt, UserAnswer } = models;
    const { attemptId } = req.params;

    const attempt = await QuizAttempt.findByPk(attemptId, {
      include: [
        {
          model: UserAnswer,
          as: 'answers'
        }
      ]
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Attempt not found'
      });
    }

    // Calculate score
    const score = attempt.answers.reduce((sum, answer) => sum + answer.points_earned, 0);
    const percentage = (score / attempt.total_points) * 100;

    // Calculate time taken
    const timeTaken = Math.floor((new Date() - new Date(attempt.started_at)) / 1000);

    // Update attempt
    await attempt.update({
      score,
      percentage: percentage.toFixed(2),
      completed_at: new Date(),
      time_taken: timeTaken,
      status: 'completed'
    });

    res.json({
      success: true,
      message: 'Quiz completed',
      data: {
        score,
        totalPoints: attempt.total_points,
        percentage: percentage.toFixed(2),
        timeTaken
      }
    });
  } catch (error) {
    console.error('Error completing quiz attempt:', error);
    next(error);
  }
}

// Get user's quiz attempts
export async function getUserAttempts(req, res, next) {
  try {
    const models = await initializeModels();
    const { QuizAttempt, Quiz } = models;
    const { userId } = req.params;

    const attempts = await QuizAttempt.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Quiz,
          as: 'quiz',
          attributes: ['quiz_id', 'title', 'category', 'difficulty']
        }
      ],
      order: [['started_at', 'DESC']]
    });

    res.json({
      success: true,
      data: attempts
    });
  } catch (error) {
    console.error('Error fetching user attempts:', error);
    next(error);
  }
}

// Delete quiz
export async function deleteQuiz(req, res, next) {
  try {
    const models = await initializeModels();
    const { Quiz } = models;
    const { id } = req.params;

    const quiz = await Quiz.findByPk(id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Soft delete
    await quiz.update({ is_active: false });

    res.json({
      success: true,
      message: 'Quiz deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    next(error);
  }
}