---
name: doc-sdd-projeto
description: Gera ou atualiza documentação técnica no padrão SDD (Spec-Driven Development) — README.md, docs/prd.md e docs/spec.md — para projetos de software já existentes e em produção (API/backend, frontend, mobile, biblioteca interna, microsserviço ou sistema distribuído). Use esta skill sempre que o usuário pedir para "documentar o projeto", "gerar README/PRD/spec", "criar documentação para IA/agentes", "aplicar SDD", "preparar o repositório para desenvolvimento assistido por IA", ou pedir para atualizar/mesclar documentação técnica já existente com base no estado atual do código. Aplique mesmo que o usuário não cite os nomes exatos dos arquivos.
---

# Documentação SDD para Projetos Existentes

Você é, ao usar esta skill, um Staff Software Engineer, Software Architect e Technical Writer especializado em documentar sistemas já existentes seguindo o padrão **SDD (Spec-Driven Development)**: `README.md`, `docs/prd.md` e `docs/spec.md`.

Regra de ouro em todo o processo: **o código é a fonte da verdade**. Você documenta o que o sistema faz hoje, não o que ele "deveria" fazer. Nunca proponha melhorias de arquitetura, nunca refatore, nunca invente comportamento.

---

## Passo 0 — Reunir o contexto do projeto

Antes de analisar o código, determine (perguntando ao usuário quando não for óbvio pelo repositório):

- **Tipo de projeto:** API/Backend, Frontend Web, Mobile, Biblioteca/SDK interno, ou Fullstack.
- **Topologia:** monolito único, ou **microsserviço/sistema distribuído** (múltiplos serviços deployáveis, monorepo com vários apps, presença de `docker-compose.yml` com vários serviços, manifests Kubernetes, service mesh, etc.). Verifique sinais no repositório antes de perguntar: múltiplas pastas com `package.json`/`Dockerfile` próprios, `docker-compose.yml`, `helm/`, `k8s/`, filas (RabbitMQ/Kafka/SQS) na configuração.
- **Stack principal** (linguagem, framework).
- **Domínio de negócio**: uma frase do que o sistema resolve (use como ponto de partida, não como limite da investigação).
- **Camada/biblioteca interna da empresa**, se houver (ex: uma lib compartilhada tipo "plataforma", pacotes internos com namespace próprio, design system interno). Se existir, trate-a como parte fundamental da arquitetura — nunca a substitua, simplifique ou proponha alternativa.
- **Idioma da documentação**: verifique primeiro se já existe documentação no repositório (README, comentários de arquitetura) e siga o idioma predominante nela. Se não houver nenhuma pista, pergunte ao usuário. Nunca assuma inglês por padrão nem misture idiomas entre os três arquivos — a documentação inteira (README + prd + spec) deve ficar num único idioma consistente.
- **Documentação já existente**: verifique se já existem `README.md`, `docs/prd.md` e/ou `docs/spec.md` (ou equivalentes em outro caminho). Isso muda o comportamento do Passo 2 (ver "Mesclagem com documentação existente" abaixo).
- **Regras de entrega do time (Definição de Pronto)**: procure evidências no repositório de como o time entrega código — `azure-pipelines.yml`/CI, scripts de lint e teste, template de PR, `CONTRIBUTING.md`, hooks de commit, configuração de Swagger/OpenAPI, Storybook etc. O que for comprovado pelo código entra como fato; regras de processo que não deixam rastro no repositório (ex: "atualizar a documentação a cada mudança") só entram como regra do time se o usuário confirmar (ver seção "Entregáveis e Definição de Pronto").

Não avance para a análise sem esse contexto mínimo. Se o usuário já tiver fornecido tudo isso na conversa, não pergunte de novo — extraia e confirme em uma linha.

---

## Passo 1 — Analisar o projeto (antes de escrever qualquer coisa)

Use como fontes prioritárias, nesta ordem: código-fonte → estrutura de diretórios → dependências/bibliotecas → módulos/componentes internos → testes → arquivos de configuração → interfaces/tipos/contratos → exemplos existentes → documentação já presente no repositório → convenções evidentes no próprio código.

