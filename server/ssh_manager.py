# ssh_manager.py
import paramiko
from typing import Optional, Tuple, Dict
import asyncio

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