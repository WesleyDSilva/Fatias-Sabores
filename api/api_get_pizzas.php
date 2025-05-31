<?php
header('Content-Type: application/json');

$host = 'wesley.mysql.dbaas.com.br';
$dbname = 'wesley';
$username = 'wesley';
$password = 'tI7u96pYDAv3I#';

$conexao = mysqli_connect($host, $username, $password, $dbname);

if (!$conexao) {
    echo json_encode(['success' => false, 'message' => 'Erro de conexão: ' . mysqli_connect_error()]);
    exit;
}

mysqli_set_charset($conexao, "utf8");

// Verifica se foi passado ?categorias=4,6
if (isset($_GET['categorias'])) {
    $categorias = explode(',', $_GET['categorias']);
    $categorias = array_map('intval', $categorias); // Sanitiza os valores
    $placeholders = implode(',', array_fill(0, count($categorias), '?'));

    $query = "
        SELECT 
            p.produto_id, p.nome, p.ingredientes, p.detalhes, p.pequena, p.media, p.grande, 
            p.media_inteira, p.grande_inteira, p.caminho, p.categoria_id, c.categoria AS categoria
        FROM Produtos p
        INNER JOIN Categoria c ON p.categoria_id = c.categoria_id
        WHERE p.categoria_id IN ($placeholders)
    ";

    // Preparar e executar manualmente com bind dinâmico
    $stmt = $conexao->prepare($query);

    // Cria os tipos (ex: "ii" para 2 inteiros)
    $tipos = str_repeat('i', count($categorias));

    // Bind dinâmico
    $stmt->bind_param($tipos, ...$categorias);

} elseif (isset($_GET['categoria_id'])) {
    // Caso individual: ?categoria_id=4
    $categoria_id = intval($_GET['categoria_id']);
    
    $query = "
        SELECT 
            p.produto_id, p.nome, p.ingredientes, p.detalhes, p.pequena, p.media, p.grande, 
            p.media_inteira, p.grande_inteira, p.caminho, p.categoria_id, c.categoria AS categoria
        FROM Produtos p
        INNER JOIN Categoria c ON p.categoria_id = c.categoria_id
        WHERE p.categoria_id = ?
    ";

    $stmt = $conexao->prepare($query);
    $stmt->bind_param("i", $categoria_id);
} else {
    // Sem filtro (retorna todos)
    $query = "
        SELECT 
            p.produto_id, p.nome, p.ingredientes, p.detalhes, p.pequena, p.media, p.grande, 
            p.media_inteira, p.grande_inteira, p.caminho, p.categoria_id, c.categoria AS categoria
        FROM Produtos p
        INNER JOIN Categoria c ON p.categoria_id = c.categoria_id
    ";
    $stmt = $conexao->prepare($query);
}

$stmt->execute();
$resultado = $stmt->get_result();

$produtos = [];

while ($row = $resultado->fetch_assoc()) {
    $produtos[] = $row;
}

echo json_encode([
    'success' => true,
    'produtos' => $produtos,
    'message' => count($produtos) ? 'Produtos encontrados.' : 'Nenhum produto encontrado.'
]);

$stmt->close();
$conexao->close();
?>
