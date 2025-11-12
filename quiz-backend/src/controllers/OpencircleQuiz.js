import { initializeModels } from '../models/index.js';
import { Sequelize } from 'sequelize';

// Get models (lazy initialization)
let OpencircleQuiz, OpencircleComment;

async function getModels() {
  if (!OpencircleQuiz) {
    const sequelize = new Sequelize(/* your DB config */);
    const models = await initializeModels(sequelize);
    OpencircleQuiz = models.OpencircleQuiz;
    OpencircleComment = models.OpencircleComment;
  }
  return { OpencircleQuiz, OpencircleComment };
}

export const quizController = {
  createQuiz: async (req, res) => {
    try {
      const { author, avatar, title, content, type } = req.body;
      const { OpencircleQuiz } = await getModels();
      const quiz = await OpencircleQuiz.create({ author, avatar, title, content, type });
      return res.status(201).json(quiz);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  getAllQuizzes: async (req, res) => {
    try {
      const { OpencircleQuiz, OpencircleComment } = await getModels();
      const quizzes = await OpencircleQuiz.findAll({
        include: [{ model: OpencircleComment, as: 'comments' }]
      });
      return res.json(quizzes);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  getQuizById: async (req, res) => {
    try {
      const { id } = req.params;
      const { OpencircleQuiz, OpencircleComment } = await getModels();
      const quiz = await OpencircleQuiz.findByPk(id, {
        include: [{ model: OpencircleComment, as: 'comments' }]
      });
      if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
      return res.json(quiz);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  updateQuiz: async (req, res) => {
    try {
      const { id } = req.params;
      const { author, avatar, title, content, type, likes, isMyPost, trending } = req.body;
      const { OpencircleQuiz } = await getModels();
      const quiz = await OpencircleQuiz.findByPk(id);
      if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
      await quiz.update({ author, avatar, title, content, type, likes, isMyPost, trending });
      return res.json(quiz);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  deleteQuiz: async (req, res) => {
    try {
      const { id } = req.params;
      const { OpencircleQuiz } = await getModels();
      const quiz = await OpencircleQuiz.findByPk(id);
      if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
      await quiz.destroy();
      return res.status(204).send();
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
};

export const commentController = {
  createComment: async (req, res) => {
    try {
      const { quizId } = req.params;
      const { author, avatar, text, type } = req.body;
      const { OpencircleQuiz, OpencircleComment } = await getModels();
      const quiz = await OpencircleQuiz.findByPk(quizId);
      if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
      const comment = await OpencircleComment.create({ quizId, author, avatar, text, type });
      return res.status(201).json(comment);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  getCommentsForQuiz: async (req, res) => {
    try {
      const { quizId } = req.params;
      const { OpencircleComment } = await getModels();
      const comments = await OpencircleComment.findAll({ where: { quizId } });
      return res.json(comments);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  deleteComment: async (req, res) => {
    try {
      const { id } = req.params;
      const { OpencircleComment } = await getModels();
      const comment = await OpencircleComment.findByPk(id);
      if (!comment) return res.status(404).json({ message: 'Comment not found' });
      await comment.destroy();
      return res.status(204).send();
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
};
