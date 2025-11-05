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
      questions,
      status
    } = req.body;

    // Validate required fields
    if (!title || !questions || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Title and at least one question are required'
      });
    }

    // Determine isActive based on status, default to true
    const isActive = status === 'inactive' ? false : true;

    // Create quiz
    const quiz = await Quiz.create({
      title,
      description,
      category,
      difficulty: difficulty || 'none',
      time_limit: timeLimit,
      xp_reward: xpReward || 100,
      is_active: isActive,
      created_at: new Date(),
      updated_at: new Date()
    });

    const quizId = quiz.quiz_id;

    console.log('Created quiz with ID:', quizId);

    // Create questions and options
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];

      // Convert frontend type to backend type
      const questionType = q.type === 'multiple-choice' ? 'multiple_choice' : 
                          q.type === 'yes-true' ? 'true_false' : 
                          q.type;

      const question = await QuizQuestion.create({
        quiz_id: quizId,
        question_text: q.text,
        question_type: questionType,
        points: q.points || 10,
        correct_answer: q.correctAnswer,
        question_order: i + 1
      });

      const questionId = question.question_id;
      console.log('Created question with ID:', questionId);

      // Create options for multiple choice questions
      if (questionType === 'multiple_choice' && q.options && q.options.length > 0) {
        const optionsData = q.options
          .filter(opt => opt && opt.trim() !== '')
          .map((opt, index) => ({
            question_id: questionId,
            option_text: opt,
            option_order: index + 1
          }));

        if (optionsData.length > 0) {
          await QuizQuestionOption.bulkCreate(optionsData);
        }
      }
    }

    // Fetch the complete quiz
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

    // Transform to frontend format
    const transformedQuiz = transformQuiz(completeQuiz.toJSON());

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      data: transformedQuiz
    });
  } catch (error) {
    console.error('Error creating quiz:', error);
    next(error);
  }
}

// Update existing quiz
export async function updateQuiz(req, res, next) {
  try {
    const models = await initializeModels();
    const { Quiz, QuizQuestion, QuizQuestionOption, QuizAttempt, UserAnswer } = models;
    const { id } = req.params;

    const {
      title,
      description,
      category,
      difficulty,
      timeLimit,
      xpReward,
      questions,
      status
    } = req.body;

    // Find existing quiz
    const quiz = await Quiz.findByPk(id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Determine isActive based on status, default to true
    const isActive = status === 'inactive' ? false : true;

    // Update quiz details
    await quiz.update({
      title,
      description,
      category,
      difficulty: difficulty || 'none',
      time_limit: timeLimit,
      xp_reward: xpReward || 100,
      is_active: isActive,
      updated_at: new Date()
    });

    const quizId = quiz.quiz_id;

    // Delete existing questions and options
    const existingQuestions = await QuizQuestion.findAll({
      where: { quiz_id: quizId }
    });

    for (const existingQuestion of existingQuestions) {
      const questionId = existingQuestion.question_id;
      await QuizQuestionOption.destroy({
        where: { question_id: questionId }
      });
    }

    await QuizQuestion.destroy({
      where: { quiz_id: quizId }
    });

    // Create new questions and options
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];

      const questionType = q.type === 'multiple-choice' ? 'multiple_choice' : 
                          q.type === 'yes-true' ? 'true_false' : 
                          q.type;

      const question = await QuizQuestion.create({
        quiz_id: quizId,
        question_text: q.text,
        question_type: questionType,
        points: q.points || 10,
        correct_answer: q.correctAnswer,
        question_order: i + 1
      });

      const questionId = question.question_id;

      if (questionType === 'multiple_choice' && q.options && q.options.length > 0) {
        const optionsData = q.options
          .filter(opt => opt && opt.trim() !== '')
          .map((opt, index) => ({
            question_id: questionId,
            option_text: opt,
            option_order: index + 1
          }));

        if (optionsData.length > 0) {
          await QuizQuestionOption.bulkCreate(optionsData);
        }
      }
    }

    // Fetch the updated quiz
    const updatedQuiz = await Quiz.findByPk(quizId, {
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
        },
        {
          model: QuizAttempt,
          as: 'attempts',
          required: false,
          include: [
            {
              model: UserAnswer,
              as: 'answers'
            }
          ]
        }
      ]
    });

    // Transform to frontend format
    const transformedQuiz = transformQuiz(updatedQuiz.toJSON());

    res.json({
      success: true,
      message: 'Quiz updated successfully',
      data: transformedQuiz
    });
  } catch (error) {
    console.error('Error updating quiz:', error);
    next(error);
  }
}

