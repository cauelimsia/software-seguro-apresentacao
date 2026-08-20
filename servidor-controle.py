# -*- coding: utf-8 -*-
"""Servidor local que serve o deck e deixa o celular passar os slides.

Sem dependência externa: só a biblioteca padrão do Python.
O notebook abre  http://localhost:8000/          (deck, no projetor)
O celular abre   http://<ip-do-notebook>:8000/controle   (controle)

O canal é um SSE simples. O celular manda ação, o deck manda estado, o
servidor repassa para quem estiver do outro lado.

    python servidor-controle.py
    python servidor-controle.py 8080     # outra porta
"""

import json
import os
import queue
import socket
import sys
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

RAIZ = os.path.dirname(os.path.abspath(__file__))

# uma fila por cliente SSE conectado; o lock protege a lista das threads
inscritos = []
trava = threading.Lock()

# último estado que o deck informou, para o celular já abrir sincronizado
ultimo_estado = {"i": 0, "total": 0, "titulo": "", "revela": False}


def transmite(evento, dado):
    corpo = "event: {}\ndata: {}\n\n".format(evento, json.dumps(dado, ensure_ascii=False))
    with trava:
        alvos = list(inscritos)
    for fila in alvos:
        fila.put(corpo)


def ip_da_rede():
    """IP da máquina na LAN. O UDP não envia nada, só resolve a rota de saída."""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("8.8.8.8", 80))
        return s.getsockname()[0]
    except OSError:
        return "127.0.0.1"
    finally:
        s.close()


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=RAIZ, **kwargs)

    def log_message(self, *args):
        pass  # silencia o log por requisição, senão o SSE polui o terminal

    # ---------- GET ----------

    def do_GET(self):
        rota = self.path.split("?")[0]
        if rota == "/eventos":
            return self.fluxo_eventos()
        if rota in ("/controle", "/controle/"):
            self.path = "/controle-local.html"
        return super().do_GET()

    def fluxo_eventos(self):
        fila = queue.Queue()
        with trava:
            inscritos.append(fila)

        self.send_response(200)
        self.send_header("Content-Type", "text/event-stream; charset=utf-8")
        self.send_header("Cache-Control", "no-cache")
        self.send_header("Connection", "keep-alive")
        self.send_header("X-Accel-Buffering", "no")
        self.end_headers()

        try:
            # estado inicial, para o celular não abrir zerado
            self.wfile.write(
                ("event: estado\ndata: %s\n\n" % json.dumps(ultimo_estado, ensure_ascii=False)).encode("utf-8")
            )
            self.wfile.flush()
            while True:
                try:
                    corpo = fila.get(timeout=15)
                except queue.Empty:
                    corpo = ": ping\n\n"  # mantém a conexão viva em wi-fi ocioso
                self.wfile.write(corpo.encode("utf-8"))
                self.wfile.flush()
        except (BrokenPipeError, ConnectionResetError, OSError):
            pass
        finally:
            with trava:
                if fila in inscritos:
                    inscritos.remove(fila)

    # ---------- POST ----------

    def do_POST(self):
        rota = self.path.split("?")[0]
        if rota not in ("/acao", "/estado"):
            self.send_error(404)
            return

        tamanho = int(self.headers.get("Content-Length") or 0)
        if tamanho > 4096:
            self.send_error(413)
            return
        try:
            dado = json.loads(self.rfile.read(tamanho) or b"{}")
        except ValueError:
            self.send_error(400)
            return

        if rota == "/acao":
            transmite("acao", dado)
        else:
            global ultimo_estado
            ultimo_estado = dado
            transmite("estado", dado)

        self.send_response(204)
        self.send_header("Content-Length", "0")
        self.end_headers()


def main():
    porta = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    ip = ip_da_rede()
    servidor = ThreadingHTTPServer(("0.0.0.0", porta), Handler)
    servidor.daemon_threads = True

    print("")
    print("  deck (notebook) ..... http://localhost:%d/" % porta)
    print("  controle (celular) .. http://%s:%d/controle" % (ip, porta))
    print("")
    print("  celular e notebook precisam estar na mesma rede.")
    print("  se a wi-fi da sala for ruim, ligue o roteador do celular e conecte o notebook nele.")
    print("  Ctrl+C encerra.")
    print("")
    try:
        servidor.serve_forever()
    except KeyboardInterrupt:
        print("\nencerrado.")


if __name__ == "__main__":
    main()
