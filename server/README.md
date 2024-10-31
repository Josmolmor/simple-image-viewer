# ⚙️ Stack

- node
- [nodemon](https://www.npmjs.com/package/nodemon)
- dotenv
- express
- cors (add a basic layer of security)
- multer (handle image multipart/form-data)

# 🚀 Installation

Add a `.env` file with the following key/values:

```
CLIENT_HOST
SERVER_PORT
UPLOADS_DIRECTORY_NAME
```

Example:

```
CLIENT_HOST=http://localhost:5173
SERVER_PORT=8080
UPLOADS_DIRECTORY_NAME=uploads
```

`http://localhost:5173` is the default host for Vite powered apps (default for the `client` side).

`8080` is the default port for node on the server side

`uploads` is the destination folder where the images will be downloaded. If it doesn't exist, the app should handle it itself, no worries.

Then install the dependencies and run the project:

```shell
npm i
```

and then

```shell
npm run start
```

or

```shell
npm run dev
```

depending if you want hot reload functionality with nodemon or not.

You should be able to see a message like the following on your console if the server is running. (the port value may vary if you set a different one on the `.env` file)

```
Server started on port 8080
```

# 📝 Details

Makes the `/uploads` (or whatever directory you set on the previous step) directory public to be able to fetch images from it

Exposes 3 different endpoints

Uploads an image to the uploads directory specified on the `.env` file.

```
method: POST
path: /upload
payload: image in "multipart/form-data"
```

Retrieves all the images from the uploads directory

```
method: GET
path: /list-uploads
```

Retrieves an specific image given a filename from the uploads directory

```
method: GET
path: /chosenDirectoryName/:filename
payload: file name
```

Deletes an image from the directory given its file name

```
method: DELETE
path: /chosenDirectoryName/:filename
payload: file name
```

# 🚀 Installation

```shell
git clone https://github.com/Josmolmor/simple-image-viewer.git
cd simple-image-viewer
```
