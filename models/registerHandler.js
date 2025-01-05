const bcrypt = require('bcryptjs');
const supabase = require('../middleware/supabaseClient');

const registerHandler = async (req, res) => {
  const { nama, email, password } = req.body;

  try {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    
    // Insert data into the 'user_login' table
    const { data, error } = await supabase
      .from("user_login") // Use the correct table name
      .insert([{ nama, email, password: hashedPassword }])
      .select("id, nama, email") // Select the necessary fields
      .single();

    if (error) {
      console.error("Error creating user:", error);
      return res.status(500).json({ message: "Failed to register user", error });
    }

    console.log("User registered successfully:", data);
    res.status(201).json({
      status: true,
      message: "User registered successfully",
      data,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = registerHandler;
