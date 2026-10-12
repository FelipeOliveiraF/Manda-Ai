# Mostra aí — Inventário de funcionalidades

**Versão analisada:** 1.15  
**Data do inventário:** 11 de outubro de 2026  
**Site:** <https://grupo-dos-amigos-tela.flof0.chatgpt.site>

Este documento apresenta o inventário funcional do Mostra aí com base na interface, no código da aplicação e na estrutura do Supabase.

## Legenda

- ✅ Disponível e utilizável.
- 🟡 Existe parcialmente ou somente no backend.
- ⚠️ Limitação relevante para auditoria.

## 1. Conta e autenticação

- ✅ Login obrigatório com conta Google.
- ✅ Sessão persistente: o usuário não precisa entrar novamente a cada visita.
- ✅ Logout.
- ✅ Perfil individual salvo no Supabase.
- ✅ Alteração do nome de exibição.
- ✅ Foto de perfil personalizada.
- ✅ Remoção da foto personalizada.
- ✅ Avatar com iniciais quando não existe foto.
- ✅ Fotos JPG, PNG e WebP, com limite de 5 MB.
- ✅ Foto é recortada, redimensionada para 512×512 e convertida em JPEG antes do envio.
- ✅ Página de Termos de Uso.
- ✅ Página de Política de Privacidade.
- ⚠️ Não existe cadastro por e-mail e senha.
- ⚠️ Não existe acesso como convidado sem conta.
- ⚠️ Exclusão da conta não pode ser feita pela interface; atualmente precisa ser solicitada por e-mail.
- ⚠️ Não existe gerenciamento de sessões ou opção de “sair de todos os dispositivos”.

## 2. Salas

- ✅ Criar salas permanentes.
- ✅ Salas ficam vinculadas à conta.
- ✅ Lista de salas na barra lateral.
- ✅ Busca de salas pelo nome.
- ✅ Identificador/código interno da sala.
- ✅ Sala permanece salva para quem aceitou o convite.
- ✅ Nome personalizado da sala.
- ✅ Foto personalizada da sala.
- ✅ Apenas o dono pode alterar o nome e a foto da sala.
- ✅ Nome diferente para cada usuário em cada sala.
- ✅ A mesma pessoa pode usar nomes diferentes em salas diferentes.
- ✅ Contagem de participantes conectados.
- ✅ Tela de membros mostrando todas as pessoas que têm acesso.
- ✅ Indicação de membro online.
- ✅ Data do último acesso quando a pessoa não está online.
- ✅ Entrada e saída da chamada sem remover a sala da conta.
- ⚠️ Não existe botão para excluir uma sala.
- ⚠️ Não existe botão para sair permanentemente de uma sala.
- ⚠️ Não existe transferência de propriedade da sala.
- ⚠️ Não existe descrição, categoria ou tópico da sala.
- ⚠️ A pré-entrada mostra quantas pessoas têm acesso, não quantas estão online.

## 3. Pré-entrada

- ✅ Tela de confirmação antes de entrar na chamada.
- ✅ Exibição do nome da sala.
- ✅ Alteração do nome que será usado naquela sala.
- ✅ Prévia da câmera.
- ✅ Ligar ou desligar a câmera antes de entrar.
- ✅ Ligar ou desligar o microfone antes de entrar.
- ✅ Seleção do microfone.
- ✅ Seleção da câmera.
- ✅ Indicação textual do estado de câmera e microfone.
- ✅ Respeita bloqueios administrativos de microfone.
- ✅ Cancelar a entrada sem abrir a chamada.
- ⚠️ Não existe teste de alto-falante na pré-entrada.
- ⚠️ Não existe controle de volume de entrada na pré-entrada.

## 4. Convites

