SimpleCommerce — Documentação do Projeto

1. Introdução

O SimpleCommerce é uma plataforma de e-commerce desenvolvida com foco em performance, organização e experiência do usuário. O sistema foi criado para simular uma loja virtual moderna, permitindo que clientes naveguem pelos produtos, adicionem itens ao carrinho, realizem pagamentos e acompanhem seus pedidos.

Além da área do cliente, o projeto também possui um painel administrativo completo para gerenciamento de produtos, pedidos, estoque e clientes.

O sistema foi desenvolvido utilizando tecnologias modernas do ecossistema JavaScript, com backend em Node.js, banco de dados PostgreSQL e integração com APIs externas.

2. Objetivo do Projeto

O objetivo principal do projeto é fornecer uma solução completa de comércio eletrônico, permitindo:

Cadastro e autenticação de usuários
Gerenciamento de produtos
Controle de estoque
Sistema de carrinho
Finalização de pedidos
Pagamento via PIX
Cálculo de frete
Painel administrativo
Gerenciamento de pedidos

O projeto também teve como objetivo aplicar conceitos de:

Desenvolvimento Full Stack
APIs REST
Banco de dados relacional
Segurança com JWT
Organização de código
Integração com APIs externas
Arquitetura de software

3. Tecnologias Utilizadas

Frontend
HTML5
CSS3
JavaScript
Backend
Node.js
Express.js
Banco de Dados
PostgreSQL
Autenticação
JWT (JSON Web Token)
Integrações Externas
Mercado Pago (PIX)
Melhor Envio (Frete)
Ferramentas
Git
GitHub
VS Code
Postman
4. Arquitetura do Sistema

O sistema foi dividido em:

Frontend

Responsável pela interface visual da aplicação.

Funções principais:

Exibição dos produtos
Carrinho de compras
Login e cadastro
Área do cliente
Dashboard administrativo
Backend

Responsável pela lógica de negócio.

Funções principais:

Autenticação
CRUD de produtos
Processamento de pedidos
Controle de estoque
Integração com APIs
Segurança das rotas
Banco de Dados

Responsável pelo armazenamento das informações.

5. Funcionalidades do Sistema

Área do Cliente
Cadastro e Login
Cadastro de usuários
Login com JWT
Sessão autenticada
Produtos
Listagem de produtos
Destaques
Lançamentos
Página individual do produto
Produtos com desconto
Carrinho
Adicionar produto
Alterar quantidade
Remover produto
Atualização automática do total
Frete
Cálculo de frete
Escolha da transportadora
Prazo de entrega
Pagamento
Pagamento via PIX
Geração de QR Code
Status do pagamento
Meus Pedidos
Histórico de pedidos
Produtos comprados
Status do pedido
Valor total
Área Administrativa
Dashboard
Total de pedidos
Faturamento
Clientes cadastrados
Ticket médio
Produtos com estoque baixo
Produtos
Cadastro de produtos
Upload de imagens
Promoções
Controle de estoque
Edição de produtos
Pedidos
Listagem de pedidos
Alteração de status
Controle de pagamento
Clientes
Visualização de clientes cadastrados

6. Estrutura do Banco de Dados

Tabela: usuarios

Responsável pelos usuários do sistema.

Campos principais:

id
nome
email
senha
role
Tabela: produtos

Responsável pelos produtos da loja.

Campos principais:

id
nome
descricao
preco
preco_promocional
quantidade
destaque
lancamento
Tabela: imagens_produto

Responsável pelas imagens dos produtos.

Campos principais:

id
produto_id
url
principal
Tabela: carrinhos

Responsável pelos carrinhos dos usuários.

Campos principais:

id
usuario_id
Tabela: carrinho_itens

Responsável pelos itens do carrinho.

Campos principais:

id
carrinho_id
produto_id
quantidade
Tabela: pedidos

Responsável pelos pedidos realizados.

Campos principais:

id
usuario_id
total
frete
status
status_pagamento
forma_pagamento
criado_em
Tabela: pedido_itens

Responsável pelos produtos comprados em cada pedido.

Campos principais:

id
pedido_id
produto_id
quantidade
preco

7. Casos de Uso

Caso de Uso 1 — Cliente realiza login
Fluxo:
Usuário acessa a página de login
Digita email e senha
Sistema valida os dados
JWT é gerado
Usuário é autenticado
Caso de Uso 2 — Cliente adiciona produto ao carrinho
Fluxo:
Cliente acessa produto
Clica em “Adicionar ao Carrinho”
Produto é salvo no banco
Carrinho é atualizado
Caso de Uso 3 — Cliente finaliza pedido
Fluxo:
Cliente acessa carrinho
Calcula frete
Escolhe forma de pagamento
Pedido é criado
QR Code PIX é gerado
Pedido fica pendente até confirmação
Caso de Uso 4 — Administrador gerencia pedidos
Fluxo:
Admin acessa painel
Visualiza pedidos
Atualiza status
Sistema atualiza informações do pedido

8. Segurança

O sistema utiliza:

JWT para autenticação
Middleware de proteção de rotas
Controle de acesso por nível de usuário
Validação de permissões administrativas

9. Integrações Externas

Mercado Pago

Utilizado para:

Geração de pagamentos PIX
QR Code
Pagamentos digitais
Melhor Envio

Utilizado para:

Cálculo de frete
Simulação de entrega
Transportadoras

10. Melhorias Futuras

Melhorias planejadas para versões futuras:

Webhook automático do Mercado Pago
Sistema de cupons
Favoritos
Avaliação de produtos
Relatórios avançados
Dashboard mais moderno
Responsividade avançada
Notificações em tempo real
Upload múltiplo de imagens
Sistema de categorias avançado

11. Conclusão

O desenvolvimento do SimpleCommerce permitiu aplicar conhecimentos completos de desenvolvimento Full Stack, integração com APIs, segurança, banco de dados e arquitetura de software.

O projeto simula uma aplicação real de e-commerce, aproximando o desenvolvimento acadêmico das necessidades do mercado profissional.

Além do aprendizado técnico, o projeto também contribuiu para o desenvolvimento de habilidades de organização, resolução de problemas e estruturação de sistemas completos.