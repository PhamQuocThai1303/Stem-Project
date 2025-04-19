import paramiko
from typing import Optional, Tuple, Dict
import asyncio
import os
from concurrent.futures import ThreadPoolExecutor


class SSHManager:
    def __init__(self):
        self.client = None
        self.sftp = None
        self.channel = None
        self._executor = ThreadPoolExecutor(max_workers=10)
    
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
        self._executor.shutdown(wait=False)
    
    async def execute_command(self, command: str) -> Tuple[str, str]:
        """Thực thi lệnh SSH bất đồng bộ"""
        if not self.client:
            raise Exception("Not connected")
        
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            self._executor,
            self._execute_command_sync,
            command
        )
    
    def _execute_command_sync(self, command: str) -> Tuple[str, str]:
        """Thực thi lệnh SSH đồng bộ (internal use)"""
        stdin, stdout, stderr = self.client.exec_command(command)
        output = stdout.read().decode()
        error = stderr.read().decode()
        return output, error
    
    async def upload_file(self, remote_path: str, content: str) -> None:
        """Upload file bất đồng bộ"""
        if not self.client:
            raise Exception("Not connected")
        
        if not self.sftp:
            self.sftp = self.client.open_sftp()
        
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(
            self._executor,
            self._upload_file_sync,
            remote_path,
            content
        )
    
    def _upload_file_sync(self, remote_path: str, content: str) -> None:
        """Upload file đồng bộ (internal use)"""
        with self.sftp.file(remote_path, 'w') as f:
            f.write(content)
    
    def create_shell(self) -> None:
        if not self.client:
            raise Exception("Not connected")
        
        self.channel = self.client.invoke_shell()
        return self.channel

    async def upload_directory(self, local_dir: str, remote_dir: str) -> None:
        """Upload toàn bộ thư mục lên Raspberry Pi bất đồng bộ"""
        if not self.sftp:
            raise Exception("SFTP not initialized")
            
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(
            self._executor,
            self._upload_directory_sync,
            local_dir,
            remote_dir
        )
    
    def _upload_directory_sync(self, local_dir: str, remote_dir: str) -> None:
        """Upload directory đồng bộ (internal use)"""
        try:
            self.sftp.stat(remote_dir)
        except FileNotFoundError:
            self.sftp.mkdir(remote_dir)
        
        for root, dirs, files in os.walk(local_dir):
            for dir_name in dirs:
                local_path = os.path.join(root, dir_name)
                remote_path = os.path.join(remote_dir, os.path.relpath(local_path, local_dir))
                try:
                    self.sftp.stat(remote_path)
                except FileNotFoundError:
                    self.sftp.mkdir(remote_path)
            
            for file_name in files:
                local_path = os.path.join(root, file_name)
                remote_path = os.path.join(remote_dir, os.path.relpath(local_path, local_dir))
                self.sftp.put(local_path, remote_path)