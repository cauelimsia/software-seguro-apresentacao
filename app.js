/* Deck data-driven: cada slide é um objeto, o resto é derivado. */

const SLIDES = [
  {
    tema: "escuro",
    nota: "Abertura: 20s. Falar o nome do princípio e do grupo.",
    html: `
      <p class="kicker">Desenvolvimento de Software Seguro · Prof. Ranyere Lima</p>
      <h1>FALHAR COM<br>SEGURANÇA</h1>
      <p class="grande">O princípio <span class="destaque">fail-safe</span>: quando o sistema quebra,
      ele tem que quebrar <b>fechado</b>, nunca aberto.</p>
      <p class="assinatura">Cauê Lima e grupo · Turma 3001 · Martha Falcão Wyden</p>`
  },
  {
    tema: "escuro",
    nota: "Definição com as nossas palavras. Frase de efeito: na dúvida, negue.",
    html: `
      <p class="kicker">O princípio</p>
      <h2>Quando algo dá errado, o sistema erra fechando</h2>
      <p class="grande">Uma falha, rede fora, serviço travado, exceção inesperada,
      <span class="destaque">nunca pode terminar em acesso liberado ou dado vazado</span>.
      Na dúvida, o sistema nega.</p>`
  },
  {
    tema: "claro",
    nota: "Por que importa: falha é inevitável, o comportamento na falha é escolha de design.",
    html: `
      <p class="kicker">Por que isso importa</p>
      <h2>A falha é inevitável. O comportamento na falha é uma escolha.</h2>
      <div class="cartoes">
        <div class="cartao"><b>Rede cai</b> e a sessão continua válida sem ninguém verificar</div>
        <div class="cartao"><b>Erro estoura</b> e a tela mostra o stack trace com detalhes do banco</div>
        <div class="cartao"><b>Catch vazio</b> engole a exceção e o fluxo segue como se tivesse passado</div>
        <div class="cartao"><b>Resultado</b> o atacante não quebra a segurança, ele só provoca o erro</div>
      </div>`
  },
  {
    tema: "escuro",
    nota: "Exemplo aplicado: app bancário. Ler o fluxo da esquerda pra direita.",
    html: `
      <p class="kicker">Exemplo aplicado · app bancário</p>
      <h2>Serviço de sessão fora do ar. E agora?</h2>
      <div class="fluxo">
        <div class="no">transferência solicitada</div><span class="seta">→</span>
        <div class="no">valida sessão</div><span class="seta">→</span>
        <div class="no falha">timeout ✕</div><span class="seta">→</span>
        <div class="no nega">NEGA e desloga</div>
      </div>
      <p class="grande">Ficar indisponível por um momento é melhor do que
      <span class="destaque">aprovar uma transferência sem verificação</span>.</p>`
  },
  {
    tema: "claro",
    nota: "DEMO AO VIVO: a primeira seta ja roda a simulacao sozinha, a segunda avanca. Esquerda fail-open aprova fraude, direita fail-closed recusa.",
    html: `
      <p class="kicker">Demo · API de pagamento com antifraude fora do ar</p>
      <h2>Fail-open vs fail-closed</h2>
      <div class="demo">
        <div class="demo-painel aberta">
          <h3>✕ como NÃO fazer (fail-open)</h3>
          <div class="demo-log" id="log-aberta">aguardando…</div>
        </div>
        <div class="demo-painel fechada">
          <h3>✓ falhando com segurança (fail-closed)</h3>
          <div class="demo-log" id="log-fechada">aguardando…</div>
        </div>
      </div>
      <div class="demo-acoes">
        <button class="botao" id="btn-simular">Simular queda do antifraude</button>
        <button class="botao secundario" id="btn-reset">Resetar</button>
      </div>`
  },
  {
    tema: "escuro",
    nota: "O caso real: aprovar pra não travar as vendas. Toda fraude passa na janela de falha.",
    html: `
      <p class="kicker">O erro clássico</p>
      <h2>"Aprova aí, é só pra não travar as vendas"</h2>
      <p class="grande">A API que aprova transações quando o antifraude está fora do ar
      cria uma janela onde <span class="destaque">toda fraude passa</span>.
      E o atacante consegue provocar essa janela: basta sobrecarregar o antifraude.</p>`
  },
  {
    tema: "claro",
    nota: "Como corrigir: 4 práticas. Fechar com fault injection.",
    html: `
      <p class="kicker">Como o desenvolvedor corrige</p>
      <h2>Negação por padrão, sempre</h2>
      <div class="cartoes">
        <div class="cartao"><b>Default deny</b> toda decisão de acesso começa negada e é liberada explicitamente</div>
        <div class="cartao"><b>Catch que nega</b> tratamento de erro registra no log e recusa, nunca aprova</div>
        <div class="cartao"><b>Timeout = recusa</b> dependência que não responde é tratada como negativa</div>
        <div class="cartao"><b>Mensagem genérica</b> o usuário vê "algo deu errado", o detalhe técnico fica no log</div>
        <div class="cartao"><b>Fault injection</b> testar o sistema derrubando as dependências de propósito</div>
      </div>`
  },
  {
    tema: "escuro",
    nota: "Fechamento: amarrar com a pergunta da atividade. Sistema escolar do professor como exemplo.",
    html: `
      <p class="kicker">Fechando</p>
      <h2>Funcionar não é ser seguro</h2>
      <p class="grande">O sistema escolar da aula funciona perfeitamente e deixa o aluno
      alterar a própria nota. Software seguro é o que se comporta bem
      <span class="destaque">inclusive no pior dia</span>, quando tudo à volta está falhando.</p>
      <p class="assinatura">Obrigado! · Falhar com Segurança · Desenvolvimento de Software Seguro</p>`
  }
];