// Helper function to transform quiz data to frontend format
function transformQuiz(quizJson) {
  const transformedQuestions = (quizJson.questions || []).map(q => {
    const questionType = q.question_type;
    const frontendType = questionType === 'multiple_choice' ? 'multiple-choice' :
                        questionType === 'true_false' ? 'yes-true' : 
                        questionType;

    return {
      question_id: q.question_id,
      text: q.question_text || '',
      type: frontendType,
      options: q.options?.map(opt => opt.option_text).filter(Boolean) || [],
      correctAnswer: q.correct_answer || '',
      points: q.points || 10
    };
  });

  const transformedAttempts = (quizJson.attempts || []).map(attempt => {
    const attemptAnswers = (attempt.answers || []).map(ans => ({
      questionId: ans.question_id,
      submittedAnswer: ans.user_answer,
      isCorrect: ans.is_correct,
      pointsEarned: ans.points_earned
    }));
    


    return {
      userId: attempt.user_id,
      username: attempt.username || `User ${attempt.user_id}`,
      score: attempt.score || 0,
      maxScore: attempt.total_points || 0,
      submittedAt: attempt.completed_at || attempt.started_at,
      answers: attemptAnswers
    };
  }).filter(attempt => attempt.submittedAt);

  return {
    id: quizJson.quiz_id,
    title: quizJson.title || '',
    description: quizJson.description || '',
    difficulty: (quizJson.difficulty || 'none').toLowerCase(),
    category: quizJson.category || null,
    timeLimit: quizJson.time_limit || null,
    xpReward: quizJson.xp_reward || 100,
    isActive: quizJson.is_active ?? true, // Default null to true
    createdAt: quizJson.created_at,
    updatedAt: quizJson.updated_at,
    createdBy: quizJson.created_by || null,
    deletedAt: null,
    questions: transformedQuestions,
    questionCount: transformedQuestions.length,
    attempts: transformedAttempts
  };
}