- ✅ Convite por link.
- ✅ Página mostra o nome da sala antes do login.
- ✅ Depois do login, aparece a confirmação “Aceitar convite”.
- ✅ Opção de recusar com “Agora não”.
- ✅ Ao aceitar, a sala fica salva na conta e na barra lateral.
- ✅ Convites com validade de 24 horas, 7 dias, 30 dias ou sem expiração.
- ✅ Link pode ser copiado pela interface.
- ✅ Histórico de convites para administradores.
- ✅ Indicação de convite ativo, expirado ou revogado.
- ✅ Exibição de quem criou o convite.
- ✅ Contador de usos do convite.
- ✅ Administradores podem revogar convites.
- ✅ O criador também tem permissão no backend para revogar o próprio convite.
- ✅ Tokens são guardados no banco como hash; o link completo aparece somente quando é gerado.
- ✅ Convites expirados ou revogados são rejeitados.
- ⚠️ Qualquer membro da sala pode gerar um convite.
- ⚠️ Membros comuns não enxergam o histórico e não conseguem revogar pela interface um convite que criaram.
- ⚠️ Não existe limite de usos por convite.
- ⚠️ Não existe convite individual vinculado a um e-mail específico.
- ⚠️ Não existe aprovação manual para entrada.

## 5. Áudio e microfone

- ✅ Ligar e desligar o microfone.
- ✅ Selecionar microfone.
- ✅ Preferência do microfone fica salva naquele navegador.
- ✅ Trocar de microfone durante a chamada.
- ✅ Testar microfone.
- ✅ Medidor visual de intensidade do microfone.
- ✅ Cancelamento de eco.
- ✅ Supressão de ruído.
- ✅ Indicador visual verde em volta de quem está falando.
- ✅ Administrador pode bloquear o microfone de um membro.
- ✅ Se o administrador bloquear, um microfone ativo é desligado imediatamente.
- ✅ Administrador pode liberar o microfone novamente.
- ✅ Volume individual do áudio recebido.
- ✅ Silenciar ou reativar individualmente cada transmissão recebida.
- ⚠️ Não existe seleção do dispositivo de saída/alto-falante.
- ⚠️ Não existe controle de ganho do próprio microfone.
- ⚠️ Não existe gravação da chamada.

## 6. Webcam

- ✅ Ligar e desligar a câmera.
- ✅ Selecionar webcam.
- ✅ Preferência da webcam fica salva naquele navegador.
- ✅ Trocar de webcam durante a chamada.
- ✅ Testar a câmera com prévia local.
- ✅ Vídeo configurado para resolução ideal de 1280×720.
- ✅ Avatar aparece quando a câmera está desligada.
- ⚠️ Administradores não podem bloquear a webcam de outra pessoa.
- ⚠️ Não existem fundos virtuais, desfoque ou filtros.
- ⚠️ Não existe espelhamento configurável da câmera.

## 7. Compartilhamento de tela

- ✅ Compartilhar uma aba, janela ou tela disponibilizada pelo navegador.
- ✅ Preferência por compartilhamento de aba.
- ✅ Até 60 FPS, dependendo do navegador e do computador.
- ✅ Parar o compartilhamento pela interface ou pelo navegador.
- ✅ Administrador pode bloquear o compartilhamento de um membro.
- ✅ Um compartilhamento ativo é interrompido imediatamente se for bloqueado.
- ✅ Administrador pode liberar novamente.
- ✅ Compartilhamento de áudio apenas quando uma aba do navegador é escolhida.
- ✅ Áudio do sistema é explicitamente desativado.
- ✅ Áudio de janelas é explicitamente desativado.
- ✅ Aviso quando a pessoa não marcou “Compartilhar áudio da guia”.
- ✅ Aviso quando tela ou janela é compartilhada sem áudio.
- ✅ Controle de volume do áudio compartilhado para cada espectador.
- ✅ Silenciar individualmente uma transmissão.
- ⚠️ A disponibilidade do áudio da aba depende do navegador, normalmente Chrome ou Edge.
- ⚠️ Câmera e tela não aparecem como duas transmissões independentes da mesma pessoa.

## 8. Visualização das transmissões

