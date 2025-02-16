import { Client } from "ssh2";


const conn = new Client();

conn.connect({
    host: "RPi",
    port: 22,
    username: "pi3",
    password: "21021634",
  });

  conn.on("ready", async () => {
    console.log("SSH connection established");
  
    // Hàm chạy lệnh SSH và trả về kết quả
    function execCommand(command) {
      return new Promise((resolve, reject) => {
        conn.exec(command, (err, stream) => {
          if (err) return reject(err);
  
          stream
            .on("close", () => {
              console.log(`Command '${command}' execution completed`);
              resolve(); // Hoàn thành lệnh
            })
            .on("data", (data) => {
              console.log("OUTPUT: PHAMQUOCTHAI" + data.toString());
            })
            .stderr.on("data", (data) => {
              console.log("ERROR: " + data.toString());
            });
        });
      });
    }
  
    try {
      // Chạy lệnh 'ls -l' trước
      await execCommand("ls -l");
  
      // Sau khi 'ls -l' hoàn thành, mới chạy 'exit'
      await execCommand("exit");
      console.log("Exited");
      
      // Đóng kết nối sau khi tất cả lệnh đã chạy xong
      conn.end();
    } catch (error) {
      console.error("Error executing SSH command:", error);
      conn.end();
    }
  });
  

conn.on("error", (err) => {
  console.error("SSH connection error:", err);
});

// conn.connect(piConfig);
