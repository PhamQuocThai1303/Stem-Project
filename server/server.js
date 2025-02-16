const express = require("express");
const cors = require("cors");
const { connectSSH, execCommand, closeSSHConnection } = require("./sshClient");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors({
  origin: "*",
  methods: "GET,POST,PUT,DELETE",
  credentials: true,
}));
app.use(bodyParser.json());

// Kết nối SSH khi server khởi động
connectSSH().catch(err => console.error("SSH Connection Failed:", err));

// Route để chạy lệnh trên SSH
app.get("/run-ssh", async (req, res) => {
  try {
    const output = await execCommand("ls -l");
    res.json({ message: "SSH command executed", output });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const FILE_PATH = path.join(__dirname, "data", "data.txt");

// API ghi nội dung vào file
app.post("/write-file", (req, res) => {
  const { generatedCode } = req.body;
  
  fs.writeFile(FILE_PATH, generatedCode, (err) => {
    if (err) {
      return res.status(500).json({ message: "Lỗi ghi file", error: err });
    }
    res.json({ message: "Ghi file thành công" });
  });
});

// Khi server tắt, gửi lệnh 'exit' để đóng SSH
function handleServerShutdown() {
  console.log("Server is shutting down...");
  closeSSHConnection();
  process.exit(0);
}

process.on("SIGINT", handleServerShutdown);  // Ctrl + C
process.on("SIGTERM", handleServerShutdown); // Khi bị kill hoặc từ PM2

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
