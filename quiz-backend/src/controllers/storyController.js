// controllers/mainController.js
import { initializeModels } from '../models/index.js';

// Get models
let Story, StoryMedia, Comment;

async function getModels() {
  if (!Story) {
    const models = await initializeModels();
    Story = models.Story;
    StoryMedia = models.StoryMedia;
    Comment = models.Comment;
  }
  return { Story, StoryMedia, Comment };
}

// ===============================================
// STORY OPERATIONS
// ===============================================

// Create a new story
export const createStory = async (req, res) => {
  try {
    const { Story } = await getModels();
    const { user_id, title, content, media_url, media_type } = req.body;
    
    const story = await Story.create({
      user_id,
      title,
      content,
      media_url,
      media_type
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
    const { Story, StoryMedia, Comment } = await getModels();
    const stories = await Story.findAll({
      include: [
        { model: StoryMedia, as: 'media' },
        { model: Comment, as: 'comments' }
      ],
      order: [['created_at', 'DESC']]
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
    const { Story, StoryMedia, Comment } = await getModels();
    const { id } = req.params;
    
    const story = await Story.findByPk(id, {
      include: [
        { model: StoryMedia, as: 'media' },
        { model: Comment, as: 'comments' }
      ]
    });

    if (!story) {
      return res.status(404).json({
        success: false,
        error: 'Story not found'
      });
    }

    // Increment view count
    await story.update({ view_count: story.view_count + 1 });

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

// Update story
export const updateStory = async (req, res) => {
  try {
    const { Story } = await getModels();
    const { id } = req.params;
    const { title, content, media_url, media_type, status } = req.body;

    const story = await Story.findByPk(id);

    if (!story) {
      return res.status(404).json({
        success: false,
        error: 'Story not found'
      });
    }

    await story.update({
      title,
      content,
      media_url,
      media_type,
      status,
      updated_at: new Date()
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
// MEDIA OPERATIONS
// ===============================================

// Add media to story
export const addMedia = async (req, res) => {
  try {
    const { StoryMedia } = await getModels();
    const { story_id, media_url, media_type, media_size, display_order } = req.body;

    const media = await StoryMedia.create({
      story_id,
      media_url,
      media_type,
      media_size,
      display_order
    });

    res.status(201).json({
      success: true,
      data: media
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get all media for a story
export const getMediaByStory = async (req, res) => {
  try {
    const { StoryMedia } = await getModels();
    const { story_id } = req.params;

    const media = await StoryMedia.findAll({
      where: { story_id },
      order: [['display_order', 'ASC']]
    });

    res.status(200).json({
      success: true,
      data: media
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update media
export const updateMedia = async (req, res) => {
  try {
    const { StoryMedia } = await getModels();
    const { id } = req.params;
    const { media_url, media_type, display_order } = req.body;

    const media = await StoryMedia.findByPk(id);

    if (!media) {
      return res.status(404).json({
        success: false,
        error: 'Media not found'
      });
    }

    await media.update({
      media_url,
      media_type,
      display_order,
      updated_at: new Date()
    });

    res.status(200).json({
      success: true,
      data: media
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Delete media
export const deleteMedia = async (req, res) => {
  try {
    const { StoryMedia } = await getModels();
    const { id } = req.params;

    const media = await StoryMedia.findByPk(id);

    if (!media) {
      return res.status(404).json({
        success: false,
        error: 'Media not found'
      });
    }

    await media.destroy();

    res.status(200).json({
      success: true,
      message: 'Media deleted successfully'
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

// Create a comment
export const createComment = async (req, res) => {
  try {
    const { Comment } = await getModels();
    const { story_id, user_id, comment_text, parent_comment_id } = req.body;

    const comment = await Comment.create({
      story_id,
      user_id,
      comment_text,
      parent_comment_id
    });

    res.status(201).json({
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

// Get all comments for a story
export const getCommentsByStory = async (req, res) => {
  try {
    const { Comment } = await getModels();
    const { story_id } = req.params;

    const comments = await Comment.findAll({
      where: { story_id },
      include: [{ model: Comment, as: 'replies' }],
      order: [['created_at', 'DESC']]
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
      comment_text,
      updated_at: new Date()
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

    await comment.update({
      likes_count: comment.likes_count + 1
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
      likes_count: Math.max(0, comment.likes_count - 1)
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