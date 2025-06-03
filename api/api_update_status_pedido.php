<?php
/**
 * @api {get} /api_update_status_pedido.php Atualizar status do pedido
 * @apiName AtualizarStatusPedido
 * @apiGroup Pedido
 *
 * @apiDescription Atualiza o status de um pedido específico. Somente usuários com tipo 'admin' ou 'operacao' têm permissão.
 *
 * @apiParam {Number} pedido_id ID do pedido a ser atualizado (obrigatório, via GET)
 * @apiParam {String="PENDENTE","PREPARAÇÃO","ENTREGUE","CANCELADO"} status Novo status do pedido (obrigatório, via GET)
 *
 * @apiSuccess {Boolean} success Indica se a atualização foi bem-sucedida
 * @apiSuccess {String} message Mensagem explicativa
 *
 * @apiSuccessExample {json} Sucesso
 *  {
 *    "success": true,
 *    "message": "Status atualizado com sucesso."
 *  }
 *
 * @apiError {Boolean} success false
 * @apiError {String} message Mensagem explicando o erro
 *
 * @apiErrorExample {json} Acesso negado
 *  {
 *    "success": false,
 *    "message": "Acesso negado."
 *  }
 *
 * @apiErrorExample {json} Parâmetros ausentes
 *  {
 *    "success": false,
 *    "message": "Parâmetros ausentes."
 *  }
 *
 * @apiErrorExample {json} Status inválido
 *  {
 *    "success": false,
 *    "message": "Status inválido."
 *  }
 *
 * @apiErrorExample {json} Nenhuma linha atualizada
 *  {
 *    "success": false,
 *    "message": "Nenhuma linha atualizada."
 *  }
 *
 * @apiErrorExample {json} Erro no banco de dados
 *  {
 *    "success": false,
 *    "message": "Erro no banco de dados: [mensagem do erro]"
 *  }
 */

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
