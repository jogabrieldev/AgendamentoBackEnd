## Projeto agendamento para baber

*** Back-end ***

*Estou usando o sequelize nos meus modelos para gerar a tabela no banco de dados postegres 

*Estou usando o drive do (PG) para conectar ao postgres pelo o sequelize

* Criei um arquivo também que faz a associação das tabelas , ou seja la ta o relacionamento das tabelas o nome dele e (associations.js)

* criei um arquivo também para inicializar os modelos e o arquivo e o (initModels.js) que esta nna pasta model

* No meu middleware eu gerei uma verificação de token para melhor segurança das minhas rotas sendo visto que posso acessar tais rotas com o token do login do usuario , no caso barbeiro

* no controller eu tenho controladores dos ( serviços , clientes , usuario , disponibilidade , e agendamento ) controllers para os modelos

