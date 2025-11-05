// controllers/mainController.js
import { initializeModels } from '../models/index.js';
import { Sequelize } from 'sequelize';

// Get models (lazy initialization)
let Story, Comment, User;

async function getModels() {
  if (!Story) {
    const models = await initializeModels();
    Story = models.Story;
    Comment = models.Comment;
    User = models.User;
  }
  return { Story, Comment, User };
}

// ===============================================
// STORY OPERATIONS
// ===============================================

// Create a new story
export const createStory = async (req, res) => {
  try {
    const { Story, User } = await getModels();
    const { user_id, title, content } = req.body;
    
    const user = await User.findOne({
      where: { MICROSOFT_ID: user_id }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found. Please make sure the user exists in the database.'
      });
    }

    const story = await Story.create({
      USER_ID: user.ID,
      TITLE: title,
      CONTENT: content
    });

    res.status(201).json({
      success: true,
      data: story
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get all stories
export const getAllStories = async (req, res) => {
  try {
    const { Story, Comment } = await getModels();
    const stories = await Story.findAll({
      include: [
        { model: Comment, as: 'comments' }
      ],
      order: [['CREATED_AT', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: stories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get single story by ID
export const getStoryById = async (req, res) => {
  try {
    const { Story, Comment } = await getModels();
    const { id } = req.params;

    const story = await Story.findByPk(id, {
      include: [
        { model: Comment, as: 'comments' }
      ]
    });

    if (!story) {
      return res.status(404).json({
        success: false,
        error: 'Story not found'
      });
    }

    await story.increment('VIEW_COUNT');

    const updatedStory = await Story.findByPk(id, {
      include: [{ model: Comment, as: 'comments' }]
    });

    res.status(200).json({
      success: true,
      data: updatedStory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update story
export const updateStory = async (req, res) => {
  try {
    const { Story } = await getModels();
    const { id } = req.params;
    const { title, content, status } = req.body;

    const story = await Story.findByPk(id);

    if (!story) {
      return res.status(404).json({
        success: false,
        error: 'Story not found'
      });
    }

    await story.update({
      TITLE: title,
      CONTENT: content,
      STATUS: status
    });

    res.status(200).json({
      success: true,
      data: story
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Delete story
export const deleteStory = async (req, res) => {
  try {
    const { Story } = await getModels();
    const { id } = req.params;

    const story = await Story.findByPk(id);

    if (!story) {
      return res.status(404).json({
        success: false,
        error: 'Story not found'
      });
    }

    await story.destroy();

    res.status(200).json({
      success: true,
      message: 'Story deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ===============================================
// COMMENT OPERATIONS
// ===============================================

// Create a comment (generic - used by /comments endpoint)
export const createComment = async (req, res) => {
  try {
    const { Comment, User, Story } = await getModels();
    const { story_id, user_id, comment_text, parent_comment_id } = req.body;

    // Flexible user lookup - supports both database ID and Microsoft ID
    let user;
    if (typeof user_id === 'number' || !isNaN(parseInt(user_id, 10))) {
      const numericId = typeof user_id === 'number' ? user_id : parseInt(user_id, 10);
      user = await User.findByPk(numericId);
    } else {
      user = await User.findOne({ where: { MICROSOFT_ID: user_id } });
    }
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const storyIdNum = parseInt(story_id, 10);
    if (isNaN(storyIdNum)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid story_id format'
      });
    }

    const story = await Story.findByPk(storyIdNum);
    if (!story) {
      return res.status(404).json({
        success: false,
        error: 'Story not found'
      });
    }

    const comment = await Comment.create({
      STORY_ID: storyIdNum,
      USER_ID: user.ID,
      COMMENT_TEXT: comment_text,
      PARENT_COMMENT_ID: parent_comment_id ? parseInt(parent_comment_id, 10) : null
    });

    res.status(201).json({
      success: true,
      data: comment
    });
  } catch (error) {
    console.error('createComment error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get single comment by ID
export const getCommentById = async (req, res) => {
  try {
    const { Comment } = await getModels();
    const { id } = req.params;

    const comment = await Comment.findByPk(id, {
      include: [{ model: Comment, as: 'replies' }]
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: comment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update comment
export const updateComment = async (req, res) => {
  try {
    const { Comment } = await getModels();
    const { id } = req.params;
    const { comment_text } = req.body;

    const comment = await Comment.findByPk(id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found'
      });
    }

    await comment.update({
      COMMENT_TEXT: comment_text
    });

    res.status(200).json({
      success: true,
      data: comment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Delete comment
export const deleteComment = async (req, res) => {
  try {
    const { Comment } = await getModels();
    const { id } = req.params;

    const comment = await Comment.findByPk(id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found'
      });
    }

    await comment.destroy();

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Like a comment
export const likeComment = async (req, res) => {
  try {
    const { Comment } = await getModels();
    const { id } = req.params;

    const comment = await Comment.findByPk(id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found'
      });
    }

    await comment.increment('LIKES_COUNT');

    const updated = await Comment.findByPk(id);
    res.status(200).json({
      success: true,
      data: updated
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Unlike a comment
export const unlikeComment = async (req, res) => {
  try {
    const { Comment } = await getModels();
    const { id } = req.params;

    const comment = await Comment.findByPk(id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found'
      });
    }

    await comment.update({
      LIKES_COUNT: Sequelize.literal('GREATEST(0, LIKES_COUNT - 1)')
    });

    const updated = await Comment.findByPk(id);
    res.status(200).json({
      success: true,
      data: updated
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ===============================================
// STORY-SPECIFIC ROUTES (via /stories/:id)
// ===============================================

/**
 * POST /stories/:id/comments
 * Create comment for a specific story (story_id from URL)
 */
export const createCommentForStory = async (req, res) => {
  try {
    console.log('========================');
    console.log('📊 CREATE COMMENT REQUEST');
    console.log('req.params:', req.params);
    console.log('req.body:', req.body);
    
    const { id: story_id_param } = req.params;
    const { user_id, comment_text, parent_comment_id, story_id } = req.body;

    console.log('story_id (body):', story_id, '| Type:', typeof story_id);
    console.log('story_id_param (URL):', story_id_param, '| Type:', typeof story_id_param);
    
    const { Story, User, Comment } = await getModels();

    // Step 1: Validate user
    console.log('🔍 Looking up user with user_id:', user_id, '| Type:', typeof user_id);
    
    // Determine if user_id is a database ID (number) or Microsoft ID (string)
    let user;
    if (typeof user_id === 'number' || !isNaN(parseInt(user_id, 10))) {
      // It's a numeric ID, use the database ID
      const numericId = typeof user_id === 'number' ? user_id : parseInt(user_id, 10);
      console.log('Looking up by database ID:', numericId);
      user = await User.findByPk(numericId);
    } else {
      // It's a string, assume it's Microsoft ID
      console.log('Looking up by Microsoft ID:', user_id);
      user = await User.findOne({ where: { MICROSOFT_ID: user_id } });
    }
    
    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    console.log('✅ User found, DB ID:', user.ID);

    // Step 2: Validate story with type conversion
    console.log('🔍 Looking up story...');
    const storyIdToUse = parseInt(story_id, 10);
    console.log('Converted story_id:', storyIdToUse, '| isNaN:', isNaN(storyIdToUse));
    
    if (isNaN(storyIdToUse)) {
      console.log('❌ Invalid story_id');
      return res.status(400).json({
        success: false,
        error: `Invalid story_id: "${story_id}". Must be a valid number.`
      });
    }

    const story = await Story.findByPk(storyIdToUse);
    if (!story) {
      console.log('❌ Story not found');
      return res.status(404).json({
        success: false,
        error: 'Story not found'
      });
    }
    console.log('✅ Story found');

    // Step 3: Prepare comment data with proper type conversion
    const parentCommentIdNum = parent_comment_id ? parseInt(parent_comment_id, 10) : null;
    
    const commentData = {
      STORY_ID: storyIdToUse,
      USER_ID: user.ID,
      COMMENT_TEXT: comment_text,
      PARENT_COMMENT_ID: parentCommentIdNum
    };

    console.log('📝 Creating comment with data:', commentData);

    // Step 4: Create comment
    const comment = await Comment.create(commentData);

    console.log('✅ Comment created successfully! ID:', comment.ID);
    console.log('========================\n');

    return res.status(201).json({
      success: true,
      data: {
        id: comment.ID,
        story_id: comment.STORY_ID,
        user_id: comment.USER_ID,
        comment_text: comment.COMMENT_TEXT,
        parent_comment_id: comment.PARENT_COMMENT_ID,
        created_at: comment.CREATED_AT
      }
    });

  } catch (error) {
    console.error('❌ ERROR in createCommentForStory:');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    console.error('========================\n');
    
    return res.status(500).json({
      success: false,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * GET /stories/:id/comments
 * Get all comments for a specific story (with nested replies)
 */
export const getCommentsByStory = async (req, res) => {
  try {
    const { id: story_id } = req.params;
    const { Comment } = await getModels();

    const comments = await Comment.findAll({
      where: { STORY_ID: story_id },
      include: [{ model: Comment, as: 'replies' }],
      order: [['CREATED_AT', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: comments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * POST /stories/:id/like
 * Like a story (increment LIKES_COUNT)
 */
export const likeStory = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;

    const { Story, User } = await getModels();

    const story = await Story.findByPk(id);
    if (!story) {
      return res.status(404).json({
        success: false,
        error: 'Story not found'
      });
    }

    if (user_id) {
      const user = await User.findOne({ where: { MICROSOFT_ID: user_id } });
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }
    }

    await story.increment('LIKES_COUNT');
    const updatedStory = await Story.findByPk(id);

    res.status(200).json({
      success: true,
      data: updatedStory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * POST /stories/:id/unlike
 * Unlike a story (decrement LIKES_COUNT, never below 0)
 */
export const unlikeStory = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;

    const { Story, User } = await getModels();

    const story = await Story.findByPk(id);
    if (!story) {
      return res.status(404).json({
        success: false,
        error: 'Story not found'
      });
    }

    if (user_id) {
      const user = await User.findOne({ where: { MICROSOFT_ID: user_id } });
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }
    }

    await story.update({
      LIKES_COUNT: Sequelize.literal('GREATEST(0, LIKES_COUNT - 1)')
    });

    const updatedStory = await Story.findByPk(id);

    res.status(200).json({
      success: true,
      data: updatedStory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};