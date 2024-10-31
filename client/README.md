# ⚙️ Stack

-   react
-   typescript
-   vite
-   tailwindcss (styling)
-   lucide-react (icons)
-   shadcn/radix (component library; "components/ui" folder)
-   prettier
-   eslint

# 🚀 Installation

Add a .env file with the following key/values:

```shell
CLIENT_HOST
```

It should point to your node backend URL. For example:

```shell
VITE_API_URL=http://localhost:8080
```

Then install the dependencies and run the project:

```shell
npm i
npm run dev
```

# 🗣️ More commands

Format with prettier

```shell
npm run format
```

Run eslint

```shell
npm run lint
```

If you want to run a production build

```shell
npm run build
npm run preview
```

# 📝 Details

-   The project uses HTML `canvas` to manipulate the image attached.
    It uses 2 different canvas, one that mirrors the image attached and another one positioned on top that allows the user to draw. Once the upload button is pushed, both canvas get merged and converted into a blob using the `toBlob` function and then into an image type file and uploaded.

-   There are 2 main context where the uploaded images list (`ImageListContext`) and the toast/snackbar component (`ToastContext`) are handled.

-   There is one custom hook that handles all the manipulation logic. The general idea is that the manipulations are handled in a stack and every manipulation is considered an element in the manipulations array. This makes it easier to pop and push elements for the undo/redo functionality

# 👣 Usage

The first time you run the app no images should show up because you haven't uploaded anything yet.

image-1

Go ahead and click on the top element o drag and drop a valid image to preview it.

image-2

The application allows you to do the following actions after you attach an image:

-   Rotation: -135º, -90º, -45º, 0º (default), 45º, 90º and 135º as allowed values. Didn't include some standard rotation values because you can do the same using the flip options.
-   Zoom: 25%, 50%, 75%, 100% (default), 125%, 150%, 175%, 200%, 250% and 300% as allowed values.
-   Flip horizontal: self explanatory
-   Flip vertical: self explanatory
-   Draw on top: once you have attached an image, if you hover over it, you'll see your cursor changes. That means you are able to draw on top of the image. There are some color options for the drawing provided (black, red, green, blue, yellow, and white). There's also a little trash can icon that removes all the drawings.
-   Undo: once you have done any manipulation to the attached image, the "undo" button should be enabled and allow you to undo any manipulation you've done up until now.
-   Redo: after you undo any manipulation, the "redo" button should enable and allow you to execute the manipulation that you undid before.
-   Reset: clear all the modifications and disabled the undo option. This also clear all the drawings done.
-   Upload: saves the image to the directory specified on the backend side.

After you press upload, you should see that your image now appears at the bottom of the page. This image includes all the modifications you did to it before uploading, including the drawings. You can also remove it by clicking on the trash icon that overlays the image.

image-3
image-4

The application allows the user to click on any of the already uploaded images to attach them and preview too, making it easier to preview and modified already existing images.

# 🔮 Improvement proposals

-   Add file size limitation to avoid attaching big files.
-   Count drawings as manipulations so they can be used with the undo/redo feature.
-   Add multiple brush sizes for the drawing feature.
-   Add some kind of image filters.
-   Apply the same transformations to the drawing canvas (so if I rotate the image, the drawing rotates too)
-   Add animations / make the application look more fancy
