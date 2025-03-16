const express = require("express");
const cors = require("cors");
const { connectSSH, execCommand, closeSSHConnection, uploadFile, isConnected } = require("./sshClient");
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

let isRunning = false;

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

    isRunning = true;
    await uploadFile(FILE_PATH, `/home/${sshSession.username}/Documents/example/data.txt`);
    console.log(`File uploaded to Raspberry Pi: ${`/home/${sshSession.username}/Documents/example/data.txt`}`);

    const command = `cd /home/${sshSession.username}/Documents/example && sudo python data.txt`;
    // res.status(200).json({ message: "Ghi file và upload thành công!" });
    const output = await execCommand(command);
    console.log(`Command output: ${output}`);
    res.status(200).json({ message: "File đã chạy xong!" });
    isRunning = false;
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
    res.status(200).json({ message: "Tiến trình đã dừng an toàn" });
}
    
    
  } catch (error) {
    console.error("❌ Lỗi khi dừng tiến trình:", error);
  }
});

app.get("/check-network", async (req, res) => {
  try {
    // Lấy tên mạng Wi-Fi (SSID)
    const wifiName = await execCommand(
      "nmcli -t -f active,ssid dev wifi | grep '^yes' | cut -d: -f2"
    ).catch(() => null);

    // Lấy địa chỉ IP từ cổng Ethernet (eth0)
    const ethInfo = await execCommand(
      "ip -o -4 addr show eth0 | awk '{print $4}'"
    ).catch(() => null);

    // Kiểm tra kết nối mạng
    const hasInternet = await execCommand("ping -c 1 google.com")
      .then(() => true)
      .catch(() => false);

    const networkStatus = {
      wifi: wifiName ? wifiName.trim() : null,
      ethernet: ethInfo ? ethInfo.trim() : null,
      internet: hasInternet,
    };

    if (!networkStatus.wifi && !networkStatus.ethernet) {
      return res.status(200).json({
        connected: false,
        message: "Không có mạng nào được kết nối.",
        network: networkStatus,
      });
    }
    
    res.status(200).json({
      connected: true,
      message: "Đã kết nối mạng.",
      network: networkStatus,
    });
  } catch (error) {
    console.error("❌ Lỗi kiểm tra mạng:", error);
    res.status(500).json({
      message: "Lỗi khi kiểm tra kết nối mạng.",
      error: error.message,
    });
  }
});

app.get("/wifi-list", async (req, res) => {
  try {
    const wifiList = await execCommand("nmcli -t -f ssid,signal dev wifi list");

    const networks = wifiList
      .trim()
      .split("\n")
      .map((line) => {
        const [ssid, signal] = line.split(":");
        return { ssid, signal: parseInt(signal, 10) };
      })
      .filter((network) => network.ssid); // Bỏ qua kết quả trống

    if (networks.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Không tìm thấy mạng Wi-Fi nào.",
        networks: [],
      });
    }

    res.status(200).json({
      success: true,
      networks,
    });
  } catch (error) {
    console.error("❌ Lỗi khi quét Wi-Fi:", error);
    res.status(500).json({
      success: false,
      message: "Không thể quét mạng Wi-Fi.",
      error: error.toString(),
    });
  }
});

app.post("/connect-wifi", async (req, res) => {
  try {
    const { ssid, password } = req.body;

    if (!ssid || !password) {
      return res.status(400).json({
        success: false,
        message: "Thiếu tên mạng hoặc mật khẩu.",
      });
    }

    const connectCommand = `sudo nmcli device wifi connect "${ssid}" password "${password}"`;
    await execCommand(connectCommand);

    res.status(200).json({
      success: true,
      message: `Đã kết nối tới mạng Wi-Fi: ${ssid}`,
    });
  } catch (error) {
    console.error("❌ Lỗi kết nối Wi-Fi:", error);
    res.status(500).json({
      success: false,
      message: "Kết nối Wi-Fi thất bại.",
      error: error.toString(),
    });
  }
});

app.post("/disconnect-wifi", async (req, res) => {
  try {
    const { ssid } = req.body;
    await execCommand(`sudo nmcli connection delete "${ssid}"`);
    res.status(200).json({
      success: true,
      message: "Đã hủy kết nối Wi-Fi.",
    });
  } catch (error) {
    console.error("❌ Lỗi khi hủy kết nối Wi-Fi:", error);
    res.status(500).json({
      success: false,
      message: "Không thể hủy kết nối Wi-Fi.",
      error: error.toString(),
    });
  }
});

app.get("/monitor-data", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const remoteFilePath = `/home/${sshSession.username}/Documents/example/test.json`;
  console.log(`📊 Đang giám sát file: ${remoteFilePath}`);

  try {
    // if (!isConnected) {
    //   res.write(`data: SSH is not connected\n\n`);
    //   res.end();
    //   return;
    // }

    // Hàm đọc file từ Pi
    const readFile = async () => {
      try {
        // 📡 Kiểm tra nếu còn tiến trình đang chạy
        if (!isRunning ) {
          console.log("❌ Không còn tiến trình nào đang chạy, dừng giám sát.");
          clearInterval(intervalId);
          res.write(`data: Stopped monitoring\n\n`);
          res.end();
          return;
        }

        // 📄 Đọc nội dung file test.json
        const command = `cat ${remoteFilePath}`;
        const output = await execCommand(command);
        
        // 📤 Gửi dữ liệu tới client
        res.write(`data: ${output}\n\n`);
      } catch (error) {
        console.error("❌ Lỗi khi đọc file:", error);
        res.write(`data: Lỗi khi đọc file: ${error.message}\n\n`);
      }
    };

    // Lặp lại mỗi 3 giây để đọc file
    const intervalId = setInterval(readFile, 3000);

    // Khi client đóng kết nối, dừng giám sát
    req.on("close", () => {
      console.log("🔌 Client đã ngắt kết nối.");
      clearInterval(intervalId);
    });
  } catch (error) {
    console.error("❌ Lỗi khi giám sát dữ liệu:", error);
    res.write(`data: Lỗi: ${error.message}\n\n`);
    res.end();
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