- ✅ Grade com todos os participantes.
- ✅ Nome da pessoa em cada transmissão.
- ✅ Identificação de tela, câmera ou somente áudio.
- ✅ Identificação “você” na transmissão local.
- ✅ Destacar uma tela dentro do Mostra aí.
- ✅ Voltar da visualização destacada para a grade.
- ✅ Tela cheia nativa do navegador.
- ✅ Duplo clique na tela compartilhada para abrir em tela cheia.
- ✅ Marca visual “Mostra aí — Você está vendo uma transmissão” na tela cheia.
- ✅ Bordas e identidade do produto na visualização.
- ✅ Botão para sair da chamada com ícone de telefone vermelho.
- ✅ Estado “Conectando”, “Sala conectada” e mensagens de falha.
- ⚠️ Se o participante que atua como coordenador da conexão sair, os demais podem precisar sair e entrar novamente.
- ⚠️ Não existe servidor próprio de mídia, SFU ou TURN configurado no projeto.
- ⚠️ A arquitetura atual é mais apropriada para grupos pequenos.

## 9. Gestos e pedir para falar

- ✅ Levantar a mão com 🙋.
- ✅ Aplaudir com 👏.
- ✅ Rir com 😂.
- ✅ Coração com ❤️.
- ✅ Comemorar com 🎉.
- ✅ Enviar qualquer emoji personalizado.
- ✅ O gesto aparece flutuando sobre a chamada.
- ✅ O nome de quem enviou aparece junto.
- ✅ Gestos são enviados em tempo real para a sala.
- ⚠️ Gestos são temporários e não ficam registrados.
- ⚠️ “Levantar a mão” ainda não cria uma fila organizada; é somente um gesto visual.
- ⚠️ Não existe controle administrativo para abaixar a mão de alguém.

## 10. Chat de texto

- ✅ Chat persistente no Supabase.
- ✅ Atualização em tempo real.
- ✅ Até 2.000 caracteres por mensagem.
- ✅ Nome, avatar e horário da mensagem.
- ✅ Vários chats de texto dentro da mesma sala.
- ✅ Abas para alternar entre os chats.
- ✅ Um chat inicial é criado automaticamente.
- ✅ Administradores podem criar novos chats.
- ✅ Responder uma mensagem.
- ✅ A resposta mostra trecho e autor da mensagem original.
- ✅ Clicar na referência leva à mensagem original quando ela está carregada.
- ✅ Reagir a mensagens com qualquer emoji.
- ✅ Contador de reações.
- ✅ Destaque quando o próprio usuário reagiu.
- ✅ Clicar novamente remove a própria reação.
- ✅ Administradores podem fixar e desafixar mensagens.
- ✅ Painel com as mensagens fixadas.
- ✅ Clicar em uma mensagem fixada leva até ela.
- ✅ Administradores podem apagar uma mensagem específica.
- ✅ Administradores podem limpar todo o chat atual.
- ✅ Backend permite que um usuário apague a própria mensagem.
- ⚠️ O botão de apagar só aparece para administradores; membros comuns não conseguem apagar a própria mensagem pela interface.
- ⚠️ Apenas as 200 mensagens mais recentes são carregadas.
- ⚠️ Não existe paginação para buscar mensagens mais antigas.
- ⚠️ Não é possível editar uma mensagem.
- ⚠️ Não existe busca no histórico.
- ⚠️ Não existem anexos, imagens, arquivos, GIFs ou links com prévia.
- ⚠️ Não existem mensagens privadas.
- ⚠️ Não existem notificações ou contador de mensagens não lidas.
- ⚠️ As reações usam uma caixa simples para digitar o emoji, não um seletor completo.

## 11. Canais de texto

