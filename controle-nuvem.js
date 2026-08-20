/* Controle remoto pelo celular, sem instalar nada na máquina que projeta.

   O deck sorteia um código, escuta um tópico MQTT com esse código e obedece
   ao que o celular publicar. Funciona no GitHub Pages: os dois lados só
   precisam de navegador e internet.

   Tópicos:
     wyden/deck/<CODIGO>/acao     celular -> deck
     wyden/deck/<CODIGO>/estado   deck -> celular (retido, para o celular
                                  já abrir sincronizado)
*/

(function () {
  const BROKER = "wss://broker.emqx.io:8084/mqtt";
  // sem I, O, 0 e 1: some a confusão na hora de ler o código da tela
  const ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const TAMANHO = 4;

  if (!window.mqtt) return;

  function sorteiaCodigo() {
    const bytes = new Uint8Array(TAMANHO);
    crypto.getRandomValues(bytes);
    let s = "";
    for (const b of bytes) s += ALFABETO[b % ALFABETO.length];
    return s;
  }

  // guarda na sessão para um F5 no meio da apresentação não derrubar o celular
  let codigo = sessionStorage.getItem("sala-deck");
  if (!codigo || codigo.length !== TAMANHO) {
    codigo = sorteiaCodigo();
    sessionStorage.setItem("sala-deck", codigo);
  }

  const base = "wyden/deck/" + codigo;
  const enderecoControle = location.href.replace(/\/[^/]*(?:\?.*)?(?:#.*)?$/, "/controle.html");

  /* ---------- cartão de pareamento ---------- */

  const cartao = document.createElement("div");
  cartao.className = "sala-cartao";
  cartao.innerHTML =
    '<span class="sala-rotulo">controle pelo celular</span>' +
    '<strong class="sala-codigo">' + codigo + "</strong>" +
    '<span class="sala-url"></span>' +
    '<span class="sala-status">conectando ao servidor…</span>';
  cartao.querySelector(".sala-url").textContent = enderecoControle.replace(/^https?:\/\//, "");
  document.body.appendChild(cartao);

  const status = cartao.querySelector(".sala-status");

  function encolhe() {
    cartao.classList.add("sala-mini");
  }

  // C mostra o cartão de novo, caso precise parear outro aparelho no meio
  document.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === "c" && !e.ctrlKey && !e.metaKey) {
      cartao.classList.toggle("sala-mini");
    }
  });

  /* ---------- conexão ---------- */

  const cliente = mqtt.connect(BROKER, {
    clientId: "deck-" + codigo + "-" + Math.random().toString(16).slice(2, 8),
    keepalive: 30,
    reconnectPeriod: 2000,
    connectTimeout: 8000,
    clean: true
  });

  let conectado = false;

  cliente.on("connect", () => {
    conectado = true;
    cartao.classList.add("sala-pronta");
    status.textContent = "digite o código no celular";
    cliente.subscribe(base + "/acao", { qos: 0 });
    publicaEstado();
  });

  cliente.on("reconnect", () => {
    conectado = false;
    status.textContent = "reconectando…";
  });

  cliente.on("error", () => {
    conectado = false;
    cartao.classList.remove("sala-pronta");
    status.textContent = "sem conexão — use o teclado";
  });

  cliente.on("message", (topico, carga) => {
    let dado;
    try { dado = JSON.parse(carga.toString()); } catch { return; }
    const d = window.DECK;
    if (!d) return;

    // qualquer comando prova que há celular do outro lado — inclusive depois de
    // um F5 no deck, quando o "ola" já passou
    encolhe();
    status.textContent = "celular conectado";

    if (dado.acao === "ola") {
      publicaEstado();
      return;
    }
    if (dado.acao === "proximo") d.proximo();
    else if (dado.acao === "anterior") d.anterior();
    else if (dado.acao === "ir" && Number.isInteger(dado.i)) d.irPara(dado.i);
  });

  function publicaEstado() {
    if (!conectado || !window.DECK) return;
    // retido: quem assinar depois recebe o estado atual na hora
    cliente.publish(base + "/estado", JSON.stringify(window.DECK.estado()), { qos: 0, retain: true });
  }

  document.addEventListener("deck:mudou", publicaEstado);

  window.addEventListener("beforeunload", () => {
    try {
      cliente.publish(base + "/estado", "", { qos: 0, retain: true });
      cliente.end(true);
    } catch { /* saindo da página, não há o que tratar */ }
  });
})();
