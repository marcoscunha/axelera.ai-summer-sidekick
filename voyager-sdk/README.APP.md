### Instructions to run the BACKEND on embedded board.

- Activate the Voyager-SDK
```bash
source venv/bin/activate
```
- Install application requirements
```bash
pip install -r requirements.app.txt
```
- Execute the application
```bash
uvicorn application.main:app --host 0.0.0.0 --port 8000 --reload
```
