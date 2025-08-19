## Projeto agendamento para baber

*** Back-end ***


**MODEl**

*Estou usando o sequelize nos meus modelos para gerar a tabela no banco de dados postegres 

*Estou usando o drive do (PG) para conectar ao postgres pelo o sequelize

* Criei um arquivo também que faz a associação das tabelas , ou seja la ta o relacionamento das tabelas o nome dele e (associations.js)

* criei um arquivo também para inicializar os modelos e o arquivo e o (initModels.js) que esta nna pasta model


**MIDDLEWARE**

* No meu middleware eu gerei uma verificação de token para melhor segurança das minhas rotas sendo visto que posso acessar tais rotas com o token do login do usuario , no caso barbeiro

**COTROLLER**

* no controller eu tenho controladores dos ( serviços , clientes , usuario , disponibilidade , e agendamento ) controllers para os models

* Serviços tenho o CRUD para obter, adicionar e modificar dados atraves de metodos e suas validações 

* Clientes tenho a Criação do cliente , processos de validação pelo o token  e metodos de acesso.

* Disponibilidades , faz cadastro de horarios disponiveis para obter controle daquele horario em especifico .

* Authenticate valida meu usuario que logou 

**SERVICE**
* Estou usando o serviço Bailleys para fazer o serviço de enviar o link para o cliente

* envio 2 tipos de links , onde um e para o cliente unico (o LINK direciona para uma tela de cadastro).

* O outro (LINK direciona para o tela de Authenticação) , para ai sim enviar para o agendamento


**UTILS**
* Meu arquivo (UtILS) esta armazenado a função que normaliza o numero de telefone tanto para cadastro quanto para comparações

