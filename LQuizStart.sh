#!/usr/bin/bash
echo 'LQuiz Start'
pm2 start index.js --name LQuiz

echo 'LQuiz API Start'
cd http_api
pm2 start index.js --name LQuiz_Api
cd ../

echo 'LQuiz Client Start'
cd client
pm2 start index.js --name LQuiz_Client
cd ../
