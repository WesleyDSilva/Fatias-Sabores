<?php
/**
 * @api {get} /api_get_colaboradores.php Listar colaboradores (opcional filtro por nome)
 * @apiName GetColaboradores
 * @apiGroup Colaboradores
 *
 * @apiParam {String} [nome] Filtro opcional pelo nome do colaborador (busca parcial)
 *
 * @apiSuccess {Boolean} success Indica sucesso da operação
 * @apiSuccess {Object[]} colaboradores Lista de colaboradores
 * @apiSuccess {Number} colaboradores.funcionario_id ID do colaborador
 * @apiSuccess {String} colaboradores.nome Nome do colaborador
 * @apiSuccess {String} colaboradores.cargo Cargo do colaborador
 * @apiSuccess {String} colaboradores.placa Placa do veículo (se aplicável)
 * @apiSuccess {String} colaboradores.telefone Telefone do colaborador
 * @apiSuccess {String} colaboradores.perfil Perfil do colaborador
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Mensagem informando o erro de conexão ou outros problemas
 *
 * @apiMethod GET
 */

header('Content-Type: application/json');
require_once 'banco_connect.php';

$conn = new mysqli($host, $username, $password, $dbname);
if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Erro na conexão: " . $conn->connect_error]));
}

mysqli_set_charset($conn, "utf8");

$nome = isset($_GET['nome']) ? '%' . $conn->real_escape_string($_GET['nome']) . '%' : '%';

$query = $conn->prepare("SELECT funcionario_id, nome, cargo, placa, telefone, perfil FROM Funcionarios WHERE nome LIKE ?");
$query->bind_param("s", $nome);
$query->execute();
$result = $query->get_result();

$colaboradores = [];
while ($row = $result->fetch_assoc()) {
    $colaboradores[] = $row;
}

echo json_encode(["success" => true, "colaboradores" => $colaboradores]);

$query->close();
$conn->close();
