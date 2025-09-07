# Instructions to work with the webapp

## Compile for development

```bash
nvm run dev
```

# Deploy the Application on Axelera Boards

## Compile the application for production environment

```bash
nvm run build
```

# To deploy the application on the Axelera Board

If you are not in the webapp folder, go to it:
```bash
cd webapp-summersidekick
```

Copy the build files to the board:
```bash
scp -r dist/* aetina@<board-ip>:<path-to-voyager-sdk>/application/static
```

## Access from the board

In your preferred browser, enter the following URL:

```
http://<board-ip>:8000
```