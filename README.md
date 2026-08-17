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

## Navegação

| Tecla | Ação |
|---|---|
| `←` `→` / espaço | slide anterior / próximo |
| `Home` / `End` | primeiro / último slide |
| `N` | notas do apresentador |