- ✅ Uma sala pode ter múltiplos chats de texto.
- ✅ Administradores podem criar chats.
- ✅ Os nomes têm limite de 40 caracteres.
- ✅ Não é permitido duplicar nomes dentro da sala.
- ✅ Backend impede excluir o último chat da sala.
- 🟡 O backend suporta renomear chats, mas não há botão na interface.
- 🟡 O backend suporta excluir chats, mas não há botão na interface.
- ⚠️ Não existe reordenação dos chats.
- ⚠️ Não existem permissões diferentes por chat.
- ⚠️ Todos os membros da sala enxergam todos os chats.

## 12. Membros e cargos

Existem três cargos:

- ✅ Dono.
- ✅ Administrador.
- ✅ Membro.

### 12.1 Dono

- ✅ Personalizar a sala.
- ✅ Promover membro a administrador.
- ✅ Remover cargo de administrador.
- ✅ Moderar administradores e membros.
- ✅ Criar chats.
- ✅ Limpar chats.
- ✅ Apagar e fixar mensagens.
- ✅ Gerenciar convites.

### 12.2 Administrador

- ✅ Criar chats.
- ✅ Limpar chats.
- ✅ Apagar e fixar mensagens.
- ✅ Consultar e revogar convites.
- ✅ Silenciar membros.
- ✅ Bloquear compartilhamento de tela.
- ✅ Remover membros comuns.
- ⚠️ Não pode moderar outro administrador.
- ⚠️ Não pode moderar ou remover o dono.

### 12.3 Membro

- ✅ Conversar.
- ✅ Responder e reagir.
- ✅ Usar câmera e microfone.
- ✅ Compartilhar tela, quando permitido.
- ✅ Criar convites.
- ✅ Alterar o próprio nome naquela sala.
- ✅ Ver a lista de membros.

## 13. Administração e moderação

- ✅ Ver todas as pessoas que já têm acesso.
- ✅ Ver cargo de cada pessoa.
- ✅ Ver quem está online.
- ✅ Ver data do último acesso.
- ✅ Promover e rebaixar administradores — somente o dono.
- ✅ Silenciar membros.
- ✅ Liberar microfone.
- ✅ Bloquear compartilhamento de tela.
- ✅ Liberar compartilhamento de tela.
- ✅ Remover uma pessoa da sala.
- ✅ Remoção é percebida em tempo real.
- ✅ A pessoa removida é retirada da sala e perde acesso aos dados.
- ✅ Confirmação antes de remover pessoa.
- ✅ Confirmação antes de limpar chat ou revogar convite.
- ⚠️ Não existe banimento permanente.
- ⚠️ Uma pessoa removida pode voltar se receber outro convite válido.
- ⚠️ Não existe lista de banidos.
- ⚠️ Não existe registro ou auditoria das ações administrativas.
- ⚠️ Não existe denúncia de membro ou conteúdo.
- ⚠️ Não existe moderação automática.

## 14. Tempo real e persistência

- ✅ Salas, membros, perfis, canais e mensagens ficam persistidos no Supabase.
- ✅ Mensagens e reações atualizam em tempo real.
- ✅ Alterações de membros e canais atualizam em tempo real.
- ✅ Controles administrativos também são consultados a cada 15 segundos como segurança adicional.
- ✅ Áudio, vídeo, tela e gestos usam PeerJS/WebRTC.
- ✅ Áudio, vídeo e tela não são gravados pelo Mostra aí.
- ✅ Gestos de chamada não passam pelo banco.
- ✅ Preferências de câmera e microfone ficam no armazenamento local do navegador.
- ⚠️ O estado “online” da chamada vem da conexão PeerJS, não de uma presença persistente no Supabase.
- ⚠️ Se a pessoa fechar a aba abruptamente, pode levar alguns segundos para desaparecer da lista online.

## 15. Segurança e acesso

