const { Client } = require("ssh2");
const fs = require("fs");
const path = require("path");

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
      host: "raspberrypi",
      port: 22,
      username: "pi",
      password: "1",
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

function uploadFile(localPath, remotePath) {
  return new Promise((resolve, reject) => {
    if (!isConnected) {
      return reject(new Error("SSH is not connected"));
    }

    conn.sftp((err, sftp) => {
      if (err) return reject(err);

      const readStream = fs.createReadStream(localPath);
      const writeStream = sftp.createWriteStream(remotePath);

      writeStream.on("close", () => {
        console.log(`File uploaded: ${localPath} ➜ ${remotePath}`);
        resolve();
      });

      writeStream.on("error", (err) => {
        console.error("SFTP upload error:", err);
        reject(err);
      });

      readStream.pipe(writeStream); // Bắt đầu upload
    });
  });
}

function closeSSHConnection() {
  if (isConnected) {
    console.log("Closing SSH connection...");
    conn.end();
  }
}

module.exports = { connectSSH, execCommand, closeSSHConnection, uploadFile };
