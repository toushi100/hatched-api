#!/bin/bash

# any future command that fails will exit the script
set -e

# Lets write the public key of our aws instance
eval $(ssh-agent -s)

# Get the environment specific variables to use in the deployment
if [ ! -z $CI_COMMIT_TAG ];
then
  echo "GETTING PROD ENV VARIABLES";
  DEPLOY_SERVERS=$PROD_SERVERS
  DEPLOY_USER=$PROD_DEPLOY_USER
  SSH_PASS=$PROD_SSH_PASS
  SERVER_PRIVATE_KEY=$PROD_PRIVATE_KEY
  USE_PASS_OR_KEY=$PROD_USE_PASS_OR_KEY
  echo "$PROD_ENV" > .env
elif [ "$CI_COMMIT_REF_NAME" == "master" ];
then
  echo "GETTING STAGING ENV VARIABLES";
  DEPLOY_SERVERS=$STAGING_SERVERS
  DEPLOY_USER=$STAGING_DEPLOY_USER
  SSH_PASS=$STAGING_SSH_PASS
  SERVER_PRIVATE_KEY=$STAGING_PRIVATE_KEY
  USE_PASS_OR_KEY=$STAGING_USE_PASS_OR_KEY
  echo "$STAGING_ENV" > .env
elif [ "$CI_COMMIT_REF_NAME" == "develop" ];
then
  echo "GETTING DEV ENV VARIABLES";
  DEPLOY_SERVERS=$DEV_SERVERS
  DEPLOY_USER=$DEV_DEPLOY_USER
  SSH_PASS=$DEV_SSH_PASS
  SERVER_PRIVATE_KEY=$DEV_PRIVATE_KEY
  USE_PASS_OR_KEY=$DEV_USE_PASS_OR_KEY
  echo "$DEV_ENV" > .env
elif [ "$CI_COMMIT_REF_NAME" == "testpipeline" ];
then
  echo "GETTING TEST PIPELINE ENV VARIABLES";
  DEPLOY_SERVERS=$DEV_SERVERS
  DEPLOY_USER=$DEV_DEPLOY_USER
  SSH_PASS=$DEV_SSH_PASS
  SERVER_PRIVATE_KEY=$DEV_PRIVATE_KEY
  USE_PASS_OR_KEY=$DEV_USE_PASS_OR_KEY
  echo "$DEV_ENV" > .env
fi

echo $USE_PASS_OR_KEY
echo $DEPLOY_SERVERS
echo "$SERVER_PRIVATE_KEY" | tr -d '\r' | ssh-add - > /dev/null


# create the output folder
mkdir app-backend-new
# collect all the needed files in one place
cp -r ./dist ./app-backend-new
cp .env ./app-backend-new
cp ./package.json ./app-backend-new

# disable the host key checking.
./bin/disableHostKeyChecking.sh

if [ "$USE_PASS_OR_KEY" == "PASS" ]
then
  echo "remove last version"
  sshpass -p $SSH_PASS ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_SERVERS} 'bash' < ./bin/removeLastVersion.sh
  echo "copy build to server"
  sshpass -p $SSH_PASS scp -o StrictHostKeyChecking=no -r ./app-backend-new ${DEPLOY_USER}@${DEPLOY_SERVERS}:~/app-server/
  echo "deploying to ${DEPLOY_SERVERS}"
  sshpass -p $SSH_PASS ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_SERVERS} 'bash' < ./bin/updateAndRestart.sh
elif [ "$USE_PASS_OR_KEY" == "KEY" ]
then
  echo "remove last version"
  ssh  ${DEPLOY_USER}@${DEPLOY_SERVERS} 'bash' < ./bin/removeLastVersion.sh
  echo "copy build to server"
  scp  -r ./app-backend-new ${DEPLOY_USER}@${DEPLOY_SERVERS}:~/app-server/
  echo "deploying to server"
  ssh  ${DEPLOY_USER}@${DEPLOY_SERVERS} 'bash' < ./bin/updateAndRestart.sh
fi
