This server depends on an environment variables file to hold private data such as database connection information and server configurations. 
For obvious reasons, files containing confidentail information should not be committed to GitHub. Therefore, you must create your own enviroment variables file.

Step 1: Create a new file with the exact name ".env" in the root server folder (the same location as this readme).
Step 2: Open the file you've just created with the text editor of your choice.
Step 3: Copy the text below that is between the hypens (---) and paste into your .env file.
Step 4: Change the values to the correct ones for your server and save the file.

----------------------------------------------------------------------------------------
# database connection information
DB_HOSTNAME=127.0.0.1
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_NAME=maplesolaxia
DB_CONNECTION_LIMIT=5

# server configuration
NODE_USE_SSL=true
NODE_PORT=443
NODE_DEBUG_MODE=false
----------------------------------------------------------------------------------------