import {app, BrowserWindow, screen } from 'electron'
import path from 'path'
import { isDev } from './util.js';

app.on('ready', () => {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    const mainWindow = new BrowserWindow({
        width: width,   
        height: height, 
        
      })
      if (isDev()) {
        mainWindow.loadURL('http://localhost:1303');
      } else {
        mainWindow.loadFile(path.join(app.getAppPath() + '/dist-react/index.html'))
      }
    
})