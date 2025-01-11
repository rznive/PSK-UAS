const jwt = require('jsonwebtoken');
const supabase = require('../middleware/supabaseClient');

const getActivityReportsHandler = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('activity_report')
      .select('*');

    if (error) {
      return res.status(500).json({ message: "Failed to fetch activity reports", error });
    }

    res.status(200).json({
      status: true,
      message: "Activity reports fetched successfully",
      data,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const getActivityReportByIdHandler = async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('activity_report')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(500).json({ message: "Failed to fetch activity report", error });
    }

    if (!data) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.status(200).json({
      status: true,
      message: "Activity report fetched successfully",
      data,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const createCommentHandler = async (req, res) => {
  const { activity_report_id, comment_text } = req.body;
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user_id = decoded.id;
    const nama = decoded.nama;

    if (!user_id) {
      return res.status(401).json({ message: "User ID not found in token" });
    }

    const { data, error } = await supabase
      .from('data_commentar')
      .insert([{ activity_report_id, user_id, nama, comment_text }])
      .select('id, activity_report_id, user_id, nama, comment_text, created_at')
      .single();

    if (error) {
      return res.status(500).json({ message: "Failed to create comment", error });
    }

    res.status(201).json({
      status: true,
      message: "Comment created successfully",
      data,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const getCommentsHandler = async (req, res) => {
  const { activity_report_id } = req.params;

  try {
    const { data, error } = await supabase
      .from('data_commentar')
      .select('id, activity_report_id, user_id, nama, comment_text, created_at')
      .eq('activity_report_id', activity_report_id);

    if (error) {
      return res.status(500).json({ message: "Failed to fetch comments", error });
    }

    res.status(200).json({
      status: true,
      message: "Comments fetched successfully",
      data,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteCommentHandler = async (req, res) => {
  const { id } = req.params;
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user_id = decoded.id;

    if (!user_id) {
      return res.status(401).json({ message: "User ID not found in token" });
    }

    // Fetch the existing comment to check if the user is the owner
    const { data: existingComment, error: fetchError } = await supabase
      .from('data_commentar')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingComment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if the current user is the one who created the comment
    if (existingComment.user_id !== user_id) {
      return res.status(403).json({ message: "Unauthorized to delete this comment" });
    }

    // Proceed to delete the comment if the user is authorized
    const { data, error } = await supabase
      .from('data_commentar')
      .delete()
      .eq('id', id)
      .select('id');

    if (error) {
      return res.status(500).json({ message: "Failed to delete comment", error });
    }

    if (!data.length) {
      return res.status(404).json({ message: "Comment not found" });
    }

    res.status(200).json({
      status: true,
      message: "Comment deleted successfully",
      data,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateCommentHandler = async (req, res) => {
  const { comment_id, comment_text } = req.body;
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user_id = decoded.id;

    if (!user_id) {
      return res.status(401).json({ message: "User ID not found in token" });
    }

    const { data: existingComment, error: fetchError } = await supabase
      .from('data_commentar')
      .select('user_id')
      .eq('id', comment_id)
      .single();

    if (fetchError || !existingComment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (existingComment.user_id !== user_id) {
      return res.status(403).json({ message: "Unauthorized to update this comment" });
    }

    const { data, error } = await supabase
      .from('data_commentar')
      .update({ comment_text })
      .eq('id', comment_id)
      .select('id, activity_report_id, user_id, nama, comment_text, updated_at')
      .single();

    if (error) {
      return res.status(500).json({ message: "Failed to update comment", error });
    }

    res.status(200).json({
      status: true,
      message: "Comment updated successfully",
      data,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getActivityReportsHandler,
  getActivityReportByIdHandler,
  createCommentHandler,
  getCommentsHandler,
  deleteCommentHandler,
  updateCommentHandler,
};
