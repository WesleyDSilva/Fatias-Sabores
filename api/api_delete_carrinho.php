<?php
/**
 * @api {get} /api_delete_carrinho.php Excluir item do carrinho
 * @apiName DeletarItemCarrinho
 * @apiGroup Carrinho
 *
 * @apiQuery {Number} pizza_id ID da pizza a ser removida (obrigatório)
 * @apiQuery {Number} cliente_id ID do cliente dono do carrinho (obrigatório)
 *
 * @apiSuccess {Boolean} success Indica sucesso na exclusão
 * @apiSuccess {String} message Mensagem informando sucesso ou motivo da falha
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Mensagem explicando o erro (ex: parâmetros ausentes, IDs inválidos, item não encontrado, erro na consulta)
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

// Conectar ao banco de dados com MySQLi
$host = 'wesley.mysql.dbaas.com.br'; // Endereço do servidor do banco de dados
$dbname = 'wesley'; // Nome do banco de dados
$username = 'wesley'; // Nome de usuário do banco de dados
$password = 'tI7u96pYDAv3I#'; // Senha do banco de dados

$conn = new mysqli($host, $username, $password, $dbname);

// Verificar conexão
if ($conn->connect_error) {
    die(json_encode(array("success" => false, "message" => "Erro na conexão: " . $conn->connect_error)));
}

// Configurar o cabeçalho para JSON
header('Content-Type: application/json');

// Verificar se o método é GET
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!isset($_GET['pizza_id']) || !isset($_GET['cliente_id'])) {
        echo json_encode(array("success" => false, "message" => "Parâmetros ausentes."));
        exit;
    }

    $pizza_id = intval($_GET['pizza_id']);
    $cliente_id = intval($_GET['cliente_id']);

    if ($pizza_id <= 0 || $cliente_id <= 0) {
        echo json_encode(array("success" => false, "message" => "IDs inválidos."));
        exit;
    }

    // Preparar a consulta SQL com prepared statement
    $sql = "DELETE FROM carrinho WHERE pizza_id = ? AND cliente_id = ?";
    $stmt = $conn->prepare($sql);

    if ($stmt) {
        $stmt->bind_param("ii", $pizza_id, $cliente_id);
        $stmt->execute();

        if ($stmt->affected_rows > 0) {
            echo json_encode(array("success" => true, "message" => "Pedido excluído com sucesso."));
        } else {
            echo json_encode(array("success" => false, "message" => "Pedido não encontrado."));
        }

        $stmt->close();
    } else {
        echo json_encode(array("success" => false, "message" => "Erro ao preparar a consulta: " . $conn->error));
    }
} else {
    echo json_encode(array("success" => false, "message" => "Método não permitido. Use GET."));
}

// Fechar conexão
$conn->close();
?>