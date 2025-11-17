import pywhatkit
from datetime import datetime
import pandas as pd

invitados = pd.read_csv("/Users/andresjc/Downloads/invitados_1_tanda.csv", dtype=str)

for index, row in invitados.iterrows():
    name = row['Nombres']
    seats = row['TOTAL_SEATS']
    phones = row['Telefonos'].split('/')
    id = row['UUID']
    for phone in phones:
        phone = phone.strip()
        now = datetime.now()
        hour = now.hour
        minute = now.minute + 1
        print(f"Enviando mensaje a {name} al numero {phone} a las {hour}:{minute}")

        if row["CONFIRMED"] == "TRUE":
            mensaje = f"Hola {name}, ¡Gracias por confirmar tu asistencia para {seats} persona(s)! Nos alegra mucho que puedas acompañarnos en este día tan especial. Si tienes alguna pregunta, no dudes en contactarnos. Recuerda los colores reservados para los novios en https://andresjejen.github.io/bodaA-A.github.io/?uuid={id}"

        elif row["CONFIRMED"] == "PENDING":
            mensaje = f"Hola {name}, ¡Cada persona que amamos tiene un lugar en este momento tan especial. ¿Nos acompañas? Esta invitación es válida para {seats} persona(s). Porfa confirma antes del 20 de enero de 2026 aqui, https://andresjejen.github.io/bodaA-A.github.io/?uuid={id} ten en cuenta los colores reservados para los novios!"

        else:
            mensaje = f"Hola {name}, queremos recordarte que aún no has confirmado tu asistencia para {seats} persona(s) a nuestra boda. Nos encantaría contar contigo en este día tan especial. Por favor, confirma tu asistencia antes del 20 de enero de 2026 aqui, https://andresjejen.github.io/bodaA-A.github.io/?uuid={id} ten en cuenta los colores reservados para los novios!"

        pywhatkit.sendwhatmsg(
            f"+{phone}",
            mensaje,
            hour,
            minute,
            tab_close=True,
        )
