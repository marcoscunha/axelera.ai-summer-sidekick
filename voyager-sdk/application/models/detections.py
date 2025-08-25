from datetime import datetime
from typing import Any
from typing import Dict
from typing import List
from typing import Optional

from pydantic import BaseModel


class DetectionResult(BaseModel):
    timestamp: datetime
    objects: List[Dict[str, Any]]
    image_base64: Optional[str] = None
