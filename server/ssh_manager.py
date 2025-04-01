import paramiko
from typing import Optional, Tuple, Dict
import asyncio
import os


class SSHManager:
    def __init__(self):
        self.client = None
        self.sftp = None
        self.channel = None
    
    def connect(self, host: str, username: str, password: str, port: int = 22) -> None:
        self.client = paramiko.SSHClient()
        self.client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        self.client.connect(
            hostname=host,
            username=username,
            password=password,
            port=port
        )
        self.sftp = self.client.open_sftp()
    
    def disconnect(self) -> None:
        if self.sftp:
            self.sftp.close()
        if self.channel:
            self.channel.close()
        if self.client:
            self.client.close()
    
    def execute_command(self, command: str) -> Tuple[str, str]:
        if not self.client:
            raise Exception("Not connected")
        
        stdin, stdout, stderr = self.client.exec_command(command)
        output = stdout.read().decode()
        error = stderr.read().decode()
        return output, error
    
    def upload_file(self, remote_path: str, content: str) -> None:
        if not self.client:
            raise Exception("Not connected")
        
        if not self.sftp:
            self.sftp = self.client.open_sftp()
        
        with self.sftp.file(remote_path, 'w') as f:
            f.write(content)
    
    def create_shell(self) -> None:
        if not self.client:
            raise Exception("Not connected")
        
        self.channel = self.client.invoke_shell()
        return self.channel

    def upload_directory(self, local_dir: str, remote_dir: str) -> None:
        """Upload toàn bộ thư mục lên Raspberry Pi"""
        if not self.sftp:
            raise Exception("SFTP not initialized")
            
        # Tạo thư mục đích nếu chưa tồn tại
        try:
            self.sftp.stat(remote_dir)
        except FileNotFoundError:
            self.sftp.mkdir(remote_dir)
        
        # Upload tất cả file và thư mục con
        for root, dirs, files in os.walk(local_dir):
            # Tạo các thư mục con
            for dir_name in dirs:
                local_path = os.path.join(root, dir_name)
                remote_path = os.path.join(remote_dir, os.path.relpath(local_path, local_dir))
                try:
                    self.sftp.stat(remote_path)
                except FileNotFoundError:
                    self.sftp.mkdir(remote_path)
            
            # Upload các file
            for file_name in files:
                local_path = os.path.join(root, file_name)
                remote_path = os.path.join(remote_dir, os.path.relpath(local_path, local_dir))
                self.sftp.put(local_path, remote_path)