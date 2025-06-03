<?php
/**
 * @api {get} /api_get_pizzas.php Listar pizzas / produtos filtrados por categoria
 * @apiName GetPizzas
 * @apiGroup Produtos
 *
 * @apiParam {String} [categorias] Lista de IDs de categorias separados por vírgula (ex: 1,2,3) (opcional)
 * @apiParam {Number} [categoria_id] ID de uma única categoria para filtrar (opcional)
 *
 * @apiSuccess {Boolean} success Indica sucesso da operação
 * @apiSuccess {Object[]} produtos Lista de produtos (pizzas) encontrados
 * @apiSuccess {Number} produtos.produto_id ID do produto
 * @apiSuccess {String} produtos.nome Nome da pizza
 * @apiSuccess {String} produtos.ingredientes Ingredientes da pizza
 * @apiSuccess {String} produtos.detalhes Detalhes adicionais do produto
 * @apiSuccess {Number} produtos.pequena Preço tamanho pequena
 * @apiSuccess {Number} produtos.media Preço tamanho média
 * @apiSuccess {Number} produtos.grande Preço tamanho grande
 * @apiSuccess {Number} produtos.media_inteira Preço média inteira
 * @apiSuccess {Number} produtos.grande_inteira Preço grande inteira
 * @apiSuccess {String} produtos.caminho Caminho da imagem do produto
 * @apiSuccess {Number} produtos.categoria_id ID da categoria
 * @apiSuccess {String} produtos.categoria Nome da categoria
 * @apiSuccess {String} message Mensagem informativa (ex: 'Produtos encontrados.' ou 'Nenhum produto encontrado.')
 *
 * @apiMethod GET
 */

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