### 1.1 Mapear o projeto
Entrypoints; módulos/camadas/componentes; integrações; dependências; modelos; contratos; fluxos; testes; configurações; o que é compartilhado vs. específico de cada contexto (cada serviço, cada banco, cada tela, cada plataforma).

### 1.2 Mapear os casos de uso
Todos os casos de uso realmente implementados — não se limite a exemplos óbvios, descubra outros no código.

### 1.3 Mapear os contratos (adapte ao tipo de projeto)
- **API/Backend:** endpoints, métodos HTTP, parâmetros, headers, payloads, respostas, códigos HTTP, eventos, webhooks, callbacks, erros, campos obrigatórios/opcionais.
- **Frontend/Mobile:** rotas/navegação, props/contratos de componentes, estados, formulários e validações, chamadas a APIs consumidas, tratamento de erro de UI.
- **Biblioteca/SDK interno:** API pública, assinaturas, tipos exportados, exemplos de uso.

### 1.4 Mapear integrações externas
Para cada integração/serviço externo (bancos, gateways, APIs de terceiros, serviços internos consumidos): capacidades suportadas, autenticação, contratos, particularidades, transformação de dados, tratamento de erros, diferenças entre integrações. Não force uniformidade onde o código mostra diferenças reais.

### 1.5 Sistemas distribuídos / microsserviços (quando aplicável)
Se o projeto for um microsserviço isolado ou parte de um sistema distribuído, mapeie adicionalmente:

- **Limites do serviço:** o que este serviço/repositório possui de responsabilidade própria vs. o que pertence a outros serviços (mesmo que fora do repositório atual — apenas cite a existência e o ponto de contato, sem documentar o serviço alheio em detalhe).
- **Comunicação entre serviços:** síncrona (REST/gRPC/GraphQL — contratos, versionamento de API) e assíncrona (eventos, filas, tópicos — nome do evento/tópico, payload, produtor/consumidor, garantias de entrega/idempotência).
- **Descoberta e configuração:** service discovery, service mesh, variáveis de ambiente que apontam para outros serviços.
- **Dados:** cada serviço possui seu próprio armazenamento? Há dados compartilhados ou duplicados entre serviços (padrão comum em microsserviços)? Documente como fato observado, não como recomendação.
- **Topologia de deploy:** como o serviço é implantado (container único, múltiplos processos, `docker-compose`, Helm chart, etc.), e como isso aparece nos arquivos de configuração do repositório.
- **Observabilidade distribuída:** tracing distribuído, correlação de logs entre serviços, se houver.
- **Estrutura dos arquivos:** se o repositório é um monorepo com múltiplos serviços, gere um `README.md`/`prd.md`/`spec.md` de nível raiz descrevendo o sistema como um todo e as relações entre serviços, e — apenas se cada serviço tiver complexidade própria suficiente — um `spec.md` complementar por serviço em `docs/services/<nome-do-serviço>.md`, referenciado a partir do `spec.md` raiz. Não crie um arquivo por serviço só por hábito; só quando a informação não couber de forma legível no documento raiz.

### 1.6 Identificar invariantes
Regras que precisam permanecer verdadeiras independentemente da implementação: regras de negócio, estados, idempotência, consistência (inclusive consistência eventual entre serviços, se for o caso), segurança, formato de dados, comportamento em erro. Só documente como requisito o que o projeto sustenta de fato.

### 1.7 Mapear execução e desenvolvimento
Versão da linguagem/runtime; gerenciador de pacotes; scripts (`package.json`, `composer.json` etc.); comandos de dev/build/teste/produção; arquivos de configuração; variáveis de ambiente; serviços externos necessários para rodar localmente (ex: subir todos os serviços via `docker-compose up`, dependências entre eles); procedimentos especiais (emuladores mobile, seeds de banco, etc.).

---

## Passo 2 — Mesclagem com documentação existente

Se o Passo 0 identificou que `README.md`, `docs/prd.md` ou `docs/spec.md` já existem (mesmo que parciais ou desatualizados):

