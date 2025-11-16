import pywhatkit
from datetime import datetime

phone = "+57xxxxx"
now = datetime.now()
hour = now.hour
minute = now.minute + 1
print(now)
print(hour, minute)
pywhatkit.sendwhatmsg(
    phone,
    "",
    hour,
    minute, tab_close=True
)