/* Liga o deck ao servidor local de controle remoto.
   Em GitHub Pages não existe /eventos: falha, desiste e o deck segue normal. */

(function () {
  const TENTATIVAS_MAX = 3;
  let tentativas = 0;
  let fonte = null;
  let conectado = false;

  const aviso = document.createElement("div");
  aviso.className = "remoto-aviso";
  aviso.hidden = true;
  document.body.appendChild(aviso);

  function mostra(texto, ok) {
    aviso.textContent = texto;
    aviso.classList.toggle("remoto-ok", !!ok);
    aviso.hidden = false;
    clearTimeout(mostra.t);
    mostra.t = setTimeout(() => { aviso.hidden = true; }, 2600);
  }

  function enviaEstado() {
    // num host estático não há para quem mandar: evita 501 a cada slide
    if (!conectado || !window.DECK) return;
    fetch("/estado", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(window.DECK.estado())
    }).catch(() => {});
  }

  function conecta() {
    fonte = new EventSource("/eventos?papel=deck");

    fonte.addEventListener("open", () => {
      tentativas = 0;
      conectado = true;
      mostra("controle remoto conectado", true);
      enviaEstado();
    });

    fonte.addEventListener("acao", (ev) => {
      let dado;
      try { dado = JSON.parse(ev.data); } catch { return; }
      const d = window.DECK;
      if (!d) return;
      if (dado.acao === "proximo") d.proximo();
      else if (dado.acao === "anterior") d.anterior();
      else if (dado.acao === "ir" && Number.isInteger(dado.i)) d.irPara(dado.i);
    });

    fonte.addEventListener("error", () => {
      // EventSource reconecta sozinho para sempre; num host estático isso viraria
      // um laço de 404. Corta depois de algumas tentativas.
      conectado = false;
      tentativas += 1;
      if (tentativas >= TENTATIVAS_MAX) {
        fonte.close();
        fonte = null;
      }
    });
  }

  document.addEventListener("deck:mudou", enviaEstado);
  conecta();
})();