- ✅ Login necessário para aceitar convites.
- ✅ Regras de acesso por associação à sala.
- ✅ Usuários só consultam salas das quais são membros.
- ✅ Mensagens e reações possuem políticas de acesso por sala.
- ✅ Ações administrativas são validadas no banco, não apenas escondidas na interface.
- ✅ Tokens de convite não ficam expostos diretamente na tabela pública.
- ✅ Upload de fotos possui regras separadas para perfil e sala.
- ✅ Dono e administradores têm permissões diferentes.
- ✅ A aplicação usa apenas a chave pública do Supabase no navegador.
- ✅ Política do navegador restringe câmera, microfone e captura de tela ao próprio site.
- ⚠️ Não existe autenticação de dois fatores própria.
- ⚠️ Não existe limite de tentativas ou rate limiting implementado no aplicativo.
- ⚠️ Não existe CAPTCHA.
- ⚠️ Não existe criptografia ponta a ponta gerenciada pelo aplicativo além da segurança normal do WebRTC/HTTPS.
- ⚠️ Não há política CSP explícita nos cabeçalhos atuais.

## 16. Interface e experiência

- ✅ Tema escuro roxo.
- ✅ Layout inspirado em aplicativos de comunicação.
- ✅ Barra lateral com salas.
- ✅ Painel de chamada e painel de chat.
- ✅ Chat pode ser aberto ou fechado.
- ✅ Interface responsiva para telas menores.
- ✅ Menu lateral móvel.
- ✅ Mensagens de sucesso e erro por toast.
- ✅ Modais podem ser fechados com Escape.
- ✅ Foco fica preso dentro do modal usando Tab e Shift+Tab.
- ✅ Textos e botões possuem alguns rótulos de acessibilidade.
- ✅ Indicador de versão 1.15 na entrada e na barra lateral.
- ⚠️ A acessibilidade ainda não passou por uma auditoria formal WCAG.
- ⚠️ Não existe tema claro.
- ⚠️ Não existe internacionalização; a interface está somente em português.

## 17. Aplicativo instalável

- ✅ Manifesto de aplicativo web.
- ✅ Ícone próprio.
- ✅ Pode ser instalado como PWA em navegadores compatíveis.
- ✅ Abre em modo semelhante a aplicativo.
- ✅ Service Worker registrado.
- ⚠️ O Service Worker atual não guarda páginas para uso offline.
- ⚠️ O site depende de internet para login, salas, chat e chamadas.
- ⚠️ Não existem notificações push.

## 18. Resumo da maturidade atual

O Mostra aí já possui um núcleo funcional considerável: contas, salas permanentes, convites, videochamada, compartilhamento de tela, áudio de aba, chat persistente, múltiplos chats, administração, perfis, fotos e interações sociais.

Os principais pontos que ainda fazem diferença entre o estado atual e um produto comercial mais maduro são:

1. Estabilidade e escalabilidade da arquitetura de chamada.
2. Recuperação automática quando o coordenador sai.
3. Paginação e ferramentas mais completas de chat.
4. Banimentos e registro de moderação.
5. Exclusão de conta, sala e saída permanente pela interface.
6. Notificações e mensagens não lidas.
7. Auditoria formal de segurança e acessibilidade.
8. Monitoramento de erros, métricas e disponibilidade.

## 19. Próximos itens sugeridos para uma auditoria formal

- [ ] Testar os fluxos com dono, administrador e membro em navegadores separados.
- [ ] Testar chamadas com 2, 4, 6 e 10 participantes.
- [ ] Testar redes móveis, NAT restrito e troca entre Wi-Fi e 4G/5G.
- [ ] Validar comportamento quando o coordenador da chamada sai.
- [ ] Testar todos os tipos de compartilhamento no Chrome, Edge, Firefox e Safari.
- [ ] Verificar compartilhamento de áudio em Windows, macOS, Android e iOS.
- [ ] Executar auditoria de RLS e funções `SECURITY DEFINER` no Supabase.
- [ ] Executar auditoria de acessibilidade WCAG 2.2 AA.
- [ ] Criar testes automatizados dos principais fluxos.
- [ ] Definir política de retenção e exclusão de dados.
- [ ] Implementar monitoramento de erros e disponibilidade.
- [ ] Revisar Termos de Uso e Política de Privacidade com orientação jurídica.
