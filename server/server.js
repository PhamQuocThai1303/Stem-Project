const express = require("express");
const cors = require("cors");
const { connectSSH, execCommand, closeSSHConnection, uploadFile } = require("./sshClient");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");

const app = express();
app.use(cors({
  origin: "*",
  methods: "GET,POST,PUT,DELETE",
  credentials: true,
}));
app.use(bodyParser.json());

let sshSession = {
  host: "",
  username: "",
};

const FILE_PATH = path.join(__dirname, "data", "data.txt");
// const remoteFilePath = `/home/${sshSession.username}/Documents/example/data.txt`;

// Kết nối SSH khi server khởi động
// connectSSH().catch(err => console.error("SSH Connection Failed:", err));

app.post("/connect", async (req, res) => {
  const { host, username, password } = req.body;

  try {
    await connectSSH({ host, username, password });
    res.status(200).json({ message: "Kết nối thành công!" });
    sshSession = { host, username };
  } catch (error) {
    console.error("❌ Lỗi kết nối SSH:", error);
    res.status(500).json({ message: "Kết nối thất bại!", error: error.message });
  }
});

app.post("/disconnect", async (req, res) => {
  try {
    closeSSHConnection();
    console.log("🔌 SSH connection closed.");
    sshSession = { host: "", username: "" };
    res.status(200).json({ message: "Ngắt kết nối thành công" });
  } catch (error) {
    console.error("❌ Lỗi khi ngắt kết nối SSH:", error);
    res.status(500).json({ message: "Lỗi khi ngắt kết nối" });
  }
});

app.get("/session-info", (req, res) => {
  res.json({ session: sshSession });
});

app.get("/run-ssh", async (req, res) => {
  try {
    const output = await execCommand("ls -l");
    res.json({ message: "SSH command executed", output });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/write-and-upload", async (req, res) => {
  const { generatedCode } = req.body;

  try {
    
    await fs.promises.writeFile(FILE_PATH, generatedCode);
    console.log(`File written successfully: ${FILE_PATH}`);

    
    await uploadFile(FILE_PATH, `/home/${sshSession.username}/Documents/code/data.txt`);
    console.log(`File uploaded to Raspberry Pi: ${`/home/${sshSession.username}/Documents/code/data.txt`}`);

    const command = `cd /home/${sshSession.username}/Documents/code && sudo python data.txt`;
    const output = await execCommand(command);
    console.log(`Command output: ${output}`);

    res.json({ message: "Ghi file và upload thành công!" });
  } catch (error) {
    console.error("❌ Error during write or upload:", error);
    res.status(500).json({ message: "Lỗi khi ghi và upload file", error: error.message });
  }
});

app.post("/stop", async (req, res) => {
  try {
    
    const output = await execCommand(`pgrep -f "python data.txt"`);
    const pids = output.trim().split("\n");

    if (pids.length === 0) {
      console.log("Không tìm thấy tiến trình!");
      return;
    }

    const firstPid = pids[0];
if(firstPid){
  await execCommand(`sudo kill -SIGINT ${firstPid}`);
    console.log("✅ Tiến trình đã dừng an toàn.");
}
    
    
  } catch (error) {
    console.error("❌ Lỗi khi dừng tiến trình:", error);
  }
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