/* ---------- engine ---------- */

const deck = document.getElementById("deck");
const bar = document.getElementById("bar");
const counter = document.getElementById("counter");
const notes = document.getElementById("notes");
let atual = -1;
let notasVisiveis = false;

SLIDES.forEach((s, i) => {
  const sec = document.createElement("section");
  sec.className = "slide " + (s.tema === "claro" ? "claro" : "");
  sec.dataset.i = i;
  sec.innerHTML = s.html;
  deck.appendChild(sec);
});

const els = [...deck.children];

function irPara(i) {
  i = Math.max(0, Math.min(SLIDES.length - 1, i));
  if (i === atual) return;
  const anterior = atual;
  atual = i;
  els.forEach((el, j) => {
    el.classList.toggle("ativo", j === i);
    el.classList.toggle("saindo", j === anterior && anterior < i);
  });
  document.body.dataset.slide = i;
  document.body.dataset.tema = SLIDES[i].tema === "claro" ? "claro" : "escuro";
  counter.textContent = (i + 1) + " / " + SLIDES.length;
  bar.style.width = ((i + 1) / SLIDES.length * 100) + "%";
  location.hash = "/" + (i + 1);
  if (notasVisiveis) notes.textContent = SLIDES[i].nota;
  avisaMudanca();
}

// o controle remoto escuta isto para espelhar o slide atual no celular
function avisaMudanca() {
  document.dispatchEvent(new CustomEvent("deck:mudou"));
}

function proximo() {
  const slideEl = els[atual];
  const botao = slideEl && slideEl.querySelector("#btn-simular");
  if (botao && !slideEl.dataset.demoRodou) {
    botao.click();  // o clique marca demoRodou e avisa a mudança
    return;
  }
  irPara(atual + 1);
}
function anterior() { irPara(atual - 1); }

document.getElementById("next").addEventListener("click", proximo);
document.getElementById("prev").addEventListener("click", anterior);

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") proximo();
  else if (e.key === "ArrowLeft" || e.key === "PageUp") anterior();
  else if (e.key === "Home") irPara(0);
  else if (e.key === "End") irPara(SLIDES.length - 1);
  else if (e.key.toLowerCase() === "n") {
    notasVisiveis = !notasVisiveis;
    notes.hidden = !notasVisiveis;
    if (notasVisiveis) notes.textContent = SLIDES[atual].nota;
  }
});

let toqueX = null;
document.addEventListener("touchstart", (e) => { toqueX = e.touches[0].clientX; }, { passive: true });
document.addEventListener("touchend", (e) => {
  if (toqueX === null) return;
  const dx = e.changedTouches[0].clientX - toqueX;
  if (Math.abs(dx) > 50) (dx < 0 ? proximo : anterior)();
  toqueX = null;
}, { passive: true });

window.addEventListener("hashchange", () => {
  const n = parseInt(location.hash.replace("#/", ""), 10);
  if (!isNaN(n)) irPara(n - 1);
});

const inicial = parseInt(location.hash.replace("#/", ""), 10);
irPara(isNaN(inicial) ? 0 : inicial - 1);