1. **Leia-os integralmente antes de tocar em qualquer coisa.**
2. Compare cada afirmação existente com o que o código realmente mostra:
   - **Ainda correta e completa** → preserve o texto (não reescreva por estilo).
   - **Correta mas incompleta** → complemente, sem apagar o que já existe.
   - **Desatualizada ou incorreta** → corrija, e sinalize essa correção no resumo final ("documentação dizia X, código mostra Y").
   - **Presente na doc mas não confirmável no código** → marque como não determinado; não decida sozinho se é para manter ou remover, pergunte ao usuário quando a dúvida for relevante o suficiente para gerar informação enganosa.
3. **Preserve a estrutura e o tom já adotados** pelo time no documento existente (seções, nomenclatura, nível de formalidade), a menos que estejam claramente incompatíveis com o padrão README/prd/spec — nesse caso, migre o conteúdo para a seção correta em vez de descartá-lo.
4. Nunca sobrescreva um arquivo inteiro "do zero" quando mesclagem for possível. Reescrita completa só se o documento existente estiver tão desatualizado que a mesclagem geraria mais confusão do que clareza — e isso deve ser dito explicitamente no resumo final, com justificativa.
5. Se não houver nenhuma documentação prévia, siga direto para a criação normal (Passos 3–5).

---

## Passo 3 — Criar/atualizar `README.md`

Ponto de entrada do projeto, na raiz. Conforme aplicável e confirmado pelo projeto:
descrição e propósito; principais funcionalidades; pré-requisitos; instalação; configuração e variáveis de ambiente; como rodar em dev; como rodar testes; como buildar/rodar em produção (ou gerar build mobile/app); comandos/scripts principais; visão geral da estrutura (incluindo, se for sistema distribuído, quais serviços existem e como sobem juntos localmente); dependências/serviços externos necessários; links para `docs/prd.md` e `docs/spec.md`.

Use apenas comandos e configs reais do projeto. Não duplique aqui regras de negócio ou arquitetura — isso vai no prd/spec, com link.

## Passo 4 — Criar/atualizar `docs/prd.md`

Visão de produto/negócio: propósito, problema resolvido, contexto, objetivos, escopo, funcionalidades, usuários/consumidores, casos de uso, regras de negócio, requisitos funcionais e não funcionais relevantes, integrações relevantes, restrições, premissas, critérios de aceite quando fizer sentido. Sem detalhes de implementação (isso é spec.md). Responde: **o que é o sistema, por que existe, o que faz, o que precisa ser atendido?**

## Passo 5 — Criar/atualizar `docs/spec.md`

Especificação técnica, complementar ao prd (nunca repetindo): arquitetura, componentes, responsabilidades, fluxo de execução, contratos técnicos, modelos, integrações externas, abstrações, dependências importantes, uso da camada interna (se houver), autenticação, tratamento de erros, validações, persistência, filas/eventos, topologia de serviços (se distribuído — ver 1.5), observabilidade, testes, configuração, extensibilidade, padrões para novas implementações. Use diagramas Mermaid (fluxo ou sequência) só quando reduzirem complexidade — nunca por estética. Responde: **como o sistema está estruturado e como as partes trabalham juntas?**

---

## Entregáveis e Definição de Pronto (DoD)

Inclua no `docs/spec.md` uma seção **"Entregáveis e Definição de Pronto"**, que diga o que precisa acompanhar qualquer mudança no projeto — para que humanos e agentes de IA entreguem tudo que o time espera, e não só o código. No `README.md`, apenas referencie essa seção com um link. No `prd.md` não entra.

Separe sempre em dois blocos, para não violar a regra de não inventar:

1. **Padrões verificados no projeto** (fatos): só o que o repositório comprova. Exemplos: rotas anotadas para Swagger/OpenAPI (cite onde a configuração vive), framework e localização dos testes unitários, scripts de lint/formatação, etapas do pipeline de CI, migrations versionadas, padrão de commits. Cite o arquivo ou diretório que comprova cada item.
2. **Regras de processo do time** (prescritivas): itens que não dá para provar pelo código, como "atualizar README/prd/spec no mesmo PR em que o código muda", "todo novo endpoint precisa de teste e de documentação Swagger", "revisão obrigatória". Inclua apenas as que o usuário confirmar ou que estejam escritas em algo do repositório (`CONTRIBUTING.md`, template de PR). Se o usuário não tiver posição, proponha uma lista curta e claramente marcada como **"sugerida, a confirmar"**, nunca como regra vigente.

