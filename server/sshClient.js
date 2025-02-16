const { Client } = require("ssh2");

const conn = new Client();
let isConnected = false;

function connectSSH() {
  return new Promise((resolve, reject) => {
    if (isConnected) {
      console.log("SSH is already connected.");
      return resolve();
    }

    conn.on("ready", () => {
      console.log("SSH connection established");
      isConnected = true;
      resolve();
    });

    conn.on("error", (err) => {
      console.error("SSH connection error:", err);
      isConnected = false;
      reject(err);
    });

    conn.on("end", () => {
      console.log("SSH connection ended.");
      isConnected = false;
    });

    conn.on("close", () => {
      console.log("SSH connection closed.");
      isConnected = false;
    });

    conn.connect({
      host: "RPi",
      port: 22,
      username: "pi3",
      password: "21021634",
    });
  });
}

function execCommand(command) {
  return new Promise((resolve, reject) => {
    if (!isConnected) {
      return reject(new Error("SSH is not connected"));
    }

    conn.exec(command, (err, stream) => {
      if (err) return reject(err);

      let output = "";
      stream
        .on("data", (data) => {
          output += data.toString();
        })
        .on("close", () => {
          console.log(`Command '${command}' executed`);
          resolve(output);
        })
        .stderr.on("data", (data) => {
          console.error("ERROR:", data.toString());
          reject(new Error(data.toString()));
        });
    });
  });
}

function closeSSHConnection() {
  if (isConnected) {
    console.log("Closing SSH connection...");
    conn.end();
  }
}

module.exports = { connectSSH, execCommand, closeSSHConnection };