/* ---------- demo fail-open vs fail-closed ---------- */

function escreve(el, linhas) {
  el.innerHTML = "";
  let i = 0;
  (function passo() {
    if (i >= linhas.length) return;
    const [classe, texto] = linhas[i++];
    el.innerHTML += `<span class="${classe}">${texto}</span>\n`;
    setTimeout(passo, 420);
  })();
}

document.addEventListener("click", (e) => {
  if (e.target.id === "btn-simular") {
    // marca aqui (e não só na seta) para o botão e o controle remoto contarem a mesma história
    if (els[atual]) els[atual].dataset.demoRodou = "1";
    avisaMudanca();
    escreve(document.getElementById("log-aberta"), [
      ["", "POST /pagamento  R$ 4.900,00"],
      ["aviso", "antifraude: timeout (5000ms)"],
      ["erro", "catch { /* segue o jogo */ }"],
      ["erro", "APROVADA sem verificação ✕"],
      ["erro", "fraude concluída com sucesso…"]
    ]);
    escreve(document.getElementById("log-fechada"), [
      ["", "POST /pagamento  R$ 4.900,00"],
      ["aviso", "antifraude: timeout (5000ms)"],
      ["ok", "timeout tratado como recusa"],
      ["ok", "RECUSADA + evento no log ✓"],
      ["", "cliente: \"tente novamente\""]
    ]);
  }
  if (e.target.id === "btn-reset") {
    document.getElementById("log-aberta").textContent = "aguardando…";
    document.getElementById("log-fechada").textContent = "aguardando…";
    // volta ao estado inicial do slide: a próxima seta roda a simulação de novo
    if (els[atual]) delete els[atual].dataset.demoRodou;
    avisaMudanca();
  }
});

/* ---------- api pública, usada pelo controle remoto ---------- */

function tituloDe(i) {
  const provisorio = document.createElement("div");
  provisorio.innerHTML = SLIDES[i].html;
  const titulo = provisorio.querySelector("h1, h2");
  if (!titulo) return "Slide " + (i + 1);
  titulo.querySelectorAll("br").forEach((br) => br.replaceWith(" "));
  return titulo.textContent.trim();
}

window.DECK = {
  total: SLIDES.length,
  proximo,
  anterior,
  irPara,
  titulo: tituloDe,
  // o celular precisa saber se a seta vai rodar a demo ou pular de slide
  estado() {
    const el = els[atual];
    const revela = !!(el && el.querySelector("#btn-simular") && !el.dataset.demoRodou);
    return {
      i: atual,
      total: SLIDES.length,
      titulo: tituloDe(atual),
      nota: SLIDES[atual].nota,
      proximoTitulo: atual + 1 < SLIDES.length ? tituloDe(atual + 1) : null,
      revela,
      // rótulo pronto: o celular não precisa saber as regras deste deck
      dica: revela ? "roda a simulação" : "próximo slide"
    };
  }
};

/* ---------- partículas da capa (nas cores wyden) ---------- */

const canvas = document.getElementById("fx");
const ctx = canvas.getContext("2d");
let pontos = [];

function dimensiona() {
  canvas.width = innerWidth * devicePixelRatio;
  canvas.height = innerHeight * devicePixelRatio;
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
}
dimensiona();
window.addEventListener("resize", dimensiona);

const CORES = ["#f26f21", "#b01e77", "#e9a6cf"];
for (let i = 0; i < 70; i++) {
  pontos.push({
    x: Math.random() * innerWidth,
    y: Math.random() * innerHeight,
    vx: (Math.random() - .5) * .4,
    vy: (Math.random() - .5) * .4,
    r: Math.random() * 2 + .8,
    cor: CORES[i % CORES.length]
  });
}

(function anima() {
  requestAnimationFrame(anima);
  if (document.body.dataset.slide !== "0") return;
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  for (const p of pontos) {
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0 || p.x > innerWidth) p.vx *= -1;
    if (p.y < 0 || p.y > innerHeight) p.vy *= -1;
    ctx.globalAlpha = .8;
    ctx.fillStyle = p.cor;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = .12;
  ctx.strokeStyle = "#f26f21";
  for (let i = 0; i < pontos.length; i++) {
    for (let j = i + 1; j < pontos.length; j++) {
      const a = pontos[i], b = pontos[j];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < 130) {
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }
  ctx.globalAlpha = 1;
})();
