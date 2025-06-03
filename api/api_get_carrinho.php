<?php
/**
 * @api {get} /api_get_carrinho.php Listar itens do carrinho do cliente
 * @apiName GetCarrinho
 * @apiGroup Carrinho
 *
 * @apiParam {Number} cliente_id ID do cliente para buscar o carrinho (obrigatório)
 *
 * @apiSuccess {Object[]} itens_carrinho Lista de itens no carrinho do cliente
 * @apiSuccess {Number} itens_carrinho.carrinho_id ID do item no carrinho
 * @apiSuccess {Number} itens_carrinho.preco Preço do item
 * @apiSuccess {String} itens_carrinho.nome_pizza Nome da pizza
 * @apiSuccess {String} itens_carrinho.tipo_pizza Tipo da pizza
 * @apiSuccess {Number} itens_carrinho.pizza_id ID da pizza
 * @apiSuccess {String} itens_carrinho.caminho_imagem Caminho da imagem da pizza
 *
 * @apiError {Boolean} error true
 * @apiError {String} message Mensagem de erro ou informação (ex: cliente_id inválido, nenhum item no carrinho)
 *
 * @apiMethod GET
 */

// Configurações para exibir todos os erros
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

// Configurações do banco de dados
$host = 'wesley.mysql.dbaas.com.br';
$dbname = 'wesley';
$username = 'wesley';
$password = 'tI7u96pYDAv3I#';

$conexao = mysqli_connect($host, $username, $password, $dbname);

// Verificar se a conexão foi bem-sucedida
if (!$conexao) {
    echo json_encode(array(
        'error' => true,
        'message' => 'Erro de conexão: ' . mysqli_connect_error()
    ));
    exit;
}

mysqli_set_charset($conexao, "utf8"); // Configurar o charset para UTF-8

// Verificar se o ID do cliente foi passado
if (isset($_GET['cliente_id']) && is_numeric($_GET['cliente_id'])) {
    $clienteId = $_GET['cliente_id'];

    // Query para buscar os itens do carrinho do cliente com JOIN na tabela de pizzas
    $query = "SELECT
                  c.id AS carrinho_id,
                  c.preco,
                  c.nome_pizza,
                  c.tipo_pizza,
                  c.pizza_id,
                  p.caminho AS caminho_imagem
              FROM
                  carrinho c
              JOIN
                  pizzas p
              ON
                  c.pizza_id = p.id
              WHERE
                  c.cliente_id = $clienteId";

    // Executar a query
    $resultado = mysqli_query($conexao, $query);

    if ($resultado && mysqli_num_rows($resultado) > 0) {
        // Inicializar um array para armazenar os resultados
        $itens_carrinho = array();

        // Buscar os resultados um por um e adicionar ao array
        while ($row = mysqli_fetch_assoc($resultado)) {
            $itens_carrinho[] = $row;
        }

        // Retornar os dados em formato JSON  - REMOVE THE SECOND PARAMETER
        echo json_encode($itens_carrinho);
    } else {
        // Caso não haja registros, retorna uma mensagem
        echo json_encode(array(
            'error' => false,
            'message' => 'Nenhum item encontrado no carrinho para este cliente.'
        ));
    }
} else {
    // Caso o ID do cliente não seja válido
    echo json_encode(array(
        'error' => true,
        'message' => 'ID do cliente inválido ou ausente.'
    ));
}

// Fechar a conexão com o banco de dados
mysqli_close($conexao);
?>