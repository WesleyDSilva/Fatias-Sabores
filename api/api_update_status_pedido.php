<?php
require_once 'banco_connect.php';
require_once '../Versão ADM/verifica_sessao.php';

header('Content-Type: application/json');

// Verifica permissão do usuário
if ($_SESSION['tipo_usuario'] !== 'admin' && $_SESSION['tipo_usuario'] !== 'operacao') {
  echo json_encode(['success' => false, 'message' => 'Acesso negado.']);
  exit;
}

// Obtém os dados via GET
if (!isset($_GET['pedido_id']) || !isset($_GET['status'])) {
  echo json_encode(['success' => false, 'message' => 'Parâmetros ausentes.']);
  exit;
}

$pedido_id = intval($_GET['pedido_id']);
$novo_status = strtoupper(trim($_GET['status']));

// Valida o status
$permitidos = ['PENDENTE', 'PREPARAÇÃO', 'ENTREGUE', 'CANCELADO'];
if (!in_array($novo_status, $permitidos)) {
  echo json_encode(['success' => false, 'message' => 'Status inválido.']);
  exit;
}

try {
  $stmt = $pdo->prepare("UPDATE Pedidos SET status = ? WHERE pedido_id = ?");
  $stmt->execute([$novo_status, $pedido_id]);

  if ($stmt->rowCount() > 0) {
    echo json_encode(['success' => true, 'message' => 'Status atualizado com sucesso.']);
  } else {
    echo json_encode(['success' => false, 'message' => 'Nenhuma linha atualizada.']);
  }
} catch (PDOException $e) {
  echo json_encode(['success' => false, 'message' => 'Erro no banco de dados: ' . $e->getMessage()]);
}
?>
