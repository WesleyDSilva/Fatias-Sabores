<?php
/**
 * @api {get} /api_get_user.php Buscar dados do usuário pelo ID
 * @apiName GetUser
 * @apiGroup Usuários
 *
 * @apiParam {Number} id ID do usuário a ser buscado (obrigatório)
 *
 * @apiSuccess {Number} id ID do usuário
 * @apiSuccess {String} nome Nome do usuário
 * @apiSuccess {String} logradouro Endereço (logradouro)
 * @apiSuccess {String} cidade Cidade
 * @apiSuccess {String} UF Estado
 * @apiSuccess {String} cep CEP
 * @apiSuccess {String} complemento Complemento do endereço
 * @apiSuccess {String} numero_casa Número da casa
 * @apiSuccess {String} email Email do usuário
 * @apiSuccess {String} telefone Telefone do usuário
 * @apiSuccess {String} cpf CPF do usuário
 *
 * @apiSuccessExample {json} Success-Response:
 *  {
 *    "id": 1,
 *    "nome": "João Silva",
 *    "logradouro": "Rua Exemplo",
 *    "cidade": "São Paulo",
 *    "UF": "SP",
 *    "cep": "12345-678",
 *    "complemento": "Apto 101",
 *    "numero_casa": "123",
 *    "email": "joao@email.com",
 *    "telefone": "11999999999",
 *    "cpf": "000.000.000-00"
 *  }
 *
 * @apiError {Boolean} error true
 * @apiError {String} message Mensagem informando erro ou motivo da falha
 *
 * @apiMethod GET
 */

// Configurações para exibir todos os erros
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

// Configurações do banco de dados
$host = 'wesley.mysql.dbaas.com.br'; // Endereço do servidor do banco de dados
$dbname = 'wesley'; // Nome do banco de dados
$username = 'wesley'; // Nome de usuário do banco de dados
$password = 'tI7u96pYDAv3I#'; // Senha do banco de dados

try {
    // Conectar ao banco de dados usando PDO
    $dsn = "mysql:host=$host;dbname=$dbname;charset=utf8";
    $pdo = new PDO($dsn, $username, $password);

    // Configurar o PDO para lançar exceções em caso de erro
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Verificar se o ID foi passado como parâmetro GET
    if (isset($_GET['id']) && is_numeric($_GET['id'])) {
        $userId = $_GET['id'];

        // Query para buscar os dados do usuário específico
        $query = "SELECT id, nome, logradouro, cidade, UF, cep, complemento, numero_casa, email, telefone,cpf 
                  FROM cliente 
                  WHERE id = :id";

        $stmt = $pdo->prepare($query);  // Prepara a query
        $stmt->bindParam(':id', $userId, PDO::PARAM_INT); // Vincula o parâmetro id
        $stmt->execute();  // Executa a consulta

        // Obter o resultado
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

        // Verificar se o usuário foi encontrado
        if ($usuario) {
            echo json_encode($usuario);  // Retorna os dados do usuário
        } else {
            echo json_encode(array(
                'error' => false,
                'message' => 'Usuário não encontrado.'
            ));
        }
    } else {
        echo json_encode(array(
            'error' => true,
            'message' => 'ID inválido ou ausente.'
        ));
    }
} catch (PDOException $e) {
    // Se houver um erro na conexão ou na execução da consulta, captura o erro
    echo json_encode(array(
        'error' => true,
        'message' => 'Erro no banco de dados: ' . $e->getMessage()
    ));
}
?>