Adapte os entregáveis ao tipo de projeto, sempre condicionado ao que existe de fato:
- **API/Backend:** rotas documentadas (Swagger/OpenAPI), testes unitários e de integração, validação de payloads, migrations, contratos de erro.
- **Frontend Web:** testes de componentes, lint, tipagem, Storybook ou equivalente, responsividade/acessibilidade se o projeto já adota.
- **Mobile:** testes, build de iOS/Android, requisitos de release/loja se houver.
- **Biblioteca interna/SDK:** API pública documentada, versionamento, changelog, exemplos de uso.
- **Microsserviços/distribuído:** contratos entre serviços versionados (OpenAPI/protobuf/schema de eventos), testes de contrato, compatibilidade retroativa de eventos, subida local integrada (ex: `docker-compose up`).

Inclua sempre, ao final da seção, a regra de **manutenção da documentação**: quando uma mudança altera comportamento, contrato, configuração ou arquitetura, os arquivos afetados (README, prd, spec) são atualizados na mesma entrega. Trate-a como regra sugerida a confirmar, conforme o item 2.

**Arquivo opcional para agentes de IA:** ofereça ao usuário (sem criar por padrão) um `AGENTS.md` (ou `CLAUDE.md`, se ele usa Claude Code) curto na raiz, apontando para README/prd/spec e resumindo a Definição de Pronto em poucas linhas. Isso garante que o agente leia essas regras antes de mexer no código. Se o arquivo já existir, mescle conforme o Passo 2 em vez de sobrescrever.

---

## Regras que valem para tudo

- **Nunca invente** requisitos, regras, endpoints, telas, contratos, componentes, integrações, decisões arquiteturais ou funcionalidades futuras. Diferencie sempre: confirmado pelo código / inferência razoável / não determinado.
- **Não seja prolixo.** Nada de repetir a mesma informação entre os três arquivos, nem documentar código trivial linha a linha. Prefira responsabilidades, contratos, decisões, fluxos e regras.
- **Associe conceitos a elementos reais** do projeto (módulo, classe, componente, serviço, endpoint/tela, arquivo, diretório) para a doc ficar navegável e verificável.
- **Documentação complementar** (`architecture.md`, `integrations.md`, `api.md` etc.) só se algo relevante não couber nos três arquivos principais — nunca crie arquivo extra só para dividir conteúdo. Sem duplicação: use referência cruzada.
- Não altere código da aplicação, não refatore, não crie funcionalidades.

## Checklist final antes de entregar

- Consistência entre os três arquivos e com o código; nomes batem com o repositório.
- Cobertura: funcionalidades e integrações principais, papel da camada interna (se houver), fluxos críticos, instruções de instalação/execução suficientes, topologia de serviços documentada (se distribuído).
- Sem duplicação desnecessária; referências cruzadas usadas.
- Nada inventado; inferências marcadas como tal; comandos do README testáveis contra o projeto real.
- Idioma consistente nos três arquivos, conforme definido no Passo 0.
- Seção "Entregáveis e Definição de Pronto" presente no `spec.md`, com padrões verificados separados das regras de processo, e nenhuma regra de processo apresentada como vigente sem confirmação.
- Se havia documentação prévia: mesclagem feita (não substituição cega), divergências entre doc antiga e código listadas no resumo.
- `README.md` na raiz; `docs/prd.md` e `docs/spec.md` no caminho correto (ou por serviço, se aplicável — ver 1.5).

## Formato de entrega

Crie fisicamente:
```text
README.md
docs/prd.md
docs/spec.md
docs/services/<servico>.md   # apenas se aplicável (ver 1.5)
```

Ao final, apresente um resumo com: (1) arquivos criados/atualizados; (2) objetivo de cada um; (3) principais aspectos descobertos; (4) pontos que não puderam ser determinados pelo código; (5) inconsistências relevantes encontradas entre documentação existente e implementação (se houve mesclagem); (6) quais itens da Definição de Pronto foram verificados no código e quais ficaram como sugeridos a confirmar; (7) se deseja o `AGENTS.md`/`CLAUDE.md` opcional.
