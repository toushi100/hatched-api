cd ~/app-server

echo "Install dependencies in new project"
mv ./app-backend/node_modules ./app-backend-new/node_modules
cd ./app-backend-new
npm install
cd ..

echo "Take backup of old project"
mv ./app-backend ./app-backend-old
mv ./app-backend-new ./app-backend

echo "Restarting app server"
pm2 restart app-backend
# it may fail if the app is not already started, in this case we use start instead of restart
if [ $? -eq 0 ]; then
    echo OK
else
    echo FAIL
    cd ./app-backend
    pm2 start ./dist/ecosystem.config.js
fi