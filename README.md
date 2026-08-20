# Falhar com Segurança — apresentação

Deck web sobre o princípio **fail-safe** (Falhar com Segurança), feito para a disciplina
Desenvolvimento de Software Seguro (Martha Falcão Wyden, Prof. Ranyere Lima).

**Ver no ar:** https://cauelimsia.github.io/software-seguro-apresentacao/

## O que tem de interessante

- Engine de slides própria em JavaScript puro: cada slide é um objeto de dados, o resto é derivado
- **Demo interativa ao vivo**: um botão simula a queda do serviço antifraude e mostra lado a lado
  o comportamento fail-open (aprova fraude) vs fail-closed (recusa com log)
- Deep-link por hash (`#/4` abre direto o slide 4), navegação por teclado e touch
- Notas do apresentador embutidas (tecla `N`)
- Fundo de partículas em canvas na capa, nas cores da identidade Wyden

## Rodar local

É estático, basta servir a pasta:

```bash
npx serve .
```

## Passar os slides pelo celular

Nada para instalar na máquina que projeta — ela só abre o link do GitHub Pages.

1. Na máquina do projetor, abra https://cauelimsia.github.io/software-seguro-apresentacao/
2. No canto superior direito aparece um **código de 4 caracteres** (`C` mostra/esconde o cartão)
3. No celular, abra `https://cauelimsia.github.io/software-seguro-apresentacao/controle.html`
   e digite o código
4. Pareou, o cartão do código encolhe e o celular passa a comandar

O celular mostra o slide atual, a nota do apresentador, o que vem a seguir e um botão grande
de avançar — que avisa quando o toque vai *rodar a simulação* da demo em vez de trocar de slide.
A tela do celular não apaga durante a apresentação (Wake Lock).

Atalho: `.../controle.html#sala=ABCD` já entra pareado, dá para deixar salvo antes da aula.

### Como funciona

Os dois lados falam por MQTT sobre WebSocket num broker público (`broker.emqx.io`), nos
tópicos `wyden/deck/<CODIGO>/acao` e `.../estado`. O estado é publicado com `retain`, então o
celular abre já sincronizado; o código sorteado fica no `sessionStorage` do deck, então um F5
no meio da apresentação não derruba o pareamento.

O broker é público e sem autenticação: quem souber o código consegue passar os slides. Para
uma apresentação de aula isso é aceitável, e o canal não carrega nada sensível. Se o broker
cair, o deck continua funcionando normal no teclado — o controle é um extra.

### Plano B: sem internet, servidor local

Se a internet da sala não colaborar e você puder rodar algo na máquina que projeta, existe um
servidor em Python (só biblioteca padrão) que faz o mesmo pela rede local:

```bash
python servidor-controle.py
```

Ele imprime os dois endereços — `http://localhost:8000/` para o projetor e
`http://<ip-do-notebook>:8000/controle` para o celular. Os dois precisam estar na mesma rede;
se a wi-fi da faculdade isolar os dispositivos, ligue o roteador do celular e conecte o
notebook nele.

## Navegação

| Tecla | Ação |
|---|---|
| `←` `→` / espaço | slide anterior / próximo |
| `Home` / `End` | primeiro / último slide |
| `N` | notas do apresentador |
| `C` | mostra/esconde o cartão com o código do controle |
| `PageUp` / `PageDown` | também navegam — é o que um clicker Bluetooth genérico envia |