// Get all quizzes with attempts
export async function getAllQuizzes(req, res, next) {
  try {
    const models = await initializeModels();
    const { Quiz, QuizQuestion, QuizQuestionOption, QuizAttempt, UserAnswer } = models;

    const quizzes = await Quiz.findAll({
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
        },
        {
          model: QuizAttempt,
          as: 'attempts',
          required: false,
          include: [
            {
              model: UserAnswer,
              as: 'answers'
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    const transformedQuizzes = quizzes.map(quiz => transformQuiz(quiz.toJSON()));

    res.json({
      success: true,
      data: transformedQuizzes
    });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    next(error);
  }
}

// Get quiz by ID with questions and attempts
export async function getQuizById(req, res, next) {
  try {
    const models = await initializeModels();
    const { Quiz, QuizQuestion, QuizQuestionOption, QuizAttempt, UserAnswer } = models;
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
          ]
        },
        {
          model: QuizAttempt,
          as: 'attempts',
          required: false,
          include: [
            {
              model: UserAnswer,
              as: 'answers'
            }
          ]
        }
      ]
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    const transformedQuiz = transformQuiz(quiz.toJSON());

    res.json({
      success: true,
      data: transformedQuiz
    });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    next(error);
  }
}

// Quick status update
export async function updateQuizStatus(req, res, next) {
  try {
    const models = await initializeModels();
    const { Quiz } = models;
    const { id } = req.params;
    const { status } = req.body;

    const quiz = await Quiz.findByPk(id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Determine isActive based on status, default to true
    const isActive = status === 'inactive' ? false : true;

    await quiz.update({
      is_active: isActive,
      updated_at: new Date()
    });

    const transformedQuiz = transformQuiz(quiz.toJSON());

    res.json({
      success: true,
      message: 'Quiz status updated successfully',
      data: transformedQuiz
    });
  } catch (error) {
    console.error('Error updating quiz status:', error);
    next(error);
  }
}

// Start quiz attempt
export async function startQuizAttempt(req, res, next) {
  try {
    const models = await initializeModels();
    const { QuizAttempt, Quiz, QuizQuestion, User } = models;
    const { quizId, userId } = req.body;

    // Find user by MICROSOFT_ID
    const user = await User.findOne({
      where: { MICROSOFT_ID: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const dbUserId = user.ID;

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

    const quizIdPk = quiz.quiz_id;
    const totalPoints = quiz.questions.reduce((sum, q) => sum + (q.points || 0), 0);

    const attempt = await QuizAttempt.create({
      quiz_id: quizIdPk,
      user_id: dbUserId, // Use database ID
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

    const question = await QuizQuestion.findByPk(questionId);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    const correctAnswer = question.correct_answer;
    const points = question.points || 10;

    const isCorrect = correctAnswer.toLowerCase().trim() === userAnswer.toLowerCase().trim();
    const pointsEarned = isCorrect ? points : 0;

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

// Bulk submit all quiz answers at once
export async function submitQuizAnswers(req, res, next) {
  try {
    const models = await initializeModels();
    const { QuizAttempt, UserAnswer, QuizQuestion, Quiz, User } = models;
    const { id } = req.params; // quiz ID
    const { userId, answers } = req.body; // userId is Azure AD localAccountId

    console.log('=== BULK SUBMIT DEBUG ===');
    console.log('Quiz ID:', id);
    console.log('User ID (Azure/MICROSOFT_ID):', userId);
    console.log('Answers received:', answers?.length || 0);

    // Validate input
    if (!userId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'User ID and answers array are required'
      });
    }

    // UPDATED: Find user by MICROSOFT_ID
    let user = await User.findOne({
      where: { MICROSOFT_ID: userId }
    });

    // If user doesn't exist, return error
    if (!user) {
      console.error('User not found with MICROSOFT_ID:', userId);
      return res.status(404).json({
        success: false,
        message: 'User not found. Please ensure you are registered in the system.'
      });
    }

    const dbUserId = user.ID; // Get the database ID (primary key)
    console.log('Database User ID:', dbUserId);
    console.log('User Email:', user.MAIL);
    console.log('User Display Name:', user.DISPLAYNAME);

    // Get quiz with questions
    const quiz = await Quiz.findByPk(id, {
      include: [
        {
          model: QuizQuestion,
          as: 'questions',
          attributes: ['question_id', 'points', 'correct_answer']
        }
      ]
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    console.log('Quiz found:', quiz.title);
    console.log('Questions in quiz:', quiz.questions.length);

    // Calculate total points
    const totalPoints = quiz.questions.reduce((sum, q) => sum + (q.points || 0), 0);

    // UPDATED: Create quiz attempt with database user ID
    const attempt = await QuizAttempt.create({
      quiz_id: quiz.quiz_id,
      user_id: dbUserId, // Use the database ID, not Azure ID
      total_points: totalPoints,
      status: 'in_progress',
      started_at: new Date()
    });

    console.log('Created attempt ID:', attempt.attempt_id);

    let score = 0;
    const savedAnswers = [];

    // Process each answer
    for (const answerData of answers) {
      const { question_id, answer } = answerData;
      
      // Find the question
      const question = quiz.questions.find(q => q.question_id === question_id);
      
      if (!question) {
        console.warn(`Question ${question_id} not found in quiz`);
        continue;
      }

      const userAnswerText = (answer || '').toString().trim();
      const correctAnswer = (question.correct_answer || '').toString().trim();
      const points = question.points || 10;

      // Check if correct (case-insensitive)
      const isCorrect = correctAnswer.toLowerCase() === userAnswerText.toLowerCase();
      const pointsEarned = isCorrect ? points : 0;
      
      score += pointsEarned;

      // Save answer to USER_ANSWERS table
      const savedAnswer = await UserAnswer.create({
        attempt_id: attempt.attempt_id,
        question_id: question_id,
        user_answer: userAnswerText,
        is_correct: isCorrect,
        points_earned: pointsEarned,
        answered_at: new Date()
      });

      savedAnswers.push(savedAnswer);
      console.log(`Question ${question_id}: ${isCorrect ? 'Correct' : 'Incorrect'} (${pointsEarned}/${points} points)`);
    }

    // Calculate percentage
    const percentage = totalPoints > 0 ? (score / totalPoints) * 100 : 0;

    // Complete the attempt
    await attempt.update({
      score,
      percentage: percentage.toFixed(2),
      completed_at: new Date(),
      time_taken: 0, // Frontend doesn't track time
      status: 'completed'
    });

    console.log('=== SUBMISSION COMPLETE ===');
    console.log('Final score:', score, '/', totalPoints);
    console.log('Percentage:', percentage.toFixed(2) + '%');
    console.log('Answers saved:', savedAnswers.length);

    res.status(201).json({
      success: true,
      message: 'Quiz submitted successfully',
      data: {
        attemptId: attempt.attempt_id,
        score,
        totalPoints,
        percentage: percentage.toFixed(2),
        answersSubmitted: savedAnswers.length
      }
    });
  } catch (error) {
    console.error('Error submitting quiz answers:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    
    // Return more helpful error message
    res.status(500).json({
      success: false,
      message: 'Failed to submit quiz',
      error: error.message
    });
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

    const score = attempt.answers.reduce((sum, answer) => sum + (answer.points_earned || 0), 0);
    const totalPoints = attempt.total_points || 0;
    const percentage = totalPoints > 0 ? (score / totalPoints) * 100 : 0;

    const startedAt = attempt.started_at;
    const timeTaken = Math.floor((new Date() - new Date(startedAt)) / 1000);

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
        totalPoints,
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
    const { QuizAttempt, Quiz, UserAnswer, User } = models;
    const { userId } = req.params; // This is MICROSOFT_ID

    // Find user by MICROSOFT_ID
    const user = await User.findOne({
      where: { MICROSOFT_ID: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const dbUserId = user.ID;

    const attempts = await QuizAttempt.findAll({
      where: { user_id: dbUserId },
      include: [
        {
          model: Quiz,
          as: 'quiz',
          attributes: ['quiz_id', 'title', 'category', 'difficulty']
        },
        {
          model: UserAnswer,
          as: 'answers'
        }
      ],
      order: [['started_at', 'DESC']]
    });

    const transformedAttempts = attempts.map(attempt => {
      const attemptJson = attempt.toJSON();
      const attemptAnswers = (attemptJson.answers || []).map(ans => ({
        questionId: ans.question_id,
        submittedAnswer: ans.user_answer,
        isCorrect: ans.is_correct,
        pointsEarned: ans.points_earned
      }));

      return {
        userId: attemptJson.user_id,
        username: user.DISPLAYNAME || user.MAIL || `User ${attemptJson.user_id}`,
        score: attemptJson.score || 0,
        maxScore: attemptJson.total_points || 0,
        submittedAt: attemptJson.completed_at || attemptJson.started_at,
        answers: attemptAnswers,
        quiz: {
          id: attemptJson.quiz?.quiz_id,
          title: attemptJson.quiz?.title,
          category: attemptJson.quiz?.category,
          difficulty: attemptJson.quiz?.difficulty
        }
      };
    });

    res.json({
      success: true,
      data: transformedAttempts
    });
  } catch (error) {
    console.error('Error fetching user attempts:', error);
    next(error);
  }
}

// Delete quiz (soft delete)
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

    await quiz.update({
      is_active: false,
      updated_at: new Date()
    });

    res.json({
      success: true,
      message: 'Quiz deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    next(error);
  }
}