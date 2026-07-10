const { Post, User } = require('../models');

// CREATE - Add a new post for a user
exports.createPost = async (req, res) => {
  try {
    const { title, content, userId } = req.body;

    if (!title || !content || !userId) {
      return res.status(400).json({ error: 'title, content, and userId are required' });
    }

    // Verify the author actually exists before creating the post
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const post = await Post.create({ title, content, userId });
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// READ - Get all posts (with author info attached)
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.findAll({
      include: [{ model: User, attributes: { exclude: ['password'] } }],
      order: [['createdAt', 'DESC']],
    });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// READ - Get a single post by ID
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id, {
      include: [{ model: User, attributes: { exclude: ['password'] } }],
    });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE - Edit a post's title/content
exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const { title, content } = req.body;
    await post.update({ title, content });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE - Remove a post
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    await post.destroy();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
