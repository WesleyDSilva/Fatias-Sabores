<?php
/**
 * @api {delete} /api_delete_colaboradores.php Excluir funcionário
 * @apiName DeletarFuncionario
 * @apiGroup Funcionarios
 *
 * @apiBody {Number} funcionario_id ID do funcionário a ser excluído (obrigatório)
 *
 * @apiSuccess {Boolean} success Indica sucesso na exclusão
 * @apiSuccess {String} message Mensagem informando sucesso ou motivo da falha
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Mensagem explicando o erro (ex: ID inválido, funcionário não encontrado, erro no banco)
 */

header('Content-Type: application/json');

// Importando conexão com o Banco de Dados
require_once 'banco_connect.php';

$conn = new mysqli($host, $username, $password, $dbname);

// Verificando conexão
if ($conn->connect_error) {
    die(json_encode(array("success" => false, "message" => "Erro na conexão: " . $conn->connect_error)));
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    // Obtendo os dados da requisição
    $data = json_decode(file_get_contents("php://input"), true);

    // Verificando se o ID do funcionário foi fornecido e é válido
    if (isset($data['funcionario_id']) && is_numeric($data['funcionario_id'])) {
        $funcionario_id = intval($data['funcionario_id']);

        // Preparando a consulta SQL
        $sql = "DELETE FROM Funcionarios WHERE funcionario_id = ?";
        $stmt = $conn->prepare($sql);

        // Verifica se a consulta foi preparada corretamente
        if ($stmt) {
            $stmt->bind_param("i", $funcionario_id);

            // Executando a consulta
            if ($stmt->execute()) {
                // Verifica se algum registro foi afetado
                if ($stmt->affected_rows > 0) {
                    echo json_encode(array("success" => true, "message" => "Funcionário excluído com sucesso."));
                } else {
                    echo json_encode(array("success" => false, "message" => "Nenhum funcionário encontrado com o ID fornecido."));
                }
            } else {
                echo json_encode(array("success" => false, "message" => "Erro de banco de dados: " . $stmt->error));
            }
            $stmt->close();
        } else {
            echo json_encode(array("success" => false, "message" => "Erro ao preparar a consulta: " . $conn->error));
        }
    } else {
        echo json_encode(array("success" => false, "message" => "ID inválido ou não fornecido."));
    }
} else {
    echo json_encode(array("success" => false, "message" => "Método não permitido. Use DELETE."));
}

// Fechando a conexão
$conn->close();
?>