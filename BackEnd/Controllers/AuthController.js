const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

require("../Schemas/Student");
require("../Schemas/Teacher");

const Student = mongoose.model("StudentInfo");
const Teacher = mongoose.model("TeacherInfo");

const JWT_SECRET = "hello";


const registerStudent = async (req, res) => {
  const { name, username, email, password, institution } = req.body;

  if (!name || !username || !email || !password || !institution) {
    return res.send({ status: "Error", data: "All fields are required" });
  }

  const oldUser = await Student.findOne({ email });
  if (oldUser) {
    return res.send({ data: "User Already Exists" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await Student.create({
      name,
      username,
      email,
      password: hashedPassword,
      institution,
    });

    res.send({ status: "OK", data: "User Created" });
  } catch (error) {
    res.send({ status: "Error", data: error });
  }
};


const registerTeacher = async (req, res) => {
  const { name, username, email, password, institution } = req.body;

  if (!name || !username || !email || !password || !institution) {
    return res.send({ status: "Error", data: "All fields are required" });
  }

  const oldUser = await Teacher.findOne({ email });
  if (oldUser) {
    return res.send({ data: "User Already Exists" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await Teacher.create({
      name,
      username,
      email,
      password: hashedPassword,
      institution,
    });

    res.send({ status: "OK", data: "User Created" });
  } catch (error) {
    res.send({ status: "Error", data: error });
  }
};


const loginStudent = async (req, res) => {
  const { username, password } = req.body;

  try {
    const student = await Student.findOne({ username });
    if (!student) {
      return res.json({ status: "NO", data: "User Not Found" });
    }

    const isPasswordValid = await bcrypt.compare(password, student.password);
    if (!isPasswordValid) {
      return res.json({ status: "NO2", data: "Incorrect Password" });
    }

    const token = jwt.sign({ id: student._id, role: "Student" }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      status: "OK",
      token,
      data: {
        name: student.name,
        username: student.username,
        email: student.email,
        institution: student.institution,
      },
    });
  } catch (e) {
    console.error(e);
    res.json({ status: "Error", error: e });
  }
};


const loginTeacher = async (req, res) => {
  const { username, password } = req.body;

  try {
    const teacher = await Teacher.findOne({ username });
    if (!teacher) {
      return res.json({ status: "NO", data: "User Not Found" });
    }

    const isPasswordValid = await bcrypt.compare(password, teacher.password);
    if (!isPasswordValid) {
      return res.json({ status: "NO2", data: "Incorrect Password" });
    }

    const token = jwt.sign({ id: teacher._id, role: "Teacher" }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      status: "OK",
      token,
      data: {
        name: teacher.name,
        username: teacher.username,
        email: teacher.email,
        institution: teacher.institution,
      },
    });
  } catch (e) {
    console.error(e);
    res.json({ status: "Error", error: e });
  }
};

module.exports = {
  registerStudent,
  registerTeacher,
  loginStudent,
  loginTeacher,
};
