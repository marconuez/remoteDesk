import websocket
import json
import time
import subprocess
import threading
import platform
import socket

def contar_tiempo(tiempo):
    tiempo = int(tiempo)
    print(f"Tiempo configurado: {tiempo} minutos")
    
    for remaining in range(tiempo * 60, 0, -1):
        mins, secs = divmod(remaining, 60)
        print(f"Tiempo restante: {mins} minutos y {secs} segundos", end='\r')
        time.sleep(1)

    cerrar_sesion()  # Llama a cerrar sesión después de contar el tiempo

def cerrar_sesion(station_id):
    print(f"\nCerrando sesión para la estación: {station_id}...")
    try:
        subprocess.run(["shutdown", "/l"], check=True)  # En Windows
    except subprocess.CalledProcessError as e:
        print(f"Error al intentar cerrar sesión: {e}")

def on_message(ws, message):
    data = json.loads(message)
    if data['type'] == 'setTime':
        tiempo = data['time']
        threading.Thread(target=contar_tiempo, args=(tiempo,)).start()
    elif data['type'] == 'endTime':
        station_id = data['stationId']  # Obtén el ID de la estación desde el mensaje
        cerrar_sesion(station_id)  # Pasa el ID a la función de cerrar sesión

def on_open(ws):
    computer_name = socket.gethostname()
    system_info = platform.system()
    system_version = platform.version()
    station_id = f"{computer_name}_{system_info}_{system_version}"
    
    print(f"Conectado y registrando estación: {station_id}")
    ws.send(json.dumps({"type": "register", "stationId": station_id}))

if __name__ == "__main__":
    ws = websocket.WebSocketApp("ws://localhost:8080",
                                on_message=on_message)
    ws.on_open = on_open
    ws.run_forever()
